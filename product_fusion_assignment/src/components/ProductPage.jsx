import React, { useState, useEffect, useMemo, useCallback } from 'react';

// Memoized ProductCard Component
const ProductCard = React.memo(({ product, onAddToCart }) => (
  <div className="product-card">
    <img src={product.image} alt={product.title} />
    <h3>{product.title}</h3>
    <p>${product.price}</p>
    <button onClick={() => onAddToCart(product)}>Add to Cart</button>
  </div>
));

// Filters Component
const ProductFilters = ({ categories, selectedCategory, onCategoryChange, searchTerm, onSearchChange }) => (
  <div className="filters">
    <input 
      type="text" 
      placeholder="Search products..." 
      value={searchTerm}
      onChange={onSearchChange}
    />
    <select value={selectedCategory} onChange={onCategoryChange}>
      <option value="">All Categories</option>
      {categories.map(category => (
        <option key={category} value={category}>{category}</option>
      ))}
    </select>
  </div>
);

// Shopping Cart Component
const ShoppingCart = ({ items, onRemoveItem, total }) => (
  <div className="cart">
    <h2>Shopping Cart</h2>
    {items.length === 0 ? (
      <p>Your cart is empty</p>
    ) : (
      <>
        {items.map(item => (
          <div key={item.id} className="cart-item">
            <span>{item.title} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
            <button onClick={() => onRemoveItem(item.id)}>Remove</button>
          </div>
        ))}
        <div className="cart-total">
          <strong>Total: ${total}</strong>
        </div>
      </>
    )}
  </div>
);

// Custom Hook for fetching products and categories
const useProductData = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    fetch('https://fakestoreapi.com/products')
      .then(response => {
        if (!response.ok) throw new Error('Failed to fetch products');
        return response.json();
      })
      .then(data => {
        if (!isMounted) return;
        setProducts(data);
        const uniqueCategories = [...new Set(data.map(p => p.category))];
        setCategories(uniqueCategories);
        setIsLoading(false);
      })
      .catch(err => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load products');
        setIsLoading(false);
      });

    return () => { isMounted = false; };
  }, []);

  return { products, categories, isLoading, error };
};

// Main Product Page
const ProductPage = () => {
  const { products, categories, isLoading, error } = useProductData();

  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);

  // Filter logic with memoization
  const filteredProducts = useMemo(() => {
    let result = products;

    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }

    if (searchTerm) {
      result = result.filter(product =>
        product.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return result;
  }, [products, selectedCategory, searchTerm]);

  // Add to Cart with useCallback
  const addToCart = useCallback((product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  }, []);

  // Remove from Cart
  const removeFromCart = useCallback((productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  }, []);

  // Total calculation
  const cartTotal = useMemo(() => (
    cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2)
  ), [cart]);

  // Memoized Product Cards
  const productCards = useMemo(() =>
    filteredProducts.map(product => (
      <ProductCard
        key={product.id}
        product={product}
        onAddToCart={addToCart}
      />
    )), [filteredProducts, addToCart]
  );

  return (
    <div className="product-page">
      <ProductFilters
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={(e) => setSelectedCategory(e.target.value)}
        searchTerm={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
      />

      {isLoading && <p>Loading products...</p>}
      {error && <p className="error">{error}</p>}

      <div className="product-grid">
        {!isLoading && productCards}
      </div>

      <ShoppingCart
        items={cart}
        onRemoveItem={removeFromCart}
        total={cartTotal}
      />
    </div>
  );
};

export default ProductPage;
