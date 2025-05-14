import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import axios from 'axios';

const TradeVision = () => {
  const [marketData, setMarketData] = useState([]);
  const [newsData, setNewsData] = useState([]);
  const [optionsFlow, setOptionsFlow] = useState([]);
  const [riskMetrics, setRiskMetrics] = useState({});
  const [selectedStock, setSelectedStock] = useState('AAPL');
  const [currentPrice, setCurrentPrice] = useState(0);
  const [priceChange, setPriceChange] = useState(0);

  const API_BASE = 'http://localhost:8000';

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch stock data
        const stockResponse = await axios.get(`${API_BASE}/api/stock/${selectedStock}`);
        setCurrentPrice(stockResponse.data.price);
        setPriceChange(stockResponse.data.change);

        // Fetch news
        const newsResponse = await axios.get(`${API_BASE}/api/news`);
        setNewsData(newsResponse.data);

        // Fetch options flow
        const optionsResponse = await axios.get(`${API_BASE}/api/options-flow`);
        setOptionsFlow(optionsResponse.data);

        // Fetch risk metrics
        const riskResponse = await axios.get(`${API_BASE}/api/risk-metrics`);
        setRiskMetrics(riskResponse.data);

        // Generate mock market data for charts
        const generateMarketData = () => {
          const data = [];
          let price = stockResponse.data.price;
          for (let i = 0; i < 24; i++) {
            price += (Math.random() - 0.5) * 5;
            data.push({
              time: `${i}:00`,
              price: Number(price.toFixed(2)),
              volume: Math.floor(Math.random() * 1000000),
            });
          }
          return data;
        };
        setMarketData(generateMarketData());

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [selectedStock]);

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="header">
        <h1 className="title">TradeVision</h1>
        <p className="subtitle">Intelligent Market Analysis Platform</p>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-3">
        
        {/* Stock Overview Card */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Stock Overview</h2>
            <select 
              value={selectedStock} 
              onChange={(e) => setSelectedStock(e.target.value)}
              className="select"
            >
              <option value="AAPL">AAPL</option>
              <option value="MSFT">MSFT</option>
              <option value="GOOGL">GOOGL</option>
              <option value="TSLA">TSLA</option>
            </select>
          </div>
          <div className="price">${currentPrice.toFixed(2)}</div>
          <div className={`change ${priceChange >= 0 ? 'positive' : 'negative'}`}>
            {priceChange >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
            <span>{priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)} ({((priceChange / currentPrice) * 100).toFixed(2)}%)</span>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="card">
          <h2 className="card-title">Risk Metrics</h2>
          <div className="metrics">
            <div className="metric">
              <span className="metric-label">VaR (95%)</span>
              <span className="metric-value red">{riskMetrics.var_95}%</span>
            </div>
            <div className="metric">
              <span className="metric-label">Sharpe Ratio</span>
              <span className="metric-value green">{riskMetrics.sharpe_ratio}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Beta</span>
              <span className="metric-value">{riskMetrics.beta}</span>
            </div>
            <div className="metric">
              <span className="metric-label">Max Drawdown</span>
              <span className="metric-value red">{riskMetrics.max_drawdown}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-2">
        
        {/* Price Chart */}
        <div className="card">
          <h2 className="card-title">
            <TrendingUp size={20} />
            Price Movement (24H)
          </h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Line type="monotone" dataKey="price" stroke="#3b82f6" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Volume Chart */}
        <div className="card">
          <h2 className="card-title">Volume Analysis</h2>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="time" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '8px' }}
                  labelStyle={{ color: '#f3f4f6' }}
                />
                <Bar dataKey="volume" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* News Sentiment Analysis */}
      <div className="card">
        <h2 className="card-title">News Sentiment Analysis</h2>
        <div>
          {newsData.map((news, index) => (
            <div key={index} className="news-item">
              <div className="news-header">
                <div>
                  <h3 className="news-title">{news.title}</h3>
                  <p className="news-source">{news.source}</p>
                </div>
                <div className="news-sentiment">
                  <div className="sentiment-label">Sentiment</div>
                  <div className="sentiment-value" style={{ color: news.sentiment >= 70 ? '#22c55e' : news.sentiment >= 40 ? '#f59e0b' : '#ef4444' }}>
                    {news.sentiment}%
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Options Flow Intelligence */}
      <div className="card">
        <h2 className="card-title">Unusual Options Activity</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Type</th>
              <th>Volume</th>
              <th>Strike</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {optionsFlow.map((option, index) => (
              <tr key={index}>
                <td style={{ fontWeight: 'bold' }}>{option.symbol}</td>
                <td style={{ color: option.option_type === 'call' ? '#22c55e' : '#ef4444' }}>
                  {option.option_type}
                </td>
                <td>{option.volume.toLocaleString()}</td>
                <td>${option.strike}</td>
                <td>
                  {option.unusual ? (
                    <span style={{ backgroundColor: '#92400e', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem' }}>
                      Unusual
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af' }}>Normal</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* AI Recommendations */}
      <div className="card">
        <h2 className="card-title">AI Trading Recommendations</h2>
        <div className="recommendations">
          <div className="recommendation buy">
            <div className="signal-type buy">BUY SIGNAL</div>
            <div className="symbol">AAPL</div>
            <div className="target">Target: $185 (+7.3%)</div>
            <div className="reason buy">Strong earnings momentum</div>
          </div>
          <div className="recommendation sell">
            <div className="signal-type sell">SELL SIGNAL</div>
            <div className="symbol">META</div>
            <div className="target">Target: $285 (-5.2%)</div>
            <div className="reason sell">Regulatory concerns</div>
          </div>
          <div className="recommendation hold">
            <div className="signal-type hold">HOLD</div>
            <div className="symbol">MSFT</div>
            <div className="target">Range: $340-$360</div>
            <div className="reason hold">Consolidation phase</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="footer">
        <p>TradeVision - Real-time market analysis powered by your API</p>
        <p>Connected to API at {API_BASE}</p>
      </div>
    </div>
  );
};

export default TradeVision;
