// Proxy to OpenFoodFacts API for barcode lookups.
// Free, no API key needed. Returns product nutrition data.

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'GET required' });

  const barcode = req.query && req.query.code;
  if (!barcode) return res.status(400).json({ error: 'code parameter required' });

  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(barcode)}.json`,
      { headers: { 'User-Agent': 'SeanMurphyDashboard/1.0' } }
    );
    const data = await r.json();

    if (!data || data.status === 0 || !data.product) {
      return res.status(404).json({ error: 'Product not found', barcode });
    }

    const p = data.product;
    const n = p.nutriments || {};

    // Extract serving info
    const servingSize = p.serving_size || p.quantity || '100g';
    const per = n['energy-kcal_100g'] != null ? '100g' : 'serving';

    const result = {
      barcode,
      name: p.product_name || p.generic_name || 'Unknown product',
      brand: p.brands || '',
      image: p.image_front_small_url || p.image_url || '',
      servingSize,
      nutrients: {
        calories: n['energy-kcal_100g'] || n['energy-kcal_serving'] || 0,
        protein: n.proteins_100g || n.proteins_serving || 0,
        carbs: n.carbohydrates_100g || n.carbohydrates_serving || 0,
        fat: n.fat_100g || n.fat_serving || 0,
        fiber: n.fiber_100g || n.fiber_serving || 0,
        sugar: n.sugars_100g || n.sugars_serving || 0,
        sodium: n.sodium_100g != null ? n.sodium_100g * 1000 : (n.sodium_serving != null ? n.sodium_serving * 1000 : 0),
        saturatedFat: n['saturated-fat_100g'] || n['saturated-fat_serving'] || 0,
        cholesterol: n.cholesterol_100g != null ? n.cholesterol_100g * 1000 : 0,
        potassium: n.potassium_100g != null ? n.potassium_100g * 1000 : 0,
        calcium: n.calcium_100g != null ? n.calcium_100g * 1000 : 0,
        iron: n.iron_100g != null ? n.iron_100g * 1000 : 0,
        vitaminA: n['vitamin-a_100g'] != null ? n['vitamin-a_100g'] * 1000000 : 0,
        vitaminC: n['vitamin-c_100g'] != null ? n['vitamin-c_100g'] * 1000 : 0,
        vitaminD: n['vitamin-d_100g'] != null ? n['vitamin-d_100g'] * 1000000 : 0,
      },
      per,
      nutriscore: p.nutriscore_grade || null,
    };

    return res.status(200).json(result);
  } catch (e) {
    return res.status(500).json({ error: 'Barcode lookup failed: ' + (e.message || String(e)) });
  }
};
