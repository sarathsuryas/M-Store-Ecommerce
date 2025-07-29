const express = require('express');
const router = express.Router();
const usercontroller = require("../Controller/userController")
const cartcontroller = require('../Controller/userCartController')
const ordercontroller = require('../Controller/userOrderController')
const addresscontroller = require('../Controller/userAddressController')
const passwordcontroller = require('../Controller/userPasswordReset')
const authenticate = require("../middleware/user/jwt")
const  checkLoggedIn = require("../middleware/user/forLoggedIn")
const validateCartStock = require("../middleware/user/validateCartStock");
const checkBlocked = require('../middleware/user/isBlocked');

/* GET users listing. */
// user authentications
router.get('/',usercontroller.userhome)
router.get('/get-login',checkLoggedIn,usercontroller.userlogin)
router.post('/loginsub',usercontroller.loginsub) 
router.get('/logout',usercontroller.logout)

router.get('/signup',checkLoggedIn,usercontroller.userSignup)
router.post('/signupsub',usercontroller.signupsub)
router.get('/otp-modal',checkLoggedIn,usercontroller.otpModal)
router.post('/userauth',usercontroller.userauth)

router.get('/purchaseproduct/:id',authenticate,checkBlocked,usercontroller.purchaseProduct)
router.get('/shop',authenticate,checkBlocked,usercontroller.shop)

// cart 

router.post('/addtocart',authenticate,checkBlocked,cartcontroller.addToCart)
router.get('/gotocart',authenticate,checkBlocked,cartcontroller.goToCart)
router.put('/updatequantity',authenticate,checkBlocked,cartcontroller.updateQuantity)
router.delete('/deletecart',authenticate,checkBlocked,cartcontroller.deleteCart)

router.get('/checkout',authenticate,checkBlocked,cartcontroller.checkout)
.post('/checkout',authenticate,checkBlocked,validateCartStock,cartcontroller.postCheckOut)

//order
router.post('/place-order-cod',authenticate,checkBlocked,ordercontroller.placeOrderCod)
router.post('/place-order-online-payment',authenticate,checkBlocked,ordercontroller.placeOrderOnlinePayment)
router.get('/paymentStatus',authenticate,checkBlocked,ordercontroller.paymentStatus)
router.post('/place-order-wallet',authenticate,checkBlocked,ordercontroller.placeOrderWallet)
router.get('/order-confirmed',authenticate,checkBlocked,ordercontroller.orderConfirmed)
router.get('/order-detailed-view/:id',authenticate,checkBlocked,ordercontroller.orderDetailedView)
router.put('/update-individual-order-status',authenticate,checkBlocked,ordercontroller.individualOrder)

router.post('/edit-user-account',authenticate,checkBlocked,usercontroller.editUserDetails)
router.get('/user-profile',authenticate,checkBlocked,usercontroller.userProfile)
// address handlers
router.post('/add-address',authenticate,checkBlocked,addresscontroller.addAddress)
router.post('/add-address-from-profile',authenticate,checkBlocked,addresscontroller.addAddressFromProfile)
router.get('/edit-address/:id',authenticate,checkBlocked,addresscontroller.editAddress)
router.post('/edit-address-data/:id',authenticate,checkBlocked,addresscontroller.editAddressData)

// password reset 
router.post('/forgot-password',passwordcontroller.forgotPassword)
router.get('/reset-password',passwordcontroller.resetPassword)
router.post('/reset',passwordcontroller.resetPasswordSubmit)
router.put('/change-password',authenticate,checkBlocked,passwordcontroller.changePassword)
router.get('/after-reset',authenticate,checkBlocked,passwordcontroller.afterReset)

router.post('/search-product',usercontroller.searchProduct)
router.post('/search-input',usercontroller.searchInput)
router.get('/search-result',usercontroller.searchResult)
// coupon
router.post('/apply-coupon',authenticate,usercontroller.applyCoupon)

module.exports = router;
