import React, { useEffect, useState } from 'react';
import { AdminSidebar } from './AdminDashboardPage';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../services/orderService';
import formatPrice from '../../utils/formatPrice';
import "../../css/adminOrders.css";
const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);

  const load = async () => {
    const list = await getAllOrders();
    setOrders(list);
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    await updateOrderStatus(id, { status });
    load();
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      await deleteOrder(id);
      load();
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-content">
        <h1>Orders</h1>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User</th>
              <th>Total</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Cancel Reason</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o._id.slice(-6)}</td>
                <td>{o.user?.email}</td>
                <td>{formatPrice(o.totalPrice)}</td>
                <td>{o.isPaid ? 'Yes' : 'No'}</td>
                <td>
                  <select
                    className="status-select"
                    value={o.status || 'Placed'}
                    onChange={(e) => updateStatus(o._id, e.target.value)}
                    style={{
                      padding: '0.25rem',
                      borderRadius: '4px',
                      border: '1px solid #ddd'
                    }}
                  >
                    {['Placed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'].map(
                      (s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      )
                    )}
                  </select>
                </td>
                <td>
                  {o.status === 'Cancelled' && o.cancelReason
                    ? o.cancelReason
                    : '-'}
                </td>
                <td>
                  <button
                    onClick={() => handleDelete(o._id)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
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

export default AdminOrdersPage;
