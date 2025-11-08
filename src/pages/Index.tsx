import { useNavigate } from 'react-router-dom';
import { HandHeart, Building2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.1),transparent_50%)]" />
      
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen relative z-10">
        
        {/* Logo & Tagline */}
        <div className="text-center mb-16 space-y-6 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="glass-card p-4">
              <HandHeart className="w-16 h-16 text-primary" strokeWidth={1.5} />
            </div>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            Bridge<span className="text-primary">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            One line to food, shelter, and help.
          </p>
        </div>

        {/* Two Main Options */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl mb-16">
          
          {/* Option A: I Need Help */}
          <div 
            className="glass-card cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-900/80 group"
            onClick={() => navigate('/help')}
          >
            <div className="text-center py-12 px-8">
              <div className="mx-auto mb-8 w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <HandHeart className="w-12 h-12 text-primary" strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">I Need Help</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Get immediate assistance with food, shelter, and essential resources
              </p>
            </div>
          </div>

          {/* Option B: I'm from an Organization */}
          <div 
            className="glass-card cursor-pointer hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/80 dark:hover:bg-slate-900/80 group"
            onClick={() => navigate('/organization')}
          >
            <div className="text-center py-12 px-8">
              <div className="mx-auto mb-8 w-24 h-24 bg-gradient-to-br from-primary/20 to-primary/5 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Building2 className="w-12 h-12 text-primary" strokeWidth={2} />
              </div>
              <h2 className="text-3xl font-bold mb-4 text-foreground">I'm from an Organization</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                Manage resources, track requests, and coordinate support
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground mt-auto pt-8 glass-card px-6 py-3">
          <p>
            Powered by Google Cloud • ElevenLabs • Eudia AI • BridgeAI © 2025
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
