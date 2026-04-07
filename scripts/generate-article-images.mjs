import { writeFile, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const XAI_API_KEY = process.env.XAI_API_KEY;
if (!XAI_API_KEY) { console.error('Set XAI_API_KEY'); process.exit(1); }

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const imagesDir = join(process.cwd(), 'public', 'images', 'articles');

const files = (await readdir(articlesDir)).filter(f => f.endsWith('.md'));
const missing = [];

for (const f of files) {
  const content = await readFile(join(articlesDir, f), 'utf-8');
  const thumbMatch = content.match(/thumbnail:\s*"([^"]+)"/);
  if (!thumbMatch) continue;
  const imgPath = thumbMatch[1].replace(/^\/images\/articles\//, '');
  if (!existsSync(join(imagesDir, imgPath))) {
    const promptMatch = content.match(/image_prompt:\s*"([^"]+)"/);
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    missing.push({
      file: f,
      image: imgPath,
      title: titleMatch?.[1] || f,
      prompt: promptMatch?.[1] || null,
    });
  }
}

console.log(`${missing.length} images to generate`);

for (let i = 0; i < missing.length; i++) {
  const item = missing[i];

  // Use the article's custom prompt, or fall back to title-based
  let prompt;
  if (item.prompt) {
    prompt = `Editorial photograph. ${item.prompt}. 35mm film, photojournalism.`;
  } else {
    prompt = `Editorial photograph for a news article titled "${item.title}". Photojournalistic, 35mm film, real-world scene that an editor would pick to make someone click on this story. Specific, dramatic, visually interesting.`;
  }

  console.log(`Generating: ${item.image}`);
  console.log(`  Prompt: ${prompt.slice(0, 150)}...`);
  try {
    const resp = await fetch('https://api.x.ai/v1/images/generations', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${XAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'grok-imagine-image',
        prompt,
        n: 1,
        response_format: 'url',
      }),
    });
    if (!resp.ok) { console.error(`  Error: ${resp.status}`); continue; }
    const data = await resp.json();
    const imgResp = await fetch(data.data[0].url);
    const buffer = Buffer.from(await imgResp.arrayBuffer());
    await writeFile(join(imagesDir, item.image), buffer);
    console.log(`  Saved (${(buffer.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
  }
}
console.log('Done!');
