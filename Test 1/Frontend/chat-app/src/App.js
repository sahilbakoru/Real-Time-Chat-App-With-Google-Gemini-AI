import { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ReactMarkdown from 'react-markdown';

const socket = io('http://localhost:3000');

function App() {
  const [username, setUsername] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [users, setUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // Ref for focusing the input

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    socket.on('chat message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (msg.username === 'System') {
        if (msg.message.includes('Welcome')) {
          const newUser = msg.message.split(' ')[1];
          setUsers((prev) => [...prev, newUser]);
        } else if (msg.message.includes('disconnected')) {
          const leavingUser = msg.message.split(' ')[0];
          setUsers((prev) => prev.filter((u) => u !== leavingUser));
        }
      }
      scrollToBottom();
    });
  
    socket.on('user list', (userList) => {
      console.log(userList);
      setUsers(userList);
    });

    return () => {
      socket.off('chat message');
      socket.off('user list');
    };
  }, []);

  const handleJoin = (e) => {
    e.preventDefault();
    if (username) {
      socket.emit('join', username);
      setIsJoined(true);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      socket.emit('chat message', message);
      setMessage('');
    }
  };

  const clearChat = () => setMessages([]);

  // Add keyword to input and focus
  const addKeyword = (keyword) => {
    setMessage(`${keyword} `);
    inputRef.current?.focus();
  };

  if (!isJoined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 to-purple-300">
        <form onSubmit={handleJoin} className="p-8 bg-white rounded-lg shadow-lg transform transition-all hover:scale-105">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Join the Chat</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name"
            className="border p-3 rounded w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button type="submit" className="mt-4 w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors">
            Join Chat
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-300 p-6">
      <div className="max-w-4xl mx-auto flex gap-6">
        {/* Chat Section */}
        <div className="flex-1 bg-white rounded-xl shadow-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-3xl font-bold text-gray-800">Global Chatroom</h1>
            <button
              onClick={clearChat} // Your clearChat function
              className="bg-red-500 text-white px-4 py-1 rounded-lg hover:bg-red-600 transition-colors text-sm"
            >
              Clear Chat
            </button>
          </div>
          <div className="h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-3 p-3 rounded-lg ${
                  msg.username === 'ChatBot'
                    ? 'bg-green-100 text-green-800 '
                    : msg.username === 'System'
                    ? 'bg-yellow-100 text-yellow-800 text-center'
                    : 'bg-blue-100 text-blue-800 ml-auto'
                } max-w-md`}
              >
                <span className="font-semibold">{msg.username}: </span>
                {msg.username === 'ChatBot' ? (
                  <ReactMarkdown
                  
                    components={{
                      p: ({ node, ...props }) => <span {...props} />,
                      strong: ({ node, ...props }) => <span className="font-bold" {...props} />,
                      em: ({ node, ...props }) => <span className="italic" {...props} />,
                    }}
                  >
                    {msg.message}
                  </ReactMarkdown>
                ) : (
                  <span>{msg.message}</span>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} className="flex gap-3 mb-4">
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a message or use buttons below..."
            />
            <button type="submit" className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition-colors">
              Send
            </button>
          </form>
          <div className="flex gap-2 justify-center mb-4">
            <button
              onClick={() => addKeyword('help')}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
            >
              🙋‍♂️ Help
            </button>
            <button
              onClick={() => addKeyword('support')}
              className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors"
            >
            🔧 Support
            </button>
     
          </div>
          <div className="text-sm text-gray-600 text-center">
            <p>Chatbot Tips: Try "help with coding," "support chat issues"!</p>
          </div>
        </div>
  
        {/* Beautiful User List */}
        <div className="w-64 bg-white rounded-xl shadow-xl p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
         
            Online Users ({users.length})
          </h2>
          <ul className="space-y-2 max-h-96 overflow-y-auto">
            {users.map((user, index) => (
              <li
                key={index}
                className="flex items-center p-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors animate-fade-in"
              >
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-700 truncate">{user}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;