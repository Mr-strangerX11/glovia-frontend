import { useState } from 'react';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    // Simple bot reply logic
    setTimeout(() => {
      setMessages(msgs => [...msgs, { sender: 'bot', text: 'Thanks for your message! (Demo bot)' }]);
    }, 500);
    setInput('');
  };

  return (
    <div className="fixed bottom-6 right-6 w-80 bg-white rounded-lg shadow-lg p-4 z-50">
      <div className="font-bold mb-2">Glovia ChatBot</div>
      <div className="h-48 overflow-y-auto mb-2 border rounded bg-gray-50 p-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-1 ${msg.sender === 'bot' ? 'text-primary-600' : 'text-gray-800 text-right'}`}>{msg.text}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type your message..."
        />
        <button className="btn-primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}
