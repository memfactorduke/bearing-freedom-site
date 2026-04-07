import { writeFile, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const XAI_API_KEY = process.env.XAI_API_KEY;
if (!XAI_API_KEY) { console.error('Set XAI_API_KEY'); process.exit(1); }

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const imagesDir = join(process.cwd(), 'public', 'images', 'articles');

// Short, direct prompts. The less you say, the more photorealistic the output.
function buildImagePrompt(title, content, styleIndex) {
  const lower = (title + ' ' + content).toLowerCase();

  // Pick ONE subject — the most editorially relevant thing
  let subject;

  // Firearms / gun-specific
  if (lower.includes('glock') || lower.includes('pistol ban') || lower.includes('handgun'))
    subject = 'a Glock handgun on a kitchen counter next to car keys and a coffee mug, morning light through a window';
  else if (lower.includes('ar-15') || lower.includes('assault weapon') || lower.includes('rifle ban'))
    subject = 'a man at an outdoor shooting range with a rifle, seen from behind, bright daylight';
  else if (lower.includes('machine gun') || lower.includes('fully automatic') || lower.includes('convertible'))
    subject = 'a gun shop display case with handguns, fluorescent lighting, shot through glass';
  else if (lower.includes('magazine ban') || lower.includes('magazine capacity'))
    subject = 'stacked pistol magazines on a concrete surface, harsh overhead light';
  else if (lower.includes('concealed carry') || lower.includes('holster') || lower.includes('open carry'))
    subject = 'a person walking down a suburban sidewalk, concealed carry holster visible at the hip, natural daylight';
  else if (lower.includes('ghost gun') || lower.includes('3d print'))
    subject = 'a 3D printer on a workbench in a garage, blue LED glow, cluttered background';
  else if (lower.includes('red flag') || lower.includes('confiscat'))
    subject = 'police cars parked outside a suburban house at dawn, flashing lights, fog';
  else if (lower.includes('self-defense') || lower.includes('home defense') || lower.includes('castle doctrine') || lower.includes('stand your ground'))
    subject = 'a front porch of an American home at night, motion sensor light on, dark street behind';

  // Courts / legal
  else if (lower.includes('supreme court') || lower.includes('scotus'))
    subject = 'the US Supreme Court building steps with a few people walking, overcast winter day';
  else if (lower.includes('bruen') || lower.includes('heller') || lower.includes('court ruling') || lower.includes('court held'))
    subject = 'a gavel on a judge\'s bench in an empty courtroom, wood paneling, overhead light';
  else if (lower.includes('federal court') || lower.includes('circuit court'))
    subject = 'a federal courthouse entrance with columns, people on the steps, midday sun';

  // State-specific — use real landmarks
  else if (lower.includes('maryland'))
    subject = 'the Maryland State House in Annapolis, brick and white dome, American flag flying, clear sky';
  else if (lower.includes('virginia'))
    subject = 'the Virginia State Capitol building in Richmond, neoclassical columns, autumn trees';
  else if (lower.includes('california'))
    subject = 'the California State Capitol building, palm trees, golden hour light';
  else if (lower.includes('new york'))
    subject = 'the New York State Capitol in Albany, stone facade, overcast sky, wide angle';
  else if (lower.includes('texas'))
    subject = 'the Texas State Capitol in Austin, pink granite, blue sky, low angle';
  else if (lower.includes('florida'))
    subject = 'the Florida State Capitol building, modern tower, bright tropical light';
  else if (lower.includes('illinois') || lower.includes('chicago'))
    subject = 'downtown Chicago skyline from the lakefront, cloudy day';

  // Political / legislative
  else if (lower.includes('protest') || lower.includes('rally') || lower.includes('march'))
    subject = 'a crowd at a political rally on a city street, signs and American flags, photojournalism style';
  else if (lower.includes('legislat') || lower.includes('bill') || lower.includes('senate') || lower.includes('house'))
    subject = 'a state capitol rotunda interior, marble floors, people walking, natural light from dome';
  else if (lower.includes('election') || lower.includes('voting'))
    subject = 'voters in line outside a polling place, American flag bunting, autumn weather';
  else if (lower.includes('trump') || lower.includes('white house') || lower.includes('executive'))
    subject = 'the White House north lawn, iron fence in foreground, tourists, midday';
  else if (lower.includes('atf') || lower.includes('doj') || lower.includes('federal agency'))
    subject = 'a government office building in Washington DC, brutalist architecture, grey sky';

  // General topics
  else if (lower.includes('constitution') || lower.includes('founding') || lower.includes('originalis'))
    subject = 'the National Archives building exterior in DC, engraved stone, dramatic clouds';
  else if (lower.includes('immigration') || lower.includes('border'))
    subject = 'a border fence stretching into the desert, harsh midday sun, dust';
  else if (lower.includes('veteran') || lower.includes('military'))
    subject = 'a folded American flag on a wooden table, dog tags beside it, window light';

  // Fallback — generic but good
  else {
    const fallbacks = [
      'an American flag on a porch, slightly weathered, small town street, golden hour',
      'a gun range target with bullet holes, shallow depth of field, indoor range lighting',
      'stacks of legal documents and manila folders on a desk, overhead fluorescent light',
      'a rural American highway stretching to the horizon, flat farmland, big sky',
      'the dome of a state capitol building shot from below, American flag, blue sky',
    ];
    subject = fallbacks[styleIndex % fallbacks.length];
  }

  // Keep prompt SHORT. Fewer instructions = more photorealistic output.
  return `Editorial photograph. ${subject}. 35mm film, photojournalism.`;
}

const files = (await readdir(articlesDir)).filter(f => f.endsWith('.md'));
const missing = [];

for (const f of files) {
  const content = await readFile(join(articlesDir, f), 'utf-8');
  const thumbMatch = content.match(/thumbnail:\s*"([^"]+)"/);
  if (!thumbMatch) continue;
  const imgPath = thumbMatch[1].replace(/^\/images\/articles\//, '');
  if (!existsSync(join(imagesDir, imgPath))) {
    const titleMatch = content.match(/title:\s*"([^"]+)"/);
    missing.push({
      file: f,
      image: imgPath,
      title: titleMatch?.[1] || f,
      content: content.slice(0, 3000),
    });
  }
}

console.log(`${missing.length} images to generate`);

for (let i = 0; i < missing.length; i++) {
  const item = missing[i];
  const prompt = buildImagePrompt(item.title, item.content, i);

  console.log(`Generating: ${item.image}`);
  console.log(`  Prompt: ${prompt}`);
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
