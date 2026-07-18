// Search OpenFoodFacts for food items by name.
// Free, no API key needed.

const { extractMicros } = require('../lib/off-micros');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required' });

  const q = req.query && req.query.q;
  if (!q) return res.status(400).json({ error: 'q parameter required' });

  try {
    const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,nutriments,serving_size,code,image_front_small_url,nutriscore_grade`;
    const r = await fetch(url, {
      headers: { 'User-Agent': 'SeanMurphyDashboard/1.0' }
    });
    const data = await r.json();

    const results = (data.products || []).map(p => {
      const n = p.nutriments || {};
      return {
        barcode: p.code || '',
        name: p.product_name || 'Unknown',
        brand: p.brands || '',
        image: p.image_front_small_url || '',
        servingSize: p.serving_size || '100g',
        nutrients: {
          calories: n['energy-kcal_100g'] || 0,
          protein: n.proteins_100g || 0,
          carbs: n.carbohydrates_100g || 0,
          fat: n.fat_100g || 0,
          fiber: n.fiber_100g || 0,
          sugar: n.sugars_100g || 0,
          sodium: n.sodium_100g != null ? n.sodium_100g * 1000 : 0,
          saturatedFat: n['saturated-fat_100g'] || 0,
        },
        micros: extractMicros(n, '100g'),
        nutriscore: p.nutriscore_grade || null,
      };
    });

    return res.status(200).json({ results });
  } catch (e) {
    return res.status(500).json({ error: 'Food search failed: ' + (e.message || String(e)) });
  }
};
