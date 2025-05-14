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

# Mock data generators
def generate_stock_price(symbol: str):
    base_prices = {"AAPL": 175, "MSFT": 350, "GOOGL": 135, "TSLA": 250}
    base_price = base_prices.get(symbol, 100)
    price = base_price + random.uniform(-10, 10)
    change = random.uniform(-5, 5)
    return {
        "symbol": symbol,
        "price": round(price, 2),
        "change": round(change, 2),
        "change_percent": round((change / price) * 100, 2),
        "volume": random.randint(100000, 10000000),
        "timestamp": datetime.now().isoformat()
    }

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
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
