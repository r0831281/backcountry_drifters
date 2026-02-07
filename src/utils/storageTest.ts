import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../lib/firebase';

/**
 * Test Firebase Storage connectivity and permissions
 * Run this from browser console: window.testStorage()
 */
export async function testStorage() {
  console.log('=== Firebase Storage Test ===');

  // Check if user is authenticated
  const user = auth.currentUser;
  console.log('1. Auth status:', user ? `Logged in as ${user.email}` : 'Not logged in');

  if (!user) {
    console.error('❌ Not authenticated! Please log in first.');
    return;
  }

  // Check storage instance
  console.log('2. Storage instance:', storage);
  console.log('3. Storage bucket:', storage.app.options.storageBucket);

  // Try to create a test file
  try {
    console.log('4. Creating test file...');
    const testData = new Blob(['Hello Firebase Storage!'], { type: 'text/plain' });
    const testRef = ref(storage, `test/${Date.now()}-test.txt`);

    console.log('5. Uploading test file...');
    await uploadBytes(testRef, testData);

    console.log('6. Getting download URL...');
    const url = await getDownloadURL(testRef);

    console.log('✅ SUCCESS! Storage is working.');
    console.log('Download URL:', url);
    return { success: true, url };
  } catch (error: any) {
    console.error('❌ FAILED!');
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    console.error('Full error:', error);
    return { success: false, error };
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).testStorage = testStorage;
}
