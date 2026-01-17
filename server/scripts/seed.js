/**
 * Seed script to create test users for demonstration
 * 
 * Usage:
 * 1. Make sure MongoDB is running
 * 2. Set up your .env file in the server directory
 * 3. Run: node scripts/seed.js
 */

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const PickupRequest = require('../models/PickupRequest');

const seedUsers = [
  {
    name: 'John Citizen',
    email: 'user@test.com',
    password: 'password123',
    role: 'user',
    address: '123 Main Street, City',
    phone: '1234567890',
  },
  {
    name: 'Agent Smith',
    email: 'agent@test.com',
    password: 'password123',
    role: 'agent',
    address: '456 Agent Lane',
    phone: '2345678901',
  },
  {
    name: 'Recycle Green',
    email: 'recycler@test.com',
    password: 'password123',
    role: 'recycler',
    address: '789 Recycle Road',
    phone: '3456789012',
  },
  {
    name: 'Admin User',
    email: 'admin@test.com',
    password: 'password123',
    role: 'admin',
    address: 'Admin Building',
    phone: '4567890123',
  },
];

const seedPickupRequests = [
  {
    userId: null, // Will be set to user's ID
    items: [{ description: 'Old Laptop', quantity: 1 }],
    pickupAddress: '123 Main Street, City',
    status: 'Requested',
  },
  {
    userId: null, // Will be set to user's ID
    items: [{ description: 'Mobile Phone', quantity: 2 }],
    pickupAddress: '123 Main Street, City',
    status: 'Collected',
  },
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✓ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await PickupRequest.deleteMany({});
    console.log('✓ Cleared existing data');

    // Hash passwords and create users
    console.log('Creating users...');
    const createdUsers = [];

    for (const userData of seedUsers) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      createdUsers.push(user);
      console.log(`✓ Created ${userData.role}: ${userData.email} (password: ${userData.password})`);
    }

    // Get user ID for pickup requests
    const userId = createdUsers.find((u) => u.role === 'user')._id;
    const agentId = createdUsers.find((u) => u.role === 'agent')._id;

    // Create sample pickup requests
    console.log('Creating pickup requests...');
    const requests = [];
    for (const reqData of seedPickupRequests) {
      const request = await PickupRequest.create({
        ...reqData,
        userId,
        assignedAgentId: reqData.status === 'Collected' ? agentId : null,
      });
      requests.push(request);
      console.log(`✓ Created pickup request: ${reqData.items[0].description} (${reqData.status})`);
    }

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📋 Test Accounts:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    seedUsers.forEach((user) => {
      console.log(`Role: ${user.role.padEnd(10)} | Email: ${user.email.padEnd(20)} | Password: ${user.password}`);
    });
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n💡 You can now login with any of these accounts!');
    console.log('\n📦 Sample Data:');
    console.log(`   - ${createdUsers.length} users created`);
    console.log(`   - ${requests.length} pickup requests created`);
    console.log('\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error.message);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('✓ Database connection closed');
  }
}

// Run seed
seedDatabase();
