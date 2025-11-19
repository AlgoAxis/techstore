import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, Shield, CreditCard } from 'lucide-react';

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-4">
            Welcome to TechStore
          </h1>
          <p className="text-xl mb-8">
            Discover amazing products at unbeatable prices
          </p>
          <Link
            to="/products"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 inline-block"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <ShoppingBag className="mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="font-semibold mb-2">Wide Selection</h3>
              <p className="text-gray-600">Thousands of products to choose from</p>
            </div>
            <div className="text-center">
              <Truck className="mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="font-semibold mb-2">Fast Shipping</h3>
              <p className="text-gray-600">Free delivery on orders over $50</p>
            </div>
            <div className="text-center">
              <Shield className="mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="font-semibold mb-2">Secure Payment</h3>
              <p className="text-gray-600">100% secure transactions</p>
            </div>
            <div className="text-center">
              <CreditCard className="mx-auto mb-4 text-blue-600" size={48} />
              <h3 className="font-semibold mb-2">Easy Returns</h3>
              <p className="text-gray-600">30-day return policy</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
