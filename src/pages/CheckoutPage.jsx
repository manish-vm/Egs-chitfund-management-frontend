import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import formatPrice from '../utils/formatPrice';
import { getAddresses } from '../services/addressService';
import { createOrder } from '../services/orderService';
import '../css/checkout.css';

const CheckoutPage = () => {
  const { items } = useCart();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [placing, setPlacing] = useState(false);

  const itemsPrice = items.reduce((sum, i) => {
    const price = Number(i?.product?.price) || 0;
    const qty = Number(i?.qty) || 0;
    return sum + price * qty;
  }, 0);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await getAddresses();
        setAddresses(list || []);
        // preselect default
        const def = (list || []).find((a) => a.isDefault) || (list || [])[0];
        if (def) setSelectedAddressId(def._id);
      } catch (err) {
        console.error('Failed to load addresses', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    load();
  }, []);

  const handlePlaceOrder = async () => {
    if (placing) return;
    if (!selectedAddressId) {
      alert('Please add/select a shipping address first');
      navigate('/account', { state: { activeTab: 'address' } });
      return;
    }

    setPlacing(true);
    try {
      const order = await createOrder({ addressId: selectedAddressId });
      // navigate to order success using returned orderId if available
      const oid = order.orderId || order._id;
      navigate(`/order-success/${encodeURIComponent(oid)}`);
    } catch (err) {
      console.error('Place order failed', err);
      const msg = err.response?.data?.message || 'Failed to place order';
      alert(msg);
      if (msg.includes('shipping address')) {
        navigate('/account', { state: { activeTab: 'address' } });
      }
    } finally {
      setPlacing(false);
    }
  };

  return (
    <div className="checkout-page">
      <h1 className="page-title">Checkout</h1>

      <div className="checkout-layout">
        <div className="checkout-left">
          <section className="checkout-addresses">
            <h2>Shipping Address</h2>

            {loadingAddresses ? (
              <div>Loading addresses…</div>
            ) : addresses.length === 0 ? (
              <div>
                <p>No shipping addresses found.</p>
                <button
                  className="btn-primary"
                  onClick={() => navigate('/account', { state: { activeTab: 'address' } })}
                >
                  Add Address
                </button>
              </div>
            ) : (
              <div className="address-list">
                {addresses.map((a) => (
                  <label key={a._id} className={`address-card ${a.isDefault ? 'default' : ''}`}>
                    <input
                      type="radio"
                      name="shippingAddress"
                      checked={selectedAddressId === a._id}
                      onChange={() => setSelectedAddressId(a._id)}
                    />

                    <div className="address-body">
                      <div className="address-top">
                        <strong>{a.fullName}</strong>
                        {a.suggestedName && (
                          <span className="address-label">{a.suggestedName}</span>
                        )}
                        {a.isDefault && <span className="address-default">Default</span>}
                      </div>

                      <div className="address-line">{a.address}</div>
                      {a.locality && <div className="address-line">{a.locality}</div>}
                      <div className="address-meta">{a.city} - {a.pincode}</div>
                      <div className="address-meta">{a.state}</div>
                      <div className="address-meta">Phone: {a.phone}</div>
                    </div>
                  </label>
                ))}

                <div style={{ marginTop: 12 }}>
                  <button
                    className="addeditcheckaddress"
                    onClick={() => navigate('/account', { state: { activeTab: 'address' } })}
                  >
                    Add or Edit Addresses
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>

        <aside className="checkout-right">
          <h2>Order Summary</h2>

          <div className="summary-row">
            <span>Items</span>
            <span>{items.reduce((s, it) => s + Number(it.qty || 0), 0)}</span>
          </div>

          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatPrice(itemsPrice)}</span>
          </div>

          <div className="summary-row">
            <span>Shipping</span>
            <span>{itemsPrice > 999 ? 'Free' : formatPrice(99)}</span>
          </div>

          <hr />

          <div className="summary-row total">
            <span>Total</span>
            <span>{formatPrice(itemsPrice + (itemsPrice > 999 ? 0 : 99) + Math.round(itemsPrice * 0.05))}</span>
          </div>

          <button
            className="btn-primary wide"
            onClick={handlePlaceOrder}
            disabled={placing}
          >
            {placing ? 'Placing Order...' : 'Place Order (COD)'}
          </button>

        </aside>
      </div>
    </div>
  );
};

export default CheckoutPage;
