import { useState } from 'react';
import './ImageColorExtractor.css';

const ImageColorExtractor = () => {
  const [imagePreview, setImagePreview] = useState('');
  const [colors, setColors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setColors([]); // reset previous colors
      };
      reader.readAsDataURL(file);
    }
  };

  const rgbToHex = (r, g, b) => {
    return (
      '#' +
      [r, g, b]
        .map((x) => {
          const hex = x.toString(16);
          return hex.length === 1 ? '0' + hex : hex;
        })
        .join('')
    );
  };

  const extractColors = () => {
    if (!imagePreview) return;

    setIsProcessing(true);

    const img = new Image();
    img.src = imagePreview;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const pixels = imageData.data;
      const colorMap = {};

      // Sample every 10th pixel (40 because each pixel has RGBA)
      for (let i = 0; i < pixels.length; i += 40) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const alpha = pixels[i + 3];

        if (alpha > 128) {
          const hex = rgbToHex(r, g, b);
          colorMap[hex] = (colorMap[hex] || 0) + 1;
        }
      }

      const sortedColors = Object.entries(colorMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([hex, count]) => {
          const r = parseInt(hex.slice(1, 3), 16);
          const g = parseInt(hex.slice(3, 5), 16);
          const b = parseInt(hex.slice(5, 7), 16);
          return { hex, r, g, b, count };
        });

      setColors(sortedColors);
      setIsProcessing(false);
    };

    img.onerror = () => {
      alert('Failed to load image. Try another file.');
      setIsProcessing(false);
    };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="tool-card">
      <div className="tool-header">
        <div className="tool-icon">🎨</div>
        <div>
          <h3 className="tool-title">Image Color Extractor</h3>
          <p className="tool-description">Extract color palette from any image</p>
        </div>
      </div>

      <div className="tool-body">
        <div className="image-upload-area">
          <input
            type="file"
            id="color-image-upload"
            accept="image/*"
            onChange={handleImageUpload}
            className="file-input"
          />
          <label htmlFor="color-image-upload" className="upload-label">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <span className="upload-icon">🖼️</span>
                <span className="upload-text">Click to upload image</span>
                <span className="upload-hint">PNG, JPG, WEBP</span>
              </div>
            )}
          </label>
        </div>

        {imagePreview && (
          <button
            className="tool-generate-btn"
            onClick={extractColors}
            disabled={isProcessing}
          >
            {isProcessing ? 'Extracting...' : '🎨 Extract Colors'}
          </button>
        )}

        {colors.length > 0 && (
          <div className="colors-result">
            <h4 className="result-title">Extracted Color Palette:</h4>
            <div className="colors-grid">
              {colors.map((color, index) => (
                <div key={index} className="color-card">
                  <div className="color-swatch" style={{ backgroundColor: color.hex }} />
                  <div className="color-info">
                    <div className="color-hex">
                      {color.hex}
                      <button
                        className="mini-copy-btn"
                        onClick={() => copyToClipboard(color.hex)}
                        title="Copy HEX"
                      >
                        📋
                      </button>
                    </div>
                    <div className="color-rgb">
                      RGB: {color.r}, {color.g}, {color.b}
                      <button
                        className="mini-copy-btn"
                        onClick={() =>
                          copyToClipboard(`rgb(${color.r}, ${color.g}, ${color.b})`)
                        }
                        title="Copy RGB"
                      >
                        📋
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="palette-export">
              <button
                className="export-btn"
                onClick={() => {
                  const hexColors = colors.map((c) => c.hex).join(', ');
                  copyToClipboard(hexColors);
                }}
              >
                📋 Copy All HEX Colors
              </button>
              <button
                className="export-btn"
                onClick={() => {
                  const cssVars = colors
                    .map((c, i) => `--color-${i + 1}: ${c.hex};`)
                    .join('\n');
                  copyToClipboard(`:root {\n  ${cssVars}\n}`);
                }}
              >
                📄 Export as CSS Variables
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageColorExtractor;
