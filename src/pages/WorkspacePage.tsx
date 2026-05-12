import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Sparkles, ArrowLeft, Trash2, Copy, Download, Image as ImageIcon, Briefcase, Calendar, Clock, FileDown, Edit2, CalendarClock, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import AnalyticsView from '../components/AnalyticsView';
import CalendarView from '../components/CalendarView';
import TemplatesView from '../components/TemplatesView';
import jsPDF from 'jspdf';

interface Workspace {
  id: string;
  name: string;
  industry?: string;
  targetAudience?: string;
  tone?: string;
  ownerId: string;
}

interface SocialContent {
  id: string;
  workspaceId: string;
  platform: string;
  promptContext?: string;
  generatedText: string;
  generatedImageUrl?: string;
  status: string;
  reach?: number;
  engagement?: number;
  scheduledFor?: any;
  recurring?: string | null;
  createdAt: any;
}

export default function WorkspacePage() {
  const { workspaceId } = useParams<{ workspaceId: string }>();
  const navigate = useNavigate();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [contents, setContents] = useState<SocialContent[]>([]);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    platform: 'LinkedIn',
    topic: '',
    generateImage: false,
  });

  const handleSelectPrompt = (prompt: string) => {
    setGenerateForm(prev => ({ ...prev, topic: prompt }));
  };

  const [editingContentId, setEditingContentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');

  const handleEditInit = (content: SocialContent) => {
    setEditingContentId(content.id);
    setEditingText(content.generatedText);
  };

  const handleEditSave = async (contentId: string) => {
    if (!workspaceId) return;
    try {
      const contentRef = doc(db, 'workspaces', workspaceId, 'contents', contentId);
      await updateDoc(contentRef, {
        generatedText: editingText,
        updatedAt: serverTimestamp()
      });
      setContents(prev => prev.map(c => c.id === contentId ? { ...c, generatedText: editingText } : c));
      setEditingContentId(null);
      toast.success('Content updated');
    } catch (error) {
      toast.error('Failed to update content');
    }
  };

  const [schedulingContentId, setSchedulingContentId] = useState<string | null>(null);
  const [scheduleDate, setScheduleDate] = useState<string>('');
  const [recurring, setRecurring] = useState<string>('none');

  const handleSchedule = async (contentId: string) => {
    if (!workspaceId) return;
    try {
      // In a real app we'd trigger a background job. Here we just update the DB status.
      const contentRef = doc(db, 'workspaces', workspaceId, 'contents', contentId);
      const scheduledTime = new Date(scheduleDate);
      await updateDoc(contentRef, {
        status: 'Scheduled',
        scheduledFor: scheduledTime,
        recurring: recurring !== 'none' ? recurring : null,
        updatedAt: serverTimestamp()
      });
      setContents(prev => prev.map(c => c.id === contentId ? { ...c, status: 'Scheduled', scheduledFor: scheduledTime, recurring: recurring !== 'none' ? recurring : null } : c));
      setSchedulingContentId(null);
      setScheduleDate('');
      setRecurring('none');
      toast.success('Content scheduled!');
    } catch (error) {
      toast.error('Failed to schedule content');
    }
  };

  useEffect(() => {
    if (workspaceId) {
      fetchWorkspaceAndContents();
    }
  }, [workspaceId]);

  const fetchWorkspaceAndContents = async () => {
    if (!auth.currentUser || !workspaceId) return;
    try {
      setLoading(true);
      const docRef = doc(db, 'workspaces', workspaceId);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        toast.error('Workspace not found');
        navigate('/');
        return;
      }
      
      if (docSnap.data().ownerId !== auth.currentUser.uid) {
        toast.error('Unauthorized');
        navigate('/');
        return;
      }

      setWorkspace({ id: docSnap.id, ...docSnap.data() } as Workspace);

      // Fetch contents - subcollection
      const contentsRef = collection(db, 'workspaces', workspaceId, 'contents');
      // Just fetch all for this workspace since query on group or large sets isn't optimal without index, but subcollection is fine
      // Note: the rules we set up is on /workspaces/{id}/contents/{cid}
      const q = query(contentsRef);
      const contentsSnap = await getDocs(q);
      const c: SocialContent[] = [];
      contentsSnap.forEach(snapDoc => {
        c.push({ id: snapDoc.id, ...snapDoc.data() } as SocialContent);
      });
      c.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0));
      setContents(c);
      
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to load workspace data');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generateForm.topic.trim()) return toast.error('Please enter a topic');
    if (!workspace) return;

    try {
      setIsGenerating(true);
      
      // We will create a temporary content record for the streaming UI
      const tempId = 'temp-' + Date.now();
      const tempContent: SocialContent = {
        id: tempId,
        workspaceId: workspace.id,
        platform: generateForm.platform,
        promptContext: generateForm.topic,
        generatedText: '',
        status: 'Draft',
        createdAt: { toDate: () => new Date() } as any
      };
      
      setContents(prev => [tempContent, ...prev]);

      const response = await fetch('/api/generateStream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          workspace,
          platform: generateForm.platform,
          topic: generateForm.topic,
          generateImage: generateForm.generateImage
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Generation stream failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let streamedText = '';
      let streamedImageUrl = null;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          for (const line of lines) {
             if (line.startsWith('data: ')) {
               const dataStr = line.replace('data: ', '').trim();
               if (dataStr === '[DONE]') {
                 done = true;
               } else if (dataStr) {
                 try {
                   const parsed = JSON.parse(dataStr);
                   if (parsed.textChunk) {
                     streamedText += parsed.textChunk;
                     setContents(prev => prev.map(c => c.id === tempId ? { ...c, generatedText: streamedText } : c));
                   }
                   if (parsed.imageUrl) {
                     streamedImageUrl = parsed.imageUrl;
                     setContents(prev => prev.map(c => c.id === tempId ? { ...c, generatedImageUrl: streamedImageUrl } : c));
                   }
                   if (parsed.error) {
                     throw new Error(parsed.error);
                   }
                 } catch (e) {
                   // ignore parse errors for partial chunks
                 }
               }
             }
          }
        }
      }

      // Save to Firestore after stream completes
      const simulatedReach = Math.floor(Math.random() * 5000) + 500;
      const simulatedEngagement = Math.floor(simulatedReach * (Math.random() * 0.1 + 0.05));
      
      const newDocRef = await addDoc(collection(db, 'workspaces', workspace.id, 'contents'), {
        workspaceId: workspace.id,
        platform: generateForm.platform,
        promptContext: generateForm.topic,
        generatedText: streamedText,
        generatedImageUrl: streamedImageUrl || null,
        status: 'Draft',
        reach: simulatedReach,
        engagement: simulatedEngagement,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // replace temp with actual
      setContents(prev => prev.map(c => c.id === tempId ? { ...c, id: newDocRef.id, reach: simulatedReach, engagement: simulatedEngagement } : c));

      toast.success('Content generated!');
      setGenerateForm({ ...generateForm, topic: '' }); 
      
    } catch (error: any) {
      console.error(error);
      setContents(prev => prev.filter(c => !c.id.startsWith('temp-')));
      toast.error('Failed to generate content: ' + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDelete = async (contentId: string) => {
    if (!workspaceId) return;
    try {
      await deleteDoc(doc(db, 'workspaces', workspaceId, 'contents', contentId));
      setContents(prev => prev.filter(c => c.id !== contentId));
      toast.success('Content deleted');
    } catch (error) {
      toast.error('Failed to delete content');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const exportAsJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(contents, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${workspace?.name || 'workspace'}_export.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportAsMarkdown = () => {
    let md = `# ${workspace?.name} Content Library\n\n`;
    contents.forEach(c => {
      md += `## [${c.platform}] ${c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleDateString() : ''}\n\n`;
      md += `${c.generatedText}\n\n---\n\n`;
    });
    
    const dataStr = "data:text/markdown;charset=utf-8," + encodeURIComponent(md);
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${workspace?.name || 'workspace'}_export.md`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const exportAsPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    
    doc.setFontSize(20);
    doc.text(`${workspace?.name} Content Library`, 10, y);
    y += 15;
    
    doc.setFontSize(12);
    
    contents.forEach((c, index) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      
      const dateStr = c.createdAt?.toDate ? new Date(c.createdAt.toDate()).toLocaleDateString() : '';
      doc.setFont(undefined, 'bold');
      doc.text(`[${c.platform}] - ${dateStr}`, 10, y);
      y += 8;
      
      doc.setFont(undefined, 'normal');
      const textLines = doc.splitTextToSize(c.generatedText, 180);
      doc.text(textLines, 10, y);
      
      y += (textLines.length * 6) + 10;
    });
    
    doc.save(`${workspace?.name || 'workspace'}_export.pdf`);
  };

  if (loading) {
    return (
      <div className="w-full flex flex-col gap-4 pt-4 h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mt-2 mb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded bg-neutral-200 dark:bg-neutral-800" />
            <Skeleton className="h-7 w-48 rounded-md bg-neutral-200 dark:bg-neutral-800" />
          </div>
        </div>
        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-800 pb-2">
           <Skeleton className="h-10 w-96 rounded-md bg-neutral-200 dark:bg-neutral-800" />
           <Skeleton className="h-8 w-24 rounded-md bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="flex-1 flex flex-col lg:flex-row gap-6 mt-4 opacity-50">
           <div className="w-full lg:w-1/3 flex flex-col gap-4">
             <div className="h-96 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 flex flex-col gap-4">
                <Skeleton className="h-6 w-40 rounded-md bg-neutral-200 dark:bg-neutral-800" />
                <Skeleton className="h-4 w-full rounded-md bg-neutral-200 dark:bg-neutral-800 mt-2" />
                <Skeleton className="h-10 w-full rounded-md bg-neutral-200 dark:bg-neutral-800 mt-4" />
                <Skeleton className="h-24 w-full rounded-md bg-neutral-200 dark:bg-neutral-800 mt-2" />
                <Skeleton className="h-10 w-full rounded-md bg-neutral-200 dark:bg-neutral-800 mt-4" />
             </div>
           </div>
           <div className="w-full lg:w-2/3 flex flex-col gap-4">
             <div className="flex justify-between">
                <Skeleton className="h-6 w-32 rounded-md bg-neutral-200 dark:bg-neutral-800" />
             </div>
             {[1,2,3].map(i => (
                <div key={i} className="h-32 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 p-4 flex flex-col gap-3">
                   <Skeleton className="h-5 w-48 rounded-md bg-neutral-200 dark:bg-neutral-800" />
                   <Skeleton className="h-4 w-full rounded-md bg-neutral-200 dark:bg-neutral-800 mt-2" />
                   <Skeleton className="h-4 w-2/3 rounded-md bg-neutral-200 dark:bg-neutral-800" />
                </div>
             ))}
           </div>
        </div>
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="w-full flex flex-col gap-4 pt-4 h-[calc(100vh-100px)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="h-8 w-8 text-neutral-400 hover:text-white">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-semibold">{workspace.name}</h2>
        </div>
      </div>
      
      <Tabs defaultValue="generator" className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center border-b border-neutral-800 pb-2">
          <TabsList className="bg-neutral-900 border border-neutral-800">
            <TabsTrigger value="generator" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">Generator & Library</TabsTrigger>
            <TabsTrigger value="calendar" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">Calendar</TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">Analytics</TabsTrigger>
            <TabsTrigger value="templates" className="data-[state=active]:bg-neutral-800 data-[state=active]:text-white">Templates</TabsTrigger>
          </TabsList>

          <DropdownMenu>
            <DropdownMenuTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-neutral-800 bg-neutral-900 shadow-sm hover:bg-neutral-800 hover:text-neutral-50 h-8 px-3 gap-2">
              <FileDown className="h-4 w-4" />
              <span className="sr-only sm:not-sr-only">Export</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-neutral-900 border-neutral-800 text-neutral-200">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Export Content</DropdownMenuLabel>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem onClick={exportAsPDF} className="cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800">
                Export to PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsMarkdown} className="cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800">
                Export to Markdown
              </DropdownMenuItem>
              <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer hover:bg-neutral-800 focus:bg-neutral-800">
                Export to JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <TabsContent value="generator" className="flex-1 flex flex-col lg:flex-row gap-6 mt-4 overflow-hidden outline-none h-full m-0 p-0">
          {/* Left Sidebar - Generator */}
          <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-hidden">
            <Card className="bg-neutral-900 border-neutral-800 flex-1 overflow-y-auto hidden-scrollbar">
          <CardHeader>
            <CardTitle className="text-neutral-100 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Generate Content
            </CardTitle>
            <CardDescription className="text-neutral-400">
              Create AI-powered posts tailored to {workspace.name}'s brand identity.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div className="space-y-2">
                <Label className="text-neutral-200">Platform</Label>
                <Select value={generateForm.platform} onValueChange={(v) => setGenerateForm({...generateForm, platform: v})}>
                  <SelectTrigger className="bg-neutral-950 border-neutral-800 text-neutral-200">
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-950 border-neutral-800 text-neutral-200">
                    <SelectItem value="LinkedIn" className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">LinkedIn Post</SelectItem>
                    <SelectItem value="Twitter" className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">Twitter/X Thread</SelectItem>
                    <SelectItem value="Instagram" className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">Instagram Caption</SelectItem>
                    <SelectItem value="Shorts" className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">Short Video Script</SelectItem>
                    <SelectItem value="Campaign" className="hover:bg-neutral-800 focus:bg-neutral-800 cursor-pointer">Campaign Ideas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-neutral-200">Topic / Instructions</Label>
                <Textarea 
                  placeholder="e.g., Announcing our new AI features to enterprise clients..."
                  className="bg-neutral-950 border-neutral-800 min-h-[120px] resize-none text-neutral-200"
                  value={generateForm.topic}
                  onChange={(e) => setGenerateForm({...generateForm, topic: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input 
                  type="checkbox" 
                  id="genImage" 
                  checked={generateForm.generateImage}
                  onChange={(e) => setGenerateForm({...generateForm, generateImage: e.target.checked})}
                  className="rounded border-neutral-800 bg-neutral-950 text-neutral-100 accent-white h-4 w-4"
                />
                <Label htmlFor="genImage" className="text-neutral-300 font-normal cursor-pointer flex items-center gap-2">
                  <ImageIcon className="h-4 w-4 text-neutral-500" />
                  Also generate accompanying image (slower)
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-white text-black hover:bg-neutral-200 mt-4 h-11"
                disabled={isGenerating}
              >
                {isGenerating ? (
                   <><div className="h-4 w-4 rounded-full border-2 border-neutral-900 border-t-transparent animate-spin mr-2" /> Generating...</>
                ) : 'Generate Now'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Content Area - History */}
      <div className="w-full lg:w-2/3 flex flex-col gap-4 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-lg font-medium text-neutral-200">Content Library</h3>
           <div className="text-sm text-neutral-500">{contents.length} items</div>
        </div>

        <div className="flex-1 overflow-y-auto hidden-scrollbar space-y-4 pb-12">
          {contents.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-neutral-500 bg-neutral-900/30 rounded-xl border border-neutral-800/50">
              <Sparkles className="h-8 w-8 mb-4 opacity-50" />
              <p>No content generated yet in this workspace.</p>
            </div>
          ) : (
            contents.map(content => (
              <Card key={content.id} className="bg-neutral-900 border-neutral-800 flex flex-col">
                <CardHeader className="pb-3 flex flex-row items-start justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-neutral-800 text-neutral-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {content.platform}
                      </span>
                      {content.status === 'Scheduled' && (
                        <span className="bg-blue-900/50 text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-medium border border-blue-900">
                          Scheduled: {content.scheduledFor?.toDate ? new Date(content.scheduledFor.toDate()).toLocaleString() : ''}
                        </span>
                      )}
                      <span className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                         {content.createdAt?.toDate ? new Date(content.createdAt.toDate()).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-white" onClick={() => copyToClipboard(content.generatedText)} title="Copy">
                      <Copy className="h-4 w-4" />
                    </Button>
                    {editingContentId !== content.id && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-blue-400" onClick={() => handleEditInit(content)} title="Edit">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                    )}
                    {schedulingContentId !== content.id && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-green-400" onClick={() => setSchedulingContentId(content.id)} title="Schedule">
                        <CalendarClock className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-400 hover:text-red-400" onClick={() => handleDelete(content.id)} title="Delete">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-neutral-300 pb-4">
                   {schedulingContentId === content.id && (
                       <div className="mb-4 bg-neutral-950 p-3 rounded-lg border border-neutral-800 flex flex-col gap-3">
                         <div className="flex gap-2 items-end">
                           <div className="flex-1 space-y-1">
                             <Label className="text-xs text-neutral-400">Schedule Date & Time</Label>
                             <Input 
                               type="datetime-local" 
                               value={scheduleDate} 
                               onChange={(e) => setScheduleDate(e.target.value)}
                               className="bg-neutral-900 border-neutral-800 text-sm h-8"
                             />
                           </div>
                           <div className="flex-1 space-y-1">
                             <Label className="text-xs text-neutral-400">Recurring</Label>
                             <Select value={recurring} onValueChange={setRecurring}>
                               <SelectTrigger className="h-8 bg-neutral-900 border-neutral-800 text-sm w-full">
                                 <SelectValue placeholder="None" />
                               </SelectTrigger>
                               <SelectContent className="bg-neutral-900 border-neutral-800 text-neutral-200">
                                 <SelectItem value="none">Does not repeat</SelectItem>
                                 <SelectItem value="daily">Daily</SelectItem>
                                 <SelectItem value="weekly">Weekly</SelectItem>
                                 <SelectItem value="monthly">Monthly</SelectItem>
                               </SelectContent>
                             </Select>
                           </div>
                         </div>
                         <div className="flex items-center justify-end gap-2">
                           <Button variant="ghost" size="sm" onClick={() => setSchedulingContentId(null)} className="h-8 text-neutral-400">Cancel</Button>
                           <Button size="sm" onClick={() => handleSchedule(content.id)} className="h-8 bg-green-600 hover:bg-green-700 text-white">Schedule Post</Button>
                         </div>
                       </div>
                   )}

                   {editingContentId === content.id ? (
                      <div className="space-y-3">
                        <Textarea 
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="bg-neutral-950 border-neutral-800 min-h-[150px] font-sans"
                        />
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => setEditingContentId(null)} className="border-neutral-800 bg-neutral-900 text-neutral-300">Cancel</Button>
                          <Button size="sm" onClick={() => handleEditSave(content.id)} className="bg-white text-black hover:bg-neutral-200">Save Changes</Button>
                        </div>
                      </div>
                   ) : (
                      <div className="whitespace-pre-wrap break-words mt-1">{content.generatedText}</div>
                   )}
                   
                   {content.generatedImageUrl && (
                     <div className="mt-4 rounded-lg overflow-hidden border border-neutral-800 max-w-sm">
                       <img src={content.generatedImageUrl} alt="Generated" className="w-full h-auto" loading="lazy" />
                     </div>
                   )}
                </CardContent>
              </Card>
            ))
          )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="flex-1 overflow-y-auto hidden-scrollbar mt-4">
          <CalendarView contents={contents} />
        </TabsContent>

        <TabsContent value="analytics" className="flex-1 overflow-y-auto hidden-scrollbar mt-4">
          <AnalyticsView contents={contents} />
        </TabsContent>

        <TabsContent value="templates" className="flex-1 overflow-y-auto hidden-scrollbar mt-4">
          <TemplatesView onSelectPrompt={handleSelectPrompt} workspaceId={workspaceId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
