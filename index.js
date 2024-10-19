const express = require('express');
const bodyParser = require('body-parser');
const { MongoClient } = require('mongodb'); // Use MongoDB client
const path = require('path');
const cors = require('cors');
require('dotenv').config(); // Load environment variables

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(express.static('public')); // Serve static files
app.use(express.json()); // Parse JSON bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cors()); // Enable CORS

// MongoDB connection URI
const uri = process.env.MONGODB_URI; // Use environment variable for MongoDB URI

const client = new MongoClient(uri);
let db;

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

    try {
        const collection = db.collection('appointments');
        const result = await collection.insertOne({
            name: fullname,
            phone: phonenumber,
            profession,
            insurance_details: insurancedetails,
            appointment_date,
            appointment_time,
        });
        console.log(`Inserted appointment for ${fullname}`);
        res.send(`Appointment booked for ${fullname} on ${appointment_date}`);
    } catch (err) {
        console.error(`Error inserting data:`, err);
        return res.status(500).send(`Error saving appointment.`);
    }
});

// Route to view appointments
app.get('/admin/appointments', async (req, res) => {
    console.log('Fetching appointments');

    try {
        const collection = db.collection('appointments');
        const results = await collection.find().toArray();
        
        if (results.length === 0) {
            res.send('<h1>No appointments found.</h1>');
            return;
        }
        
        let html = '<h1>Appointments</h1><table border="1"><tr><th>ID</th><th>Name</th><th>Phone</th><th>Profession</th><th>Insurance Details</th><th>Date</th><th>Time</th></tr>';
        results.forEach(row => {
            html += `<tr>
                <td>${row._id}</td>
                <td>${row.name}</td>
                <td>${row.phone}</td>
                <td>${row.profession}</td>
                <td>${row.insurance_details}</td>
                <td>${row.appointment_date}</td>
                <td>${row.appointment_time}</td>
            </tr>`;
        });
        html += '</table>';
        res.send(html);
    } catch (err) {
        console.error(`Error fetching appointments:`, err);
        return res.status(500).send(`Error retrieving appointments.`);
    }
});

// Start the server and connect to MongoDB
app.listen(port, async () => {
    await connectDB();
    console.log(`Server is running on http://localhost:${port}`);
});