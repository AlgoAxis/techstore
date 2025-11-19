import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../redux/slices/cartSlice';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleAddToCart = async (e) => {
    e.stopPropagation();
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await dispatch(
        addToCart({ productId: product.id, quantity: 1 })
      ).unwrap();
      toast.success('Added to cart!');
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const price = product.discountPrice || product.price;

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
    >
      <img
        src={product.imageUrls?.[0] || '/placeholder.jpg'}
        alt={product.name}
        className="w-full h-48 object-cover"
      />

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 truncate">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-4">
          <div>
            <span className="text-2xl font-bold text-blue-600">
              ${price.toFixed(2)}
            </span>
            {product.discountPrice && (
              <span className="ml-2 text-sm text-gray-500 line-through">
                ${product.price.toFixed(2)}
              </span>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
          >
            <ShoppingCart size={20} />
          </button>
        </div>

        {product.stockQuantity < 10 && product.stockQuantity > 0 && (
          <p className="text-red-500 text-sm mt-2">
            Only {product.stockQuantity} left!
          </p>
        )}
      </div>
    </div>
  );
};

export default ProductCard;