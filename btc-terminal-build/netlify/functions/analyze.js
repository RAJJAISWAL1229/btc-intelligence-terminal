const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Use POST for analysis." }) };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { statusCode: 503, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "Gemini is not configured. Add GEMINI_API_KEY in Netlify environment variables, then redeploy." }) };
  }

  try {
    const { title, summary, source } = JSON.parse(event.body || "{}");
    if (!title || typeof title !== "string") {
      return { statusCode: 400, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: "News headline is missing." }) };
    }

    const prompt = `You are a careful Bitcoin market-intelligence analyst. Analyze only the supplied news item. Do not invent facts, dates, prices, or causal certainty. Distinguish confirmed information from interpretation. A headline alone may be insufficient; say so in uncertainty. Assess likely BTC impact over the next hours to days, conditional on market expectations and actual price reaction. Return a JSON object with exactly these keys: summary (max 45 words), category, impact (Low/Medium/High), direction (Bullish/Bearish/Mixed/Neutral), score (integer 1-10 for potential significance, not probability), mechanisms (array of 2-3 concise strings), uncertainty (one sentence), watch_next (one sentence). Do not give trade instructions.\n\nSource: ${String(source || "Unknown").slice(0,160)}\nHeadline: ${title.slice(0,500)}\nDetails: ${String(summary || "No description provided").slice(0,3000)}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: "You produce evidence-conscious financial news analysis. Return valid JSON only, without markdown fences." }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json", maxOutputTokens: 700 }
      })
    });

    const raw = await response.text();
    let payload;
    try { payload = JSON.parse(raw); } catch { throw new Error(`Gemini returned an unreadable response (${response.status}).`); }
    if (!response.ok) {
      const detail = payload.error?.message || `Gemini API returned ${response.status}`;
      if (response.status === 429) throw new Error("Gemini free-tier rate limit reached. Wait and try again later; no paid upgrade is required.");
      if (response.status === 400 || response.status === 403) throw new Error(`Gemini API rejected the request: ${detail}. Check your API key, model access and Google AI Studio project.`);
      throw new Error(detail);
    }

    const text = payload.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    let result;
    try { result = JSON.parse(text); } catch { throw new Error("Gemini did not return valid JSON. Please retry this headline."); }
    if (!result || typeof result !== "object" || Array.isArray(result)) {
      throw new Error("Gemini returned an unexpected analysis format. Please retry this headline.");
    }

    const impacts = ["Low", "Medium", "High"];
    const directions = ["Bullish", "Bearish", "Mixed", "Neutral"];
    result.summary = String(result.summary || "Analysis unavailable").slice(0, 500);
    result.category = String(result.category || "General market news").slice(0, 100);
    result.impact = impacts.includes(result.impact) ? result.impact : "Medium";
    result.direction = directions.includes(result.direction) ? result.direction : "Mixed";
    result.score = Math.round(Math.max(1, Math.min(10, Number(result.score) || 5)));
    result.mechanisms = Array.isArray(result.mechanisms) ? result.mechanisms.slice(0, 3).map(x => String(x).slice(0, 220)) : [];
    result.uncertainty = String(result.uncertainty || "The available headline may not provide enough detail.").slice(0, 400);
    result.watch_next = String(result.watch_next || "Verify the original source and observe the market reaction.").slice(0, 400);

    return { statusCode: 200, headers: { "content-type": "application/json", "cache-control": "no-store" }, body: JSON.stringify({ ...result, aiProvider: "Google Gemini", model: MODEL }) };
  } catch (error) {
    return { statusCode: 502, headers: { "content-type": "application/json" }, body: JSON.stringify({ error: error.message || "AI analysis failed." }) };
  }
};
