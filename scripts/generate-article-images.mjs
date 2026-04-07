import { writeFile, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const FAL_KEY = process.env.FAL_KEY;
if (!FAL_KEY) { console.error('Set FAL_KEY'); process.exit(1); }

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const imagesDir = join(process.cwd(), 'public', 'images', 'articles');

async function generateImage(prompt) {
  const resp = await fetch('https://fal.run/fal-ai/flux-pro', {
    method: 'POST',
    headers: {
      'Authorization': `Key ${FAL_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt,
      image_size: { width: 1024, height: 576 }, // 16:9, under 1MP = $0.03
      num_images: 1,
      safety_tolerance: 6,
    }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`${resp.status}: ${err}`);
  }

  return await resp.json();
}

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

console.log(`${missing.length} images to generate (~$${(missing.length * 0.03).toFixed(2)})`);

for (let i = 0; i < missing.length; i++) {
  const item = missing[i];

  let prompt;
  if (item.prompt) {
    prompt = `Editorial photograph. ${item.prompt}. 35mm film, photojournalism.`;
  } else {
    prompt = `Editorial photograph for a news article titled "${item.title}". Photojournalistic, 35mm film, real-world scene that an editor would pick to make someone click on this story.`;
  }

  console.log(`[${i + 1}/${missing.length}] ${item.image}`);
  console.log(`  Prompt: ${prompt.slice(0, 120)}...`);
  try {
    const result = await generateImage(prompt);
    const imageUrl = result.images?.[0]?.url;
    if (!imageUrl) { console.error('  No image URL'); continue; }

    const imgResp = await fetch(imageUrl);
    const buffer = Buffer.from(await imgResp.arrayBuffer());
    await writeFile(join(imagesDir, item.image), buffer);
    console.log(`  Saved (${(buffer.length / 1024).toFixed(0)} KB)`);
  } catch (err) {
    console.error(`  Failed: ${err.message}`);
  }
}
console.log('Done!');
