const jwt = require("jsonwebtoken");
require("dotenv").config();

function adminLoggedIn  (req, res, next)  {

  const adminToken = req.cookies.adminToken;
  jwt.verify(adminToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.log("error");

      next();
    }
    req.admin = decoded;
    return  res.redirect('/admin/adminhome');
  });
};

module.exports = adminLoggedIn