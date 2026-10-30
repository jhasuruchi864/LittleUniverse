const https = require('https');

// Supported styles with specialized romantic prompt expansions
const STYLE_PROMPTS = {
  'chibi': 'Adorable 3D chibi couple miniature style, big expressive cute eyes, rosy blush cheeks, soft clay-like pastel rendering, warm gentle romantic lighting, Pixar and Pop Mart aesthetic, ultra high definition.',
  'anime': 'Dreamy romantic anime couple style, delicate watercolor linework, luminous gentle eyes, wind-blown hair, soft pastel cherry blossom aesthetic, Makoto Shinkai and Studio Ghibli inspired, glowing starlight.',
  'cartoon': 'Charming romantic cartoon illustration, playful joyful expressions, rounded friendly shapes, cozy pastel storybook art style, clean vector gradients, warm heart accents.',
  'clay': 'Handmade cute clay-style 3D characters couple, miniature stop-motion figurine aesthetic, tactile texture, soft gentle studio lighting, pastel pink and lavender clay world.',
  'fairytale': 'Pastel fairytale couple illustration, enchanted glowing flowers, whimsical storybook fantasy, golden sparkles, magical romance, tender smiles, Disney fairytale aesthetic.',
  'cherry-blossoms': 'Romantic couple standing together under blooming cherry blossom trees, falling sakura petals, soft pink morning sunlight, gentle romantic breeze, tender loving smiles.',
  'rainy-day': 'Cozy romantic rainy-day couple sharing a cute pastel umbrella, soft raindrops glistening, warm streetlamp glow, reflective puddles, intimate loving embrace.',
  'moonlight': 'Romantic moonlight date scene, couple illuminated by glowing silver moonbeams, deep pastel indigo night sky, twinkling stars, dreamy tender romantic atmosphere.',
  'hug': 'Adorable romantic couple sharing a sweet warm hug, eyes gently closed with joyful loving smiles, hearts floating around them, cozy pastel knitwear, pure romantic comfort.',
  'hands': 'Tender romantic couple holding hands tightly, gentle blushing smiles, close-up perspective of unity and love, glowing fairy lights in background, warm romantic feeling.',
  'polaroid': 'Romantic Polaroid instant photo illustration, soft vintage grain, slightly faded nostalgic pastel film colors, handwritten tiny heart border, authentic candid romantic moment.',
  'matching-pfp': 'Cute matching couple profile pictures portrait composition, centered, symmetrical charm, complementary pastel outfits, adorable blushing expressions, romantic avatar design.'
};

const SCENE_PROMPTS = {
  'clouds': 'Floating gently on fluffy pink and lavender pastel clouds in a dreamy sky kingdom with heart-shaped stars.',
  'garden': 'Surrounded by a blooming secret garden of pastel pink roses, glowing peonies, and fluttering butterflies.',
  'cafe': 'Sitting at a cozy romantic outdoor café table with steaming heart-latte cups, pastel Parisian bistro vibes.',
  'stargazing': 'Lying together on a soft hill under a breathtaking blanket of twinkling stars and a glowing violet nebula.',
  'sunset': 'Standing on a serene pastel beach during a warm golden-pink sunset with gentle waves washing the shore.',
  'bedroom': 'Relaxing in a cute dreamy bedroom filled with fairy lights, plush heart pillows, and a cozy pastel aesthetic.',
  'rainy-window': 'Sitting beside a rain-streaked window looking out at gentle city lights while staying warm and cozy together.',
  'heart-universe': 'Floating within a magical cosmic heart universe surrounded by glowing crystal constellations and floating mini-hearts.'
};

function getProviderStatus() {
  const providers = [];
  if (process.env.OPENAI_API_KEY) providers.push('OpenAI (DALL-E 3)');
  if (process.env.STABILITY_API_KEY) providers.push('Stability AI');
  if (process.env.GEMINI_API_KEY) providers.push('Google Imagen');

  return {
    configured: providers.length > 0,
    providers,
    activeProvider: providers[0] || null,
    message: providers.length > 0
      ? `AI generation is active using ${providers[0]}.`
      : 'No AI image generation provider credentials found in server environment (.env). Configure OPENAI_API_KEY, STABILITY_API_KEY, or GEMINI_API_KEY to enable live generation.'
  };
}

