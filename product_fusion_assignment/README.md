# Product Fusion Assignment

## Overview

Product Fusion is a modern React-based e-commerce app focused on performance, modularity, and user experience. It features:

- Product filtering by category and search
- Shopping cart with quantity tracking
- Sales dashboard with rich data visualizations
- Optimized performance using React best practices

---

## 📁 Project Structure

```
product_fusion_assignment/
├── node_modules/           # Dependencies
├── public/                 # Static files
├── src/                    # Source code
│   ├── assets/             # Images, fonts, etc.
│   ├── components/         
│   │   ├── Dashboard.jsx   # Sales dashboard
│   │   ├── ProductPage.jsx # Product listing & filters
│   │   └── PRODUCTPAGE.md  # Docs for ProductPage
│   ├── styles/             
│   │   ├── Dashboard.css   # Dashboard styles
│   │   ├── App.css         # Global styles
│   │   └── index.css       # Base styles
│   ├── App.jsx             # Root component
│   ├── main.jsx            # App entry point
│   └── index.html          # HTML template
├── .gitignore              # Ignore rules
├── eslint.config.js        # ESLint config
├── package-lock.json       # Dependency lock
├── package.json            # Project config
├── README.md               # This file
└── vite.config.js          # Vite bundler config
```

---

## Total Task 2

### Task 1: Product Page Debugging

- List products with category & keyword filtering
- Add/remove items to/from cart
- Dynamic cart quantity management
- Optimized with `useMemo` & `useCallback`
- Modular design for easy maintenance

### Task 2: Sales Dashboard Creation

- Interactive charts via **Recharts**
- Sortable data table
- Summary panel with key metrics
- Filter by date and category
- Local storage caching for fast reloads

---

## Performance Optimizations

- **Memoization**: `useMemo` for derived state
- **Callback Stability**: `useCallback` for handlers
- **Component Memoization**: `React.memo` for product lists
- **Custom Hooks**: Encapsulated data fetching logic
- **Smart Caching**: Save API data in `localStorage`
- **Modular Architecture**: Break complex UI into reusable components

---