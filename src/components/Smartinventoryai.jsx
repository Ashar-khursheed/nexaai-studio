import { useState, useEffect } from 'react';
// import './SmartInventoryAI.css';

const SmartInventoryAI = () => {
  const [inventory, setInventory] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [view, setView] = useState('dashboard'); // dashboard, inventory, analytics, predictions
  const [aiInsights, setAiInsights] = useState([]);
  
  const [newItem, setNewItem] = useState({
    name: '',
    sku: '',
    quantity: 0,
    minStock: 0,
    maxStock: 0,
    category: 'Electronics',
    price: 0,
    supplier: ''
  });

  // Initialize with sample data
  useEffect(() => {
    const sampleInventory = [
      {
        id: 1,
        name: 'Laptop Pro 15"',
        sku: 'LAP-001',
        quantity: 45,
        minStock: 20,
        maxStock: 100,
        category: 'Electronics',
        price: 1299.99,
        supplier: 'Tech Supplies Inc',
        salesHistory: [12, 15, 18, 14, 16, 20, 22, 19, 17, 21, 24, 18],
        lastRestocked: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 2,
        name: 'Wireless Mouse',
        sku: 'MOU-002',
        quantity: 8,
        minStock: 15,
        maxStock: 80,
        category: 'Accessories',
        price: 29.99,
        supplier: 'Peripheral Pro',
        salesHistory: [8, 10, 12, 9, 11, 13, 10, 14, 12, 15, 11, 13],
        lastRestocked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 3,
        name: 'Office Chair Deluxe',
        sku: 'CHR-003',
        quantity: 65,
        minStock: 25,
        maxStock: 75,
        category: 'Furniture',
        price: 349.99,
        supplier: 'Comfort Seating',
        salesHistory: [5, 6, 7, 5, 8, 6, 7, 9, 6, 7, 8, 10],
        lastRestocked: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 4,
        name: 'USB-C Cable 6ft',
        sku: 'CAB-004',
        quantity: 120,
        minStock: 50,
        maxStock: 200,
        category: 'Accessories',
        price: 14.99,
        supplier: 'Cable Co',
        salesHistory: [20, 22, 25, 23, 24, 28, 26, 30, 27, 32, 29, 35],
        lastRestocked: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
    setInventory(sampleInventory);
  }, []);

  // AI Functions
  const calculateDemandTrend = (salesHistory) => {
    if (!salesHistory || salesHistory.length < 2) return 0;
    
    const recentSales = salesHistory.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderSales = salesHistory.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    
    return ((recentSales - olderSales) / olderSales) * 100;
  };

  const predictNextMonthDemand = (salesHistory) => {
    if (!salesHistory || salesHistory.length === 0) return 0;
    
    // Simple weighted moving average with trend adjustment
    const weights = [1, 1.2, 1.5, 2];
    const recentData = salesHistory.slice(-4);
    
    let weightedSum = 0;
    let weightTotal = 0;
    
    recentData.forEach((sale, index) => {
      const weight = weights[index] || 1;
      weightedSum += sale * weight;
      weightTotal += weight;
    });
    
    const trend = calculateDemandTrend(salesHistory);
    const basePrediction = weightedSum / weightTotal;
    
    return Math.round(basePrediction * (1 + trend / 100));
  };

  const calculateReorderPoint = (item) => {
    const avgDailySales = item.salesHistory.reduce((a, b) => a + b, 0) / item.salesHistory.length / 30;
    const leadTime = 7; // Assumed 7 days lead time
    const safetyStock = avgDailySales * 3; // 3 days safety stock
    
    return Math.ceil((avgDailySales * leadTime) + safetyStock);
  };

  const calculateOptimalOrderQuantity = (item) => {
    const predictedDemand = predictNextMonthDemand(item.salesHistory);
    const currentStock = item.quantity;
    const reorderPoint = calculateReorderPoint(item);
    
    const orderQty = Math.max(0, (predictedDemand * 2) - currentStock);
    return Math.min(orderQty, item.maxStock - currentStock);
  };

  const getStockStatus = (item) => {
    const reorderPoint = calculateReorderPoint(item);
    
    if (item.quantity === 0) return { status: 'out-of-stock', label: 'Out of Stock', color: '#ff4444' };
    if (item.quantity < item.minStock) return { status: 'critical', label: 'Critical', color: '#ff6b35' };
    if (item.quantity < reorderPoint) return { status: 'low', label: 'Low Stock', color: '#ffc107' };
    if (item.quantity > item.maxStock * 0.9) return { status: 'overstock', label: 'Overstock', color: '#9c27b0' };
    return { status: 'healthy', label: 'Healthy', color: '#4caf50' };
  };

  const generateAIInsights = () => {
    const insights = [];
    
    inventory.forEach(item => {
      const status = getStockStatus(item);
      const trend = calculateDemandTrend(item.salesHistory);
      const prediction = predictNextMonthDemand(item.salesHistory);
      const optimalOrder = calculateOptimalOrderQuantity(item);
      
      if (status.status === 'critical' || status.status === 'low') {
        insights.push({
          type: 'warning',
          priority: status.status === 'critical' ? 'high' : 'medium',
          item: item.name,
          message: `${item.name} is running low. Current: ${item.quantity}, Reorder now: ${optimalOrder} units`,
          action: 'reorder',
          actionData: { itemId: item.id, quantity: optimalOrder }
        });
      }
      
      if (trend > 50) {
        insights.push({
          type: 'opportunity',
          priority: 'medium',
          item: item.name,
          message: `${item.name} demand surging (+${trend.toFixed(0)}%). Consider increasing stock levels.`,
          action: 'increase-stock'
        });
      }
      
      if (trend < -30 && item.quantity > item.maxStock * 0.8) {
        insights.push({
          type: 'info',
          priority: 'low',
          item: item.name,
          message: `${item.name} demand declining (${trend.toFixed(0)}%). Consider promotions to clear stock.`,
          action: 'promotion'
        });
      }
      
      if (status.status === 'overstock') {
        insights.push({
          type: 'warning',
          priority: 'low',
          item: item.name,
          message: `${item.name} is overstocked. Current: ${item.quantity}, Max: ${item.maxStock}`,
          action: 'reduce-orders'
        });
      }
    });
    
    // Sort by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    insights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    setAiInsights(insights.slice(0, 10));
  };

  useEffect(() => {
    if (inventory.length > 0) {
      generateAIInsights();
    }
  }, [inventory]);

  const handleAddItem = () => {
    if (!newItem.name || !newItem.sku) return;
    
    const item = {
      ...newItem,
      id: Date.now(),
      quantity: parseInt(newItem.quantity) || 0,
      minStock: parseInt(newItem.minStock) || 0,
      maxStock: parseInt(newItem.maxStock) || 0,
      price: parseFloat(newItem.price) || 0,
      salesHistory: Array(12).fill(0).map(() => Math.floor(Math.random() * 10) + 5),
      lastRestocked: new Date().toISOString()
    };
    
    setInventory([...inventory, item]);
    setNewItem({
      name: '',
      sku: '',
      quantity: 0,
      minStock: 0,
      maxStock: 0,
      category: 'Electronics',
      price: 0,
      supplier: ''
    });
    setShowAddModal(false);
  };

  const handleUpdateQuantity = (itemId, change) => {
    setInventory(inventory.map(item => {
      if (item.id === itemId) {
        const newQty = Math.max(0, item.quantity + change);
        return { 
          ...item, 
          quantity: newQty,
          lastRestocked: change > 0 ? new Date().toISOString() : item.lastRestocked
        };
      }
      return item;
    }));
  };

  const handleDeleteItem = (itemId) => {
    setInventory(inventory.filter(item => item.id !== itemId));
    setSelectedItem(null);
  };

  const getTotalValue = () => {
    return inventory.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };

  const getStockStatusCounts = () => {
    const counts = { critical: 0, low: 0, healthy: 0, overstock: 0 };
    inventory.forEach(item => {
      const status = getStockStatus(item);
      counts[status.status] = (counts[status.status] || 0) + 1;
    });
    return counts;
  };

  // Dashboard View
  const renderDashboard = () => {
    const statusCounts = getStockStatusCounts();
    const totalValue = getTotalValue();
    const totalItems = inventory.reduce((sum, item) => sum + item.quantity, 0);
    
    return (
      <div className="dashboard-view">
        <div className="stats-grid">
          <div className="stat-card total">
            <div className="stat-icon">📦</div>
            <div className="stat-info">
              <div className="stat-label">Total Items</div>
              <div className="stat-value">{totalItems.toLocaleString()}</div>
            </div>
          </div>
          
          <div className="stat-card value">
            <div className="stat-icon">💰</div>
            <div className="stat-info">
              <div className="stat-label">Total Value</div>
              <div className="stat-value">${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
            </div>
          </div>
          
          <div className="stat-card products">
            <div className="stat-icon">🏷️</div>
            <div className="stat-info">
              <div className="stat-label">Products</div>
              <div className="stat-value">{inventory.length}</div>
            </div>
          </div>
          
          <div className="stat-card alerts">
            <div className="stat-icon">⚠️</div>
            <div className="stat-info">
              <div className="stat-label">Alerts</div>
              <div className="stat-value">{statusCounts.critical + statusCounts.low}</div>
            </div>
          </div>
        </div>

        <div className="insights-section">
          <h3>🤖 AI Insights & Recommendations</h3>
          <div className="insights-list">
            {aiInsights.length === 0 ? (
              <div className="no-insights">All systems optimal! No urgent actions needed.</div>
            ) : (
              aiInsights.map((insight, index) => (
                <div key={index} className={`insight-card ${insight.type} priority-${insight.priority}`}>
                  <div className="insight-header">
                    <span className="insight-icon">
                      {insight.type === 'warning' ? '⚠️' : insight.type === 'opportunity' ? '💡' : 'ℹ️'}
                    </span>
                    <span className="insight-priority">{insight.priority.toUpperCase()}</span>
                  </div>
                  <div className="insight-message">{insight.message}</div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="quick-status">
          <h3>📊 Stock Status Overview</h3>
          <div className="status-bars">
            <div className="status-bar">
              <div className="status-label">
                <span>🔴 Critical</span>
                <span>{statusCounts.critical}</span>
              </div>
              <div className="status-progress">
                <div className="status-fill critical" style={{ width: `${(statusCounts.critical / inventory.length) * 100}%` }}></div>
              </div>
            </div>
            
            <div className="status-bar">
              <div className="status-label">
                <span>🟡 Low Stock</span>
                <span>{statusCounts.low}</span>
              </div>
              <div className="status-progress">
                <div className="status-fill low" style={{ width: `${(statusCounts.low / inventory.length) * 100}%` }}></div>
              </div>
            </div>
            
            <div className="status-bar">
              <div className="status-label">
                <span>🟢 Healthy</span>
                <span>{statusCounts.healthy}</span>
              </div>
              <div className="status-progress">
                <div className="status-fill healthy" style={{ width: `${(statusCounts.healthy / inventory.length) * 100}%` }}></div>
              </div>
            </div>
            
            <div className="status-bar">
              <div className="status-label">
                <span>🟣 Overstock</span>
                <span>{statusCounts.overstock}</span>
              </div>
              <div className="status-progress">
                <div className="status-fill overstock" style={{ width: `${(statusCounts.overstock / inventory.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Inventory View
  const renderInventory = () => {
    return (
      <div className="inventory-view">
        <div className="inventory-header">
          <h3>📋 Inventory Items</h3>
          <button className="add-btn" onClick={() => setShowAddModal(true)}>
            ➕ Add New Item
          </button>
        </div>
        
        <div className="inventory-grid">
          {inventory.map(item => {
            const status = getStockStatus(item);
            const prediction = predictNextMonthDemand(item.salesHistory);
            
            return (
              <div key={item.id} className="inventory-card" onClick={() => setSelectedItem(item)}>
                <div className="card-header">
                  <h4>{item.name}</h4>
                  <span className="sku">{item.sku}</span>
                </div>
                
                <div className="card-body">
                  <div className="quantity-display">
                    <span className="qty-label">Current Stock</span>
                    <span className="qty-value" style={{ color: status.color }}>{item.quantity}</span>
                  </div>
                  
                  <div className="stock-range">
                    <span className="range-label">Min: {item.minStock}</span>
                    <div className="range-bar">
                      <div className="range-fill" style={{ 
                        width: `${Math.min((item.quantity / item.maxStock) * 100, 100)}%`,
                        backgroundColor: status.color
                      }}></div>
                    </div>
                    <span className="range-label">Max: {item.maxStock}</span>
                  </div>
                  
                  <div className="card-stats">
                    <div className="stat-item">
                      <span className="stat-label">Category</span>
                      <span className="stat-value">{item.category}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Price</span>
                      <span className="stat-value">${item.price}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">Predicted Demand</span>
                      <span className="stat-value">{prediction} units/mo</span>
                    </div>
                  </div>
                  
                  <div className="status-badge" style={{ backgroundColor: status.color }}>
                    {status.label}
                  </div>
                </div>
                
                <div className="card-actions">
                  <button className="action-btn small" onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item.id, -1); }}>➖</button>
                  <button className="action-btn small" onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item.id, 1); }}>➕</button>
                  <button className="action-btn small" onClick={(e) => { e.stopPropagation(); handleUpdateQuantity(item.id, 10); }}>+10</button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Analytics View
  const renderAnalytics = () => {
    return (
      <div className="analytics-view">
        <h3>📈 Predictive Analytics</h3>
        
        <div className="analytics-grid">
          {inventory.map(item => {
            const trend = calculateDemandTrend(item.salesHistory);
            const prediction = predictNextMonthDemand(item.salesHistory);
            const reorderPoint = calculateReorderPoint(item);
            const optimalOrder = calculateOptimalOrderQuantity(item);
            
            return (
              <div key={item.id} className="analytics-card">
                <h4>{item.name}</h4>
                
                <div className="chart-container">
                  <div className="chart-title">Sales History (Last 12 Months)</div>
                  <div className="mini-chart">
                    {item.salesHistory.map((sale, index) => (
                      <div key={index} className="chart-bar">
                        <div 
                          className="bar-fill"
                          style={{ 
                            height: `${(sale / Math.max(...item.salesHistory)) * 100}%`,
                            backgroundColor: index >= 9 ? '#4caf50' : '#64b5f6'
                          }}
                        ></div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-labels">
                    <span>Jan</span>
                    <span>Dec</span>
                  </div>
                </div>
                
                <div className="analytics-metrics">
                  <div className="metric">
                    <span className="metric-label">📊 Demand Trend</span>
                    <span className={`metric-value ${trend > 0 ? 'positive' : 'negative'}`}>
                      {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
                    </span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">🔮 Next Month Forecast</span>
                    <span className="metric-value">{prediction} units</span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">🎯 Reorder Point</span>
                    <span className="metric-value">{reorderPoint} units</span>
                  </div>
                  
                  <div className="metric">
                    <span className="metric-label">📦 Suggested Order</span>
                    <span className="metric-value highlight">{optimalOrder} units</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Modal for Item Details
  const renderItemModal = () => {
    if (!selectedItem) return null;
    
    const status = getStockStatus(selectedItem);
    const trend = calculateDemandTrend(selectedItem.salesHistory);
    const prediction = predictNextMonthDemand(selectedItem.salesHistory);
    const optimalOrder = calculateOptimalOrderQuantity(selectedItem);
    
    return (
      <div className="modal-overlay" onClick={() => setSelectedItem(null)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>{selectedItem.name}</h3>
            <button className="close-btn" onClick={() => setSelectedItem(null)}>✕</button>
          </div>
          
          <div className="modal-body">
            <div className="detail-grid">
              <div className="detail-item">
                <span className="detail-label">SKU</span>
                <span className="detail-value">{selectedItem.sku}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Category</span>
                <span className="detail-value">{selectedItem.category}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Price</span>
                <span className="detail-value">${selectedItem.price}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Supplier</span>
                <span className="detail-value">{selectedItem.supplier}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Current Stock</span>
                <span className="detail-value" style={{ color: status.color }}>{selectedItem.quantity}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Status</span>
                <span className="detail-value" style={{ color: status.color }}>{status.label}</span>
              </div>
            </div>
            
            <div className="ai-recommendations">
              <h4>🤖 AI Recommendations</h4>
              <div className="recommendation">
                <span>Demand Trend:</span>
                <span className={trend > 0 ? 'positive' : 'negative'}>
                  {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}%
                </span>
              </div>
              <div className="recommendation">
                <span>Forecasted Demand:</span>
                <span>{prediction} units next month</span>
              </div>
              <div className="recommendation highlight">
                <span>Recommended Order:</span>
                <span>{optimalOrder} units</span>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="action-btn" onClick={() => handleUpdateQuantity(selectedItem.id, optimalOrder)}>
                📦 Order {optimalOrder} Units
              </button>
              <button className="action-btn danger" onClick={() => handleDeleteItem(selectedItem.id)}>
                🗑️ Delete Item
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Add Item Modal
  const renderAddModal = () => {
    if (!showAddModal) return null;
    
    return (
      <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Add New Item</h3>
            <button className="close-btn" onClick={() => setShowAddModal(false)}>✕</button>
          </div>
          
          <div className="modal-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              
              <div className="form-group">
                <label>SKU</label>
                <input
                  type="text"
                  value={newItem.sku}
                  onChange={(e) => setNewItem({ ...newItem, sku: e.target.value })}
                  placeholder="Enter SKU"
                />
              </div>
              
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                >
                  <option>Electronics</option>
                  <option>Furniture</option>
                  <option>Accessories</option>
                  <option>Office Supplies</option>
                  <option>Other</option>
                </select>
              </div>
              
              <div className="form-group">
                <label>Initial Quantity</label>
                <input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>Min Stock Level</label>
                <input
                  type="number"
                  value={newItem.minStock}
                  onChange={(e) => setNewItem({ ...newItem, minStock: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>Max Stock Level</label>
                <input
                  type="number"
                  value={newItem.maxStock}
                  onChange={(e) => setNewItem({ ...newItem, maxStock: e.target.value })}
                  placeholder="0"
                />
              </div>
              
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={newItem.price}
                  onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                  placeholder="0.00"
                />
              </div>
              
              <div className="form-group">
                <label>Supplier</label>
                <input
                  type="text"
                  value={newItem.supplier}
                  onChange={(e) => setNewItem({ ...newItem, supplier: e.target.value })}
                  placeholder="Enter supplier name"
                />
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="action-btn" onClick={handleAddItem}>
                ➕ Add Item
              </button>
              <button className="action-btn secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="smart-inventory-ai">
      <header className="app-header">
        <h1>🤖 Smart Inventory AI</h1>
        <p>AI-Powered Inventory Management & Demand Forecasting</p>
      </header>
      
      <nav className="app-nav">
        <button 
          className={`nav-btn ${view === 'dashboard' ? 'active' : ''}`}
          onClick={() => setView('dashboard')}
        >
          📊 Dashboard
        </button>
        <button 
          className={`nav-btn ${view === 'inventory' ? 'active' : ''}`}
          onClick={() => setView('inventory')}
        >
          📦 Inventory
        </button>
        <button 
          className={`nav-btn ${view === 'analytics' ? 'active' : ''}`}
          onClick={() => setView('analytics')}
        >
          📈 Analytics
        </button>
      </nav>
      
      <main className="app-content">
        {view === 'dashboard' && renderDashboard()}
        {view === 'inventory' && renderInventory()}
        {view === 'analytics' && renderAnalytics()}
      </main>
      
      {renderItemModal()}
      {renderAddModal()}
    </div>
  );
};

export default SmartInventoryAI;