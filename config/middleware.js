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

  // implementation details
// CUSTOM MIDDLEWARE
function authenticate(req, res, next) {
  //authentication token
  const token = req.get('Authorization');

  if (token) {
    jwt.verify(token, jwtSecret, (err, decodedToken) => {
      
      if (err) {
        // token verification failed
        res.status(401).json({ message: 'cannot retrieve information'});
      } else {
        // token is valid
        req.decodedToken = decodedToken; // sub-agent middleware of route handler have access to this
        next();
      } 
    });
  } else {
    res.status(401).json({ error: 'No token provided, must be set on the Authorization Header'});
  }
}