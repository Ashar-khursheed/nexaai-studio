import { useState, useRef, useEffect } from 'react';
import './EyeBlinkShooter.css';

const EyeBlinkShooter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [targets, setTargets] = useState([]);
  const [blinkDetected, setBlinkDetected] = useState(false);
  const [gameTime, setGameTime] = useState(30);
  const [highScore, setHighScore] = useState(0);
  const lastBrightnessRef = useRef(100);
  const eyesClosedRef = useRef(false);

const startGame = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user", width: 640, height: 480 },
      audio: false,
    });

    streamRef.current = stream;
    setGameActive(true); // <-- video will render AFTER this

  } catch (err) {
    console.error(err);
    alert("Camera access denied!");
  }
};
useEffect(() => {
  if (gameActive && videoRef.current && streamRef.current) {
    console.log("VIDEO ELEMENT NOW EXISTS", videoRef.current);

    const video = videoRef.current;
    video.srcObject = streamRef.current;
    video.muted = true;
    video.setAttribute("playsinline", true);

    video.play().then(() => {
      console.log("VIDEO PLAYING");
      startDetection();
    });
  }
}, [gameActive]);





  const stopGame = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setGameActive(false);
    if (score > highScore) setHighScore(score);
  };

  const startDetection = () => {
    console.log("DETECTION LOOP STARTED");

  const detect = () => {
  if (!gameActive) return;

  const video = videoRef.current;
  const canvas = canvasRef.current;

  if (video && canvas && video.readyState >= 2) {
    const w = video.videoWidth;
    const h = video.videoHeight;

    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(video, 0, 0, w, h);

    const x = w * 0.28;
    const y = h * 0.32;
    const rw = w * 0.44;
    const rh = h * 0.16;

    const imageData = ctx.getImageData(x, y, rw, rh);
    const pixels = imageData.data;

    let totalBrightness = 0;
    let darkPixels = 0;

    for (let i = 0; i < pixels.length; i += 4) {
      const brightness = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
      totalBrightness += brightness;

      if (brightness < 40) darkPixels++;   // DARK PIXELS = closed eyes
    }

    const avg = totalBrightness / (pixels.length / 4);
    const darkRatio = darkPixels / (pixels.length / 4);

    const brightnessDrop = lastBrightnessRef.current - avg;

    // NEW SUPER-ACCURATE BLINK LOGIC
    const isBlink =
      darkRatio > 0.35 ||             // 1. Eye region turns dark
      brightnessDrop > 12 ||          // 2. Sudden brightness drop
      (avg < 70 && brightnessDrop > 5);  // 3. combined soft signal

    if (isBlink && !eyesClosedRef.current) {
      eyesClosedRef.current = true;
      shootTarget();
      setBlinkDetected(true);

      setTimeout(() => {
        eyesClosedRef.current = false;
        setBlinkDetected(false);
      }, 350);
    }

    lastBrightnessRef.current = avg;
  }

  setTimeout(detect, 40);
};



    detect();
  };

  const generateTarget = () => {
    const newTarget = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 10,
      hit: false
    };
    setTargets(prev => [...prev, newTarget]);
  };

  const shootTarget = () => {
    setTargets(prev => {
      const unhit = prev.find(t => !t.hit);
      if (unhit) {
        unhit.hit = true;
        setScore(s => s + 10);
        setTimeout(() => {
          setTargets(current => current.filter(t => t.id !== unhit.id));
        }, 300);
        return [...prev];
      }
      return prev;
    });
  };

  useEffect(() => {
    if (gameActive) {
      const targetInterval = setInterval(generateTarget, 2000);
      const timerInterval = setInterval(() => {
        setGameTime(prev => {
          if (prev <= 1) {
            stopGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearInterval(targetInterval);
        clearInterval(timerInterval);
      };
    }
  }, [gameActive]);

  useEffect(() => {
    return () => stopGame();
  }, []);

  return (
    <div className="eye-blink-shooter">
      <div className="game-header">
        <div className="score-board">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Time</span>
            <span className="stat-value">{gameTime}s</span>
          </div>
          <div className="stat">
            <span className="stat-label">High Score</span>
            <span className="stat-value">{highScore}</span>
          </div>
        </div>
      </div>

      <div className="game-area">
        {!gameActive ? (
          <div className="game-menu">
            <div className="menu-content">
              <h2>👁️ Eye-Blink Shooter</h2>
              <p>Blink to shoot targets!</p>
              <div className="instructions">
                <h3>How to Play:</h3>
                <ul>
                  <li>🎯 Targets appear on screen</li>
                  <li>👁️ Blink to shoot them</li>
                  <li>⚡ Score as much as you can in 30 seconds</li>
                  <li>💯 Each target = 10 points</li>
                </ul>
              </div>
              <button onClick={startGame} className="start-game-btn">
                🎮 Start Game
              </button>
              {highScore > 0 && (
                <p className="high-score-display">🏆 High Score: {highScore}</p>
              )}
            </div>
          </div>
        ) : (
          <div className="game-canvas-container">
           <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="game-video"
            style={{ width: "100%", height: "", background: "black", objectFit: "cover" }}
            disablePictureInPicture
            controls={false}
          />

           <canvas 
              ref={canvasRef} 
              style={{ display: "none" }} 
              willReadFrequently="true"
            />



            
            <div className="targets-overlay">
              {targets.map(target => (
                <div
                  key={target.id}
                  className={`target ${target.hit ? 'hit' : ''}`}
                  style={{ left: `${target.x}%`, top: `${target.y}%` }}
                >
                  🎯
                </div>
              ))}
            </div>

            {blinkDetected && (
              <div className="blink-indicator">💥 BLINK!</div>
            )}

            <div className="game-controls">
              <button onClick={stopGame} className="end-game-btn">
                ⏹️ End Game
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EyeBlinkShooter;
