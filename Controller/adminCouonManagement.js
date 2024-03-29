
const Coupon = require('../model/couponSchema')
const bcrypt = require('bcrypt')


const couponManagement = async (req,res,next) => {
  try {

    const page = parseInt(req.query.page) || 1; // Default to page 1 if pageNo is not provided
    const no_of_docs_each_page = 4;

    const totalCoupons = await Coupon.countDocuments();
    const totalPages = Math.ceil(totalCoupons / no_of_docs_each_page);

    const skip = (page - 1) * no_of_docs_each_page;

    const coupon = await Coupon
      .find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(no_of_docs_each_page).exec();



   // const coupon = await Coupon.find()
    return res.render('ADMIN/couponManagement',{coupon,totalPages,page})
  } catch (err) {
    next(err); // Pass the error to the next middleware

  }
}


const addCoupon = async (req,res,next) =>{
  const error = req.session.value 
  delete req.session.value 
  return res.render('ADMIN/addCoupon',{error})
}

const insertCoupon = async (req, res) => {
  try {
    const { couponCode, discountType, discountAmtOrPercentage, minOrderAmount, expirationDate,redeemableAmount } = req.body;
    console.log(couponCode, discountType,discountAmtOrPercentage, minOrderAmount, expirationDate,redeemableAmount);
    const data = await Coupon.findOne({code:couponCode})
    if(!data){
    const coupon = new Coupon({
      code: couponCode,
      discountType: discountType,
      discountAmtOrPercentage: discountAmtOrPercentage,
      minOrderAmount: minOrderAmount,
      expirationDate: expirationDate,
      maxRedeemableAmt:redeemableAmount
    });
    
    await coupon.save();
  }   

  if(data){
    req.session.value = "Coupon exist"
    return res.redirect('/admin/add-coupon')
  }
    return res.redirect('/admin/coupon-management');
  } catch (err) {
    next(err); // Pass the error to the next middleware

  }
};


const couponStatus = async (req,res,next) => {
  try {
    const {couponId} = req.body
   const coupon = await Coupon.findById(couponId)
   if(coupon.isActive==="Active"){
    coupon.isActive="inActive"
   }else{
    coupon.isActive="Active"
   }
   await coupon.save()
   return res.status(200).json({success:true})
  } catch (err) {
    next(err); // Pass the error to the next middleware

  }
}


const editCouponPage = async (req,res,next) =>{
  try {
   const couponId = req.params.id
   const coupon = await Coupon.findById(couponId)
   return res.render('ADMIN/editCoupon',{coupon})
  } catch (err) {
    next(err); // Pass the error to the next middleware

  }
   
 }


 const editCoupon = async (req,res,next) =>{
  try {
    const {couponId,couponCode,discountType,redeemableAmount,discountAmtOrPercentage,minOrderAmount,expirationDate} = req.body;
    const coupon = await Coupon.findOne({_id:couponId})
   
    coupon.code=couponCode
    coupon.discountType = discountType
    coupon.discountAmtOrPercentage=discountAmtOrPercentage
    coupon.minOrderAmount = minOrderAmount
    coupon.expirationDate = expirationDate
    coupon.maxRedeemableAmt = redeemableAmount


    await coupon.save()

    return res.status(200).json({succes:true})
  } catch (err) {
    next(err); // Pass the error to the next middleware

  }
}



module.exports = {couponManagement, addCoupon, insertCoupon, editCouponPage, couponStatus, editCoupon}