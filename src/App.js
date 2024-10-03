import React from 'react';
import './index.css';
import OrderForm from './components/OrderForm/OrderForm';
import Navbar from './components/Navbar/Navbar';
import emailjs from 'emailjs-com';

emailjs.init(process.env.REACT_APP_EMAILJS_USER_ID);


function App() {
  return (
    <div className="App">
        <Navbar />
        <div className="content">
        <OrderForm />
      </div>
    </div>
  );
}

export default App;
