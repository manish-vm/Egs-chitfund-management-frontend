import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import formatPrice from '../utils/formatPrice';
import "../services/cartService";
import api from '../services/api';
import '../css/cart.css';

const CartPage = () => {
  const { items, updateCartItem, removeFromCart } = useCart();
  const navigate = useNavigate();

  const [placingOrder, setPlacingOrder] = React.useState(false);

  // ✅ SAFELY calculate subtotal
  const itemsPrice = items.reduce((sum, i) => {
    const price = Number(i?.product?.price) || 0;
    const qty = Number(i?.qty) || 0;
    return sum + price * qty;
  }, 0);

  const handleQtyChange = (item, qty) => {
    if (qty < 1 || isNaN(qty)) return;

    updateCartItem({
      productId: item.product._id,
      size: item.size,
      color: item.color,
      qty
    });
  };

  const handlePlaceOrder = () => {
    // Navigate to checkout where user can pick an address and place order
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <h1 className="page-title">Shopping Cart</h1>

      {items.length === 0 ? (
        <div className="empty-cart">
          <div className="empty-cart-inner">
            <img
              className="empty-cart-image"
              src="https://png.pngtree.com/png-vector/20250802/ourlarge/pngtree-3d-cartoon-man-shopping-for-clothes-with-cart-png-image_16954800.webp"
              alt="Empty shopping bag"
            />

            <div className="empty-cart-quote">
              <div className="empty-cart-quote-inner">
                <div className="empty-cart-quote-main">
                  Uh oh… your cart is empty!
                </div>
                <div className="empty-cart-quote-sub">
                  Add a few MetroMensWear favorites to get started.
                </div>
              </div>
            </div>

            <button
              className="empty-cart-btn"
              onClick={() => navigate('/products')}
            >
              Continue Shopping
            </button>
          </div>
        </div>
      ) : (

        <div className="cart-layout">
          {/* LEFT: ITEMS */}
          <div className="cart-items">
            {items.map((item, idx) => {
              const price = Number(item?.product?.price) || 0;
              const qty = Number(item?.qty) || 0;
              const lineTotal = price * qty;

              return (
                <div key={idx} className="cart-item">
                  {/* ✅ PRODUCT IMAGE */}
                  <img
                    src={item?.product?.images?.[0] || '/placeholder.png'}
                    alt={item?.product?.name || 'Product'}
                    className="cart-item-image"
                  />

                  {/* ✅ PRODUCT INFO */}
                  <div className="cart-item-info">
                    <div className="cart-item-name">
                      {item?.product?.name || 'Product'}
                    </div>

                    <div className="cart-item-category">
                      {item?.product?.category?.name || 'Category'} •{' '}
                      {item?.product?.subCategory || 'Variant'}
                    </div>

                    <div className="cart-item-meta">
                      <span>Size: {item.size || 'N/A'}</span>
                      <span>Color: {item.color || 'N/A'}</span>
                    </div>

                    <div className="cart-item-unit-price">
                      Price: {formatPrice(price)}
                    </div>

                    <button
                      className="cart-remove-btn"
                      onClick={() =>
                        removeFromCart(
                          item.product._id,
                          item.size,
                          item.color
                        )
                      }
                    >
                      Remove
                    </button>
                  </div>

                  {/* ✅ CONTROLS + LINE TOTAL */}
                  <div className="cart-item-controls">
                    <div className="qty-control">
                      <button
                        onClick={() =>
                          handleQtyChange(item, qty - 1)
                        }
                      >
                        −
                      </button>

                      <input
                        type="number"
                        min="1"
                        value={qty}
                        onChange={(e) =>
                          handleQtyChange(item, Number(e.target.value))
                        }
                      />

                      <button
                        onClick={() =>
                          handleQtyChange(item, qty + 1)
                        }
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price">
                      {formatPrice(lineTotal)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT: SUMMARY */}
          <div className="cart-summary">
            <h2>Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>{formatPrice(itemsPrice)}</span>
            </div>

            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>

            <hr />

            <div className="summary-row total">
              <span>Total</span>
              <span>{formatPrice(itemsPrice)}</span>
            </div>

            <button
              className="btn-primary wide"
              onClick={handlePlaceOrder}
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
