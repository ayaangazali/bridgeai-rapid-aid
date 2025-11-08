import { Request } from '@/types/request';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { MapPin, User, Clock, MessageSquare, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestDetailDrawerProps {
  request: Request | null;
  open: boolean;
  onClose: () => void;
}

const categoryColors = {
  Food: 'bg-success text-success-foreground',
  Shelter: 'bg-primary text-primary-foreground',
  Legal: 'bg-accent text-accent-foreground',
  Other: 'bg-muted text-muted-foreground'
};

const toneColors = {
  Calm: 'text-success',
  Anxious: 'text-warning',
  Distressed: 'text-destructive'
};

export const RequestDetailDrawer = ({ request, open, onClose }: RequestDetailDrawerProps) => {
  if (!request) return null;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {request.name || 'Anonymous Request'}
          </SheetTitle>
          <SheetDescription>
            Request details and conversation history
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status and Category */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={categoryColors[request.category]}>
              {request.category}
            </Badge>
            <Badge variant="outline" className={cn('font-medium', toneColors[request.tone])}>
              {request.tone}
            </Badge>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Description</h3>
            <p className="text-base">{request.description}</p>
          </div>

          {/* Location */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              Location
            </h3>
            <p className="text-sm">{request.location.address}</p>
          </div>

          {/* Time */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Timestamp
            </h3>
            <p className="text-sm">{request.timestamp.toLocaleString()}</p>
          </div>

          {/* Conversation */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              Recent Conversation
            </h3>
            <div className="space-y-3">
              {request.conversation.map((message, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-3 rounded-2xl text-sm',
                    idx % 2 === 0
                      ? 'glass-card ml-0 mr-4'
                      : 'bg-primary/20 backdrop-blur-xl border border-primary/30 ml-4 mr-0'
                  )}
                >
                  <p className="text-xs text-muted-foreground mb-1">
                    {idx % 2 === 0 ? 'User' : 'AI Assistant'}
                  </p>
                  <p>{message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Memory */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Brain className="w-4 h-4" />
              Memory & Notes
            </h3>
            <div className="glass-card p-4 rounded-2xl">
              <ul className="space-y-2">
                {request.memory.map((note, idx) => (
                  <li key={idx} className="text-sm flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
