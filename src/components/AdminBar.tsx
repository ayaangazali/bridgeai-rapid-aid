import { Button } from '@/components/ui/button';
import { PhoneCall, RotateCcw } from 'lucide-react';

interface AdminBarProps {
  onSimulateCall: () => void;
  onToggleTone: () => void;
}

export const AdminBar = ({ onSimulateCall, onToggleTone }: AdminBarProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Button
            onClick={onSimulateCall}
            className="gap-2"
            variant="default"
          >
            <PhoneCall className="w-4 h-4" />
            Simulate New Call
          </Button>
          <Button
            onClick={onToggleTone}
            variant="outline"
            className="gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Toggle Tone
          </Button>
        </div>
      </div>
    </div>
  );
};
