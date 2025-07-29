
const {Admin} = require('../model/adminSchema')
const {User} = require('../model/userschema')
const Order = require('../model/orderSchema')
const Product = require('../model/productSchema')
const Category = require('../model/categorySchema')
const cookie = require('cookie');
const jwt = require('jsonwebtoken')
const secretKey = process.env.ACCESS_TOKEN_SECRET
const bcrypt = require('bcrypt')

// const adminsignin =async (req,res,next) =>{
//   return res.render('ADMIN/adminsignin')
// }

// const signupsub = async (req,res) =>{
//   const {fname,lname,email,phone,password} = req.body
  
// //hashing password
// bcrypt.hash(password,10,async (err,hash)=>{
//   if(err){
//     console.error(err);
//     return res.status(500).send('Internal Server Error'); //
//   }
// // Creating a new admin with hashed password
// try{
//   const adminData = await Admin.create({
//     firstname:fname,
//     lastname:lname,
//     email:email,
//     phone:phone,
//     password:hash
//   })
  
//   return res.redirect('/admin/adminhome');
// }catch(error){
//   console.error(error);
//   return res.status(500).send('Internal Server Error');
// }

// }) 
// }

const adminlogin = async (req,res,next) => {
  var message = req.session.message;
  delete req.session.message;
  const email = req.session.email;
  delete req.session.email
  return  res.render('ADMIN/adminlogin',{message,email})
  
}

// const adminhome = async (req,res,next) => {
//   try {
    
//     const totalSales =  orders.reduce((a,v)=>{
//      return a+v.totalAmount
//     },0)
    
//     return res.render('ADMIN/adminhome',{users,totalSales,products,orders,categories})
//   } catch (error) {
//     console.error(error)
//     return res.send('internal sever error')
//   }
//   }

