import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import '../../css/header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const [topwearOpen, setTopwearOpen] = useState(false);
  const [bottomwearOpen, setBottomwearOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const cartCount = items.reduce((sum, i) => sum + i.qty, 0);

  const [cartBounce, setCartBounce] = useState(false);

  const [searchOpen, setSearchOpen] = useState(false);
  const [keyword, setKeyword] = useState('');

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/products?search=${keyword.trim()}`);
      // optional: setSearchOpen(false);
    }
  };

  useEffect(() => {
    if (cartCount > 0) {
      setCartBounce(true);
      const timer = setTimeout(() => setCartBounce(false), 400);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /* MOBILE MENU STATE */
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu when route changes
  const location = useLocation();
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="header">
      {/* TOP STRIP */}
      <div className="header-strip">
        <div className="header-strip-inner">
          <div className="header-strip-text">
            Free shipping on all orders – grab your favorites now!
          </div>
          <div className="header-strip-auth">
            {user ? (
              <>
                <>
                  <div
                    className="auth-dropdown-container"
                    onMouseEnter={() => setAccountOpen(true)}
                    onMouseLeave={() => setAccountOpen(false)}
                    style={{ position: 'relative', display: 'inline-block' }}
                  >
                    <button
                      className="strip-link"
                      onClick={() => navigate(user.isAdmin ? '/admin' : '/account')}
                    >
                      {user.isAdmin ? 'Admin Panel' : 'My Account'}
                    </button>

                    {/* Account Dropdown */}
                    {!user.isAdmin && accountOpen && (
                      <div className="auth-dropdown-menu">
                        <button
                          className="auth-dropdown-item"
                          onClick={() => navigate('/account', { state: { activeTab: 'profile' } })}
                        >
                          My Profile
                        </button>
                        <button
                          className="auth-dropdown-item"
                          onClick={() => navigate('/account', { state: { activeTab: 'orders' } })}
                        >
                          My Orders
                        </button>
                        <button
                          className="auth-dropdown-item"
                          onClick={() => navigate('/account', { state: { activeTab: 'wishlist' } })}
                        >
                          Wishlist
                        </button>
                      </div>
                    )}
                  </div> |
                  <button className="strip-link" onClick={handleLogout}>
                    LOGOUT
                  </button>
                </>
              </>
            ) : (
              <>
                <button
                  className="strip-link"
                  onClick={() => navigate('/auth')}
                >
                  LOG IN
                </button>
                <span className="strip-separator">/</span>
                <button
                  className="strip-link"
                  onClick={() => navigate('/auth')}
                >
                  SIGN UP
                </button>

              </>
            )}
          </div>
        </div>
      </div>

      {/* MAIN NAV BAR */}
      <div className="header-main">
        <div className="header-main-inner">

          {/* HAMBURGER ICON (Mobile Only) */}
          <button
            className="hamburger-btn"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>

          {/* LOGO */}
          <div className="header-logo">
            <Link to="/">METROMENSWEAR</Link>
          </div>

          {/* CENTER NAV */}
          <nav className="header-nav">
            {/* TOPWEAR DROPDOWN (mega menu) */}
            <div
              className="nav-item dropdown"
              onMouseEnter={() => setTopwearOpen(true)}
              onMouseLeave={() => setTopwearOpen(false)}
            >
              <button type="button" className="nav-link nav-button">
                TOPWEAR{' '}
                <span className={'nav-arrow' + (topwearOpen ? ' open' : '')}>
                  ▾
                </span>
              </button>

              {topwearOpen && (
                <div className="mega-menu">
                  {/* Column 1: T-shirts */}
                  <div className="mega-col">
                    <div className="mega-title">T-Shirts</div>
                    <Link
                      to="/products?subCategory=Plain%20T-Shirts"
                      className="mega-link"
                    >
                      Plain T-Shirts
                    </Link>
                    <Link
                      to="/products?subCategory=Printed%20T-Shirts"
                      className="mega-link"
                    >
                      Printed T-Shirts
                    </Link>
                    <Link
                      to="/products?subCategory=Regular%20Fit%20T-Shirts"
                      className="mega-link"
                    >
                      Regular Fit T-Shirts
                    </Link>
                    <Link
                      to="/category/oversized"
                      className="mega-link"
                    >
                      Oversized T-Shirts
                    </Link>
                    <Link
                      to="/products?subCategory=Polo%20T-Shirts"
                      className="mega-link"
                    >
                      Polo T-Shirts
                    </Link>
                    <Link
                      to="/products?subCategory=Plus%20Size%20T-Shirts"
                      className="mega-link"
                    >
                      Plus Size T-Shirts
                    </Link>
                    <Link
                      to="/products?subCategory=Full%20Sleeve%20T-Shirts"
                      className="mega-link"
                    >
                      Full Sleeve T-Shirts
                    </Link>
                    <Link to="/products" className="mega-link">
                      View All
                    </Link>
                  </div>

                  {/* Column 2: Shirts */}
                  <div className="mega-col">
                    <div className="mega-title">Shirts</div>
                    <Link to="/category/Casual%20Shirt" className="mega-link">
                      Casual Shirts
                    </Link>
                    <Link
                      to="/products?subCategory=Plain%20Shirts"
                      className="mega-link"
                    >
                      Plain Shirts
                    </Link>
                    <Link
                      to="/products?subCategory=Flannel%20Shirts"
                      className="mega-link"
                    >
                      Flannel Shirts
                    </Link>
                    <Link
                      to="/products?subCategory=Checked%20Shirts"
                      className="mega-link"
                    >
                      Checked Shirts
                    </Link>
                    <Link
                      to="/products?subCategory=Cotton%20Shirts"
                      className="mega-link"
                    >
                      Cotton Shirts
                    </Link>
                    <Link to="/category/shirts" className="mega-link">
                      View All
                    </Link>
                  </div>

                  {/* Column 3: Polos */}
                  <div className="mega-col">
                    <div className="mega-title">Polos</div>
                    <Link
                      to="/products?subCategory=Polos"
                      className="mega-link"
                    >
                      View All
                    </Link>
                  </div>

                  {/* Column 4: Shop by Collection */}
                  <div className="mega-col">
                    <div className="mega-title">Shop by Collection</div>
                    <Link
                      to="/products?new=true"
                      className="mega-link"
                    >
                      New Arrivals
                    </Link>
                    <Link
                      to="/products?bestseller=true"
                      className="mega-link"
                    >
                      Best Sellers
                    </Link>
                    <Link
                      to="/products?trending=true"
                      className="mega-link"
                    >TRENDING</Link>
                    <Link to="/products" className="mega-link">
                      View All
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* BOTTOMWEAR DROPDOWN (single column) */}
            <div
              className="nav-item dropdown"
              onMouseEnter={() => setBottomwearOpen(true)}
              onMouseLeave={() => setBottomwearOpen(false)}
            >
              <button type="button" className="nav-link nav-button">
                BOTTOMWEAR{' '}
                <span
                  className={
                    'nav-arrow' + (bottomwearOpen ? ' open' : '')
                  }
                >
                  ▾
                </span>
              </button>

              {bottomwearOpen && (
                <div className="dropdown-menu">
                  <Link
                    to="/products?subCategory=Cargo%20Joggers"
                    className="dropdown-link"
                  >
                    Cargo Joggers
                  </Link>
                  <Link
                    to="/products?subCategory=Cargo%20Pants"
                    className="dropdown-link"
                  >
                    Cargo Pants
                  </Link>
                  <Link
                    to="/products?subCategory=Trousers"
                    className="dropdown-link"
                  >
                    Trousers
                  </Link>
                  <Link
                    to="/products?subCategory=Japanese%20Pants"
                    className="dropdown-link"
                  >
                    Japanese Pants
                  </Link>
                  <Link
                    to="/products?subCategory=Gurkha%20Pants"
                    className="dropdown-link"
                  >
                    Gurkha Pants
                  </Link>
                  <Link
                    to="/products?subCategory=Korean%20Pants"
                    className="dropdown-link"
                  >
                    Korean Pants
                  </Link>
                  <Link
                    to="/products?subCategory=Pyjamas"
                    className="dropdown-link"
                  >
                    Pyjamas
                  </Link>
                  <Link
                    to="/products?subCategory=Jeans"
                    className="dropdown-link"
                  >
                    Jeans
                  </Link>
                  <Link
                    to="/products?subCategory=Shorts"
                    className="dropdown-link"
                  >
                    Shorts
                  </Link>
                  <Link
                    to="/products?subCategory=Boxers"
                    className="dropdown-link"
                  >
                    Boxers
                  </Link>
                </div>
              )}
            </div>

            {/* Other nav items */}
            <div className="nav-item">
              <NavLink
                to="/products?tag=combos"
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active' : '')
                }
              >
                COMBOS
              </NavLink>
            </div>

            <div className="nav-item">
              <NavLink
                to="/products?new=true"
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active' : '')
                }
              >
                NEW ARRIVALS
              </NavLink>
            </div>

            <div className="nav-item">
              <NavLink
                to="/category/winterwear"
                className={({ isActive }) =>
                  'nav-link' + (isActive ? ' active' : '')
                }
              >
                WINTERWEAR
              </NavLink>
            </div>
          </nav>

          {/* RIGHT ICONS */}
          <div className="header-icons">
            {/* Search Input Container */}
            <div className={`search-bar-container ${searchOpen ? 'open' : ''}`}>
              <form onSubmit={handleSearch}>
                <input
                  type="text"
                  placeholder="Seach Products..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="search-input"
                />
              </form>
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={() => {
                if (searchOpen && keyword.trim()) {
                  handleSearch({ preventDefault: () => { } });
                } else {
                  setSearchOpen(!searchOpen);
                }
              }}
            >
              <span className="icon-search" />
            </button>

            <button
              type="button"
              className={`cart-image-btn ${cartBounce ? 'cart-bounce' : ''}`}
              onClick={() => navigate('/cart')}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/1413/1413908.png"
                alt="Cart"
                className="cart-image-icon"
              />
              {cartCount > 0 && (
                <span className="cart-image-badge">{cartCount}</span>
              )}
            </button>

          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY & DRAWER */}
      <div className={`mobile-menu-overlay ${mobileMenuOpen ? 'open' : ''}`} onClick={toggleMobileMenu}></div>
      <div className={`mobile-menu-drawer ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-header">
          <h3>Menu</h3>
          <button className="close-menu-btn" onClick={toggleMobileMenu}>✕</button>
        </div>
        <div className="mobile-menu-content">
          <div className="mobile-menu-section">
            <h4 className="mobile-section-title">Shop</h4>
            <Link to="/products?subCategory=Plain%20T-Shirts" className="mobile-menu-link">T-Shirts</Link>
            <Link to="/category/shirts" className="mobile-menu-link">Shirts</Link>
            <Link to="/products?subCategory=Polos" className="mobile-menu-link">Polos</Link>
            <Link to="/products?subCategory=Jeans" className="mobile-menu-link">Jeans</Link>
            <Link to="/products?subCategory=Trousers" className="mobile-menu-link">Trousers</Link>
            <Link to="/products?subCategory=Shorts" className="mobile-menu-link">Shorts</Link>
            <Link to="/products?tag=combos" className="mobile-menu-link strong">Combos</Link>
            <Link to="/products?new=true" className="mobile-menu-link strong">New Arrivals</Link>
            <Link to="/category/winterwear" className="mobile-menu-link strong">Winterwear</Link>
          </div>

          <div className="mobile-menu-section">
            <h4 className="mobile-section-title">Account</h4>
            {user ? (
              <>
                <Link to="/account" className="mobile-menu-link">My Account</Link>
                <button onClick={handleLogout} className="mobile-menu-link logout-btn">Logout</button>
              </>
            ) : (
              <>
                <Link to="/auth" className="mobile-menu-link">Log In</Link>
                <Link to="/auth" className="mobile-menu-link">Sign Up</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;