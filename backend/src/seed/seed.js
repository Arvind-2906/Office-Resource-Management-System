require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const Order = require('../models/Order');
const Payment = require('../models/Payment');

const categoriesData = [
  {
    name: 'Electronics',
    description: 'High-performance smart gadgets, screens, and appliances'
  },
  {
    name: 'Audio',
    description: 'Noise-cancelling headphones, high-fidelity earbuds, and soundbars'
  },
  {
    name: 'Wearables',
    description: 'Next-gen smartwatches, fitness trackers, and optical sensors'
  },
  {
    name: 'Computing',
    description: 'Ultra-thin laptops, desktop workstations, and accessories'
  },
  {
    name: 'Accessories',
    description: 'GaN fast chargers, ergonomic stands, and premium braided cables'
  },
  {
    name: 'Smart Home',
    description: 'Connected ambient lighting, smart security cams, and thermostats'
  }
];

const productsData = [
  {
    name: 'Apex Pro Wireless Studio Headphones',
    description: 'Active Noise Cancellation with 40mm beryllium drivers, spatial audio, 45-hour battery life, and plush memory foam cushions.',
    price: 349.99,
    category: 'Audio',
    brand: 'AuraSound',
    rating: 4.8,
    numReviews: 128,
    stock: 25,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'QuantumBook Ultra 16" Laptop',
    description: 'M3 Pro equivalent architecture, 32GB unified memory, 1TB NVMe Gen4 SSD, Liquid Retina XDR display with 120Hz ProMotion.',
    price: 1999.00,
    category: 'Computing',
    brand: 'TechNova',
    rating: 4.9,
    numReviews: 84,
    stock: 14,
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Vanguard Pulse 2 Smartwatch',
    description: 'Titanium chassis, sapphire glass, continuous ECG & SpO2 tracking, dual-frequency GPS, and 100m water resistance rating.',
    price: 399.00,
    category: 'Wearables',
    brand: 'Chronos',
    rating: 4.7,
    numReviews: 96,
    stock: 30,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'CinemaView OLED 4K Smart Monitor 32"',
    description: 'Self-lit OLED pixels, 0.1ms response time, 240Hz refresh rate, USB-C 90W power delivery, HDR True Black 400.',
    price: 899.99,
    category: 'Electronics',
    brand: 'VisionCraft',
    rating: 4.9,
    numReviews: 45,
    stock: 12,
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Sonosfera HiFi Smart Speaker',
    description: 'Immersive 360-degree acoustic projection, room-tuning true-play microphone, Wi-Fi 6 lossless streaming and voice control.',
    price: 249.50,
    category: 'Audio',
    brand: 'AuraSound',
    rating: 4.6,
    numReviews: 72,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'ErgoMech RGB Mechanical Keyboard',
    description: 'Gateron Hot-swap mechanical switches, gasket mount design, CNC aluminum case, double-shot PBT keycaps and wireless tri-mode.',
    price: 159.00,
    category: 'Computing',
    brand: 'TechNova',
    rating: 4.7,
    numReviews: 110,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Precision Glide Wireless Gaming Mouse',
    description: 'Ultralight 58g honeycomb shell, 26,000 DPI optical sensor, optical micro-switches, and zero-drag paracord cable.',
    price: 79.99,
    category: 'Computing',
    brand: 'TechNova',
    rating: 4.5,
    numReviews: 88,
    stock: 65,
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'VoltStream 140W GaN Fast Charger',
    description: '3x USB-C + 1x USB-A ports, fast charges laptops and smartphones simultaneously with advanced thermal protection.',
    price: 69.00,
    category: 'Accessories',
    brand: 'ChargeFast',
    rating: 4.9,
    numReviews: 215,
    stock: 120,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'NovaCam 4K HDR Outdoor Security Camera',
    description: 'Solar-powered battery backup, AI person & pet detection, 2-way talk audio, color night vision, and local encrypted SD storage.',
    price: 179.99,
    category: 'Smart Home',
    brand: 'GuardTech',
    rating: 4.6,
    numReviews: 53,
    stock: 22,
    image: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'AeroBuds True Wireless Earbuds',
    description: 'Adaptive active noise cancellation, transparency mode, wireless charging case, IPX7 water resistance, 32-hour playback.',
    price: 129.99,
    category: 'Audio',
    brand: 'AuraSound',
    rating: 4.5,
    numReviews: 160,
    stock: 80,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Lumina Smart Ambient Light Bar',
    description: 'Dynamic RGBIC color blending, screen video sync, music rhythm visualizer, compatible with HomeKit, Alexa, and Google.',
    price: 89.00,
    category: 'Smart Home',
    brand: 'GuardTech',
    rating: 4.4,
    numReviews: 67,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Titanium Minimalist Laptop Stand',
    description: 'Ergonomic dual-axis adjustable height & angle, non-slip silicone pads, airflow ventilation cutout for heat dissipation.',
    price: 49.99,
    category: 'Accessories',
    brand: 'TechNova',
    rating: 4.8,
    numReviews: 142,
    stock: 90,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'PulseBand Active Fitness Tracker',
    description: 'Slim lightweight fitness tracker with 24/7 heart rate monitor, sleep stage analysis, swim tracking, and 14-day battery.',
    price: 59.95,
    category: 'Wearables',
    brand: 'Chronos',
    rating: 4.3,
    numReviews: 89,
    stock: 55,
    image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'OmniHub 10-in-1 USB-C Docking Station',
    description: 'Dual 4K HDMI, Gigabit Ethernet, 100W Power Delivery pass-through, SD/TF card reader, 3x USB 3.2 10Gbps ports.',
    price: 85.00,
    category: 'Accessories',
    brand: 'ChargeFast',
    rating: 4.7,
    numReviews: 104,
    stock: 40,
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Horizon Mirrorless 4K Creator Camera',
    description: '24.2 MP full-frame sensor, 5-axis in-body image stabilization, uncropped 4K 60p 10-bit recording, flip-out touchscreen.',
    price: 1399.00,
    category: 'Electronics',
    brand: 'VisionCraft',
    rating: 4.9,
    numReviews: 38,
    stock: 8,
    image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'AuraGlow Smart LED Desk Lamp',
    description: 'Eye-caring zero blue light hazard, circadian daylight auto-adjustment, wireless Qi charging pad built into magnetic base.',
    price: 74.99,
    category: 'Smart Home',
    brand: 'GuardTech',
    rating: 4.6,
    numReviews: 61,
    stock: 45,
    image: 'https://images.unsplash.com/photo-1534972195531-a756b112697a?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'StreamCast Pro Condenser Microphone',
    description: 'Cardioid pickup pattern, internal pop filter, zero-latency headphone monitoring jack, tap-to-mute with LED indicator.',
    price: 119.00,
    category: 'Audio',
    brand: 'AuraSound',
    rating: 4.7,
    numReviews: 130,
    stock: 35,
    image: 'https://images.unsplash.com/photo-1590658006821-04f4008d5717?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'EchoFit Smart Body Scale',
    description: 'Full bio-impedance analysis: body fat %, muscle mass, visceral fat, bone density, auto-syncing with iOS & Android health apps.',
    price: 45.00,
    category: 'Wearables',
    brand: 'Chronos',
    rating: 4.5,
    numReviews: 76,
    stock: 60,
    image: 'https://images.unsplash.com/photo-1576243345690-4e4b79b63288?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'PowerVault 25,000mAh Laptop Power Bank',
    description: 'Airline approved, 100W USB-C output fast enough for MacBooks and iPads, digital percentage readout, aircraft aluminum casing.',
    price: 99.99,
    category: 'Accessories',
    brand: 'ChargeFast',
    rating: 4.8,
    numReviews: 180,
    stock: 50,
    image: 'https://images.unsplash.com/photo-1609592426867-0c7b396773be?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'CyberShield Smart Fingerprint Padlock',
    description: 'Weatherproof zinc alloy casing, capacitive biometric sensor with 0.2s unlock, emergency USB-C recharge, Bluetooth app key sharing.',
    price: 39.99,
    category: 'Smart Home',
    brand: 'GuardTech',
    rating: 4.2,
    numReviews: 44,
    stock: 75,
    image: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Velocity Wi-Fi 7 Mesh Router System',
    description: 'Tri-band BE9300 speeds up to 9.3 Gbps, covers up to 6,000 sq ft, 2.5G multi-gig WAN port, protects 200+ connected devices.',
    price: 329.99,
    category: 'Electronics',
    brand: 'VisionCraft',
    rating: 4.8,
    numReviews: 29,
    stock: 18,
    image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'
  }
];

