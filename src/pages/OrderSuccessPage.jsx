import React from 'react';
import { Link, useParams } from 'react-router-dom';
import '../css/orderSuccess.css';
const OrderSuccessPage = () => {
  const { orderId } = useParams();
  return (
    <div className="order-success-page">
      <img src="https://assets-v2.lottiefiles.com/a/6192c96c-1184-11ee-94d6-87985660cc3b/eKofKHrW1u.gif" alt="Order Success" className="success-image" />
      <h1>Order Placed</h1>
      <p>Your order ID is {orderId}</p>
      <Link to="/account" state={{ activeTab: 'orders' }} className="btn-primary">
        View Orders
      </Link>
    </div>
  );
};

export default OrderSuccessPage;
