import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MapPin, Phone, Send, Utensils, Home, Scale, Heart, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Category = 'Food' | 'Shelter' | 'Legal' | 'Medical';

const RequestHelp = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setDescription(prev => prev ? `${prev} ${transcript}` : transcript);
        setIsListening(false);
        toast.success('Voice recorded!');
      };
      
      recognitionRef.current.onerror = (error: any) => {
        setIsListening(false);
        console.error('Speech recognition error:', error);
        toast.error('Voice recognition error. Please try again.');
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, []);

  const categories = [
    { id: 'Food' as Category, label: 'Food', icon: Utensils, color: 'bg-green-500', description: 'Need food or meals' },
    { id: 'Shelter' as Category, label: 'Shelter', icon: Home, color: 'bg-blue-500', description: 'Need place to stay' },
    { id: 'Legal' as Category, label: 'Legal Help', icon: Scale, color: 'bg-purple-500', description: 'Need legal assistance' },
    { id: 'Medical' as Category, label: 'Medical', icon: Heart, color: 'bg-pink-500', description: 'Need healthcare' },
  ];

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
      toast.info('🎤 Listening... Speak now');
    }
  };

  const getLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Location not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        // Reverse geocode to get address
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await response.json();
          const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
          
          setLocation({ lat, lng, address });
          toast.success('📍 Location found!');
        } catch (error) {
          // Fallback if geocoding fails
          setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          toast.success('📍 Location found!');
        }
        setIsGettingLocation(false);
      },
      (error) => {
        console.error('Location error:', error);
        setIsGettingLocation(false);
        toast.error('Could not get your location. Please enable location access.');
      }
    );
  };

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast.error('Please select what you need help with');
      return;
    }
    if (!description.trim()) {
      toast.error('Please describe what you need');
      return;
    }
    if (!location) {
      toast.error('Please share your location so we can find help nearby');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:4000/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: selectedCategory,
          description: description.trim(),
          name: name.trim() || 'Anonymous',
          location,
          conversation: [description.trim()],
          memory: []
        })
      });

      if (response.ok) {
        toast.success('✅ Help request submitted! Someone will reach out soon.');
        
        // Reset form
        setTimeout(() => {
          setSelectedCategory(null);
          setDescription('');
          setName('');
          setLocation(null);
          navigate('/help');
        }, 2000);
      } else {
        throw new Error('Failed to submit request');
      }
    } catch (error) {
      console.error('Error submitting request:', error);
      toast.error('Could not submit request. Please try again or call 211 for immediate help.');
    } finally {
      setIsSubmitting(false);
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
          <h1 className="text-2xl font-bold text-primary">Request Help</h1>
          <Button
            variant="outline"
            size="icon"
            className="glass-button"
            title="Call 211 for immediate help"
            onClick={() => window.location.href = 'tel:211'}
          >
            <Phone className="w-4 h-4" />
          </Button>
        </header>

        {/* Main Form */}
        <div className="flex-1 container mx-auto px-4 pb-8 max-w-2xl">
          <div className="glass-card p-8 space-y-8">
            
            {/* Step 1: Category Selection */}
            <div>
              <h2 className="text-xl font-bold mb-4 text-foreground">What do you need help with?</h2>
              <div className="grid grid-cols-2 gap-4">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={cn(
                      'glass-card p-6 rounded-2xl transition-all duration-300 hover:scale-105',
                      selectedCategory === cat.id && 'ring-4 ring-primary shadow-xl scale-105'
                    )}
                  >
                    <div className={cn('w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3', cat.color)}>
                      <cat.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="font-bold text-center mb-1">{cat.label}</h3>
                    <p className="text-xs text-muted-foreground text-center">{cat.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Description */}
            {selectedCategory && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold mb-4 text-foreground">Tell us more</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Your name (optional)</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name or leave blank"
                      className="w-full glass-input px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium mb-2 block">What do you need?</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe what you need... You can type or use the microphone button"
                      className="w-full glass-input px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 min-h-[120px] resize-none"
                    />
                    <div className="flex justify-end mt-2">
                      <Button
                        onClick={toggleVoiceInput}
                        variant="outline"
                        className={cn(
                          'glass-button gap-2',
                          isListening && 'bg-red-500 text-white hover:bg-red-600'
                        )}
                      >
                        <Mic className="w-4 h-4" />
                        {isListening ? 'Listening...' : 'Use Voice'}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Location */}
            {selectedCategory && description.trim() && (
              <div className="animate-fade-in">
                <h2 className="text-xl font-bold mb-4 text-foreground">Share your location</h2>
                <p className="text-sm text-muted-foreground mb-4">
                  We need your location to find the closest resources near you
                </p>
                
                {location ? (
                  <div className="glass-card p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border-green-500/20">
                    <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-green-600 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-medium text-green-800 dark:text-green-400">Location set!</p>
                        <p className="text-sm text-green-700 dark:text-green-500 mt-1">{location.address}</p>
                      </div>
                      <Button
                        onClick={getLocation}
                        variant="ghost"
                        size="sm"
                        className="text-green-600 hover:text-green-700"
                      >
                        Update
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    onClick={getLocation}
                    disabled={isGettingLocation}
                    className="w-full glass-button py-6 text-lg gap-3"
                  >
                    {isGettingLocation ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Getting Location...
                      </>
                    ) : (
                      <>
                        <MapPin className="w-5 h-5" />
                        Share My Location
                      </>
                    )}
                  </Button>
                )}
              </div>
            )}

            {/* Submit Button */}
            {selectedCategory && description.trim() && location && (
              <div className="animate-fade-in pt-4">
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 text-lg font-bold rounded-2xl shadow-xl gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Submit Request for Help
                    </>
                  )}
                </Button>
                <p className="text-center text-sm text-muted-foreground mt-4">
                  Someone will contact you as soon as possible
                </p>
              </div>
            )}

            {/* Emergency Help */}
            <div className="border-t border-white/20 pt-6">
              <p className="text-center text-sm text-muted-foreground mb-3">Need immediate help?</p>
              <div className="flex gap-3 justify-center">
                <Button
                  onClick={() => window.location.href = 'tel:211'}
                  variant="outline"
                  className="glass-button gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Call 211
                </Button>
                <Button
                  onClick={() => window.location.href = 'tel:988'}
                  variant="outline"
                  className="glass-button gap-2"
                >
                  <Phone className="w-4 h-4" />
                  Crisis: 988
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestHelp;