const seedDatabase = async () => {
  try {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecommerce_db';
    console.log(`[Seed] Connecting to MongoDB at ${mongoURI}...`);
    await mongoose.connect(mongoURI);

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Product.deleteMany(),
      Cart.deleteMany(),
      Order.deleteMany(),
      Payment.deleteMany()
    ]);

    console.log('[Seed] Seeding categories...');
    await Category.insertMany(categoriesData);

    console.log('[Seed] Seeding products...');
    const insertedProducts = await Product.insertMany(productsData);

    console.log('[Seed] Seeding users with hashed passwords...');
    const salt = await bcrypt.genSalt(10);
    const adminPassword = await bcrypt.hash('admin123', salt);
    const customerPassword = await bcrypt.hash('password123', salt);

    const adminUser = await User.create({
      name: 'Nova Admin',
      email: 'admin@novastore.com',
      password: adminPassword,
      phone: '+1 (555) 019-2831',
      role: 'ADMIN',
      addresses: [
        {
          street: '100 Silicon Boulevard',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94107',
          country: 'USA',
          isDefault: true
        }
      ]
    });

    const customerUser = await User.create({
      name: 'John Doe',
      email: 'john@example.com',
      password: customerPassword,
      phone: '+1 (555) 234-5678',
      role: 'CUSTOMER',
      addresses: [
        {
          street: '742 Evergreen Terrace',
          city: 'Springfield',
          state: 'OR',
          postalCode: '97477',
          country: 'USA',
          isDefault: true
        }
      ]
    });

    const customerUser2 = await User.create({
      name: 'Sarah Connor',
      email: 'sarah@example.com',
      password: customerPassword,
      phone: '+1 (555) 345-6789',
      role: 'CUSTOMER',
      addresses: [
        {
          street: '1204 Cyberdyne Way',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA',
          isDefault: true
        }
      ]
    });

    console.log('[Seed] Seeding initial cart for demo customer...');
    await Cart.create({
      user: customerUser._id,
      items: [
        {
          product: insertedProducts[0]._id,
          quantity: 1,
          price: insertedProducts[0].price
        },
        {
          product: insertedProducts[7]._id,
          quantity: 2,
          price: insertedProducts[7].price
        }
      ],
      total: insertedProducts[0].price + insertedProducts[7].price * 2
    });

    console.log('\n=============================================');
    console.log(' SEEDING COMPLETED SUCCESSFULLY!');
    console.log('=============================================');
    console.log(`Categories Seeded: ${categoriesData.length}`);
    console.log(`Products Seeded:   ${productsData.length}`);
    console.log(`Users Seeded:      3 (1 Admin, 2 Customers)`);
    console.log('\nTest Credentials:');
    console.log('---------------------------------------------');
    console.log('ADMIN:');
    console.log('  Email:    admin@novastore.com');
    console.log('  Password: admin123');
    console.log('---------------------------------------------');
    console.log('CUSTOMER:');
    console.log('  Email:    john@example.com');
    console.log('  Password: password123');
    console.log('---------------------------------------------');
    console.log('CUSTOMER 2:');
    console.log('  Email:    sarah@example.com');
    console.log('  Password: password123');
    console.log('=============================================\n');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('[Seed Error] Failed to seed database:', error);
    process.exit(1);
  }
};

seedDatabase();
