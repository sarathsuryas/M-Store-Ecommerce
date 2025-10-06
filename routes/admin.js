var express = require('express');
var router = express.Router();
const multer = require('../middleware/admin/multerConfig')
const admincontroller = require('../Controller/adminController')
const productManagement = require('../Controller/adminProductManagement')
const categoryMangement = require('../Controller/adminCategoryManagement')
const orderManagement = require('../Controller/adminOrderManagement')
const couponManagement = require('../Controller/adminCouonManagement')
const verifyAdmin = require('../middleware/admin/adminJwt')
const adminLoggedIn = require('../middleware/admin/adminLoggedIn');
const salesReport = require('../Controller/salesReport');
// const adminsignin = router.get('/signin',admincontroller.adminsignin)

// const signupsub = router.post('/signupsub',admincontroller.signupsub)
// login
router.get('/', adminLoggedIn, admincontroller.adminlogin)
router.post('/loginsub', admincontroller.loginsub)
router.get('/adminhome', verifyAdmin, admincontroller.adminhome)
router.get('/logOut', admincontroller.logOut)

// user management
router.get('/userslist',verifyAdmin, admincontroller.userslist)
router.put('/block/:userId',verifyAdmin, admincontroller.blockuser)
router.put('/unblock/:userId',verifyAdmin, admincontroller.unblockuser)


// cateegory management
router.get('/productcategories',verifyAdmin, categoryMangement.productcategories)
router.post('/addcat',verifyAdmin, categoryMangement.addcat)
router.put('/publish/:id',verifyAdmin, categoryMangement.publish)
router.get('/updatecat/:id',verifyAdmin, categoryMangement.updateCat)
router.post('/updatedcat', verifyAdmin,categoryMangement.updatedCat)

// product management
router.get('/productmanagement', verifyAdmin, productManagement.productManagement)
router.get('/add-product', verifyAdmin, productManagement.addProduct)
router.post('/insert-product', verifyAdmin, multer.fields([{ name: 'coverImage', maxCount: 1 }, { name: 'productImages', maxCount: 4 }]), productManagement.insertProduct)
router.put('/productpublish/:id',verifyAdmin, productManagement.productPublish)
router.get('/editproduct/:id', verifyAdmin, productManagement.editProduct)
router.post(
    '/editedproduct',
    verifyAdmin,
    multer.any(),  // accept any fields, we'll handle mapping manually
    productManagement.editedProduct
);

router.put('/delete-image',verifyAdmin, productManagement.deleteImage)

// order management
router.get('/order-list',verifyAdmin, orderManagement.orderList)
router.get('/order-details/:id',verifyAdmin, orderManagement.orderDetails)
router.put('/update-order-status',verifyAdmin, orderManagement.updateOrderStatus)

//coupon management
router.get('/coupon-management',verifyAdmin, couponManagement.couponManagement)
router.get('/add-coupon', verifyAdmin,couponManagement.addCoupon)
router.post('/insert-coupon', verifyAdmin,couponManagement.insertCoupon)
router.put('/coupon-status-update', couponManagement.couponStatus)
router.get('/edit-coupon-page/:id',verifyAdmin, couponManagement.editCouponPage)
router.put('/edit-coupon',verifyAdmin, couponManagement.editCoupon)

// sales Report
router.get('/sales-report-daily',verifyAdmin, admincontroller.salesReportDaily)
router.get('/sales-report-weekly',verifyAdmin, admincontroller.salesReportWeekly)
router.get('/sales-report-monthly', verifyAdmin,admincontroller.salesReportMonthly)
router.post('/generate-pdf',verifyAdmin, salesReport)


module.exports = router;
