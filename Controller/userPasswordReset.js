
const { User } = require('../model/userschema')

const nodemailer = require('nodemailer')
const bcrypt = require('bcrypt');
const { PassThrough } = require('nodemailer/lib/xoauth2');
var randtoken = require('rand-token');

const forgotPassword = async (req,res,next) =>{
  try{
    const {email} = req.body
    
    
    const user = await User.findOne({email:email})
    
    if(!user){
      return res.status(404).json({success:false})
    }
    // Generate a 16 character alpha-numeric token
    var token = randtoken.generate(16);
   user.token = token;
   
   user.tokenExpire = Date.now() + 10 * 60 * 1000
  
  await  user.save()

let transporter = nodemailer.createTransport({
  service:'gmail',
  auth: {
    user: process.env.email,
    pass: process.env.password
  }
})

let mailOptions = {
  from:"sarathsuryasss48@gmail.com",
  to:email,
  subject:"Reset Your password using this link",
  html:`<p>Hello ${user.username},</p>
  <p>You requsted a password reset for your account.Click the link below to reset your password:</p>
  <a href="http://localhost:3000/reset-password?token=${token}">Reset Password</a>
  <p>If you didn't request this ,please ignore this email.</p>
  `
};
  transporter.sendMail(mailOptions,
   function(error,info){
    if (error){
      console.log(error)
    }else{
      console.log("Email sent: " + info.response)
    }
   })
   req.session.email = email
  return res.status(200).json({success:true})
  }catch (error) {
  next(error)
}
}

const resetPassword = async (req,res,next) =>{
  try {
    let newDate = Date.now()
    const email = req.session.email
    const token = req.query.token;
    const user = await User.findOne({email:email})

   

   if(user.token===token&& newDate <= user.tokenExpire){
    return res.render('USER/resetPassword')
   }else{
    return res.render('USER/404')
   }
    
  } catch (error) {
    next(error)
  }
}


const resetPasswordSubmit = async (req,res,next) =>{
  try{

 const {confirmPassword} = req.body
   //console.log(req.body)
   const email = req.session.email
   bcrypt.hash(confirmPassword, 10, async (err, hash) => {
     if (err) {
       console.error(err);
       return res.status(500).send('Internal Server Error'); //
     }
     const user = await User.findOne({email:email})
     // for storing hashed password to database
     user.password = hash
     await user.save()
     return res.status(200).json({ success: true })
   })
 
  }catch (error) {
 next(error)
}
}

const changePassword = async (req, res, next) => {
  try {
    const userId = req.user.user._id
    const { oldPassword, newPassword } = req.body
    const { password } = await User.findById(userId)
    const passwordMatch = await bcrypt.compare(oldPassword, password)
    if (passwordMatch) {
      bcrypt.hash(newPassword, 10, async (err, hash) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Internal Server Error'); //
        }
        const user = await User.findById(userId)
        // for storing hashed password to database
        user.password = hash
        await user.save()
        return res.status(200).json({ success: true })
      })
    } else {
      return res.status(201).json({ success: true })
    }
    console.log(req.body)
  } catch (error) {
    next(error)
  }
}


const afterReset = async(req,res) =>{
  if(req.user.user._id){
    return res.redirect('/userhomeget')
  }
  else{
    return res.redirect('/')
  }
}

module.exports = {forgotPassword,resetPasswordSubmit,changePassword,afterReset,resetPassword}