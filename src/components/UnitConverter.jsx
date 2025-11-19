import { useState } from 'react';
import './UnitConverter.css';

const UnitConverter = () => {
  const [category, setCategory] = useState('length');
  const [fromUnit, setFromUnit] = useState('meter');
  const [toUnit, setToUnit] = useState('kilometer');
  const [inputValue, setInputValue] = useState('');
  const [result, setResult] = useState('');

  const conversions = {
    length: {
      meter: { meter: 1, kilometer: 0.001, mile: 0.000621371, foot: 3.28084, inch: 39.3701, centimeter: 100, millimeter: 1000 },
      kilometer: { meter: 1000, kilometer: 1, mile: 0.621371, foot: 3280.84, inch: 39370.1, centimeter: 100000, millimeter: 1000000 },
      mile: { meter: 1609.34, kilometer: 1.60934, mile: 1, foot: 5280, inch: 63360, centimeter: 160934, millimeter: 1609340 },
      foot: { meter: 0.3048, kilometer: 0.0003048, mile: 0.000189394, foot: 1, inch: 12, centimeter: 30.48, millimeter: 304.8 },
      inch: { meter: 0.0254, kilometer: 0.0000254, mile: 0.000015783, foot: 0.0833333, inch: 1, centimeter: 2.54, millimeter: 25.4 },
      centimeter: { meter: 0.01, kilometer: 0.00001, mile: 0.00000621371, foot: 0.0328084, inch: 0.393701, centimeter: 1, millimeter: 10 },
      millimeter: { meter: 0.001, kilometer: 0.000001, mile: 0.000000621371, foot: 0.00328084, inch: 0.0393701, centimeter: 0.1, millimeter: 1 }
    },
    weight: {
      kilogram: { kilogram: 1, gram: 1000, pound: 2.20462, ounce: 35.274, ton: 0.001, milligram: 1000000 },
      gram: { kilogram: 0.001, gram: 1, pound: 0.00220462, ounce: 0.035274, ton: 0.000001, milligram: 1000 },
      pound: { kilogram: 0.453592, gram: 453.592, pound: 1, ounce: 16, ton: 0.000453592, milligram: 453592 },
      ounce: { kilogram: 0.0283495, gram: 28.3495, pound: 0.0625, ounce: 1, ton: 0.0000283495, milligram: 28349.5 },
      ton: { kilogram: 1000, gram: 1000000, pound: 2204.62, ounce: 35274, ton: 1, milligram: 1000000000 },
      milligram: { kilogram: 0.000001, gram: 0.001, pound: 0.00000220462, ounce: 0.000035274, ton: 0.000000001, milligram: 1 }
    },
    temperature: {
      celsius: { celsius: (c) => c, fahrenheit: (c) => (c * 9/5) + 32, kelvin: (c) => c + 273.15 },
      fahrenheit: { celsius: (f) => (f - 32) * 5/9, fahrenheit: (f) => f, kelvin: (f) => (f - 32) * 5/9 + 273.15 },
      kelvin: { celsius: (k) => k - 273.15, fahrenheit: (k) => (k - 273.15) * 9/5 + 32, kelvin: (k) => k }
    },
    volume: {
      liter: { liter: 1, milliliter: 1000, gallon: 0.264172, quart: 1.05669, pint: 2.11338, cup: 4.22675, fluidOunce: 33.814 },
      milliliter: { liter: 0.001, milliliter: 1, gallon: 0.000264172, quart: 0.00105669, pint: 0.00211338, cup: 0.00422675, fluidOunce: 0.033814 },
      gallon: { liter: 3.78541, milliliter: 3785.41, gallon: 1, quart: 4, pint: 8, cup: 16, fluidOunce: 128 },
      quart: { liter: 0.946353, milliliter: 946.353, gallon: 0.25, quart: 1, pint: 2, cup: 4, fluidOunce: 32 },
      pint: { liter: 0.473176, milliliter: 473.176, gallon: 0.125, quart: 0.5, pint: 1, cup: 2, fluidOunce: 16 },
      cup: { liter: 0.236588, milliliter: 236.588, gallon: 0.0625, quart: 0.25, pint: 0.5, cup: 1, fluidOunce: 8 },
      fluidOunce: { liter: 0.0295735, milliliter: 29.5735, gallon: 0.0078125, quart: 0.03125, pint: 0.0625, cup: 0.125, fluidOunce: 1 }
    },
    area: {
      squareMeter: { squareMeter: 1, squareKilometer: 0.000001, squareFoot: 10.7639, squareYard: 1.19599, acre: 0.000247105, hectare: 0.0001 },
      squareKilometer: { squareMeter: 1000000, squareKilometer: 1, squareFoot: 10763910.4, squareYard: 1195990.05, acre: 247.105, hectare: 100 },
      squareFoot: { squareMeter: 0.092903, squareKilometer: 9.2903e-8, squareFoot: 1, squareYard: 0.111111, acre: 0.0000229568, hectare: 0.00000929030 },
      squareYard: { squareMeter: 0.836127, squareKilometer: 8.36127e-7, squareFoot: 9, squareYard: 1, acre: 0.000206612, hectare: 0.0000836127 },
      acre: { squareMeter: 4046.86, squareKilometer: 0.00404686, squareFoot: 43560, squareYard: 4840, acre: 1, hectare: 0.404686 },
      hectare: { squareMeter: 10000, squareKilometer: 0.01, squareFoot: 107639, squareYard: 11959.9, acre: 2.47105, hectare: 1 }
    },
    speed: {
      mps: { mps: 1, kph: 3.6, mph: 2.23694, knot: 1.94384, fps: 3.28084 },
      kph: { mps: 0.277778, kph: 1, mph: 0.621371, knot: 0.539957, fps: 0.911344 },
      mph: { mps: 0.44704, kph: 1.60934, mph: 1, knot: 0.868976, fps: 1.46667 },
      knot: { mps: 0.514444, kph: 1.852, mph: 1.15078, knot: 1, fps: 1.68781 },
      fps: { mps: 0.3048, kph: 1.09728, mph: 0.681818, knot: 0.592484, fps: 1 }
    }
  };

  const unitLabels = {
    length: {
      meter: 'Meter (m)', kilometer: 'Kilometer (km)', mile: 'Mile (mi)',
      foot: 'Foot (ft)', inch: 'Inch (in)', centimeter: 'Centimeter (cm)', millimeter: 'Millimeter (mm)'
    },
    weight: {
      kilogram: 'Kilogram (kg)', gram: 'Gram (g)', pound: 'Pound (lb)',
      ounce: 'Ounce (oz)', ton: 'Metric Ton (t)', milligram: 'Milligram (mg)'
    },
    temperature: {
      celsius: 'Celsius (°C)', fahrenheit: 'Fahrenheit (°F)', kelvin: 'Kelvin (K)'
    },
    volume: {
      liter: 'Liter (L)', milliliter: 'Milliliter (mL)', gallon: 'Gallon (gal)',
      quart: 'Quart (qt)', pint: 'Pint (pt)', cup: 'Cup', fluidOunce: 'Fluid Ounce (fl oz)'
    },
    area: {
      squareMeter: 'Square Meter (m²)', squareKilometer: 'Square Kilometer (km²)',
      squareFoot: 'Square Foot (ft²)', squareYard: 'Square Yard (yd²)',
      acre: 'Acre', hectare: 'Hectare (ha)'
    },
    speed: {
      mps: 'Meters/Second (m/s)', kph: 'Kilometers/Hour (km/h)',
      mph: 'Miles/Hour (mph)', knot: 'Knot', fps: 'Feet/Second (ft/s)'
    }
  };

  const convert = () => {
    if (!inputValue || isNaN(inputValue)) {
      setResult('');
      return;
    }

    const value = parseFloat(inputValue);
    let converted;

    if (category === 'temperature') {
      converted = conversions[category][fromUnit][toUnit](value);
    } else {
      converted = value * conversions[category][fromUnit][toUnit];
    }

    setResult(converted.toFixed(6).replace(/\.?0+$/, ''));
  };

  const handleCategoryChange = (newCategory) => {
    setCategory(newCategory);
    const units = Object.keys(conversions[newCategory]);
    setFromUnit(units[0]);
    setToUnit(units[1]);
    setInputValue('');
    setResult('');
  };

  const swapUnits = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
    if (result) {
      setInputValue(result);
      setResult('');
    }
  };

  return (
    <div className="unit-converter">
      <div className="category-selector">
        {Object.keys(conversions).map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            className={`category-btn ${category === cat ? 'active' : ''}`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </button>
        ))}
      </div>

      <div className="converter-section">
        <div className="input-group">
          <label>From</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="unit-select"
          >
            {Object.keys(conversions[category]).map((unit) => (
              <option key={unit} value={unit}>
                {unitLabels[category][unit]}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyUp={convert}
            placeholder="Enter value"
            className="value-input"
          />
        </div>

        <button onClick={swapUnits} className="swap-btn">
          🔄
        </button>

        <div className="input-group">
          <label>To</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
            className="unit-select"
          >
            {Object.keys(conversions[category]).map((unit) => (
              <option key={unit} value={unit}>
                {unitLabels[category][unit]}
              </option>
            ))}
          </select>
          <input
            type="text"
            value={result}
            readOnly
            placeholder="Result"
            className="value-input result-input"
          />
        </div>
      </div>

      <button onClick={convert} className="convert-action-btn">
        ⚡ Convert
      </button>
    </div>
  );
};

export default UnitConverter;
