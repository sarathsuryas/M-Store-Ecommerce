

const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticate  (req, res, next) {
  
  const token = req.cookies.jwtToken;
 
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.redirect("/get-login");
    }
    req.user = decoded;
    next();
  });
};

module.exports = authenticate
