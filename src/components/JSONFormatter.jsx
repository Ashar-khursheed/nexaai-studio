import { useState } from 'react';
import './JSONFormatter.css';

const JSONFormatter = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const exampleJSON = {
    name: "John Doe",
    age: 30,
    email: "john@example.com",
    address: {
      street: "123 Main St",
      city: "New York"
    },
    hobbies: ["reading", "gaming", "coding"]
  };

  const formatJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const formatted = JSON.stringify(parsed, null, 2);
      setOutput(formatted);
      setError('');
      
      // Calculate stats
      const keys = countKeys(parsed);
      const depth = getDepth(parsed);
      setStats({
        keys,
        depth,
        size: new Blob([formatted]).size,
        type: Array.isArray(parsed) ? 'Array' : typeof parsed
      });
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      setOutput('');
      setStats(null);
    }
  };

  const minifyJSON = () => {
    try {
      const parsed = JSON.parse(input);
      const minified = JSON.stringify(parsed);
      setOutput(minified);
      setError('');
      
      const keys = countKeys(parsed);
      const depth = getDepth(parsed);
      setStats({
        keys,
        depth,
        size: new Blob([minified]).size,
        type: Array.isArray(parsed) ? 'Array' : typeof parsed
      });
    } catch (err) {
      setError(`Invalid JSON: ${err.message}`);
      setOutput('');
      setStats(null);
    }
  };

  const validateJSON = () => {
    try {
      JSON.parse(input);
      setError('');
      setOutput('✅ Valid JSON');
    } catch (err) {
      setError(`❌ Invalid JSON: ${err.message}`);
      setOutput('');
    }
  };

  const countKeys = (obj) => {
    let count = 0;
    const iterate = (item) => {
      if (typeof item === 'object' && item !== null) {
        count += Object.keys(item).length;
        Object.values(item).forEach(iterate);
      }
    };
    iterate(obj);
    return count;
  };

  const getDepth = (obj) => {
    if (typeof obj !== 'object' || obj === null) return 0;
    const depths = Object.values(obj).map(v => getDepth(v));
    return 1 + (depths.length > 0 ? Math.max(...depths) : 0);
  };

  const loadExample = () => {
    setInput(JSON.stringify(exampleJSON, null, 2));
    setOutput('');
    setError('');
    setStats(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="tool-card">
      <div className="tool-header">
        <div className="tool-icon">{ }</div>
        <div>
          <h3 className="tool-title">JSON Formatter</h3>
          <p className="tool-description">Format, validate & minify JSON data</p>
        </div>
      </div>

      <div className="tool-body">
        <div className="json-actions">
          <button className="quick-btn" onClick={loadExample}>
            📄 Load Example
          </button>
          <button className="quick-btn" onClick={formatJSON}>
            ✨ Format
          </button>
          <button className="quick-btn" onClick={minifyJSON}>
            📦 Minify
          </button>
          <button className="quick-btn" onClick={validateJSON}>
            ✅ Validate
          </button>
        </div>

        <div className="converter-grid">
          <div className="input-section">
            <label className="input-label">Input JSON:</label>
            <textarea
              className="tool-input code-output"
              placeholder='{"key": "value"}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows="12"
            />
          </div>

          <div className="output-section">
            <label className="input-label">Output:</label>
            <textarea
              className="tool-input code-output"
              value={output}
              readOnly
              rows="12"
              placeholder="Formatted JSON will appear here..."
            />
          </div>
        </div>

        {error && (
          <div className="tool-error">
            {error}
          </div>
        )}

        {stats && (
          <div className="json-stats">
            <h4 className="stats-title">JSON Statistics:</h4>
            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Type:</span>
                <span className="stat-value">{stats.type}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Keys:</span>
                <span className="stat-value">{stats.keys}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Depth:</span>
                <span className="stat-value">{stats.depth}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Size:</span>
                <span className="stat-value">{stats.size} bytes</span>
              </div>
            </div>
          </div>
        )}

        {output && !error && (
          <div className="button-group">
            <button
              className="copy-btn-main"
              onClick={() => copyToClipboard(output)}
            >
              📋 Copy Output
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default JSONFormatter;