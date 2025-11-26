/* ==================== FIREBASE CONFIGURATION ==================== */

const firebaseConfig = {
    apiKey: "AIzaSyCuVs6jx7HiNIx25lzLgoq1B6nQqaHLHm0",
    authDomain: "guestandcollection.firebaseapp.com",
    projectId: "guestandcollection",
    storageBucket: "guestandcollection.firebasestorage.app",
    messagingSenderId: "272278233160",
    appId: "1:272278233160:web:d6d1e6a7d58be260d9b87d",
    measurementId: "G-B5783XTFSP"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Firebase services
const auth = firebase.auth();
const db = firebase.firestore();

// Collections
const invitationCol = db.collection("invitations");
const membersCol = db.collection("members");

// Collection functions with year parameter
function membershipFeesCollectionFor(year) { 
    return db.collection(`membership_fees_${year}`); 
}

function villageCollectionsCollectionFor(year) { 
    return db.collection(`village_collections_${year}`); 
}

function incomeCollectionFor(year) { 
    return db.collection(`income_${year}`); 
}

function expenseCollectionFor(year) { 
    return db.collection(`expenses_${year}`); 
}

// Constants
const ROLES = {
    "fRpLuiBgU0ZE1AtVmkGaA1RhBJk2": "admin",
    "898Fi5sPKHY01GUgI4iu1xS4TBR2": "viewer"
};

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Financial Constants
const INCOME_CATEGORIES = [
    'Donations', 'Membership Fees', 'Sponsorships', 'Advertisement', 
    'Ticket Sales', 'Food Stalls', 'Cultural Events', 'Others'
];

const EXPENSE_CATEGORIES = [
    'Pandal & Decorations', 'Idol & Materials', 'Priest & Rituals',
    'Electricity & Sound', 'Cooking and Materials', 'Food & Prasad', 'Cultural Program',
    'Printing & Publicity', 'Transportation', 'Miscellaneous', 'Puja Hat & Materials', 
    'Awards & others', 'Club Construction', 'Dhaki & Napit'
];

const BUDGET_ITEMS = {
    'Pandal & Decorations': 70000,
    'Idol & Materials': 40000,
    'Priest & Rituals': 15000,
    'Electricity & Sound': 30000,
    'Cooking and Materials': 8000,
    'Food & Prasad': 40000,
    'Cultural Program': 15000,
    'Printing & Publicity': 20000,
    'Transportation': 7000,
    'Miscellaneous': 12000,
    'Puja Hat & Materials': 35000,
    'Awards & others': 10000,
    'Club Construction': 80000,
    'Dhaki & Napit': 12000
};
