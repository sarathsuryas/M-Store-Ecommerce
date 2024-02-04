
const mongoose = require('mongoose');
const { User } = require('../model/userschema')
const { OTP } = require('../model/otpSchema')
const Product = require('../model/productSchema')
const Category = require('../model/categorySchema')
const Address = require('../model/addressSchema')
const Order = require('../model/orderSchema')
const nodemailer = require('nodemailer')
const cookie = require('cookie');
const jwt = require('jsonwebtoken')
const secretKey = process.env.ACCESS_TOKEN_SECRET
const bcrypt = require('bcrypt');
var randtoken = require('rand-token');
const Coupon = require('../model/couponSchema');
const Wallet = require('../model/walletSchema');
const { resetPasswordSubmit } = require('./userPasswordReset');
//function to generate a random OTP




const generateOTP = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};
//map to store OTPs for verification
const otpMap = new Map();



const userlogin = async (req, res, next) => {
  const notFound = req.session.notFound
  const blocked = req.session.blocked

  // Clear session properties
  delete req.session.notFound;
  delete req.session.blocked;

  return res.render('USER/login', { blocked , notFound  });
}

const userSignup = async (req, res) => {
  const signup = req.session.signup
  delete req.session.signup
  return res.render('USER/signup', { signup })
}


const signupsub = async (req, res,next) => {

  

  try {
    const { username, email, password ,phone} = req.body;
    req.session.data = { username, email, password ,phone }
  
  
  
    const data = await User.findOne({ email: email });
    if (data) {
      req.session.signup = 'Email already Exists please login'
      return res.redirect('/signup')
    }
    //console.log(req.session.data);
  
    //configure nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.email,
        pass: process.env.password
      }
    })



    //Generate and store OTP
    const otp = generateOTP();
    console.log('Before findOneAndUpdate');
    const userOtp = await OTP.findOneAndUpdate({ name: 'otp' }, { $set: { otp: otp } })
    console.log('After findOneAndUpdate');
    console.log(otp);
    if (userOtp) {
      //send OTP via email
      const mailOptions = {
        from: 'sarathsuryasss48@gmail.com',
        to: req.body.email,
        subject: 'OTP for Signup',
        text: `your OTP for signup is: ${otp}`,
      }

      await transporter.sendMail(mailOptions);


      return res.redirect('/otp-modal')
    }
    else {
      return res.redirect('/')
    }

    //Respond to the client, indicating that has been  sent
    //res.status(200).json({ message: 'OTP sent to your email. Please enter the OTP to complete signup.' });

  } catch (error) {
   next(error)
  }

}

const otpModal = async (req,res,next) =>{
  return res.render('USER/otpModal')
}

const userhome = async (req, res,next) => {
try {
 let loggedIn = req.cookies.loggedIn
  const page = parseInt(req.query.page) || 1;
const no_of_docs_each_page = 8;
const totalProducts = await Product.countDocuments()
const totalPages = Math.ceil(totalProducts / no_of_docs_each_page)
const skip = (page - 1) * no_of_docs_each_page

  const products = await Product.find({ isListed: true })
  .skip(skip).limit(no_of_docs_each_page).populate('category')
  //const categories = await Category.find({isListed:true})
  return res.render('USER/userhome', { products ,page , totalPages, loggedIn})
} catch (error) {
  next(error)
}
  
}


const userauth = async (req, res,next) => {
  const { one, two, three, four } = req.body;

  // Check if req.session.data exists
  if (!req.session.data) {
    return res.status(400).json({ error: 'Session data not found' });
  }

  const { username, email, password , phone } = req.session.data;

  try {
    const { otp } = await OTP.findOne({ name: 'otp' });
    //hashing password
    const hashedPassword = await bcrypt.hash(password, 10)

    const userEnteredOTP = `${one}${two}${three}${four}`;
    const numericOTP = parseInt(userEnteredOTP, 10)
    if (otp === numericOTP) {
      const users = new User({
        username: username,
        email: email,
        mobile:phone,
        password: hashedPassword
      })

      await users.save()
      const userData = await User.findOne({ email: email })

      const user = {
        _id: userData._id,
        username: userData.username
      }
      //generate JWT
      const token = jwt.sign({ user }, secretKey, { expiresIn: '1h' });
      //set the token as cookie
      res.setHeader('Set-Cookie', cookie.serialize('jwtToken', token, { httpOnly: true, maxAge: 3600, path: '/' }))

      return res.redirect('/')

    }
  } catch (error) {
    next(error)
  }
};

