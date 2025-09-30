const jwt = require("jsonwebtoken");
require("dotenv").config();

function checkLoggedIn(req, res, next) {
  const token = req.cookies.jwtToken;

  if (!token) {
    // No token → continue to next middleware/route
    return next();
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      console.error("JWT verification failed:", err.message);
      return next(); // invalid token → treat as not logged in
    }

    // Attach user info to request object
    req.user = decoded;

    // If already logged in, redirect to home
    return res.redirect("/");
  });
}

module.exports = checkLoggedIn;
