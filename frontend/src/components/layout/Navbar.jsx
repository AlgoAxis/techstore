import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ShoppingCart, User, LogOut } from 'lucide-react';
import { logout } from '../../redux/slices/authSlice';

const Navbar = () => {
  const { user } = useSelector((state) => state.auth);
  const { items } = useSelector((state) => state.cart);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const cartItemCount = items?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-blue-600">
            TechStore
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/products" className="hover:text-blue-600">
              Products
            </Link>

            {user ? (
              <>
                <Link to="/cart" className="relative hover:text-blue-600">
                  <ShoppingCart size={24} />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                      {cartItemCount}
                    </span>
                  )}
                </Link>

                <Link to="/orders" className="hover:text-blue-600">
                  Orders
                </Link>

                {user.roles?.includes('ROLE_ADMIN') && (
                  <Link to="/admin" className="hover:text-blue-600">
                    Admin
                  </Link>
                )}

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-blue-600"
                >
                  <LogOut size={20} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-blue-600">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
