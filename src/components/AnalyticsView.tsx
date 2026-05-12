import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Activity, Users, Eye, TrendingUp } from 'lucide-react';

interface AnalyticsViewProps {
  contents: any[];
}

export default function AnalyticsView({ contents }: AnalyticsViewProps) {
  const stats = useMemo(() => {
    let totalViews = 0;
    let totalEngagement = 0;
    const platformCount: Record<string, number> = {};

    contents.forEach(c => {
      // If we had real data, we'd add c.reach and c.engagement here
      totalViews += c.reach || 0;
      totalEngagement += c.engagement || 0;
      
      platformCount[c.platform] = (platformCount[c.platform] || 0) + 1;
    });

    return {
      totalViews,
      totalEngagement,
      growth: '+0%', // In a real app, calculate from previous period
      topPlatform: platformCount
    };
  }, [contents]);

  const topPlatformName = Object.entries(stats.topPlatform).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A';

  const chartData = useMemo(() => {
    // Show last 7 days of activity
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    
    // Initialize last 7 days
    const dataMap: Record<string, { name: string, posts: number, reach: number, engagement: number, fullDate: string }> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dateString = d.toISOString().split('T')[0];
      dataMap[dateString] = { name: dayName, posts: 0, reach: 0, engagement: 0, fullDate: dateString };
    }

    // Populate data
    contents.forEach(c => {
      if (c.createdAt?.toDate) {
        const dateString = new Date(c.createdAt.toDate()).toISOString().split('T')[0];
        if (dataMap[dateString]) {
          dataMap[dateString].posts += 1;
          dataMap[dateString].reach += c.reach || 0;
          dataMap[dateString].engagement += c.engagement || 0;
        }
      }
    });

    return Object.values(dataMap);
  }, [contents]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400">Total Reach</p>
                <h3 className="text-2xl font-bold text-neutral-100">{stats.totalViews.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-900/30 flex items-center justify-center border border-blue-900">
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-neutral-500">Live data</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400">Total Engagement</p>
                <h3 className="text-2xl font-bold text-neutral-100">{stats.totalEngagement.toLocaleString()}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-900/30 flex items-center justify-center border border-purple-900">
                <Activity className="h-5 w-5 text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-neutral-500">Live data</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400">Posts Generated</p>
                <h3 className="text-2xl font-bold text-neutral-100">{contents.length}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-900/30 flex items-center justify-center border border-green-900">
                <Users className="h-5 w-5 text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-neutral-400 font-medium">Active Library</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
          <CardContent className="p-6">
             <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-400">Top Platform</p>
                <h3 className="text-2xl font-bold text-neutral-100">{topPlatformName}</h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-orange-900/30 flex items-center justify-center border border-orange-900">
                <TrendingUp className="h-5 w-5 text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-neutral-400 font-medium">Most active channel</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="bg-neutral-900 border-neutral-800">
          <CardHeader>
            <CardTitle className="text-neutral-200">Content Generation Output</CardTitle>
            <CardDescription className="text-neutral-500">Posts generated over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#525252" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Bar dataKey="posts" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
           <CardHeader>
            <CardTitle className="text-neutral-200">Engagement & Reach Trend</CardTitle>
            <CardDescription className="text-neutral-500">Combined data over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#525252" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Line type="monotone" dataKey="engagement" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Engagement" />
                <Line type="monotone" dataKey="reach" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} activeDot={{ r: 6 }} name="Reach" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
