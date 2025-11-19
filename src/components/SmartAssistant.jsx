import { useState, useRef, useEffect } from 'react';
import './SmartAssistant.css';

const SmartAssistant = () => {
  const [messages, setMessages] = useState([
    { type: 'bot', text: '👋 Hi! I\'m your Smart Shopping Assistant. Ask me for recommendations on products, and I\'ll suggest the best sites to buy them!' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  // Local knowledge base - no API needed!
  const knowledgeBase = {
    electronics: {
      keywords: ['laptop', 'phone', 'tablet', 'computer', 'headphones', 'camera', 'tv', 'monitor', 'smartphone', 'electronics', 'gadget'],
      recommendations: [
        { site: 'Amazon', url: 'amazon.com', reason: 'Best variety and fast shipping' },
        { site: 'Newegg', url: 'newegg.com', reason: 'Great for PC components' },
        { site: 'Best Buy', url: 'bestbuy.com', reason: 'Good deals and warranty' },
        { site: 'B&H Photo', url: 'bhphotovideo.com', reason: 'Professional equipment' }
      ]
    },
    clothing: {
      keywords: ['shirt', 'pants', 'dress', 'shoes', 'jacket', 'clothes', 'fashion', 'wear', 'outfit', 'sneakers'],
      recommendations: [
        { site: 'ASOS', url: 'asos.com', reason: 'Trendy and affordable' },
        { site: 'Zara', url: 'zara.com', reason: 'Fast fashion, great quality' },
        { site: 'H&M', url: 'hm.com', reason: 'Budget-friendly basics' },
        { site: 'Nike', url: 'nike.com', reason: 'Best for sportswear' }
      ]
    },
    books: {
      keywords: ['book', 'novel', 'textbook', 'magazine', 'reading', 'literature', 'ebook'],
      recommendations: [
        { site: 'Amazon', url: 'amazon.com', reason: 'Largest selection, Kindle support' },
        { site: 'Book Depository', url: 'bookdepository.com', reason: 'Free worldwide shipping' },
        { site: 'Barnes & Noble', url: 'barnesandnoble.com', reason: 'Great for new releases' },
        { site: 'ThriftBooks', url: 'thriftbooks.com', reason: 'Used books at great prices' }
      ]
    },
    furniture: {
      keywords: ['furniture', 'chair', 'table', 'sofa', 'bed', 'desk', 'couch', 'cabinet'],
      recommendations: [
        { site: 'IKEA', url: 'ikea.com', reason: 'Affordable modern furniture' },
        { site: 'Wayfair', url: 'wayfair.com', reason: 'Huge selection online' },
        { site: 'Amazon', url: 'amazon.com', reason: 'Fast delivery available' },
        { site: 'Overstock', url: 'overstock.com', reason: 'Good deals on quality items' }
      ]
    },
    beauty: {
      keywords: ['makeup', 'skincare', 'cosmetics', 'beauty', 'perfume', 'cream', 'lipstick'],
      recommendations: [
        { site: 'Sephora', url: 'sephora.com', reason: 'Premium brands and samples' },
        { site: 'Ulta', url: 'ulta.com', reason: 'Wide range, good rewards' },
        { site: 'Cult Beauty', url: 'cultbeauty.com', reason: 'Indie and luxury brands' },
        { site: 'Beautylish', url: 'beautylish.com', reason: 'Curated selection' }
      ]
    },
    food: {
      keywords: ['food', 'grocery', 'snacks', 'drinks', 'organic', 'cooking', 'ingredients'],
      recommendations: [
        { site: 'Amazon Fresh', url: 'amazon.com/fresh', reason: 'Wide selection, fast delivery' },
        { site: 'Thrive Market', url: 'thrivemarket.com', reason: 'Organic and healthy options' },
        { site: 'Instacart', url: 'instacart.com', reason: 'Local stores, same-day delivery' },
        { site: 'Whole Foods', url: 'wholefoodsmarket.com', reason: 'Quality organic products' }
      ]
    },
    sports: {
      keywords: ['sports', 'fitness', 'gym', 'exercise', 'workout', 'equipment', 'yoga'],
      recommendations: [
        { site: 'Dick\'s Sporting Goods', url: 'dickssportinggoods.com', reason: 'Complete sports equipment' },
        { site: 'REI', url: 'rei.com', reason: 'Outdoor and adventure gear' },
        { site: 'Rogue Fitness', url: 'roguefitness.com', reason: 'Professional gym equipment' },
        { site: 'Decathlon', url: 'decathlon.com', reason: 'Affordable sports gear' }
      ]
    },
    toys: {
      keywords: ['toy', 'kids', 'children', 'game', 'play', 'lego', 'doll', 'action figure'],
      recommendations: [
        { site: 'Amazon', url: 'amazon.com', reason: 'Massive toy selection' },
        { site: 'Target', url: 'target.com', reason: 'Good deals on popular toys' },
        { site: 'Walmart', url: 'walmart.com', reason: 'Budget-friendly options' },
        { site: 'LEGO', url: 'lego.com', reason: 'Official LEGO sets' }
      ]
    }
  };

  const getRecommendations = (query) => {
    const lowerQuery = query.toLowerCase();
    
    // Find matching category
    for (const [category, data] of Object.entries(knowledgeBase)) {
      if (data.keywords.some(keyword => lowerQuery.includes(keyword))) {
        return {
          category,
          sites: data.recommendations
        };
      }
    }
    
    return null;
  };

  const generateResponse = (userMessage) => {
    const recommendations = getRecommendations(userMessage);
    
    if (recommendations) {
      let response = `Great! For ${recommendations.category}, I recommend these sites:\n\n`;
      recommendations.sites.forEach((site, index) => {
        response += `${index + 1}. **${site.site}** (${site.url})\n   → ${site.reason}\n\n`;
      });
      response += '\n💡 Tip: Always compare prices across multiple sites!';
      return response;
    } else {
      return `I can help you find the best sites for:\n\n📱 Electronics\n👕 Clothing\n📚 Books\n🛋️ Furniture\n💄 Beauty\n🍕 Food\n⚽ Sports\n🎮 Toys\n\nJust tell me what you're looking for!`;
    }
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { type: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    // Simulate thinking time
    setTimeout(() => {
      const botResponse = generateResponse(userMessage);
      setMessages(prev => [...prev, { type: 'bot', text: botResponse }]);
      setIsTyping(false);
    }, 800);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    '🖥️ Best laptop sites?',
    '👟 Where to buy sneakers?',
    '📚 Cheap book stores?',
    '🛋️ Furniture shopping?'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="smart-assistant">
      <div className="chat-container">
        <div className="messages-area">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.type}`}>
              <div className="message-avatar">
                {msg.type === 'bot' ? '🤖' : '👤'}
              </div>
              <div className="message-content">
                {msg.text.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="message bot">
              <div className="message-avatar">🤖</div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="quick-questions">
          {quickQuestions.map((q, index) => (
            <button
              key={index}
              onClick={() => setInput(q.substring(2))}
              className="quick-btn"
            >
              {q}
            </button>
          ))}
        </div>

        <div className="input-area">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about anything you want to buy..."
            rows="2"
            className="chat-input"
          />
          <button onClick={handleSend} className="send-btn">
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartAssistant;
