/* ==================== FIREBASE CONFIGURATION ==================== */

const firebaseConfig = {
  apiKey: "AIzaSyD1dk_w0W0GPJh62TCyOhd-X0I75U_KN8w",
  authDomain: "club-bornoporichoy-dash.firebaseapp.com",
  projectId: "club-bornoporichoy-dash",
  storageBucket: "club-bornoporichoy-dash.firebasestorage.app",
  messagingSenderId: "906993758976",
  appId: "1:906993758976:web:8a34dc4ff6115c21c279e5",
  measurementId: "G-GT26E31FMP"
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
    "V7H9ujF2muVd0ajCPWX4p1JkshI2": "admin",
    "kDmjL2EuBvW7mBQkrxVyfcOw5B12": "viewer"
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
