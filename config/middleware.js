require('dotenv').config();

const jwt = require('jsonwebtoken');

module.exports = {
  authenticate,
  generateToken,
};

// Custom Function for token generation
const jwtSecret =
  process.env.JWT_SECRET || 'add a secret to your .env file with this key';

  function generateToken(user) {
    const jwtPayload = {
      ...user,
      role: 'admin',
    };
  
    const jwtOptions = {
      expiresIn: '3m',
    }
  
    return jwt.sign(jwtPayload, jwtSecret, jwtOptions)
  }