🎉 Club Bornoporichoy — Durga Puja Dashboard

A comprehensive web application for managing Club Bornoporichoy's Durga Puja operations — including member management, financial tracking, invitation management, and village collections.

📚 Table of Contents

Features

Technical Stack

Project Structure

Quick Start

Prerequisites

Installation

User Roles

Configuration

Browser Support

Security Features

Data Management

Troubleshooting

Contributing

License

Support

Version History

🚀 Features
🔐 Authentication & Security

Role-based access control (Admin/Viewer)

Firebase Authentication

Secure Firestore access rules

📊 Dashboard & Analytics

Real-time metrics

Income/expense overview

Budget progress charts

Activity logs

👥 Member Management

Full CRUD

Advanced filtering

Village grouping

Remarks & mobile tracking

💰 Financial Management

Income & expenses

Budget vs Actual

Reports & exports

Multi-mode payments (Cash, UPI, Bank, Cheque)

🎫 Invitation Management

Track distributed/pending cards

Bulk upload

Village filtering

Status badges

🏘️ Village Collections

Village donation management

Collector performance

Bulk actions

Charts & summaries

💳 Membership Fees

Monthly fee tracking

Paid/Pending status

Yearly totals

CSV export

Visual fee grid

📅 Multi-Year Support

Year-wise isolation

Consolidated views

Easy year switcher

🛠 Technical Stack

Frontend: HTML5, CSS3, JavaScript (ES6+)

Backend: Firebase Firestore (NoSQL)

Authentication: Firebase Auth

Charts: Chart.js

Hosting: Any static hosting service

📁 Project Structure
club-bornoporichoy-dashboard/
├── index.html
├── css/
│   ├── styles.css
│   └── components.css
├── js/
│   ├── app.js
│   ├── firebase-config.js
│   ├── utils.js
│   ├── auth.js
│   ├── components.js
│   ├── modules.js
│   ├── financial-tracker.js
│   ├── members.js
│   ├── invitations.js
│   ├── village-collections.js
│   └── membership-fees.js
└── README.md

🚀 Quick Start
Prerequisites

Modern browser (Chrome, Firefox, Safari, Edge)

Firebase project with Firestore

Basic understanding of HTML/JS

Installation
1. Clone the project
git clone https://github.com/your-repository.git

2. Configure Firebase (js/firebase-config.js)
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id",
    measurementId: "G-XXXXXXXXXX"
};

3. Firestore Security Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}

4. Configure User Roles
const ROLES = {
    "your-admin-uid-1": "admin",
    "your-admin-uid-2": "admin",
    "regular-user-uid": "viewer"
};

5. Deploy to hosting

Firebase Hosting

Netlify

Vercel

GitHub Pages

Any static hosting service

👥 User Roles
Admin

Full access

Add/edit/delete all data

Manage transactions

Bulk operations

Export reports

Manage system settings

Viewer

Read-only access

View reports & dashboards

Search & filter

Cannot modify data

🔧 Configuration
Income & Expense Categories
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
const BUDGET_ITEMS = {
    'Pandal & Decorations': 70000,
    'Idol & Materials': 40000,
    'Priest & Rituals': 15000,
    // Add more here
};

Villages
['Madhabpur', 'Paldhui', 'Sabitrapur', 'Lalupool', 'Mahakal', 'Others']

📱 Browser Support
Browser	Supported
Chrome	✅ 80+
Firefox	✅ 75+
Safari	✅ 13+
Edge	✅ 80+
🔒 Security Features

Login required

Role-based permissions

Client & server validation

Secure Firebase rules

Input sanitization

📊 Data Management
Collections

invitations – Invitation distribution

members – Member directory

membership_fees_{year}

village_collections_{year}

income_{year}

expenses_{year}

Exports

JSON backup

CSV export (fees)

Financial reports

🐛 Troubleshooting
Login Issues

Confirm Firebase Auth enabled

Verify email/password

Check console errors

Data Not Loading

Check Firestore rules

Internet connectivity

Console errors

Permission Errors

Check role in ROLES

User logged in?

Firestore rules correct?

Charts Not Working

Chart.js available?

Valid data format?

Check console

🔧 Debug Tools
window.Dashboard.getAppState()
window.Dashboard.refreshData()

// Dev helpers
window.dev.clearCache()
window.dev.forceReload()
window.dev.showState()

🤝 Contributing

Fork the repo

Create a branch

git checkout -b feature/new-feature


Commit changes

Test thoroughly

Submit pull request

Code Style Guidelines

Meaningful variable names

JSDoc comments

Consistent error handling

Use Firebase best practices

Ensure mobile responsiveness

📄 License

This project is developed for internal use by
Club Bornoporichoy Durga Puja Committee.
All rights reserved.

🆘 Support

Before asking for support:

Re-read this documentation

Check browser console

Verify Firebase config

Check user permissions

🔄 Version History

v1.0 – Initial release

v1.1 – Modular architecture + enhancements

Future – SMS notifications, advanced reporting, mobile app
