import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../services/productService';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext'; // ✅ import auth
import formatPrice from '../utils/formatPrice';
import "../css/productdetails.css";

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate(); // ✅ for redirect
  const { addToCart } = useCart();
  const { user } = useAuth(); // ✅ get logged-in user

  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('');
  const [color, setColor] = useState('');
  const [qty, setQty] = useState(1);

  useEffect(() => {
    const load = async () => {
      const p = await getProduct(id);
      setProduct(p);
      setSize(p.sizes?.[0] || '');
      setColor(p.colors?.[0] || '');
    };
    load();
  }, [id]);

  if (!product) return null;

  // ✅ LOGIN PROTECTION ADDED HERE
  const handleAddToCart = async () => {
    if (!user) {
      alert('Login to purchase product');
      navigate('/auth'); // ✅ redirect to login
      return;
    }

    await addToCart({ productId: product._id, qty, size, color });
  };

  return (
    <div className="product-details-page">
      <div className="product-details-wrapper">
        <div className="product-gallery">
          {product.images?.[0] ? (
            <img src={product.images[0]} alt={product.name} />
          ) : (
            <div className="product-image placeholder large">Image</div>
          )}
        </div>

        <div className="product-details">
          <h1>{product.name}</h1>

          <div className="price-row">
            <span className="price">{formatPrice(product.price)}</span>
            {product.mrp && (
              <span className="mrp">{formatPrice(product.mrp)}</span>
            )}
          </div>

          <p className="description">{product.description}</p>

          <div className="selectors">
            {product.sizes?.length > 0 && (
              <div className="selector">
                <label>Size</label>
                <div className="size-options">
                  {product.sizes.map((s) => (
                    <button
                      key={s}
                      className={s === size ? 'option active' : 'option'}
                      onClick={() => setSize(s)}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {product.colors?.length > 0 && (
              <div className="selector">
                <label>Color</label>
                <div className="color-options">
                  {product.colors.map((c) => (
                    <button
                      key={c}
                      className={c === color ? 'option active' : 'option'}
                      onClick={() => setColor(c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="selector">
              <label>Quantity</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(Number(e.target.value))}
              />
            </div>
          </div>

          <button onClick={handleAddToCart} className="btn-primary wide">
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
