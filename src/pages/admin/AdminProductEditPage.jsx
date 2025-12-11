import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminDashboardPage';
import {
  getCategories,
  getProduct,
  createProduct,
  updateProduct
} from '../../services/productService';
import "../../css/adminProductEdit.css";

const AdminProductEditPage = () => {
  const { id } = useParams(); // undefined for /admin/products/new, product id for /admin/products/:id
  const navigate = useNavigate();
  const isNew = !id; // ✅ new product if there is no id in params

  const [categories, setCategories] = useState([]);
  const [product, setProduct] = useState({
    name: '',
    slug: '',
    description: '',
    price: 0,
    mrp: 0,
    category: '', // category _id
    subCategory: '',
    sizes: '',
    colors: '',
    images: [],
    stock: 0,
    isTrending: false,
    isNewArrival: false,
    isBestSeller: false
  });

  const [imageUrlInput, setImageUrlInput] = useState('');

  useEffect(() => {
    const load = async () => {
      const cats = await getCategories();
      setCategories(cats);

      if (!isNew && id) {
        const p = await getProduct(id);

        setProduct({
          _id: p._id,
          name: p.name,
          slug: p.slug,
          description: p.description || '',
          price: p.price || 0,
          mrp: p.mrp || 0,
          category: p.category?._id || p.category || '',
          subCategory: p.subCategory || '',
          sizes: p.sizes?.join(',') || '',
          colors: p.colors?.join(',') || '',
          images: p.images || [],
          stock: p.stock || 0,
          isTrending: !!p.isTrending,
          isNewArrival: !!p.isNewArrival,
          isBestSeller: !!p.isBestSeller
        });
      }
    };

    load();
  }, [id, isNew]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setProduct((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddImageUrl = (e) => {
    e.preventDefault();
    const url = imageUrlInput.trim();
    if (!url) return;
    setProduct((prev) => ({
      ...prev,
      images: [...(prev.images || []), url]
    }));
    setImageUrlInput('');
  };

  const handleRemoveImage = (index) => {
    setProduct((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: Number(product.price) || 0,
      mrp: Number(product.mrp) || 0,
      category: product.category,
      subCategory: product.subCategory,
      stock: Number(product.stock) || 0,
      images: product.images || [],
      isTrending: product.isTrending,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
      sizes: product.sizes
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      colors: product.colors
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
    };

    try {
      if (isNew) {
        await createProduct(payload);
      } else {
        await updateProduct(product._id, payload);
      }
      navigate('/admin/products');
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save product');
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <h1>{isNew ? 'Add Product' : 'Edit Product'}</h1>

        <form className="admin-form" onSubmit={handleSubmit}>
          {/* BASIC INFO */}
          <div className="form-row">
            <label>Name</label>
            <input
              name="name"
              value={product.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label>Slug (URL-friendly)</label>
            <input
              name="slug"
              value={product.slug}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <label>Description</label>
            <textarea
              name="description"
              value={product.description}
              onChange={handleChange}
              rows={3}
            />
          </div>

          {/* PRICING & STOCK */}
          <div className="form-row grid">
            <div>
              <label>Price</label>
              <input
                name="price"
                type="number"
                value={product.price}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div>
              <label>MRP</label>
              <input
                name="mrp"
                type="number"
                value={product.mrp}
                onChange={handleChange}
                min="0"
              />
            </div>
            <div>
              <label>Stock</label>
              <input
                name="stock"
                type="number"
                value={product.stock}
                onChange={handleChange}
                min="0"
              />
            </div>
          </div>

          {/* CATEGORY DROPDOWN */}
          <div className="form-row">
            <label>Category</label>
            <select
              name="category"
              value={product.category}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* SUBCATEGORY */}
          <div className="form-row">
            <label>Sub Category (e.g. "Oversized T-Shirts")</label>
            <input
              name="subCategory"
              value={product.subCategory}
              onChange={handleChange}
              placeholder="Optional"
            />
          </div>

          {/* SIZES & COLORS */}
          <div className="form-row grid">
            <div>
              <label>Sizes (comma separated)</label>
              <input
                name="sizes"
                value={product.sizes}
                onChange={handleChange}
                placeholder="S,M,L,XL"
              />
            </div>
            <div>
              <label>Colors (comma separated)</label>
              <input
                name="colors"
                value={product.colors}
                onChange={handleChange}
                placeholder="Black, White"
              />
            </div>
          </div>

          {/* FLAGS */}
          <div className="form-row">
            <label>Flags</label>
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  name="isNewArrival"
                  checked={product.isNewArrival}
                  onChange={handleChange}
                />
                New Arrival
              </label>
              <label>
                <input
                  type="checkbox"
                  name="isBestSeller"
                  checked={product.isBestSeller}
                  onChange={handleChange}
                />
                Best Seller
              </label>
              <label>
                <input
                  type="checkbox"
                  name="isTrending"
                  checked={product.isTrending}
                  onChange={handleChange}
                />
                Trending
              </label>
            </div>
          </div>

          {/* IMAGE URL INPUT INSTEAD OF FILE UPLOAD */}
          <div className="form-row">
            <label>Product Images (External URLs)</label>
            <div
              style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '0.5rem'
              }}
            >
              <input
                type="url"
                placeholder="https://example.com/image.jpg"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                style={{ flex: 1 }}
              />
              <button className="btn-secondary" onClick={handleAddImageUrl}>
                Add
              </button>
            </div>
            <div className="admin-image-list">
              {product.images?.map((img, i) => (
                <div key={i} style={{ position: 'relative' }}>
                  <img src={img} alt={`product-${i}`} />
                  <button
                    type="button"
                    className="link-button danger"
                    style={{ fontSize: '0.75rem' }}
                    onClick={() => handleRemoveImage(i)}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button className="btn-primary" type="submit">
            Save Product
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminProductEditPage;
