import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';
import { Activity, Users, Eye, TrendingUp } from 'lucide-react';

interface AnalyticsViewProps {
  contents: any[];
}

export default function AnalyticsView({ contents }: AnalyticsViewProps) {
  const stats = useMemo(() => {
    // Generate some mock stats based on content count since we don't have real engagement
    // In a real app this would come from a social media API
    const baseViews = contents.length * 1500;
    const baseEngagement = contents.length * 120;
    return {
      totalViews: baseViews + Math.floor(Math.random() * 500),
      totalEngagement: baseEngagement + Math.floor(Math.random() * 100),
      growth: '+12.5%',
      topPlatform: contents.reduce((acc, curr) => {
        acc[curr.platform] = (acc[curr.platform] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }, [contents]);

  const topPlatformName = Object.entries(stats.topPlatform).sort((a, b) => (b[1] as number) - (a[1] as number))[0]?.[0] || 'N/A';

  const chartData = useMemo(() => {
    return [
      { name: 'Mon', views: 4000, engagement: 240 },
      { name: 'Tue', views: 3000, engagement: 139 },
      { name: 'Wed', views: 2000, engagement: 980 },
      { name: 'Thu', views: 2780, engagement: 390 },
      { name: 'Fri', views: 1890, engagement: 480 },
      { name: 'Sat', views: 2390, engagement: 380 },
      { name: 'Sun', views: 3490, engagement: 430 },
    ];
  }, []);

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
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400 font-medium">{stats.growth}</span>
              <span className="text-neutral-500 ml-2">vs last week</span>
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
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400 font-medium">+8.2%</span>
              <span className="text-neutral-500 ml-2">vs last week</span>
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
            <CardTitle className="text-neutral-200">Reach & Views Overview</CardTitle>
            <CardDescription className="text-neutral-500">Daily views across all scheduled posts</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#525252" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Bar dataKey="views" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-neutral-900 border-neutral-800">
           <CardHeader>
            <CardTitle className="text-neutral-200">Engagement Trend</CardTitle>
            <CardDescription className="text-neutral-500">Likes, comments and shares over time</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="name" stroke="#525252" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#525252" tick={{fill: '#a3a3a3'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Line type="monotone" dataKey="engagement" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', strokeWidth: 2 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
