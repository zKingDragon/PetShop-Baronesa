# PetShopBaronesa
# Pet Shop Baronesa - Firebase Integration

This project integrates Firebase Firestore into the Pet Shop Baronesa website, providing dynamic product management capabilities with a complete CRUD (Create, Read, Update, Delete) system.

## Features

### 🔥 Firebase Integration
- **Firestore Database**: Real-time product data storage and retrieval
- **Authentication**: Admin authentication for product management
- **Offline Support**: Cached data for offline browsing
- **Real-time Updates**: Automatic UI updates when data changes

### 📦 Product Management
- **Dynamic Product Loading**: Products are fetched from Firestore
- **Advanced Filtering**: Real-time filtering by category, price, and type
- **Search Functionality**: Full-text search across product data
- **Automatic Data Seeding**: Sample products are created if database is empty

### 🛠 Admin Panel
- **Product CRUD Operations**: Create, read, update, and delete products
- **Admin Authentication**: Secure access to administrative functions
- **Product Statistics**: Dashboard with product analytics
- **Bulk Operations**: Efficient batch product management

### 🎨 User Experience
- **Responsive Design**: Works on all device sizes
- **Loading States**: Visual feedback during data operations
- **Error Handling**: Graceful error handling with user feedback
- **Offline Fallback**: Cached data when offline

## Setup Instructions

### 1. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Enable Authentication (Email/Password)
4. Copy your Firebase configuration
5. Update `js/firebase-config.js` with your configuration:

\`\`\`javascript
const firebaseConfig = {
  apiKey: "your-api-key-here",
  authDomain: "your-project-id.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project-id.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
\`\`\`

### 2. Firestore Security Rules

Set up the following security rules in Firestore:

\`\`\`javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products collection
    match /products/{productId} {
      // Allow read access to all users
      allow read: if true;
      
      // Allow write access only to authenticated admin users
      allow write: if request.auth != null && 
                   request.auth.token.admin == true;
    }
    
    // Deny access to all other documents
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
\`\`\`

### 3. Admin User Setup

To create admin users, you'll need to set custom claims. Use the Firebase Admin SDK:

\`\`\`javascript
// Set admin custom claim
admin.auth().setCustomUserClaims(uid, { admin: true });
\`\`\`

Or use the Firebase CLI:

\`\`\`bash
firebase functions:shell
admin.auth().setCustomUserClaims('USER_UID', { admin: true })
\`\`\`

### 4. File Structure

\`\`\`
pet-shop-baronesa/
├── js/
│   ├── firebase-config.js          # Firebase configuration
│   ├── services/
│   │   ├── products-service.js     # Product CRUD operations
│   │   └── auth-service.js         # Authentication service
│   ├── catalog.js                  # Updated catalog with Firestore
│   ├── admin-panel.js              # Admin panel functionality
│   ├── main.js                     # Main application logic
│   ├── cart.js                     # Shopping cart functionality
│   └── auth.js                     # Authentication logic
├── catalogo.html                   # Updated catalog page
├── admin.html                      # Admin panel page
├── login.html                      # Login page
└── README.md                       # This file
\`\`\`

## Usage

### For Customers

1. **Browse Products**: Visit the catalog page to see all products
2. **Filter Products**: Use the sidebar filters to narrow down products
3.
