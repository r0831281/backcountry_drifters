// Simple test to create a booking in Firestore
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

async function testBooking() {
  try {
    console.log('🔥 Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);
    console.log('✅ Firebase initialized');

    console.log('\n📅 Creating test booking...');
    const testBooking = {
      tripId: 'test-trip-1',
      tripTitle: 'Test Trip via Script',
      guestName: 'Script Test User',
      email: 'script@example.com',
      phone: '(403) 555-9999',
      preferredDate: '2024-12-25',
      guestCount: 2,
      specialRequests: 'Test booking created via Node.js script',
      status: 'pending',
      submittedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'bookings'), testBooking);
    console.log('✅ Booking created successfully!');
    console.log('   Document ID:', docRef.id);

    console.log('\n📋 Listing all bookings...');
    const snapshot = await getDocs(collection(db, 'bookings'));
    console.log(`Found ${snapshot.size} booking(s):`);

    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n  - ${data.guestName} (${data.email})`);
      console.log(`    Trip: ${data.tripTitle}`);
      console.log(`    Status: ${data.status}`);
    });

    console.log('\n✅ Test completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Code:', error.code);

    if (error.code === 'permission-denied') {
      console.error('\n⚠️  Permission denied. This could mean:');
      console.error('   1. Firestore rules not properly deployed');
      console.error('   2. Database not fully initialized');
      console.error('   3. Rules need time to propagate (wait 1-2 minutes)');
    }

    process.exit(1);
  }
}

testBooking();
