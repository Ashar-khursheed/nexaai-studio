import { useState, useRef, useEffect } from 'react';
import './VirtualTryOn.css';
import { FaceMesh } from '@mediapipe/face_mesh';
import { Camera } from '@mediapipe/camera_utils';

const VirtualTryOn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const cameraActiveRef = useRef(false);
  const [selectedItem, setSelectedItem] = useState('glasses1');
  const faceDataRef = useRef(null);

  const items = {
    glasses1: { type: 'glasses', emoji: '🕶️', name: 'Cool Sunglasses', color: '#1a1a1a', tint: 'rgba(0,0,0,0.3)' },
    glasses2: { type: 'glasses', emoji: '👓', name: 'Reading Glasses', color: '#8b4513', tint: 'rgba(139,69,19,0.15)' },
    glasses3: { type: 'glasses', emoji: '🥽', name: 'Sport Goggles', color: '#ff6b6b', tint: 'rgba(255,107,107,0.2)' },
    cap1: { type: 'cap', emoji: '🧢', name: 'Baseball Cap', color: '#3b82f6' },
    cap2: { type: 'cap', emoji: '🎩', name: 'Top Hat', color: '#1a1a1a' },
    cap3: { type: 'cap', emoji: '👒', name: 'Sun Hat', color: '#f59e0b' },
    mask1: { type: 'mask', emoji: '😷', name: 'Medical Mask', color: '#60a5fa' },
    mask2: { type: 'mask', emoji: '🎭', name: 'Fashion Mask', color: '#ec4899' },
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 1280, height: 720 },
      });
      streamRef.current = stream;
      setCameraActive(true);
    } catch (err) {
      console.error(err);
      alert('Camera access denied. Please allow camera and try again.');
    }
  };

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      const video = videoRef.current;
      video.srcObject = streamRef.current;
      
      video.onloadedmetadata = () => {
        video.play().then(() => {
          cameraActiveRef.current = true;
          initFaceDetection();
        });
      };
    }
  }, [cameraActive]);

   const initFaceDetection = () => {

    const faceMesh = new FaceMesh({
      locateFile: (file) => `/mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        faceDataRef.current = results.multiFaceLandmarks[0];
      }
      drawFrame();
    });

    if (videoRef.current) {
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (videoRef.current && cameraActiveRef.current) {
            await faceMesh.send({ image: videoRef.current });
          }
        },
        width: 1280,
        height: 720,
      });
      camera.start();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
    cameraActiveRef.current = false;
  };

  const drawFrame = () => {
    if (!cameraActiveRef.current || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const item = items[selectedItem];

    if (video.readyState >= 2) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.save();
      ctx.scale(-1, 1);
      ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
      ctx.restore();

      if (faceDataRef.current) {
        const landmarks = faceDataRef.current;
        
        // Key facial landmarks (MediaPipe face mesh indices)
        const leftEye = landmarks[33];
        const rightEye = landmarks[263];
        const noseTip = landmarks[1];
        const leftCheek = landmarks[234];
        const rightCheek = landmarks[454];
        const forehead = landmarks[10];
        const chin = landmarks[152];

        const eyeDistance = Math.sqrt(
          Math.pow((rightEye.x - leftEye.x) * canvas.width, 2) +
          Math.pow((rightEye.y - leftEye.y) * canvas.height, 2)
        );

        if (item.type === 'glasses') {
          drawGlasses(ctx, leftEye, rightEye, canvas, item, eyeDistance);
        } else if (item.type === 'cap') {
          drawCap(ctx, forehead, leftCheek, rightCheek, canvas, item, eyeDistance);
        } else if (item.type === 'mask') {
          drawMask(ctx, noseTip, leftCheek, rightCheek, chin, canvas, item, eyeDistance);
        }
      }
    }
  };

  const drawGlasses = (ctx, leftEye, rightEye, canvas, item, eyeDistance) => {
    const centerX = ((leftEye.x + rightEye.x) / 2) * canvas.width;
    const centerY = ((leftEye.y + rightEye.y) / 2) * canvas.height;
    
    const angle = Math.atan2(
      (rightEye.y - leftEye.y) * canvas.height,
      (rightEye.x - leftEye.x) * canvas.width
    );

    const glassesWidth = eyeDistance * 1.8;
    const glassesHeight = eyeDistance * 0.4;
    const lensWidth = eyeDistance * 0.5;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    // Frame
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 4;
    ctx.fillStyle = item.tint;

    // Left lens
    ctx.beginPath();
    ctx.ellipse(-glassesWidth * 0.25, 0, lensWidth * 0.5, glassesHeight * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Right lens
    ctx.beginPath();
    ctx.ellipse(glassesWidth * 0.25, 0, lensWidth * 0.5, glassesHeight * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bridge
    ctx.beginPath();
    ctx.moveTo(-lensWidth * 0.25, 0);
    ctx.lineTo(lensWidth * 0.25, 0);
    ctx.stroke();

    // Temples
    ctx.beginPath();
    ctx.moveTo(-glassesWidth * 0.5, 0);
    ctx.lineTo(-glassesWidth * 0.7, glassesHeight * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(glassesWidth * 0.5, 0);
    ctx.lineTo(glassesWidth * 0.7, glassesHeight * 0.3);
    ctx.stroke();

    ctx.restore();
  };

  const drawCap = (ctx, forehead, leftCheek, rightCheek, canvas, item, eyeDistance) => {
    const centerX = forehead.x * canvas.width;
    const centerY = forehead.y * canvas.height;
    const capWidth = eyeDistance * 1.5;
    const capHeight = eyeDistance * 0.8;

    ctx.fillStyle = item.color;
    
    // Crown
    ctx.beginPath();
    ctx.ellipse(centerX, centerY - capHeight * 0.3, capWidth * 0.6, capHeight * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bill
    ctx.beginPath();
    ctx.ellipse(centerX, centerY + capHeight * 0.3, capWidth * 0.7, capHeight * 0.3, 0, 0, Math.PI);
    ctx.fill();

    // Highlight
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.ellipse(centerX - capWidth * 0.15, centerY - capHeight * 0.5, capWidth * 0.2, capHeight * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();
  };

  const drawMask = (ctx, noseTip, leftCheek, rightCheek, chin, canvas, item, eyeDistance) => {
    const maskWidth = eyeDistance * 1.4;
    const maskHeight = eyeDistance * 0.6;
    const centerX = noseTip.x * canvas.width;
    const centerY = noseTip.y * canvas.height + maskHeight * 0.3;

    ctx.fillStyle = item.color;
    
    // Main mask body
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, maskWidth * 0.7, maskHeight * 0.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Pleats
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.lineWidth = 2;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath();
      ctx.moveTo(centerX - maskWidth * 0.4, centerY + i * maskHeight * 0.12);
      ctx.lineTo(centerX + maskWidth * 0.4, centerY + i * maskHeight * 0.12);
      ctx.stroke();
    }

    // Ear loops
    ctx.strokeStyle = item.color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - maskWidth * 0.65, centerY);
    ctx.quadraticCurveTo(
      centerX - maskWidth * 0.9, centerY - maskHeight * 0.4,
      leftCheek.x * canvas.width - eyeDistance * 0.5, leftCheek.y * canvas.height
    );
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX + maskWidth * 0.65, centerY);
    ctx.quadraticCurveTo(
      centerX + maskWidth * 0.9, centerY - maskHeight * 0.4,
      rightCheek.x * canvas.width + eyeDistance * 0.5, rightCheek.y * canvas.height
    );
    ctx.stroke();
  };

  const takePhoto = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const link = document.createElement('a');
      link.download = 'virtual-tryon.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  return (
    <div className="virtual-tryon">
      <div className="tryon-container">
        <div className="video-container">
          {!cameraActive ? (
            <div className="camera-placeholder">
              <div className="placeholder-content">
                <span className="placeholder-icon">📸</span>
                <h3>Advanced Virtual Try-On</h3>
                <p>Real-time face tracking with AI</p>
                <button onClick={startCamera} className="start-camera-btn">
                  📹 Start Camera
                </button>
              </div>
            </div>
          ) : (
            <div className="camera-active">
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                style={{ position: 'absolute', opacity: 0, width: 1, height: 1 }} 
              />
              <canvas ref={canvasRef} className="overlay-canvas" />
            </div>
          )}
        </div>

        <div className="controls-section">
          <h4>Choose Your Style</h4>
          
          <div className="items-section">
            <h5>🕶️ Glasses</h5>
            <div className="items-grid">
              {Object.entries(items).filter(([_, item]) => item.type === 'glasses').map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedItem(key)}
                  className={`item-btn ${selectedItem === key ? 'active' : ''}`}
                >
                  <span className="item-emoji">{item.emoji}</span>
                  <span className="item-name">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="items-section">
            <h5>🧢 Caps & Hats</h5>
            <div className="items-grid">
              {Object.entries(items).filter(([_, item]) => item.type === 'cap').map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedItem(key)}
                  className={`item-btn ${selectedItem === key ? 'active' : ''}`}
                >
                  <span className="item-emoji">{item.emoji}</span>
                  <span className="item-name">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="items-section">
            <h5>😷 Masks</h5>
            <div className="items-grid">
              {Object.entries(items).filter(([_, item]) => item.type === 'mask').map(([key, item]) => (
                <button
                  key={key}
                  onClick={() => setSelectedItem(key)}
                  className={`item-btn ${selectedItem === key ? 'active' : ''}`}
                >
                  <span className="item-emoji">{item.emoji}</span>
                  <span className="item-name">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          {cameraActive && (
            <div className="action-buttons">
              <button onClick={takePhoto} className="action-btn photo-btn">📷 Take Photo</button>
              <button onClick={stopCamera} className="action-btn stop-btn">⏹️ Stop Camera</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VirtualTryOn;
