require('dotenv').config();
const { server } = require('./server.js');

// make the port dynamic
const port = process.env.PORT || 9900;
server.listen(port, () => {
  console.log(`\n====running on port ${port}====\n`)
});