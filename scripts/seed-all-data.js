// Seed testimonials and trips to Firestore
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB-2kEOxjE8ktM3LlxIikXXtH0L2impwqg",
  authDomain: "backcountry-drifters.firebaseapp.com",
  projectId: "backcountry-drifters",
  storageBucket: "backcountry-drifters.appspot.com",
  messagingSenderId: "538672257619",
  appId: "1:538672257619:web:b10ffa90b48365385704a6"
};

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
  {
    customerName: 'David Thompson',
    testimonialText: "Best fly fishing experience of my life! The guide's local knowledge of the Calgary area streams is unmatched. We had consistent action all day and his tips improved my casting significantly.",
    rating: 5,
    tripType: 'Full Day Wade Trip',
    isApproved: true,
    createdAt: Timestamp.fromDate(new Date('2024-07-20T09:00:00Z')),
  },
  {
    customerName: 'Jennifer Martinez',
    testimonialText: "Absolutely fantastic day on the Bow River! Backcountry Drifters provided top-notch equipment and our guide's enthusiasm was contagious. We caught so many fish and the float was incredibly scenic.",
    rating: 5,
    tripType: 'Full Day Float Trip',
    isApproved: true,
    createdAt: Timestamp.fromDate(new Date('2024-06-10T11:30:00Z')),
  },
  {
    customerName: 'Robert Williams',
    testimonialText: "A true professional operation. The guide's patience with beginners and deep knowledge of the area made our half-day trip perfect. Already planning our next adventure with Backcountry Drifters!",
    rating: 5,
    tripType: 'Half Day Wade Trip',
    isApproved: true,
    createdAt: Timestamp.fromDate(new Date('2024-11-05T13:00:00Z')),
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
    title: 'Full Day Wade Trip',
    description: "Spend a full day exploring the best wade fishing spots in the Alberta foothills. Perfect for anglers who want to cover more water and maximize their time on the river. Includes streamside lunch and all equipment.",
    duration: '8 Hours',
    price: 60000, // $600.00
    maxGuests: 2,
    difficulty: 'Intermediate',
    photoUrls: [],
    includedEquipment: ['Fly rods', 'Waders', 'Boots', 'Flies', 'Lunch', 'Instruction'],
    location: 'Alberta Foothills',
    isActive: true,
    createdAt: Timestamp.fromDate(new Date('2024-01-12T08:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-12T08:00:00Z')),
  },
  {
    title: 'Full Day Float Trip',
    description: "Drift the most productive stretches of the Bow River in comfort. Includes gourmet lunch and beverages. Ideal for intermediate anglers looking to cover prime water with consistent action.",
    duration: '8 Hours',
    price: 65000, // $650.00
    maxGuests: 2,
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
    description: 'Explore the scenic Highwood River, known for its pristine waters and excellent dry fly fishing. Perfect for anglers seeking solitude and natural beauty in the heart of the foothills.',
    duration: '8 Hours',
    price: 60000, // $600.00
    maxGuests: 2,
    difficulty: 'Intermediate',
    photoUrls: [],
    includedEquipment: ['Fly rods', 'Waders', 'Boots', 'Flies', 'Lunch', 'Instruction'],
    location: 'Highwood River, Alberta Foothills',
    isActive: true,
    createdAt: Timestamp.fromDate(new Date('2024-02-01T08:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2024-02-01T08:00:00Z')),
  },
  {
    title: 'Premium Float Trip - Bow River',
    description: 'Our premier experience on the world-famous Bow River. This luxury float trip includes premium equipment, gourmet catered lunch, beverages, and professional photography. Maximum 2 guests for personalized attention.',
    duration: '8 Hours',
    price: 85000, // $850.00
    maxGuests: 2,
    difficulty: 'All Levels',
    photoUrls: [],
    includedEquipment: ['Premium fly rods', 'Reels', 'Gourmet lunch', 'Beverages', 'Photography', 'Drift boat'],
    location: 'Bow River, Calgary Area',
    isActive: true,
    createdAt: Timestamp.fromDate(new Date('2024-01-20T08:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-20T08:00:00Z')),
  },
  {
    title: 'Advanced Techniques Workshop',
    description: 'A specialized full-day session focused on advanced fly fishing techniques including nymphing, dry fly presentations, and reading water. Includes personalized coaching and all equipment.',
    duration: '8 Hours',
    price: 70000, // $700.00
    maxGuests: 2,
    difficulty: 'Advanced',
    photoUrls: [],
    includedEquipment: ['Fly rods', 'Waders', 'Specialized flies', 'Lunch', 'One-on-one coaching'],
    location: 'Various Alberta Foothills Locations',
    isActive: true,
    createdAt: Timestamp.fromDate(new Date('2024-02-10T08:00:00Z')),
    updatedAt: Timestamp.fromDate(new Date('2024-02-10T08:00:00Z')),
  },
];

async function seedData() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized\n');

    // Check existing data
    console.log('📊 Checking existing data...');
    const testimonialsSnapshot = await getDocs(collection(db, 'testimonials'));
    const tripsSnapshot = await getDocs(collection(db, 'trips'));

    console.log(`Current testimonials: ${testimonialsSnapshot.size}`);
    console.log(`Current trips: ${tripsSnapshot.size}\n`);

    if (testimonialsSnapshot.size > 0 || tripsSnapshot.size > 0) {
      console.log('⚠️  Database already contains data. This will ADD new data.');
      console.log('Press Ctrl+C to cancel or wait 3 seconds...\n');
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    // Seed testimonials
    console.log('📝 Seeding testimonials...');
    for (const testimonial of testTestimonials) {
      const docRef = await addDoc(collection(db, 'testimonials'), testimonial);
      console.log(`  ✅ Created: ${testimonial.customerName} (${docRef.id})`);
    }
    console.log(`✅ Seeded ${testTestimonials.length} testimonials\n`);

    // Seed trips
    console.log('🎣 Seeding trips...');
    for (const trip of testTrips) {
      const docRef = await addDoc(collection(db, 'trips'), trip);
      console.log(`  ✅ Created: ${trip.title} - $${trip.price / 100} (${docRef.id})`);
    }
    console.log(`✅ Seeded ${testTrips.length} trips\n`);

    // Summary
    const finalTestimonialsSnapshot = await getDocs(collection(db, 'testimonials'));
    const finalTripsSnapshot = await getDocs(collection(db, 'trips'));
    const finalBookingsSnapshot = await getDocs(collection(db, 'bookings'));

    console.log('📊 Database Summary:');
    console.log(`  - Testimonials: ${finalTestimonialsSnapshot.size}`);
    console.log(`  - Trips: ${finalTripsSnapshot.size}`);
    console.log(`  - Bookings: ${finalBookingsSnapshot.size}`);

    console.log('\n✅ All done! Data seeded successfully.');
    console.log('\nNext steps:');
    console.log('1. Refresh your app to see the new data');
    console.log('2. Login to admin dashboard to manage content');
    console.log('3. Check Firebase Console: https://console.firebase.google.com/project/backcountry-drifters/firestore\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Code:', error.code);

    if (error.code === 'permission-denied') {
      console.error('\n⚠️  Permission denied. Make sure:');
      console.error('   1. Firestore rules are deployed');
      console.error('   2. You are authenticated (if required)');
    }

    process.exit(1);
  }
}

seedData();
