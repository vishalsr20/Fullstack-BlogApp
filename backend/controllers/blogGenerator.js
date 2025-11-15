// generateBlog-and-create.js
// Node 18+ recommended (global fetch). If Node < 18, install node-fetch:
// npm i node-fetch
// and uncomment the import below:
// const fetch = (await import("node-fetch")).default;

require("dotenv").config();
const { Readable } = require("stream");
const cloudinary = require("cloudinary").v2; // make sure cloudinary.config(...) is done elsewhere
const Blog = require("../models/blogSchema"); // adjust path if needed
const User = require("../models/user"); // adjust path if needed

// ----------------- Helper functions (required) -----------------
const STABLE_PREFERRED = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-flash-latest",
  "gemini-pro-latest",
  "gemini-1.5-flash",
  "chat-bison-001",
  "text-bison-001"
];

function isLikelyGenerativeModel(name) {
  if (!name || typeof name !== "string") return false;
  const tokens = ["gemini", "bison", "chat-bison", "text-bison", "imagen"];
  return tokens.some(t => name.toLowerCase().includes(t));
}

function normalizeFullModelName(fullName) {
  if (!fullName) return null;
  return fullName.includes("/") ? fullName.split("/").pop() : fullName;
}

function pickStableModelsList(modelsList) {
  const names = modelsList.map(m => m.name);
  const candidates = [];

  for (const p of STABLE_PREFERRED) {
    const found = names.find(n => n === p || n?.endsWith(`/${p}`) || n?.includes(`/${p}`));
    if (found && !/preview|exp|experimental|beta|tts/i.test(found)) candidates.push(found);
  }

  for (const n of names) {
    if (!/preview|exp|experimental|beta|tts/i.test(n) && isLikelyGenerativeModel(n) && !candidates.includes(n)) {
      candidates.push(n);
    }
  }

  if (candidates.length === 0) {
    for (const n of names) {
      if (isLikelyGenerativeModel(n) && !candidates.includes(n)) candidates.push(n);
    }
  }

  if (candidates.length === 0) return names;
  return candidates;
}

function extractTextFromGenerateResp(json) {
  if (!json) return null;
  if (Array.isArray(json.candidates) && json.candidates.length) {
    const cand = json.candidates[0];
    if (Array.isArray(cand.content)) return cand.content.map(p => p.text || "").join("\n").trim();
    if (cand?.content?.parts && Array.isArray(cand.content.parts)) return cand.content.parts.map(p => p.text || "").join("\n").trim();
    if (typeof cand.text === "string") return cand.text.trim();
  }
  if (Array.isArray(json.output) && json.output.length) {
    const out = json.output[0];
    if (Array.isArray(out.content)) return out.content.map(p => p.text || "").join("\n").trim();
  }
  if (typeof json.text === "string") return json.text.trim();
  if (typeof json.outputText === "string") return json.outputText.trim();
  try { return JSON.stringify(json); } catch (e) { return null; }
}

function extractJsonFromText(text) {
  if (!text || typeof text !== "string") return null;
  try { return JSON.parse(text); } catch (e) {}
  const first = text.indexOf("{");
  const last = text.lastIndexOf("}");
  if (first === -1 || last === -1 || last <= first) return null;
  const candidate = text.slice(first, last + 1).replace(/,\s*}/g, "}").replace(/,\s*]/g, "]");
  try { return JSON.parse(candidate); } catch (e) { return null; }
}

async function listModels(apiVersion, API_KEY) {
  const url = `https://generativelanguage.googleapis.com/${apiVersion}/models?key=${API_KEY}`;
  const r = await fetch(url, { headers: { "Content-Type": "application/json" } });
  const json = await r.json().catch(() => null);
  return { status: r.status, json, url };
}

