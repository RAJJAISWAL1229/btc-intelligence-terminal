# BTC Intelligence Terminal — Free Cloud AI Edition

This project uses Google's Gemini Developer API free tier for AI news analysis. AI inference runs on Google's cloud servers. **Your PC does not run the model and can be switched off after deployment.** No Ollama, local model, Claude API or OpenAI API is required.

## What you need

- A Google account for Google AI Studio
- A GitHub account
- A Netlify account
- An internet connection and a phone/computer browser

## Cost and free-tier guardrails

- **Gemini AI:** the project defaults to `gemini-3.8-flash`. Google's current pricing page lists a free tier for this model, subject to availability, quota and rate limits. If the free quota is exhausted, analysis returns an error and stops; this code does not switch to a paid model.
- **To avoid accidental charges:** do not add a payment method or enable paid billing for the Google project. If Google requires a billing upgrade for a feature or model, do not accept it; use only the free-tier model and quota.
- **Netlify:** this project is designed for the free hosting/functions tier. Netlify's plan limits and terms can change. Do not upgrade if your goal is zero cost.
- **BTC quote:** CoinGecko's public API is used without a key. Public access can be rate-limited. A free Demo API key is optional, not required for initial setup.
- **News:** public RSS feeds are used. Individual publishers can change, rate-limit or block feeds.
- **Calendar:** the official Investing.com widget is optional. Generate it on Investing.com and embed its HTTPS iframe URL. Follow its attribution and widget terms.
- **Not fully integrated:** ETF flows, derivatives, advanced on-chain metrics, cross-asset macro quotes, mining economics and sentiment modules are clearly marked as integration slots. Do not treat those panels as live data.

Google's free-tier terms state that submitted content may be used to improve its products. This app sends news headlines and descriptions for analysis. Do not send exchange credentials, API secrets, private account information or personal data.

## Part A — Create the free Gemini API key

1. On your phone or computer, open <https://aistudio.google.com/app/apikey>.
2. Sign in with your Google account.
3. Select an existing Google AI Studio project or create one when prompted.
4. Choose **Create API key** (wording may vary).
5. Copy the key and keep it private. If it is shown only once, save it in a password manager.
6. Do not paste the key into `index.html`, a public GitHub file, a screenshot, or this chat.
7. Check model availability and free quotas at <https://ai.google.dev/gemini-api/docs/pricing> before using it. The model ID is configurable because Google's model catalogue can change.

## Part B — Put the project on GitHub (Android-friendly)

1. Download and extract this ZIP.
2. Open the extracted `btc-terminal-build` folder.
3. Create a new repository at <https://github.com/new>. Name it `btc-intelligence-terminal`.
4. If GitHub offers **Add a README**, you may leave it unchecked because this ZIP already includes a README.
5. Create the repository.
6. Upload the *contents* of `btc-terminal-build` to the repository root, not the parent folder itself. At the root you must see `index.html`, `package.json`, `netlify.toml`, `.env.example`, and the `netlify` folder.
7. Inside `netlify`, there must be a `functions` folder containing `analyze.js`, `market.js`, and `news.js`.
8. Do not upload a real `.env` file or your API key. `.env.example` contains only a placeholder and is safe to keep.

If GitHub's mobile upload flow does not preserve folders, use GitHub Desktop on a computer or upload the repository using the Git command line. The directory structure is essential for Netlify Functions to deploy.

## Part C — Deploy on Netlify

1. Open <https://app.netlify.com/> and sign in.
2. Choose **Add new project** / **Import an existing project**.
3. Choose GitHub and authorize Netlify if requested.
4. Select the `btc-intelligence-terminal` repository.
5. In the deploy settings use:
   - Build command: `npm run build`
   - Publish directory: `.`
   - Functions directory: `netlify/functions` (already specified in `netlify.toml`; do not create a second conflicting setting if Netlify detects it automatically).
6. Start the deployment and wait until Netlify reports that it is published.
7. Open the generated `https://....netlify.app` address. Do not open `index.html` from your phone's Downloads folder; a `content://` or `file://` preview cannot run the Netlify backend functions.

