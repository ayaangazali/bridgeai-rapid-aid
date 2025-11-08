import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare, LayoutDashboard } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-4">
            Bridge<span className="text-primary">AI</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            One line to food, shelter, and help.
          </p>
        </div>

        {/* Main Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* People & Shelters Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Phone className="w-6 h-6 text-primary" />
                People & Shelters
              </CardTitle>
              <CardDescription className="text-base">
                Call or text this number to get immediate help
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-primary/10 rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">Hotline Number</p>
                <p className="text-3xl font-bold text-primary mb-4">1-800-BRIDGE</p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>Available 24/7</span>
                </div>
              </div>

              <div className="bg-accent rounded-lg p-6 text-center">
                <p className="text-sm text-muted-foreground mb-2">SMS Number</p>
                <p className="text-2xl font-bold text-accent-foreground mb-4">1-800-274-3434</p>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <MessageSquare className="w-4 h-4" />
                  <span>Text for assistance</span>
                </div>
              </div>

              <div className="text-sm text-muted-foreground space-y-2">
                <p>• Free and confidential support</p>
                <p>• Multilingual assistance available</p>
                <p>• Connect with food, shelter, and resources</p>
              </div>
            </CardContent>
          </Card>

          {/* Live Dashboard Card */}
          <Card className="shadow-lg hover:shadow-xl transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <LayoutDashboard className="w-6 h-6 text-primary" />
                Live Dashboard
              </CardTitle>
              <CardDescription className="text-base">
                Real-time view of active requests and resources
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Active Requests</span>
                  <span className="text-2xl font-bold text-primary">12</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Available Resources</span>
                  <span className="text-2xl font-bold text-success">24</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <span className="text-sm font-medium">Active Volunteers</span>
                  <span className="text-2xl font-bold text-accent-foreground">8</span>
                </div>
              </div>

              <Button
                onClick={() => navigate('/dashboard')}
                className="w-full h-12 text-lg"
                size="lg"
              >
                View Live Dashboard
              </Button>

              <p className="text-sm text-muted-foreground text-center">
                Monitor and respond to community needs in real-time
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-4">How BridgeAI Works</h2>
          <div className="grid md:grid-cols-3 gap-6 text-left">
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-3">
                1
              </div>
              <h3 className="font-semibold">Call or Text</h3>
              <p className="text-sm text-muted-foreground">
                Reach out via phone or SMS to describe your needs
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-3">
                2
              </div>
              <h3 className="font-semibold">AI Assessment</h3>
              <p className="text-sm text-muted-foreground">
                Our AI understands your situation and finds nearby resources
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-xl mb-3">
                3
              </div>
              <h3 className="font-semibold">Get Connected</h3>
              <p className="text-sm text-muted-foreground">
                Receive immediate assistance and ongoing support
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
