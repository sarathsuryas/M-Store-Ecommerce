const Product = require('../../model/productSchema'); // Adjust path as needed

const validateCartStock = async (req, res, next) => {
    const cartItems = req.body.cartItems;

    if (!Array.isArray(cartItems)) {
        return res.status(400).json({ error: 'Invalid cart format' });
    }

    try {
        for (const item of cartItems) {
            const { productId, quantity } = item;

            if (!productId || !quantity || isNaN(quantity)) {
                return res.status(400).json({ error: 'Invalid product data in cart' });
            }

            const product = await Product.findById(productId);

            if (!product) {
                return res.status(404).json({ error: `Product not found: ${productId}` });
            }

            if (product.stock < quantity) {
                return res.status(400).json({
                    error: `Insufficient stock for "${product.title}". Available: ${product.stock}, Requested: ${quantity}`
                });
            }
        }

        next(); // All good, proceed
    } catch (err) {
        console.error('Error in validateCartStock middleware:', err);
        res.status(500).json({ error: 'Server error validating cart stock' });
    }
};

module.exports = validateCartStock;
