import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Briefcase, Plus, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';

interface Workspace {
  id: string;
  name: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
  createdAt: any;
}

export default function DashboardPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    targetAudience: '',
    tone: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    fetchWorkspaces();
  }, []);

  const fetchWorkspaces = async () => {
    if (!auth.currentUser) return;
    try {
      const q = query(
        collection(db, 'workspaces'), 
        where('ownerId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      const w: Workspace[] = [];
      querySnapshot.forEach((doc) => {
        w.push({ id: doc.id, ...doc.data() } as Workspace);
      });
      // Sort by creation locally since we don't have indexes set up
      w.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setWorkspaces(w);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load workspaces');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) return;
    if (!formData.name.trim()) return toast.error('Name is required');

    try {
      setIsCreating(true);
      const docRef = await addDoc(collection(db, 'workspaces'), {
        name: formData.name,
        industry: formData.industry,
        targetAudience: formData.targetAudience,
        tone: formData.tone,
        ownerId: auth.currentUser.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success('Workspace created');
      setIsDialogOpen(false);
      setFormData({ name: '', industry: '', targetAudience: '', tone: '' });
      navigate(`/workspace/${docRef.id}`);
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to create workspace');
    } finally {
      setIsCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <Skeleton className="h-9 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg mb-2" />
            <Skeleton className="h-5 w-64 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
          </div>
          <Skeleton className="h-9 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-32 border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 rounded-xl p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-6 w-6 rounded bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-6 w-32 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-48 bg-neutral-200 dark:bg-neutral-800 rounded-lg mt-2" />
              <Skeleton className="h-4 w-40 bg-neutral-200 dark:bg-neutral-800 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Workspaces</h1>
          <p className="text-neutral-400 mt-1">Manage your brand profiles and projects</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-white text-black hover:bg-neutral-200 h-9 px-4 py-2">
            <Plus className="h-4 w-4 mr-2" />
            New Workspace
          </DialogTrigger>
          <DialogContent className="bg-neutral-900 border-neutral-800 text-neutral-100 sm:max-w-[425px]">
            <form onSubmit={handleCreateWorkspace}>
              <DialogHeader>
                <DialogTitle>Create Workspace</DialogTitle>
                <DialogDescription className="text-neutral-400">
                  Add details about the brand or project to provide context for AI generation.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="text-neutral-200">Brand Name *</Label>
                  <Input 
                    id="name" 
                    placeholder="Acme Corp" 
                    className="bg-neutral-950 border-neutral-800"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="industry" className="text-neutral-200">Industry</Label>
                  <Input 
                    id="industry" 
                    placeholder="e.g. SaaS, E-commerce, Fitness" 
                    className="bg-neutral-950 border-neutral-800"
                    value={formData.industry}
                    onChange={(e) => setFormData({...formData, industry: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="targetAudience" className="text-neutral-200">Target Audience</Label>
                  <Input 
                    id="targetAudience" 
                    placeholder="e.g. Marketing professionals, Gen Z, Tech Enthusiasts" 
                    className="bg-neutral-950 border-neutral-800"
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({...formData, targetAudience: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tone" className="text-neutral-200">Brand Tone</Label>
                  <Input 
                    id="tone" 
                    placeholder="e.g. Professional, Playful, Authoritative" 
                    className="bg-neutral-950 border-neutral-800"
                    value={formData.tone}
                    onChange={(e) => setFormData({...formData, tone: e.target.value})}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="bg-white text-black hover:bg-neutral-200" disabled={isCreating}>
                  {isCreating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Create Workspace
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {workspaces.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl border border-dashed border-neutral-800 bg-neutral-900/20">
          <div className="h-12 w-12 rounded-full bg-neutral-900 flex items-center justify-center mb-4">
            <Briefcase className="h-6 w-6 text-neutral-400" />
          </div>
          <h3 className="text-lg font-medium text-neutral-200">No workspaces yet</h3>
          <p className="text-sm text-neutral-500 mt-2 max-w-sm mb-6">Create a workspace to start generating tailored social media content for your brand.</p>
          <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="border-neutral-700 bg-neutral-800 text-neutral-200 hover:bg-neutral-700 hover:text-white">
            Create your first workspace
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workspaces.map(workspace => (
            <Link key={workspace.id} to={`/workspace/${workspace.id}`}>
              <Card className="bg-neutral-900 border-neutral-800 hover:bg-neutral-800/80 transition-colors cursor-pointer h-full flex flex-col group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight className="h-4 w-4 text-neutral-400" />
                </div>
                <CardHeader>
                  <CardTitle className="text-neutral-100 flex items-center gap-2">
                    <div className="h-6 w-6 rounded bg-neutral-800 flex items-center justify-center text-xs text-neutral-400 uppercase">
                      {workspace.name.charAt(0)}
                    </div>
                    <span className="truncate">{workspace.name}</span>
                  </CardTitle>
                  <CardDescription className="text-neutral-500">
                    {workspace.industry || 'No industry set'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1 text-sm text-neutral-400">
                  <div className="space-y-2 line-clamp-3">
                    {workspace.targetAudience && (
                      <p><span className="text-neutral-600">Audience:</span> {workspace.targetAudience}</p>
                    )}
                    {workspace.tone && (
                      <p><span className="text-neutral-600">Tone:</span> {workspace.tone}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
