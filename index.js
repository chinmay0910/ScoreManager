const express = require('express');
const bodyParser = require('body-parser');
const connectToMongo = require('./db');
const cors = require('cors');
const scoreRoutes = require('./routes/score'); // Import score routes
const User = require('./models/User');

const app = express();
const port = 3000;

// Use middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
connectToMongo();

app.post('/api/user', async (req, res) => {
    // console.log('Received POST request at /api/user');
    const { email } = req.body;

    // Validate the request data
    if ( !email ) {
        return res.status(400).json({ message: 'email is required' });
    }

    try {
        // Check if the email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email is already taken' });
        }
        
        // Create a new user
        const newUser = new User({
            email,
            totalScore: 0, // Default score can be set to 0
        });

        // Save the user to the database
        await newUser.save();

        // Respond with success message
        res.status(201).json({
            message: 'User created successfully',
            user: {
                email: newUser.email,
                totalScore: newUser.totalScore,
            },
        });
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// Use score routes
app.use(scoreRoutes);

// Start the server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running at http://localhost:${port}`);
});