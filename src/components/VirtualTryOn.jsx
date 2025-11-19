// import { useState, useRef, useEffect } from 'react';
// import './VirtualTryOn.css';

// const VirtualTryOn = () => {
//   const videoRef = useRef(null);
//   const canvasRef = useRef(null);
//   const streamRef = useRef(null);
//   const [cameraActive, setCameraActive] = useState(false);
//   const cameraActiveRef = useRef(false);
//   const [selectedItem, setSelectedItem] = useState('glasses1');

//   const items = {
//     glasses1: { type: 'glasses', emoji: '🕶️', name: 'Cool Sunglasses', color: '#1a1a1a' },
//     glasses2: { type: 'glasses', emoji: '👓', name: 'Reading Glasses', color: '#8b4513' },
//     glasses3: { type: 'glasses', emoji: '🥽', name: 'Sport Goggles', color: '#ff6b6b' },
//     cap1: { type: 'cap', emoji: '🧢', name: 'Baseball Cap', color: '#3b82f6' },
//     cap2: { type: 'cap', emoji: '🎩', name: 'Top Hat', color: '#1a1a1a' },
//     cap3: { type: 'cap', emoji: '👒', name: 'Sun Hat', color: '#f59e0b' },
//   };

//     const startCamera = async () => {
//       try {
//         const stream = await navigator.mediaDevices.getUserMedia({
//           video: { facingMode: 'user', width: 640, height: 480 }
//         });
        
//         streamRef.current = stream;

//         if (videoRef.current) {
//           videoRef.current.srcObject = stream;

//           videoRef.current.onloadeddata = () => {
//             setCameraActive(true);
//             cameraActiveRef.current = true;
//             requestAnimationFrame(drawFrame);
//           };

//           videoRef.current.play();
//         }
//       } catch (err) {
//         alert('Camera access denied. Please allow camera and try again.');
//       }
//     };


//   const stopCamera = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach(track => track.stop());
//       streamRef.current = null;
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//     setCameraActive(false);
//     cameraActiveRef.current = false;

//   };

//   const drawFrame = () => {
//     if (!cameraActiveRef.current || !videoRef.current || !canvasRef.current) return;

//     const video = videoRef.current;
//     const canvas = canvasRef.current;
//     const ctx = canvas.getContext('2d');

//     if (video.readyState === video.HAVE_ENOUGH_DATA) {
//       canvas.width = video.videoWidth;
//       canvas.height = video.videoHeight;
      
//       ctx.drawImage(video, 0, 0);

//       const centerX = canvas.width / 2;
//       const centerY = canvas.height / 3;
//       const faceWidth = canvas.width * 0.4;
//       const item = items[selectedItem];

//       if (item.type === 'glasses') {
//         const w = faceWidth * 0.9;
//         const h = faceWidth * 0.12;
        
//         ctx.strokeStyle = item.color;
//         ctx.fillStyle = item.color + '40';
//         ctx.lineWidth = 4;
        
//         // Left lens
//         ctx.beginPath();
//         ctx.ellipse(centerX - w * 0.28, centerY, w * 0.16, h, 0, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.stroke();
        
//         // Right lens
//         ctx.beginPath();
//         ctx.ellipse(centerX + w * 0.28, centerY, w * 0.16, h, 0, 0, Math.PI * 2);
//         ctx.fill();
//         ctx.stroke();
        
//         // Bridge
//         ctx.beginPath();
//         ctx.moveTo(centerX - w * 0.12, centerY);
//         ctx.lineTo(centerX + w * 0.12, centerY);
//         ctx.stroke();
        
//         // Temples
//         ctx.beginPath();
//         ctx.moveTo(centerX - w * 0.44, centerY);
//         ctx.lineTo(centerX - w * 0.7, centerY + h * 0.5);
//         ctx.stroke();
        
//         ctx.beginPath();
//         ctx.moveTo(centerX + w * 0.44, centerY);
//         ctx.lineTo(centerX + w * 0.7, centerY + h * 0.5);
//         ctx.stroke();
//       } else if (item.type === 'cap') {
//         const capW = faceWidth;
//         const capH = faceWidth * 0.3;
//         const capY = centerY - faceWidth * 0.5;

//         ctx.fillStyle = item.color;
        
//         ctx.beginPath();
//         ctx.ellipse(centerX, capY - capH * 0.2, capW * 0.5, capH * 0.8, 0, 0, Math.PI * 2);
//         ctx.fill();
        
//         ctx.beginPath();
//         ctx.ellipse(centerX, capY + capH * 0.5, capW * 0.6, capH * 0.4, 0, 0, Math.PI);
//         ctx.fill();
//       }
//     }

//   };

//   useEffect(() => {
//     return () => stopCamera();
//   }, []);

//   const takePhoto = () => {
//     const canvas = canvasRef.current;
//     if (canvas) {
//       const link = document.createElement('a');
//       link.download = 'virtual-tryon.png';
//       link.href = canvas.toDataURL();
//       link.click();
//     }
//   };

