import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import formatPrice from '../../utils/formatPrice';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { useWishlist } from '../../contexts/WishlistContext';
import '../../css/product.css';

const ProductCard = ({ product }) => {
  const img = product.images?.[0] || '';
  const subLabel = product.subCategory || product.category?.name || '';

  const hasDiscount = product.mrp && product.mrp > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
    : null;

  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { isInWishlist, toggleWishlist, loadingIds } = useWishlist();

  const wishActive = isInWishlist(product._id);
  const wishLoading = loadingIds.includes(product._id.toString());

  // badge logic
  let badgeLabel = null;
  let badgeClass = null;

  if (product.isNewArrival) {
    badgeLabel = 'New Arrival';
    badgeClass = 'badge-new';
  } else if (product.isBestSeller) {
    badgeLabel = 'Best Seller';
    badgeClass = 'badge-best';
  } else if (product.isTrending) {
    badgeLabel = 'Trending';
    badgeClass = 'badge-trending';
  }

  const handleWishlistClick = async (e) => {
    e.preventDefault();

    if (!user) {
      addToast('Please log in to add product to wishlist', 'error');
      navigate('/auth');
      return;
    }

    if (wishLoading) return;

    try {
      const nowInWishlist = await toggleWishlist(product._id);

      if (nowInWishlist) {
        // ✅ Toast instead of alert
        addToast('❤️ Your favourite product has been added to wishlist!', 'success');
      } else {
        addToast('Removed from wishlist.', 'info');
      }
    } catch (err) {
      addToast('Failed to update wishlist', 'error');
    }
  };

  return (
    <Link to={`/product/${product._id}`} className="product-card">
      <div className="product-card-inner">
        <div className="product-image-wrapper">
          <div className="product-card-top">
            <div className="badge-container">
              {badgeLabel && (
                <span className={`badge ${badgeClass}`}>{badgeLabel}</span>
              )}
            </div>

            <div className="wishlist-container">
              <button
                type="button"
                className={`wishlist-btn ${
                  wishActive ? 'wishlist-active' : ''
                }`}
                onClick={handleWishlistClick}
                disabled={wishLoading}
              >
                ♥
              </button>
            </div>
          </div>

          {img ? (
            <img src={img} alt={product.name} className="product-image" />
          ) : (
            <div className="product-image placeholder">Image</div>
          )}
        </div>

        <div className="product-info">
          <div className="product-name" title={product.name}>
            {product.name}
          </div>
          {subLabel && (
            <div className="product-subcategory">{subLabel}</div>
          )}

          <div className="product-price-row">
            <span className="price">{formatPrice(product.price)}</span>
            {product.mrp && (
              <span className="mrp">{formatPrice(product.mrp)}</span>
            )}
            {discountPercent && (
              <span className="discount">({discountPercent}% off)</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
