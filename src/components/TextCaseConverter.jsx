import { useState } from 'react';
import './TextCaseConverter.css';

const TextCaseConverter = () => {
  const [text, setText] = useState('');
  const [copied, setCopied] = useState('');

  const convertCase = (type) => {
    let result = '';
    
    switch(type) {
      case 'upper':
        result = text.toUpperCase();
        break;
      case 'lower':
        result = text.toLowerCase();
        break;
      case 'title':
        result = text.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
        break;
      case 'sentence':
        result = text.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (char) => char.toUpperCase());
        break;
      case 'camel':
        result = text.toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[A-Z]/, (char) => char.toLowerCase());
        break;
      case 'pascal':
        result = text.toLowerCase()
          .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
          .replace(/^[a-z]/, (char) => char.toUpperCase());
        break;
      case 'snake':
        result = text.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        break;
      case 'kebab':
        result = text.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        break;
      case 'alternate':
        result = text.split('').map((char, i) => 
          i % 2 === 0 ? char.toUpperCase() : char.toLowerCase()
        ).join('');
        break;
      case 'inverse':
        result = text.split('').map(char => 
          char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase()
        ).join('');
        break;
      default:
        result = text;
    }
    
    setText(result);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied('all');
    setTimeout(() => setCopied(''), 2000);
  };

  const clearText = () => {
    setText('');
  };

  const getStats = () => {
    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      lines: text.split('\n').length,
      sentences: text.split(/[.!?]+/).filter(s => s.trim()).length
    };
  };

  const stats = getStats();

  return (
    <div className="text-converter">
      <div className="input-section">
        <div className="input-header">
          <label>Enter Your Text</label>
          <div className="input-actions">
            {text && (
              <>
                <button onClick={copyToClipboard} className="action-btn">
                  {copied === 'all' ? '✓ Copied' : '📋 Copy'}
                </button>
                <button onClick={clearText} className="action-btn clear-btn">
                  🗑️ Clear
                </button>
              </>
            )}
          </div>
        </div>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type or paste your text here..."
          rows="8"
          className="text-input"
        />
      </div>

      {text && (
        <div className="stats-section">
          <div className="stat-item">
            <span className="stat-value">{stats.characters}</span>
            <span className="stat-label">Characters</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.charactersNoSpaces}</span>
            <span className="stat-label">No Spaces</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.words}</span>
            <span className="stat-label">Words</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.lines}</span>
            <span className="stat-label">Lines</span>
          </div>
        </div>
      )}

      <div className="conversion-grid">
        <button onClick={() => convertCase('upper')} className="convert-btn">
          <span className="btn-icon">🔠</span>
          <span className="btn-text">UPPERCASE</span>
        </button>
        <button onClick={() => convertCase('lower')} className="convert-btn">
          <span className="btn-icon">🔡</span>
          <span className="btn-text">lowercase</span>
        </button>
        <button onClick={() => convertCase('title')} className="convert-btn">
          <span className="btn-icon">📝</span>
          <span className="btn-text">Title Case</span>
        </button>
        <button onClick={() => convertCase('sentence')} className="convert-btn">
          <span className="btn-icon">📄</span>
          <span className="btn-text">Sentence case</span>
        </button>
        <button onClick={() => convertCase('camel')} className="convert-btn">
          <span className="btn-icon">🐫</span>
          <span className="btn-text">camelCase</span>
        </button>
        <button onClick={() => convertCase('pascal')} className="convert-btn">
          <span className="btn-icon">🅿️</span>
          <span className="btn-text">PascalCase</span>
        </button>
        <button onClick={() => convertCase('snake')} className="convert-btn">
          <span className="btn-icon">🐍</span>
          <span className="btn-text">snake_case</span>
        </button>
        <button onClick={() => convertCase('kebab')} className="convert-btn">
          <span className="btn-icon">�串</span>
          <span className="btn-text">kebab-case</span>
        </button>
        <button onClick={() => convertCase('alternate')} className="convert-btn">
          <span className="btn-icon">🔀</span>
          <span className="btn-text">aLtErNaTe</span>
        </button>
        <button onClick={() => convertCase('inverse')} className="convert-btn">
          <span className="btn-icon">🔄</span>
          <span className="btn-text">InVeRsE</span>
        </button>
      </div>
    </div>
  );
};

export default TextCaseConverter;
