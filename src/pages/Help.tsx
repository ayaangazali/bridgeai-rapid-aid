import { useState } from 'react';
import { ArrowLeft, Send, Mic, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Help = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm here to help. How can I assist you today? You can tell me about what you need - food, shelter, or any other support.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand you need help. Let me find nearby resources for you. Can you tell me your approximate location?",
        "Thank you for sharing. I'm locating the closest food banks and shelters in your area. One moment please.",
        "I've found several resources near you. Would you like me to provide directions or contact information?",
        "I'm here to support you. Is there anything specific you'd like me to prioritize - immediate shelter, food, or medical assistance?"
      ];
      
      const aiMessage: Message = {
        role: 'assistant',
        content: responses[Math.floor(Math.random() * responses.length)],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.1),transparent_50%)]" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="glass-card mx-4 mt-4 mb-4 px-6 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-primary">BridgeAI Support</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="glass-button"
              title="Call for help"
            >
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 container mx-auto px-4 pb-4 flex flex-col max-w-4xl">
          <div className="glass-card flex-1 p-6 overflow-y-auto mb-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[80%] rounded-3xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'glass-card'
                  }`}
                >
                  <p className="text-base leading-relaxed">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area */}
          <div className="glass-card p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message... (Press Enter to send)"
                  className="w-full glass-input px-6 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px] max-h-[200px] text-foreground placeholder:text-muted-foreground"
                  rows={1}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className="glass-button h-[60px] w-[60px]"
                  title="Voice message"
                >
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSend}
                  className="glass-button h-[60px] w-[60px]"
                  disabled={!input.trim()}
                >
                  <Send className="w-5 h-5" />
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Available 24/7 • Your conversation is confidential
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
