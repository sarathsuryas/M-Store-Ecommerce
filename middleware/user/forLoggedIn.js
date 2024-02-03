

const jwt = require("jsonwebtoken");
require("dotenv").config();

function checkLoggedIn  (req, res, next)  {

  const token = req.cookies.jwtToken;
  jwt.verify(token , process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("error");
      next();
    }
    req.user = decoded;
    return  res.redirect('/');
  });
};

module.exports = checkLoggedIn