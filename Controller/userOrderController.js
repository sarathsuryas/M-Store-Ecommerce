

const Product = require('../model/productSchema')
const Address = require('../model/addressSchema')
const Order = require('../model/orderSchema')
const Cart = require('../model/cartSchema');
var randtoken = require('rand-token');
var razorpay = require('../utils/razorpay');
const Coupon = require('../model/couponSchema');
const Wallet = require('../model/walletSchema')


const placeOrderCod = async (req, res) => {
  try {
    const { payment, addressId, discountPrice:discountPriceWithoOrWithout , couponCode ,totalShipment } = req.body
    const userId = req.user.user._id;
   const difference = totalShipment-discountPriceWithoOrWithout

    const cart = await Cart.findOne({ userId: userId }).populate('products.productId')
    const cartQuantity = cart.products.map((item)=>{
      return item.quantity
    })
   const stock =  cart.products.map((item)=>{
       return item.productId.stock
      })
 

 for(let i=0;i<cartQuantity.length;i++){
  if(cartQuantity[i]>stock[i]){
    let index = i
    let product = cart.products[index]
   var title = product.productId.title
   return res.status(205).json({succes:true,title:title})
  }
}



 
    if(couponCode){
      const coupon = await Coupon.findOne({code:couponCode})
     
      coupon.redeemedUsers.push(userId) 
     await coupon.save()
    }
   

    
    const userAddress = await Address.findOne({ userId: userId })
    const selectedAddress = userAddress.address.filter((item) => {
      return item._id.toString() === addressId.toString()
    })

    const [{ name, mobile, homeAddress, pinCode, locality, city, state, altPhone }] = selectedAddress
    // const totalAmount = cart.cartTotal
    //const order = await Order.create({})
    console.log(name, mobile, homeAddress, pinCode, locality, city, state, altPhone)
    const addressData = {
      name: name,
      mobile, mobile,
      homeAddress: homeAddress,
      pinCode: pinCode,
      locality: locality,
      city: city,
      state: state,
      altPhone: altPhone
    }

    const productDetails = cart.products.map((item) => {
      return {
        salePrice: item.total / item.quantity,
        originalItem: item
      }
    })

    const data = await Order.create({
      userId: userId,
      totalAmount: discountPriceWithoOrWithout-40,
      paymentMethod: payment,
      products: productDetails.map((item) => {
        return {
          salePrice: item.salePrice,
          productId: item.originalItem.productId,
          quantity: item.originalItem.quantity,
          total: item.originalItem.total
        }
      }),
      address: addressData,
      totalShipment:discountPriceWithoOrWithout,
      appliedCouponValue:difference,
      couponCode:couponCode
    })
    
    const productIdArray = data.products.map((item) => {
      return item.productId;
  });
  
  const products = await Product.find({ _id: { $in: productIdArray } });

products.forEach(async (product, index) => {
    product.stock = product.stock - cartQuantity[index];
    await product.save();
});

  
    return res.status(200).json({ succes: true })
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
}

const placeOrderOnlinePayment = async (req,res) =>{
  try {
    const { payment, addressId, discountPrice:discountPriceWithoOrWithout, totalShipment } = req.body
   
    const userId = req.user.user._id;
    const cart = await Cart.findOne({ userId: userId }).populate('products.productId')

    const cartQuantity = cart.products.map((item)=>{
      return item.quantity
    })
   const stock =  cart.products.map((item)=>{
       return item.productId.stock
      })
 

 for(let i=0;i<cartQuantity.length;i++){
  if(cartQuantity[i]>stock[i]){
    let index = i
    let product = cart.products[index]
   var title = product.productId.title
   return res.status(205).json({succes:true,title:title})
  }
}



    const userAddress = await Address.findOne({ userId: userId })
    const selectedAddress = userAddress.address.filter((item) => {
      return item._id.toString() === addressId.toString()
    })

    const [{ name, mobile, homeAddress, pinCode, locality, city, state, altPhone }] = selectedAddress
    //const totalAmount = cart.cartTotal
    const totalAmount = discountPriceWithoOrWithout;
    // difference between actual price and discounted price
    const difference = totalShipment - totalAmount
    //const order = await Order.create({})
    // console.log(name, mobile, homeAddress, pinCode, locality, city, state, altPhone)
    const addressData = {
      name: name,
      mobile, mobile,
      homeAddress: homeAddress,
      pinCode: pinCode,
      locality: locality,
      city: city,
      state: state,
      altPhone: altPhone
    }

    const productDetails = cart.products.map((item) => {
      return {
        salePrice: item.total / item.quantity,
        originalItem: item
      }
    })

    var options = {
      amount: totalAmount * 100,  // amount in the smallest currency unit
      currency: "INR",
      receipt: "order_rcptid_11"
    };
    razorpay.orders.create(options, async function(err, razorOrder) {
      if(err){
        console.log("An error happened while creating the order!"+err);
      }else{
        const data = await Order.create({
          orderId:razorOrder.id,
          userId: userId,
          totalAmount: totalAmount-40,
          totalShipment:discountPriceWithoOrWithout,
          paymentMethod: payment,
          appliedCouponValue:difference,
          products: productDetails.map((item) => {
            return {
              salePrice: item.salePrice,
              productId: item.originalItem.productId,
              quantity: item.originalItem.quantity,
              total: item.originalItem.total
            }
          }),
          address: addressData
        })
      }
      // console.log(razorOrder);
      const key_id = process.env.razorpay_key_id
      const secret_key = process.env.razorpay_key_secret
    

  //     const productIdArray = cart.products.map((item) => {
  //       return item.productId;
  //   });
    
  //   const products = await Product.find({ _id: { $in: productIdArray } });
  
  // products.forEach(async (product, index) => {
  //     product.stock = product.stock - cartQuantity[index];
  //     await product.save();
  // });
  

      return res.status(200).json({ succes: true , razorOrder,key_id,secret_key})
    });
    
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
}

const paymentStatus = async (req,res) =>{
  try {
    const userId = req.user.user._id
    const cart = await Cart.findOne({ userId: userId }).populate('products.productId')
   const status = req.query.status
   const orderId = req.query.orderId
   const couponCode = req.query.couponCode
   const order = await Order.findOne({orderId:orderId})
   order.paymentStatus = status
   await order.save()
   if(status === "success"){
    if(couponCode){
    const coupon = await Coupon.findOne({code:couponCode})
    coupon.redeemedUsers.push(userId) 
     await coupon.save()
    }
    
    const productIdArray = cart.products.map((item) => {
      return item.productId;
  });
  const cartQuantity = cart.products.map((item)=>{
    return item.quantity
  })
 

  const products = await Product.find({ _id: { $in: productIdArray } });

products.forEach(async (product, index) => {
    product.stock = product.stock - cartQuantity[index];
    await product.save();
});

    return res.redirect('/order-confirmed')
   
  }
   return res.redirect('/cart/checkout')
   
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
  }

  const placeOrderWallet = async (req,res) =>{
    try {
     const { payment, addressId, discountPrice:discountPriceWithoOrWithout , couponCode , totalShipment } = req.body
     const userId = req.user.user._id;
     const difference =  totalShipment - discountPriceWithoOrWithout
     console.log(discountPriceWithoOrWithout,'//////////////////////////////////////////////');
     const cart = await Cart.findOne({ userId: userId }).populate('products.productId')
     const cartQuantity = cart.products.map((item)=>{
       return item.quantity
     })
    const stock =  cart.products.map((item)=>{
        return item.productId.stock
       })
  
 
  for(let i=0;i<cartQuantity.length;i++){
   if(cartQuantity[i]>stock[i]){
     let index = i
     let product = cart.products[index]
    var title = product.productId.title
    return res.status(205).json({succes:true,title:title})
   }
 }
 
     const wallet = await Wallet.findOne({userId:userId})
      if(wallet.amount===0){
       return res.status(201).json({success:true})
      }
      // fix bug here
      console.log(discountPriceWithoOrWithout)
      console.log(totalShipment);
      if(wallet.amount>=discountPriceWithoOrWithout){
       wallet.amount -= discountPriceWithoOrWithout
       await wallet.save()
      
 
     if(couponCode){
       const coupon = await Coupon.findOne({code:couponCode})
      
       coupon.redeemedUsers.push(userId) 
      await coupon.save()
     }
    
 
     
     const userAddress = await Address.findOne({ userId: userId })
     const selectedAddress = userAddress.address.filter((item) => {
       return item._id.toString() === addressId.toString()
     })
 
     const [{ name, mobile, homeAddress, pinCode, locality, city, state, altPhone }] = selectedAddress
     // const totalAmount = cart.cartTotal
     //const order = await Order.create({})
     // console.log(name, mobile, homeAddress, pinCode, locality, city, state, altPhone)
     const addressData = {
       name: name,
       mobile, mobile,
       homeAddress: homeAddress,
       pinCode: pinCode,
       locality: locality,
       city: city,
       state: state,
       altPhone: altPhone
     }
 
     const productDetails = cart.products.map((item) => {
       return {
         salePrice: item.total / item.quantity,
         originalItem: item
       }
     })
 
     const data = await Order.create({
       userId: userId,
       totalAmount: discountPriceWithoOrWithout-40,
       paymentMethod: payment,
       products: productDetails.map((item) => {
         return {
           salePrice: item.salePrice,
           productId: item.originalItem.productId,
           quantity: item.originalItem.quantity,
           total: item.originalItem.total
         }
       }),
       address: addressData,
       totalShipment:discountPriceWithoOrWithout,
       appliedCouponValue:difference,
       paymentStatus:"success"
     })
 
     
     const productIdArray = cart.products.map((item) => {
       return item.productId;
   });
   
   const products = await Product.find({ _id: { $in: productIdArray } });
 
 products.forEach(async (product, index) => {
     product.stock = product.stock - cartQuantity[index];
     await product.save();
 });
 
 
   
     return res.status(200).json({ succes: true })
   }else{
     return res.status(202).json({success:true})
   }
    } catch (err) {
      next(err); // Pass the error to the next middleware
    }
 }

 const orderConfirmed = async (req, res) => {
  return res.render('USER/orderConfirmed')
}


const orderDetailedView = async(req,res) =>{
  try{
   const orderId = req.params.id
   const order = await Order.findById(orderId).populate('products.productId')
   if(!order){
     return res.status(500).json({err:"order not found in database"})
   }
 //  console.log(order)
  return res.render('USER/orderDetailedView',{order})
  }catch(err){
    next(err); // Pass the error to the next middleware
  }
 }

 const individualOrder = async (req,res) =>{
  const {individualOrderId,orderId,reason} = req.body
  const userId = req.user.user._id
  try{
    const order = await Order.findById(orderId)
     const result = order.products.findIndex((item)=> individualOrderId===item._id.toString())
     order.products[result].cancelStatus=true
     order.products[result].reason=reason;

await order.save()
console.log('//////////////////////////////////////////////////////');
if(order.paymentStatus==="success"){
     let wallet = await Wallet.findOne({userId:userId})
     if(!wallet){
      wallet = new Wallet({
        userId:userId,
        amount:0
      })
     }
     if(order.appliedCouponValue!==0){
      order.products[result].total -= order.appliedCouponValue;
      order.appliedCouponValue = 0
      await order.save()
     }

     const amount = order.products[result].total;
    wallet.amount += amount;
    await wallet.save();
}

return res.status(200).json({success:true})
  // console.log(e);
  }catch (err) {
    next(err); // Pass the error to the next middleware
  }
}
 
module.exports={placeOrderCod,orderConfirmed,orderDetailedView,individualOrder,placeOrderOnlinePayment,paymentStatus,placeOrderWallet}