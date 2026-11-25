const FEEDS = [
  ["CoinDesk", "https://www.coindesk.com/arc/outboundfeeds/rss/"],
  ["Cointelegraph", "https://cointelegraph.com/rss"],
  ["Bitcoin Magazine", "https://bitcoinmagazine.com/.rss/full/"],
  ["Federal Reserve", "https://www.federalreserve.gov/feeds/press_all.xml"],
  ["SEC", "https://www.sec.gov/news/pressreleases.rss"],
  ["CFTC", "https://www.cftc.gov/PressRoom/PressReleases/rss"],
  ["RBI", "https://www.rbi.org.in/Scripts/BS_PressReleaseDisplay.aspx?prid=0"]
];
function xmlItems(xml, source) {
  const chunks = xml.match(/<(item|entry)[\s\S]*?<\/(item|entry)>/gi) || [];
  return chunks.slice(0, 15).map(x => {
    const get = (tag) => (x.match(new RegExp(`<${tag}[^>]*>([\\\\s\\\\S]*?)<\\\\/${tag}>`, "i")) || [,""])[1]
      .replace(/<!\[CDATA\[|\]\]>/g, "").replace(/<[^>]+>/g, "").trim();
    const link = get("link") || ((x.match(/<link[^>]+href="([^"]+)"/i)||[])[1] || "");
    return { title: get("title"), summary: get("description") || get("summary"), link, date: get("pubDate") || get("updated") || get("published"), source };
  }).filter(x => x.title);
}
exports.handler = async () => {
  const results = await Promise.all(FEEDS.map(async ([source, url]) => {
    try { const r = await fetch(url, { headers: { "user-agent": "BTCIntelligence/1.0" } }); if (!r.ok) return [];
      return xmlItems(await r.text(), source);
    } catch { return []; }
  }));
  const items = results.flat().sort((a,b) => new Date(b.date || 0) - new Date(a.date || 0)).slice(0, 60);
  return { statusCode: 200, headers: { "content-type": "application/json", "cache-control": "public, max-age=180" }, body: JSON.stringify({ items, updatedAt: new Date().toISOString(), sources: FEEDS.map(x=>x[0]) }) };
};