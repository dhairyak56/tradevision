from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import random
from datetime import datetime

app = FastAPI(title="TradeVision API", version="1.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

import yfinance as yf
from datetime import datetime, timedelta

def get_real_stock_data(symbol: str):
    try:
        # Get real data from Yahoo Finance
        ticker = yf.Ticker(symbol)
        
        # Get current day data with 1-minute intervals
        hist = ticker.history(period="1d", interval="1m")
        
        if hist.empty:
            # Fallback to daily data if intraday fails
            hist = ticker.history(period="2d", interval="1d")
        
        # Get the latest price
        current_price = float(hist['Close'].iloc[-1])
        previous_price = float(hist['Close'].iloc[-2]) if len(hist) > 1 else current_price
        
        # Calculate change
        change = current_price - previous_price
        change_percent = (change / previous_price) * 100 if previous_price != 0 else 0
        
        # Get volume
        volume = int(hist['Volume'].iloc[-1]) if 'Volume' in hist.columns else 0
        
        return {
            "symbol": symbol,
            "price": round(current_price, 2),
            "change": round(change, 2),
            "change_percent": round(change_percent, 2),
            "volume": volume,
            "timestamp": datetime.now().isoformat()
        }
    
    except Exception as e:
        print(f"Error fetching data for {symbol}: {e}")
        # Return mock data as fallback
        return {
            "symbol": symbol,
            "price": 100.0 + random.uniform(-10, 10),
            "change": random.uniform(-5, 5),
            "change_percent": random.uniform(-5, 5),
            "volume": random.randint(100000, 10000000),
            "timestamp": datetime.now().isoformat()
        }

# Update your stock endpoint
@app.get("/api/stock/{symbol}")
async def get_stock(symbol: str):
    return get_real_stock_data(symbol.upper())


# Add this new endpoint for historical chart data
@app.get("/api/stock/{symbol}/history")
async def get_stock_history(symbol: str):
    try:
        ticker = yf.Ticker(symbol)
        # Get last 24 hours of data
        hist = ticker.history(period="1d", interval="5m")
        
        # Format for frontend charts
        chart_data = []
        for idx, row in hist.iterrows():
            chart_data.append({
                "time": idx.strftime("%H:%M"),
                "price": round(float(row['Close']), 2),
                "volume": int(row['Volume']),
                "open": round(float(row['Open']), 2),
                "high": round(float(row['High']), 2),
                "low": round(float(row['Low']), 2)
            })
        
        return chart_data[-24:]  # Return last 24 data points
    
    except Exception as e:
        print(f"Error fetching history for {symbol}: {e}")
        # Return mock historical data as fallback
        data = []
        base_price = 150
        for i in range(24):
            base_price += random.uniform(-2, 2)
            data.append({
                "time": f"{i}:00",
                "price": round(base_price, 2),
                "volume": random.randint(100000, 1000000),
                "open": round(base_price + random.uniform(-1, 1), 2),
                "high": round(base_price + random.uniform(0, 3), 2),
                "low": round(base_price - random.uniform(0, 3), 2)
            })
        return data


# Add crypto endpoint
@app.get("/api/crypto/{symbol}")
async def get_crypto(symbol: str):
    # For crypto, Yahoo Finance uses format like BTC-USD
    crypto_symbol = f"{symbol.upper()}-USD"
    return get_real_stock_data(crypto_symbol)

# API Routes
@app.get("/")
async def root():
    return {"message": "TradeVision API v1.0", "status": "active"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/stock/{symbol}")
async def get_stock(symbol: str):
    return generate_stock_price(symbol.upper())

@app.get("/api/news")
async def get_news():
    return [
        {"title": "Federal Reserve Signals Rate Pause", "sentiment": 75.5, "source": "Reuters"},
        {"title": "Tech Earnings Beat Expectations", "sentiment": 82.3, "source": "Bloomberg"},
        {"title": "Oil Prices Rise on Supply Concerns", "sentiment": 65.8, "source": "CNBC"}
    ]

@app.get("/api/options-flow")
async def get_options():
    return [
        {"symbol": "AAPL", "option_type": "call", "volume": 15420, "strike": 175, "unusual": True},
        {"symbol": "MSFT", "option_type": "put", "volume": 8750, "strike": 340, "unusual": False},
        {"symbol": "TSLA", "option_type": "call", "volume": 25600, "strike": 250, "unusual": True}
    ]

@app.get("/api/risk-metrics")
async def get_risk_metrics():
    return {
        "var_95": 2.5,
        "sharpe_ratio": 1.8,
        "beta": 1.2,
        "max_drawdown": 8.5,
        "correlation": 0.65
    }

if __name__ == "__main__":
    import os
    # Use Railway's PORT environment variable or default to 8000 for local
    port = int(os.environ.get("PORT", 8000))
    print(f"Starting server on port {port}")  # Debug log
    uvicorn.run(app, host="0.0.0.0", port=port)
