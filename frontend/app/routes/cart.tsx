import type { Route } from "./+types/cart";
import { Link } from "react-router";
import { useCart } from "../context/CartContext";
import { useState, useEffect } from "react";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Shopping Cart - FreshHarvest" },
    { name: "description", content: "Review your cart and proceed to checkout" },
  ];
}

export default function Cart() {
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);

  // Scroll detection for navbar height
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background-50">
        <header className={`sticky top-0 z-50 bg-primary-700 shadow-lg transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
          <div className="container-page">
            <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
              <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                <div className={`flex items-center gap-1 transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                  <span>🛒</span>
                </div>
                <h1 className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>FreshHarvest Cart</h1>
              </Link>
              <Link to="/marketplace" className={`bg-white text-primary-700 hover:bg-gray-50 rounded-lg font-semibold transition-all ${isScrolled ? 'text-[10px] px-3 py-1.5' : 'text-xs px-4 py-2'}`}>
                Continue Shopping
              </Link>
            </div>
          </div>
        </header>

        <div className="container-page py-16">
          <div className="card bg-white shadow-xl max-w-lg mx-auto text-center">
            <div className="text-6xl mb-6">🛒</div>
            <h1 className="text-2xl md:text-3xl font-bold text-text-900 mb-3">
              Your Cart is Empty
            </h1>
            <p className="text-sm md:text-base text-text-600 mb-6">
              Add some fresh produce from our marketplace to get started!
            </p>
            <Link to="/marketplace" className="btn-primary text-sm font-semibold uppercase tracking-widest">
              🛍️ Browse Marketplace
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 pb-16">
      <header className={`sticky top-0 z-50 bg-primary-700 shadow-lg transition-all duration-300 ${isScrolled ? 'py-0' : ''}`}>
        <div className="container-page">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'py-2' : 'py-4'}`}>
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className={`flex items-center gap-1 transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>
                <span>🛒</span>
              </div>
              <h1 className={`font-bold text-white transition-all duration-300 ${isScrolled ? 'text-xl' : 'text-2xl'}`}>FreshHarvest Cart</h1>
            </Link>
            <div className="flex items-center gap-3">
              <Link to="/marketplace" className={`text-white/90 hover:text-white transition-colors font-medium ${isScrolled ? 'text-xs' : 'text-sm'}`}>
                Continue Shopping
              </Link>
              <div className={`bg-white/20 text-white rounded-full font-bold transition-all duration-300 ${isScrolled ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs'}`}>
                {getTotalItems()} batches
              </div>
            </div>
          </div>
        </div>
      </header>

      <section className="container-page space-y-8 mt-8">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-text-900">
            Your Shopping Cart
          </h1>
          <p className="text-sm md:text-base text-text-600">
            Review your bulk order and proceed to checkout (1 batch = 100kg)
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => (
              <div key={item.productId} className="card bg-white shadow-lg">
                <div className="flex items-start gap-4">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-background-100 rounded-lg flex items-center justify-center text-4xl">
                      🌽
                    </div>
                  )}

                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-text-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-text-600 mb-2">{item.condition}</p>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-primary-700">
                        ₹{item.price}
                      </span>
                      <span className="text-sm text-text-500">per 100kg batch</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="text-red-600 hover:text-red-700 text-sm font-semibold flex items-center gap-1"
                    >
                      <span>🗑️</span>
                      <span>Remove</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 100)}
                        className="w-8 h-8 rounded-lg bg-background-100 hover:bg-background-200 flex items-center justify-center font-bold"
                        disabled={item.quantity <= 100}
                      >
                        −
                      </button>
                      <div className="w-20 text-center">
                        <div className="font-bold">{item.quantity / 100}</div>
                        <div className="text-xs text-text-500">batches</div>
                      </div>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 100)}
                        className="w-8 h-8 rounded-lg bg-background-100 hover:bg-background-200 flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-text-500 uppercase tracking-wider">Subtotal</p>
                      <p className="text-xl font-bold text-text-900">
                        ₹{(item.price * (item.quantity / 100)).toFixed(2)}
                      </p>
                      <p className="text-xs text-text-500">({item.quantity}kg total)</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card bg-white shadow-xl sticky top-24">
              <h2 className="text-2xl font-bold text-text-900 mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between text-text-700">
                  <span>Subtotal</span>
                  <span className="font-semibold">₹{getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between text-text-700">
                  <span>Delivery</span>
                  <span className="font-semibold text-green-600">FREE</span>
                </div>
                <div className="border-t border-text-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-text-900">Total</span>
                    <span className="text-2xl font-bold text-primary-700">
                      ₹{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <Link
                to="/checkout"
                className="btn-primary w-full text-center text-sm font-semibold uppercase tracking-widest mb-3 block py-3"
              >
                🛍️ Proceed to Checkout
              </Link>

              <Link
                to="/marketplace"
                className="btn-outline w-full text-center text-sm font-semibold uppercase tracking-widest block py-3"
              >
                Continue Shopping
              </Link>

              <div className="mt-6 pt-6 border-t border-text-200">
                <div className="flex items-start gap-3 text-sm text-text-600">
                  <span className="text-2xl">🚚</span>
                  <div>
                    <p className="font-semibold text-text-900 mb-1">Free Delivery</p>
                    <p>On all orders. Fresh produce delivered to your doorstep.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
