import { useState, useRef, useEffect } from "react";
import "./EyeBlinkShooter.css";
import { Hands } from "@mediapipe/hands";
import { Camera } from "@mediapipe/camera_utils";

const HandShootShooter = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [gameActive, setGameActive] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [targets, setTargets] = useState([]);
  const [shooting, setShooting] = useState(false);
  const [gameTime, setGameTime] = useState(30);
  const shootingRef = useRef(false);

  const shootTarget = () => {
    setTargets((prev) => {
      const unhit = prev.find((t) => !t.hit);
      if (unhit) {
        unhit.hit = true;
        setScore((s) => s + 10);
        setTimeout(() => {
          setTargets((current) => current.filter((t) => t.id !== unhit.id));
        }, 300);
        return [...prev];
      }
      return prev;
    });
  };

  const generateTarget = () => {
    const newTarget = {
      id: Date.now() + Math.random(),
      x: Math.random() * 80 + 10,
      y: Math.random() * 60 + 10,
      hit: false,
    };
    setTargets((prev) => [...prev, newTarget]);
  };

  const startGame = () => {
    setGameActive(true);
    setScore(0);
    setTargets([]);
    setGameTime(30);
  };

  const stopGame = () => {
    setGameActive(false);
    if (score > highScore) setHighScore(score);
  };

  // Hand detection with proper camera initialization
  useEffect(() => {
    if (!gameActive) return;
    
    let cameraInstance = null;
    let handsInstance = null;

    const initCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 640, height: 480 }
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          
          videoRef.current.onloadedmetadata = async () => {
            await videoRef.current.play();

            handsInstance = new Hands({
              locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
            });

            handsInstance.setOptions({
              maxNumHands: 1,
              modelComplexity: 1,
              minDetectionConfidence: 0.7,
              minTrackingConfidence: 0.7,
            });

            handsInstance.onResults((results) => {
              if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
                const landmarks = results.multiHandLandmarks[0];
                const indexTip = landmarks[8];
                const middleTip = landmarks[12];
                const wrist = landmarks[0];

                if (indexTip.y < middleTip.y && Math.abs(wrist.z) < 0.1) {
                  if (!shootingRef.current) {
                    shootTarget();
                    setShooting(true);
                    shootingRef.current = true;
                    setTimeout(() => {
                      setShooting(false);
                      shootingRef.current = false;
                    }, 500);
                  }
                }
              }
            });

            cameraInstance = new Camera(videoRef.current, {
              onFrame: async () => {
                if (videoRef.current && handsInstance) {
                  await handsInstance.send({ image: videoRef.current });
                }
              },
              width: 640,
              height: 480,
            });
            cameraInstance.start();
          };
        }
      } catch (err) {
        console.error('Camera error:', err);
        alert('Camera access denied. Please allow camera and try again.');
        setGameActive(false);
      }
    };

    initCamera();

    return () => {
      if (cameraInstance) cameraInstance.stop();
      if (handsInstance) handsInstance.close();
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [gameActive]);

  useEffect(() => {
    if (!gameActive) return;
    const targetInterval = setInterval(generateTarget, 2000);
    const timerInterval = setInterval(() => {
      setGameTime((t) => {
        if (t <= 1) {
          stopGame();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(targetInterval);
      clearInterval(timerInterval);
    };
  }, [gameActive]);

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
              <h2>🤚 Hand Shooter</h2>
              <p>Make a gun gesture to shoot targets!</p>
              <p style={{ fontSize: '0.9em', opacity: 0.8 }}>Point index finger up, others down</p>
              <button onClick={startGame} className="start-game-btn">
                🎮 Start Game
              </button>
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
              style={{
                width: "100%",
                maxHeight: "70vh",
                background: "black",
                objectFit: "cover",
              }}
            />

            <div className="targets-overlay">
              {targets.map((target) => (
                <div
                  key={target.id}
                  className={`target ${target.hit ? "hit" : ""}`}
                  style={{ left: `${target.x}%`, top: `${target.y}%` }}
                >
                  🎯
                </div>
              ))}
            </div>

            {shooting && <div className="blink-indicator">💥 SHOOT!</div>}

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

export default HandShootShooter;
