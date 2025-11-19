import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
} from '../redux/slices/cartSlice';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { toast } from 'react-toastify';

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (user) {
      dispatch(fetchCart());
    }
  }, [dispatch, user]);

  const handleUpdateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    
    try {
      await dispatch(
        updateCartItem({ productId, quantity: newQuantity })
      ).unwrap();
    } catch (err) {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await dispatch(removeFromCart(productId)).unwrap();
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    }
  };

  const calculateSubtotal = () => {
    return items.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const calculateTax = (subtotal) => {
    return subtotal * 0.1; // 10% tax
  };

  const calculateShipping = (subtotal) => {
    return subtotal > 50 ? 0 : 10; // Free shipping over $50
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    const tax = calculateTax(subtotal);
    const shipping = calculateShipping(subtotal);
    return subtotal + tax + shipping;
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Please login to view your cart</h2>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Login
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">Loading cart...</div>
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <ShoppingBag size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
        <p className="text-gray-600 mb-6">
          Add some products to get started!
        </p>
        <button
          onClick={() => navigate('/products')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = calculateSubtotal();
  const tax = calculateTax(subtotal);
  const shipping = calculateShipping(subtotal);
  const total = calculateTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md">
            {items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 p-4 border-b last:border-b-0"
              >
                {/* Product Image */}
                <img
                  src={item.product.imageUrls?.[0] || '/placeholder.jpg'}
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded cursor-pointer"
                  onClick={() => navigate(`/products/${item.product.id}`)}
                />

                {/* Product Details */}
                <div className="flex-1">
                  <h3
                    className="font-semibold text-lg cursor-pointer hover:text-blue-600"
                    onClick={() => navigate(`/products/${item.product.id}`)}
                  >
                    {item.product.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {item.product.brand}
                  </p>
                  <p className="text-blue-600 font-bold mt-2">
                    ${item.price.toFixed(2)} each
                  </p>
                  
                  {/* Stock warning */}
                  {item.product.stockQuantity < item.quantity && (
                    <p className="text-red-500 text-sm mt-1">
                      Only {item.product.stockQuantity} left in stock
                    </p>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.product.id, item.quantity - 1)
                    }
                    className="bg-gray-200 p-2 rounded hover:bg-gray-300"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-12 text-center font-semibold">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() =>
                      handleUpdateQuantity(item.product.id, item.quantity + 1)
                    }
                    disabled={item.quantity >= item.product.stockQuantity}
                    className="bg-gray-200 p-2 rounded hover:bg-gray-300 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Item Total */}
                <div className="text-right min-w-[100px]">
                  <p className="font-bold text-lg">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => handleRemoveItem(item.product.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          {/* Continue Shopping */}
          <button
            onClick={() => navigate('/products')}
            className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
          >
            ← Continue Shopping
          </button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>

            <div className="space-y-3 mb-4">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (10%)</span>
                <span className="font-semibold">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold">
                  {shipping === 0 ? (
                    <span className="text-green-600">FREE</span>
                  ) : (
                    `$${shipping.toFixed(2)}`
                  )}
                </span>
              </div>
              
              {subtotal < 50 && (
                <p className="text-sm text-gray-500">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}
              
              <div className="border-t pt-3 flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-blue-600">${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-semibold"
            >
              Proceed to Checkout
            </button>

            {/* Security Badge */}
            <div className="mt-4 text-center text-sm text-gray-600">
              <p>🔒 Secure Checkout</p>
              <p className="text-xs mt-1">Your payment info is safe with us</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;