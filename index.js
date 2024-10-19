const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb');
const path = require('path');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 4000; // Default port

// Middleware
app.use(express.static('public')); // Serve static files
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable CORS

// MongoDB connection URI
const uri = process.env.MONGODB_URI; // Use environment variable for MongoDB URI

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true }); // Added options for new connection settings
let db;

// Function to connect to MongoDB
async function connectDB() {
    try {
        await client.connect();
        db = client.db('insurance_db'); // Database name
        console.log('Connected to MongoDB');
    } catch (error) {
        console.error('Error connecting to MongoDB', error);
    }
}

// Route to serve the homepage
app.get('/home', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

// Route to serve the about page
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

// Route to serve the booking page
app.get('/book', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'book.html'));
});

// Route to serve the admin page
app.get('/admin', (req, res) => {
    console.log(`Admin page requested`);
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Route to handle booking appointments
app.post('/book', async (req, res) => {
    const { fullname, phonenumber, profession, insurancedetails, appointment_date, appointment_time } = req.body;
    console.log('Received appointment: ', { fullname, phonenumber, profession, insurancedetails, appointment_date, appointment_time });

    if (!db) {
        console.error("Database not initialized.");
        return res.status(500).send('Database connection is not established.');
    }

    try {
        const collection