//   return (
//     <div className="virtual-tryon">
//       <div className="tryon-container">
//         <div className="video-container">
//           {!cameraActive ? (
//             <div className="camera-placeholder">
//               <div className="placeholder-content">
//                 <span className="placeholder-icon">📸</span>
//                 <h3>Virtual Try-On</h3>
//                 <p>Click Start Camera to begin</p>
//                 <button onClick={startCamera} className="start-camera-btn">
//                   📹 Start Camera
//                 </button>
//               </div>
//             </div>
//           ) : (
//             <div className="camera-active">
//               <video ref={videoRef} autoPlay playsInline muted style={{ display: 'none' }} />
//               <canvas ref={canvasRef} className="overlay-canvas" />
//             </div>
//           )}
//         </div>

//         <div className="controls-section">
//           <h4>Choose Your Style</h4>
          
//           <div className="items-section">
//             <h5>🕶️ Glasses</h5>
//             <div className="items-grid">
//               {Object.entries(items).filter(([_, item]) => item.type === 'glasses').map(([key, item]) => (
//                 <button
//                   key={key}
//                   onClick={() => setSelectedItem(key)}
//                   className={`item-btn ${selectedItem === key ? 'active' : ''}`}
//                 >
//                   <span className="item-emoji">{item.emoji}</span>
//                   <span className="item-name">{item.name}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           <div className="items-section">
//             <h5>🧢 Caps & Hats</h5>
//             <div className="items-grid">
//               {Object.entries(items).filter(([_, item]) => item.type === 'cap').map(([key, item]) => (
//                 <button
//                   key={key}
//                   onClick={() => setSelectedItem(key)}
//                   className={`item-btn ${selectedItem === key ? 'active' : ''}`}
//                 >
//                   <span className="item-emoji">{item.emoji}</span>
//                   <span className="item-name">{item.name}</span>
//                 </button>
//               ))}
//             </div>
//           </div>

//           {cameraActive && (
//             <div className="action-buttons">
//               <button onClick={takePhoto} className="action-btn photo-btn">
//                 📷 Take Photo
//               </button>
//               <button onClick={stopCamera} className="action-btn stop-btn">
//                 ⏹️ Stop Camera
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default VirtualTryOn;



import { useState, useRef, useEffect } from 'react';
import './VirtualTryOn.css';

const VirtualTryOn = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const cameraActiveRef = useRef(false);
  const [selectedItem, setSelectedItem] = useState('glasses1');

  const items = {
    glasses1: { type: 'glasses', emoji: '🕶️', name: 'Cool Sunglasses', color: '#1a1a1a' },
    glasses2: { type: 'glasses', emoji: '👓', name: 'Reading Glasses', color: '#8b4513' },
    glasses3: { type: 'glasses', emoji: '🥽', name: 'Sport Goggles', color: '#ff6b6b' },
    cap1: { type: 'cap', emoji: '🧢', name: 'Baseball Cap', color: '#3b82f6' },
    cap2: { type: 'cap', emoji: '🎩', name: 'Top Hat', color: '#1a1a1a' },
    cap3: { type: 'cap', emoji: '👒', name: 'Sun Hat', color: '#f59e0b' },
  };

  const startCamera = async () => {
    console.log("Attempting to start camera...");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      console.log("Camera stream obtained:", stream);

      streamRef.current = stream;
      setCameraActive(true);

    } catch (err) {
      console.error(err);
      alert('Camera access denied. Please allow camera and try again.');
    }
  };

  // Start video and detection after cameraActive becomes true
 useEffect(() => {
  if (cameraActive && videoRef.current && streamRef.current) {
    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.play().then(() => {
      console.log("Video playing...");
      cameraActiveRef.current = true;
      const update = () => {
        if (!cameraActiveRef.current) return;
        drawFrame();
        requestAnimationFrame(update);
      };
      requestAnimationFrame(update);
    });
  }
}, [cameraActive]);

const selectedItemRef = useRef(selectedItem);

useEffect(() => {
  selectedItemRef.current = selectedItem;
}, [selectedItem]);


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

  const item = items[selectedItemRef.current]; // always latest
  const video = videoRef.current;
  const canvas = canvasRef.current;
  const ctx = canvas.getContext('2d');

  if (video.readyState >= 2) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 3;
    const faceWidth = canvas.width * 0.4;

    if (item.type === 'glasses') {
      const w = faceWidth * 0.9;
      const h = faceWidth * 0.12;

      ctx.strokeStyle = '#fff';
      ctx.fillStyle = item.color + '80';
      ctx.lineWidth = 4;

      ctx.beginPath();
      ctx.ellipse(centerX - w * 0.28, centerY, w * 0.16, h, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.ellipse(centerX + w * 0.28, centerY, w * 0.16, h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(centerX - w * 0.12, centerY);
      ctx.lineTo(centerX + w * 0.12, centerY);
      ctx.stroke();
    } else if (item.type === 'cap') {
      const capW = faceWidth;
      const capH = faceWidth * 0.3;
      const capY = centerY - faceWidth * 0.5;

      ctx.fillStyle = item.color;

      ctx.beginPath();
      ctx.ellipse(centerX, capY - capH * 0.2, capW * 0.5, capH * 0.8, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.ellipse(centerX, capY + capH * 0.5, capW * 0.6, capH * 0.4, 0, 0, Math.PI);
      ctx.fill();
    }
  }
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
                <h3>Virtual Try-On</h3>
                <p>Click Start Camera to begin</p>
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
                style={{ position: 'absolute', top: 0, left: 0, width: 1, height: 1, opacity: 0 }} 
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
