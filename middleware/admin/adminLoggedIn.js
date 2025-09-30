const jwt = require("jsonwebtoken");
require("dotenv").config();

function adminLoggedIn(req, res, next) {
  const adminToken = req.cookies?.adminToken;

  if (!adminToken) {
    // No token → allow request to continue
    return next();
  }

  jwt.verify(adminToken, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("Admin token verification failed:", err.message);
      return next(); // invalid/expired token → proceed normally
    }

    // Token valid → attach admin info and redirect to admin home
    req.admin = decoded;
    return res.redirect("/admin/adminhome");
  });
}

module.exports = adminLoggedIn;
