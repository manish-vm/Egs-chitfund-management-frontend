import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCategories, getProducts } from '../services/productService';
import ProductCard from '../components/product/ProductCard';
import { ThreeDot } from 'react-loading-indicators';
const CategoryPage = () => {
  const { slug } = useParams();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const cats = await getCategories();
        const cat = cats.find((c) => c.slug === slug);
        setCategory(cat || { name: slug });
        // ✅ FIXED: Pass slug, not ID, because backend expects category slug
        const prods = await getProducts({ category: slug });
        setProducts(prods);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  return (
    <div className="category-page">
      <h1 className="page-title">{category?.name}</h1>

      {loading ? (
        <div className="loading-container">
          <div className="loading"><center><ThreeDot color={["#32cd32", "#327fcd", "#cd32cd", "#ffbf00ff"]} /></center></div>
        </div>
      ) : products.length > 0 ? (
        <div className="product-grid">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      ) : (
        <div className="no-products">
          <div className="coming-soon-box">
            <p className="coming-soon-text">🚀 More products coming soon…</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;
