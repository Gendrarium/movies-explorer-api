require('dotenv').config();

const { NODE_ENV, JWT_SECRET, MONGO_URL = 'mongodb://localhost:27017/bitfilmsdb' } = process.env;

module.exports = {
  NODE_ENV,
  JWT_SECRET,
  MONGO_URL,
};
