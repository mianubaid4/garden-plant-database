import fs from 'fs';
import path from 'path';

const PLANTS_DIR = path.resolve(process.cwd(), 'public/plants');
const OUTPUT_FILE = path.resolve(PLANTS_DIR, '_index.json');

function generateCatalog() {
  console.log('📚 Generating plant catalog...');
  
  if (!fs.existsSync(PLANTS_DIR)) {
    console.error('❌ Plants directory not found:', PLANTS_DIR);
    process.exit(1);
  }

  const catalog = [];
  const folders = fs.readdirSync(PLANTS_DIR, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

  for (const folder of folders) {
    const dataPath = path.join(PLANTS_DIR, folder, 'data.json');
    if (fs.existsSync(dataPath)) {
      try {
        const rawData = fs.readFileSync(dataPath, 'utf8');
        const plantData = JSON.parse(rawData);
        
        let firstEmoji = '🌿';
        if (plantData.lifecycle && plantData.lifecycle.length > 0) {
          firstEmoji = plantData.lifecycle[plantData.lifecycle.length - 1].emoji || '🌿';
        }

        // We only extract what matches PlantIndexEntry in plantLoader.ts
        catalog.push({
          id: plantData.id,
          emoji: firstEmoji,
          category: plantData.category,
          names: {
            en: plantData.names.en.common,
            ur: plantData.names.ur.common,
            ar: plantData.names.ar.common,
            fr: plantData.names.fr.common
          },
          aliases: plantData.names.aliases || [],
          tags: plantData.tags || [],
          defaultImage: plantData.defaultImage,
          growthTypes: plantData.growthTypes || [],
          version: plantData.version,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`✅ Added to catalog: ${plantData.names?.en?.common || folder}`);
      } catch (err) {
         console.error(`❌ Error parsing data.json for ${folder}:`, err.message);
      }
    } else {
      console.warn(`⚠️ No data.json found in ${folder}`);
    }
  }

  // Write catalog index
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(catalog, null, 2), 'utf8');
  console.log(`\n🎉 Successfully generated _index.json with ${catalog.length} plants!`);
  console.log(`📁 Saved to: ${OUTPUT_FILE}`);
}

generateCatalog();
