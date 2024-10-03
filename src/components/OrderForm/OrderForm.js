import React, { useState } from "react";
import "./OrderForm.css";
import { sendOrderConfirmationEmail, OrderConfirmationModal } from "./OrderConfirmationSystem";

const OrderForm = () => {
  const initialProduct = [
    { id: 1, name: "PC Strand", detail: "12.7mm", unit: "Ton" },
    { id: 2, name: "Anchor Block and Wedges", detail: "N/A", unit: "Set" },
    { id: 3, name: "Duct", detail: "Duct (70 x 20mm) 3,770m", unit: "M" },
    { id: 4, name: "Jack Wedge", detail: "12.7mm Jack Wedges", unit: "Set" },
    { id: 5, name: "Duct Tape", detail: "N/A", unit: "Roll" },
    { id: 6, name: "Grout Tube", detail: "N/A", unit: "Roll" },
    { id: 7, name: "AbleFlex", detail: "N/A", unit: "Roll" },
    { id: 8, name: "Round Corrugate Duct", detail: "N/A", unit: "M" },
    { id: 9, name: "Staple", detail: "N/A", unit: "Box" },
  ];

  const chairSizes = [
    25, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180, 190, 200, 210, 220, 230, 
    240, 250, 260, 270, 280, 290, 300, 310, 320, 330, 340, 350, 360, 370, 380, 390, 400, 410, 420, 430, 440, 450,
    460, 470, 480
  ];

  const deliveryTimeOptions = {
    morning: [
      { value: 'morning-anytime', label: 'Morning Anytime' },
      { value: '7:00', label: '7:00' },
      { value: '7:30', label: '7:30' },
      { value: '8:00', label: '8:00' },
      { value: '8:30', label: '8:30' },
      { value: '9:00', label: '9:00' },
      { value: '9:30', label: '9:30' },
      { value: '10:00', label: '10:00' },
      { value: '10:30', label: '10:30' },
      { value: '11:00', label: '11:00' },
      { value: '11:30', label: '11:30' },
    ],
    afternoon: [
      { value: 'afternoon-anytime', label: 'Afternoon Anytime' },
      { value: '12:00', label: '12:00' },
      { value: '12:30', label: '12:30' },
      { value: '13:00', label: '1:00' },
      { value: '13:30', label: '1:30' },
      { value: '14:00', label: '2:00' },
      { value: '14:30', label: '2:30' },
      { value: '15:00', label: '3:00' },
    ],
  };

  const [formData, setFormData] = useState({
    customerInfo: {
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      deliveryAddress: '',
      deliveryDate: '',
      deliveryTime: '',
      craneTrackRequest: '',
    },
    products: initialProduct.map(product => ({ ...product, quantity: '' })),
    chairs: chairSizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [orderNumber, setOrderNumber] = useState(null);
  const [isChairTableCollapsed, setIsChairTableCollapsed] = useState(true);

  const handleCustomerInfoChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      customerInfo: {
        ...prevState.customerInfo,
        [name]: value
      }
    }));
  };

  const handleProductQuantityChange = (id, quantity) => {
    setFormData(prevState => ({
      ...prevState,
      products: prevState.products.map(product =>
        product.id === id ? { ...product, quantity } : product
      )
    }));
  };

  const handleChairQuantityChange = (size, quantity) => {
    setFormData(prevState => ({
      ...prevState,
      chairs: {
        ...prevState.chairs,
        [size]: quantity
      }
    }));
  };

  const handleDeliveryTimeChange = (e) => {
    let value;

    if (e.target) {
      value = e.target.value;
    }else {
      value = 'anytime';
    }

    setFormData(prevState => ({
      ...prevState,
      customerInfo: {
        ...prevState.customerInfo,
        deliveryTime: value,
      }
    }));
  };

  const toggleChairTable = () => {
    setIsChairTableCollapsed(!isChairTableCollapsed);
  };

  const resetForm = () => {
    setFormData({
      customerInfo: {
        companyName: '',
        contactPerson: '',
        phone: '',
        email: '',
        deliveryAddress: '',
        deliveryDate: '',
        deliveryTime: '',
        craneTrackRequest: '',
      },
      products: initialProduct.map(product => ({ ...product, quantity: '' })),
      chairs: chairSizes.reduce((acc, size) => ({ ...acc, [size]: '' }), {}),
    });
    setIsModalOpen(false);
    setOrderNumber(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare order data
    const orderData = {
      companyName: formData.customerInfo.companyName,
      siteContactName: formData.customerInfo.contactPerson,
      phoneNumber: formData.customerInfo.phone,
      email: formData.customerInfo.email,
      deliveryAddress: formData.customerInfo.deliveryAddress,
      deliveryDate: formData.customerInfo.deliveryDate,
      deliveryTime: formData.customerInfo.deliveryTime,
      craneTruck: formData.customerInfo.craneTrackRequest
    };

    // Prepare order items
    const orderItems = [
      ...formData.products.filter(product => product.quantity > 0),
      ...Object.entries(formData.chairs)
        .filter(([, quantity]) => quantity > 0)
        .map(([size, quantity]) => ({
          name: 'Chair',
          selectedSize: size,
          quantity,
          unit: 'bag'
        }))
    ];

    try {
      const result = await sendOrderConfirmationEmail(orderData, orderItems);
      if (result.success) {
        setOrderNumber(result.orderNumber);
        setIsModalOpen(true);
      } else {
        alert(result.error);
      }
    } catch (error) {
      console.error('Error submitting order:', error);
      alert('An error occurred while submitting your order. Please try again.');
    }
  };

  return (
    <div className="order-form-container">
      <form className="order-form" onSubmit={handleSubmit}>
        <h2>Order Form</h2>
        
        <div className="form-section">
          <h3>Customer Information</h3>
          <div className="form-group">
            <label htmlFor="companyName">Company Name:</label>
            <input
              type="text"
              id="companyName"
              name="companyName"
              value={formData.customerInfo.companyName}
              onChange={handleCustomerInfoChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="contactPerson">Site Contact Person:</label>
            <input
              type="text"
              id="contactPerson"
              name="contactPerson"
              value={formData.customerInfo.contactPerson}
              onChange={handleCustomerInfoChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="phone">Phone:</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.customerInfo.phone}
              onChange={handleCustomerInfoChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.customerInfo.email}
              onChange={handleCustomerInfoChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deliveryAddress">Delivery Address:</label>
            <input
              type="text"
              id="deliveryAddress"
              name="deliveryAddress"
              value={formData.customerInfo.deliveryAddress}
              onChange={handleCustomerInfoChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="deliveryDate">Delivery Date:</label>
            <input
              type="date"
              id="deliveryDate"
              name="deliveryDate"
              value={formData.customerInfo.deliveryDate}
              onChange={handleCustomerInfoChange}
              required
            />
          </div>
          <div className="form-group delivery-time-group">
            <label>Delivery Time:</label>
            <div className="delivery-time-grid">
              <div className="delivery-time-option">
                <select
                  name="deliveryTime"
                  value={formData.customerInfo.deliveryTime}
                  onChange={handleDeliveryTimeChange}
                  className="delivery-time-select"
                >
                  <option value="">Morning</option>
                  {deliveryTimeOptions.morning.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="delivery-time-option">
                <select
                  name="deliveryTime"
                  value={formData.customerInfo.deliveryTime}
                  onChange={handleDeliveryTimeChange}
                  className="delivery-time-select"
                >
                  <option value="">Afternoon</option>
                  {deliveryTimeOptions.afternoon.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="delivery-time-option">
                <button
                  type="button"
                  className={`anytime-button ${formData.customerInfo.deliveryTime === 'anytime' ? 'selected' : ''}`}
                  onClick={() => handleDeliveryTimeChange({ target: { name: 'deliveryTime', value: 'anytime' } })}
                >
                  Anytime 7am to 3pm
                </button>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Crane Track Request:</label>
            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="craneTrackRequest"
                  value="YES"
                  onChange={handleCustomerInfoChange}
                  checked={formData.customerInfo.craneTrackRequest === 'YES'}
                />
                YES
              </label>
              <label>
                <input
                  type="radio"
                  name="craneTrackRequest"
                  value="NO"
                  onChange={handleCustomerInfoChange}
                  checked={formData.customerInfo.craneTrackRequest === 'NO'}
                />
                NO
              </label>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Product Order</h3>
          <table className="product-table">
            <thead>
              <tr>
                <th>Item No.</th>
                <th>Item Name</th>
                <th>Detail</th>
                <th>Unit Order</th>
                <th>UOM</th>
              </tr>
            </thead>
            <tbody>
              {formData.products.map((product, index) => (
                <tr key={product.id}>
                  <td>{index + 1}</td>
                  <td>{product.name}</td>
                  <td>{product.detail}</td>
                  <td>
                    <input
                      type="number"
                      value={product.quantity}
                      onChange={(e) => handleProductQuantityChange(product.id, e.target.value)}
                      min="0"
                    />
                  </td>
                  <td>{product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="form-section">
          <h3 onClick={toggleChairTable} style={{ cursor: 'pointer' }}>Chair Order {isChairTableCollapsed ? '▼' : '▲'}</h3>
          {!isChairTableCollapsed && (
            <table className="chair-table">
              <thead>
                <tr>
                  <th>Chair Size (mm)</th>
                  <th>Quantity</th>
                  <th>UOM</th>
                </tr>
              </thead>
              <tbody>
                {chairSizes.map((size) => (
                  <tr key={size}>
                    <td>{size}</td>
                    <td>
                      <input
                        type="number"
                        value={formData.chairs[size]}
                        onChange={(e) => handleChairQuantityChange(size, e.target.value)}
                        min="0"
                      />
                    </td>
                    <td>bag</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button">Submit Order</button>
        </div>
      </form>

      <OrderConfirmationModal
        isOpen={isModalOpen}
        onClose={resetForm}
        orderNumber={orderNumber}
      />
    </div>
  );
}

export default OrderForm;