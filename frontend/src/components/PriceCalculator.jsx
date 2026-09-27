import React, { useState } from 'react';
import './PriceCalculator.css';

// All prices are indicative averages for common informal-market goods in South Africa.
// This is a frontend-only estimator: nothing here calls the backend.
const CATALOG = {
  'Fruit & Veg': [
    { name: 'Apples (1kg)', price: 22 },
    { name: 'Tomatoes (1kg)', price: 18 },
    { name: 'Bananas (1kg)', price: 15 },
    { name: 'Onions (1kg)', price: 16 },
    { name: 'Potatoes (2kg)', price: 28 },
  ],
  'Airtime & Data': [
    { name: 'R10 Airtime', price: 10 },
    { name: 'R29 Airtime', price: 29 },
    { name: '1GB Data', price: 39 },
    { name: '2GB Data', price: 69 },
  ],
  'Spaza Groceries': [
    { name: 'Bread (loaf)', price: 17 },
    { name: 'Milk (1L)', price: 20 },
    { name: 'Maize meal (2.5kg)', price: 35 },
    { name: 'Sugar (1kg)', price: 24 },
  ],
  'Takeaway Meal': [
    { name: 'Kota', price: 25 },
    { name: 'Vetkoek & mince', price: 20 },
    { name: 'Plate of pap & wors', price: 45 },
    { name: 'Bunny chow', price: 55 },
  ],
};

const CATEGORIES = Object.keys(CATALOG);

export default function PriceCalculator() {
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [itemName, setItemName] = useState(CATALOG[CATEGORIES[0]][0].name);
  const [quantity, setQuantity] = useState(1);
  const [result, setResult] = useState(null);

  const items = CATALOG[category];

  function handleCategoryChange(cat) {
    setCategory(cat);
    setItemName(CATALOG[cat][0].name);
    setResult(null);
  }

  function handleCalculate(e) {
    e.preventDefault();
    const item = items.find((i) => i.name === itemName);
    if (!item) return;
    const qty = Math.max(1, Number(quantity) || 1);
    const total = item.price * qty;
    setResult({
      itemName: item.name,
      qty,
      total,
      low: Math.round(total * 0.9),
      high: Math.round(total * 1.15),
    });
  }

  return (
    <div className="pc-card">
      <div className="pc-tabs" role="tablist" aria-label="Goods category">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            role="tab"
            aria-selected={category === cat}
            className={`pc-tab ${category === cat ? 'pc-tab--active' : ''}`}
            onClick={() => handleCategoryChange(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <form className="pc-form" onSubmit={handleCalculate}>
        <label className="pc-field">
          <span className="pc-label">Item</span>
          <select
            className="pc-select"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
          >
            {items.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name} · R{item.price}
              </option>
            ))}
          </select>
        </label>

        <label className="pc-field pc-field--qty">
          <span className="pc-label">Quantity</span>
          <input
            className="pc-input"
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </label>

        <button type="submit" className="pc-button">
          Calculate
        </button>
      </form>

      {result && (
        <div className="pc-result">
          <p className="pc-result-line">
            {result.qty} × {result.itemName}
          </p>
          <p className="pc-result-total">R{result.total}</p>
          <p className="pc-result-range">
            Typical fair price range: R{result.low}&nbsp;–&nbsp;R{result.high}
          </p>
          <p className="pc-result-tip">
            If a vendor is quoting well above this range, check their trust profile before you pay.
          </p>
        </div>
      )}
    </div>
  );
}
