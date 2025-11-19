import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import './QRCodeGenerator.css';

const QRCodeGenerator = () => {
  const [text, setText] = useState('');
  const [qrCode, setQRCode] = useState('');
  const [size, setSize] = useState(300);
  const canvasRef = useRef(null);

  const generateQRCode = async () => {
    if (!text.trim()) {
      alert('Please enter text or URL to generate QR code');
      return;
    }

    try {
      // Generate QR code directly to data URL
      const dataUrl = await QRCode.toDataURL(text, {
        width: size,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQRCode(dataUrl);
    } catch (err) {
      console.error('Error generating QR code:', err);
      alert('Failed to generate QR code');
    }
  };

  const downloadQRCode = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.download = 'qrcode.png';
    link.href = qrCode;
    link.click();
  };

  return (
    <div className="qr-generator">
      <div className="input-section">
        <label>Enter Text or URL</label>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Enter text, URL, or any data..."
          rows="4"
          className="qr-input"
        />
      </div>

      <div className="size-control">
        <label>QR Code Size: {size}px</label>
        <input
          type="range"
          min="200"
          max="500"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          className="size-slider"
        />
      </div>

      <button onClick={generateQRCode} className="generate-btn">
        📱 Generate QR Code
      </button>

      {qrCode && (
        <div className="qr-result">
          <div className="qr-display">
            <img src={qrCode} alt="QR Code" className="qr-image" />
          </div>
          <button onClick={downloadQRCode} className="download-btn">
            ⬇️ Download QR Code
          </button>
          <p className="qr-tip">✅ Scannable with any QR code scanner app!</p>
        </div>
      )}
    </div>
  );
};

export default QRCodeGenerator;
