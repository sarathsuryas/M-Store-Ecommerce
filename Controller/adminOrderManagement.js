
const Order = require('../model/orderSchema')


const orderList = async(req,res,next)=>{
  try{
    const page = parseInt(req.query.page) || 1;
const no_of_docs_each_page = 5;
const totalOrders = await Order.countDocuments()
const totalPages = Math.ceil(totalOrders / no_of_docs_each_page)
const skip = (page - 1) * no_of_docs_each_page

  const orders = await Order.find().sort({ createdAt: -1 }).skip(skip).limit(no_of_docs_each_page).populate('userId')
 
  return res.render('ADMIN/orderlist',{orders,page,totalPages})
  }catch(err){
    
    next(err); // Pass the error to the next middleware
  }
}

const orderDetails = async (req,res,next) =>{
  try{
  const id = req.params.id;
  const order = await Order.findOne({_id:id}).populate('userId').populate('products.productId')
  console.log(order)
  
    return res.render('ADMIN/orderDetails',{order})
  }catch(err){
    next(err); // Pass the error to the next middleware
    }
  }

  const updateOrderStatus = async (req,res,next) =>{
    try{
      const {orderId,selectedStatus} = req.body
     const order = await Order.findOne({_id:orderId})
     if(!order){
      return res.status(404).json({error:'order not found'})
     }
     order.orderStatus=selectedStatus;
     await order.save()
    return  res.status(200).json({success:true})
    }catch(err){
      next(err); // Pass the error to the next middleware
       }
    }

    module.exports = {orderList,orderDetails,updateOrderStatus}