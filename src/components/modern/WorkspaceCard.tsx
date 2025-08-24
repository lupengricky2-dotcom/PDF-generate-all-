import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, User, Bot, Loader2, Clock, MessageSquare } from 'lucide-react';
import { PRDSession, ChatMessage } from '../PRDGeneratorModern';
import { cn } from '@/lib/utils';
import { exportToPDF, exportToText } from '@/utils/pdfExport';
import { toast } from '@/hooks/use-toast';

interface WorkspaceCardProps {
  session: PRDSession;
  isGenerating: boolean;
  streamingContent?: string;
}

export const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ session, isGenerating, streamingContent }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages, isGenerating, streamingContent]);

  const handleExportToPDF = (message: ChatMessage) => {
    const sessionTitle = session?.title || 'PRD文档';
    const success = exportToPDF(message, sessionTitle);
    
    if (success) {
      toast({
        title: "导出成功",
        description: "将打开打印窗口，您可以选择保存为PDF或直接打印",
      });
    } else {
      // 如果PDF导出失败，尝试文本导出
      const textSuccess = exportToText(message, sessionTitle);
      if (textSuccess) {
        toast({
          title: "PDF导出失败",
          description: "已改为导出TXT格式文件",
          variant: "destructive",
        });
      } else {
        toast({
          title: "导出失败",
          description: "文件导出过程中出现错误，请稍后重试",
          variant: "destructive",
        });
      }
    }
  };

  if (session.messages.length === 0 && !isGenerating) {
    return (
      <div className="card-modern p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 mx-auto mb-4 bg-muted rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">开始您的PRD创作</h3>
          <p className="text-muted-foreground text-sm">
            在下方输入您的产品需求要点，AI将为您生成专业的PRD文档
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-modern">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h2 className="font-semibold">{session.title}</h2>
          </div>
          <Badge variant={session.status === 'completed' ? 'default' : 'secondary'}>
            {session.status === 'completed' ? '已完成' : 
             session.status === 'exported' ? '已导出' : '进行中'}
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          {session.updatedAt.toLocaleString('zh-CN')}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="h-[500px] p-4" ref={scrollRef}>
        <div className="space-y-4">
          {session.messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "animate-slide-up",
                message.type === 'user' ? "flex justify-end" : "flex justify-start"
              )}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-lg p-4 border",
                  message.type === 'user' 
                    ? "bg-primary text-primary-foreground border-primary/20" 
                    : "bg-muted border-border"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                    message.type === 'user' 
                      ? "bg-primary-foreground/20" 
                      : "bg-primary text-primary-foreground"
                  )}>
                    {message.type === 'user' ? (
                      <User className="w-3 h-3" />
                    ) : (
                      <Bot className="w-3 h-3" />
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium opacity-80">
                        {message.type === 'user' ? '您' : 'AI助手'}
                      </span>
                      <span className="text-xs opacity-60">
                        {message.timestamp.toLocaleTimeString('zh-CN', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    
                    <div className="prose prose-sm max-w-none">
                      {message.type === 'assistant' ? (
                        <pre className={cn(
                          "whitespace-pre-wrap text-sm leading-relaxed font-sans",
                          "text-foreground"
                        )}>
                          {message.content}
                        </pre>
                      ) : (
                        <p className="text-sm leading-relaxed">{message.content}</p>
                      )}
                    </div>
                    
                    {message.type === 'assistant' && (
                      <div className="mt-3 pt-3 border-t border-border/50">
                        <Button
                          onClick={() => handleExportToPDF(message)}
                          variant="outline"
                          size="sm"
                          className="gap-2 text-xs"
                        >
                          <Download className="w-3 h-3" />
                          导出PDF
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex justify-start animate-slide-up">
              <div className="max-w-[85%] rounded-lg p-4 border bg-muted border-border">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="w-3 h-3" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-medium">AI助手</span>
                      <Loader2 className="w-3 h-3 animate-spin text-primary" />
                    </div>
                    {streamingContent ? (
                      <div className="prose prose-sm max-w-none">
                        <pre className={cn(
                          "whitespace-pre-wrap text-sm leading-relaxed font-sans",
                          "text-foreground"
                        )}>
                          {streamingContent}
                        </pre>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        正在分析需求并生成PRD文档...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);