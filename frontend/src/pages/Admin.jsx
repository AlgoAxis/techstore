import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../api/axios';
import {
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
} from 'lucide-react';
import { toast } from 'react-toastify';

const Admin = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    totalUsers: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    if (!user || !user.roles?.includes('ROLE_ADMIN')) {
      toast.error('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }

    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    try {
      // Fetch orders
      const ordersResponse = await API.get('/orders?page=0&size=5');
      const orders = ordersResponse.data.content || [];
      setRecentOrders(orders);

      // Calculate stats (in a real app, this would be a separate endpoint)
      const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

      // Fetch products count
      const productsResponse = await API.get('/products?page=0&size=1');
      const totalProducts = productsResponse.data.totalElements || 0;

      setStats({
        totalOrders: orders.length,
        totalRevenue: totalRevenue,
        totalProducts: totalProducts,
        totalUsers: 0, // Would need a separate endpoint
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await API.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      toast.success('Order status updated');
      fetchDashboardData();
    } catch (err) {
      toast.error('Failed to update order status');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Settings size={20} />
          Settings
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-green-600">
                ${stats.totalRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="text-green-600" size={40} />
          </div>
          <div className="flex items-center mt-2 text-sm text-green-600">
            <TrendingUp size={16} />
            <span className="ml-1">+12% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-blue-600">
                {stats.totalOrders}
              </p>
            </div>
            <ShoppingCart className="text-blue-600" size={40} />
          </div>
          <div className="flex items-center mt-2 text-sm text-blue-600">
            <TrendingUp size={16} />
            <span className="ml-1">+8% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Products</p>
              <p className="text-2xl font-bold text-purple-600">
                {stats.totalProducts}
              </p>
            </div>
            <Package className="text-purple-600" size={40} />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Active products in catalog
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Users</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.totalUsers || 'N/A'}
              </p>
            </div>
            <Users className="text-orange-600" size={40} />
          </div>
          <div className="mt-2 text-sm text-gray-600">
            Registered customers
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <button
          onClick={() => navigate('/admin/products')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <Package className="text-blue-600 mb-4" size={32} />
          <h3 className="font-bold text-lg mb-2">Manage Products</h3>
          <p className="text-gray-600 text-sm">
            Add, edit, or remove products from catalog
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <ShoppingCart className="text-green-600 mb-4" size={32} />
          <h3 className="font-bold text-lg mb-2">Manage Orders</h3>
          <p className="text-gray-600 text-sm">
            View and update order statuses
          </p>
        </button>

        <button
          onClick={() => navigate('/admin/users')}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
        >
          <Users className="text-purple-600 mb-4" size={32} />
          <h3 className="font-bold text-lg mb-2">Manage Users</h3>
          <p className="text-gray-600 text-sm">
            View and manage user accounts
          </p>
        </button>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4">Order #</th>
                <th className="text-left py-3 px-4">Customer</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="text-left py-3 px-4">Total</th>
                <th className="text-left py-3 px-4">Status</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4 font-mono text-sm">
                    {order.orderNumber}
                  </td>
                  <td className="py-3 px-4">
                    {order.user?.firstName} {order.user?.lastName}
                  </td>
                  <td className="py-3 px-4">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 font-semibold">
                    ${order.total.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        updateOrderStatus(order.id, e.target.value)
                      }
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="PROCESSING">Processing</option>
                      <option value="SHIPPED">Shipped</option>
                      <option value="DELIVERED">Delivered</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => navigate(`/orders/${order.id}`)}
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Admin;