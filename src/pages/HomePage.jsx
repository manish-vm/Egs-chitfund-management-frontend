import React, { useEffect, useState } from 'react';
import HeroBanner from '../components/home/HeroBanner';
import CategoryStrip from '../components/home/CategoryStrip';
import ProductGridSection from '../components/home/ProductGridSection';
import ProductCard from '../components/product/ProductCard';
import { getCategories, getProducts } from '../services/productService';
import MarqueeStrip from "../components/home/MarqueeStrip";
import ExclusiveStrip from '../components/home/ExclusiveStrip';
import "../css/home.css";

const SHIRT_SUBS = [
  'Casual Shirts',
  'Plain Shirts',
  'Flannel Shirts',
  'Checked Shirts',
  'Cotton Shirts'
];

const TSHIRT_SUBS = [
  'Plain T-Shirts',
  'Printed T-Shirts',
  'Regular Fit T-Shirts',
  'Oversized T-Shirts',
  'Polo T-Shirts',
  'Plus Size T-Shirts',
  'Full Sleeve T-Shirts'
];

const HomePage = () => {
  const [categories, setCategories] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [trending, setTrending] = useState([])

  const [newFilter, setNewFilter] = useState('all'); // 'all' | 'shirts' | 'trousers' | 'tshirts' | 'polos'

  useEffect(() => {
    const load = async () => {
      const cats = await getCategories();
      setCategories(cats);

      // Fetch new arrivals from API
      const newArr = await getProducts({ new: 'true' });
      setNewArrivals(newArr.slice(0, 20));

      // Fetch best sellers from API
      const best = await getProducts({ bestseller: 'true' });
      setBestSellers(best.slice(0, 8));

      // Fetch trending from API
      const trend = await getProducts({ trending: 'true' });
      setTrending(trend.slice(0, 8));
    };
    load();
  }, []);

  const filteredNewArrivals = newArrivals.filter((p) => {
    const sub = p.subCategory || '';

    switch (newFilter) {
      case 'shirts':
        return SHIRT_SUBS.includes(sub);
      case 'trousers':
        return sub === 'Trousers';
      case 'tshirts':
        return TSHIRT_SUBS.includes(sub);
      case 'polos':
        return sub === 'Polo T-Shirts' || sub === 'Polos';
      default:
        return true; // 'all'
    }
  });

  return (
    <div className="home-page">
      <HeroBanner />
      <CategoryStrip categories={categories} />

      <MarqueeStrip />

      <ExclusiveStrip />

      {/* 🔥 NEW ARRIVALS WITH FILTER PILLS */}
      {newArrivals.length > 0 && (
        <section className="grid-section">
          <div className="section-header new-arrivals-header">
            <h2>NEW ARRIVALS </h2>
            <p className="new-arrivals-subtitle">
              Get them before everyone else does
            </p>
          </div>

          <div className="new-arrivals-filters">
            <button
              type="button"
              className={
                'new-filter-pill' + (newFilter === 'all' ? ' active' : '')
              }
              onClick={() => setNewFilter('all')}
            >
              View All
            </button>

            <button
              type="button"
              className={
                'new-filter-pill' + (newFilter === 'shirts' ? ' active' : '')
              }
              onClick={() => setNewFilter('shirts')}
            >
              Shirts
            </button>

            <button
              type="button"
              className={
                'new-filter-pill' +
                (newFilter === 'trousers' ? ' active' : '')
              }
              onClick={() => setNewFilter('trousers')}
            >
              Trousers
            </button>

            <button
              type="button"
              className={
                'new-filter-pill' +
                (newFilter === 'tshirts' ? ' active' : '')
              }
              onClick={() => setNewFilter('tshirts')}
            >
              T-shirts
            </button>

            <button
              type="button"
              className={
                'new-filter-pill' +
                (newFilter === 'polos' ? ' active' : '')
              }
              onClick={() => setNewFilter('polos')}
            >
              Polo T-shirts
            </button>
            
          </div>
          {filteredNewArrivals.length > 0 ? (
            <div className="product-grid">
              {filteredNewArrivals.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          ) : (
            <div className="no-new-arrivals">
              <p>No new arrivals at this category</p>
            </div>
          )}
        </section>
      )}
      <ProductGridSection
        title="Best Sellers"
        products={bestSellers}
      />

      <ProductGridSection
        title="Trending Now"
        products={trending}
      />
    </div>
  );
};

export default HomePage;
