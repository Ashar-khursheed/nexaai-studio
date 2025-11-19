import { useState, useRef, useEffect } from 'react';
import './BackgroundRemover.css';

const BackgroundRemover = () => {
  const [image, setImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showOriginal, setShowOriginal] = useState(false);
  const [quality, setQuality] = useState('high'); // low, medium, high, ultra
  
  const canvasRef = useRef(null);
  const originalImageRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          originalImageRef.current = img;
          setImage(event.target.result);
          setProcessedImage(null);
          setupCanvas(img);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const setupCanvas = (img) => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    // Set canvas size (limit for performance but maintain quality)
    const maxDimension = quality === 'ultra' ? 2400 : quality === 'high' ? 1600 : quality === 'medium' ? 1200 : 800;
    const scale = Math.min(1, maxDimension / Math.max(img.width, img.height));
    
    canvas.width = img.width * scale;
    canvas.height = img.height * scale;
    
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  };

  const removeBackground = async () => {
    setIsProcessing(true);
    setProgress(0);
    
    // Use setTimeout to allow UI to update
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    
    try {
      setProgress(10);
      
      // Step 1: Advanced subject detection
      const subjectMask = await detectSubject(imageData, canvas.width, canvas.height);
      setProgress(30);
      
      // Step 2: Refine with GrabCut-inspired algorithm
      const refinedMask = await grabCutRefinement(imageData, subjectMask, canvas.width, canvas.height);
      setProgress(50);
      
      // Step 3: Edge enhancement and alpha matting
      const alphaMask = await advancedAlphaMatting(imageData, refinedMask, canvas.width, canvas.height);
      setProgress(70);
      
      // Step 4: Apply mask with smart edge processing
      const result = await applyMaskWithEdgeProcessing(imageData, alphaMask, canvas.width, canvas.height);
      setProgress(90);
      
      // Draw final result
      ctx.putImageData(result, 0, 0);
      
      setProgress(100);
      setProcessedImage(canvas.toDataURL('image/png'));
      
    } catch (error) {
      console.error('Background removal failed:', error);
      alert('Failed to process image. Please try again with a different image.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const detectSubject = async (imageData, width, height) => {
    const data = imageData.data;
    const mask = new Uint8Array(width * height);
    
    // Analyze image to detect subject using multiple techniques
    
    // 1. Saliency detection (what stands out)
    const saliencyMap = calculateSaliency(data, width, height);
    
    // 2. Edge detection (subject usually has strong edges)
    const edgeMap = detectEdges(data, width, height);
    
    // 3. Color clustering (background often more uniform)
    const clusters = colorClustering(data, width, height, 5);
    
    // 4. Background detection from borders
    const backgroundCluster = detectBackgroundCluster(clusters, width, height);
    
    // Combine all techniques
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const pixelIdx = idx * 4;
        
        const saliency = saliencyMap[idx];
        const edgeStrength = edgeMap[idx];
        const cluster = clusters[idx];
        const isBackground = cluster === backgroundCluster;
        
        // Distance from center (subjects often in center)
        const centerX = width / 2;
        const centerY = height / 2;
        const distFromCenter = Math.sqrt(
          Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
        );
        const maxDist = Math.sqrt(centerX * centerX + centerY * centerY);
        const centerScore = 1 - (distFromCenter / maxDist);
        
        // Combine scores
        const subjectScore = (
          saliency * 0.35 +
          edgeStrength * 0.25 +
          (!isBackground ? 1 : 0) * 0.25 +
          centerScore * 0.15
        );
        
        mask[idx] = subjectScore > 0.45 ? 255 : 0;
      }
    }
    
    // Morphological operations to clean up mask
    let cleanedMask = morphologicalClose(mask, width, height, 3);
    cleanedMask = morphologicalOpen(cleanedMask, width, height, 2);
    cleanedMask = removeSmallRegions(cleanedMask, width, height, 100);
    
    return cleanedMask;
  };

  const calculateSaliency = (data, width, height) => {
    const saliency = new Float32Array(width * height);
    
    // Simple saliency based on color uniqueness and contrast
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        
        let contrastSum = 0;
        let count = 0;
        
        // Compare with surrounding region
        const radius = 15;
        for (let dy = -radius; dy <= radius; dy += 5) {
          for (let dx = -radius; dx <= radius; dx += 5) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const nIdx = (ny * width + nx) * 4;
              const diff = Math.abs(r - data[nIdx]) + 
                          Math.abs(g - data[nIdx + 1]) + 
                          Math.abs(b - data[nIdx + 2]);
              contrastSum += diff;
              count++;
            }
          }
        }
        
        saliency[y * width + x] = count > 0 ? (contrastSum / count) / 765 : 0;
      }
    }
    
    return saliency;
  };

  const detectEdges = (data, width, height) => {
    const edges = new Float32Array(width * height);
    
    // Sobel edge detection
    const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
    const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const intensity = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            
            gx += intensity * sobelX[ky + 1][kx + 1];
            gy += intensity * sobelY[ky + 1][kx + 1];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[y * width + x] = Math.min(1, magnitude / 1000);
      }
    }
    
    return edges;
  };

  const colorClustering = (data, width, height, k) => {
    const pixels = [];
    
    // Sample pixels for clustering (every 4th pixel for performance)
    for (let i = 0; i < data.length; i += 16) {
      pixels.push([data[i], data[i + 1], data[i + 2]]);
    }
    
    // K-means clustering
    const clusters = kMeansClustering(pixels, k, 10);
    
    // Assign each pixel to nearest cluster
    const assignments = new Uint8Array(width * height);
    for (let i = 0; i < data.length; i += 4) {
      const pixel = [data[i], data[i + 1], data[i + 2]];
      let minDist = Infinity;
      let cluster = 0;
      
      for (let c = 0; c < clusters.length; c++) {
        const dist = colorDistance(pixel, clusters[c]);
        if (dist < minDist) {
          minDist = dist;
          cluster = c;
        }
      }
      
      assignments[i / 4] = cluster;
    }
    
    return assignments;
  };

  const kMeansClustering = (pixels, k, iterations) => {
    // Initialize centroids randomly
    let centroids = [];
    for (let i = 0; i < k; i++) {
      centroids.push(pixels[Math.floor(Math.random() * pixels.length)]);
    }
    
    for (let iter = 0; iter < iterations; iter++) {
      // Assign pixels to nearest centroid
      const assignments = pixels.map(pixel => {
        let minDist = Infinity;
        let cluster = 0;
        
        for (let c = 0; c < centroids.length; c++) {
          const dist = colorDistance(pixel, centroids[c]);
          if (dist < minDist) {
            minDist = dist;
            cluster = c;
          }
        }
        
        return cluster;
      });
      
      // Update centroids
      const newCentroids = [];
      for (let c = 0; c < k; c++) {
        const clusterPixels = pixels.filter((_, i) => assignments[i] === c);
        if (clusterPixels.length > 0) {
          const avgR = clusterPixels.reduce((sum, p) => sum + p[0], 0) / clusterPixels.length;
          const avgG = clusterPixels.reduce((sum, p) => sum + p[1], 0) / clusterPixels.length;
          const avgB = clusterPixels.reduce((sum, p) => sum + p[2], 0) / clusterPixels.length;
          newCentroids.push([avgR, avgG, avgB]);
        } else {
          newCentroids.push(centroids[c]);
        }
      }
      
      centroids = newCentroids;
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

  const detectBackgroundCluster = (clusters, width, height) => {
    // Count cluster occurrences on image borders
    const borderCounts = {};
    
    // Top and bottom borders
    for (let x = 0; x < width; x++) {
      const topCluster = clusters[x];
      const bottomCluster = clusters[(height - 1) * width + x];
      borderCounts[topCluster] = (borderCounts[topCluster] || 0) + 1;
      borderCounts[bottomCluster] = (borderCounts[bottomCluster] || 0) + 1;
    }
    
    // Left and right borders
    for (let y = 0; y < height; y++) {
      const leftCluster = clusters[y * width];
      const rightCluster = clusters[y * width + width - 1];
      borderCounts[leftCluster] = (borderCounts[leftCluster] || 0) + 1;
      borderCounts[rightCluster] = (borderCounts[rightCluster] || 0) + 1;
    }
    
    // Return cluster with highest border count
    let maxCount = 0;
    let bgCluster = 0;
    for (const [cluster, count] of Object.entries(borderCounts)) {
      if (count > maxCount) {
        maxCount = count;
        bgCluster = parseInt(cluster);
      }
    }
    
    return bgCluster;
  };

  const grabCutRefinement = async (imageData, initialMask, width, height) => {
    const data = imageData.data;
    let mask = new Uint8Array(initialMask);
    
    // Iterative refinement (simplified GrabCut)
    for (let iteration = 0; iteration < 3; iteration++) {
      // Build color models for foreground and background
      const fgColors = [];
      const bgColors = [];
      
      for (let i = 0; i < mask.length; i++) {
        const pixelIdx = i * 4;
        const color = [data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2]];
        
        if (mask[i] > 127) {
          fgColors.push(color);
        } else {
          bgColors.push(color);
        }
      }
      
      // Build Gaussian Mixture Models (simplified)
      const fgModel = buildColorModel(fgColors, 3);
      const bgModel = buildColorModel(bgColors, 3);
      
      // Reassign pixels based on models
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const pixelIdx = idx * 4;
          const color = [data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2]];
          
          const fgProb = getColorProbability(color, fgModel);
          const bgProb = getColorProbability(color, bgModel);
          
          // Consider spatial smoothness
          const neighborFg = countNeighborForeground(mask, x, y, width, height);
          const smoothness = neighborFg / 8;
          
          const finalFgProb = fgProb * 0.7 + smoothness * 0.3;
          const finalBgProb = bgProb * 0.7 + (1 - smoothness) * 0.3;
          
          mask[idx] = finalFgProb > finalBgProb ? 255 : 0;
        }
      }
    }
    
    return mask;
  };

  const buildColorModel = (colors, numComponents) => {
    if (colors.length === 0) return [];
    
    // Simple clustering for Gaussian components
    const clusters = kMeansClustering(colors, Math.min(numComponents, colors.length), 5);
    
    return clusters.map(centroid => {
      // Calculate variance for each component
      const variance = colors.reduce((sum, color) => {
        return sum + Math.pow(colorDistance(color, centroid), 2);
      }, 0) / colors.length;
      
      return { mean: centroid, variance: Math.max(variance, 100) };
    });
  };

  const getColorProbability = (color, model) => {
    if (model.length === 0) return 0.5;
    
    let maxProb = 0;
    
    for (const component of model) {
      const dist = colorDistance(color, component.mean);
      const prob = Math.exp(-dist * dist / (2 * component.variance));
      maxProb = Math.max(maxProb, prob);
    }
    
    return maxProb;
  };

  const countNeighborForeground = (mask, x, y, width, height) => {
    let count = 0;
    
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          if (mask[ny * width + nx] > 127) count++;
        }
      }
    }
    
    return count;
  };

  const advancedAlphaMatting = async (imageData, mask, width, height) => {
    const data = imageData.data;
    const alphaMask = new Uint8Array(mask);
    
    // Find trimap regions (definite foreground, background, and unknown)
    const trimap = new Uint8Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const neighbors = getNeighbors(mask, x, y, width, height, 2);
        
        const allFg = neighbors.every(n => n > 200);
        const allBg = neighbors.every(n => n < 50);
        
        if (allFg) {
          trimap[idx] = 255; // Definite foreground
          alphaMask[idx] = 255;
        } else if (allBg) {
          trimap[idx] = 0; // Definite background
          alphaMask[idx] = 0;
        } else {
          trimap[idx] = 128; // Unknown - needs alpha matting
        }
      }
    }
    
    // Apply closed-form alpha matting on unknown regions
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        
        if (trimap[idx] === 128) {
          const pixelIdx = idx * 4;
          const color = [data[pixelIdx], data[pixelIdx + 1], data[pixelIdx + 2]];
          
          // Estimate foreground and background colors from neighborhood
          const fgColor = estimateForegroundColor(data, trimap, x, y, width, height);
          const bgColor = estimateBackgroundColor(data, trimap, x, y, width, height);
          
          // Calculate alpha using color-line model
          const alpha = calculateAlpha(color, fgColor, bgColor);
          alphaMask[idx] = Math.round(alpha * 255);
        }
      }
    }
    
    // Refine alpha with edge-aware smoothing
    return edgeAwareSmoothing(alphaMask, data, width, height);
  };

  const getNeighbors = (mask, x, y, width, height, radius) => {
    const neighbors = [];
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          neighbors.push(mask[ny * width + nx]);
        }
      }
    }
    
    return neighbors;
  };

  const estimateForegroundColor = (data, trimap, x, y, width, height) => {
    let r = 0, g = 0, b = 0, count = 0;
    const radius = 5;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = ny * width + nx;
          if (trimap[idx] === 255) {
            const pixelIdx = idx * 4;
            r += data[pixelIdx];
            g += data[pixelIdx + 1];
            b += data[pixelIdx + 2];
            count++;
          }
        }
      }
    }
    
    return count > 0 ? [r / count, g / count, b / count] : [0, 0, 0];
  };

  const estimateBackgroundColor = (data, trimap, x, y, width, height) => {
    let r = 0, g = 0, b = 0, count = 0;
    const radius = 5;
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = ny * width + nx;
          if (trimap[idx] === 0) {
            const pixelIdx = idx * 4;
            r += data[pixelIdx];
            g += data[pixelIdx + 1];
            b += data[pixelIdx + 2];
            count++;
          }
        }
      }
    }
    
    return count > 0 ? [r / count, g / count, b / count] : [255, 255, 255];
  };

  const calculateAlpha = (color, fgColor, bgColor) => {
    // Solve for alpha using the compositing equation: C = alpha*F + (1-alpha)*B
    
    const fgDist = colorDistance(color, fgColor);
    const bgDist = colorDistance(color, bgColor);
    const totalDist = fgDist + bgDist;
    
    if (totalDist < 1) return 1;
    
    return 1 - (fgDist / totalDist);
  };

  const edgeAwareSmoothing = (alphaMask, imageData, width, height) => {
    const smoothed = new Uint8Array(alphaMask);
    const iterations = 2;
    
    for (let iter = 0; iter < iterations; iter++) {
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          const idx = y * width + x;
          const pixelIdx = idx * 4;
          
          const centerColor = [
            imageData[pixelIdx],
            imageData[pixelIdx + 1],
            imageData[pixelIdx + 2]
          ];
          
          let weightedSum = 0;
          let weightSum = 0;
          
          // Bilateral filter - smooth based on spatial and color similarity
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = x + dx;
              const ny = y + dy;
              const nIdx = ny * width + nx;
              const nPixelIdx = nIdx * 4;
              
              const neighborColor = [
                imageData[nPixelIdx],
                imageData[nPixelIdx + 1],
                imageData[nPixelIdx + 2]
              ];
              
              // Spatial weight
              const spatialDist = Math.sqrt(dx * dx + dy * dy);
              const spatialWeight = Math.exp(-spatialDist * spatialDist / 2);
              
              // Color weight
              const colorDist = colorDistance(centerColor, neighborColor);
              const colorWeight = Math.exp(-colorDist * colorDist / (2 * 1000));
              
              const weight = spatialWeight * colorWeight;
              
              weightedSum += alphaMask[nIdx] * weight;
              weightSum += weight;
            }
          }
          
          smoothed[idx] = Math.round(weightedSum / weightSum);
        }
      }
    }
    
    return smoothed;
  };

  const applyMaskWithEdgeProcessing = async (imageData, alphaMask, width, height) => {
    const result = new ImageData(new Uint8ClampedArray(imageData.data), width, height);
    
    // Apply alpha channel
    for (let i = 0; i < alphaMask.length; i++) {
      result.data[i * 4 + 3] = alphaMask[i];
    }
    
    // Edge refinement: remove color fringing
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = y * width + x;
        const pixelIdx = idx * 4;
        const alpha = result.data[pixelIdx + 3];
        
        // Only process semi-transparent pixels (edges)
        if (alpha > 0 && alpha < 255) {
          // Color decontamination
          const fgColor = estimateTrueForegroundColor(result.data, alphaMask, x, y, width, height);
          
          const alphaRatio = alpha / 255;
          result.data[pixelIdx] = fgColor[0] * alphaRatio + result.data[pixelIdx] * (1 - alphaRatio);
          result.data[pixelIdx + 1] = fgColor[1] * alphaRatio + result.data[pixelIdx + 1] * (1 - alphaRatio);
          result.data[pixelIdx + 2] = fgColor[2] * alphaRatio + result.data[pixelIdx + 2] * (1 - alphaRatio);
        }
      }
    }
    
    return result;
  };

  const estimateTrueForegroundColor = (data, alphaMask, x, y, width, height) => {
    let r = 0, g = 0, b = 0, count = 0;
    
    for (let dy = -2; dy <= 2; dy++) {
      for (let dx = -2; dx <= 2; dx++) {
        const nx = x + dx;
        const ny = y + dy;
        
        if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
          const idx = ny * width + nx;
          if (alphaMask[idx] > 200) {
            const pixelIdx = idx * 4;
            r += data[pixelIdx];
            g += data[pixelIdx + 1];
            b += data[pixelIdx + 2];
            count++;
          }
        }
      }
    }
    
    const idx = y * width + x;
    return count > 0 ? [r / count, g / count, b / count] : [data[idx * 4], data[idx * 4 + 1], data[idx * 4 + 2]];
  };

  const morphologicalClose = (mask, width, height, radius) => {
    return morphologicalErode(morphologicalDilate(mask, width, height, radius), width, height, radius);
  };

  const morphologicalOpen = (mask, width, height, radius) => {
    return morphologicalDilate(morphologicalErode(mask, width, height, radius), width, height, radius);
  };

  const morphologicalDilate = (mask, width, height, radius) => {
    const result = new Uint8Array(mask);
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let maxVal = 0;
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = (y + dy) * width + (x + dx);
            maxVal = Math.max(maxVal, mask[idx]);
          }
        }
        
        result[y * width + x] = maxVal;
      }
    }
    
    return result;
  };

  const morphologicalErode = (mask, width, height, radius) => {
    const result = new Uint8Array(mask);
    
    for (let y = radius; y < height - radius; y++) {
      for (let x = radius; x < width - radius; x++) {
        let minVal = 255;
        
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const idx = (y + dy) * width + (x + dx);
            minVal = Math.min(minVal, mask[idx]);
          }
        }
        
        result[y * width + x] = minVal;
      }
    }
    
    return result;
  };

  const removeSmallRegions = (mask, width, height, minSize) => {
    const result = new Uint8Array(mask);
    const visited = new Uint8Array(width * height);
    
    const floodFill = (startIdx) => {
      const stack = [startIdx];
      const region = [];
      const value = mask[startIdx];
      
      while (stack.length > 0) {
        const idx = stack.pop();
        
        if (visited[idx] || mask[idx] !== value) continue;
        
        visited[idx] = 1;
        region.push(idx);
        
        const x = idx % width;
        const y = Math.floor(idx / width);
        
        if (x > 0) stack.push(idx - 1);
        if (x < width - 1) stack.push(idx + 1);
        if (y > 0) stack.push(idx - width);
        if (y < height - 1) stack.push(idx + width);
      }
      
      return region;
    };
    
    for (let i = 0; i < mask.length; i++) {
      if (!visited[i] && mask[i] > 0) {
        const region = floodFill(i);
        
        if (region.length < minSize) {
          region.forEach(idx => {
            result[idx] = 0;
          });
        }
      }
    }
    
    return result;
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas || !processedImage) return;

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `background-removed-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  };

  const resetImage = () => {
    if (originalImageRef.current) {
      setupCanvas(originalImageRef.current);
      setProcessedImage(null);
    }
  };

  return (
    <div className="background-remover">
      {!image ? (
        <div className="upload-area">
          <div className="upload-content">
            <div className="upload-icon">✂️</div>
            <h3>Professional Background Remover</h3>
            <p>Advanced AI-powered background removal with perfect edge detection</p>
            <label className="upload-btn">
              📁 Upload Image
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                style={{ display: 'none' }}
              />
            </label>
            <div className="features">
              <div className="feature">✨ Smart subject detection</div>
              <div className="feature">🎯 Precise edge refinement</div>
              <div className="feature">🔬 Alpha matting technology</div>
              <div className="feature">💎 Professional quality output</div>
            </div>
          </div>
        </div>
      ) : (
        <div className="remover-container">
          <div className="preview-section">
            <div className="canvas-container">
              {showOriginal && originalImageRef.current ? (
                <img 
                  src={image} 
                  alt="Original" 
                  className="preview-image"
                />
              ) : (
                <canvas ref={canvasRef} className="preview-canvas" />
              )}
            </div>

            <div className="preview-actions">
              <button 
                onClick={() => setShowOriginal(!showOriginal)} 
                className="action-btn compare-btn"
                disabled={!processedImage}
              >
                {showOriginal ? '👁️ Show Result' : '👁️ Show Original'}
              </button>
              <button 
                onClick={downloadImage} 
                className="action-btn download-btn"
                disabled={!processedImage}
              >
                ⬇️ Download PNG
              </button>
              <button onClick={resetImage} className="action-btn reset-btn">
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
            <div className="quality-section">
              <h4>🎨 Processing Quality</h4>
              <div className="quality-buttons">
                <button
                  onClick={() => setQuality('medium')}
                  className={`quality-btn ${quality === 'medium' ? 'active' : ''}`}
                  disabled={isProcessing}
                >
                  ⚡ Fast
                </button>
                <button
                  onClick={() => setQuality('high')}
                  className={`quality-btn ${quality === 'high' ? 'active' : ''}`}
                  disabled={isProcessing}
                >
                  ✨ High Quality
                </button>
                <button
                  onClick={() => setQuality('ultra')}
                  className={`quality-btn ${quality === 'ultra' ? 'active' : ''}`}
                  disabled={isProcessing}
                >
                  💎 Ultra HD
                </button>
              </div>
            </div>

            <button 
              onClick={removeBackground}
              disabled={isProcessing || processedImage}
              className={`remove-btn ${isProcessing ? 'processing' : ''}`}
            >
              {isProcessing ? (
                <>
                  <span className="spinner"></span>
                  Processing... {progress}%
                </>
              ) : processedImage ? (
                '✅ Background Removed'
              ) : (
                '🚀 Remove Background'
              )}
            </button>

            {isProcessing && (
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }}></div>
              </div>
            )}

            <div className="info-section">
              <h4>🎯 How It Works</h4>
              <div className="info-steps">
                <div className="step">
                  <span className="step-number">1</span>
                  <div className="step-content">
                    <strong>Smart Detection</strong>
                    <p>AI analyzes your image using saliency detection, edge detection, and color clustering</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">2</span>
                  <div className="step-content">
                    <strong>GrabCut Refinement</strong>
                    <p>Advanced algorithm refines the subject mask using iterative color models</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">3</span>
                  <div className="step-content">
                    <strong>Alpha Matting</strong>
                    <p>Professional edge processing creates smooth, natural-looking transparency</p>
                  </div>
                </div>
                <div className="step">
                  <span className="step-number">4</span>
                  <div className="step-content">
                    <strong>Edge Enhancement</strong>
                    <p>Color decontamination removes fringing for perfect edges</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="tips-section">
              <h4>💡 Best Results Tips</h4>
              <ul>
                <li>Use high-resolution images for best quality</li>
                <li>Clear subject-background contrast works best</li>
                <li>Well-lit photos produce cleaner edges</li>
                <li>Choose Ultra HD for professional projects</li>
                <li>Processing may take 5-15 seconds</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackgroundRemover;