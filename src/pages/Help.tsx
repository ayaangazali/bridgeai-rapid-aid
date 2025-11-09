import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Mic, Phone, MapPin, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  resources?: any[];
}

const Help = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hello, I'm here to help you 24/7. I can help you find food banks, shelters, medical care, or legal assistance. What do you need today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          console.log('Location obtained:', position.coords);
        },
        (error) => {
          console.log('Location error:', error);
          // Default to SF if location denied
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    } else {
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error('Voice recognition error. Please try again.');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported in this browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
      toast.info('Listening... Speak now');
    }
  };

  const detectIntent = (text: string) => {
    const lower = text.toLowerCase();
    if (lower.includes('food') || lower.includes('hungry') || lower.includes('eat') || lower.includes('meal')) {
      return 'food';
    }
    if (lower.includes('shelter') || lower.includes('sleep') || lower.includes('bed') || lower.includes('stay')) {
      return 'shelter';
    }
    if (lower.includes('legal') || lower.includes('lawyer') || lower.includes('id') || lower.includes('document')) {
      return 'legal';
    }
    if (lower.includes('medical') || lower.includes('doctor') || lower.includes('sick') || lower.includes('health')) {
      return 'medical';
    }
    return null;
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Detect intent
      const intent = detectIntent(userInput);
      
      // Analyze tone
      const toneResponse = await fetch('http://localhost:4000/api/ai/analyze-tone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInput })
      });
      const toneData = await toneResponse.json();
      const tone = toneData.tone || 'Calm';

      let aiResponse = '';
      let resources: any[] = [];

      // If user is asking for location/resources
      if (intent && userLocation) {
        // Search for nearby resources
        const resourceResponse = await fetch('http://localhost:4000/api/resources/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: userLocation,
            type: intent,
            limit: 3
          })
        });
        const resourceData = await resourceResponse.json();
        resources = resourceData.resources || [];

        // Generate AI response with resources
        const context = {
          intent,
          tone,
          resourcesFound: resources.length,
          resources: resources.map(r => ({
            name: r.name,
            distance: r.distance.toFixed(1) + ' miles',
            address: r.location.address,
            phone: r.phone
          }))
        };

        const aiResponseData = await fetch('http://localhost:4000/api/ai/generate-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userInput,
            tone,
            context
          })
        });
        const aiData = await aiResponseData.json();
        aiResponse = aiData.response || "I'm here to help.";

        // Add resource details to response
        if (resources.length > 0) {
          aiResponse += `\n\n📍 Here are the closest ${intent} resources near you:\n\n`;
          resources.forEach((r, i) => {
            aiResponse += `${i + 1}. **${r.name}**\n`;
            aiResponse += `   📍 ${r.location.address}\n`;
            aiResponse += `   📞 ${r.phone}\n`;
            aiResponse += `   ⏰ ${r.hours}\n`;
            aiResponse += `   🔹 ${r.services.join(', ')}\n`;
            aiResponse += `   📏 ${r.distance.toFixed(1)} miles away\n\n`;
          });
        }
      } else {
        // General conversation
        const aiResponseData = await fetch('http://localhost:4000/api/ai/generate-response', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: userInput,
            tone,
            context: { userLocation: userLocation ? 'available' : 'unavailable' }
          })
        });
        const aiData = await aiResponseData.json();
        aiResponse = aiData.response || "I understand. How can I help you?";
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
        resources
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. For immediate help, please call 211 for local resources or 988 for crisis support.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary">BridgeAI Support</h1>
            {userLocation && (
              <p className="text-xs text-muted-foreground flex items-center gap-1 justify-center mt-1">
                <MapPin className="w-3 h-3" />
                Location enabled - Finding resources near you
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="glass-button"
              onClick={() => navigate('/request-help')}
            >
              Submit Request
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="glass-button"
              title="Call 211 for immediate help"
              onClick={() => window.location.href = 'tel:211'}
            >
              <Phone className="w-4 h-4" />
            </Button>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 container mx-auto px-4 pb-4 flex flex-col max-w-4xl">
          <div className="glass-card flex-1 p-6 overflow-y-auto mb-4 space-y-4 max-h-[calc(100vh-280px)]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[85%] rounded-3xl px-6 py-4 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'glass-card'
                  }`}
                >
                  <p className="text-base leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  <span className="text-xs opacity-70 mt-2 block">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="glass-card rounded-3xl px-6 py-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Finding help for you...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="glass-card p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Type what you need... (e.g., 'I need food' or 'Where can I sleep tonight?')"
                  className="w-full glass-input px-6 py-4 resize-none focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[60px] max-h-[200px] text-foreground placeholder:text-muted-foreground"
                  rows={1}
                  disabled={isLoading}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="icon"
                  variant="outline"
                  className={`glass-button h-[60px] w-[60px] ${isListening ? 'bg-red-500 text-white' : ''}`}
                  title="Voice message"
                  onClick={toggleVoiceInput}
                  disabled={isLoading}
                >
                  <Mic className="w-5 h-5" />
                </Button>
                <Button
                  onClick={handleSend}
                  className="glass-button h-[60px] w-[60px]"
                  disabled={!input.trim() || isLoading}
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Available 24/7 • AI-powered support • Call 211 for immediate help • Text HELLO to 741741 for crisis support
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Help;
