

const jwt = require("jsonwebtoken");
require("dotenv").config();

function authenticate  (req, res, next) {

  const token = req.cookies.jwtToken;
  console.log(token,'//////////////////////////////////////////////////////')
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("error");

      return res.redirect("/get-login");
    }
    req.user = decoded;
    next();
  });
};

module.exports = authenticate
