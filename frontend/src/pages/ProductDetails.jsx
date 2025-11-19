import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProductById } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { Star, ShoppingCart, Truck, Shield, Heart } from 'lucide-react';
import { toast } from 'react-toastify';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentProduct: product, loading } = useSelector((state) => state.products);
  const { user } = useSelector((state) => state.auth);
  
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    dispatch(fetchProductById(id));
  }, [dispatch, id]);

  const handleAddToCart = async () => {
    if (!user) {
      toast.error('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      await dispatch(addToCart({ productId: product.id, quantity })).unwrap();
      toast.success(`Added ${quantity} item(s) to cart!`);
    } catch (err) {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = async () => {
    if (!user) {
      toast.error('Please login to purchase');
      navigate('/login');
      return;
    }

    await handleAddToCart();
    navigate('/cart');
  };

  if (loading || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">Loading...</div>
      </div>
    );
  }

  const price = product.discountPrice || product.price;
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid md:grid-cols-2 gap-8">
        {/* Images Section */}
        <div>
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
            <img
              src={product.imageUrls?.[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              className="w-full h-96 object-contain"
            />
          </div>
          
          {/* Thumbnail Images */}
          {product.imageUrls && product.imageUrls.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {product.imageUrls.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt={`${product.name} ${index + 1}`}
                  className={`w-20 h-20 object-cover rounded cursor-pointer border-2 ${
                    selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedImage(index)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Info Section */}
        <div>
          <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
          
          {/* Rating */}
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={20}
                  className={
                    i < Math.floor(product.averageRating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {product.averageRating?.toFixed(1)} ({product.reviewCount} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-blue-600">
                ${price.toFixed(2)}
              </span>
              {discount > 0 && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.price.toFixed(2)}
                  </span>
                  <span className="bg-red-500 text-white px-2 py-1 rounded text-sm">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Brand & Category */}
          <div className="mb-6 space-y-2">
            {product.brand && (
              <p className="text-gray-700">
                <span className="font-semibold">Brand:</span> {product.brand}
              </p>
            )}
            {product.category && (
              <p className="text-gray-700">
                <span className="font-semibold">Category:</span>{' '}
                {product.category.name}
              </p>
            )}
            <p className="text-gray-700">
              <span className="font-semibold">SKU:</span> {product.sku}
            </p>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            {product.stockQuantity > 0 ? (
              <span className="text-green-600 font-semibold">
                In Stock ({product.stockQuantity} available)
              </span>
            ) : (
              <span className="text-red-600 font-semibold">Out of Stock</span>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stockQuantity > 0 && (
            <div className="mb-6">
              <label className="block font-semibold mb-2">Quantity:</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.stockQuantity}
                  value={quantity}
                  onChange={(e) =>
                    setQuantity(
                      Math.min(product.stockQuantity, Math.max(1, parseInt(e.target.value) || 1))
                    )
                  }
                  className="w-20 text-center border rounded px-3 py-2"
                />
                <button
                  onClick={() =>
                    setQuantity(Math.min(product.stockQuantity, quantity + 1))
                  }
                  className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={handleAddToCart}
              disabled={product.stockQuantity === 0}
              className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <ShoppingCart size={20} />
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stockQuantity === 0}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>
            <button className="bg-gray-200 p-3 rounded-lg hover:bg-gray-300">
              <Heart size={24} />
            </button>
          </div>

          {/* Features */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <Truck className="text-blue-600" size={24} />
              <div>
                <p className="font-semibold">Free Delivery</p>
                <p className="text-sm text-gray-600">On orders over $50</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield className="text-blue-600" size={24} />
              <div>
                <p className="font-semibold">1 Year Warranty</p>
                <p className="text-sm text-gray-600">
                  Manufacturer warranty included
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Product Description</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-gray-700 whitespace-pre-line">{product.description}</p>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        <div className="bg-white rounded-lg shadow-md p-6">
          {product.reviews && product.reviews.length > 0 ? (
            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b pb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={
                            i < review.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }
                        />
                      ))}
                    </div>
                    <span className="font-semibold">
                      {review.user?.firstName} {review.user?.lastName}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">
              No reviews yet. Be the first to review this product!
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;