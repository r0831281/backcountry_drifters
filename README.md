# Backcountry Drifters Fly Fishing

A modern, full-featured booking and content management platform for guided fly fishing adventures in Alberta's pristine backcountry waters.

## Overview

Backcountry Drifters Fly Fishing provides an exceptional online experience for both guests and guides. The platform combines stunning visual design with powerful booking capabilities, real-time availability management, and comprehensive trip information—all optimized for performance and accessibility.

## Features

### For Guests
- **Trip Discovery** - Browse curated fly fishing trips with detailed descriptions, difficulty ratings, and beautiful photography
- **Smart Filtering** - Search and filter trips by difficulty level, price range, duration, and location
- **Seamless Booking** - Request bookings with integrated tracking and instant confirmation notifications
- **Responsive Design** - Optimized experience across desktop, tablet, and mobile devices
- **Testimonials** - Read authentic reviews from fellow anglers

### For Guides & Administrators
- **Complete CMS** - Manage trips, bookings, and testimonials from an intuitive admin dashboard
- **Real-time Updates** - Instant synchronization with Firebase Firestore
- **Booking Management** - Track, confirm, and manage guest bookings with status workflows
- **Trip Management** - Create and edit trip offerings with rich media support
- **Analytics & Tracking** - Monitor user behavior and booking patterns
- **Role-Based Access** - Secure authentication with admin-only permissions

## Technology Stack

### Frontend
- **React 19** - Modern component architecture with hooks
- **TypeScript** - Type-safe development for reliability
- **Vite 7** - Lightning-fast build tool and dev server
- **Tailwind CSS v4** - Utility-first styling with custom theme
- **React Router** - Client-side routing

### Backend & Infrastructure
- **Firebase Authentication** - Secure user authentication with Google OAuth
- **Cloud Firestore** - Real-time NoSQL database
- **Firebase Analytics** - User tracking and engagement metrics
- **Firebase Hosting** - Fast, secure CDN-powered hosting

### Security & Validation
- **DOMPurify** - XSS prevention and HTML sanitization
- **Custom Validation** - Comprehensive input validation layer
- **Firestore Security Rules** - Server-side data validation and authorization
- **Rate Limiting** - Login attempt tracking with account lockout

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- Firebase CLI (`npm install -g firebase-tools`)
- Firebase project with Firestore, Authentication, and Analytics enabled

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backcountry-drifters
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase**

   Create a `.env.local` file in the root directory:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

### Firebase Deployment

```bash
# Login to Firebase
firebase login

# Deploy to Firebase Hosting
firebase deploy
```

## Project Structure

```
backcountry-drifters/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── admin/       # Admin dashboard components
│   │   ├── bookings/    # Booking-related components
│   │   ├── filters/     # Filter UI components
│   │   ├── layout/      # Layout components (Header, Footer)
│   │   └── ui/          # Base UI components (Button, Modal, etc.)
│   ├── contexts/        # React contexts (Auth, etc.)
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility libraries
│   │   ├── analytics.ts # Firebase Analytics integration
│   │   ├── firebase.ts  # Firebase configuration
│   │   ├── sanitization.ts # XSS prevention
│   │   └── validation.ts   # Input validation
│   ├── pages/           # Page components
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── firestore.rules      # Firestore security rules
├── firestore.indexes.json # Firestore indexes
└── firebase.json        # Firebase configuration
```

## Key Features in Detail

### Advanced Filtering System
- Client-side filtering with memoization for performance
- URL query parameter persistence for shareable filtered views
- Debounced search (300ms) for optimal performance
- Dynamic filter options with result counts
- Mobile-responsive filter drawer

### Security Architecture
Three-layer defense strategy:
1. **Client Validation** - Immediate user feedback
2. **Client Sanitization** - DOMPurify strips dangerous content
3. **Server Validation** - Firestore rules enforce all constraints

### Booking Workflow
- Guest submits booking request with tracking data
- Admin receives notification and reviews booking
- Status management: Pending → Confirmed/Cancelled
- Email notifications (future enhancement)
- Comprehensive tracking: IP, location, device fingerprinting

### Admin Dashboard
- Tab-based interface for Testimonials, Trips, and Bookings
- Search and sort functionality on all data tables
- Inline editing with modal forms
- Real-time data synchronization
- Pagination for large datasets

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari iOS (last 2 versions)
- Chrome Android (last 2 versions)

## Accessibility

- WCAG AA compliant
- Full keyboard navigation support
- Screen reader optimized
- Focus management in modals
- Semantic HTML structure
- ARIA labels and roles

## Performance

- Lighthouse score: 90+ across all metrics
- Optimized bundle size with code splitting
- Image optimization and lazy loading
- Debounced search and filter operations
- Memoized computed values

## License

Copyright © 2025 Backcountry Drifters Fly Fishing. All rights reserved.

## Contact

- **Website**: [backcountrydrifters.com](https://backcountrydrifters.com)
- **Email**: info@backcountrydrifters.com
- **Admin**: admin@backcountrydrifters.com

---

Built with ❤️ for Alberta's fly fishing community
