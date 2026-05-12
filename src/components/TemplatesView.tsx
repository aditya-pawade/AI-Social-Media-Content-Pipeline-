import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Trash2, Plus, Copy } from 'lucide-react';
import { toast } from 'sonner';

interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
}

interface TemplatesViewProps {
  onSelectPrompt: (prompt: string) => void;
  workspaceId: string;
}

export default function TemplatesView({ onSelectPrompt, workspaceId }: TemplatesViewProps) {
  const [templates, setTemplates] = useState<PromptTemplate[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', prompt: '' });

  useEffect(() => {
    // Load templates from localStorage keyed by workspace
    const saved = localStorage.getItem(`templates_${workspaceId}`);
    if (saved) {
      try {
        setTemplates(JSON.parse(saved));
      } catch(e) {}
    } else {
      // Default templates
      const defaults = [
        { id: '1', name: 'Product Launch', prompt: 'Write an exciting announcement for our new product launch. Emphasize the key benefits and include a clear call-to-action to visit our website.' },
        { id: '2', name: 'Weekly Tip', prompt: 'Share a valuable tip or insight related to our industry. Keep it educational, concise, and encourage followers to share their own experiences in the comments.' },
        { id: '3', name: 'Behind the Scenes', prompt: 'Draft a post that gives an authentic behind-the-scenes look at our company culture or daily operations. Focus on humanizing the brand.' }
      ];
      setTemplates(defaults);
      localStorage.setItem(`templates_${workspaceId}`, JSON.stringify(defaults));
    }
  }, [workspaceId]);

  const saveTemplates = (newTemplates: PromptTemplate[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(`templates_${workspaceId}`, JSON.stringify(newTemplates));
  };

  const handleAdd = () => {
    if (!newTemplate.name || !newTemplate.prompt) {
      toast.error('Both name and prompt are required');
      return;
    }
    const added = [...templates, { id: Date.now().toString(), ...newTemplate }];
    saveTemplates(added);
    setNewTemplate({ name: '', prompt: '' });
    setIsAdding(false);
    toast.success('Template saved');
  };

  const handleDelete = (id: string) => {
    const kept = templates.filter(t => t.id !== id);
    saveTemplates(kept);
    toast.success('Template deleted');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-neutral-200">Re-usable Prompt Templates</h2>
          <p className="text-sm text-neutral-500">Save common prompt instructions for quick access.</p>
        </div>
        <Button onClick={() => setIsAdding(!isAdding)} className="bg-white text-black hover:bg-neutral-200" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {isAdding && (
         <Card className="bg-neutral-900 border-neutral-800">
           <CardContent className="p-4 space-y-4">
             <div className="space-y-2">
               <Label className="text-neutral-300">Template Title</Label>
               <Input 
                 placeholder="e.g. Weekly Update" 
                 value={newTemplate.name}
                 onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
                 className="bg-neutral-950 border-neutral-800 text-neutral-200"
               />
             </div>
             <div className="space-y-2">
               <Label className="text-neutral-300">Prompt Instructions</Label>
               <Textarea 
                 placeholder="Type your prompt here..." 
                 value={newTemplate.prompt}
                 onChange={e => setNewTemplate({...newTemplate, prompt: e.target.value})}
                 className="bg-neutral-950 border-neutral-800 min-h-[100px] text-neutral-200"
               />
             </div>
             <div className="flex justify-end gap-2 pt-2">
               <Button onClick={() => setIsAdding(false)} variant="ghost" size="sm" className="text-neutral-400 hover:text-white">Cancel</Button>
               <Button onClick={handleAdd} size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">Save Template</Button>
             </div>
           </CardContent>
         </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map(t => (
          <Card key={t.id} className="bg-neutral-900 border-neutral-800 flex flex-col group relative overflow-hidden transition-all hover:bg-neutral-800/50">
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-base text-neutral-200 flex items-center justify-between">
                {t.name}
                <Button 
                  onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }} 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-neutral-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between gap-4">
               <p className="text-sm text-neutral-500 line-clamp-4">{t.prompt}</p>
               <Button 
                 onClick={() => { onSelectPrompt(t.prompt); toast.success("Prompt loaded into editor"); }} 
                 variant="outline" 
                 size="sm" 
                 className="w-full bg-transparent border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white"
               >
                 <Copy className="h-3 w-3 mr-2" />
                 Use Template
               </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
