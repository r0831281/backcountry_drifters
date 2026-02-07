# Firebase Setup & Deployment Scripts

This directory contains scripts for Firebase setup, data seeding, and management.

## Prerequisites

### 1. Install firebase-admin

The seed script requires `firebase-admin` package:

```bash
npm install --save-dev firebase-admin
```

### 2. Get Service Account Key

To run the seed script, you need a Firebase service account key:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate new private key**
5. Save the file as `firebase-admin-key.json` in the project root (next to `package.json`)
6. **IMPORTANT**: Add `firebase-admin-key.json` to `.gitignore`

### 3. Configure Environment Variables

Create `.env.local` from `.env.local.example`:

```bash
cp .env.local.example .env.local
```

Then fill in your Firebase credentials from the Firebase Console:
- Go to **Project Settings** > **General**
- Scroll to "Your apps" section
- Copy the config values

## Firebase Initialization

The project is already initialized with Firebase. The configuration is in `firebase.json`.

If you need to reinitialize:

```bash
npx firebase init
```

Select:
- Firestore (rules + indexes)
- Storage (rules)
- DO NOT enable Hosting (using Cloudflare Pages)

## Deploy Security Rules & Indexes

### Deploy Everything

```bash
npx firebase deploy --only firestore:rules,firestore:indexes,storage
```

### Deploy Individually

```bash
# Deploy Firestore rules only
npx firebase deploy --only firestore:rules

# Deploy Firestore indexes only
npx firebase deploy --only firestore:indexes

# Deploy Storage rules only
npx firebase deploy --only storage
```

## Seed Test Data

### Run the Seed Script

```bash
node scripts/seed-data.js
```

This will create:
- 3 test testimonials (all approved)
- 3 test trips (all active)
- 1 test booking (pending status)

### What Gets Created

**Testimonials:**
- Sarah Johnson (5 stars, Full Day Float Trip)
- Michael Chen (5 stars, Full Day Wade Trip)
- Emily Rodriguez (5 stars, Half Day Wade Trip)

**Trips:**
- Half Day Wade Trip ($350, Beginner)
- Full Day Float Trip ($650, Intermediate)
- Highwood River Wade Experience ($600, Intermediate)

**Bookings:**
- John Smith (2 guests, pending)

### Safety Features

The script will:
- Check if data already exists
- Show a 5-second warning before adding to existing data
- Allow Ctrl+C to cancel if needed

## Verify Deployment

### Check Rules in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Firestore Database** > **Rules**
4. Verify the rules are deployed
5. Go to **Storage** > **Rules**
6. Verify storage rules are deployed

### Check Indexes

1. Go to **Firestore Database** > **Indexes**
2. Wait for indexes to build (can take a few minutes)
3. Status should show "Enabled"

### Check Seeded Data

1. Go to **Firestore Database** > **Data**
2. Verify collections exist:
   - `testimonials` (3 documents)
   - `trips` (3 documents)
   - `bookings` (1 document)

## Test the Application

### Local Development

```bash
npm run dev
```

Visit `http://localhost:5173` and verify:
- Home page shows testimonials
- Bookings page shows trips
- Data loads from Firebase (check browser console)

### Check Firebase Connection

Open browser console and look for:
- ✅ "Using Firebase data" (not test data)
- ❌ "Firebase not configured, using test data" (need to set up `.env.local`)

## Troubleshooting

### Error: "firebase-admin-key.json not found"

Make sure you:
1. Downloaded the service account key from Firebase Console
2. Saved it as `firebase-admin-key.json` in the project root
3. File is in the same directory as `package.json`

### Error: "Permission denied"

Your Firestore rules are working! This means:
- You're not authenticated when trying admin operations
- Rules are correctly blocking unauthorized access

To fix:
1. Authenticate in the app (login page)
2. Or use Firebase Admin SDK (seed script uses this)

### Error: "Failed to create trip/testimonial"

Check:
1. `.env.local` has correct Firebase credentials
2. Firebase rules are deployed
3. You're authenticated (for admin operations)

### Data Not Showing in App

Check:
1. `.env.local` exists and has correct values
2. Browser console for errors
3. Firebase Console > Firestore Database > Data
4. Network tab shows requests to Firebase

### Indexes Not Building

Composite indexes can take 5-15 minutes to build. If stuck:
1. Go to Firebase Console > Firestore > Indexes
2. Check status
3. If "Error", delete and redeploy: `npx firebase deploy --only firestore:indexes`

## Security Notes

### DO NOT COMMIT

Never commit these files:
- `firebase-admin-key.json` (service account key)
- `.env.local` (environment variables)

Both should be in `.gitignore`.

### Public vs Admin Access

**Public can:**
- Read approved testimonials (`isApproved: true`)
- Read active trips (`isActive: true`)
- Create bookings (contact form submissions)

**Admin only (requires authentication):**
- Create/update/delete testimonials
- Create/update/delete trips
- Read all bookings
- Update booking status
- Upload images to Storage

## Next Steps

After setting up Firebase:

1. Create an admin user in Firebase Console > Authentication
2. Add user document to Firestore `users` collection with `role: 'admin'`
3. Test admin dashboard at `/dashboard/admin`
4. Upload trip photos to Storage
5. Approve/reject testimonials

## Production Deployment

When deploying to production (Cloudflare Pages):

1. Add environment variables in Cloudflare Pages dashboard
2. Deploy rules before deploying the app
3. Test with production Firebase project
4. Monitor usage in Firebase Console

## Support

If you encounter issues:
1. Check Firebase Console > Usage for quota limits
2. Check browser console for detailed error messages
3. Review Firestore rules for permission issues
4. Verify environment variables are set correctly
