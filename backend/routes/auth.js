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
      console.log('User not found');
      return res.status(401).send('Invalid username or password');
    } else {
      console.log('User found:', user);
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      console.log('Invalid credentials');
      return res.status(401).send('Invalid username or password');
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

const crypto = require('crypto');
const nodemailer = require('nodemailer');

// Password reset request
router.post('/reset-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send('User not found');
    }

    const token = crypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      to: user.email,
      from: process.env.EMAIL_USER,
      subject: 'Password Reset',
      text: `Please click the following link to reset your password: http://localhost:3000/reset/${token}`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        return res.status(500).send('Error sending email');
      }
      res.send('Password reset email sent');
    });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Confirm password reset
router.post('/reset-password/confirm', async (req, res) => {
  try {
    const { token, password } = req.body;
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).send('Invalid or expired token');
    }

    user.password = await bcrypt.hash(password, 10);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send('Password reset successful');
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
