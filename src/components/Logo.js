import React from 'react';
const Logo = (props) => {
  return (
    <img
      alt="EGS Logo"
      src="/static/egslogo.jpg"
      style={{
        width: '70px', // reduced from 70px
        height: 'auto',
        objectFit: 'contain',
        display: 'block',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
        border: '1px solid #e0e0e0',
        ...props.style, // allow external overrides
      }}
      {...props}
    />
  );
};


export default Logo;
