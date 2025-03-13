const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    // Check if email is already in use
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email is already in use');
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send('Password must be at least 8 characters long and include an uppercase letter, a number, and a special character');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send(user);
  } catch (error) {
    res.status(400).send(error);
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt with email:', email);
    const user = await User.findOne({ email });    
    if (!user) {
      console.log('User not found');
      return res.status(401).send('Invalid credentials');
    } else {
      console.log('User found:', user);
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('Invalid credentials');
      return res.status(401).send('Invalid credentials');
    } else {
      console.log('Password matches');
    }
    try {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
      console.log('Login successful, token generated');
      res.send({ token });
    } catch (jwtError) {
      console.error('Error generating token:', jwtError);
      res.status(500).send('Error generating token');
    }
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
