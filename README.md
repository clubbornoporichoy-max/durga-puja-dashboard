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



