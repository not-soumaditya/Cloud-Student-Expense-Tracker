const express = require('express');
const jwt = require('jsonwebtoken');
const { authenticator } = require('otplib');
const qrcode = require('qrcode');
const UserModel = require('../models/userModel');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

// Helper: generate JWT token
function generateToken(user, mfaVerified = true) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, mfaVerified },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// POST /api/auth/register — Register a new user
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name, role } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // Check if user already exists
    const existing = await UserModel.findByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'A user with this email already exists.' });
    }

    // Only allow 'student' role during self-registration
    const userRole = (role === 'supervisor') ? 'supervisor' : 'student';
    const user = await UserModel.create(email, password, name, userRole);
    const token = generateToken(user);

    res.status(201).json({
      message: 'User registered successfully',
      user,
      token
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login — Login with email + password
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const user = await UserModel.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const validPassword = await UserModel.verifyPassword(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // If MFA is enabled, return a partial token that requires MFA verification
    if (user.mfa_enabled) {
      const partialToken = generateToken(user, false);
      return res.json({
        message: 'MFA verification required',
        mfa_required: true,
        partial_token: partialToken,
        user: { id: user.id, email: user.email, name: user.name, role: user.role }
      });
    }

    // No MFA — return full access token
    const token = generateToken(user, true);
    res.json({
      message: 'Login successful',
      mfa_required: false,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-mfa — Verify TOTP code after login (when MFA is enabled)
router.post('/verify-mfa', async (req, res, next) => {
  try {
    const { partial_token, totp_code } = req.body;

    if (!partial_token || !totp_code) {
      return res.status(400).json({ error: 'partial_token and totp_code are required.' });
    }

    // Decode the partial token
    let decoded;
    try {
      decoded = jwt.verify(partial_token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    if (decoded.mfaVerified) {
      return res.status(400).json({ error: 'MFA already verified for this token.' });
    }

    // Get user's MFA secret
    const mfaData = await UserModel.getMfaSecret(decoded.id);
    if (!mfaData || !mfaData.mfa_secret) {
      return res.status(400).json({ error: 'MFA is not configured for this user.' });
    }

    // Verify the TOTP code
    const isValid = authenticator.verify({ token: totp_code, secret: mfaData.mfa_secret });
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid TOTP code. Please try again.' });
    }

    // Issue a full access token
    const user = await UserModel.findById(decoded.id);
    const fullToken = generateToken(user, true);

    res.json({
      message: 'MFA verification successful',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token: fullToken
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/setup-mfa — Generate TOTP secret + QR code (requires auth)
router.post('/setup-mfa', authenticate, async (req, res, next) => {
  try {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(req.user.email, 'StudentExpenseTracker', secret);

    // Save the secret to the database
    await UserModel.saveMfaSecret(req.user.id, secret);

    // Generate QR code as data URL
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    res.json({
      message: 'MFA setup initiated. Scan the QR code with Google Authenticator.',
      secret,
      qr_code: qrCodeDataUrl,
      otpauth_url: otpauthUrl
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/enable-mfa — Verify first TOTP code and enable MFA (requires auth)
router.post('/enable-mfa', authenticate, async (req, res, next) => {
  try {
    const { totp_code } = req.body;

    if (!totp_code) {
      return res.status(400).json({ error: 'totp_code is required.' });
    }

    const mfaData = await UserModel.getMfaSecret(req.user.id);
    if (!mfaData || !mfaData.mfa_secret) {
      return res.status(400).json({ error: 'MFA setup not initiated. Call /setup-mfa first.' });
    }

    const isValid = authenticator.verify({ token: totp_code, secret: mfaData.mfa_secret });
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid TOTP code. MFA not enabled.' });
    }

    const user = await UserModel.enableMfa(req.user.id);

    res.json({
      message: 'MFA enabled successfully!',
      user
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