function buildPrompt({ styleKey, sceneKey, customPrompt, person1Gender, person2Gender, description }) {
  const styleText = STYLE_PROMPTS[styleKey] || STYLE_PROMPTS['chibi'];
  const sceneText = SCENE_PROMPTS[sceneKey] || SCENE_PROMPTS['heart-universe'];

  let subjectDesc = 'A loving romantic couple';
  if (person1Gender && person2Gender) {
    subjectDesc = `A loving romantic couple (${person1Gender} and ${person2Gender})`;
  }

  let prompt = `${subjectDesc}, happy and in love, preserving their recognizable hair and facial essence in artistic form. ${styleText} Scene setting: ${sceneText}.`;

  if (description) {
    prompt += ` Based on reference features: ${description.trim()}.`;
  }

  if (customPrompt && customPrompt.trim()) {
    prompt += ` Additional details: ${customPrompt.trim()}.`;
  }

  prompt += ' Highly detailed, beautiful composition, warm emotional connection, vibrant pastel romantic color palette, masterpiece quality, no distortions, no watermark.';

  return prompt;
}

// Call OpenAI DALL-E 3 API
async function generateWithOpenAI(apiKey, prompt, aspect = 'square') {
  return new Promise((resolve, reject) => {
    let size = '1024x1024';
    if (aspect === 'portrait') size = '1024x1792';
    if (aspect === 'landscape') size = '1792x1024';

    const payload = JSON.stringify({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      response_format: 'b64_json',
      quality: 'standard'
    });

    const req = https.request({
      hostname: 'api.openai.com',
      path: '/v1/images/generations',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300 && parsed.data && parsed.data[0]) {
            const b64 = parsed.data[0].b64_json;
            const revised = parsed.data[0].revised_prompt || prompt;
            resolve({
              success: true,
              dataUrl: `data:image/png;base64,${b64}`,
              revisedPrompt: revised,
              provider: 'OpenAI DALL-E 3'
            });
          } else {
            const errMsg = parsed.error ? parsed.error.message : `OpenAI Error (HTTP ${res.statusCode})`;
            reject(new Error(errMsg));
          }
        } catch (e) {
          reject(new Error(`Failed to parse OpenAI response: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

// Main Generation Dispatcher
async function generateCoupleArtwork({
  styleKey = 'chibi',
  sceneKey = 'heart-universe',
  customPrompt = '',
  aspect = 'square',
  person1Photo = null,
  person2Photo = null,
  description = ''
}) {
  const status = getProviderStatus();
  if (!status.configured) {
    return {
      success: false,
      configured: false,
      code: 'API_KEY_REQUIRED',
      error: 'Image generation provider credentials are not configured in your server environment (.env). Please set OPENAI_API_KEY, STABILITY_API_KEY, or GEMINI_API_KEY.',
      setupHelp: {
        guide: 'To enable live AI generation, open or create a .env file in your project folder and add your API key:',
        example: 'OPENAI_API_KEY=sk-proj-your-key-here\n# or\nSTABILITY_API_KEY=sk-your-stability-key'
      }
    };
  }

  const prompt = buildPrompt({ styleKey, sceneKey, customPrompt, description });

  // Priority 1: OpenAI DALL-E 3
  if (process.env.OPENAI_API_KEY) {
    try {
      const result = await generateWithOpenAI(process.env.OPENAI_API_KEY, prompt, aspect);
      return result;
    } catch (err) {
      console.error('OpenAI generation failed:', err.message);
      return {
        success: false,
        error: `AI Generation failed: ${err.message}`,
        canRetry: true
      };
    }
  }

  return {
    success: false,
    error: 'Configured provider is currently unavailable.',
    canRetry: true
  };
}

module.exports = {
  STYLE_PROMPTS,
  SCENE_PROMPTS,
  getProviderStatus,
  buildPrompt,
  generateCoupleArtwork
};
