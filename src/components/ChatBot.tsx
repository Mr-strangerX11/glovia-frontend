"use client";
import { useState } from 'react';

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [open, setOpen] = useState(false);

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
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Toggle Button */}
      {!open && (
        <button
          className="bg-primary-600 text-white rounded-full shadow-lg w-14 h-14 flex items-center justify-center text-2xl hover:bg-primary-700 transition mb-2"
          aria-label="Open ChatBot"
          onClick={() => setOpen(true)}
        >
          💬
        </button>
      )}
      {open && (
        <div className="w-80 bg-white rounded-xl shadow-2xl p-4 relative animate-fadeIn">
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-xl"
            aria-label="Close ChatBot"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
          <div className="font-bold mb-2 text-primary-700 flex items-center gap-2">
            <span>Glovia ChatBot</span>
            <span className="text-xs bg-primary-100 text-primary-700 px-2 py-0.5 rounded">Beta</span>
          </div>
          <div className="h-48 overflow-y-auto mb-2 border rounded bg-gray-50 p-2 custom-scrollbar">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-1 px-2 py-1 rounded-lg max-w-[90%] ${
                  msg.sender === 'bot'
                    ? 'bg-primary-100 text-primary-700 self-start'
                    : 'bg-gray-200 text-gray-800 self-end ml-auto text-right'
                }`}
                style={{ alignSelf: msg.sender === 'bot' ? 'flex-start' : 'flex-end' }}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              className="input flex-1 border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Type your message..."
              onKeyDown={e => { if (e.key === 'Enter') handleSend(); }}
            />
            <button
              className="btn-primary px-4 py-2 rounded"
              onClick={handleSend}
              disabled={!input.trim()}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
