
# Sales Dashboard

This Sales Dashboard component was built with React to visualize, sort, and analyze sales data effectively. It offers interactive features like filtering, responsive design, caching, and rich visual insights.

---

## Features Implemented

### 1. **Data Fetching & State Management**
- Utilizes React hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- Fetches data from a mock API with proper **loading** and **error handling**
- Implements **localStorage caching** with 1-hour expiry to reduce API calls

### 2. **Dashboard Components**

#### Chart Visualization
- Responsive line chart using **Recharts**
- Displays sales trends over time per category
- Custom **date formatting**, tooltips, and **color-coded lines**

#### Data Table
- Sortable table with **dynamic columns** based on selected category
- Supports **ascending/descending** sorting
- Responsive design with formatted dates for readability

#### Summary Statistics Panel
- Summary cards for:
  - Total Sales  
  - Average Daily Sales  
  - Peak Day Sales  
  - Lowest Day Sales  
- Updates automatically based on filtered data

### 3. **Filtering & Interactions**
- **Date range filtering** (start & end date)
- **Category filtering** to focus on specific products
- **Refresh button** to bypass cache and reload fresh data
- Filters affect all components consistently

### 4. **Optimization Techniques**
- `useMemo` for derived state (e.g., summary metrics)
- Smart localStorage caching keyed by filters
- Controlled re-renders using correct dependency arrays

### 5. **Error Handling & Loading States**
- Smooth UX with loading spinners and graceful fallbacks
- Clean error messages when API calls fail

### 6. **Responsive Design**
- Built with **CSS Grid** and **Flexbox**
- Media queries for mobile & tablet layouts
- All components are fully responsive to container size

---

## Technical Details

### Data Caching Strategy
- Caches data in `localStorage` with timestamps and expiry
- Uses **filter-based cache keys** (date + category)
- Validates cache freshness before usage
- Manual **refresh** button clears and re-fetches data

### Chart Implementation
- Built with **Recharts**
- Dynamic data series per category
- Responsive chart with tooltips & date formatting

### Table Implementation
- Interactive sortable columns
- Dynamically generated columns
- Memoized for performance
- Formats values as currency and dates

### Filter Controls
- Validated **date pickers**
- Dropdown for category selection
- Refresh button
- Clean UI with intuitive layout

---