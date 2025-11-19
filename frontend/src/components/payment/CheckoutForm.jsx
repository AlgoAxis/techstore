import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../../api/axios';
import { Loader } from 'lucide-react';

const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#32325d',
      fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#fa755a',
      iconColor: '#fa755a',
    },
  },
};

const CheckoutForm = ({ shippingInfo, totalAmount }) => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    // Validate shipping info
    const requiredFields = ['street', 'city', 'state', 'zipCode', 'country', 'phoneNumber'];
    const missingFields = requiredFields.filter((field) => !shippingInfo[field]);

    if (missingFields.length > 0) {
      toast.error('Please fill in all shipping information');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 1: Create order
      const orderResponse = await API.post('/orders', shippingInfo);
      const order = orderResponse.data;

      // Step 2: Create payment intent
      const paymentResponse = await API.post(
        `/payments/create-intent?orderId=${order.id}`
      );
      const { clientSecret } = paymentResponse.data;

      // Step 3: Confirm payment with Stripe
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        toast.error(stripeError.message);
        setLoading(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        toast.success('Payment successful! Order placed.');
        navigate(`/orders`);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || 'Payment failed. Please try again.');
      toast.error('Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">
          Card Information *
        </label>
        <div className="border rounded-lg p-4 bg-gray-50">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Test card: 4242 4242 4242 4242, any future date, any CVC
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader className="animate-spin" size={20} />
            Processing...
          </>
        ) : (
          `Pay $${totalAmount.toFixed(2)}`
        )}
      </button>

      <p className="text-xs text-center text-gray-500">
        By placing your order, you agree to our Terms of Service and Privacy Policy
      </p>
    </form>
  );
};

export default CheckoutForm;