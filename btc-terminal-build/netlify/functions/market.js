exports.handler = async () => {
  try {
    const url = "https://api.coingecko.com/api/v3/coins/bitcoin?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false";
    const r = await fetch(url, { headers: process.env.COINGECKO_API_KEY ? { "x-cg-demo-api-key": process.env.COINGECKO_API_KEY } : {} });
    if (!r.ok) throw new Error(`CoinGecko returned ${r.status}`);
    const d = await r.json(), m = d.market_data || {};
    return { statusCode: 200, headers: { "content-type": "application/json", "cache-control": "public, max-age=60" },
      body: JSON.stringify({ source: "CoinGecko", updatedAt: new Date().toISOString(),
        price: m.current_price?.usd, change24h: m.price_change_percentage_24h,
        marketCap: m.market_cap?.usd, volume24h: m.total_volume?.usd,
        high24h: m.high_24h?.usd, low24h: m.low_24h?.usd,
        circulatingSupply: m.circulating_supply, ath: m.ath?.usd }) };
  } catch (e) { return { statusCode: 502, body: JSON.stringify({ error: e.message }) }; }
};