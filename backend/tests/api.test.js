import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../src/app.js';
import connectDB from '../src/config/db.js';
import User from '../src/models/User.js';
import Resource from '../src/models/Resource.js';
import Booking from '../src/models/Booking.js';
import ResourceRequest from '../src/models/ResourceRequest.js';
import Allocation from '../src/models/Allocation.js';

describe('Office Resource Management System - API & Business Logic Tests', () => {
  let adminToken = '';
  let employeeToken = '';
  let employeeId = '';
  let testBookableResource = null;
  let testPhysicalResource = null;

  before(async () => {
    await connectDB();

    // Clean up test collections
    await Booking.deleteMany({ title: /Test/ });
    await ResourceRequest.deleteMany({ reason: /Test/ });
    await Allocation.deleteMany({ notes: /Test/ });
    await Resource.deleteMany({ resourceId: { $in: ['TEST-RM-1', 'TEST-LP-1'] } });
    await User.deleteMany({ email: { $in: ['test_admin@test.com', 'test_emp@test.com'] } });

    // Create test admin
    const admin = await User.create({
      name: 'Test Admin',
      email: 'test_admin@test.com',
      password: 'Password@123',
      role: 'ADMIN'
    });

    // Create test employee
    const employee = await User.create({
      name: 'Test Employee',
      email: 'test_emp@test.com',
      password: 'Password@123',
      role: 'EMPLOYEE'
    });
    employeeId = employee._id;

    // Login Admin
    const adminLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test_admin@test.com', password: 'Password@123' });
    adminToken = adminLoginRes.body.token;

    // Login Employee
    const empLoginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test_emp@test.com', password: 'Password@123' });
    employeeToken = empLoginRes.body.token;

    // Create bookable resource (Conference Room)
    testBookableResource = await Resource.create({
      resourceId: 'TEST-RM-1',
      name: 'Test Meeting Room A',
      category: 'Meeting Room',
      location: 'Floor 1',
      status: 'AVAILABLE',
      isBookable: true,
      createdBy: admin._id
    });

    // Create physical non-bookable resource (Laptop)
    testPhysicalResource = await Resource.create({
      resourceId: 'TEST-LP-1',
      name: 'Test Dell Laptop',
      category: 'Laptop',
      location: 'IT Rack 1',
      status: 'AVAILABLE',
      isBookable: false,
      createdBy: admin._id
    });
  });

  after(async () => {
    // Cleanup created test records
    await Booking.deleteMany({ title: /Test/ });
    await ResourceRequest.deleteMany({ reason: /Test/ });
    await Allocation.deleteMany({ notes: /Test/ });
    await Resource.deleteMany({ resourceId: { $in: ['TEST-RM-1', 'TEST-LP-1'] } });
    await User.deleteMany({ email: { $in: ['test_admin@test.com', 'test_emp@test.com', 'signup_emp@test.com'] } });
    await mongoose.connection.close();
  });

  // 1. Authentication & RBAC
  test('POST /api/auth/signup must create an EMPLOYEE role even if ADMIN is requested in body', async () => {
    const res = await request(app)
      .post('/api/auth/signup')
      .send({
        name: 'Sneaky User',
        email: 'signup_emp@test.com',
        password: 'Password@123',
        role: 'ADMIN' // Trying to forge admin role
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.user.role, 'EMPLOYEE', 'Role must strictly be set to EMPLOYEE');
  });

  test('POST /api/resources as EMPLOYEE should be rejected with 403 Forbidden', async () => {
    const res = await request(app)
      .post('/api/resources')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        resourceId: 'ILLEGAL-1',
        name: 'Illegal Resource',
        category: 'Laptop',
        location: 'Nowhere'
      });

    assert.strictEqual(res.status, 403);
    assert.strictEqual(res.body.success, false);
  });

  // 2. Booking Overlap Prevention (Crucial Business Logic)
  test('POST /api/bookings creates an initial booking from 10:00 to 11:00', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        resourceId: testBookableResource._id,
        title: 'Test Sprint Review',
        date: '2026-11-15',
        startTime: '10:00',
        endTime: '11:00'
      });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.body.success, true);
    assert.strictEqual(res.body.data.booking.status, 'UPCOMING');
  });

  test('POST /api/bookings with overlapping time (10:30 to 11:30) must be rejected with 409 Conflict', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        resourceId: testBookableResource._id,
        title: 'Test Overlap Meeting',
        date: '2026-11-15',
        startTime: '10:30',
        endTime: '11:30'
      });

    assert.strictEqual(res.status, 409, 'Expected 409 Conflict for overlapping time window');
    assert.strictEqual(res.body.success, false);
  });

  test('POST /api/bookings with adjacent time (11:00 to 12:00) must be accepted', async () => {
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        resourceId: testBookableResource._id,
        title: 'Test Adjacent Meeting',
        date: '2026-11-15',
        startTime: '11:00',
        endTime: '12:00'
      });

    assert.strictEqual(res.status, 201, 'Adjacent booking must be accepted without conflict');
    assert.strictEqual(res.body.success, true);
  });

  // 3. Resource Request and Allocation Workflow
  test('Employee submits resource request and Admin approves -> Resource becomes ALLOCATED', async () => {
    // 1. Employee requests laptop
    const reqRes = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        resourceId: testPhysicalResource._id,
        reason: 'Test Needed for client presentation'
      });

    assert.strictEqual(reqRes.status, 201);
    const requestId = reqRes.body.data.request._id;

    // 2. Admin approves request
    const approveRes = await request(app)
      .patch(`/api/requests/${requestId}/approve`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        expectedReturnDate: '2026-12-01',
        notes: 'Test Allocated in good condition'
      });

    assert.strictEqual(approveRes.status, 200);
    assert.strictEqual(approveRes.body.success, true);

    // Verify resource is now ALLOCATED
    const resourceCheck = await Resource.findById(testPhysicalResource._id);
    assert.strictEqual(resourceCheck.status, 'ALLOCATED');
  });

  test('Duplicate allocation: Attempting to request or allocate an already ALLOCATED resource is rejected', async () => {
    const duplicateReq = await request(app)
      .post('/api/requests')
      .set('Authorization', `Bearer ${employeeToken}`)
      .send({
        resourceId: testPhysicalResource._id,
        reason: 'Test Trying duplicate request'
      });

    assert.strictEqual(duplicateReq.status, 400);
    assert.strictEqual(duplicateReq.body.success, false);
  });
});
