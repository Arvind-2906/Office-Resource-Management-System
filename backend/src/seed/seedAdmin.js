const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Resource = require('../models/Resource');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');

const seedData = async () => {
  try {
    await connectDB();

    logger.info('[Seed] Seeding initial database data...');

    // 1. Seed or find Admin
    let admin = await User.findOne({ email: 'admin@office.com' });
    if (!admin) {
      admin = await User.create({
        name: 'System Administrator',
        email: 'admin@office.com',
        password: 'Admin@123',
        role: 'ADMIN',
        department: 'IT Administration',
        phone: '+91 9876543210',
        isActive: true
      });
      logger.info('[Seed] Admin user created: admin@office.com / Admin@123');
    } else {
      logger.info('[Seed] Admin user already exists: admin@office.com');
    }

    // 2. Seed or find Sample Employee
    let employee = await User.findOne({ email: 'employee@office.com' });
    if (!employee) {
      employee = await User.create({
        name: 'Rahul Sharma',
        email: 'employee@office.com',
        password: 'Employee@123',
        role: 'EMPLOYEE',
        department: 'Software Engineering',
        phone: '+91 9123456780',
        isActive: true
      });
      logger.info('[Seed] Employee user created: employee@office.com / Employee@123');
    } else {
      logger.info('[Seed] Employee user already exists: employee@office.com');
    }

    // 3. Seed Sample Resources
    const sampleResources = [
      {
        resourceId: 'OR-101',
        name: 'Dell XPS 15 Laptop (Intel i9, 32GB)',
        category: 'Laptop',
        description: 'High-performance laptop for development and computational tasks',
        location: 'Building A - IT Storage (Rack 2)',
        status: 'AVAILABLE',
        isBookable: false,
        createdBy: admin._id
      },
      {
        resourceId: 'OR-102',
        name: 'Apple MacBook Pro 16" (M3 Max, 36GB)',
        category: 'Laptop',
        description: 'Engineering laptop for iOS & mobile systems',
        location: 'Building A - IT Storage (Rack 2)',
        status: 'AVAILABLE',
        isBookable: false,
        createdBy: admin._id
      },
      {
        resourceId: 'OR-201',
        name: 'Dell UltraSharp 27" 4K Monitor',
        category: 'Monitor',
        description: 'IPS USB-C Hub Monitor with height adjustable stand',
        location: 'Building B - Desk 402',
        status: 'AVAILABLE',
        isBookable: false,
        createdBy: admin._id
      },
      {
        resourceId: 'OR-301',
        name: 'Conference Room Alpha (Capacity: 12)',
        category: 'Meeting Room',
        description: 'Equipped with smart screen, video conference bar, and whiteboard',
        location: 'Building A - 3rd Floor, West Wing',
        status: 'AVAILABLE',
        isBookable: true,
        createdBy: admin._id
      },
      {
        resourceId: 'OR-302',
        name: 'Executive Board Room (Capacity: 25)',
        category: 'Meeting Room',
        description: 'Large board room for executive presentations & all-hands meetings',
        location: 'Building A - 4th Floor, East Wing',
        status: 'AVAILABLE',
        isBookable: true,
        createdBy: admin._id
      },
      {
        resourceId: 'OR-401',
        name: 'Epson 4K Laser Projector (Portable)',
        category: 'Projector',
        description: 'Ultra-bright 5000 lumen projector with HDMI/Wireless casting',
        location: 'AV Equipment Room 102',
        status: 'AVAILABLE',
        isBookable: true,
        createdBy: admin._id
      },
      {
        resourceId: 'OR-501',
        name: 'HP LaserJet Pro M404dn Network Printer',
        category: 'Printer',
        description: 'High speed duplex network printer with secure PIN release',
        location: 'Building B - Print Bay 2',
        status: 'AVAILABLE',
        isBookable: false,
        createdBy: admin._id
      }
    ];

    for (const resData of sampleResources) {
      const exists = await Resource.findOne({ resourceId: resData.resourceId });
      if (!exists) {
        await Resource.create(resData);
        logger.info(`[Seed] Seeded resource: ${resData.resourceId} (${resData.name})`);
      }
    }

    // 4. Initial Activity Log
    await ActivityLog.create({
      user: admin._id,
      action: 'SYSTEM_SEED',
      entity: 'System',
      description: 'System initialized with initial admin, employee, and standard office resources'
    });

    logger.info('[Seed] Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error(`[Seed] Seeding failed: ${error.message}`);
    process.exit(1);
  }
};

seedData();
