import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import './NexaAIMascot.css';

const NexaAIMascot = () => {
  const mountRef = useRef(null);
  const [position, setPosition] = useState('right-bottom');
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(200, 200);
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    camera.position.z = 5;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const pointLight = new THREE.PointLight(0x60a5fa, 1, 100);
    pointLight.position.set(5, 5, 5);
    scene.add(pointLight);

    const pointLight2 = new THREE.PointLight(0xec4899, 0.8, 100);
    pointLight2.position.set(-5, -5, 5);
    scene.add(pointLight2);

    // Robot head
    const headGeometry = new THREE.BoxGeometry(1.5, 1.5, 1.5);
    const headMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x3b82f6,
      shininess: 100,
      emissive: 0x1e40af,
      emissiveIntensity: 0.2
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);

    // Eyes
    const eyeGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const eyeMaterial = new THREE.MeshPhongMaterial({ 
      color: 0x60a5fa,
      emissive: 0x60a5fa,
      emissiveIntensity: 0.8
    });
    
    const leftEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    leftEye.position.set(-0.3, 0.2, 0.76);
    head.add(leftEye);

    const rightEye = new THREE.Mesh(eyeGeometry, eyeMaterial);
    rightEye.position.set(0.3, 0.2, 0.76);
    head.add(rightEye);

    // Antenna
    const antennaGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.6, 8);
    const antennaMaterial = new THREE.MeshPhongMaterial({ color: 0x3b82f6 });
    const antenna = new THREE.Mesh(antennaGeometry, antennaMaterial);
    antenna.position.set(0, 1.05, 0);
    head.add(antenna);

    const antennaBallGeometry = new THREE.SphereGeometry(0.15, 16, 16);
    const antennaBallMaterial = new THREE.MeshPhongMaterial({ 
      color: 0xec4899,
      emissive: 0xec4899,
      emissiveIntensity: 0.5
    });
    const antennaBall = new THREE.Mesh(antennaBallGeometry, antennaBallMaterial);
    antennaBall.position.set(0, 1.35, 0);
    head.add(antennaBall);

    // Mouth
    const mouthGeometry = new THREE.BoxGeometry(0.6, 0.1, 0.1);
    const mouthMaterial = new THREE.MeshPhongMaterial({ color: 0x1e293b });
    const mouth = new THREE.Mesh(mouthGeometry, mouthMaterial);
    mouth.position.set(0, -0.3, 0.76);
    head.add(mouth);

    // Particles around robot
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 50;
    const positions = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
      positions[i] = (Math.random() - 0.5) * 6;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0x60a5fa,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Mouse interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotationX = 0;
    let targetRotationY = 0;

    const onMouseMove = (event) => {
      const rect = mountRef.current.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseY = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      targetRotationY = mouseX * 0.5;
      targetRotationX = mouseY * 0.3;
    };

    mountRef.current.addEventListener('mousemove', onMouseMove);

    // Animation
    let time = 0;
    const animate = () => {
      requestAnimationFrame(animate);
      time += 0.01;

      // Smooth rotation towards mouse
      head.rotation.y += (targetRotationY - head.rotation.y) * 0.05;
      head.rotation.x += (targetRotationX - head.rotation.x) * 0.05;

      // Floating animation
      head.position.y = Math.sin(time) * 0.2;

      // Eyes blink animation
      const blinkCycle = Math.sin(time * 3);
      if (blinkCycle > 0.95) {
        leftEye.scale.y = 0.1;
        rightEye.scale.y = 0.1;
      } else {
        leftEye.scale.y = 1;
        rightEye.scale.y = 1;
      }

      // Antenna wobble
      antennaBall.position.y = 1.35 + Math.sin(time * 2) * 0.1;
      antennaBall.rotation.z = Math.sin(time * 1.5) * 0.2;

      // Particle rotation
      particles.rotation.y += 0.001;

      // Color pulse
      const pulseIntensity = (Math.sin(time * 2) + 1) * 0.25;
      leftEye.material.emissiveIntensity = 0.8 + pulseIntensity;
      rightEye.material.emissiveIntensity = 0.8 + pulseIntensity;
      antennaBall.material.emissiveIntensity = 0.5 + pulseIntensity;

      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      if (mountRef.current) {
        mountRef.current.removeEventListener('mousemove', onMouseMove);
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  const positionClasses = {
    'left-bottom': 'mascot-left-bottom',
    'right-bottom': 'mascot-right-bottom',
    'left-top': 'mascot-left-top',
    'right-top': 'mascot-right-top',
  };

  const messages = [
    "Hi! I'm Nexa, your AI assistant! 🤖",
    "Need help? Just click me! 💬",
    "Exploring NexaAI Studio? 🚀",
    "Try our awesome tools! ✨",
  ];

  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % messages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`nexa-mascot ${positionClasses[position]} ${isExpanded ? 'expanded' : ''}`}>
      <div 
        className="mascot-container"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div ref={mountRef} className="mascot-canvas" />
        {isExpanded && (
          <div className="mascot-bubble">
            <p>{messages[currentMessage]}</p>
            <div className="mascot-actions">
              <button onClick={(e) => {
                e.stopPropagation();
                document.getElementById('ai-demos').scrollIntoView({ behavior: 'smooth' });
              }}>
                🛠️ Tools
              </button>
              <button onClick={(e) => {
                e.stopPropagation();
                document.getElementById('services').scrollIntoView({ behavior: 'smooth' });
              }}>
                🤖 Services
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="position-controls">
        <button 
          className="pos-btn" 
          title="Left Bottom"
          onClick={() => setPosition('left-bottom')}
        >
          ↙️
        </button>
        <button 
          className="pos-btn" 
          title="Right Bottom"
          onClick={() => setPosition('right-bottom')}
        >
          ↘️
        </button>
        <button 
          className="pos-btn" 
          title="Left Top"
          onClick={() => setPosition('left-top')}
        >
          ↖️
        </button>
        <button 
          className="pos-btn" 
          title="Right Top"
          onClick={() => setPosition('right-top')}
        >
          ↗️
        </button>
      </div>
    </div>
  );
};

export default NexaAIMascot;
