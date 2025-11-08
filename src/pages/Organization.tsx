import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Organization = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        
        <div className="text-center py-16">
          <h1 className="text-4xl font-bold mb-4">Organization Portal</h1>
          <p className="text-muted-foreground text-lg mb-8">
            This will redirect to the dashboard for organizations to manage resources and requests.
          </p>
          <Button onClick={() => navigate('/dashboard')} size="lg">
            Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Organization;
