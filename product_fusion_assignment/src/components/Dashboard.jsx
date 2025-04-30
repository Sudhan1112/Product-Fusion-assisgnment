import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import '../styles/Dashboard.css';

const Dashboard = () => {
  // State management
  const [salesData, setSalesData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date().toISOString().split('T')[0] // today
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'date',
    direction: 'ascending'
  });

  // Available categories
  const categories = useMemo(() => [
    'all', 'electronics', 'clothing', 'home', 'beauty'
  ], []);

  // Data fetching with cache
  const fetchSalesData = useCallback(async (bypassCache = false) => {
    const cacheKey = `salesData_${selectedCategory}_${dateRange.startDate}_${dateRange.endDate}`;
    const cachedData = localStorage.getItem(cacheKey);
    const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
    const cacheExpiry = 60 * 60 * 1000; // 1 hour in milliseconds
    
    // Use cache if valid and not bypassing
    if (
      !bypassCache && 
      cachedData && 
      cacheTimestamp && 
      (Date.now() - parseInt(cacheTimestamp)) < cacheExpiry
    ) {
      setSalesData(JSON.parse(cachedData));
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulating API call with timeout
      // In a real app, this would be a fetch call to your API endpoint
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock data generation - replace with actual API call
      const mockData = generateMockSalesData(dateRange.startDate, dateRange.endDate);
      
      setSalesData(mockData);
      
      // Update cache
      localStorage.setItem(cacheKey, JSON.stringify(mockData));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    } catch (err) {
      setError('Failed to fetch sales data. Please try again later.');
      console.error('Error fetching sales data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, dateRange]);

  // Initial data load
  useEffect(() => {
    fetchSalesData();
  }, [fetchSalesData]);

  // Filter data based on selected category and date range
  const filteredData = useMemo(() => {
    if (!salesData.length) return [];
    
    return salesData.filter(item => {
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const itemDate = new Date(item.date);
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      endDate.setHours(23, 59, 59, 999); // Include the entire end date
      
      const matchesDateRange = itemDate >= startDate && itemDate <= endDate;
      return matchesCategory && matchesDateRange;
    });
  }, [salesData, selectedCategory, dateRange]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!filteredData.length) return [];
    
    const sortableData = [...filteredData];
    sortableData.sort((a, b) => {
      if (sortConfig.key === 'date') {
        return sortConfig.direction === 'ascending' 
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date);
      }
      
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'ascending' 
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'ascending' ? 1 : -1;
      }
      return 0;
    });
    
    return sortableData;
  }, [filteredData, sortConfig]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    if (!filteredData.length) {
      return {
        totalSales: 0,
        averageDailySales: 0,
        peakSales: 0,
        lowestSales: 0
      };
    }
    
    const total = filteredData.reduce((sum, item) => sum + item.amount, 0);
    
    // Group by date to get daily totals
    const dailySales = filteredData.reduce((acc, item) => {
      const date = item.date.split('T')[0];
      acc[date] = (acc[date] || 0) + item.amount;
      return acc;
    }, {});
    
    const dailyValues = Object.values(dailySales);
    const uniqueDaysCount = dailyValues.length;
    
    return {
      totalSales: total.toFixed(2),
      averageDailySales: (total / uniqueDaysCount).toFixed(2),
      peakSales: Math.max(...dailyValues).toFixed(2),
      lowestSales: Math.min(...dailyValues).toFixed(2)
    };
  }, [filteredData]);

  // Chart data transformation
  const chartData = useMemo(() => {
    if (!filteredData.length) return [];
    
    // Group data by date
    const groupedByDate = filteredData.reduce((acc, item) => {
      const date = item.date.split('T')[0];
      if (!acc[date]) {
        acc[date] = { date, total: 0 };
        // Initialize each category with 0
        categories.forEach(category => {
          if (category !== 'all') {
            acc[date][category] = 0;
          }
        });
      }
      
      acc[date].total += item.amount;
      if (item.category !== 'all' && categories.includes(item.category)) {
        acc[date][item.category] += item.amount;
      }
      
      return acc;
    }, {});
    
    // Convert to array and sort by date
    return Object.values(groupedByDate).sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredData, categories]);

  // Event handlers
  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRefresh = () => {
    fetchSalesData(true); // bypass cache
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending'
    }));
  };

  // Helper function to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(value);
  };

  // Helper function to format dates
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1>Sales Dashboard</h1>
        <div className="dashboard-controls">
          <div className="filter-group">
            <label>
              Category:
              <select value={selectedCategory} onChange={handleCategoryChange}>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </option>
                ))}
              </select>
            </label>
          </div>
          
          <div className="filter-group">
            <label>
              From:
              <input 
                type="date" 
                name="startDate" 
                value={dateRange.startDate} 
                onChange={handleDateChange}
                max={dateRange.endDate}
              />
            </label>
            <label>
              To:
              <input 
                type="date" 
                name="endDate" 
                value={dateRange.endDate} 
                onChange={handleDateChange}
                min={dateRange.startDate}
              />
            </label>
          </div>
          
          <button className="refresh-button" onClick={handleRefresh}>
            Refresh Data
          </button>
        </div>
      </header>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading sales data...</p>
        </div>
      )}

      {error && (
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={handleRefresh}>Try Again</button>
        </div>
      )}

      {!isLoading && !error && (
        <div className="dashboard-content">
          <section className="stats-cards">
            <div className="stat-card">
              <h3>Total Sales</h3>
              <p>{formatCurrency(summaryStats.totalSales)}</p>
            </div>
            <div className="stat-card">
              <h3>Average Daily Sales</h3>
              <p>{formatCurrency(summaryStats.averageDailySales)}</p>
            </div>
            <div className="stat-card">
              <h3>Peak Sales</h3>
              <p>{formatCurrency(summaryStats.peakSales)}</p>
            </div>
            <div className="stat-card">
              <h3>Lowest Sales</h3>
              <p>{formatCurrency(summaryStats.lowestSales)}</p>
            </div>
          </section>

          <section className="chart-container">
            <h2>Sales Trend</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={formatDate}
                  tick={{ fontSize: 12 }}
                />
                <YAxis
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={formatDate}
                />
                <Legend />
                
                {selectedCategory === 'all' ? (
                  // Show all categories
                  categories.filter(c => c !== 'all').map((category, index) => (
                    <Line
                      key={category}
                      type="monotone"
                      dataKey={category}
                      name={category.charAt(0).toUpperCase() + category.slice(1)}
                      stroke={getCategoryColor(category, index)}
                      activeDot={{ r: 8 }}
                    />
                  ))
                ) : (
                  // Show only selected category
                  <Line
                    type="monotone"
                    dataKey={selectedCategory}
                    name={selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
                    stroke={getCategoryColor(selectedCategory, 0)}
                    activeDot={{ r: 8 }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </section>

          <section className="table-container">
            <h2>Sales Data</h2>
            <table className="data-table">
              <thead>
                <tr>
                  <th onClick={() => handleSort('date')}>
                    Date {getSortIndicator('date')}
                  </th>
                  <th onClick={() => handleSort('category')}>
                    Category {getSortIndicator('category')}
                  </th>
                  <th onClick={() => handleSort('product')}>
                    Product {getSortIndicator('product')}
                  </th>
                  <th onClick={() => handleSort('amount')}>
                    Amount {getSortIndicator('amount')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="no-data">No sales data available for the selected filters</td>
                  </tr>
                ) : (
                  sortedData.map((item, index) => (
                    <tr key={`${item.id}-${index}`}>
                      <td>{formatDate(item.date)}</td>
                      <td>
                        <span 
                          className="category-badge"
                          style={{ backgroundColor: getCategoryColor(item.category, categories.indexOf(item.category)) }}
                        >
                          {item.category.charAt(0).toUpperCase() + item.category.slice(1)}
                        </span>
                      </td>
                      <td>{item.product}</td>
                      <td className="amount-cell">{formatCurrency(item.amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </section>
        </div>
      )}
    </div>
  );

  // Helper function to get sort indicator
  function getSortIndicator(key) {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'ascending' ? '↑' : '↓';
  }

  // Helper function to get color based on category
  function getCategoryColor(category, index) {
    const colors = ['#2563eb', '#dc2626', '#16a34a', '#9333ea', '#f59e0b'];
    const categoryColors = {
      electronics: '#2563eb', // blue
      clothing: '#dc2626',    // red
      home: '#16a34a',        // green
      beauty: '#9333ea'       // purple
    };
    
    return categoryColors[category] || colors[index % colors.length];
  }
};

// Helper function to generate mock sales data
function generateMockSalesData(startDate, endDate) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
  
  const categories = ['electronics', 'clothing', 'home', 'beauty'];
  const products = {
    electronics: ['Smartphone', 'Laptop', 'Headphones', 'Tablet', 'Smart Watch'],
    clothing: ['T-Shirt', 'Jeans', 'Dress', 'Jacket', 'Shoes'],
    home: ['Sofa', 'Dining Table', 'Bed', 'Lamp', 'Rug'],
    beauty: ['Moisturizer', 'Shampoo', 'Perfume', 'Makeup Kit', 'Face Mask']
  };
  
  const result = [];
  
  // Generate data for each day
  for (let i = 0; i < daysDiff; i++) {
    const currentDate = new Date(start);
    currentDate.setDate(start.getDate() + i);
    
    // Generate 3-8 sales entries per day
    const entriesCount = Math.floor(Math.random() * 6) + 3;
    
    for (let j = 0; j < entriesCount; j++) {
      const categoryIndex = Math.floor(Math.random() * categories.length);
      const category = categories[categoryIndex];
      const productIndex = Math.floor(Math.random() * products[category].length);
      const product = products[category][productIndex];
      
      // Amount between $10 and $500
      const amount = Math.round((Math.random() * 490 + 10) * 100) / 100;
      
      result.push({
        id: `sale-${result.length + 1}`,
        date: currentDate.toISOString(),
        category,
        product,
        amount
      });
    }
  }
  
  return result;
}

export default Dashboard;