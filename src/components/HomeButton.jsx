import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './HomeButton.css';

const HomeButton = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hide on pages that already have their own navigation bar with logo
  const pagesWithNav = ['/', '/privacy', '/terms', '/contact'];
  if (pagesWithNav.includes(location.pathname)) return null;

  return (
    <button 
      className="home-btn-global" 
      onClick={() => navigate('/')}
      title="Go to Landing Page"
    >
      <div className="home-btn-icon">
        <i className="fa-solid fa-house"></i>
      </div>
      <span className="home-btn-text">Home</span>
    </button>
  );
};

export default HomeButton;
