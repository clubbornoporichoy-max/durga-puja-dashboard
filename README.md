# Club Bornoporichoy - Durga Puja Dashboard

A comprehensive web application for managing Club Bornoporichoy's Durga Puja operations, including member management, financial tracking, invitation management, and village collections.

## Project Structure
club-bornoporichoy-dashboard/
├── index.html # Main HTML file
├── css/
│ ├── styles.css # Base styles and variables
│ └── components.css # Component-specific styles
├── js/
│ ├── app.js # Main application entry point
│ ├── firebase-config.js # Firebase configuration
│ ├── utils.js # Utility functions
│ ├── auth.js # Authentication system
│ ├── components.js # UI components
│ ├── modules.js # Main application modules
│ ├── financial-tracker.js # Financial management
│ ├── members.js # Member management
│ ├── invitations.js # Invitation management
│ ├── village-collections.js # Village collections
│ └── membership-fees.js # Membership fees tracking
└── README.md


## Features

### 🔐 Authentication & Security
- Role-based access control (Admin/Viewer)
- Firebase Authentication
- Secure data access patterns

### 📊 Dashboard & Analytics
- Real-time summary cards
- Financial overview
- Budget tracking with visual charts
- Recent activity feed

### 👥 Member Management
- Add, edit, delete members
- Member search and filtering
- Village-wise organization

### 💰 Financial Management
- Income and expense tracking
- Budget vs actual comparison
- Financial reports
- Transaction categorization

### 🎫 Invitation Management
- Track invitation distribution
- Bulk upload capabilities
- Status tracking (Sent/Pending)

### 🏘️ Village Collections
- Donation tracking per village
- Collector assignment
- Bulk data operations
- Village-wise breakdown

### 💳 Membership Fees
- Monthly fee tracking
- Payment status management
- Yearly summaries
- CSV export functionality

## Setup Instructions

### 1. Firebase Configuration
Update `js/firebase-config.js` with your Firebase project details:

```javascript
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    // ... other config
};
