const jwt = require('jsonwebtoken');

const secretKey = process.env.ACCESS_TOKEN_SECRET
// Middleware to check if user is logged in
function checkLoggedIn(req, res, next) {
  
  const cookieHeader = req.headers.cookie;
  
  if(!cookieHeader){
    return res.status(401).json({message:'Authorization token not provided'})
  }
   //parse the cookie header to get the cookie
const cookies = cookieHeader.split('; ').reduce((acc,cookie) =>{
  const [name,value] = cookie.split('=');
  acc[name] = value;
  return acc;
},{})

const token = cookies.jwtToken
  
  // Verify token
  jwt.verify(token,secretKey, (err, decoded) => {
    if (err) {
      // If error occurred, proceed to next middleware
      return next();
    }

    // If token is valid, user is logged in. Redirect away from login page.
  return  res.redirect('/userhomeget');
  });
}



module.exports = checkLoggedIn;