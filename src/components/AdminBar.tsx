import { Button } from '@/components/ui/button';
import { PhoneCall, RotateCcw } from 'lucide-react';

interface AdminBarProps {
  onSimulateCall: () => void;
  onToggleTone: () => void;
}

export const AdminBar = ({ onSimulateCall, onToggleTone }: AdminBarProps) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 glass-card shadow-2xl z-50 rounded-3xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            onClick={onSimulateCall}
            className="gap-2 glass-button rounded-2xl"
            variant="default"
          >
            <PhoneCall className="w-4 h-4" />
            Simulate New Call
          </Button>
          <Button
            onClick={onToggleTone}
            variant="outline"
            className="gap-2 glass-card hover:shadow-lg rounded-2xl"
          >
            <RotateCcw className="w-4 h-4" />
            Toggle Tone
          </Button>
        </div>
      </div>
    </div>
  );
};
