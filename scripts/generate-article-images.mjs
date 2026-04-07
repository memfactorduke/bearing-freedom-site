import { writeFile, readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const XAI_API_KEY = process.env.XAI_API_KEY;
if (!XAI_API_KEY) { console.error('Set XAI_API_KEY'); process.exit(1); }

const articlesDir = join(process.cwd(), 'src', 'content', 'articles');
const imagesDir = join(process.cwd(), 'public', 'images', 'articles');

// Photography styles — emphasis on real stock photo look, not AI aesthetic
const STYLES = [
  'shot on Canon 5D Mark IV, 50mm f/1.8, natural light, slight grain',
  'shot on Nikon D850, 35mm lens, overcast daylight, muted tones',
  'shot on Sony A7III, 85mm f/1.4, shallow depth of field, warm tones',
  'shot on Fuji X-T4, 23mm, documentary style, natural color grading',
  'shot on Canon R5, 70-200mm, editorial photography, available light',
];

// Build a stock-photo-style prompt from article content
function buildImagePrompt(title, content, styleIndex) {
  const lower = (title + ' ' + content).toLowerCase();
  const subjects = [];

  // Extract the actual subject matter — what would a stock photo editor search for?
  if (lower.includes('machine gun') || lower.includes('fully automatic'))
    subjects.push('close-up of a gun lock and chain on a wooden surface');
  else if (lower.includes('ar-15') || lower.includes('assault weapon') || lower.includes('rifle ban'))
    subjects.push('rifle case on a workbench, shallow depth of field');
  else if (lower.includes('magazine ban') || lower.includes('magazine capacity'))
    subjects.push('ammunition magazines on a dark surface, overhead shot');
  else if (lower.includes('pistol brace') || lower.includes('stabilizing brace'))
    subjects.push('close-up detail of gun parts on a clean surface');
  else if (lower.includes('concealed carry') || lower.includes('holster'))
    subjects.push('leather holster on a wooden table, warm light');
  else if (lower.includes('stun gun') || lower.includes('non-lethal'))
    subjects.push('personal safety equipment on a desk');

  if (lower.includes('supreme court') || lower.includes('scotus'))
    subjects.push('the United States Supreme Court building exterior');
  if (lower.includes('oral argument'))
    subjects.push('an ornate courtroom interior with rows of wooden benches');
  if (lower.includes('federal court') || lower.includes('circuit court') || lower.includes('district court'))
    subjects.push('a federal courthouse with neoclassical columns');
  if (lower.includes('judge benitez') || lower.includes('judge') && lower.includes('ruling'))
    subjects.push('a judges gavel on a polished wooden bench');

  if (lower.includes('virginia'))
    subjects.push('the Virginia state capitol building');
  if (lower.includes('new jersey'))
    subjects.push('a New Jersey cityscape with state flag');
  if (lower.includes('california'))
    subjects.push('California coastline with American flag');
  if (lower.includes('florida'))
    subjects.push('Florida state capitol dome');
  if (lower.includes('hawaii'))
    subjects.push('Hawaiian landscape with ocean and mountains');
  if (lower.includes('new york') || lower.includes('times square'))
    subjects.push('New York City skyline at dusk');
  if (lower.includes('texas'))
    subjects.push('Texas state capitol building, wide angle');
  if (lower.includes('washington') || lower.includes('d.c.') || lower.includes('capitol'))
    subjects.push('the US Capitol dome against a dramatic sky');

  if (lower.includes('immigration') || lower.includes('border') || lower.includes('birthright citizenship'))
    subjects.push('the American border landscape at sunset');
  if (lower.includes('transgender') || lower.includes('gender identity'))
    subjects.push('a diverse group of Americans at a public rally');
  if (lower.includes('veteran') || lower.includes('military') || lower.includes('pentagon') || lower.includes('off-duty'))
    subjects.push('American soldier in uniform with flag, dignified portrait');
  if (lower.includes('parental rights') || lower.includes('school'))
    subjects.push('an American school building exterior');
  if (lower.includes('election') || lower.includes('redistrict') || lower.includes('voting') || lower.includes('gerrymander'))
    subjects.push('a ballot box with American flag in background');
  if (lower.includes('post office') || lower.includes('usps') || lower.includes('postal'))
    subjects.push('a United States Post Office building');
  if (lower.includes('atf'))
    subjects.push('federal law enforcement badge and documents');

  if (lower.includes('halbrook') || lower.includes('interview') || lower.includes('scholar'))
    subjects.push('a scholar surrounded by law books in a library');
  if (lower.includes('founding') || lower.includes('originalis') || lower.includes('1791') || lower.includes('historical tradition'))
    subjects.push('historic parchment document with quill pen and candlelight');
  if (lower.includes('constitution'))
    subjects.push('the US Constitution on aged parchment, dramatic lighting');
  if (lower.includes('self-defense') || lower.includes('home defense'))
    subjects.push('a deadbolt lock on a front door, close-up, warm interior light');
  if (lower.includes('gun-free zone') || lower.includes('sensitive place'))
    subjects.push('a "gun free zone" sign at a public building entrance');
  if (lower.includes('3d print'))
    subjects.push('a 3D printer creating a detailed mechanical object');
  if (lower.includes('campus carry') || lower.includes('university'))
    subjects.push('a university campus quad with students walking');
  if (lower.includes('ai') || lower.includes('artificial intelligence'))
    subjects.push('futuristic technology interface with circuit patterns');
  if (lower.includes('trump'))
    subjects.push('the White House south lawn at golden hour');

  // Fallback — if nothing specific matched, derive from title
  if (subjects.length === 0) {
    subjects.push('a worn copy of the US Constitution on a dark wooden desk');
  }

  // Pick the most specific subject (last matched tends to be most specific)
  // Use up to 2 subjects for richer composition
  const picked = subjects.slice(-2).join(', with ');
  const style = STYLES[styleIndex % STYLES.length];

  return `${style}. Editorial stock photograph of ${picked}. Imperfect real-world lighting, no people's faces visible, simple composition with negative space. Looks like a Getty Images or Shutterstock editorial photo. Absolutely NO text, words, watermarks, logos, or letters anywhere in the image. NOT an illustration or digital art.`;
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
  console.log(`  Prompt: ${prompt.slice(0, 120)}...`);
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
