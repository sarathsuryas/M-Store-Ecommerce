
const Cart = require('../model/cartSchema')
const Product = require('../model/productSchema')
const Address = require('../model/addressSchema')
const Coupon = require('../model/couponSchema')
const cart = (req,res) =>{

  return res.render('USER/cart')
}

const addToCart = async  (req,res,next) =>{

try{
  
  const {productId,quantity} = req.body

  const userId = req.user.user._id;

  const product = await Product.findById(productId)
 
  if(product.stock!==0){

  //find the user's cart or create a new one if it does not exist
  var cart = await Cart.findOne({userId});

  if(!cart){
    cart = new Cart({userId,products:[]})
  }
   
 const [quantityCheck] = cart.products.filter((v)=>{
  return v.productId.toString() === productId
 })
 if(quantityCheck){
  
  if(quantityCheck.quantity>product.stock ){
    return res.status(202).json({success:true})
  }
}


if(quantityCheck){
  
 if(quantityCheck.quantity < product.stock){
  
  //check if the product is already in the cart 
//
  const existingProductIndex = cart.products.findIndex(
    (product) => product.productId.toString() === productId
  );
  

  if(existingProductIndex !== -1){
    // If the product is already in the cart,update the quantity
    cart.products[existingProductIndex].quantity += quantity;
    //total cart price
   
     
  } else {
    // If the product is not in the cart add it 
    cart.products.push({
      productId,
      quantity
    });
  }
}else{
  return res.status(202).json({success:true})
}
//Calculate the total for each product and update the cart's total

for (const product of cart.products) {
  product.total = await calculateProductTotal(product.productId, product.quantity);
}

await cart.save();
// sum of total cart 
const sum   = cart.products.reduce((a,v)=>{
  return a+v.total;
},0)
cart.cartTotal = sum
cart.totalShipment = sum + 40

await cart.save()

return res.status(200).json({success:true,cart})
 // 
  }else{
    const existingProductIndex = cart.products.findIndex(
      (product) => product.productId.toString() === productId
    );

    if(existingProductIndex !== -1){
      // If the product is already in the cart,update the quantity
      cart.products[existingProductIndex].quantity += quantity;
      //total cart price

  }else {
    // If the product is not in the cart add it 
    cart.products.push({
      productId,
      quantity
    });
  }
  for (const product of cart.products) {
    product.total = await calculateProductTotal(product.productId, product.quantity);
  }

  await cart.save();
// sum of total cart 
const sum   = cart.products.reduce((a,v)=>{
  return a+v.total;
},0)
cart.cartTotal = sum
cart.totalShipment = sum + 40

await cart.save()

return res.status(200).json({success:true,cart})
 
}
  }else if (product.stock <= 0){
    
       return res.status(202).json({success:true})
  }
}catch(err){
  next(err); // Pass the error to the next middleware
}
}
// Helper function to calculate the total for a product 

const calculateProductTotal = async (productId,quantity) =>{
  try{
    //fetch the product details from the Product model
    const product = await Product.findById(productId);

    if(!product){
      throw new Error('Product not found')
    }

    //Calculate the total based on the product price and quantity

    const total = product.price * quantity;
    return total;

    // const cartTotal = async (userId) =>{
    //   const cart = await Cart.findOne({userId:userId})
    //   if(!cart){
    //     throw new Error('cart not found')
    //   }
    //   const total = cart.products.
    // }


  } catch (err){
    next(err); // Pass the error to the next middleware
  }
}

const goToCart = async (req,res,next) => {
  
  try {
    const userId = req.user.user._id;
   // for Identifying in top of the page. page logged or not
  const loggedIn = req.user.user ? true : false;

    const cartOfTheUser = await Cart.findOne({userId:userId}).populate('products.productId')
    const coupon = await Coupon.find()
    const date = new Date()
    
    return res.render('USER/cart', {cart:cartOfTheUser,coupon,date,loggedIn});
  } catch(err) {
    next(err); // Pass the error to the next middleware
  }
};

const updateQuantity = async (req,res) =>{
  
try{

  const {productId,action} = req.body
  console.log(action);
  const userId = req.user.user._id
  const userCart = await Cart.findOne({userId:userId}).populate('products.productId')
  
  if(!userCart) {
    return res.status(404).json({error:"User cart not found"})
  }
  
  const productInCart = userCart.products.find((product)=>{
    return product.productId._id.toString() === productId
  })
  
  //console.log(productInCart);
  if(!productInCart){
    return res.status(404).json({error:"product not found in the cart"})
  }

  if(action === "increase"&&productInCart.quantity<productInCart.productId.stock){
    console.log("here ");
    productInCart.quantity+=1
    await userCart.save()
   const totalIncrease = productInCart.productId.price*productInCart.quantity
    productInCart.total = totalIncrease
    await userCart.save()
  }else if(action === "decrease"){
    if(productInCart.quantity > 1){
      productInCart.quantity-=1;
      await userCart.save()
      const totalDecrease = productInCart.productId.price*productInCart.quantity
      productInCart.total = totalDecrease
      await userCart.save()
    }
  
  }else{
    const value = productInCart.quantity
    return res.status(400).json({ error: "Invalid action provided" ,value});
  }

  const total = userCart.products.reduce((a,v)=>{
    return a+v.total
   },0)
   //console.log(total)
    userCart.cartTotal = total
    userCart.totalShipment = total+40


  await userCart.save()
//console.log(productInCart.total)
//console.log(productInCart.quantity)
  
 // Create a response object with the updated quantity and subtotal
 const response = { 
  quantity: productInCart.quantity,
  total:productInCart.total
};

return res.status(200).json(response);

}catch(err){
  next(err); // Pass the error to the next middleware
}
}

const deleteCart = async (req,res,next) =>{
const userId = req.user.user._id
const {productId} = req.body
  try{
    const cart = await Cart.findOne({userId:userId})
    const productIndex = cart.products.findIndex((product)=>
        product.productId.toString() === productId
    )
    
    if(productIndex!==-1){
     const product = cart.products[productIndex]
     cart.cartTotal -= product.total
     cart.totalShipment = cart.totalShipment-product.total-40
     await cart.save()
   cart.products.splice(productIndex,1);
   
   await cart.save()
   return res.status(200).json({success:true})
    }
  }catch(err){
    next(err); // Pass the error to the next middleware
  }
}

const checkout = async (req,res,next) =>{
  const userId = req.user.user._id;
  try{
    
    const couponCode = req.session.couponCode;
    delete req.session.couponCode;
    
    const cart = await Cart.findOne({userId:userId}).populate('products.productId');
    const address = await Address.findOne({userId:userId})
    
return res.render('USER/checkout2',{cart,address,couponCode})
  }catch(err){
    next(err); // Pass the error to the next middleware
  }
}


module.exports = {cart,addToCart,goToCart,updateQuantity,deleteCart,checkout}