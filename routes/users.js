const express = require('express');
const router = express.Router();
const usercontroller = require("../Controller/userController")
const cartcontroller = require('../Controller/userCartController')
const ordercontroller = require('../Controller/userOrderController')
const addresscontroller = require('../Controller/userAddressController')
const passwordcontroller = require('../Controller/userPasswordReset')
const authenticate = require("../middleware/user/jwt")
const  checkLoggedIn = require("../middleware/user/forLoggedIn")


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

router.get('/purchaseproduct/:id',authenticate,usercontroller.purchaseProduct)
router.get('/shop',authenticate,usercontroller.shop)

// cart 
router.get('/cart',cartcontroller.cart)
router.post('/addtocart',authenticate,cartcontroller.addToCart)
router.get('/gotocart',authenticate,cartcontroller.goToCart)
router.put('/updatequantity',authenticate,cartcontroller.updateQuantity)
router.delete('/deletecart',authenticate,cartcontroller.deleteCart)
router.get('/checkout',authenticate,cartcontroller.checkout)

//order
router.post('/place-order-cod',authenticate,ordercontroller.placeOrderCod)
router.post('/place-order-online-payment',authenticate,ordercontroller.placeOrderOnlinePayment)
router.get('/paymentStatus',authenticate,ordercontroller.paymentStatus)
router.post('/place-order-wallet',authenticate,ordercontroller.placeOrderWallet)
router.get('/order-confirmed',authenticate,ordercontroller.orderConfirmed)
router.get('/order-detailed-view/:id',authenticate,ordercontroller.orderDetailedView)
router.put('/update-individual-order-status',authenticate,ordercontroller.individualOrder)

router.post('/edit-user-account',authenticate,usercontroller.editUserDetails)
router.get('/user-profile',authenticate,usercontroller.userProfile)
// address handlers
router.post('/add-address',authenticate,addresscontroller.addAddress)
router.post('/add-address-from-profile',authenticate,addresscontroller.addAddressFromProfile)
router.get('/edit-address/:id',authenticate,addresscontroller.editAddress)
router.post('/edit-address-data/:id',authenticate,addresscontroller.editAddressData)

// password reset 
router.post('/forgot-password',passwordcontroller.forgotPassword)
router.get('/reset-password',passwordcontroller.resetPassword)
router.post('/reset',passwordcontroller.resetPasswordSubmit)
router.put('/change-password',authenticate,passwordcontroller.changePassword)
router.get('/after-reset',authenticate,passwordcontroller.afterReset)

router.post('/search-product',authenticate,usercontroller.searchProduct)
router.post('/search-input',authenticate,usercontroller.searchInput)
router.get('/search-result',authenticate,usercontroller.searchResult)
// coupon
router.post('/apply-coupon',authenticate,usercontroller.applyCoupon)

module.exports = router;
