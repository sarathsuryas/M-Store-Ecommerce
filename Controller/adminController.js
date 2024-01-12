
const {Admin} = require('../model/adminSchema')
const {User} = require('../model/userschema')
const Order = require('../model/orderSchema')
const Product = require('../model/productSchema')
const Category = require('../model/categorySchema')
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
  const email = req.session.email;
  return  res.render('ADMIN/adminlogin',{message,email})
  
}

const adminhome = async (req,res,next) => {
try {
  const users = await User.find()
  const orders = await Order.find()
  const categories = await Category.find()
  const totalSales =  orders.reduce((a,v)=>{
   return a+v.totalAmount
  },0)
  const products = await Product.find()
  return res.render('ADMIN/adminhome',{users,totalSales,products,orders,categories})
} catch (error) {
  console.error(error)
  return res.send('internal sever error')
}
}

const loginsub =async (req,res) =>{

  
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
    return res.redirect('/admin/adminhome')
  }else{
    req.session.message = 'Password is wrong'
    return res.redirect('/admin')
  }
    });
}
catch(error){
console.log(error);
}
}

const userslist = async (req,res) =>{
  try{
const page = parseInt(req.query.page) || 1;
const no_of_docs_each_page = 5;
const totalUsers = await User.countDocuments()
const totalPages = Math.ceil(totalUsers / no_of_docs_each_page)
const skip = (page - 1) * no_of_docs_each_page
const users = await User.find().skip(skip).limit(no_of_docs_each_page)
return res.render('ADMIN/userslist',{users,page,totalPages})
}catch(error){
console.error(error);
return res.status(500).json({error:'Internal server error'})
   }
}

const blockuser = async (req,res) =>{

const userId = req.params.userId;
console.log(userId);
try{
  const user = await User.findById(userId);
  console.log(user);
  if(!user){
    return res.status(404).json({ error: 'User not found' });
  }
  user.isBlocked = true;
  await user.save();
  return res.status(200).json({success:true,message:'sucess true'})
}catch(error){
  console.error(error);
      return res.status(500).json({success:false, error: 'Internal server error' });
}
}

const unblockuser = async (req,res) =>{
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
  console.error(error);
      return res.status(500).json({success:false, error: 'Internal server error' });
}
}


const salesReportDaily = async (req,res) =>{
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
  } catch (error) {
    console.error(error)
    return res.status(500).send('internal server error')
  }
}                                                           
                                                                        
const salesReportWeekly = async (req,res) =>{
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
  } catch (error) {
    console.error(error)
    return res.status(500).send('internal server error')
  }
}

const salesReportMonthly = async (req,res) => {
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
  } catch (error) {
    console.error(error)
    return res.status(500).send('internal server error')
  }
}


module.exports = {adminlogin,adminhome,loginsub,userslist,blockuser,unblockuser,  salesReportDaily, salesReportWeekly, salesReportMonthly}