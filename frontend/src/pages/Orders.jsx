import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import API from '../api/axios';
import { Package, Truck, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'react-toastify';

const Orders = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchOrders();
  }, [user, navigate]);

  const fetchOrders = async () => {
    try {
      const response = await API.get('/orders?page=0&size=10');
      setOrders(response.data.content || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="text-yellow-500" size={24} />;
      case 'PROCESSING':
        return <Package className="text-blue-500" size={24} />;
      case 'SHIPPED':
        return <Truck className="text-purple-500" size={24} />;
      case 'DELIVERED':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'CANCELLED':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <Package className="text-gray-500" size={24} />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'PROCESSING':
        return 'bg-blue-100 text-blue-800';
      case 'SHIPPED':
        return 'bg-purple-100 text-purple-800';
      case 'DELIVERED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'PAID':
        return 'text-green-600';
      case 'PENDING':
        return 'text-yellow-600';
      case 'FAILED':
        return 'text-red-600';
      case 'REFUNDED':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading orders...</div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Package size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">No orders yet</h2>
        <p className="text-gray-600 mb-6">Start shopping to see your orders here!</p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            {/* Order Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                {getStatusIcon(order.status)}
                <div>
                  <h3 className="font-bold text-lg">
                    Order #{order.orderNumber}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                    order.status
                  )}`}
                >
                  {order.status}
                </span>
                <p className={`text-sm mt-2 font-semibold ${getPaymentStatusColor(order.paymentStatus)}`}>
                  Payment: {order.paymentStatus}
                </p>
              </div>
            </div>

            {/* Order Items */}
            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 pb-3 border-b">
                  <img
                    src={item.product?.imageUrls?.[0] || '/placeholder.jpg'}
                    alt={item.productName}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{item.productName}</p>
                    <p className="text-sm text-gray-600">
                      Quantity: {item.quantity} × ${item.price.toFixed(2)}
                    </p>
                  </div>
                  <p className="font-semibold">
                    ${(item.quantity * item.price).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                <p>
                  Shipping to: {order.shippingAddress.city},{' '}
                  {order.shippingAddress.state} {order.shippingAddress.zipCode}
                </p>
                {order.trackingNumber && (
                  <p className="mt-1">
                    Tracking: <span className="font-mono">{order.trackingNumber}</span>
                  </p>
                )}
              </div>

              <div className="text-right">
                <p className="text-gray-600 text-sm">Total Amount</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${order.total.toFixed(2)}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setSelectedOrder(order)}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              >
                View Details
              </button>
              {order.status === 'DELIVERED' && (
                <button className="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700">
                  Leave Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold">
                Order Details - #{selectedOrder.orderNumber}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {/* Detailed Order Info */}
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Order Status</h3>
                <div className="flex items-center gap-2">
                  {getStatusIcon(selectedOrder.status)}
                  <span className="font-semibold">{selectedOrder.status}</span>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Shipping Address</h3>
                <p>{selectedOrder.shippingAddress.street}</p>
                <p>
                  {selectedOrder.shippingAddress.city},{' '}
                  {selectedOrder.shippingAddress.state}{' '}
                  {selectedOrder.shippingAddress.zipCode}
                </p>
                <p>{selectedOrder.shippingAddress.country}</p>
                <p>Phone: {selectedOrder.shippingAddress.phoneNumber}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Items</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between border-b pb-2">
                      <div>
                        <p className="font-semibold">{item.productName}</p>
                        <p className="text-sm text-gray-600">
                          {item.quantity} × ${item.price.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-semibold">
                        ${(item.quantity * item.price).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Payment Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedOrder.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>${selectedOrder.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span>${selectedOrder.shippingCost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total</span>
                    <span className="text-blue-600">
                      ${selectedOrder.total.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 mt-6"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;