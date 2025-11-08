import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HandHeart, Building2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background">
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-screen">
        
        {/* Logo & Tagline */}
        <div className="text-center mb-16 space-y-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <HandHeart className="w-16 h-16 text-primary" strokeWidth={1.5} />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-foreground">
            Bridge<span className="text-primary">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            One line to food, shelter, and help.
          </p>
        </div>

        {/* Two Main Options */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-4xl mb-16">
          
          {/* Option A: I Need Help */}
          <Card 
            className="cursor-pointer hover:shadow-2xl transition-all hover:scale-105 border-2 hover:border-primary/50"
            onClick={() => navigate('/help')}
          >
            <CardHeader className="text-center pb-8 pt-12">
              <div className="mx-auto mb-6 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <HandHeart className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl">I Need Help</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-12">
              <p className="text-muted-foreground text-lg">
                Get immediate assistance with food, shelter, and essential resources
              </p>
            </CardContent>
          </Card>

          {/* Option B: I'm from an Organization */}
          <Card 
            className="cursor-pointer hover:shadow-2xl transition-all hover:scale-105 border-2 hover:border-primary/50"
            onClick={() => navigate('/organization')}
          >
            <CardHeader className="text-center pb-8 pt-12">
              <div className="mx-auto mb-6 w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                <Building2 className="w-10 h-10 text-primary" />
              </div>
              <CardTitle className="text-3xl">I'm from an Organization</CardTitle>
            </CardHeader>
            <CardContent className="text-center pb-12">
              <p className="text-muted-foreground text-lg">
                Manage resources, track requests, and coordinate support
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <footer className="text-center text-sm text-muted-foreground mt-auto pt-8">
          <p>
            Powered by Google Cloud • ElevenLabs • Eudia AI • BridgeAI © 2025
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
