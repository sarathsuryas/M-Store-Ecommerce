const jwt = require('jsonwebtoken');
const secretKey = process.env.ACCESS_TOKEN_SECRET

function authenticate(req,res,next){
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
if(!token){
  return res.redirect('/')
}
  jwt.verify(token,secretKey,(err,user) =>{
    if(err){
      return res.status(403).json({message:'Invalid token'})
    }
    req.user = user;
  
    next();
  })
}

module.exports = authenticate;
