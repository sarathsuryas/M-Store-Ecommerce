const PDFDocument = require('pdfkit');


const salesReport = (req, res,next) => {
    try {
        const { sales } = req.body;
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=sales_report.pdf');

        doc.pipe(res);

        doc.fontSize(18).text('Sales Report', { align: 'center' }).moveDown(1);

        // Table Headers
        doc
            .fontSize(12)
            .text('Date', 50, doc.y, { width: 100, continued: true })
            .text('Order ID', 150, doc.y, { width: 150, continued: true })
            .text('Product Name', 300, doc.y, { width: 150, continued: true })
            .text('Price', 450, doc.y, { width: 50, continued: true })
            .text('Qty', 500, doc.y, { width: 50 });

        doc.moveDown(0.5).moveTo(50, doc.y).lineTo(550, doc.y).stroke().moveDown(0.5);

        // Rows
        sales.forEach((item) => {
            const formattedDate = new Date(item.date).toLocaleDateString();

            doc
                .fontSize(10)
                .text(formattedDate, 50, doc.y, { width: 100, continued: true })
                .text(item.orderId, 150, doc.y, { width: 150, continued: true })
                .text(item.ProductName, 300, doc.y, { width: 150, continued: true })
                .text(`₹${item.price}`, 450, doc.y, { width: 50, continued: true })
                .text(item.quantity, 500, doc.y, { width: 50 });
        });

        doc.end();
    } catch (error) {
        console.error(error)
        next(err)
    }

}

module.exports = salesReport
