import type { Route } from "./+types/marketplace";
import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Marketplace - FreshHarvest" },
    { name: "description", content: "Explore FreshHarvest marketplace for fresh vegetables and produce" },
  ];
}

type ProduceItem = {
  id: string;
  name: string;
  emoji: string;
  description: string;
  price: string;
  unit: string;
  origin: string;
  availability: string;
  badges: string[];
  category: "Leafy Greens" | "Root" | "Fruit" | "Legume" | "Herb";
  isBestSeller?: boolean;
};

export default function Marketplace() {
  // Authentication check - in production, use proper auth context
  const navigate = useNavigate();
  const [isAuthenticated] = useState(() => {
    // For demo: check localStorage or session
    // In production: use proper auth context/provider
    return typeof window !== 'undefined' && localStorage.getItem('isAuthenticated') === 'true';
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Produce");

  const produce = useMemo<ProduceItem[]>(
    () => [
      {
        id: "tomato",
        name: "Heirloom Tomatoes",
        emoji: "🍅",
        description: "Sweet and juicy tomatoes perfect for salads and sauces.",
        price: "₹95",
        unit: "per kg",
        origin: "Kolhapur, Maharashtra",
        availability: "Peak season",
        badges: ["Open-field", "Non-GMO"],
        category: "Fruit",
        isBestSeller: true,
      },
      {
        id: "potato",
        name: "New Potatoes",
        emoji: "🥔",
        description: "Thin-skinned potatoes perfect for roasting and mashing.",
        price: "₹60",
        unit: "per kg",
        origin: "Indore, Madhya Pradesh",
        availability: "Cellar cured",
        badges: ["Soil-grown"],
        category: "Root",
        isBestSeller: true,
      },
      {
        id: "spinach",
        name: "Baby Spinach",
        emoji: "🥬",
        description: "Tender leaves harvested at dawn to preserve crunch and nutrients.",
        price: "₹120",
        unit: "per kg",
        origin: "Nashik, Maharashtra",
        availability: "Harvested this morning",
        badges: ["Hydroponic", "Organic"],
        category: "Leafy Greens",
      },
      {
        id: "carrot",
        name: "Sweet Carrots",
        emoji: "🥕",
        description: "Crunchy, naturally sweet carrots rich in beta carotene.",
        price: "₹70",
        unit: "per kg",
        origin: "Sangli, Maharashtra",
        availability: "Freshly washed",
        badges: ["Soil-grown", "Pesticide-free"],
        category: "Root",
      },
      {
        id: "cucumber",
        name: "English Cucumbers",
        emoji: "🥒",
        description: "Seedless cucumbers ideal for hydration and salads.",
        price: "₹55",
        unit: "per kg",
        origin: "Pune, Maharashtra",
        availability: "Chilled and ready",
        badges: ["Hydroponic"],
        category: "Fruit",
      },
      {
        id: "cauliflower",
        name: "Snow Cauliflower",
        emoji: "🥦",
        description: "Dense, white florets with delicate texture and mild flavor.",
        price: "₹85",
        unit: "per head",
        origin: "Ooty, Tamil Nadu",
        availability: "Limited batches",
        badges: ["Cold-chain", "Premium"],
        category: "Leafy Greens",
      },
      {
        id: "peas",
        name: "Garden Peas",
        emoji: "🫛",
        description: "Sweet peas hand-picked and flash chilled to lock freshness.",
        price: "₹140",
        unit: "per kg",
        origin: "Shimla, Himachal Pradesh",
        availability: "Flash frozen",
        badges: ["Frozen", "Premium"],
        category: "Legume",
      },
      {
        id: "chili",
        name: "Green Chilies",
        emoji: "🌶️",
        description: "Balanced heat chilies to spice up everyday cooking.",
        price: "₹80",
        unit: "per kg",
        origin: "Guntur, Andhra Pradesh",
        availability: "Daily harvest",
        badges: ["Heat-balanced"],
        category: "Fruit",
      },
      {
        id: "coriander",
        name: "Coriander Bunch",
        emoji: "🌿",
        description: "Fragrant herb bundled with roots for prolonged freshness.",
        price: "₹25",
        unit: "per bunch",
        origin: "Surat, Gujarat",
        availability: "Bundled at 5 AM",
        badges: ["Heritage seeds"],
        category: "Herb",
      },
      {
        id: "pumpkin",
        name: "Sugar Pumpkin",
        emoji: "🎃",
        description: "Sweet flesh pumpkins perfect for soups and pies.",
        price: "₹110",
        unit: "per piece",
        origin: "Alappuzha, Kerala",
        availability: "Limited harvest",
        badges: ["Seasonal"],
        category: "Fruit",
      },
      {
        id: "okra",
        name: "Tender Okra",
        emoji: "�",
        description: "Slender pods with minimal seeds ideal for frying and stews.",
        price: "₹75",
        unit: "per kg",
        origin: "Nagpur, Maharashtra",
        availability: "Picked and packed",
        badges: ["Zero residue"],
        category: "Fruit",
      },
      {
        id: "beetroot",
        name: "Ruby Beetroot",
        emoji: "🍠",
        description: "Earthy beetroot rich in antioxidants and natural sweetness.",
        price: "₹65",
        unit: "per kg",
        origin: "Ludhiana, Punjab",
        availability: "Washed and trimmed",
        badges: ["Organic"],
        category: "Root",
      },
    ],
    []
  );

  const categories = useMemo(
    () => ["All Produce", "Leafy Greens", "Root", "Fruit", "Legume", "Herb"],
    []
  );

  // Filter produce based on search and category
  const filteredProduce = useMemo(() => {
    let filtered = produce;

    // Filter by category
    if (selectedCategory !== "All Produce") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.origin.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [produce, selectedCategory, searchQuery]);

  // Separate best sellers
  const bestSellers = useMemo(() => produce.filter((item) => item.isBestSeller), [produce]);

  // Show authentication message if not logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-50 flex items-center justify-center px-4">
        <div className="card bg-white shadow-xl max-w-lg w-full text-center">
          <div className="text-6xl mb-6">🔒</div>
          <h1 className="text-2xl md:text-3xl font-bold text-text-900 mb-3">
            Authentication Required
          </h1>
          <p className="text-sm md:text-base text-text-600 mb-6">
            Please log in or create an account to access the FreshHarvest marketplace and browse our fresh produce.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/login" className="btn-primary text-sm font-semibold uppercase tracking-widest">
              Login to Continue
            </Link>
            <Link to="/signup" className="btn-outline text-sm font-semibold uppercase tracking-widest">
              Create Account
            </Link>
          </div>
          <div className="mt-6 pt-6 border-t border-text-200">
            <Link to="/" className="text-sm text-primary-700 hover:text-primary-800 font-semibold transition-colors">
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-50 pb-16">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-text-200">
        <div className="container-page">
          <div className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-90 transition-opacity">
              <div className="flex items-center gap-1 text-2xl">
                <span>🍎</span>
                <span>🌽</span>
                <span>🥕</span>
              </div>
              <h1 className="text-xl font-bold text-primary-700">FreshHarvest</h1>
            </Link>
            <nav className="flex items-center gap-3">
              <Link to="/" className="text-sm text-text-600 hover:text-primary-700 transition-colors font-medium">
                Home
              </Link>
              <button className="btn-outline text-xs px-4 py-2">
                Logout
              </button>
            </nav>
          </div>
        </div>
      </header>

      <section className="container-page space-y-8 mt-8">
        {/* Page Header */}
        <header className="text-center space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-primary-700">
            <span>🍎</span>
            <span>FreshHarvest Marketplace</span>
          </p>
          <h1 className="text-3xl md:text-4xl font-bold text-text-900">
            Curated Vegetables Directly from Trusted Farmers
          </h1>
          <p className="max-w-2xl mx-auto text-sm md:text-base text-text-600">
            Discover seasonal produce, transparent pricing, and reliable sourcing information. Every listing is verified to maintain the FreshHarvest quality promise.
          </p>
        </header>

        {/* Search Bar */}
        <div className="card bg-white shadow-lg">
          <div className="flex flex-col gap-4">
            <div>
              <label htmlFor="search" className="label-field mb-3">
                🔍 SEARCH PRODUCE
              </label>
              <div className="relative">
                <input
                  id="search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, description, or region..."
                  className="input-field pr-12"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-500 hover:text-text-700 text-lg transition-colors"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-text-500">
              <span>💡 Try searching: "tomato", "organic", "Maharashtra"</span>
              <span>{filteredProduce.length} items found</span>
            </div>
          </div>
        </div>

        {/* Best Sellers Section */}
        {!searchQuery && selectedCategory === "All Produce" && bestSellers.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">⭐</div>
              <div>
                <h2 className="text-xl font-bold text-text-900">Most Selling Items</h2>
                <p className="text-sm text-text-600">Top picks from our farmers - high demand essentials</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {bestSellers.map((item) => (
                <article
                  key={item.id}
                  className="card h-full flex flex-col gap-4 bg-white hover:shadow-xl transition-shadow duration-200 border-2 border-accent-400"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="text-4xl md:text-5xl select-none">{item.emoji}</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-semibold text-text-900">{item.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {item.badges.map((badge) => (
                            <span
                              key={badge}
                              className="inline-flex items-center rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700"
                            >
                              {badge}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-accent-700 bg-accent-100 px-3 py-1 rounded-full whitespace-nowrap">
                      ⭐ Best Seller
                    </span>
                  </div>

                  <p className="text-sm text-text-600 leading-relaxed">
                    {item.description}
                  </p>

                  <dl className="grid grid-cols-2 gap-y-3 text-sm text-text-700 bg-background-100 rounded-lg p-4">
                    <div>
                      <dt className="uppercase text-[0.65rem] font-semibold tracking-widest text-text-500">Category</dt>
                      <dd className="font-medium text-text-800">{item.category}</dd>
                    </div>
                    <div className="text-right">
                      <dt className="uppercase text-[0.65rem] font-semibold tracking-widest text-text-500">Price</dt>
                      <dd className="text-2xl font-bold text-primary-700">{item.price}</dd>
                      <dd className="text-xs text-text-500">{item.unit}</dd>
                    </div>
                    <div>
                      <dt className="uppercase text-[0.65rem] font-semibold tracking-widest text-text-500">Origin</dt>
                      <dd className="font-medium text-text-800">{item.origin}</dd>
                    </div>
                    <div className="text-right">
                      <dt className="uppercase text-[0.65rem] font-semibold tracking-widest text-text-500">Availability</dt>
                      <dd className="font-medium text-text-800">{item.availability}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-text-500 uppercase tracking-widest">
                      <span>Sustainable Farming</span>
                      <span>Verified Seller</span>
                    </div>
                    <button type="button" className="btn-primary w-full text-sm font-semibold uppercase tracking-widest">
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="card bg-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-text-900">Browse by Category</h2>
              <p className="text-sm text-text-600">Filter produce to match your inventory needs.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`btn-outline px-4 py-2 text-xs font-semibold uppercase tracking-wider transition-all ${
                    category === selectedCategory
                      ? "bg-primary-50 text-primary-700 border-primary-700"
                      : ""
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* All Produce Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-900">
              {selectedCategory === "All Produce" ? "All Available Produce" : selectedCategory}
            </h2>
            {searchQuery && (
              <p className="text-sm text-text-600">
                Showing results for: <span className="font-semibold text-primary-700">"{searchQuery}"</span>
              </p>
            )}
          </div>

          {filteredProduce.length === 0 ? (
            <div className="card bg-white text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold text-text-900 mb-2">No produce found</h3>
              <p className="text-sm text-text-600 mb-4">
                Try adjusting your search or browse all categories
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All Produce");
                }}
                className="btn-outline text-sm font-semibold uppercase tracking-widest"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProduce.map((item) => (
                <article
                  key={item.id}
                  className="card h-full flex flex-col gap-4 bg-white hover:shadow-lg transition-shadow duration-200"
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl md:text-5xl select-none">{item.emoji}</div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-semibold text-text-900">{item.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.badges.map((badge) => (
                          <span
                            key={badge}
                            className="inline-flex items-center rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-700"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-sm text-text-600 leading-relaxed">
                    {item.description}
                  </p>

                  <dl className="grid grid-cols-2 gap-y-3 text-sm text-text-700 bg-background-100 rounded-lg p-4">
                    <div>
                      <dt className="uppercase text-[0.65rem] font-semibold tracking-widest text-text-500">Category</dt>
                      <dd className="font-medium text-text-800">{item.category}</dd>
                    </div>
                    <div className="text-right">
                      <dt className="uppercase text-[0.65rem] font-semibold tracking-widest text-text-500">Price</dt>
                      <dd className="text-2xl font-bold text-primary-700">{item.price}</dd>
                      <dd className="text-xs text-text-500">{item.unit}</dd>
                    </div>
                    <div>
                      <dt className="uppercase text-[0.65rem] font-semibold tracking-widest text-text-500">Origin</dt>
                      <dd className="font-medium text-text-800">{item.origin}</dd>
                    </div>
                    <div className="text-right">
                      <dt className="uppercase text-[0.65rem] font-semibold tracking-widest text-text-500">Availability</dt>
                      <dd className="font-medium text-text-800">{item.availability}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs text-text-500 uppercase tracking-widest">
                      <span>Sustainable Farming</span>
                      <span>Verified Seller</span>
                    </div>
                    <button type="button" className="btn-primary w-full text-sm font-semibold uppercase tracking-widest">
                      Add to Cart
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="card bg-white flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-text-900">Need bulk quantities?</h3>
            <p className="text-sm text-text-600">Partner with FreshHarvest logistics for cold-chain deliveries across India.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="btn-primary text-xs font-semibold uppercase tracking-widest">
              Contact Sales Team
            </button>
            <button type="button" className="btn-outline text-xs font-semibold uppercase tracking-widest">
              Download Product Sheet
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
}
