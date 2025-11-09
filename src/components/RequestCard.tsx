import { Request } from '@/types/request';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RequestCardProps {
  request: Request;
  onSelect: (request: Request) => void;
  onAssign: (id: string) => void;
  onResolve: (id: string) => void;
  isSelected?: boolean;
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

const statusLabels = {
  open: 'Open',
  assigned: 'Assigned',
  resolved: 'Resolved'
};

export const RequestCard = ({ request, onSelect, onAssign, onResolve, isSelected }: RequestCardProps) => {
  const timeAgo = (date: Date | string) => {
    const timestamp = typeof date === 'string' ? new Date(date).getTime() : date.getTime();
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <Card
      className={cn(
        'glass-card p-4 cursor-pointer transition-all hover:shadow-2xl',
        isSelected && 'ring-2 ring-primary'
      )}
      onClick={() => onSelect(request)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={categoryColors[request.category]}>
            {request.category}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {statusLabels[request.status]}
          </Badge>
          {(request as any).safetyScore && (
            <Badge 
              variant="outline"
              className={cn(
                'font-bold',
                (request as any).safetyScore >= 4 ? 'bg-red-500/20 text-red-500 border-red-500' :
                (request as any).safetyScore >= 3 ? 'bg-yellow-500/20 text-yellow-500 border-yellow-500' :
                'bg-green-500/20 text-green-500 border-green-500'
              )}
            >
              🚨 {(request as any).safetyScore}/5
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {timeAgo(request.timestamp)}
        </span>
      </div>

      <p className="text-sm font-medium text-foreground mb-2">
        {request.description}
      </p>

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span>{request.name || 'Anonymous'}</span>
        </div>
        <span className={cn('text-xs font-medium', toneColors[request.tone])}>
          {request.tone}
        </span>
      </div>

      <div className="flex gap-2">
        {request.status === 'open' && (
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onAssign(request.id);
            }}
            className="flex-1"
          >
            Assign
          </Button>
        )}
        {request.status !== 'resolved' && (
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onResolve(request.id);
            }}
            className="flex-1"
          >
            Resolve
          </Button>
        )}
      </div>
    </Card>
  );
};
