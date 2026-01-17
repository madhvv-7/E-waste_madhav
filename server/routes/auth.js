const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

/**
 * Validation helper functions
 */

// Validate email format: must contain @ and proper domain
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Email must be in valid format (e.g., user@example.com)' };
  }
  
  // Check for valid domain (at least one dot after @)
  const parts = email.split('@');
  if (parts.length !== 2 || !parts[1].includes('.')) {
    return { valid: false, message: 'Email must contain a valid domain (e.g., gmail.com, mail.com)' };
  }
  
  // Ensure domain has at least one dot (e.g., gmail.com)
  const domainParts = parts[1].split('.');
  if (domainParts.length < 2 || domainParts[domainParts.length - 1].length < 2) {
    return { valid: false, message: 'Email domain must be valid (e.g., gmail.com, mail.com)' };
  }
  
  return { valid: true };
};

// Validate phone: must be exactly 10 digits, only numbers
const validatePhone = (phone) => {
  if (!phone || phone.trim().length === 0) {
    return { valid: true }; // Phone is optional
  }
  
  // Remove any whitespace
  const cleanPhone = phone.replace(/\s/g, '');
  
  // Check if all characters are digits
  if (!/^\d+$/.test(cleanPhone)) {
    return { valid: false, message: 'Phone number must contain only digits' };
  }
  
  // Check if exactly 10 digits
  if (cleanPhone.length !== 10) {
    return { valid: false, message: 'Phone number must be exactly 10 digits' };
  }
  
  return { valid: true };
};

// Validate password: minimum 8 characters
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return { valid: false, message: 'Password must be at least 8 characters long' };
  }
  return { valid: true };
};

// Sanitize input: trim and remove extra spaces
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input.trim().replace(/\s+/g, ' ');
};

/**
 * Register endpoint
 * 
 * Approval Logic:
 * - 'user' and 'admin' roles: Automatically set to 'active' status (immediate activation)
 * - 'agent' and 'recycler' roles: Set to 'pending' status, requires admin approval
 * - Pending accounts cannot login until approved by admin
 */
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, address, phone } = req.body;

    // Backend validation: Sanitize all string inputs
    const sanitizedName = sanitizeInput(name || '');
    const sanitizedEmail = (email || '').toLowerCase().trim();
    const sanitizedAddress = sanitizeInput(address || '');
    const sanitizedPhone = phone ? phone.trim() : '';

    // Validate required fields
    if (!sanitizedName || sanitizedName.length === 0) {
      return res.status(400).json({ message: 'Name is required' });
    }

    if (!sanitizedEmail || sanitizedEmail.length === 0) {
      return res.status(400).json({ message: 'Email is required' });
    }

    if (!password) {
      return res.status(400).json({ message: 'Password is required' });
    }

    // Validate email format
    const emailValidation = validateEmail(sanitizedEmail);
    if (!emailValidation.valid) {
      return res.status(400).json({ message: emailValidation.message });
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ message: passwordValidation.message });
    }

    // Validate password confirmation
    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Password and confirm password do not match' });
    }

    // Validate phone (if provided)
    if (sanitizedPhone) {
      const phoneValidation = validatePhone(sanitizedPhone);
      if (!phoneValidation.valid) {
        return res.status(400).json({ message: phoneValidation.message });
      }
    }

    // Check if user already exists (prevent duplicate emails)
    const userExists = await User.findOne({ email: sanitizedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    // Determine account status based on role
    // 'user' and 'admin' roles get immediate activation, 'agent' and 'recycler' require admin approval
    const defaultRole = role || 'user';
    const rolesRequiringApproval = ['agent', 'recycler'];
    const accountStatus = rolesRequiringApproval.includes(defaultRole) ? 'pending' : 'active';

    // Hash password securely using bcrypt
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with appropriate status
    const user = await User.create({
      name: sanitizedName,
      email: sanitizedEmail,
      password: hashedPassword,
      role: defaultRole,
      address: sanitizedAddress,
      phone: sanitizedPhone,
      status: accountStatus,
    });

    // For 'user' and 'admin' roles: return token and user data (immediate login)
    // For 'agent' and 'recycler' roles: return message indicating approval required
    if (accountStatus === 'active') {
      // Generate token for immediate login (user role only)
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      });

      return res.status(201).json({
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          address: user.address,
          phone: user.phone,
          status: user.status,
        },
      });
    } else {
      // Pending status: account needs admin approval
      return res.status(201).json({
        message: 'Registration successful. Your account is pending admin approval.',
        pending: true,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
        },
      });
    }
  } catch (error) {
    // Handle duplicate email error from MongoDB
    if (error.code === 11000) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    res.status(500).json({ message: error.message || 'Server error during registration' });
  }
});

/**
 * Login endpoint
 * 
 * Status Check:
 * - Only 'active' status accounts can login
 * - 'pending' status accounts are blocked with appropriate message
 */
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Sanitize email input
    const sanitizedEmail = (email || '').toLowerCase().trim();

    if (!sanitizedEmail || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user exists
    const user = await User.findOne({ email: sanitizedEmail });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check if account is active (pending accounts cannot login)
    if (user.status === 'pending') {
      return res.status(403).json({
        message: 'Your account is pending admin approval. Please wait for approval before logging in.',
        status: 'pending',
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate token for active accounts only
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        address: user.address,
        phone: user.phone,
        status: user.status,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Server error during login' });
  }
});

module.exports = router;
