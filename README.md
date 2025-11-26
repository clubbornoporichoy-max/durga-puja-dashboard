# Club Bornoporichoy - Durga Puja Dashboard

A comprehensive web application for managing Club Bornoporichoy's Durga Puja operations, including member management, financial tracking, invitation management, and village collections.

## 🚀 Features

### 🔐 Authentication & Security
- **Role-based access control** (Admin/Viewer)
- **Firebase Authentication** integration
- Secure data access patterns and permissions

### 📊 Dashboard & Analytics
- **Real-time summary cards** with key metrics
- **Financial overview** with income/expense tracking
- **Budget tracking** with visual charts and progress indicators
- **Recent activity feed** for audit trail

### 👥 Member Management
- **Add, edit, delete members** with full CRUD operations
- **Advanced search and filtering** capabilities
- **Village-wise organization** and categorization
- **Mobile number and remarks** tracking

### 💰 Financial Management
- **Income and expense tracking** with categorization
- **Budget vs actual comparison** with visual indicators
- **Financial reports** generation and export
- **Transaction management** with date tracking
- **Payment mode tracking** (Cash, UPI, Bank Transfer, Cheque)

### 🎫 Invitation Management
- **Track invitation distribution** and status
- **Bulk upload capabilities** for mass operations
- **Status tracking** (Sent/Pending) with visual badges
- **Village-wise filtering** and organization

### 🏘️ Village Collections
- **Donation tracking** per village and collector
- **Collector assignment** and performance tracking
- **Bulk data operations** for efficient management
- **Village-wise breakdown** with total calculations
- **Monthly collection trends** with chart visualization

### 💳 Membership Fees
- **Monthly fee tracking** with payment status
- **Payment status management** (Paid/Pending)
- **Yearly summaries** with total calculations
- **CSV export functionality** for reporting
- **Visual payment tracker** with grid view

### 📅 Multi-Year Support
- **Year-specific data** management
- **All-years view** for consolidated reporting
- **Easy year switching** with global selector
- **Data isolation** between different years

## 🛠️ Technical Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Firebase Firestore (NoSQL Database)
- **Authentication**: Firebase Authentication
- **Charts**: Chart.js for data visualization
- **Hosting**: Compatible with any static hosting service

## 📁 Project Structure
club-bornoporichoy-dashboard/
├── index.html # Main HTML entry point
├── css/
│ ├── styles.css # Base styles and CSS variables
│ └── components.css # Component-specific styles
├── js/
│ ├── app.js # Main application entry point
│ ├── firebase-config.js # Firebase configuration and constants
│ ├── utils.js # Utility functions and helpers
│ ├── auth.js # Authentication system
│ ├── components.js # UI components and rendering
│ ├── modules.js # Main application modules
│ ├── financial-tracker.js # Financial management module
│ ├── members.js # Member management module
│ ├── invitations.js # Invitation management module
│ ├── village-collections.js # Village collections module
│ └── membership-fees.js # Membership fees module
└── README.md # Project documentation

text

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project with Firestore database
- Basic understanding of web technologies

### Installation

1. **Clone or download** the project files
2. **Set up Firebase project**:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore Database
   - Get your Firebase configuration

3. **Configure Firebase**:
   - Update `js/firebase-config.js` with your Firebase project details:
   ```javascript
   const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id",
       measurementId: "G-XXXXXXXXXX"
   };
Set up Firestore Security Rules:

javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to all documents to authenticated users
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
Configure User Roles:

Update the ROLES constant in js/firebase-config.js with your admin user IDs:

javascript
const ROLES = {
    "your-admin-uid-1": "admin",
    "your-admin-uid-2": "admin",
    "regular-user-uid": "viewer"
};
Deploy to your preferred hosting service:

Firebase Hosting

Netlify

Vercel

GitHub Pages

Any static file hosting service

👥 User Roles
Admin
✅ Full access to all features

✅ Add, edit, delete all records

✅ Manage financial transactions

✅ Perform bulk operations

✅ Export data and generate reports

✅ Configure system settings

Viewer
✅ Read-only access to all data

✅ View dashboards and reports

✅ Search and filter data

❌ Cannot modify any records

❌ Cannot perform administrative actions

🔧 Configuration
Financial Categories
Update the following arrays in js/firebase-config.js to match your needs:

javascript
const INCOME_CATEGORIES = [
    'Donations', 'Membership Fees', 'Sponsorships', 'Advertisement', 
    'Ticket Sales', 'Food Stalls', 'Cultural Events', 'Others'
];

const EXPENSE_CATEGORIES = [
    'Pandal & Decorations', 'Idol & Materials', 'Priest & Rituals',
    'Electricity & Sound', 'Cooking and Materials', 'Food & Prasad', 
    'Cultural Program', 'Printing & Publicity', 'Transportation', 
    'Miscellaneous', 'Puja Hat & Materials', 'Awards & others', 
    'Club Construction', 'Dhaki & Napit'
];
Budget Items
Configure your annual budget in js/firebase-config.js:

javascript
const BUDGET_ITEMS = {
    'Pandal & Decorations': 70000,
    'Idol & Materials': 40000,
    'Priest & Rituals': 15000,
    // ... add your budget items
};
Villages
Update village options in the respective components:

javascript
// Available in invitations and village collections
['Madhabpur', 'Paldhui', 'Sabitrapur', 'Lalupool', 'Mahakal', 'Others']
📱 Browser Support
✅ Chrome 80+

✅ Firefox 75+

✅ Safari 13+

✅ Edge 80+

🔒 Security Features
Authentication Required: All users must log in to access data

Role-based Permissions: Different access levels for admin and viewers

Data Validation: Client-side and server-side data validation

Secure Firebase Rules: Database rules prevent unauthorized access

Input Sanitization: Protection against XSS attacks

📊 Data Management
Collections Structure
invitations - Invitation card distribution records

members - Club member information

membership_fees_{year} - Year-specific fee payments

village_collections_{year} - Year-specific donation collections

income_{year} - Year-specific income transactions

expenses_{year} - Year-specific expense transactions

Data Export
JSON Export: Complete database backup

CSV Export: Membership fees data

Financial Reports: Text-based detailed reports

🐛 Troubleshooting
Common Issues
Login Fails

Check Firebase Authentication settings

Verify email/password combination

Ensure user exists in Firebase Auth

Data Not Loading

Check Firestore security rules

Verify internet connection

Check browser console for errors

Permissions Denied

Verify user role in ROLES configuration

Check if user is logged in

Review Firestore security rules

Charts Not Displaying

Check Chart.js CDN availability

Verify data format for charts

Check browser console for errors

Debug Mode
For development, open browser console and use:

javascript
// Check application state
window.Dashboard.getAppState()

// Force reload all data
window.Dashboard.refreshData()

// Development tools (localhost only)
window.dev.clearCache()
window.dev.forceReload()
window.dev.showState()
🤝 Contributing
Fork the repository

Create a feature branch: git checkout -b feature/new-feature

Make your changes following the code style

Test thoroughly across different browsers

Submit a pull request with clear description

Code Style Guidelines
Use meaningful variable names

Add JSDoc comments for functions

Follow consistent error handling patterns

Use Firebase best practices

Ensure mobile responsiveness

📄 License
This project is developed for internal use by Club Bornoporichoy. All rights reserved.

🆘 Support
For technical support or questions:

Check this documentation first

Review browser console for errors

Verify Firebase configuration

Ensure proper user permissions

🔄 Version History
v1.0 - Initial release with core functionality

v1.1 - Added modular architecture and enhanced features

Future - Planned features: SMS notifications, advanced reporting, mobile app
