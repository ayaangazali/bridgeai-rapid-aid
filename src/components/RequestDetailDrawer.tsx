import { Request } from '@/types/request';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, User, Clock, MessageSquare, Brain, Phone, MessageCircle, Navigation, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

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

          {/* Phone Number */}
          {request.phone && (
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-1">
                <Phone className="w-4 h-4" />
                Contact
              </h3>
              <p className="text-sm font-mono">{request.phone}</p>
            </div>
          )}

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
              Memory & Key Points
            </h3>
            <div className="glass-card p-4 rounded-2xl">
              {request.memory.length > 0 ? (
                <ul className="space-y-2">
                  {request.memory.map((note, idx) => (
                    <li key={idx} className="text-sm flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No key points recorded yet</p>
              )}
            </div>
          </div>

          {/* Status Timeline */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <Clock className="w-4 h-4" />
              Status Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  request.status === 'resolved' ? 'bg-green-500' : 'bg-gray-300'
                )}>
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Resolved</p>
                  <p className="text-xs text-muted-foreground">
                    {request.status === 'resolved' ? 'Request completed' : 'Pending'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center',
                  request.status === 'assigned' || request.status === 'resolved' ? 'bg-blue-500' : 'bg-gray-300'
                )}>
                  <AlertCircle className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Assigned</p>
                  <p className="text-xs text-muted-foreground">
                    {request.status === 'assigned' || request.status === 'resolved' ? 'Volunteer assigned' : 'Waiting for assignment'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-green-500">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium">Received</p>
                  <p className="text-xs text-muted-foreground">
                    {request.timestamp.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="border-t border-white/20 pt-6 space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Actions</h3>
            
            <Button
              onClick={() => {
                window.open(`https://www.google.com/maps/dir/?api=1&destination=${request.location.lat},${request.location.lng}`, '_blank');
              }}
              className="w-full glass-button gap-2 justify-start"
              variant="outline"
            >
              <Navigation className="w-4 h-4" />
              Get Directions
            </Button>

            {request.name && request.name !== 'Anonymous' && (
              <>
                <Button
                  onClick={async () => {
                    const toastId = toast.loading('Initiating AI call...');
                    try {
                      // ALWAYS redirect to this number regardless of request.phone
                      const phoneNumber = '+18582108648';
                      
                      const response = await fetch('http://localhost:4000/api/call/initiate', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          phoneNumber: phoneNumber,
                          tone: request.tone
                        })
                      });
                      
                      if (!response.ok) {
                        throw new Error('Failed to initiate call');
                      }
                      
                      const data = await response.json();
                      toast.dismiss(toastId);
                      
                      // Handle both 'callId' and 'id' fields from VAPI
                      const callId = data.callId || data.id || 'unknown';
                      
                      if (data.mock) {
                        toast.info(`📞 Mock call initiated to ${phoneNumber}. Call ID: ${callId}`, {
                          description: 'VAPI integration will work in production with real API key'
                        });
                      } else {
                        toast.success(`📞 AI call initiated! Call ID: ${callId}`, {
                          description: `Calling ${phoneNumber} with ${request.tone} tone`
                        });
                      }
                      
                      console.log('VAPI call response:', data);
                    } catch (error) {
                      toast.dismiss(toastId);
                      console.error('Call error:', error);
                      toast.error('Failed to initiate call', {
                        description: 'Check if backend is running on port 4000'
                      });
                    }
                  }}
                  className="w-full glass-button gap-2 justify-start"
                  variant="outline"
                >
                  <Phone className="w-4 h-4" />
                  Call with AI (VAPI)
                </Button>

                <Button
                  onClick={() => {
                    // HARDCODED: Always send SMS to this number
                    const phoneNumber = '+18582108648';
                    const message = `Hi ${request.name}, this is BridgeAI. We received your request for ${request.category.toLowerCase()} assistance. How can we help you today?`;
                    const smsUrl = `sms:${phoneNumber}&body=${encodeURIComponent(message)}`;
                    window.location.href = smsUrl;
                    toast.info(`Opening SMS to ${phoneNumber}...`);
                  }}
                  className="w-full glass-button gap-2 justify-start"
                  variant="outline"
                >
                  <MessageCircle className="w-4 h-4" />
                  Send SMS Message
                </Button>
              </>
            )}

            <div className="grid grid-cols-2 gap-2 pt-2">
              <Button
                onClick={() => toast.success('Request marked as assigned')}
                variant="default"
                size="sm"
                disabled={request.status !== 'open'}
              >
                Assign to Me
              </Button>
              <Button
                onClick={() => toast.success('Request marked as resolved')}
                variant="default"
                size="sm"
                disabled={request.status === 'resolved'}
              >
                Mark Resolved
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
