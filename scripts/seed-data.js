/**
 * Firebase Seed Data Script
 *
 * Seeds Firestore with test testimonials, trips, and bookings.
 * Run with: node scripts/seed-data.js
 *
 * Prerequisites:
 * 1. Firebase project must be configured
 * 2. Service account key (firebase-admin-key.json) must be in project root
 * 3. Run: npm install firebase-admin (if not installed)
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin SDK
let serviceAccount;
try {
  const serviceAccountPath = join(__dirname, '..', 'firebase-admin-key.json');
  serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
} catch (error) {
  console.error('\n❌ ERROR: firebase-admin-key.json not found!');
  console.error('\nTo fix this:');
  console.error('1. Go to Firebase Console > Project Settings > Service Accounts');
  console.error('2. Click "Generate new private key"');
  console.error('3. Save as firebase-admin-key.json in project root');
  console.error('4. Add firebase-admin-key.json to .gitignore\n');
  process.exit(1);
}

initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

// Test data
const testTestimonials = [
  {
    customerName: 'Sarah Johnson',
    testimonialText: "Our guide was incredible! His knowledge of the Bow River and patience with our group made for an unforgettable day. We caught multiple rainbows and browns, and learned so much about fly fishing. Highly recommend Backcountry Drifters!",
    rating: 5,
    tripType: 'Full Day Float Trip',
    isApproved: true,
    createdAt: Timestamp.fromDate(new Date('2024-10-15T10:30:00Z')),
  },
  {
    customerName: 'Michael Chen',
    testimonialText: "The guide's expertise and knowledge of the Alberta foothills rivers made our trip unforgettable. We landed multiple 20+ inch trout! The scenery was breathtaking and the instruction was top-notch.",
    rating: 5,
    tripType: 'Full Day Wade Trip',
    isApproved: true,
    createdAt: Timestamp.fromDate(new Date('2024-08-15T10:00:00Z')),
  },
  {
    customerName: 'Emily Rodriguez',
    testimonialText: "First time fly fishing and our guide was incredibly patient. The scenery was breathtaking and we caught fish all day long. Can't wait to come back!",
    rating: 5,
    tripType: 'Half Day Wade Trip',
    isApproved: true,
    createdAt: Timestamp.fromDate(new Date('2024-09-02T14:30:00Z')),
  },
];

const testTrips = [
  {
    title: 'Half Day Wade Trip',
    description: "Perfect for beginners or those short on time. We'll wade prime trout water in the Alberta foothills with expert instruction and all equipment provided.",
    duration: '4 Hours',
    price: 35000, // $350.00
    maxGuests: 2,
    difficulty: 'Beginner',
    photoUrls: [],
    includedEquipment: ['Fly rods', 'Waders', 'Boots', 'Flies', 'Instruction'],
    location: 'Alberta Foothills',
    isActive: true,
    createdAt: Timestamp.fromDate(new Date('2024-01-10T08:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-10T08:00:00Z')),
  },
  {
    title: 'Full Day Float Trip',
    description: "Drift the most productive stretches of the Bow River in comfort. Includes gourmet lunch and beverages. Ideal for intermediate anglers.",
    duration: '8 Hours',
    price: 65000, // $650.00
    maxGuests: 4,
    difficulty: 'Intermediate',
    photoUrls: [],
    includedEquipment: ['Fly rods', 'Reels', 'Lunch', 'Beverages', 'Drift boat'],
    location: 'Bow River, Calgary Area',
    isActive: true,
    createdAt: Timestamp.fromDate(new Date('2024-01-15T08:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-15T08:00:00Z')),
  },
  {
    title: 'Highwood River Wade Experience',
    description: 'Explore the scenic Highwood River, known for its pristine waters and excellent dry fly fishing. Perfect for anglers seeking solitude and natural beauty.',
    duration: '8 Hours',
    price: 60000, // $600.00
    maxGuests: 3,
    difficulty: 'Intermediate',
    photoUrls: [],
    includedEquipment: ['Fly rods', 'Waders', 'Boots', 'Flies', 'Lunch', 'Instruction'],
    location: 'Highwood River, Alberta Foothills',
    isActive: true,
    createdAt: Timestamp.fromDate(new Date('2024-02-01T08:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2024-02-01T08:00:00Z')),
  },
];

// Seed functions
async function seedTestimonials() {
  console.log('\n📝 Seeding testimonials...');
  const batch = db.batch();

  for (const testimonial of testTestimonials) {
    const docRef = db.collection('testimonials').doc();
    batch.set(docRef, testimonial);
    console.log(`  ✓ Created testimonial: ${testimonial.customerName}`);
  }

  await batch.commit();
  console.log(`✅ Seeded ${testTestimonials.length} testimonials`);
}

async function seedTrips() {
  console.log('\n🎣 Seeding trips...');
  const batch = db.batch();

  for (const trip of testTrips) {
    const docRef = db.collection('trips').doc();
    batch.set(docRef, trip);
    console.log(`  ✓ Created trip: ${trip.title} ($${trip.price / 100})`);
  }

  await batch.commit();
  console.log(`✅ Seeded ${testTrips.length} trips`);
}

async function seedBookings(tripId) {
  console.log('\n📅 Seeding test booking...');

  const testBooking = {
    tripId: tripId,
    tripTitle: 'Half Day Wade Trip',
    guestName: 'John Smith',
    email: 'john@example.com',
    phone: '(403) 555-1234',
    preferredDate: '2024-12-15',
    guestCount: 2,
    specialRequests: 'First time fly fishing, would love some extra instruction',
    status: 'pending',
    submittedAt: Timestamp.fromDate(new Date('2024-11-20T14:30:00Z')),
  };

  const docRef = await db.collection('bookings').add(testBooking);
  console.log(`  ✓ Created booking: ${testBooking.guestName}`);
  console.log(`✅ Seeded 1 booking (ID: ${docRef.id})`);
}

// Main execution
async function main() {
  console.log('\n🚀 Starting Firebase seed script...');
  console.log(`📦 Project ID: ${serviceAccount.project_id}\n`);

  try {
    // Check if collections already have data
    const testimonialsSnapshot = await db.collection('testimonials').limit(1).get();
    const tripsSnapshot = await db.collection('trips').limit(1).get();

    if (!testimonialsSnapshot.empty || !tripsSnapshot.empty) {
      console.log('\n⚠️  WARNING: Database already contains data!');
      console.log('   This will ADD to existing data, not replace it.');
      console.log('\n   Press Ctrl+C to cancel or wait 5 seconds to continue...\n');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }

    // Seed data
    await seedTestimonials();
    await seedTrips();

    // Get a trip ID for the booking
    const tripsSnapshot2 = await db.collection('trips').limit(1).get();
    const tripId = tripsSnapshot2.docs[0]?.id || 'test-trip-1';
    await seedBookings(tripId);

    console.log('\n✅ All done! Database seeded successfully.\n');
    console.log('Next steps:');
    console.log('1. Visit your Firebase Console to verify data');
    console.log('2. Test the application with: npm run dev');
    console.log('3. Deploy rules with: npx firebase deploy --only firestore:rules,firestore:indexes,storage\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error seeding database:', error);
    process.exit(1);
  }
}

main();
