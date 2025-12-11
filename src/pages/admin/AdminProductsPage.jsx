import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AdminSidebar } from './AdminDashboardPage';
import { getProducts, deleteProduct } from '../../services/productService';
import formatPrice from '../../utils/formatPrice';

const AdminProductsPage = () => {
  const [products, setProducts] = useState([]);
  const navigate = useNavigate();

  const load = async () => {
    const list = await getProducts();
    setProducts(list);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Delete this product?')) {
      await deleteProduct(id);
      load();
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <div className="admin-header">
          <h1>Products</h1>
          <button
            className="btn-primary"
            onClick={() => navigate('/admin/products/new')}
          >
            Add Product
          </button>
        </div>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p.name}</td>
                <td>{formatPrice(p.price)}</td>
                <td>{p.category?.name}</td>
                <td>
                  <Link to={`/admin/products/${p._id}`}>Edit</Link>{' '}
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="link-button danger"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProductsPage;