async function tryGenerateWithModel(apiVersion, modelId, API_KEY, body, attempts = 2) {
  const endpoint = `https://generativelanguage.googleapis.com/${apiVersion}/models/${encodeURIComponent(modelId)}:generateContent?key=${API_KEY}`;
  let lastErr = null;
  for (let i = 0; i < attempts; i++) {
    try {
      const resp = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await resp.json().catch(() => null);
      if (resp.ok) return { ok: true, json: j, status: resp.status, endpoint };
      lastErr = { status: resp.status, json: j };
      if (resp.status === 503) {
        await new Promise(r => setTimeout(r, 400 * (i + 1)));
        continue;
      } else {
        break;
      }
    } catch (err) {
      lastErr = { error: String(err) };
      await new Promise(r => setTimeout(r, 400 * (i + 1)));
    }
  }
  return { ok: false, lastErr, endpoint };
}
// ----------------- End helpers -----------------

exports.generateBlog = async (req, res) => {
  try {
    
    const { title, tone, length, keyword } = req.body;
    console.log("title, ",title)
     console.log("tone, ",tone)
     console.log("length, ",length)
     console.log("keyword, ",keyword)
     console.log('content-type:', req.headers['content-type']);
console.log('req.body:', req.body);
console.log('req.file:', !!req.file, req.file && { originalname: req.file.originalname, size: req.file.size });

    if (!title || !tone || !length || !keyword) {
      return res.status(400).json({ success: false, message: "All fields required: title, tone, length, keyword" });
    }
    

    const API_KEY = process.env.GOOGLE_API_KEY;
    if (!API_KEY) return res.status(500).json({ success: false, message: "Missing GOOGLE_API_KEY in environment (.env)" });

    // 1) List models (try v1beta first, then v1)
    const v1beta = await listModels("v1beta", API_KEY);
    const v1 = await listModels("v1", API_KEY);

    const modelsList = Array.isArray(v1beta.json?.models) && v1beta.json.models.length
      ? v1beta.json.models
      : Array.isArray(v1.json?.models) && v1.json.models.length
        ? v1.json.models
        : [];

    if (!modelsList.length) {
      return res.status(500).json({
        success: false,
        message: "No models available for this API key (listModels returned empty). Check key/quota.",
        debug: { v1beta: v1beta.json, v1: v1.json }
      });
    }

    const candidatesFull = pickStableModelsList(modelsList);
    const candidates = candidatesFull.map(normalizeFullModelName).filter(Boolean);

    const prompt = `
You are a professional blog writer.
Write a complete blog draft using the following details:
- Title / Topic: "${title}"
- Tone: ${tone}
- REQUIRED length: between 350 and 450 words (STRICTLY ENFORCE)
- Primary keyword(s): ${keyword}

VERY IMPORTANT RULES:
- The total blog body (summary + all sections) MUST be between 350 and 450 words.
- If needed, add or expand sections to meet the requirement.
- Do NOT exceed 450 words and do NOT go below 350 words.
- Maintain the requested tone.
- Avoid political persuasion or harmful content.

Return ONLY a JSON object (no markdown, no explanation, no extra text):
{
  "title": "string",
  "summary": "string (approx 30-50 words)",
  "sections": [
    {"heading": "string", "body": "100-150 words"},
    {"heading": "string", "body": "100-150 words"},
    {"heading": "string", "body": "100-150 words"}
  ]
}
`;

    const body = {
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.15, maxOutputTokens: 2200 }
    };

    let finalJson = null;
    let usedModel = null;
    let usedApiVersion = null;
    let lastErrors = [];

    for (const candidate of candidates) {
      const fullMatch = modelsList.find(m => m.name?.includes(candidate) || m.name === candidate);
      const apiVersion = (v1beta.json?.models?.some(m => m.name === fullMatch?.name)) ? "v1beta" : "v1";
      const result = await tryGenerateWithModel(apiVersion, candidate, API_KEY, body, 2);

      if (result.ok) {
        finalJson = result.json;
        usedModel = candidate;
        usedApiVersion = apiVersion;
        break;
      } else {
        lastErrors.push({ candidate, apiVersion, err: result.lastErr ?? result });
      }
    }

    if (!finalJson) {
      return res.status(500).json({
        success: false,
        message: "All attempted models failed (see errors).",
        errors: lastErrors.slice(0, 5),
        modelsAvailable: modelsList.map(m => m.name)
      });
    }

    const rawText = extractTextFromGenerateResp(finalJson);
    if (!rawText) {
      return res.status(500).json({ success: false, message: "Unable to extract text from model response", modelResponse: finalJson });
    }

    const parsed = extractJsonFromText(rawText);
    if (!parsed) {
      return res.status(500).json({
        success: false,
        message: "Model returned non-JSON or unparsable JSON. Raw text included (truncated).",
        rawText: rawText.slice(0, 2000),
        modelResponse: finalJson
      });
    }

    if (!parsed.title || !parsed.summary || !Array.isArray(parsed.sections)) {
      return res.status(500).json({ success: false, message: "Parsed JSON missing required fields", parsed });
    }

    const content = [
      parsed.summary.trim(),
      ...parsed.sections.map(s => (s.heading ? `\n\n${s.heading}\n\n` : "\n\n") + (s.body || "").trim())
    ].join("\n").trim();

    const combinedText = [parsed.summary, ...(parsed.sections.map(s => s.body || ""))].join(" ");
    const approxWords = combinedText.split(/\s+/).filter(Boolean).length;

    // --- Create Blog document in DB
    const userId = req.user && req.user.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: user missing in request" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const username = user.username;
    const avatarImage = user.profileImage;

    // const image = req.file;
    // let imageUrl = '';
    // if (image) {
    //   const uploadResponse = await new Promise((resolve, reject) => {
    //     const uploadStream = cloudinary.uploader.upload_stream(
    //       { folder: 'techThinker' },
    //       (error, result) => {
    //         if (error) return reject(error);
    //         resolve(result);
    //       }
    //     );
    //     const readableImageStream = new Readable();
    //     readableImageStream.push(image.buffer);
    //     readableImageStream.push(null);
    //     readableImageStream.pipe(uploadStream);
    //   });
    //   imageUrl = uploadResponse.secure_url;
    // } else {
    //   imageUrl = 'https://res.cloudinary.com/djw5u4i50/image/upload/v1737143436/techThinker/ser2_v3bdlq.png';
    // }

    // handle image: prefer uploaded file (req.file), then body.imageUrl (remote), else fallback
let imageUrl = '';
const image = req.file;

if (image) {
  // existing multer memory upload -> cloudinary
  const uploadResponse = await new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'techThinker' },
      (error, result) => { if (error) return reject(error); resolve(result); }
    );
    const readableImageStream = new Readable();
    readableImageStream.push(image.buffer);
    readableImageStream.push(null);
    readableImageStream.pipe(uploadStream);
  });
  imageUrl = uploadResponse.secure_url;
} else if (req.body && req.body.imageUrl) {
  // client provided a remote image URL in JSON -> tell Cloudinary to fetch it
  const remote = String(req.body.imageUrl).trim();
  if (!/^https?:\/\//i.test(remote)) {
    return res.status(400).json({ success: false, message: "imageUrl must be an absolute http(s) URL" });
  }
  try {
    // cloudinary will download/fetch the remote image and store it under your account
    const uploadResp = await cloudinary.uploader.upload(remote, { folder: 'techThinker' });
    imageUrl = uploadResp.secure_url;
  } catch (err) {
    console.error("Cloudinary fetch/upload failed:", err);
    return res.status(500).json({ success: false, message: "Failed to fetch/upload remote image", error: String(err) });
  }
} else {
  // fallback default image
  imageUrl = 'https://res.cloudinary.com/djw5u4i50/image/upload/v1737143436/techThinker/ser2_v3bdlq.png';
}


    const category = req.body.category ? req.body.category.toLowerCase() : undefined;

    if (!parsed.title || !content || content.length < 20) {
      return res.status(400).json({ success: false, message: "Generated content invalid or too short" });
    }

    const blog = await Blog.create({
      title: parsed.title,
      content,
      category,
      author: userId,
      image: imageUrl,
      avatar: avatarImage,
      username: username
    });

    await User.findByIdAndUpdate(
      { _id: userId },
      { $push: { Blog: blog._id } }
    );

    return res.status(201).json({
      success: true,
      message: "Blog generated and created successfully",
      model: usedModel,
      apiVersion: usedApiVersion,
      approxWords,
      generated: parsed,
      blog
    });

  } catch (err) {
    console.error("generateBlog error:", err);
    return res.status(500).json({ success: false, message: "Server exception", error: String(err) });
  }
};
