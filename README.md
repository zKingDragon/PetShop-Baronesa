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
3. **Search Products**: Use the search bar to find products by name or description
4. **View Product Details**: Click on a product to see its details
5. **Add to Cart**: Select a product and click "Add to Cart"
6. **Checkout**: Visit the cart page and proceed to checkout

### For Admins

1. **Login**: Access the admin panel by logging in
2. **Manage Products**: Add, edit, or remove products in the inventory
3. **View Statistics**: Check product statistics on the dashboard
4. **Bulk Operations**: Perform bulk updates or deletions of products
5. **Logout**: Securely logout from the admin panel

## Development

### Prerequisites

- Node.js (>=12.x)
- npm (>=6.x)
- Firebase CLI

### Installing Dependencies

Run the following command in the project root:

\`\`\`bash
npm install
\`\`\`

### Running the Project

To run the project locally:

1. Start the development server:

\`\`\`bash
npm run serve
\`\`\`

2. Open your browser and visit `http://localhost:3000`

### Building for Production

To build the project for production:

\`\`\`bash
npm run build
\`\`\`

## Troubleshooting

- **Firebase Errors**: Check your Firebase configuration and rules
- **Network Issues**: Ensure you have a stable internet connection
- **Permission Denied**: Verify that your admin user has the correct claims
- **Missing Files**: Ensure all files are uploaded and paths are correct

## Contributing

We welcome contributions to the Pet Shop Baronesa project!

### How to Contribute

1. Fork the repository
2. Create a new branch for your feature or bugfix
3. Make your changes and commit them
4. Push to your forked repository
5. Create a pull request describing your changes

### Code Standards

- Follow the existing code style and conventions
- Write clear, concise commit messages
- Ensure your code is well-documented

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Made with ❤️ by Daniel Pereira
