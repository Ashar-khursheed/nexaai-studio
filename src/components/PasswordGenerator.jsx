import { useState } from 'react';
import './PasswordGenerator.css';

const PasswordGenerator = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true
  });
  const [copied, setCopied] = useState(false);
  const [strength, setStrength] = useState('');

  const generatePassword = () => {
    let charset = '';
    if (options.uppercase) charset += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (options.lowercase) charset += 'abcdefghijklmnopqrstuvwxyz';
    if (options.numbers) charset += '0123456789';
    if (options.symbols) charset += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (charset === '') {
      alert('Please select at least one character type!');
      return;
    }

    let newPassword = '';
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);
    
    for (let i = 0; i < length; i++) {
      newPassword += charset[array[i] % charset.length];
    }

    setPassword(newPassword);
    calculateStrength(newPassword);
    setCopied(false);
  };

  const calculateStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (pwd.length >= 12) score++;
    if (pwd.length >= 16) score++;
    if (/[a-z]/.test(pwd)) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^a-zA-Z0-9]/.test(pwd)) score++;

    if (score <= 3) setStrength('weak');
    else if (score <= 5) setStrength('medium');
    else setStrength('strong');
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOptionChange = (option) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }));
  };

  return (
    <div className="password-generator">
      <div className="password-display">
        <input 
          type="text" 
          value={password} 
          readOnly 
          placeholder="Click Generate to create password"
          className="password-input"
        />
        {password && (
          <button onClick={copyToClipboard} className="copy-btn">
            {copied ? '✓ Copied!' : '📋 Copy'}
          </button>
        )}
      </div>

      {password && (
        <div className={`strength-indicator strength-${strength}`}>
          <div className="strength-bar"></div>
          <span className="strength-label">
            Strength: {strength.toUpperCase()}
          </span>
        </div>
      )}

      <div className="length-control">
        <label>Password Length: {length}</label>
        <input 
          type="range" 
          min="8" 
          max="32" 
          value={length}
          onChange={(e) => setLength(Number(e.target.value))}
          className="length-slider"
        />
      </div>

      <div className="options-grid">
        <label className="option-label">
          <input 
            type="checkbox" 
            checked={options.uppercase}
            onChange={() => handleOptionChange('uppercase')}
          />
          <span>Uppercase (A-Z)</span>
        </label>
        <label className="option-label">
          <input 
            type="checkbox" 
            checked={options.lowercase}
            onChange={() => handleOptionChange('lowercase')}
          />
          <span>Lowercase (a-z)</span>
        </label>
        <label className="option-label">
          <input 
            type="checkbox" 
            checked={options.numbers}
            onChange={() => handleOptionChange('numbers')}
          />
          <span>Numbers (0-9)</span>
        </label>
        <label className="option-label">
          <input 
            type="checkbox" 
            checked={options.symbols}
            onChange={() => handleOptionChange('symbols')}
          />
          <span>Symbols (!@#$)</span>
        </label>
      </div>

      <button onClick={generatePassword} className="generate-btn">
        🔐 Generate Secure Password
      </button>
    </div>
  );
};

export default PasswordGenerator;