const adminhome = async (req, res ,next)=>{
  try{
    const orderDetails = await Order.find().populate('userId')
    const [{totalAmount}]= await Order.aggregate([
      {
        $match: {
          paymentStatus: "success",
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);
   
    const totalOrders = await Order.find()
    const totalProducts = await Product.find()
    const totalCategories= await Category.find();
    const users= await User.find()
    const statistics={
      totalAmount,
      totalOrders:totalOrders.length,
      totalProducts:totalProducts.length,
      totalCategories:totalCategories.length,
      totalUsers:users.length,
    }

    const weeklyData = await Order.aggregate([
      {
        $group: {
          _id: { $week: '$date' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          count: { $ifNull: ['$count', 0] },
        },
      },
    ]);

    const yearlyData = await Order.aggregate([
      {
        $group: {
          _id: { $year: '$date' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          count: { $ifNull: ['$count', 0] },
        },
      },
    ]);
  
    const monthlyData = await Order.aggregate([
      {
        $group: {
          _id: { $month: '$date' },
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 1,
          count: { $ifNull: ['$count', 0] },
        },
      },
    ]);
    
    // Assuming you already have orderData, fill in zeroes for missing months for cancels and returns
    const filledOrderDataWeekly =  fillDataWithZeroesWeek(weeklyData);
    const filledOrderDataMonthly = fillDataWithZeroesMonth(monthlyData);
    const filledOrderDataYearly = fillDataWithZeroesYear(yearlyData);
    
    // Combine all the data to be sent to the client
    
    
    function fillDataWithZeroesWeek(data) {
      const labels = Array.from({ length: 12 }, (_, index) => index + 1);
      return labels.map((week) => {
        const existingWeek = data.find((item) => item._id === week);
        return { _id: week, count: existingWeek ? existingWeek.count : 0 };
      });
    }
    
    function fillDataWithZeroesMonth(data) {
      const labels = Array.from({ length: 12 }, (_, index) => index + 1);
      return labels.map((month) => {
        const existingMonth = data.find((item) => item._id === month);
        return { _id: month, count: existingMonth ? existingMonth.count : 0 };
      });
    }

    // Starting month is November (index 10 in JavaScript Date object)
    const startingMonth = 10;

    function fillDataWithZeroesYear(data) {
      const labels = Array.from({ length: 12 }, (_, index) => index + 1);
      return labels.map((year) => {
        const existingYear = data.find((item) => item._id === year);
        return { _id: year, count: existingYear ? existingYear.count : 0 };
      });
    }
    
    
    // Create an array of labels covering the entire range
    const labels = Array.from({ length: 12 }, (_, index) => (index + startingMonth) % 12 + 1);
  
    const chartFeeder = {
      weeklySales: filledOrderDataWeekly,
      monthlySales: filledOrderDataMonthly,
      yearlySales: filledOrderDataYearly,
    };
    
    res.render("ADMIN/adminhome", { orderDetails, statistics, chartFeeder: JSON.stringify(chartFeeder) });
  } catch (err) {
    next(err); // Pass the error to the next middleware
}
};

const loginsub =async (req,res,next) =>{

  
try{
  const emailRegex = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;
  const enteredEmail = req.body.email;
  if(!emailRegex.test(enteredEmail)){

    req.session.email = 'Invalid email format';
    return res.redirect('/admin');
  }
  
// Case insensitive search in the database
const regexEmail = new RegExp(enteredEmail, 'i'); // 'i' for case insensitive
const mail = await Admin.findOne({email: {$regex: regexEmail}});
 const {email} = mail
if(!mail){
  
  req.session.message = 'email is wrong'
  return res.redirect('/admin')
}
console.log(mail);
const [{password}]= await Admin.aggregate([{$project:{password:1}}])

const enteredPassword = req.body.password;


bcrypt.compare(enteredPassword,password,(err,result)=>{
  if(err){
    console.error(err);
    return
  }
  if(result){
   
      //generate JWT
      const adminToken = jwt.sign({admin:email }, secretKey, { expiresIn: '3h' });
      //set the token as cookie
      res.setHeader('Set-Cookie', cookie.serialize('adminToken', adminToken, { httpOnly: true, maxAge: 3600, path: '/admin' }))
      
    return res.redirect('/admin/adminhome')
  }else{
    req.session.message = 'Password is wrong'
    return res.redirect('/admin')
  }
    });
}
catch(err){
  next(err); // Pass the error to the next middleware
}
}

const logOut = async (req, res) => {
  res.clearCookie('adminToken', { path: '/admin' }); // replace 'jwtToken' with the name of your cookie
  return res.redirect('/admin');
}


const userslist = async (req,res,next) =>{
  try{
const page = parseInt(req.query.page) || 1;
const no_of_docs_each_page = 5;
const totalUsers = await User.countDocuments()
const totalPages = Math.ceil(totalUsers / no_of_docs_each_page)
const skip = (page - 1) * no_of_docs_each_page
const users = await User.find().skip(skip).limit(no_of_docs_each_page)
return res.render('ADMIN/userslist',{users,page,totalPages})
}catch(err){

next(err); // Pass the error to the next middleware
}
}

const blockuser = async (req,res,next) =>{

const userId = req.params.userId;
console.log(userId);
try{
  const user = await User.findById(userId);
  if(!user){
    return res.status(404).json({ error: 'User not found' });
  }
  user.isBlocked = true;
  await user.save();
  return res.status(200).json({success:true,message:'sucess true'})
}catch(err){
  next(err); // Pass the error to the next middleware
}
}

const unblockuser = async (req,res,next) =>{
const userId = req.params.userId

try{
  const user = await User.findById(userId)
  if(!user){
    return res.status(404).json({ error: 'User not found' });
  }
  user.isBlocked = false;
  await user.save();

  return res.status(200).json({success:true,message:'sucess true'})
}catch(error){
  next(err); // Pass the error to the next middleware
}
}


const salesReportDaily = async (req,res,next) =>{
  try {
    
    const currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0) //set the time to beggining of the day

    const nextDate = new Date(currentDate); 
     nextDate.setDate(nextDate.getDate() + 1)  // Get the next day

    const dailySales = await Order.find({
      date:{$gte: currentDate , $lt: nextDate}
    })
    .populate('products.productId')
    
    // Calculate total orders and total sales
    const totalOrders = dailySales.length;
    const totalSales = dailySales.reduce((total, order)=> total + order.totalAmount, 0)

    //format date as required
    const formattedDate = currentDate.toDateString();
    
    const salesData = []
    
    dailySales.forEach((order)=>{
      order.products.forEach((product)=>{
        salesData.push({
          date: order.date,
          orderId: order.orderId,
          ProductName : product.productId.title,
          price: product.total,
          quantity: product.quantity
        })
      })
    })
     // salesData for printing excel
     let jsonString = JSON.stringify(salesData);
  
    return res.render('ADMIN/dailySalesReport',{dailySales, formattedDate, totalOrders, totalSales , jsonString})
  } catch (err) {
    next(err); // Pass the error to the next middleware

  }
}                                                           
                                                                        
const salesReportWeekly = async (req,res,next) =>{
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day

    const oneWeekAgo = new Date(currentDate);
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7); // Get the date from one week ago
    
    const weeklySales = await Order
    .find({
      date: { $gte: oneWeekAgo, $lt: currentDate },
    })
    .populate('products.productId')
   
     // Calculate total orders and total sales for the week
    const totalOrders = weeklySales.length;
    const totalSales = weeklySales.reduce((total, order) => total + order.totalAmount, 0);
    
    // Format date range as required
    const formattedDateRange = `${oneWeekAgo.toDateString()} to ${currentDate.toDateString()}`;
    
    const salesData = []
    
    weeklySales.forEach((order)=>{
      order.products.forEach((product)=>{
        salesData.push({
          date: order.date,
          orderId: order.orderId,
          ProductName : product.productId.title,
          price: product.total,
          quantity: product.quantity
        })
      })
    })
     // salesData for printing excel
     let jsonString = JSON.stringify(salesData);
    console.log(weeklySales);
    return res.render('ADMIN/weeklySalesReport',{ weeklySales, formattedDateRange, totalOrders, totalSales, jsonString })
  } catch (err) {
    next(err); // Pass the error to the next middleware

  }
}

const salesReportMonthly = async (req,res,next) => {
  try {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set time to the beginning of the day
    
    const oneMonthAgo = new Date(currentDate);
    oneMonthAgo.setDate(oneMonthAgo.getDate() - 30); // Get the date from one week ago

    const monthlySales = await Order
    .find({
      date: { $gte: oneMonthAgo, $lt: currentDate },
    })
    .populate('products.productId');
    
     // Calculate total orders and total sales for the week
     const totalOrders = monthlySales.length;
     const totalSales = monthlySales.reduce((total, order) => total + order.totalAmount, 0);
       
     // Format date range as required
     const formattedDateRange = `${oneMonthAgo.toDateString()} to ${currentDate.toDateString()}`;
     
     const salesData = []
    
    monthlySales.forEach((order)=>{
      order.products.forEach((product)=>{
        salesData.push({
          date: order.date,
          orderId: order.orderId,
          ProductName : product.productId.title,
          price: product.total,
          quantity: product.quantity
        })
      })
    })
     // salesData for printing excel
     let jsonString = JSON.stringify(salesData);
 
    return res.render('ADMIN/monthlySalesReport',{ monthlySales, formattedDateRange, totalOrders, totalSales, jsonString })
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
}


module.exports = {adminlogin,adminhome,loginsub,userslist,blockuser,unblockuser,  salesReportDaily, salesReportWeekly, salesReportMonthly,logOut}