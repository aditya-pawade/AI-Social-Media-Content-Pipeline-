import { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Calendar } from './ui/calendar';
import { format, isSameDay } from 'date-fns';

interface CalendarViewProps {
  contents: any[];
}

export default function CalendarView({ contents }: CalendarViewProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const scheduledContents = contents.filter(c => c.status === 'Scheduled' && c.scheduledFor);
  
  const contentsForDate = scheduledContents.filter(c => {
     if (!date) return false;
     const contentDate = c.scheduledFor?.toDate ? c.scheduledFor.toDate() : null;
     if (!contentDate) return false;
     return isSameDay(contentDate, date);
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
      <Card className="bg-neutral-900 border-neutral-800">
        <CardContent className="p-6">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md border border-neutral-800/50 p-3 mx-auto flex justify-center bg-neutral-950/50"
            modifiers={{
              hasPost: (d: Date) => scheduledContents.some(c => c.scheduledFor?.toDate && isSameDay(c.scheduledFor.toDate(), d))
            }}
            modifiersClassNames={{
              hasPost: "bg-blue-900/30 text-blue-400 font-bold border border-blue-900/50"
            }}
          />
        </CardContent>
      </Card>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-800">
          <h3 className="text-lg font-medium text-neutral-200">
            {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
          </h3>
          <span className="text-sm font-medium text-neutral-500">{contentsForDate.length} posts</span>
        </div>
        
        <div className="space-y-3">
          {contentsForDate.length === 0 ? (
             <div className="text-center py-12 text-neutral-500 bg-neutral-900/20 rounded-xl border border-neutral-800/30 border-dashed">
               No posts scheduled for this date.
             </div>
          ) : (
            contentsForDate.map(content => (
              <Card key={content.id} className="bg-neutral-900 border-neutral-800">
                <CardContent className="p-4 flex gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                       <span className="bg-neutral-800 text-neutral-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                        {content.platform}
                      </span>
                      <span className="text-xs text-neutral-400">
                        {content.scheduledFor?.toDate && format(content.scheduledFor.toDate(), 'h:mm a')}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-300 line-clamp-3">
                       {content.generatedText}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
