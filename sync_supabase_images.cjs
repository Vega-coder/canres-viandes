const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const url = 'https://zxtztxetxgxpmbzmgvfo.supabase.co';
const key = 'sb_publishable_f3dEcQJYKPbf5Iw2j4veEw_-0DHfWdh';
const supabase = createClient(url, key);

// Read SEED_PRODUCTS from seedProducts.js
const content = fs.readFileSync('src/infrastructure/data/seedProducts.js', 'utf8');
const jsonStr = content.replace(/^[\s\S]*?export const SEED_PRODUCTS = /, '').replace(/;[\s\n]*$/, '');
const seedProducts = eval(jsonStr);

console.log(`Loaded ${seedProducts.length} seed products from seedProducts.js`);

(async () => {
  let updatedCount = 0;
  let errors = 0;

  for (const prod of seedProducts) {
    const { data, error } = await supabase
      .from('products')
      .update({
        images: prod.images,
        cooking_methods: prod.cookingMethods || []
      })
      .eq('id', prod.id)
      .select('id, name');

    if (error) {
      console.error(`Error updating ${prod.id}:`, error.message);
      errors++;
    } else if (data && data.length > 0) {
      console.log(`Updated ${prod.id} (${prod.name}) -> ${JSON.stringify(prod.images)}`);
      updatedCount++;
    } else {
      console.warn(`Product not found in Supabase: ${prod.id}`);
    }
  }

  console.log(`\n=== SYNC SUMMARY ===`);
  console.log(`Successfully updated: ${updatedCount} products`);
  console.log(`Errors: ${errors}`);
})();
