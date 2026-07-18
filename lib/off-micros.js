// Shared OpenFoodFacts micronutrient extraction.
// OFF stores every nutrient in grams, so mult converts g -> the unit we report.
// First key that carries a value wins, so alternates never double count.

const MICRO_MAP = [
  { k: 'vitaminA',          off: ['vitamin-a'],                      mult: 1e6, u: 'µg' },
  { k: 'vitaminB1',         off: ['vitamin-b1'],                     mult: 1e3, u: 'mg' },
  { k: 'vitaminB2',         off: ['vitamin-b2'],                     mult: 1e3, u: 'mg' },
  { k: 'vitaminB3',         off: ['vitamin-pp', 'vitamin-b3'],       mult: 1e3, u: 'mg' },
  { k: 'vitaminB5',         off: ['pantothenic-acid', 'vitamin-b5'], mult: 1e3, u: 'mg' },
  { k: 'vitaminB6',         off: ['vitamin-b6'],                     mult: 1e3, u: 'mg' },
  { k: 'vitaminB9',         off: ['vitamin-b9', 'folates'],          mult: 1e6, u: 'µg' },
  { k: 'vitaminB12',        off: ['vitamin-b12'],                    mult: 1e6, u: 'µg' },
  { k: 'vitaminC',          off: ['vitamin-c'],                      mult: 1e3, u: 'mg' },
  { k: 'vitaminD',          off: ['vitamin-d'],                      mult: 1e6, u: 'µg' },
  { k: 'vitaminE',          off: ['vitamin-e'],                      mult: 1e3, u: 'mg' },
  { k: 'vitaminK',          off: ['vitamin-k'],                      mult: 1e6, u: 'µg' },
  { k: 'calcium',           off: ['calcium'],                        mult: 1e3, u: 'mg' },
  { k: 'iron',              off: ['iron'],                           mult: 1e3, u: 'mg' },
  { k: 'magnesium',         off: ['magnesium'],                      mult: 1e3, u: 'mg' },
  { k: 'zinc',              off: ['zinc'],                           mult: 1e3, u: 'mg' },
  { k: 'sodium',            off: ['sodium'],                         mult: 1e3, u: 'mg' },
  { k: 'potassium',         off: ['potassium'],                      mult: 1e3, u: 'mg' },
  { k: 'phosphorus',        off: ['phosphorus'],                     mult: 1e3, u: 'mg' },
  { k: 'selenium',          off: ['selenium'],                       mult: 1e6, u: 'µg' },
  { k: 'copper',            off: ['copper'],                         mult: 1e3, u: 'mg' },
  { k: 'manganese',         off: ['manganese'],                      mult: 1e3, u: 'mg' },
  { k: 'chromium',          off: ['chromium'],                       mult: 1e6, u: 'µg' },
  { k: 'iodine',            off: ['iodine'],                         mult: 1e6, u: 'µg' },
  { k: 'molybdenum',        off: ['molybdenum'],                     mult: 1e6, u: 'µg' },
  { k: 'omega3',            off: ['omega-3-fat', 'dha', 'epa'],      mult: 1,   u: 'g'  },
  { k: 'omega6',            off: ['omega-6-fat'],                    mult: 1,   u: 'g'  },
  { k: 'choline',           off: ['choline'],                        mult: 1e3, u: 'mg' },
  { k: 'fiber',             off: ['fiber'],                          mult: 1,   u: 'g'  },
  { k: 'cholesterol',       off: ['cholesterol'],                    mult: 1e3, u: 'mg' },
  { k: 'caffeine',          off: ['caffeine'],                       mult: 1e3, u: 'mg' },
  { k: 'monounsaturatedFat',off: ['monounsaturated-fat'],            mult: 1,   u: 'g'  },
  { k: 'polyunsaturatedFat',off: ['polyunsaturated-fat'],            mult: 1,   u: 'g'  },
  { k: 'transFat',          off: ['trans-fat'],                      mult: 1,   u: 'g'  },
];

// Pull every micronutrient OFF has for a product. `basis` picks which
// normalised field to read first ('100g' or 'serving'); the other is the fallback.
function extractMicros(nutriments, basis) {
  const n = nutriments || {};
  const primary = basis === 'serving' ? '_serving' : '_100g';
  const fallback = basis === 'serving' ? '_100g' : '_serving';
  const out = {};

  for (const m of MICRO_MAP) {
    for (const key of m.off) {
      let v = n[key + primary];
      if (v == null) v = n[key + fallback];
      if (v == null) v = n[key];
      if (typeof v === 'number' && !isNaN(v) && v > 0) {
        out[m.k] = Math.round(v * m.mult * 1000) / 1000;
        break;
      }
    }
  }
  return out;
}

module.exports = { MICRO_MAP, extractMicros };
