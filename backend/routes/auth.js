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
      return res.status(400).send({ error: 'Email is already in use' });
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).send({
        error: 'Invalid email format'
      });
    }

    // Validate required fields
    if (!email || !password) {
      return res.status(400).send({
        error: 'Email and password are required'
      });
    }

    // Validate password complexity
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).send({
        error: 'Password must be at least 8 characters long and include an uppercase letter, a number, and a special character'
      });
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
      console.log('User not found for email:', email);
      return res.status(401).send({ error: 'Invalid username or password' });
    }
    console.log('User found:', user.email);
    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      console.log('Password does not match');
      return res.status(401).send({ error: 'Invalid username or password' });
    }
    console.log('Password matches');
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
