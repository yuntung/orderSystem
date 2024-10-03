import emailjs from 'emailjs-com';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import React from 'react';
import './OrderConfirmationSystem.css';


const EMAILJS_SERVICE_ID = process.env.REACT_APP_EMAILJS_SERVICE_ID;
const EMAILJS_USER_ID = process.env.REACT_APP_EMAILJS_USER_ID;
const SALES_EMAIL = process.env.REACT_APP_SALES_EMAIL;
const CUSTOMER_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_CUSTOMER_TEMPLATE_ID;
const SALES_TEAM_TEMPLATE_ID = process.env.REACT_APP_EMAILJS_SALES_TEMPLATE_ID;

const sendEmail = async (templateId, templateParams) => {
    try {
        const response = await emailjs.send(EMAILJS_SERVICE_ID, templateId, templateParams, EMAILJS_USER_ID);
        console.log('Email sent successfully:', response);
        return true;
    }catch(error) {
        console.error('Failed to send email', error);
        return false;
    }
};

const generateOrderPDF = (orderData, orderItems) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Purchase Order', 105, 15, { align: 'center' });

    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Company Name: ${orderData.companyName}`, 20, 40);
    doc.text(`Site Contact Name: ${orderData.siteContactName}`, 20, 50);
    doc.text(`Phone Number: ${orderData.phoneNumber}`, 20, 60);
    doc.text(`Delivery Address: ${orderData.deliveryAddress}`, 20, 70);
    doc.text(`Delivery Date: ${orderData.deliveryDate}`, 20, 80);
    doc.text(`Delivery Time: ${orderData.deliveryTime}`, 20, 90);
    doc.text(`Crane Truck: ${orderData.craneTruck}`, 20, 100);

    const tableData = orderItems.map(item =>[
        item.name,
        item.selectedSize ? `${item.selectedSize}mm` : item.detail || 'N/A',
        item.quantity,
        item.unit
    ]);

    doc.autoTable({
        startY: 110,
        head: [['Item', 'Detail', 'Quantity', 'UOM']],
        body: tableData,
    });

    return doc;
};

export const sendOrderConfirmationEmail = async (orderData, orderItems) => {
    const pdfDoc = generateOrderPDF(orderData, orderItems);
    const pdfBase64 = btoa(pdfDoc.output());

    const orderNumber = `ORD-${Date.now()}`;
    const orderDate = new Date().toLocaleDateString;

    const orderSummary = orderItems.map(item => `${item.name}${item.selectedSize ? ` (${item.selectedSize}mm)` : ''}: ${item.quantity} ${item.unit}`
  ).join('\n');

  const customerTemplateParams = {
    to_email: orderData.email,
    to_name: orderData.siteContactName,
    order_number: orderNumber,
    order_date: orderDate,
    order_time: orderData.deliveryTime,
    order_summary: orderSummary,
    order_pdf: pdfBase64
  };

  const salesTemplateParams = {
    to_email: SALES_EMAIL,
    order_number: orderNumber,
    order_date: orderDate,
    customer_name: orderData.siteContactName,
    company_name: orderData.companyName,
    customer_email: orderData.email,
    customer_phone: orderData.phoneNumber,
    delivery_address: orderData.deliveryAddress,
    delivery_date: orderData.deliveryDate,
    delivery_time: orderData.deliveryTime,
    crane_truck: orderData.craneTruck,
    order_summary: orderSummary,
    order_pdf: pdfBase64
  };


  try {
    const customerEmailSent = await sendEmail(CUSTOMER_TEMPLATE_ID, customerTemplateParams);
    const salesEmailSent = await sendEmail(SALES_TEAM_TEMPLATE_ID, salesTemplateParams);

    if (customerEmailSent && salesEmailSent) {
      console.log('Order confirmation emails sent successfully to customer and sales team');
      return { success: true, orderNumber };
    } else {
      console.error('Failed to send one or both emails');
      return { success: false, error: 'We encountered an issue sending your order confirmation. Please contact our support team.' };
    }
  } catch (error) {
    console.error('Error in sendOrderConfirmationEmail:', error);
    return { success: false, error: 'An unexpected error occurred. Please try again or contact our support team.' };
  }
};

export const OrderConfirmationModal = ({ isOpen, onClose, orderNumber }) => {
    if (!isOpen) return null;

    const handleClose = () => {
        onClose();
    }
  
    return (
      <div className="modal-overlay">
        <div className="modal">
          <div className="modal-content">
            <h2>Order Completed!</h2>
            <p>Your order has been successfully placed and a confirmation has been sent to your email.</p>
            <p>Order Number: {orderNumber}</p>
            <button onClick={handleClose}>Close</button>
          </div>
        </div>
      </div>
    );
  };

