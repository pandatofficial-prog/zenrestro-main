const express = require('express');
const router = express.Router();
const Bill = require('../models/Bill');
const Order = require('../models/Order');
const Restaurant = require('../models/Restaurant');
const { protect, admin } = require('../middleware/auth');
const PDFDocument = require('pdfkit');
const axios = require('axios');

// Generate bill number
const generateBillNumber = async (restaurantId) => {
  const count = await Bill.countDocuments({ restaurantId });
  const billNumber = `BILL-${String(count + 1).padStart(6, '0')}`;
  return billNumber;
};

// Get restaurant ID helper
const getRestaurantId = (req) => {
  return req.user.role === 'superadmin' 
    ? req.query.restaurantId || req.body.restaurantId 
    : req.user.restaurantId;
};

// @route   GET /api/bills
// @desc    Get all bills for a restaurant
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let restaurantId = getRestaurantId(req);
    const { startDate, endDate, paymentStatus, orderId, searchTerm, page = 1, limit = 50 } = req.query;

    // Fix for superadmin navigation: if restaurantId is missing but orderId is present,
    // find the restaurantId from the order to keep the query valid.
    if (!restaurantId && orderId && req.user.role === 'superadmin') {
      const order = await Order.findById(orderId);
      if (order) restaurantId = order.restaurantId;
    }

    let query = {};
    if (restaurantId) query.restaurantId = restaurantId;
    if (orderId) query.orderId = orderId;
    
    if (searchTerm) {
      query.$or = [
        { billNumber: { $regex: searchTerm, $options: 'i' } },
        { 'orderId.orderType': { $regex: searchTerm, $options: 'i' } } // Note: This requires aggregation if we want to filter by populated field, but let's stick to billNumber for now or just simple regex if possible.
      ];
      // Actually, since orderId is populated later, we can't easily $or with it in a single .find() without aggregate.
      // Let's just do billNumber for now as it's the most common search.
      query.billNumber = { $regex: searchTerm, $options: 'i' };
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        const start = new Date(startDate);
        if (isNaN(start.getTime())) {
          return res.status(400).json({ message: 'Invalid startDate format' });
        }
        query.createdAt.$gte = start;
      }
      if (endDate) {
        const end = new Date(endDate);
        if (isNaN(end.getTime())) {
          return res.status(400).json({ message: 'Invalid endDate format' });
        }
        query.createdAt.$lte = end;
      }
    }
    if (paymentStatus && ['paid', 'pending', 'refunded'].includes(paymentStatus)) {
      query.paymentStatus = paymentStatus;
    }

    const bills = await Bill.find(query)
      .populate('orderId', 'orderType tableNumber customerName')
      .populate('restaurantId', 'name address phone gstin isGstVerified')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Bill.countDocuments(query);

    res.json({
      bills,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bills/order/:orderId
// @desc    Get bill by order ID
// @access  Private
router.get('/order/:orderId', protect, async (req, res) => {
  try {
    const bill = await Bill.findOne({ orderId: req.params.orderId })
      .populate('orderId')
      .populate('restaurantId', 'name address phone gstin isGstVerified');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check authorization
    if (req.user.role !== 'superadmin' && bill.restaurantId._id.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this bill' });
    }
    
    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bills/:id
// @desc    Get single bill
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('orderId')
      .populate('restaurantId', 'name address phone gstin isGstVerified');
    
    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check authorization
    if (req.user.role !== 'superadmin' && bill.restaurantId._id.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this bill' });
    }
    
    res.json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/bills
// @desc    Create a new bill from order
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    let restaurantId = getRestaurantId(req);

    // Fallback for superadmin if no restaurantId provided
    if (req.user.role === 'superadmin' && !restaurantId) {
      let firstRestaurant = await Restaurant.findOne();
      if (!firstRestaurant) {
        // Auto-bootstrap restaurant if DB is totally empty
        firstRestaurant = await Restaurant.create({
          name: 'Demo Restaurant',
          address: '123 Main Street, City',
          phone: '+91 9876543210',
          email: 'demo@restaurant.com',
          taxRate: 18,
          isActive: true,
        });
      }
      if (firstRestaurant) restaurantId = firstRestaurant._id;
    }

    if (!restaurantId) {
      return res.status(400).json({ message: 'Restaurant ID is required' });
    }

    const { orderId: bodyOrderId, id: bodyId, items, discount, discountType, paymentMethod, splitDetails, taxRate: manualTaxRate, taxLabel: manualTaxLabel } = req.body;
    const orderId = bodyOrderId || bodyId;

    // Validate inputs
    if (!orderId) {
      return res.status(400).json({ message: 'Order ID is required' });
    }

    if (paymentMethod && !['cash', 'card', 'upi', 'wallet', 'check'].includes(paymentMethod)) {
      return res.status(400).json({ message: 'Invalid payment method' });
    }

    if (discount !== undefined && discount < 0) {
      return res.status(400).json({ message: 'Discount cannot be negative' });
    }

    if (discountType && !['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ message: 'Invalid discount type' });
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if bill already exists
    if (order.billId) {
      return res.status(400).json({ message: 'Bill already exists for this order' });
    }

    // Get tax rate and label (Priority: body > order > restaurant)
    const restaurant = await Restaurant.findById(restaurantId);
    const taxRate = manualTaxRate !== undefined ? parseFloat(manualTaxRate) : (order.taxRate !== undefined ? order.taxRate : (restaurant?.taxRate || 18));
    const taxLabel = manualTaxLabel || order.taxLabel || 'GST';

    // Use provided items or order items
    let billItems = items || order.items;
    let subtotal = billItems.reduce((sum, item) => sum + item.total, 0);

    // Calculate discount
    let discountAmount = 0;
    const finalDiscountType = discountType || order.discountType || 'percentage';
    const finalDiscount = discount !== undefined ? discount : (order.discount || 0);

    if (finalDiscount > 0) {
      if (finalDiscountType === 'percentage') {
        if (finalDiscount > 100) {
          return res.status(400).json({ message: 'Discount percentage cannot exceed 100' });
        }
        discountAmount = (subtotal * finalDiscount) / 100;
      } else {
        if (finalDiscount > subtotal) {
          return res.status(400).json({ message: 'Fixed discount cannot exceed subtotal' });
        }
        discountAmount = finalDiscount;
      }
    }

    // Calculate tax
    const taxableAmount = subtotal - discountAmount;
    const tax = (taxableAmount * taxRate) / 100;
    const total = taxableAmount + tax;

    // Generate bill number
    const billNumber = await generateBillNumber(restaurantId);

    const bill = await Bill.create({
      restaurantId,
      orderId: order._id,
      billNumber,
      gstin: restaurant?.gstin || '',
      items: billItems,
      subtotal,
      tax,
      taxRate,
      taxLabel,
      discount: discountAmount,
      discountType: finalDiscountType,
      total,
      paymentMethod: paymentMethod || 'cash',
      paymentStatus: 'paid',
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      tableNumber: order.tableNumber,
      splitDetails,
    });

    // Update order with bill
    order.billId = bill._id;
    order.paymentStatus = 'paid';
    order.paymentMethod = paymentMethod || 'cash';
    order.status = 'delivered';
    await order.save();

    res.status(201).json(bill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/bills/:id
// @desc    Update/Edit a bill
// @access  Private
router.put('/:id', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('restaurantId', 'name address phone gstin isGstVerified');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check authorization
    if (req.user.role !== 'superadmin' && bill.restaurantId._id.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this bill' });
    }

    const { items, discount, discountType, paymentMethod, splitDetails, taxRate, taxLabel, customerGstin } = req.body;

    // Recalculate if items changed
    if (items) {
      let subtotal = items.reduce((sum, item) => sum + item.total, 0);
      
      // Calculate discount
      let discountAmount = 0;
      const finalDiscountType = discountType || bill.discountType || 'percentage';
      const finalDiscount = discount !== undefined ? discount : bill.discount;

      if (finalDiscount > 0) {
        if (finalDiscountType === 'percentage') {
          discountAmount = (subtotal * finalDiscount) / 100;
        } else {
          discountAmount = finalDiscount;
        }
      }

      // Calculate tax
      const finalTaxRate = taxRate !== undefined ? taxRate : (bill.taxRate || 18);
      const finalTaxLabel = taxLabel || bill.taxLabel || 'GST';
      const taxableAmount = subtotal - discountAmount;
      const tax = (taxableAmount * finalTaxRate) / 100;
      const total = taxableAmount + tax;

      bill.items = items;
      bill.subtotal = subtotal;
      bill.discount = discountAmount;
      bill.discountType = finalDiscountType;
      bill.taxRate = finalTaxRate;
      bill.taxLabel = finalTaxLabel;
      bill.tax = tax;
      bill.total = total;
    }

    if (paymentMethod) bill.paymentMethod = paymentMethod;
    if (splitDetails) bill.splitDetails = splitDetails;
    if (customerGstin !== undefined) bill.customerGstin = customerGstin;
    if (taxRate !== undefined && !items) {
      // Recalculate if only tax rate changed
      const taxableAmount = bill.subtotal - bill.discount;
      bill.taxRate = taxRate;
      bill.tax = (taxableAmount * taxRate) / 100;
      bill.total = taxableAmount + bill.tax;
    }

    const updatedBill = await bill.save();

    // Also update the associated order
    if (bill.orderId) {
      await Order.findByIdAndUpdate(bill.orderId, {
        items: bill.items,
        subtotal: bill.subtotal,
        tax: bill.tax,
        discount: bill.discount,
        total: bill.total,
      });
    }

    res.json(updatedBill);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/bills/:id
// @desc    Cancel/Refund a bill
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id);

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check authorization
    if (req.user.role !== 'superadmin' && bill.restaurantId.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to refund this bill' });
    }

    bill.paymentStatus = 'refunded';
    await bill.save();

    // Update associated order
    if (bill.orderId) {
      await Order.findByIdAndUpdate(bill.orderId, {
        paymentStatus: 'refunded',
        status: 'cancelled',
      });
    }

    res.json({ message: 'Bill refunded', bill });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/bills/:id/gst-invoice
// @desc    Generate GST Invoice PDF
// @access  Private
router.get('/:id/gst-invoice', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('restaurantId', 'name address phone gstin email')
      .populate('orderId', 'orderType tableNumber customerName');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check authorization
    if (req.user.role !== 'superadmin' && bill.restaurantId._id.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized to generate invoice for this bill' });
    }

    // Create PDF document
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=GST-Invoice-${bill.billNumber}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', { align: 'center' });
    doc.moveDown(0.5);

    // Restaurant Details
    doc.fontSize(12).font('Helvetica-Bold').text(bill.restaurantId.name);
    doc.fontSize(10).font('Helvetica').text(bill.restaurantId.address);
    doc.text(`Phone: ${bill.restaurantId.phone}`);
    if (bill.restaurantId.email) {
      doc.text(`Email: ${bill.restaurantId.email}`);
    }
    if (bill.restaurantId.gstin) {
      doc.font('Helvetica-Bold').text(`GSTIN: ${bill.restaurantId.gstin}`);
    }
    doc.moveDown(1);

    // Invoice Details
    doc.fontSize(10).font('Helvetica');
    const invoiceY = doc.y;
    doc.text(`Invoice No: ${bill.billNumber}`, 50, invoiceY);
    doc.text(`Date: ${new Date(bill.createdAt).toLocaleDateString('en-IN')}`, 350, invoiceY);
    doc.text(`Order Type: ${bill.orderId?.orderType?.replace('_', ' ').toUpperCase() || 'N/A'}`, 50, invoiceY + 15);
    if (bill.orderId?.tableNumber) {
      doc.text(`Table: ${bill.orderId.tableNumber}`, 350, invoiceY + 15);
    }
    doc.moveDown(2);

    // Customer Details
    if (bill.customerName || bill.customerGstin) {
      doc.font('Helvetica-Bold').text('Bill To:');
      doc.font('Helvetica');
      if (bill.customerName) doc.text(bill.customerName);
      if (bill.customerPhone) doc.text(`Phone: ${bill.customerPhone}`);
      if (bill.customerGstin) doc.font('Helvetica-Bold').text(`GSTIN: ${bill.customerGstin}`);
      doc.moveDown(1);
    }

    // Line separator
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Table Header
    const tableTop = doc.y;
    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('Item', 50, tableTop);
    doc.text('Qty', 300, tableTop, { width: 50, align: 'center' });
    doc.text('Price', 370, tableTop, { width: 80, align: 'right' });
    doc.text('Amount', 470, tableTop, { width: 80, align: 'right' });
    
    doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
    doc.moveDown(1);

    // Items
    doc.font('Helvetica').fontSize(9);
    let yPosition = doc.y;
    
    bill.items.forEach((item) => {
      if (yPosition > 700) {
        doc.addPage();
        yPosition = 50;
      }
      
      doc.text(item.name, 50, yPosition, { width: 240 });
      doc.text(item.quantity.toString(), 300, yPosition, { width: 50, align: 'center' });
      doc.text(`₹${item.price.toFixed(2)}`, 370, yPosition, { width: 80, align: 'right' });
      doc.text(`₹${item.total.toFixed(2)}`, 470, yPosition, { width: 80, align: 'right' });
      yPosition += 20;
    });

    doc.moveDown(1);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    // Totals
    const totalsX = 370;
    doc.font('Helvetica').fontSize(10);
    
    doc.text('Subtotal:', totalsX, doc.y, { width: 100, align: 'left' });
    doc.text(`₹${bill.subtotal.toFixed(2)}`, 470, doc.y, { width: 80, align: 'right' });
    doc.moveDown(0.5);

    if (bill.discount > 0) {
      doc.text('Discount:', totalsX, doc.y, { width: 100, align: 'left' });
      doc.text(`-₹${bill.discount.toFixed(2)}`, 470, doc.y, { width: 80, align: 'right' });
      doc.moveDown(0.5);
    }

    const taxableAmount = bill.subtotal - bill.discount;
    doc.text('Taxable Amount:', totalsX, doc.y, { width: 100, align: 'left' });
    doc.text(`₹${taxableAmount.toFixed(2)}`, 470, doc.y, { width: 80, align: 'right' });
    doc.moveDown(0.5);

    // GST Breakdown
    const cgst = bill.tax / 2;
    const sgst = bill.tax / 2;
    
    doc.text(`CGST (${(bill.taxRate / 2).toFixed(1)}%):`, totalsX, doc.y, { width: 100, align: 'left' });
    doc.text(`₹${cgst.toFixed(2)}`, 470, doc.y, { width: 80, align: 'right' });
    doc.moveDown(0.5);

    doc.text(`SGST (${(bill.taxRate / 2).toFixed(1)}%):`, totalsX, doc.y, { width: 100, align: 'left' });
    doc.text(`₹${sgst.toFixed(2)}`, 470, doc.y, { width: 80, align: 'right' });
    doc.moveDown(0.5);

    doc.moveTo(370, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown(0.5);

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('Total:', totalsX, doc.y, { width: 100, align: 'left' });
    doc.text(`₹${bill.total.toFixed(2)}`, 470, doc.y, { width: 80, align: 'right' });

    // Footer
    doc.fontSize(8).font('Helvetica').text(
      'This is a computer-generated invoice and does not require a signature.',
      50,
      750,
      { align: 'center', width: 500 }
    );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error generating GST invoice:', error);
    res.status(500).json({ message: 'Error generating GST invoice' });
  }
});

// @route   POST /api/bills/:id/send-whatsapp
// @desc    Send bill via WhatsApp
// @access  Private
router.post('/:id/send-whatsapp', protect, async (req, res) => {
  try {
    const bill = await Bill.findById(req.params.id)
      .populate('restaurantId', 'name phone')
      .populate('orderId');

    if (!bill) {
      return res.status(404).json({ message: 'Bill not found' });
    }

    // Check authorization
    if (req.user.role !== 'superadmin' && bill.restaurantId._id.toString() !== req.user.restaurantId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    if (!bill.customerPhone) {
      return res.status(400).json({ message: 'Customer phone number not available' });
    }

    // Format bill message
    const message = `
*${bill.restaurantId.name}*
Bill No: ${bill.billNumber}
Date: ${new Date(bill.createdAt).toLocaleDateString('en-IN')}

*Items:*
${bill.items.map(item => `${item.quantity}x ${item.name} - ₹${item.total}`).join('\n')}

Subtotal: ₹${bill.subtotal}
${bill.discount > 0 ? `Discount: -₹${bill.discount}\n` : ''}GST (${bill.taxRate}%): ₹${bill.tax}
*Total: ₹${bill.total}*

Payment Method: ${bill.paymentMethod.toUpperCase()}

Thank you for your order!
    `.trim();

    // WhatsApp API integration
    // Note: You need to configure WhatsApp Business API credentials in .env
    const whatsappApiUrl = process.env.WHATSAPP_API_URL;
    const whatsappApiKey = process.env.WHATSAPP_API_KEY;

    if (!whatsappApiUrl || !whatsappApiKey) {
      return res.status(500).json({
        message: 'WhatsApp API not configured. Please add WHATSAPP_API_URL and WHATSAPP_API_KEY to .env file'
      });
    }

    // Send WhatsApp message
    // This is a generic implementation - adjust based on your WhatsApp API provider
    const response = await axios.post(
      whatsappApiUrl,
      {
        phone: bill.customerPhone,
        message: message,
      },
      {
        headers: {
          'Authorization': `Bearer ${whatsappApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({
      message: 'Bill sent via WhatsApp successfully',
      whatsappResponse: response.data
    });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({
      message: 'Error sending WhatsApp message',
      error: error.message
    });
  }
});

// @route   POST /api/bills/generate-bill
// @desc    Generate 80mm Thermal Receipt PDF from payload
// @access  Private
router.post('/generate-bill', protect, async (req, res) => {
  try {
    const { restaurant, items, totals, orderDetails } = req.body;

    // 80mm is approx 226 points. We use a long height (e.g., 800) which some thermal systems auto-crop.
    const doc = new PDFDocument({ 
      margin: 15, 
      size: [226, 800] 
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=thermal-receipt.pdf');
    
    doc.pipe(res);

    const margin = 15;

    const drawLine = () => {
      doc.moveDown(0.5);
      doc.font('Courier').fontSize(8).text('-'.repeat(32), margin, doc.y, { align: 'center' });
      doc.moveDown(0.5);
    };

    // Header
    doc.font('Helvetica-Bold').fontSize(14).text(restaurant?.name || 'Restaurant Name', { align: 'center' });
    doc.font('Helvetica').fontSize(9).text(restaurant?.address || '', { align: 'center' });
    if(restaurant?.phone) doc.text(`Tel: ${restaurant.phone}`, { align: 'center' });
    if(restaurant?.gstin) doc.text(`GSTIN: ${restaurant.gstin}`, { align: 'center' });
    
    drawLine();

    // Order Details
    doc.fontSize(9).font('Helvetica-Bold');
    doc.text(`Receipt: ${orderDetails?.billNumber || 'NEW'}`);
    doc.font('Helvetica');
    doc.text(`Date: ${new Date().toLocaleString('en-IN')}`);
    doc.text(`Type: ${orderDetails?.orderType?.toUpperCase() || 'DINE IN'}`);
    if (orderDetails?.tableNumber) doc.text(`Table: ${orderDetails.tableNumber}`);

    drawLine();

    // Items Header
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('Qty  Item', margin, doc.y, { continued: true });
    doc.text('Total', { align: 'right' });
    doc.moveDown(0.5);

    doc.font('Helvetica').fontSize(9);
    if (items && items.length > 0) {
      items.forEach(item => {
        const qtyStr = `${item.quantity}x`.padEnd(4, ' ');
        doc.text(`${qtyStr} ${item.name}`, margin, doc.y, { width: 140, align: 'left' });
        doc.moveUp();
        doc.text(Number(item.total).toFixed(2), { align: 'right' });
        doc.moveDown(0.2);
      });
    }

    drawLine();

    // Totals
    doc.text('Subtotal:', margin, doc.y, { continued: true });
    doc.text(Number(totals?.subtotal || 0).toFixed(2), { align: 'right' });
    doc.moveDown(0.3);

    if (totals?.discount > 0) {
      doc.text('Discount:', margin, doc.y, { continued: true });
      doc.text(`-${Number(totals.discount).toFixed(2)}`, { align: 'right' });
      doc.moveDown(0.3);
    }

    if (totals?.tax > 0) {
      doc.text('CGST:', margin, doc.y, { continued: true });
      doc.text(Number(totals.cgst || totals.tax/2).toFixed(2), { align: 'right' });
      doc.moveDown(0.3);
      doc.text('SGST:', margin, doc.y, { continued: true });
      doc.text(Number(totals.sgst || totals.tax/2).toFixed(2), { align: 'right' });
      doc.moveDown(0.3);
    }

    drawLine();

    doc.font('Helvetica-Bold').fontSize(12);
    doc.text('TOTAL:', margin, doc.y, { continued: true });
    doc.text(Number(totals?.finalTotal || totals?.total || 0).toFixed(2), { align: 'right' });

    doc.moveDown(1.5);
    doc.font('Helvetica').fontSize(9).text('Thank you for your visit!', { align: 'center' });
    doc.text('Have a great day!', { align: 'center' });

    doc.end();

  } catch (error) {
    console.error('Error generating thermal receipt:', error);
    res.status(500).json({ message: 'Error generating receipt' });
  }
});

// @route   POST /api/bills/send-whatsapp-bill
// @desc    Explicit endpoint to format and send WhatsApp bill via Twilio
// @access  Private
router.post('/send-whatsapp-bill', protect, async (req, res) => {
  try {
    const { phone, billDetails, message: customMessage } = req.body;
    
    if (!phone || (!billDetails && !customMessage)) {
      return res.status(400).json({ message: 'Phone number and either bill details or message are required' });
    }

    const { sendWhatsAppBill } = require('../utils/twilio');
    const result = await sendWhatsAppBill(phone, billDetails, customMessage);

    res.json({ message: 'WhatsApp message sent successfully', sid: result.sid });
  } catch (error) {
    console.error('Error in send-whatsapp-bill:', error);
    res.status(500).json({ message: error.message || 'Error sending WhatsApp message' });
  }
});

module.exports = router;
