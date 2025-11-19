import { useState } from 'react';
import './MarkdownConverter.css';

const MarkdownConverter = () => {
  const [markdown, setMarkdown] = useState('');
  const [html, setHtml] = useState('');

  const quickExamples = [
    '# Heading 1\n## Heading 2\n### Heading 3',
    '**bold text**\n*italic text*\n~~strikethrough~~',
    '- Item 1\n- Item 2\n- Item 3',
    '[Link text](https://example.com)\n![Alt text](image.jpg)'
  ];

  const convertMarkdownToHtml = (md) => {
    let htmlOutput = md;

    // Headers
    htmlOutput = htmlOutput.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    htmlOutput = htmlOutput.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    htmlOutput = htmlOutput.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Bold
    htmlOutput = htmlOutput.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');
    htmlOutput = htmlOutput.replace(/__(.*?)__/gim, '<strong>$1</strong>');

    // Italic
    htmlOutput = htmlOutput.replace(/\*(.*?)\*/gim, '<em>$1</em>');
    htmlOutput = htmlOutput.replace(/_(.*?)_/gim, '<em>$1</em>');

    // Strikethrough
    htmlOutput = htmlOutput.replace(/~~(.*?)~~/gim, '<del>$1</del>');

    // Links
    htmlOutput = htmlOutput.replace(/\[([^\]]+)\]\(([^)]+)\)/gim, '<a href="$2">$1</a>');

    // Images
    htmlOutput = htmlOutput.replace(/!\[([^\]]*)\]\(([^)]+)\)/gim, '<img src="$2" alt="$1" />');

    // Code blocks
    htmlOutput = htmlOutput.replace(/```([^`]+)```/gim, '<pre><code>$1</code></pre>');
    htmlOutput = htmlOutput.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Lists
    htmlOutput = htmlOutput.replace(/^\* (.*$)/gim, '<li>$1</li>');
    htmlOutput = htmlOutput.replace(/^- (.*$)/gim, '<li>$1</li>');
    htmlOutput = htmlOutput.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

    // Line breaks
    htmlOutput = htmlOutput.replace(/\n\n/g, '</p><p>');
    htmlOutput = '<p>' + htmlOutput + '</p>';

    // Clean up
    htmlOutput = htmlOutput.replace(/<p><\/p>/g, '');
    htmlOutput = htmlOutput.replace(/<p>(<h[1-6]>)/g, '$1');
    htmlOutput = htmlOutput.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    htmlOutput = htmlOutput.replace(/<p>(<ul>)/g, '$1');
    htmlOutput = htmlOutput.replace(/(<\/ul>)<\/p>/g, '$1');

    return htmlOutput;
  };

  const handleConvert = () => {
    const converted = convertMarkdownToHtml(markdown);
    setHtml(converted);
  };

  const handleQuickExample = (example) => {
    setMarkdown(example);
    setHtml('');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="tool-card">
      <div className="tool-header">
        <div className="tool-icon">📝</div>
        <div>
          <h3 className="tool-title">Markdown to HTML</h3>
          <p className="tool-description">Convert Markdown to HTML instantly</p>
        </div>
      </div>

      <div className="tool-body">
        <div className="quick-prompts">
          <label className="quick-label">Quick examples:</label>
          <div className="quick-buttons">
            {quickExamples.map((example, idx) => (
              <button
                key={idx}
                className="quick-btn"
                onClick={() => handleQuickExample(example)}
              >
                Example {idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="converter-grid">
          <div className="input-section">
            <label className="input-label">Markdown Input:</label>
            <textarea
              className="tool-input"
              placeholder="# Enter your Markdown here..."
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              rows="10"
            />
          </div>

          <div className="output-section">
            <label className="input-label">HTML Output:</label>
            <textarea
              className="tool-input code-output"
              value={html}
              readOnly
              rows="10"
              placeholder="Converted HTML will appear here..."
            />
          </div>
        </div>

        <div className="button-group">
          <button className="tool-generate-btn" onClick={handleConvert}>
            🔄 Convert
          </button>
          {html && (
            <button 
              className="copy-btn-main"
              onClick={() => copyToClipboard(html)}
            >
              📋 Copy HTML
            </button>
          )}
        </div>

        {html && (
          <div className="preview-section">
            <div className="preview-header">
              <span>Preview:</span>
            </div>
            <div 
              className="preview-content"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarkdownConverter;
