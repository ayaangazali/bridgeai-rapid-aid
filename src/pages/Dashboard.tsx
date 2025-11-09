import { useState, useEffect } from 'react';
import { Category, Request, Tone } from '@/types/request';
import { seedRequests, seedResources } from '@/data/seedData';
import { FilterBar } from '@/components/FilterBar';
import { MapView3D } from '@/components/MapView3D';
import { RequestCard } from '@/components/RequestCard';
import { RequestDetailDrawer } from '@/components/RequestDetailDrawer';
import { AdminBar } from '@/components/AdminBar';
import { ArrowLeft, Download, Search, Users, CheckCircle, Clock, AlertCircle, Settings, Bell, Filter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Dashboard = () => {
  console.log('Dashboard rendering...');
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>(seedRequests || []);
  const [resources, setResources] = useState(seedResources || []);
  const [activeFilter, setActiveFilter] = useState<Category | 'All'>('All');
  const [selectedRequestId, setSelectedRequestId] = useState<string | undefined>();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [safetyScores, setSafetyScores] = useState<any[]>([]);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  const [showAnalytics, setShowAnalytics] = useState(false);

  console.log('Dashboard state:', { requests: requests?.length || 0, resources: resources?.length || 0 });

  // Fetch data from backend on mount
  useEffect(() => {
    // Fetch requests
    fetch('http://localhost:4000/api/requests')
      .then(res => res.json())
      .then(data => {
        if (data.requests && data.requests.length > 0) {
          setRequests(data.requests);
        }
      })
      .catch(err => {
        console.error('Failed to fetch requests:', err);
        // Keep using seed data as fallback
      });

    // Fetch resources
    fetch('http://localhost:4000/api/resources')
      .then(res => res.json())
      .then(data => {
        if (data.resources && data.resources.length > 0) {
          setResources(data.resources);
        }
      })
      .catch(err => console.error('Failed to fetch resources:', err));

    // Fetch safety scores
    fetch('http://localhost:4000/api/safety-scores')
      .then(res => res.json())
      .then(data => {
        if (data.safetyScores) {
          setSafetyScores(data.safetyScores);
        }
      })
      .catch(err => console.error('Failed to fetch safety scores:', err));

    // Fetch heatmap data
    fetch('http://localhost:4000/api/heatmap')
      .then(res => res.json())
      .then(data => {
        if (data.heatmapData) {
          setHeatmapData(data.heatmapData);
        }
      })
      .catch(err => {
        console.error('Failed to fetch resources:', err);
        // Keep using seed data as fallback
      });
  }, []);

  const filteredRequests = (requests || []).filter(r => {
    const matchesCategory = activeFilter === 'All' || r.category === activeFilter;
    const matchesSearch = searchQuery === '' || 
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const selectedRequest = (requests || []).find(r => r.id === selectedRequestId) || null;

  // Calculate advanced stats
  const now = new Date();
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recentRequests = (requests || []).filter(r => new Date(r.timestamp) > last24h);
  
  const stats = {
    // Critical cases needing immediate attention
    critical: (requests || []).filter(r => r.status === 'open' && (r as any).safetyScore >= 4).length,
    criticalTrend: Math.random() > 0.5 ? '+12%' : '-8%', // TODO: Calculate real trend
    
    // Average response time in hours
    avgResponseTime: (() => {
      const assignedRequests = (requests || []).filter(r => r.status === 'assigned' || r.status === 'resolved');
      if (assignedRequests.length === 0) return 0;
      // Mock calculation - in real app, would use actual timestamps
      return 2.4; // hours
    })(),
    responseTrend: '-15%', // Negative is good (faster response)
    
    // Active hotspots (areas with 3+ open requests)
    hotspots: (() => {
      const openRequests = (requests || []).filter(r => r.status === 'open');
      const areaGroups = openRequests.reduce((acc, r) => {
        const area = r.location.address.split(',')[0]; // Get neighborhood
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      return Object.values(areaGroups).filter(count => count >= 3).length;
    })(),
    hotspotsCount: recentRequests.length,
    
    // Success rate (resolved / total)
    successRate: (() => {
      const total = (requests || []).length;
      if (total === 0) return 0;
      const resolved = (requests || []).filter(r => r.status === 'resolved').length;
      return Math.round((resolved / total) * 100);
    })(),
    successTrend: '+5%',
    
    // Legacy stats for backwards compatibility
    total: (requests || []).length,
    open: (requests || []).filter(r => r.status === 'open').length,
    assigned: (requests || []).filter(r => r.status === 'assigned').length,
    resolved: (requests || []).filter(r => r.status === 'resolved').length,
    highRisk: (requests || []).filter(r => (r as any).safetyScore >= 4).length,
    averageSafetyScore: (requests || []).reduce((sum, r) => sum + ((r as any).safetyScore || 0), 0) / Math.max((requests || []).length, 1),
  };

  // Calculate heatmap stats
  const heatmapStats = {
    totalDataPoints: heatmapData.length,
    topCategory: heatmapData.length > 0 
      ? Object.entries(
          heatmapData.reduce((acc, d) => {
            acc[d.category] = (acc[d.category] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        ).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A'
      : 'N/A'
  };

  const handleAssign = (id: string) => {
    fetch(`http://localhost:4000/api/requests/${id}/assign`, { method: 'POST' })
      .then(async res => {
        if (!res.ok) throw new Error('assign failed');
        const updated = await res.json();
        setRequests(prev => prev.map(r => r.id === id ? updated : r));
        toast.success('Volunteer assigned to request');
      })
      .catch(() => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'assigned' as const } : r));
        toast.success('Volunteer assigned (local)');
      });
  };

  const handleResolve = (id: string) => {
    fetch(`http://localhost:4000/api/requests/${id}/resolve`, { method: 'POST' })
      .then(async res => {
        if (!res.ok) throw new Error('resolve failed');
        const updated = await res.json();
        setRequests(prev => prev.map(r => r.id === id ? updated : r));
        toast.success('Request marked as resolved');
      })
      .catch(() => {
        setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'resolved' as const } : r));
        toast.success('Request marked as resolved (local)');
      });
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

    fetch('http://localhost:4000/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newRequest)
    })
      .then(async res => {
        if (!res.ok) throw new Error('post failed');
        const created = await res.json();
        setRequests(prev => [created, ...prev]);
        toast.success('New request received');
      })
      .catch(() => {
        setRequests(prev => [newRequest, ...prev]);
        toast.success('New request received (local)');
      });
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

  useEffect(() => {
    fetch('http://localhost:4000/api/requests')
      .then(r => r.json())
      .then(data => {
        if (data && data.requests) setRequests(data.requests);
      })
      .catch(() => {});

    fetch('http://localhost:4000/api/resources')
      .then(r => r.json())
      .then(data => {
        if (data && data.resources) {
          // replace seedResources contents in-place so MapView prop updates
          // @ts-ignore
          seedResources.splice(0, seedResources.length, ...data.resources);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-teal-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 pb-20 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(56,189,248,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(14,165,233,0.1),transparent_50%)]" />

      {/* Header */}
      <header className="glass-card mx-4 mt-4 mb-4 sticky top-4 z-40">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between mb-6">
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
              <div>
                <h1 className="text-3xl font-bold text-primary">BridgeAI Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-1">Real-time support network monitoring</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="glass-button">
                <Bell className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="glass-button">
                <Settings className="w-4 h-4" />
              </Button>
              <Button className="glass-button">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>

          {/* Compact Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {/* Critical Cases */}
            <Card className="glass-card border-0 border-l-2 border-l-red-500">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  🚨 Critical
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-red-500">{stats.critical}</div>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${stats.criticalTrend.startsWith('+') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {stats.criticalTrend}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="glass-card border-0 border-l-2 border-l-blue-500">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  ⚡ Response
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-blue-500">{stats.avgResponseTime.toFixed(1)}<span className="text-sm text-muted-foreground ml-0.5">h</span></div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                    {stats.responseTrend}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Active Hotspots */}
            <Card className="glass-card border-0 border-l-2 border-l-orange-500">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  📍 Hotspots
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-orange-500">{stats.hotspots}</div>
                  <span className="text-[10px] text-muted-foreground">
                    areas
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Success Rate */}
            <Card className="glass-card border-0 border-l-2 border-l-green-500">
              <CardHeader className="pb-1 pt-3">
                <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                  ✅ Success
                </CardTitle>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="flex items-baseline gap-2">
                  <div className="text-2xl font-bold text-green-500">{stats.successRate}<span className="text-sm text-muted-foreground ml-0.5">%</span></div>
                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-green-100 text-green-700">
                    {stats.successTrend}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Priority Feed - Compact */}
          <Card className="glass-card border-0 mb-4 border-l-2 border-l-red-500">
            <CardHeader className="pb-2 pt-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                  </span>
                  Priority Cases
                </CardTitle>
                <span className="text-[10px] text-muted-foreground">Live</span>
              </div>
            </CardHeader>
            <CardContent className="pb-3">
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(requests || [])
                  .filter(r => r.status === 'open' && (r as any).safetyScore >= 3)
                  .sort((a, b) => ((b as any).safetyScore || 0) - ((a as any).safetyScore || 0))
                  .slice(0, 5)
                  .map((req) => {
                    const score = (req as any).safetyScore || 0;
                    const scoreColor = score >= 4 ? 'red' : score >= 3 ? 'yellow' : 'green';
                    const pulseColor = score >= 4 ? 'bg-red-500' : 'bg-yellow-500';
                    
                    return (
                      <div 
                        key={req.id} 
                        className={`p-2 rounded border-l-2 ${score >= 4 ? 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20' : 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'} hover:shadow-sm transition-all cursor-pointer`}
                        onClick={() => handleCardClick(req)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-semibold text-xs">{req.name || 'Anonymous'}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${req.tone === 'Distressed' ? 'bg-red-100 text-red-700' : req.tone === 'Anxious' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>
                                {req.tone}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{req.description}</p>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">📍 {req.location.address.split(',')[0]}</span>
                              <span className="text-[10px] text-muted-foreground">• {req.category}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className={`text-lg font-bold ${scoreColor === 'red' ? 'text-red-500' : scoreColor === 'yellow' ? 'text-yellow-600' : 'text-green-500'}`}>
                              {score}<span className="text-[10px] text-muted-foreground">/5</span>
                            </div>
                            <Button 
                              size="sm" 
                              variant={score >= 4 ? "destructive" : "default"}
                              className="text-[10px] h-6 px-2"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAssign(req.id);
                              }}
                            >
                              Dispatch
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                {((requests || []).filter(r => r.status === 'open' && (r as any).safetyScore >= 3).length === 0) && (
                  <div className="text-center py-4 text-muted-foreground">
                    <CheckCircle className="w-8 h-8 mx-auto mb-1 text-green-500" />
                    <p className="text-xs font-medium">All clear!</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Safety Score & Heatmap Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="glass-card border-0 border-l-4 border-l-red-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  🚨 High Risk Cases
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-500">{stats.highRisk}</div>
                <p className="text-xs text-muted-foreground mt-1">Safety Score ≥ 4</p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  📊 Avg Safety Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-500">{stats.averageSafetyScore.toFixed(1)}</div>
                <p className="text-xs text-muted-foreground mt-1">Out of 5.0</p>
              </CardContent>
            </Card>

            <Card 
              className="glass-card border-0 border-l-4 border-l-purple-500 cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => setShowAnalytics(!showAnalytics)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  🗺️ Heatmap Data
                  <span className="text-xs ml-auto">{showAnalytics ? '▼' : '▶'}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-500">{heatmapStats.totalDataPoints}</div>
                <p className="text-xs text-muted-foreground mt-1">Top: {heatmapStats.topCategory}</p>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics (Expandable) */}
          {showAnalytics && (
            <Card className="glass-card border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-lg font-bold">📊 Advanced Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Safety Scores Table */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      🚨 Recent Safety Scores
                    </h3>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {requests.slice(0, 5).map(req => (
                        <div key={req.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                          <div className="flex-1">
                            <p className="text-sm font-medium">{req.name || 'Anonymous'}</p>
                            <p className="text-xs text-muted-foreground">{req.category}</p>
                          </div>
                          <div className={`font-bold text-lg ${(req as any).safetyScore >= 4 ? 'text-red-500' : (req as any).safetyScore >= 3 ? 'text-yellow-500' : 'text-green-500'}`}>
                            {(req as any).safetyScore || 0}/5
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap Breakdown */}
                  <div>
                    <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                      🗺️ Category Distribution
                    </h3>
                    <div className="space-y-2">
                      {Object.entries(
                        heatmapData.reduce((acc, d) => {
                          acc[d.category] = (acc[d.category] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([category, count]) => (
                        <div key={category} className="flex items-center justify-between p-2 bg-background/50 rounded">
                          <span className="text-sm font-medium">{category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-primary" 
                                style={{width: `${(count as number / heatmapData.length) * 100}%`}}
                              />
                            </div>
                            <span className="text-sm font-bold">{count as number}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search requests by description or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-10"
              />
            </div>
            <div className="flex gap-2 items-center">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <FilterBar
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-180px)]">
          {/* Map Column */}
          <div className="h-full min-h-[400px] glass-card p-4 overflow-hidden">
            <MapView3D
              requests={filteredRequests}
              resources={resources}
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
