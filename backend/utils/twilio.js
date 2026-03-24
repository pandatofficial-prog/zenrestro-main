const twilio = require('twilio');

/**
 * Send a WhatsApp bill receipt to a customer using Twilio.
 * 
 * Assumes environment variables:
 * - TWILIO_ACCOUNT_SID
 * - TWILIO_AUTH_TOKEN
 * - TWILIO_WHATSAPP_NUMBER (e.g., 'whatsapp:+14155238886')
 * 
 * @param {string} phone - Customer phone number
 * @param {Object} [billDetails] - Optional details about the bill (fallback if message is missing)
 * @param {string} [customMessage] - Optional direct message string to send
 * @returns {Promise<Object>} - Twilio message response
 */
const sendWhatsAppBill = async (phone, billDetails, customMessage) => {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER, TWILIO_SMS_NUMBER } = process.env;

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || (!TWILIO_WHATSAPP_NUMBER && !TWILIO_SMS_NUMBER)) {
    throw new Error('Twilio environment variables are not correctly configured.');
  }

  const client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);

  // Format phone number safely
  let formattedPhone = phone.trim();
  if (!formattedPhone.startsWith('+')) {
    formattedPhone = formattedPhone.length === 10 ? `+91${formattedPhone}` : `+${formattedPhone}`;
  }

  let messageBody = customMessage;

  // Generate body from billDetails if no customMessage provided
  if (!messageBody && billDetails) {
    const {
      restaurantName,
      billNumber,
      items,
      subtotal,
      discountAmount,
      taxRate,
      tax,
      total,
      date
    } = billDetails;

    messageBody = `*${restaurantName || 'Restaurant'}*\n`;
    messageBody += `Receipt: ${billNumber}\n`;
    messageBody += `Date: ${date || new Date().toLocaleDateString('en-IN')}\n\n`;
    
    messageBody += `*Items:*\n`;
    items.forEach(item => {
      messageBody += `${item.quantity}x ${item.name} - ₹${item.total}\n`;
    });

    messageBody += `\nSubtotal: ₹${subtotal}\n`;
    if (discountAmount > 0) {
      messageBody += `Discount: -₹${discountAmount}\n`;
    }
    if (tax > 0) {
      messageBody += `GST (${taxRate}%): ₹${tax}\n`;
    }
    messageBody += `*Total: ₹${total}*\n\n`;
    messageBody += `Thank you for dining with us!`;
  }

  if (!messageBody) {
    throw new Error('Either customMessage or billDetails must be provided to send a message.');
  }

  try {
    if (!TWILIO_WHATSAPP_NUMBER) throw new Error("WhatsApp sending disabled (No Number)");

    const message = await client.messages.create({
      body: messageBody,
      from: TWILIO_WHATSAPP_NUMBER.startsWith('whatsapp:') ? TWILIO_WHATSAPP_NUMBER : `whatsapp:${TWILIO_WHATSAPP_NUMBER}`,
      to: `whatsapp:${formattedPhone}`
    });

    console.log(`Twilio WhatsApp sent to ${formattedPhone}`);
    return message;
  } catch (error) {
    console.error(`Twilio WhatsApp Send Error for ${formattedPhone}:`, error.message);
    console.log('Attempting SMS fallback...');

    if (!TWILIO_SMS_NUMBER) {
      console.error('SMS fallback failed: TWILIO_SMS_NUMBER not configured.');
      throw new Error(`WhatsApp failed and SMS fallback is not configured. Original Error: ${error.message}`);
    }

    try {
      const smsMessage = await client.messages.create({
        body: messageBody,
        from: TWILIO_SMS_NUMBER,
        to: formattedPhone
      });
      
      console.log(`Twilio Fallback SMS sent to ${formattedPhone}`);
      return smsMessage;
    } catch (smsError) {
      console.error(`Twilio SMS Send Error for ${formattedPhone}:`, smsError.message);
      throw smsError;
    }
  }
};

module.exports = {
  sendWhatsAppBill
};
