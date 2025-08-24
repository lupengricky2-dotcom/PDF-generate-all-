import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Plus, FileText, Clock } from 'lucide-react';
import { PRDSession } from './PRDGenerator';
import { cn } from '@/lib/utils';

interface SidebarProps {
  sessions: PRDSession[];
  currentSession: PRDSession | null;
  onSelectSession: (session: PRDSession) => void;
  onNewSession: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSession,
  onSelectSession,
  onNewSession
}) => {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return '今天';
    } else if (diffInHours < 48) {
      return '昨天';
    } else {
      return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="w-80 border-r border-border bg-card flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <Button 
          onClick={onNewSession}
          variant="prd"
          className="w-full justify-start gap-3 h-12"
        >
          <Plus className="h-5 w-5" />
          新建PRD生成
        </Button>
      </div>

      {/* History */}
      <div className="flex-1 flex flex-col">
        <div className="p-4 pb-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            历史记录
          </div>
        </div>

        <ScrollArea className="flex-1 px-2">
          <div className="space-y-1 pb-4">
            {sessions.map((session) => (
              <button
                key={session.id}
                onClick={() => onSelectSession(session)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-all duration-200 group hover:bg-accent",
                  currentSession?.id === session.id && "bg-accent border border-accent-foreground/10"
                )}
              >
                <div className="flex items-start gap-3">
                  <FileText className="h-4 w-4 mt-0.5 text-muted-foreground group-hover:text-accent-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-foreground truncate">
                      {session.title}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      {formatDate(session.updatedAt)} • {session.messages.length / 2}轮对话
                    </div>
                  </div>
                </div>
              </button>
            ))}
            
            {sessions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">暂无历史记录</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};