import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignInAlt, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css'; 


const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <img src="./images/KING_FLEX_Horizontal.png" alt="Company Logo" />
      </div>

      <div className="navbar-user-icons">
        <button className="login-btn">
          <FontAwesomeIcon icon={faSignInAlt} /> Sign In
        </button>
        <button className="signup-btn">
          <FontAwesomeIcon icon={faUserPlus} /> Sign Up
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