const loginsub = async (req, res, next) => {

  try {
    const { email, password: enteredPassword } = req.body;

    const userData = await User.findOne({ email: email })

    if (!userData) {
      req.session.notFound = 'User data not found Please Sign up'
      return res.redirect('/get-login')
    }
    if (userData.isBlocked) {
      req.session.blocked = 'This User is blocked by Admin'
      return res.redirect('/get-login')
    }
    const { password, _id, username } = userData;
    // Use bcrypt.compare with async/await for cleaner code
    const passwordMatch = await bcrypt.compare(enteredPassword, password);

    if (passwordMatch) {
      const user = {
        _id: _id,
        username: username,

      }
      //generate JWT
      const token = jwt.sign({ user }, secretKey, { expiresIn: '24 hours' });
      
      //set the token as cookie
      res.cookie('jwtToken', token, { maxAge: 24 * 60 * 60 * 1000, httpOnly: true });
        res.cookie("loggedIn", true, { maxAge: 24 * 60 * 60 * 1000 });

      return res.redirect('/')
    }

    else {
      req.session.err = 'The password is incorrect'
      return res.redirect('/get-login')

    }

  } catch (error) {
   next(error)
  }
}

const purchaseProduct = async (req, res,next) => {
  // console.log(productId);
  try {
    const productId = req.params.id;
    let loggedIn = req.cookies.loggedIn
    const products = await Product.findOne({ _id: productId }).populate('category')
    console.log(products);
    return res.render('USER/purchaseProduct', { products ,loggedIn})
  } catch (error) {
    next(error)
  }
}

const shop = async (req, res, next) => {
  try {
    let products, categories,totalPages,page;
    // for Identifying in top of the page. page logged or not
  const loggedIn = req.user.user ? true : false;

    // variable for finding the action
     let action = req.query.action;
     // action set as categoryName always
     var categoryName =  req.query.action;
     let categoryId = req.query.id
     
     let price = req.query.price
     if(categoryId!=="undefined"&&categoryId){
      var category = await Category.findById(categoryId)
      console.log(category);
     }
     
     
     if(action==='All Products'&&price==="lowToHigh"){
      categoryName = action
       page = parseInt(req.query.page) || 1;
       const no_of_docs_each_page = 3
       const totalProducts = await Product.countDocuments()
       totalPages = Math.ceil(totalProducts / no_of_docs_each_page)
       const skip = (page - 1) * no_of_docs_each_page
       products = await Product.find({isListed:true })
       .sort({price:1})
       .skip(skip)
       .limit(no_of_docs_each_page)
       .populate('category')
       categories = await Category.find();
       
       return res.render('USER/shop', { products, categories , page , totalPages , action , categoryId, price ,categoryName,loggedIn})
       
      }else if(action==="All Products"&&price==="highToLow"){
        categoryName = action
        page = parseInt(req.query.page) || 1;
        const no_of_docs_each_page = 3
        const totalProducts = await Product.countDocuments()
        totalPages = Math.ceil(totalProducts / no_of_docs_each_page)
        const skip = (page - 1) * no_of_docs_each_page
        products = await Product.find({isListed:true })
        .sort({price:-1})
        .skip(skip)
        .limit(no_of_docs_each_page)
        .populate('category')
        categories = await Category.find();
        
        return res.render('USER/shop', { products, categories , page , totalPages , action , categoryId, price, categoryName,loggedIn})
        
      }else if(category && action===(category.categoryName ? category.categoryName : 'defaultCategoryName')&&price==="lowToHigh"){
        categoryName = action
        page = parseInt(req.query.page) || 1;
        const no_of_docs_each_page = 3
        const totalProducts = await Product.countDocuments({category:categoryId})
        totalPages = Math.ceil(totalProducts / no_of_docs_each_page)
        const skip = (page - 1) * no_of_docs_each_page
        products = await Product.find({category:categoryId,isListed:true })
        .sort({price:1})
        .skip(skip)
        .limit(no_of_docs_each_page)
        .populate('category')
        categories = await Category.find();
        
        return res.render('USER/shop', { products, categories , page , totalPages , action , categoryId, price ,categoryName ,loggedIn })

      }else if(category && action===(category.categoryName ? category.categoryName : 'defaultCategoryName')&&price==="highToLow"){
          categoryName = action
        page = parseInt(req.query.page) || 1;
        const no_of_docs_each_page = 3
        const totalProducts = await Product.countDocuments({category:categoryId})
        totalPages = Math.ceil(totalProducts / no_of_docs_each_page)
        const skip = (page - 1) * no_of_docs_each_page
        products = await Product.find({category:categoryId,isListed:true })
        .sort({price:-1})
        .skip(skip)
        .limit(no_of_docs_each_page)
        .populate('category')
        categories = await Category.find();
        
        return res.render('USER/shop', { products, categories , page , totalPages , action , categoryId, price ,categoryName ,loggedIn })
      }
      else if(category && action===(category.categoryName ? category.categoryName : 'defaultCategoryName')){
       categoryName = action
        page = parseInt(req.query.page) || 1;
        const no_of_docs_each_page = 3
        const totalProducts = await Product.countDocuments({category:categoryId})
        console.log(totalProducts);
        totalPages = Math.ceil(totalProducts / no_of_docs_each_page)
        const skip = (page - 1) * no_of_docs_each_page
        products = await Product.find({ category:categoryId,isListed:true })
        .skip(skip)
        .limit(no_of_docs_each_page)
        .populate('category')
        
        categories = await Category.find();
        
        return res.render('USER/shop', { products, categories , page , totalPages , action , categoryId ,price, categoryName, loggedIn })
      }
      else{
        categoryName = action
     page = parseInt(req.query.page) || 1;
     const no_of_docs_each_page = 6
     const totalProducts = await Product.countDocuments()
     totalPages = Math.ceil(totalProducts / no_of_docs_each_page)
     const skip = (page - 1) * no_of_docs_each_page
     products = await Product.find({isListed:true })
     .skip(skip)
     .limit(no_of_docs_each_page)
     .populate('category')
     categories = await Category.find();
     return res.render('USER/shop', { products, categories , page , totalPages , action,categoryId:'',price:'' , categoryName,loggedIn})
     
   }

    
  } catch (error) {
    next(error)
  }
};


