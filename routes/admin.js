var express = require('express');
var router = express.Router();
const multer = require('../middleware/admin/multerConfig')
const admincontroller = require('../Controller/adminController')
const productManagement = require('../Controller/adminProductManagement')
const categoryMangement = require('../Controller/adminCategoryManagement')
const orderManagement = require('../Controller/adminOrderManagement')
const couponManagement = require('../Controller/adminCouonManagement')
const verifyAdmin = require('../middleware/admin/adminJwt')
const adminLoggedIn = require('../middleware/admin/adminLoggedIn')
// const adminsignin = router.get('/signin',admincontroller.adminsignin)

// const signupsub = router.post('/signupsub',admincontroller.signupsub)
// login
router.get('/',adminLoggedIn,admincontroller.adminlogin)
router.post('/loginsub',admincontroller.loginsub)
router.get('/adminhome',verifyAdmin,admincontroller.adminhome)
router.get('/logOut',admincontroller.logOut)

// user management
router.get('/userslist',admincontroller.userslist)
router.put('/block/:userId',admincontroller.blockuser)
router.put('/unblock/:userId',admincontroller.unblockuser)


// cateegory management
router.get('/productcategories',categoryMangement.productcategories)
router.post('/addcat',categoryMangement.addcat)
router.put('/publish/:id',categoryMangement.publish)
router.get('/updatecat/:id',categoryMangement.updateCat)
router.post('/updatedcat',categoryMangement.updatedCat)

// product management
router.get('/productmanagement',productManagement.productManagement)
router.get('/add-product',productManagement.addProduct)
router.post('/insert-product',multer.fields([{name:'coverImage',maxCount:1},{name:'productImages',maxCount:4}]),productManagement.insertProduct)
router.put('/productpublish/:id',productManagement.productPublish)
router.get('/editproduct/:id',productManagement.editProduct)
router.post('/editedproduct',multer.fields([{name:'coverImage',maxcount:1},{name:'productImages',maxCount:4}]),productManagement.editedProduct)
router.put('/delete-image',productManagement.deleteImage)

// order management
router.get('/order-list',orderManagement.orderList)
router.get('/order-details/:id',orderManagement.orderDetails)
router.put('/update-order-status',orderManagement.updateOrderStatus)

//coupon management
router.get('/coupon-management',couponManagement.couponManagement)
router.get('/add-coupon',couponManagement.addCoupon)
router.post('/insert-coupon',couponManagement.insertCoupon)
router.put('/coupon-status-update',couponManagement.couponStatus)
router.get('/edit-coupon-page/:id',couponManagement.editCouponPage)
router.put('/edit-coupon',couponManagement.editCoupon)

// sales Report
router.get('/sales-report-daily',admincontroller.salesReportDaily)
router.get('/sales-report-weekly',admincontroller.salesReportWeekly)
router.get('/sales-report-monthly',admincontroller.salesReportMonthly)

module.exports = router;
