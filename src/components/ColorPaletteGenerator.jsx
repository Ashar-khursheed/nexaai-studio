import { useState, useEffect } from 'react';
import './ColorPaletteGenerator.css';

const ColorPaletteGenerator = () => {
  const [baseColor, setBaseColor] = useState('#8b5cf6');
  const [palette, setPalette] = useState([]);
  const [paletteType, setPaletteType] = useState('complementary');
  const [copied, setCopied] = useState(null);

  useEffect(() => {
    generatePalette();
  }, [baseColor, paletteType]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const rgbToHex = (r, g, b) => {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  };

  const rgbToHsl = (r, g, b) => {
    r /= 255;
    g /= 255;
    b /= 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }

    return { h: h * 360, s: s * 100, l: l * 100 };
  };

  const hslToRgb = (h, s, l) => {
    h /= 360;
    s /= 100;
    l /= 100;
    let r, g, b;

    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const generatePalette = () => {
    const rgb = hexToRgb(baseColor);
    if (!rgb) return;

    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
    let colors = [];

    switch (paletteType) {
      case 'complementary':
        colors = [
          baseColor,
          rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l)))
        ];
        break;

      case 'analogous':
        colors = [
          rgbToHex(...Object.values(hslToRgb((hsl.h - 30 + 360) % 360, hsl.s, hsl.l))),
          baseColor,
          rgbToHex(...Object.values(hslToRgb((hsl.h + 30) % 360, hsl.s, hsl.l)))
        ];
        break;

      case 'triadic':
        colors = [
          baseColor,
          rgbToHex(...Object.values(hslToRgb((hsl.h + 120) % 360, hsl.s, hsl.l))),
          rgbToHex(...Object.values(hslToRgb((hsl.h + 240) % 360, hsl.s, hsl.l)))
        ];
        break;

      case 'tetradic':
        colors = [
          baseColor,
          rgbToHex(...Object.values(hslToRgb((hsl.h + 90) % 360, hsl.s, hsl.l))),
          rgbToHex(...Object.values(hslToRgb((hsl.h + 180) % 360, hsl.s, hsl.l))),
          rgbToHex(...Object.values(hslToRgb((hsl.h + 270) % 360, hsl.s, hsl.l)))
        ];
        break;

      case 'monochromatic':
        colors = [
          rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - 20)))),
          rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - 10)))),
          baseColor,
          rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.min(100, hsl.l + 10)))),
          rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.min(100, hsl.l + 20))))
        ];
        break;

      case 'shades':
        colors = Array.from({ length: 5 }, (_, i) => 
          rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, Math.max(0, hsl.l - (i + 1) * 15))))
        );
        break;

      default:
        colors = [baseColor];
    }

    setPalette(colors);
  };

  const copyColor = (color) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 2000);
  };

  const randomColor = () => {
    const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setBaseColor(randomHex);
  };

  const getContrastColor = (hexColor) => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return '#ffffff';
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  };

  return (
    <div className="color-palette-generator">
      <div className="color-input-section">
        <div className="color-picker-wrapper">
          <label>Base Color</label>
          <div className="color-picker-input">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="color-picker"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="color-text-input"
              placeholder="#000000"
            />
            <button onClick={randomColor} className="random-btn" title="Random Color">
              🎲
            </button>
          </div>
        </div>

        <div className="palette-type-section">
          <label>Palette Type</label>
          <select
            value={paletteType}
            onChange={(e) => setPaletteType(e.target.value)}
            className="palette-select"
          >
            <option value="complementary">Complementary</option>
            <option value="analogous">Analogous</option>
            <option value="triadic">Triadic</option>
            <option value="tetradic">Tetradic</option>
            <option value="monochromatic">Monochromatic</option>
            <option value="shades">Shades</option>
          </select>
        </div>
      </div>

      <div className="palette-display">
        {palette.map((color, index) => (
          <div
            key={index}
            className="color-card"
            style={{ backgroundColor: color }}
            onClick={() => copyColor(color)}
          >
            <div className="color-info" style={{ color: getContrastColor(color) }}>
              <span className="color-hex">{color.toUpperCase()}</span>
              {copied === color && <span className="copied-badge">✓ Copied!</span>}
            </div>
          </div>
        ))}
      </div>

      <div className="palette-info">
        <p className="info-text">Click on any color to copy its hex code</p>
      </div>
    </div>
  );
};

export default ColorPaletteGenerator;
