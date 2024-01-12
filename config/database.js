const mongoose = require('mongoose');
require('dotenv').config();

let dbConnection;

module.exports = {
  connectToDb: (cb) => {
    mongoose
      .connect(process.env.MONGODB_URI)
      .then(() => {
        dbConnection = mongoose.connection;
        return cb();
      })
      .catch((err) => {
        console.error(err);
        return cb(err);
      });
  },
  getDb: () => dbConnection,
};
