const jwt = require("jsonwebtoken");
require("dotenv").config();

function verifyAdmin  (req, res, next) {

  const adminToken = req.cookies.adminToken;
  jwt.verify(adminToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("error",err);

      return res.redirect("/admin");
    }
    req.admin = decoded;
    next();
  });
};

module.exports = verifyAdmin