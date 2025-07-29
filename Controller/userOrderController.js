

const Product = require('../model/productSchema')
const Address = require('../model/addressSchema')
const Order = require('../model/orderSchema')
const Cart = require('../model/cartSchema');
var randtoken = require('rand-token');
var razorpay = require('../utils/razorpay');
const Coupon = require('../model/couponSchema');
const Wallet = require('../model/walletSchema');
const WalletBalance = require('../model/walletBalanceShema');


const placeOrderCod = async (req, res,next) => {
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

   cart.products = []

  await cart.save()
    return res.status(200).json({ succes: true })
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
}

const placeOrderOnlinePayment = async (req,res,next) =>{
  try {
    const { payment, addressId, discountPrice:discountPriceWithoOrWithout,couponCode, totalShipment } = req.body
   
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
          couponCode:couponCode,
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

const paymentStatus = async (req,res,next) =>{
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
cart.products = []

await cart.save()
    return res.redirect('/order-confirmed')
   
  }
   return res.redirect('/checkout')
   
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
  }

  const placeOrderWallet = async (req,res,next) =>{
    try {
     const { payment, addressId, discountPrice:discountPriceWithoOrWithout , couponCode , totalShipment } = req.body
     const userId = req.user.user._id;
     const difference =  totalShipment - discountPriceWithoOrWithout
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
     const walletBalance = await WalletBalance.findOne({userId:userId})
    
      if(!walletBalance||walletBalance.amount===0){
       return res.status(206).json({success:true})
      }
      // fix bug here
      console.log(discountPriceWithoOrWithout)
      console.log(totalShipment);
      if(walletBalance.amount>=discountPriceWithoOrWithout){
       walletBalance.amount -= discountPriceWithoOrWithout
       await walletBalance.save()
      
 
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
       paymentStatus:"success",
       couponCode:couponCode
     })
 
     
     const productIdArray = cart.products.map((item) => {
       return item.productId;
   });
   
   const products = await Product.find({ _id: { $in: productIdArray } });
 
 products.forEach(async (product, index) => {
     product.stock = product.stock - cartQuantity[index];
     await product.save();
 });
 
 cart.products = []

 await cart.save()
   
     return res.status(200).json({ succes: true })
   }else{
     return res.status(202).json({success:true})
   }
    } catch (err) {
      next(err); // Pass the error to the next middleware
    }
 }

 const orderConfirmed = async (req, res,next) => {
  return res.render('USER/orderConfirmed')
}


const orderDetailedView = async(req,res,next) =>{
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

 const individualOrder = async (req, res, next) => {
   
   try {
    const { individualOrderId, orderId, reason, productId, quantity, couponCode } = req.body;
    const userId = req.user.user._id;
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    const productIndex = order.products.findIndex(
      (item) => individualOrderId === item._id.toString()
    );

    if (productIndex === -1) {
      return res.status(400).json({ success: false, message: 'Product not found in order' });
    }

    const canceledProduct = order.products[productIndex];
    if (canceledProduct.cancelStatus === true) {
      return res.status(400).json({ success: false, message: 'Product already cancelled' });
    }

    // Mark the item as cancelled
    canceledProduct.cancelStatus = true;
    canceledProduct.reason = reason;

    const total = canceledProduct.total;
    const originalShipment = order.totalShipment;
    let totalBeforeCoupon = 0;

    // Handle coupon logic
    let coupon;
    if (couponCode && couponCode.trim() !== "") {
      coupon = await Coupon.findOne({ code: couponCode });
    }
       
    if (coupon && order.paymentStatus.toLowerCase() === "pending") {
      if (coupon.discountType === 'fixedAmount') {
        totalBeforeCoupon = originalShipment - total + coupon.discountAmtOrPercentage;
      } else if (coupon.discountType === 'percentage') {
         let beforeTotal = originalShipment - total 
        const percentageAmount =  beforeTotal * coupon.discountAmtOrPercentage / 100
         const min = Math.min(percentageAmount , coupon.maxRedeemableAmt)
        totalBeforeCoupon = originalShipment - total + min
       
      }

      if (coupon.minOrderAmount < totalBeforeCoupon) {
        // Only apply discount if the adjusted total meets the coupon minimum
        order.totalShipment = totalBeforeCoupon - (coupon.discountType === 'fixedAmount'
          ? coupon.discountAmtOrPercentage
          : coupon.maxRedeemableAmt);
      } else {
        // Cancelled item caused coupon to become invalid
        order.appliedCouponValue = 0;
        order.totalShipment = totalBeforeCoupon;
      }
    } else if (coupon && order.paymentStatus.toLowerCase() === 'success') {
       const couponId = coupon?._id
       
       const wallet = new Wallet({ userId,productId, orderId,couponId, amount: 0 });
       const walletBalance = new WalletBalance({userId,amount:0})


      let refundAmount = canceledProduct.total - order.appliedCouponValue;
      wallet.status = true
      wallet.amount = refundAmount 
      walletBalance.amount+=refundAmount
      order.appliedCouponValue = 0
      await walletBalance.save()
      await wallet.save();
    } else if (order.paymentStatus.toLowerCase() === 'success') {
       console.log(req.body,'/////////////////////')
       const wallet = new Wallet({ userId,productId, orderId, amount: 0 });
       const walletBalance = new WalletBalance({userId,amount:0})


      let refundAmount = canceledProduct.total - order.appliedCouponValue;
      wallet.status = true
      wallet.amount = refundAmount 
      walletBalance.amount+=refundAmount
      order.appliedCouponValue = 0
      await walletBalance.save()
      await wallet.save();

    }
    
    else {
      order.totalShipment = originalShipment - total;
    }
    const productArraylength =  order.products.length
    const result = order.products.filter((item)=>item.cancelStatus === true).length       
    if(productArraylength === result) order.orderStatus = "Cancelled"

    await order.save();

    // Restore stock
    const product = await Product.findById(productId);
    if (product) {
      product.stock += parseInt(quantity);
      await product.save();
    }

    
    return res.status(200).json({ success: true });

  } catch (err) {
    console.error(err)
    next(err);
  }
};

 
module.exports={placeOrderCod,orderConfirmed,orderDetailedView,individualOrder,placeOrderOnlinePayment,paymentStatus,placeOrderWallet}