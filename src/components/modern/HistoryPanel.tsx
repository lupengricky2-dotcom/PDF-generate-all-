import React from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Clock, Plus, MoreHorizontal } from 'lucide-react';
import { PRDSession } from '../PRDGeneratorModern';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  sessions: PRDSession[];
  currentSession: PRDSession | null;
  onSelectSession: (session: PRDSession) => void;
  onNewSession: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({
  sessions,
  currentSession,
  onSelectSession,
  onNewSession
}) => {
  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}小时前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}天前`;
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  const getStatusColor = (status: PRDSession['status']) => {
    switch (status) {
      case 'completed': return 'status-success';
      case 'exported': return 'status-info';
      default: return 'status-warning';
    }
  };

  const getStatusText = (status: PRDSession['status']) => {
    switch (status) {
      case 'completed': return '已完成';
      case 'exported': return '已导出';
      default: return '草稿';
    }
  };

  return (
    <div className="card-modern h-fit">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">项目历史</h3>
          </div>
          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
            {sessions.length}
          </span>
        </div>
        
        <Button 
          onClick={onNewSession}
          variant="outline"
          size="sm"
          className="w-full justify-start gap-2"
        >
          <Plus className="w-4 h-4" />
          新建PRD项目
        </Button>
      </div>

      {/* Sessions List */}
      <ScrollArea className="max-h-[calc(100vh-300px)]">
        <div className="p-2 space-y-1">
          {sessions.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session)}
              className={cn(
                "w-full text-left p-3 rounded-lg transition-all duration-200 group hover:bg-accent animate-scale-in",
                currentSession?.id === session.id && "bg-primary/10 border border-primary/20"
              )}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <FileText className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                  <h4 className="font-medium text-sm truncate">
                    {session.title}
                  </h4>
                </div>
                <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded">
                  <MoreHorizontal className="w-3 h-3" />
                </button>
              </div>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${getStatusColor(session.status)}`} />
                  <span>{getStatusText(session.status)}</span>
                </div>
                <span>{formatRelativeTime(session.updatedAt)}</span>
              </div>
              
              {session.messages.length > 0 && (
                <div className="mt-2 text-xs text-muted-foreground">
                  {Math.floor(session.messages.length / 2)}轮对话
                </div>
              )}
            </button>
          ))}
          
          {sessions.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
              <p className="text-sm text-muted-foreground">暂无项目历史</p>
              <p className="text-xs text-muted-foreground mt-1">创建您的第一个PRD项目</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};