import { useState, useRef, useCallback } from 'react';
import './BackgroundRemover.css';

const BackgroundRemover = () => {
  const [image, setImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [modelLoaded, setModelLoaded] = useState(false);
  
  const canvasRef = useRef(null);
  const originalCanvasRef = useRef(null);
  const segmenterRef = useRef(null);

  // Load TensorFlow.js and Selfie Segmentation model
  const loadModel = async () => {
    if (segmenterRef.current) return segmenterRef.current;
    
    setProgressText('Loading AI model...');
    setProgress(10);

    // Dynamically load TensorFlow.js
    if (!window.tf) {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.10.0/dist/tf.min.js');
    }
    setProgress(30);

    // Load MediaPipe Selfie Segmentation via TensorFlow
    if (!window.bodySegmentation) {
      await loadScript('https://cdn.jsdelivr.net/npm/@tensorflow-models/body-segmentation@1.0.1/dist/body-segmentation.min.js');
    }
    setProgress(50);

    // Load MediaPipe runtime
    await loadScript('https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation');
    setProgress(70);

    // Create segmenter
    const model = window.bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation;
    const segmenterConfig = {
      runtime: 'mediapipe',
      solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      modelType: 'general'
    };

    segmenterRef.current = await window.bodySegmentation.createSegmenter(model, segmenterConfig);
    setModelLoaded(true);
    setProgress(100);
    
    return segmenterRef.current;
  };

  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setImage(event.target.result);
        setProcessedImage(null);
        drawOriginal(img);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const drawOriginal = (img) => {
    const canvas = originalCanvasRef.current;
    if (!canvas) return;
    
    canvas.width = img.width;
    canvas.height = img.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
  };

  const removeBackground = async () => {
    if (!originalImage) return;
    
    setIsProcessing(true);
    setProgress(0);
    setProcessedImage(null);

    try {
      // Load model if not loaded
      const segmenter = await loadModel();
      
      setProgressText('Analyzing image...');
      setProgress(20);
      await delay(50);

      // Get segmentation mask
      const segmentation = await segmenter.segmentPeople(originalImage, {
        flipHorizontal: false,
        multiSegmentation: false,
        segmentBodyParts: false
      });

      setProgressText('Creating mask...');
      setProgress(40);
      await delay(50);

      if (!segmentation || segmentation.length === 0) {
        // Fallback to advanced algorithmic approach if no person detected
        await algorithmicRemoval();
        return;
      }

      const mask = await segmentation[0].mask.toCanvasImageSource();
      
      setProgressText('Refining edges...');
      setProgress(60);
      await delay(50);

      // Apply mask with edge refinement
      const canvas = canvasRef.current;
      canvas.width = originalImage.width;
      canvas.height = originalImage.height;
      const ctx = canvas.getContext('2d');

      // Draw original image
      ctx.drawImage(originalImage, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Create mask canvas to get mask data
      const maskCanvas = document.createElement('canvas');
      maskCanvas.width = canvas.width;
      maskCanvas.height = canvas.height;
      const maskCtx = maskCanvas.getContext('2d');
      maskCtx.drawImage(mask, 0, 0, canvas.width, canvas.height);
      const maskData = maskCtx.getImageData(0, 0, canvas.width, canvas.height);

      setProgressText('Applying transparency...');
      setProgress(80);
      await delay(50);

      // Apply mask with edge refinement
      const result = applyMaskWithRefinement(imageData, maskData, canvas.width, canvas.height);

      setProgressText('Finalizing...');
      setProgress(95);

      ctx.putImageData(result, 0, 0);
      setProcessedImage(canvas.toDataURL('image/png'));
      setProgress(100);
      setProgressText('Complete!');

    } catch (error) {
      console.error('Segmentation failed, using algorithmic approach:', error);
      await algorithmicRemoval();
    } finally {
      setIsProcessing(false);
    }
  };

  // Advanced algorithmic background removal (fallback)
  const algorithmicRemoval = async () => {
    setProgressText('Using advanced algorithm...');
    setProgress(30);

    const canvas = canvasRef.current;
    canvas.width = originalImage.width;
    canvas.height = originalImage.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(originalImage, 0, 0);
    
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { width, height } = canvas;

    setProgressText('Detecting subject...');
    setProgress(40);
    await delay(50);

    // Step 1: Analyze border colors (likely background)
    const bgColors = analyzeBorderColors(imageData.data, width, height);
    
    setProgressText('Analyzing colors...');
    setProgress(50);
    await delay(50);

    // Step 2: Create initial mask based on color difference
    const colorMask = createColorBasedMask(imageData.data, width, height, bgColors);

    setProgressText('Refining edges...');
    setProgress(60);
    await delay(50);

    // Step 3: Edge-aware refinement
    const edgeMask = edgeAwareRefinement(imageData.data, colorMask, width, height);

    setProgressText('Applying GrabCut...');
    setProgress(70);
    await delay(50);

    // Step 4: GrabCut-style iterative refinement
    const refinedMask = grabCutRefine(imageData.data, edgeMask, width, height, 5);

    setProgressText('Alpha matting...');
    setProgress(80);
    await delay(50);

    // Step 5: Alpha matting for smooth edges
    const alphaMask = alphaMatting(imageData.data, refinedMask, width, height);

    setProgressText('Applying mask...');
    setProgress(90);
    await delay(50);

    // Step 6: Apply final mask
    applyFinalMask(imageData, alphaMask, width, height);

    ctx.putImageData(imageData, 0, 0);
    setProcessedImage(canvas.toDataURL('image/png'));
    setProgress(100);
    setProgressText('Complete!');
    setIsProcessing(false);
  };

  const applyMaskWithRefinement = (imageData, maskData, width, height) => {
    const data = imageData.data;
    const mask = maskData.data;

    // First pass: Apply mask with edge detection
    const edgeStrength = detectEdges(data, width, height);

    for (let i = 0; i < data.length; i += 4) {
      const pixelIndex = i / 4;
      const x = pixelIndex % width;
      const y = Math.floor(pixelIndex / width);
      
      // Get mask value (person = white = 255, background = black = 0)
      let maskValue = mask[i] / 255;

      // Edge-aware refinement
      const edge = edgeStrength[pixelIndex];
      if (edge > 0.3) {
        // Near edge - use more sophisticated blending
        maskValue = refineMaskAtEdge(mask, x, y, width, height, data, i);
      }

      // Apply alpha with feathering
      data[i + 3] = Math.round(maskValue * 255);

      // Color decontamination for semi-transparent pixels
      if (maskValue > 0.1 && maskValue < 0.9) {
        decontaminateColor(data, i, maskValue);
      }
    }

    return imageData;
  };

  const refineMaskAtEdge = (mask, x, y, width, height, imageData, pixelI) => {
    let sum = 0;
    let count = 0;
    const radius = 2;

    // Gaussian-weighted average at edges
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const ni = (ny * width + nx) * 4;
          const weight = Math.exp(-(dx * dx + dy * dy) / (2 * radius));
          sum += (mask[ni] / 255) * weight;
          count += weight;
        }
      }
    }

    return count > 0 ? sum / count : mask[pixelI] / 255;
  };

  const detectEdges = (data, width, height) => {
    const edges = new Float32Array(width * height);
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Sobel operator
        let gx = 0, gy = 0;
        const kernel = [
          [-1, 0, 1],
          [-2, 0, 2],
          [-1, 0, 1]
        ];
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const ni = ((y + ky) * width + (x + kx)) * 4;
            const gray = (data[ni] + data[ni + 1] + data[ni + 2]) / 3;
            gx += gray * kernel[ky + 1][kx + 1];
            gy += gray * kernel[kx + 1][ky + 1];
          }
        }
        
        edges[y * width + x] = Math.min(1, Math.sqrt(gx * gx + gy * gy) / 500);
      }
    }
    
    return edges;
  };

  const decontaminateColor = (data, i, alpha) => {
    // Remove color spill from background
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Estimate foreground color by boosting saturation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const delta = max - min;
    
    if (delta > 20) {
      const boost = 1 + (1 - alpha) * 0.3;
      data[i] = Math.min(255, r + (r - min) * (boost - 1));
      data[i + 1] = Math.min(255, g + (g - min) * (boost - 1));
      data[i + 2] = Math.min(255, b + (b - min) * (boost - 1));
    }
  };

  // Algorithmic helper functions
  const analyzeBorderColors = (data, width, height) => {
    const borderPixels = [];
    const borderSize = Math.max(10, Math.min(width, height) * 0.05);

    // Sample border pixels
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (x < borderSize || x >= width - borderSize || y < borderSize || y >= height - borderSize) {
          const i = (y * width + x) * 4;
          borderPixels.push([data[i], data[i + 1], data[i + 2]]);
        }
      }
    }

    // K-means clustering to find dominant background colors
    return kMeansCluster(borderPixels, 3);
  };

  const kMeansCluster = (pixels, k) => {
    if (pixels.length === 0) return [[255, 255, 255]];

    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)].slice());
    }

    // Iterate
    for (let iter = 0; iter < 10; iter++) {
      const clusters = Array(k).fill(null).map(() => []);

      // Assign pixels to nearest centroid
      for (const pixel of pixels) {
        let minDist = Infinity;
        let nearest = 0;
        for (let c = 0; c < k; c++) {
          const dist = colorDistance(pixel, centroids[c]);
          if (dist < minDist) {
            minDist = dist;
            nearest = c;
          }
        }
        clusters[nearest].push(pixel);
      }

      // Update centroids
      for (let c = 0; c < k; c++) {
        if (clusters[c].length > 0) {
          centroids[c] = [
            clusters[c].reduce((s, p) => s + p[0], 0) / clusters[c].length,
            clusters[c].reduce((s, p) => s + p[1], 0) / clusters[c].length,
            clusters[c].reduce((s, p) => s + p[2], 0) / clusters[c].length
          ];
        }
      }
    }

    return centroids;
  };

  const colorDistance = (c1, c2) => {
    return Math.sqrt(
      Math.pow(c1[0] - c2[0], 2) +
      Math.pow(c1[1] - c2[1], 2) +
      Math.pow(c1[2] - c2[2], 2)
    );
  };

  const createColorBasedMask = (data, width, height, bgColors) => {
    const mask = new Float32Array(width * height);
    const threshold = 50;

    for (let i = 0; i < mask.length; i++) {
      const pi = i * 4;
      const pixel = [data[pi], data[pi + 1], data[pi + 2]];

      // Find minimum distance to background colors
      let minDist = Infinity;
      for (const bg of bgColors) {
        const dist = colorDistance(pixel, bg);
        if (dist < minDist) minDist = dist;
      }

      // Convert distance to mask value
      mask[i] = Math.min(1, minDist / threshold);
    }

    return mask;
  };

  const edgeAwareRefinement = (data, mask, width, height) => {
    const refined = new Float32Array(mask);
    const edges = detectEdges(data, width, height);

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const i = y * width + x;
        
        if (edges[i] > 0.2) {
          // At edges, use bilateral-like filtering
          let sum = 0;
          let weight = 0;
          const radius = 3;

          for (let dy = -radius; dy <= radius; dy++) {
            for (let dx = -radius; dx <= radius; dx++) {
              const ni = (y + dy) * width + (x + dx);
              if (ni >= 0 && ni < mask.length) {
                const spatialW = Math.exp(-(dx * dx + dy * dy) / 8);
                const rangeW = Math.exp(-Math.pow(mask[i] - mask[ni], 2) / 0.5);
                const w = spatialW * rangeW;
                sum += mask[ni] * w;
                weight += w;
              }
            }
          }

          refined[i] = weight > 0 ? sum / weight : mask[i];
        }
      }
    }

    return refined;
  };

  const grabCutRefine = (data, mask, width, height, iterations) => {
    let refined = new Float32Array(mask);

    for (let iter = 0; iter < iterations; iter++) {
      const newMask = new Float32Array(refined);

      // Build foreground and background color models
      const fgPixels = [];
      const bgPixels = [];

      for (let i = 0; i < mask.length; i++) {
        const pi = i * 4;
        const pixel = [data[pi], data[pi + 1], data[pi + 2]];
        
        if (refined[i] > 0.7) fgPixels.push(pixel);
        else if (refined[i] < 0.3) bgPixels.push(pixel);
      }

      const fgCenters = fgPixels.length > 0 ? kMeansCluster(fgPixels, 3) : [[128, 128, 128]];
      const bgCenters = bgPixels.length > 0 ? kMeansCluster(bgPixels, 3) : [[255, 255, 255]];

      // Reclassify uncertain pixels
      for (let i = 0; i < mask.length; i++) {
        if (refined[i] > 0.3 && refined[i] < 0.7) {
          const pi = i * 4;
          const pixel = [data[pi], data[pi + 1], data[pi + 2]];

          let minFgDist = Infinity;
          let minBgDist = Infinity;

          for (const c of fgCenters) {
            const d = colorDistance(pixel, c);
            if (d < minFgDist) minFgDist = d;
          }

          for (const c of bgCenters) {
            const d = colorDistance(pixel, c);
            if (d < minBgDist) minBgDist = d;
          }

          const total = minFgDist + minBgDist;
          newMask[i] = total > 0 ? minBgDist / total : 0.5;
        }
      }

      refined = newMask;
    }

    return refined;
  };

  const alphaMatting = (data, mask, width, height) => {
    const alpha = new Float32Array(mask);

    // Gaussian blur for smooth edges
    const blurred = gaussianBlur(alpha, width, height, 2);

    // Combine original mask with blurred version at edges
    for (let i = 0; i < alpha.length; i++) {
      const diff = Math.abs(mask[i] - 0.5);
      if (diff < 0.3) {
        // Near edge - use blurred
        alpha[i] = blurred[i];
      }
    }

    return alpha;
  };

  const gaussianBlur = (input, width, height, radius) => {
    const output = new Float32Array(input.length);
    const kernel = [];
    const sigma = radius / 2;

    // Create 1D kernel
    let sum = 0;
    for (let i = -radius; i <= radius; i++) {
      const val = Math.exp(-(i * i) / (2 * sigma * sigma));
      kernel.push(val);
      sum += val;
    }
    kernel.forEach((v, i) => kernel[i] = v / sum);

    // Horizontal pass
    const temp = new Float32Array(input.length);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let val = 0;
        for (let k = -radius; k <= radius; k++) {
          const nx = Math.min(width - 1, Math.max(0, x + k));
          val += input[y * width + nx] * kernel[k + radius];
        }
        temp[y * width + x] = val;
      }
    }

    // Vertical pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let val = 0;
        for (let k = -radius; k <= radius; k++) {
          const ny = Math.min(height - 1, Math.max(0, y + k));
          val += temp[ny * width + x] * kernel[k + radius];
        }
        output[y * width + x] = val;
      }
    }

    return output;
  };

  const applyFinalMask = (imageData, mask, width, height) => {
    const data = imageData.data;

    for (let i = 0; i < mask.length; i++) {
      const alpha = Math.max(0, Math.min(255, Math.round(mask[i] * 255)));
      data[i * 4 + 3] = alpha;

      // Color decontamination
      if (alpha > 25 && alpha < 230) {
        decontaminateColor(data, i * 4, alpha / 255);
      }
    }
  };

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  const downloadImage = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.download = `removed-bg-${Date.now()}.png`;
    link.href = processedImage;
    link.click();
  };

  const reset = () => {
    setImage(null);
    setOriginalImage(null);
    setProcessedImage(null);
    setProgress(0);
    setProgressText('');
  };

  return (
    <div className="bg-remover">
      {!image ? (
        <div className="upload-zone">
          <div className="upload-content">
            <div className="upload-icon">✂️</div>
            <h3>AI Background Remover</h3>
            <p>Professional quality • 100% client-side • No upload to server</p>
            <label className="upload-btn">
              📁 Select Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                hidden
              />
            </label>
            <p className="upload-hint">Supports JPG, PNG, WebP • Any size</p>
          </div>
        </div>
      ) : (
        <div className="editor-container">
          <div className="preview-area">
            <div className="canvas-wrapper" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'20\' height=\'20\' fill-opacity=\'.1\'%3E%3Crect x=\'0\' y=\'0\' width=\'10\' height=\'10\' fill=\'%23000\'/%3E%3Crect x=\'10\' y=\'10\' width=\'10\' height=\'10\' fill=\'%23000\'/%3E%3C/svg%3E")' }}>
              <canvas ref={originalCanvasRef} style={{ display: 'none' }} />
              {processedImage ? (
                <img src={processedImage} alt="Result" className="result-image" />
              ) : (
                <img src={image} alt="Original" className="preview-image" />
              )}
            </div>

            <div className="action-bar">
              <button onClick={downloadImage} disabled={!processedImage} className="btn-download">
                ⬇️ Download PNG
              </button>
              <label className="btn-new">
                📁 New Image
                <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
              </label>
              <button onClick={reset} className="btn-reset">🔄 Reset</button>
            </div>
          </div>

          <div className="controls-panel">
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            <button 
              onClick={removeBackground}
              disabled={isProcessing || processedImage}
              className={`btn-process ${isProcessing ? 'processing' : ''}`}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  {progressText} {progress}%
                </>
              ) : processedImage ? (
                '✅ Done!'
              ) : (
                '🚀 Remove Background'
              )}
            </button>

            {isProcessing && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                </div>
              </div>
            )}

            <div className="info-box">
              <h4>🧠 AI-Powered</h4>
              <p>Uses TensorFlow.js with MediaPipe Selfie Segmentation for professional-grade results. Falls back to advanced algorithms for non-person images.</p>
            </div>

            <div className="features-list">
              <div className="feature">✨ Smart edge detection</div>
              <div className="feature">🎯 Alpha matting</div>
              <div className="feature">🔬 Color decontamination</div>
              <div className="feature">💎 Transparent PNG output</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;
