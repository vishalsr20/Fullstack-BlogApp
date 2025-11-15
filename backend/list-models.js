// list-models.js
require("dotenv").config();
const API_KEY = process.env.GOOGLE_API_KEY;
if (!API_KEY) {
  console.error("Set GOOGLE_API_KEY in .env and rerun");
  process.exit(1);
}

async function call(url) {
  const res = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const json = await res.json();
  console.log("URL:", url);
  console.log("HTTP", res.status);
  console.log(JSON.stringify(json, null, 2));
  return { status: res.status, json };
}

(async () => {
  try {
    // try v1beta first (AI Studio keys often support v1beta)
    await call(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);

    // also try v1 (some keys are for Google Cloud)
    await call(`https://generativelanguage.googleapis.com/v1/models?key=${API_KEY}`);
  } catch (err) {
    console.error("Error listing models:", err);
  }
})();
