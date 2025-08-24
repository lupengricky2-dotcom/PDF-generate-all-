import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Clock } from 'lucide-react';
import { PRDSession } from '../PRDGeneratorApple';
import { cn } from '@/lib/utils';

interface AppleSidebarProps {
  isOpen: boolean;
  sessions: PRDSession[];
  currentSession: PRDSession | null;
  onSelectSession: (session: PRDSession) => void;
  onNewSession: () => void;
}

export const AppleSidebar: React.FC<AppleSidebarProps> = ({
  isOpen,
  sessions,
  currentSession,
  onSelectSession,
  onNewSession
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '刚刚';
    if (diffInMinutes < 60) return `${diffInMinutes}分钟前`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}小时前`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '昨天';
    if (diffInDays < 7) return `${diffInDays}天前`;
    
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => {}}
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:relative top-16 lg:top-0 left-0 h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] w-80 bg-white border-r border-apple-border z-50 transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-apple-border">
            <div className="flex items-center gap-2 text-apple-gray">
              <Clock className="w-4 h-4" />
              <span className="text-sm font-medium">最近项目</span>
              <span className="text-xs bg-apple-light-gray px-2 py-1 rounded-full ml-auto">
                {sessions.length}
              </span>
            </div>
          </div>

          {/* Sessions List */}
          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {sessions.map((session) => (
                <button
                  key={session.id}
                  onClick={() => onSelectSession(session)}
                  className={cn(
                    "w-full text-left p-4 rounded-xl transition-all duration-200 apple-fade-in hover:bg-apple-light-gray group",
                    currentSession?.id === session.id && "bg-apple-blue/10 border border-apple-blue/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-apple-light-gray rounded-lg flex items-center justify-center group-hover:bg-white transition-colors">
                      <FileText className="w-4 h-4 text-apple-gray" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm text-foreground truncate mb-1">
                        {session.title}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-apple-gray">
                        <div className={`w-1.5 h-1.5 rounded-full ${
                          session.status === 'completed' ? 'bg-green-500' :
                          session.status === 'exported' ? 'bg-blue-500' : 
                          'bg-yellow-500'
                        }`} />
                        <span>{formatTime(session.updatedAt)}</span>
                        {session.messages.length > 0 && (
                          <>
                            <span>•</span>
                            <span>{Math.floor(session.messages.length / 2)}轮</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              
              {sessions.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-apple-light-gray rounded-xl flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-apple-gray" />
                  </div>
                  <p className="text-sm text-apple-gray">暂无项目</p>
                  <p className="text-xs text-apple-gray mt-1">创建您的第一个PRD</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </aside>
    </>
  );
};