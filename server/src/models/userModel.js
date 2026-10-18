const pool = require('../config/db');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

const UserModel = {
  // Create a new user with a bcrypt-hashed password
  async create(email, password, name, role = 'student') {
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const result = await pool.query(
      `INSERT INTO users (email, password, name, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, name, role, mfa_enabled, created_at`,
      [email, hashedPassword, name, role]
    );
    return result.rows[0];
  },

  // Find user by email (includes password hash for verification)
  async findByEmail(email) {
    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return result.rows[0];
  },

  // Find user by ID (excludes password)
  async findById(id) {
    const result = await pool.query(
      'SELECT id, email, name, role, mfa_enabled, created_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  // Verify a plaintext password against the stored bcrypt hash
  async verifyPassword(plaintext, hash) {
    return bcrypt.compare(plaintext, hash);
  },

  // Save TOTP MFA secret for a user
  async saveMfaSecret(userId, secret) {
    const result = await pool.query(
      'UPDATE users SET mfa_secret = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, mfa_enabled',
      [secret, userId]
    );
    return result.rows[0];
  },

  // Enable MFA for a user (after they verify their first TOTP code)
  async enableMfa(userId) {
    const result = await pool.query(
      'UPDATE users SET mfa_enabled = TRUE, updated_at = NOW() WHERE id = $1 RETURNING id, email, name, role, mfa_enabled',
      [userId]
    );
    return result.rows[0];
  },

  // Get MFA secret for verification during login
  async getMfaSecret(userId) {
    const result = await pool.query(
      'SELECT mfa_secret, mfa_enabled FROM users WHERE id = $1',
      [userId]
    );
    return result.rows[0];
  }
};

module.exports = UserModel;
