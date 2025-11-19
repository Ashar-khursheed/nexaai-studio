import { useState, useRef, useEffect } from 'react';
import './AIImageEditor.css';

const AIImageEditor = () => {
  const [image, setImage] = useState(null);
  const [filters, setFilters] = useState({
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    hue: 0,
    invert: 0
  });
  const [selectedFilter, setSelectedFilter] = useState(null);
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);

  const presetFilters = {
    original: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0, hue: 0, invert: 0 },
    vintage: { brightness: 110, contrast: 90, saturation: 80, blur: 0, grayscale: 0, sepia: 40, hue: 0, invert: 0 },
    blackWhite: { brightness: 100, contrast: 120, saturation: 0, blur: 0, grayscale: 100, sepia: 0, hue: 0, invert: 0 },
    vibrant: { brightness: 105, contrast: 120, saturation: 150, blur: 0, grayscale: 0, sepia: 0, hue: 0, invert: 0 },
    cool: { brightness: 100, contrast: 100, saturation: 120, blur: 0, grayscale: 0, sepia: 0, hue: 200, invert: 0 },
    warm: { brightness: 110, contrast: 105, saturation: 110, blur: 0, grayscale: 0, sepia: 20, hue: 20, invert: 0 },
    dramatic: { brightness: 90, contrast: 150, saturation: 110, blur: 0, grayscale: 0, sepia: 0, hue: 0, invert: 0 },
    soft: { brightness: 110, contrast: 80, saturation: 90, blur: 2, grayscale: 0, sepia: 10, hue: 0, invert: 0 }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          originalImageRef.current = img;
          setImage(event.target.result);
          applyFilters(presetFilters.original, img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const applyFilters = (filterValues = filters, img = originalImageRef.current) => {
    if (!img) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    canvas.width = Math.min(img.width, 800);
    canvas.height = (img.height * canvas.width) / img.width;

    // Apply CSS filters first
    ctx.filter = `
      brightness(${filterValues.brightness}%)
      contrast(${filterValues.contrast}%)
      saturate(${filterValues.saturation}%)
      blur(${filterValues.blur}px)
      grayscale(${filterValues.grayscale}%)
      sepia(${filterValues.sepia}%)
      hue-rotate(${filterValues.hue}deg)
      invert(${filterValues.invert}%)
    `;

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  useEffect(() => {
    if (originalImageRef.current) {
      applyFilters();
    }
  }, [filters]);

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setSelectedFilter(null);
  };

  const applyPreset = (presetName) => {
    setFilters(presetFilters[presetName]);
    setSelectedFilter(presetName);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-edited-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    });
  };

  const resetFilters = () => {
    setFilters(presetFilters.original);
    setSelectedFilter('original');
  };

  return (
    <div className="ai-image-editor">
      {!image ? (
        <div className="upload-area">
          <div className="upload-content">
            <div className="upload-icon">🖼️</div>
            <h3>AI Image Editor</h3>
            <p>Upload an image to apply AI-powered filters and effects</p>
            <label className="upload-btn">
              📁 Choose Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
          </div>
        </div>
      ) : (
        <div className="editor-container">
          <div className="preview-section">
            <canvas ref={canvasRef} className="preview-canvas" />
            <div className="preview-actions">
              <button onClick={downloadImage} className="action-btn download-btn">
                ⬇️ Download
              </button>
              <button onClick={resetFilters} className="action-btn reset-btn">
                🔄 Reset
              </button>
              <label className="action-btn upload-new-btn">
                📁 New Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>
          </div>

          <div className="controls-section">
            <div className="presets-section">
              <h4>🎨 AI Presets</h4>
              <div className="presets-grid">
                {Object.keys(presetFilters).map((preset) => (
                  <button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    className={`preset-btn ${selectedFilter === preset ? 'active' : ''}`}
                  >
                    {preset.charAt(0).toUpperCase() + preset.slice(1).replace(/([A-Z])/g, ' $1')}
                  </button>
                ))}
              </div>
            </div>

            <div className="sliders-section">
              <h4>🎛️ Fine Tune</h4>
              
              <div className="slider-group">
                <label>
                  <span>☀️ Brightness</span>
                  <span className="value">{filters.brightness}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.brightness}
                  onChange={(e) => handleFilterChange('brightness', e.target.value)}
                  className="slider"
                />
              </div>

              <div className="slider-group">
                <label>
                  <span>🔆 Contrast</span>
                  <span className="value">{filters.contrast}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.contrast}
                  onChange={(e) => handleFilterChange('contrast', e.target.value)}
                  className="slider"
                />
              </div>

              <div className="slider-group">
                <label>
                  <span>🌈 Saturation</span>
                  <span className="value">{filters.saturation}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="200"
                  value={filters.saturation}
                  onChange={(e) => handleFilterChange('saturation', e.target.value)}
                  className="slider"
                />
              </div>

              <div className="slider-group">
                <label>
                  <span>💫 Blur</span>
                  <span className="value">{filters.blur}px</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  value={filters.blur}
                  onChange={(e) => handleFilterChange('blur', e.target.value)}
                  className="slider"
                />
              </div>

              <div className="slider-group">
                <label>
                  <span>⚫ Grayscale</span>
                  <span className="value">{filters.grayscale}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.grayscale}
                  onChange={(e) => handleFilterChange('grayscale', e.target.value)}
                  className="slider"
                />
              </div>

              <div className="slider-group">
                <label>
                  <span>📜 Sepia</span>
                  <span className="value">{filters.sepia}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.sepia}
                  onChange={(e) => handleFilterChange('sepia', e.target.value)}
                  className="slider"
                />
              </div>

              <div className="slider-group">
                <label>
                  <span>🎨 Hue Rotate</span>
                  <span className="value">{filters.hue}°</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={filters.hue}
                  onChange={(e) => handleFilterChange('hue', e.target.value)}
                  className="slider"
                />
              </div>

              <div className="slider-group">
                <label>
                  <span>🔄 Invert</span>
                  <span className="value">{filters.invert}%</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={filters.invert}
                  onChange={(e) => handleFilterChange('invert', e.target.value)}
                  className="slider"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIImageEditor;
