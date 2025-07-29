
const Order = require('../model/orderSchema');
const Product = require('../model/productSchema');
const Wallet = require('../model/walletSchema')

const orderList = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const no_of_docs_each_page = 5;
    const totalOrders = await Order.countDocuments()
    const totalPages = Math.ceil(totalOrders / no_of_docs_each_page)
    const skip = (page - 1) * no_of_docs_each_page

    const orders = await Order.find().sort({ createdAt: -1 }).skip(skip).limit(no_of_docs_each_page).populate('userId')

    return res.render('ADMIN/orderlist', { orders, page, totalPages })
  } catch (err) {

    next(err); // Pass the error to the next middleware
  }
}

const orderDetails = async (req, res, next) => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({ _id: id }).populate('userId').populate('products.productId')
    console.log(order)

    return res.render('ADMIN/orderDetails', { order })
  } catch (err) {
    next(err); // Pass the error to the next middleware
  }
}

const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId, selectedStatus, userId } = req.body;
    const order = await Order.findOne({ _id: orderId });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    let totalSum = 0;

    if (selectedStatus.toLowerCase() === 'cancelled') {
      for (let item of order.products) {
        // Assuming you have productId stored inside each product item
        const productDoc = await Product.findByIdAndUpdate(
          item.productId, // Use actual Product ID, not subdocument _id
          { $inc: { stock: item.quantity } },
          { new: true }
        );

        item.cancelStatus = true;
        totalSum += item.total;
      }

      // Apply coupon discount if any
      totalSum = totalSum - (order.appliedCouponValue || 0);
      totalSum = Math.max(totalSum, 0); // prevent negative values

      // Save refund to wallet (only if payment was successful)
      if (order.paymentStatus === 'success') {
        const wallet = new Wallet({
          userId,
          orderId,
          amount: totalSum,
          status: true,
        });

        await wallet.save();
      }

      order.orderStatus = 'Cancelled';
    } else {
      // Update to other status (Confirmed, Shipped, etc.)
      order.orderStatus = selectedStatus;
    }

    await order.save();
    return res.status(200).json({ success: true });

  } catch (err) {
    next(err);
  }
};



module.exports = { orderList, orderDetails, updateOrderStatus }