## Part D — Add the Gemini key to Netlify securely

1. Open your Netlify site dashboard.
2. Go to **Project configuration → Environment variables** (the exact menu wording can vary).
3. Choose **Add a variable**.
4. Enter the variable name exactly: `GEMINI_API_KEY`.
5. Paste the Google AI Studio key into the value field.
6. Save the variable. Do not add quotation marks around the key.
7. Optional: add `GEMINI_MODEL` with value `gemini-3.8-flash`. If omitted, the backend already uses this default.
8. Do not add a billing/payment method if you want to stay on the free tier. Do not enable paid billing. The code does not initiate payment or auto-upgrade.
9. Open **Deploys → Trigger deploy → Deploy site**. Redeploy after adding or changing environment variables so the function receives the new value.

The key is read by the server-side Netlify Function only. It is not embedded in the browser HTML.

## Part E — Test each feature

1. Open your Netlify URL on your phone.
2. The BTC quote should appear if CoinGecko's public endpoint is available and has not rate-limited the request.
3. News should load if the RSS publishers respond to Netlify's requests.
4. Open **Global news & AI**.
5. Choose a headline and tap **AI impact analysis**.
6. The result should include summary, category, impact, direction, significance score, mechanisms, uncertainty and what to watch next.
7. If you see **Gemini is not configured**, check `GEMINI_API_KEY` in Netlify and redeploy.
8. If you see **429**, the free quota/rate limit was reached. Wait for it to reset; do not upgrade if you want to remain free.
9. If you see **400/403**, verify that the key is valid, the model is available to your project and the project is eligible for the free tier.

## Part F — Connect the Investing.com calendar (optional)

1. Open <https://www.investing.com/webmaster-tools/economiccalendar>.
2. Select United States and India.
3. Set the widget timezone to Asia/Kolkata / UTC+5:30.
4. Choose the Actual, Forecast, Previous and Importance columns and the impact levels you want.
5. Generate the official widget.
6. Copy its iframe HTML or iframe URL.
7. In the terminal, open **Economic calendar**, paste the generated iframe code/URL and choose **Connect calendar**.
8. The terminal stores the widget URL in that browser's local storage. Repeat on another device if needed.

The project accepts HTTPS iframe URLs from `investing.com` and its subdomains only. It does not scrape Investing.com or claim to use a public Investing.com API.

## Troubleshooting

- **Blank or local-preview page:** use the deployed Netlify URL, not a local file preview.
- **Function 404:** confirm that the `netlify/functions` folder is at the repository root and that `netlify.toml` is present; trigger a fresh deploy.
- **Gemini key missing:** add `GEMINI_API_KEY` as a Netlify environment variable and redeploy.
- **Gemini 429:** wait for the free quota window to reset. No paid fallback is implemented.
- **Gemini 400/403:** verify the key, selected Google project, region and current free-tier model availability.
- **No BTC quote:** CoinGecko's public endpoint may be rate-limited. Retry later. A free CoinGecko Demo key can optionally be stored in Netlify as `COINGECKO_API_KEY`.
- **No headlines:** public RSS sources may be temporarily unavailable or block automated requests.
- **Calendar blank:** confirm that the copied iframe URL is HTTPS and belongs to Investing.com; some widgets may restrict embedding or require their generated code/terms to be followed.

## Code checks performed for this package

- Node syntax validation for all three Netlify Functions.
- JavaScript syntax validation for the inline browser script in `index.html`.
- ZIP contents and expected project directory structure inspected.
- The AI function checks the HTTP method, required key, headline, API response status and JSON response shape; it returns a clear quota message on HTTP 429.

These checks are static/local checks. They do not guarantee that Google, CoinGecko, RSS publishers, Investing.com or Netlify will be reachable from every network or that free quotas will always be available.

## Trading and data disclaimer

This is a research dashboard, not an exchange execution system or a trading signal. News impact is an AI interpretation of the supplied headline/description, not verified fact, a price forecast or financial advice. Confirm important events with primary sources and compare actual market reaction with expectations.
