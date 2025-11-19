import { useState } from 'react';
import './LoremGenerator.css';

const LoremGenerator = () => {
  const [text, setText] = useState('');
  const [count, setCount] = useState(5);
  const [type, setType] = useState('paragraphs');
  const [copied, setCopied] = useState(false);

  const words = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
  ];

  const generateWord = () => {
    return words[Math.floor(Math.random() * words.length)];
  };

  const generateSentence = () => {
    const sentenceLength = Math.floor(Math.random() * 10) + 10;
    let sentence = [];
    for (let i = 0; i < sentenceLength; i++) {
      sentence.push(generateWord());
    }
    sentence[0] = sentence[0].charAt(0).toUpperCase() + sentence[0].slice(1);
    return sentence.join(' ') + '.';
  };

  const generateParagraph = () => {
    const sentencesCount = Math.floor(Math.random() * 4) + 4;
    let paragraph = [];
    for (let i = 0; i < sentencesCount; i++) {
      paragraph.push(generateSentence());
    }
    return paragraph.join(' ');
  };

  const generate = () => {
    let result = '';

    switch (type) {
      case 'words':
        const generatedWords = [];
        for (let i = 0; i < count; i++) {
          generatedWords.push(generateWord());
        }
        result = generatedWords.join(' ');
        break;

      case 'sentences':
        const sentences = [];
        for (let i = 0; i < count; i++) {
          sentences.push(generateSentence());
        }
        result = sentences.join(' ');
        break;

      case 'paragraphs':
        const paragraphs = [];
        for (let i = 0; i < count; i++) {
          paragraphs.push(generateParagraph());
        }
        result = paragraphs.join('\n\n');
        break;

      default:
        result = generateParagraph();
    }

    setText(result);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStats = () => {
    return {
      characters: text.length,
      words: text.trim() ? text.trim().split(/\s+/).length : 0,
      sentences: text.split(/[.!?]+/).filter(s => s.trim()).length,
      paragraphs: text.split(/\n\n+/).filter(p => p.trim()).length
    };
  };

  const stats = text ? getStats() : null;

  return (
    <div className="lorem-generator">
      <div className="controls-section">
        <div className="control-group">
          <label>Generate</label>
          <div className="control-row">
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
              className="count-input"
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="type-select"
            >
              <option value="words">Words</option>
              <option value="sentences">Sentences</option>
              <option value="paragraphs">Paragraphs</option>
            </select>
          </div>
        </div>

        <button onClick={generate} className="generate-btn">
          ✨ Generate Lorem Ipsum
        </button>
      </div>

      {text && (
        <>
          {stats && (
            <div className="stats-grid">
              <div className="stat-box">
                <span className="stat-number">{stats.characters}</span>
                <span className="stat-label">Characters</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.words}</span>
                <span className="stat-label">Words</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.sentences}</span>
                <span className="stat-label">Sentences</span>
              </div>
              <div className="stat-box">
                <span className="stat-number">{stats.paragraphs}</span>
                <span className="stat-label">Paragraphs</span>
              </div>
            </div>
          )}

          <div className="result-section">
            <div className="result-header">
              <label>Generated Text</label>
              <button onClick={copyToClipboard} className="copy-btn">
                {copied ? '✓ Copied!' : '📋 Copy'}
              </button>
            </div>
            <textarea
              value={text}
              readOnly
              className="result-textarea"
              rows="12"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LoremGenerator;