const userProfile = async (req, res,next) => {
  const userId = req.user.user._id;
  try {
    // for Identifying in top of the page. page logged or not
    const loggedIn = req.user.user ? true : false;

    const user = await User.findById(userId)
    const wallet = await Wallet.findOne({userId:userId})
    const orders = await Order.find({userId:userId}).sort({createdAt:-1})
    const address = await Address.findOne({userId:userId})
    
    const adrs = (!address) ? '' : address
   
    const phoneNumber = user.mobile
    const mobile = (!phoneNumber) ? '' : phoneNumber
 
    return res.render('USER/userProfile', { mobile, user, orders , adrs ,wallet ,loggedIn})
  } catch (error) {
    next(error)
  }
}



const editUserDetails = async (req,res,next) =>{
  try{
    const {username,email,phone}=req.body
    const userId = req.user.user._id;
    const user =  await User.findById(userId)
   
    user.mobile = phone;
    await user.save()
    user.username=username;
    user.email=email
    await user.save()
    return res.status(200).json({success:true})
  }catch(error){
    next(error)
  }
}


const logout = async (req, res) => {
  res.clearCookie('jwtToken'); 
  res.clearCookie("loggedIn");
  res.redirect("/get-login");
}


const searchProduct = async (req,res,next) =>{
  try {
    const {input} = req.body
    
    const products = await Product.find({title:{$regex:input, $options: 'i'}})
    
    if(products){
      return res.status(200).json({success:true,products})
    }else{
      return res.status(500).json({message:"Product not found"})
    }
  } catch (error) {
    next(error)
  }
}

const searchInput = async (req,res,next) => {
  try {
    const product = await Product.findOne({title:req.body.searchName})
    const productId = product._id
   return res.status(200).json({success:true,productId})
  } catch (error) {
     next(error)
  }
}

const searchResult = async (req,res,next) =>{
   try {
    let loggedIn = req.cookies.loggedIn
    const productId = req.query.id
    const product= await Product.findOne({_id:productId}).populate('category')
    const array = []
    array.push(product)
    const products = array
    return res.render('USER/userhome', { products ,page:'' , totalPages:'',loggedIn})
   } catch (error) {
    next(error)
   }
}

const applyCoupon = async (req,res,next) =>{
  try {
    
    const userId = req.user.user._id;
     const { couponCode, cartTotalValue }=req.body;
     req.session.couponCode=couponCode
    const coupon = await Coupon.findOne({code:couponCode})
    
    if(!coupon){
      return res.status(500).json({succes:false})
    }
    if(coupon.redeemedUsers.length > 10){
      return res.status(202).json({succes:true})
    }
         if (coupon.redeemedUsers.includes(userId)){
            return res.status(201).json({succes:true})
         }
         
    if(coupon.discountType==="percentage"){
    const maxRedeemableAmt =  coupon.maxRedeemableAmt
     const discountAmtOrPercentage = coupon.discountAmtOrPercentage
     const percentageAmt = cartTotalValue*discountAmtOrPercentage/100
    let maxRedeemableAmtOrPercentage =  Math.min(maxRedeemableAmt,percentageAmt)
      return res.status(200).json({succes:true,maxRedeemableAmtOrPercentage,discountAmtOrPercentage,percentage:"percentage"})
    }
  const discountAmtOrPercentage = coupon.discountAmtOrPercentage;
  
    return res.status(203).json({succes:true,discountAmtOrPercentage})
    
  } catch (error) {
   next(error)
  }
}


module.exports = { userlogin, signupsub, userhome, userauth, loginsub, purchaseProduct, shop, userSignup,  userProfile, editUserDetails,logout,searchProduct,otpModal,applyCoupon,searchInput,searchResult}