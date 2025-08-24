import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Download, User, Bot, Loader2 } from 'lucide-react';
import { PRDSession, ChatMessage } from './PRDGenerator';
import { cn } from '@/lib/utils';
import { exportToPDF, exportToText } from '@/utils/pdfExport';
import { toast } from '@/hooks/use-toast';

interface ChatAreaProps {
  session: PRDSession | null;
  isGenerating: boolean;
  streamingContent?: string;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ session, isGenerating, streamingContent = '' }) => {
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session?.messages, isGenerating]);

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

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto prd-gradient rounded-2xl flex items-center justify-center">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">AI PRD生成器</h2>
            <p className="text-muted-foreground">开始新的对话，让AI帮您生成专业的产品需求文档</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm p-4">
        <h1 className="font-semibold text-lg">{session.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {session.messages.length / 2}轮对话 • 最后更新：{session.updatedAt.toLocaleString('zh-CN')}
        </p>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-6" ref={scrollRef}>
        <div className="max-w-4xl mx-auto space-y-6">
          {session.messages.map((message, index) => (
            <div
              key={message.id}
              className={cn(
                "animate-slide-up",
                message.type === 'user' ? "ml-auto" : "mr-auto"
              )}
            >
              <div
                className={cn(
                  "flex gap-4 p-4 rounded-xl border",
                  message.type === 'user' 
                    ? "chat-message-user max-w-2xl ml-auto" 
                    : "chat-message-assistant w-full"
                )}
              >
                <div className="flex-shrink-0">
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center",
                    message.type === 'user' 
                      ? "bg-primary text-primary-foreground" 
                      : "prd-gradient text-white"
                  )}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">
                      {message.type === 'user' ? '您' : 'AI助手'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString('zh-CN', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                  </div>
                  
                  <div className="prose prose-sm max-w-none">
                    {message.type === 'assistant' ? (
                      <pre className="whitespace-pre-wrap text-sm leading-relaxed font-sans">
                        {message.content}
                      </pre>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>
                  
                  {message.type === 'assistant' && (
                    <div className="mt-4 pt-3 border-t border-border/50">
                      <Button
                        onClick={() => handleExportToPDF(message)}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                      >
                        <Download className="h-4 w-4" />
                        导出为PDF
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="animate-slide-up">
              <div className="flex gap-4 p-4 rounded-xl border chat-message-assistant w-full">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-lg prd-gradient flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-sm font-medium">AI助手</span>
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  </div>
                  {streamingContent ? (
                    <div className="text-sm text-foreground">
                      <pre className="whitespace-pre-wrap font-sans leading-relaxed">{streamingContent}</pre>
                      <div className="inline-block w-2 h-4 bg-primary animate-pulse ml-1" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      正在生成PRD文档...
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};