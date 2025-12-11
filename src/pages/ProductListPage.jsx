// frontend/src/pages/ProductListPage.jsx
import React, { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { getProducts } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import { ThreeDot } from 'react-loading-indicators';
import '../css/product.css';

const ProductListPage = () => {
  const { slug } = useParams();
  const { search } = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      try {
        const params = {};
        const qs = new URLSearchParams(search);

        if (slug) params.category = slug;

        const subCategory = qs.get('subCategory');
        if (subCategory) params.subCategory = subCategory;

        if (qs.get('new') === 'true') params.new = 'true';
        if (qs.get('bestseller') === 'true') params.bestseller = 'true';
        if (qs.get('trending') === 'true') params.trending = 'true';

        const searchQuery = qs.get('search');
        if (searchQuery) params.search = searchQuery;

        const data = await getProducts(params);
        setProducts(data || []);
      } catch (error) {
        console.error('Error loading products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [slug, search]);

  return (
    <div className="product-list-page">
      <h1 className="page-title">
        {slug ? slug.toUpperCase() : 'PRODUCTS'}
      </h1>

      {loading ? (
        <div className="loading"><center><ThreeDot color={["#32cd32", "#327fcd", "#cd32cd", "#ffbf00ff"]} /></center></div>
      ) : products.length === 0 ? (
        <div className="coming-soon-box">
          <p className="coming-soon-text">🚀 More products coming soon…</p>
        </div>
      ) : (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductListPage;
