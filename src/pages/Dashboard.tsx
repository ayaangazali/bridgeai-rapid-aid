import { useState } from 'react';
import { Category, Request, Tone } from '@/types/request';
import { seedRequests, seedResources } from '@/data/seedData';
import { FilterBar } from '@/components/FilterBar';
import { MapView } from '@/components/MapView';
import { RequestCard } from '@/components/RequestCard';
import { RequestDetailDrawer } from '@/components/RequestDetailDrawer';
import { AdminBar } from '@/components/AdminBar';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>(seedRequests);
  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredRequests = activeFilter === 'All'
    ? requests
    : requests.filter(r => r.category === activeFilter);

  const selectedRequest = requests.find(r => r.id === selectedRequestId) || null;

  const handleAssign = (id: string) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'assigned' as const } : r
    ));
    toast.success('Volunteer assigned to request');
  };

  const handleResolve = (id: string) => {
    setRequests(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'resolved' as const } : r
    ));
    toast.success('Request marked as resolved');
  };

  const handlePinClick = (requestId: string) => {
    setSelectedRequestId(requestId);
  };

  const handleCardClick = (request: Request) => {
    setSelectedRequestId(request.id);
    setDrawerOpen(true);
  };

  const simulateCall = () => {
    const descriptions = [
      'Need warm clothes for tonight',
      'Looking for food pantry nearby',
      'Lost my ID, need help with documentation',
      'Need transportation to shelter',
      'Looking for job placement services'
    ];
    
    const categories: Category[] = ['Food', 'Shelter', 'Legal', 'Other'];
    const tones: Tone[] = ['Calm', 'Anxious', 'Distressed'];
    
    const newRequest: Request = {
      id: `req-${Date.now()}`,
      category: categories[Math.floor(Math.random() * categories.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      tone: tones[Math.floor(Math.random() * tones.length)],
      status: 'open',
      location: {
        lat: 37.76 + Math.random() * 0.03,
        lng: -122.49 + Math.random() * 0.08,
        address: 'San Francisco, CA'
      },
      name: Math.random() > 0.5 ? 'Anonymous' : 'New Caller',
      conversation: [
        'Hello, I need help.',
        'I understand. Let me connect you with the right resources.'
      ],
      memory: ['First time caller'],
      timestamp: new Date()
    };

    setRequests(prev => [newRequest, ...prev]);
    toast.success('New request received');
  };

  const toggleTone = () => {
    const tones: Tone[] = ['Calm', 'Anxious', 'Distressed'];
    setRequests(prev => {
      if (prev.length === 0) return prev;
      const lastRequest = prev[0];
      const currentToneIndex = tones.indexOf(lastRequest.tone);
      const nextTone = tones[(currentToneIndex + 1) % tones.length];
      
      return [
        { ...lastRequest, tone: nextTone },
        ...prev.slice(1)
      ];
    });
    toast.info('Tone updated for last request');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.1),transparent_50%)]" />

      {/* Header */}
      <header className="glass-card mx-4 mt-4 mb-4 sticky top-4 z-40">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
                className="gap-2 hover:bg-white/50 dark:hover:bg-slate-800/50"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              <h1 className="text-2xl font-bold text-primary">BridgeAI Dashboard</h1>
            </div>
            <FilterBar
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
            />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Map Column */}
          <div className="h-full min-h-[400px] glass-card p-4 overflow-hidden">
            <MapView
              requests={filteredRequests}
              resources={seedResources}
              selectedRequestId={selectedRequestId}
              onPinClick={handlePinClick}
            />
          </div>

          {/* Requests Column */}
          <div className="h-full overflow-y-auto space-y-4 pr-2">
            {filteredRequests.length === 0 ? (
              <div className="flex items-center justify-center h-full glass-card">
                <p className="text-muted-foreground">No requests match this filter</p>
              </div>
            ) : (
              filteredRequests.map(request => (
                <RequestCard
                  key={request.id}
                  request={request}
                  onSelect={handleCardClick}
                  onAssign={handleAssign}
                  onResolve={handleResolve}
                  isSelected={selectedRequestId === request.id}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {/* Request Detail Drawer */}
      <RequestDetailDrawer
        request={selectedRequest}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      />

      {/* Admin Bar */}
      <AdminBar
        onSimulateCall={simulateCall}
        onToggleTone={toggleTone}
      />
    </div>
  );
};

export default Dashboard;
