import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Download, User, Bot, Send, Loader2 } from 'lucide-react';
import { PRDSession, ChatMessage } from '../PRDGeneratorApple';
import { cn } from '@/lib/utils';
import { exportToPDF, exportToText } from '@/utils/pdfExport';
import { toast } from '@/hooks/use-toast';

interface AppleWorkspaceProps {
  session: PRDSession;
  isGenerating: boolean;
  onGenerate: (input: string) => void;
}

export const AppleWorkspace: React.FC<AppleWorkspaceProps> = ({ 
  session, 
  isGenerating, 
  onGenerate 
}) => {
  const [input, setInput] = React.useState('');
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [session.messages, isGenerating]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating) {
      onGenerate(input.trim());
      setInput('');
    }
  };

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

  const suggestions = [
    "设计一个在线教育平台的核心功能",
    "开发企业内部协作工具的用户管理系统", 
    "构建智能客服机器人的对话引擎"
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Messages Area */}
      <div className="flex-1 overflow-hidden">
        {session.messages.length === 0 && !isGenerating ? (
          <div className="h-full flex items-center justify-center p-12">
            <div className="text-center max-w-2xl mx-auto">
              <div className="w-20 h-20 bg-apple-light-gray rounded-2xl flex items-center justify-center mx-auto mb-8">
                <Bot className="w-10 h-10 text-apple-gray" />
              </div>
              <h2 className="apple-title mb-4">创建您的PRD文档</h2>
              <p className="apple-body mb-8 max-w-md mx-auto">
                描述您的产品需求，AI将为您生成专业、完整的产品需求文档
              </p>
              
              {/* Quick suggestions */}
              <div className="space-y-3">
                <p className="text-sm font-medium text-apple-gray">快速开始</p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(suggestion)}
                    className="block w-full p-4 text-left apple-card hover:apple-scale text-sm"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <ScrollArea className="h-full" ref={scrollRef}>
            <div className="max-w-4xl mx-auto p-8 space-y-8">
              {session.messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "apple-slide-up",
                    message.type === 'user' ? "flex justify-end" : "flex justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-3xl apple-card p-6",
                    message.type === 'user' ? "bg-apple-blue text-white" : "bg-white"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                        message.type === 'user' 
                          ? "bg-white/20 text-white" 
                          : "bg-apple-light-gray text-apple-gray"
                      )}>
                        {message.type === 'user' ? (
                          <User className="w-4 h-4" />
                        ) : (
                          <Bot className="w-4 h-4" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-3">
                          <span className={cn(
                            "text-sm font-medium",
                            message.type === 'user' ? "text-white/80" : "text-apple-gray"
                          )}>
                            {message.type === 'user' ? '您' : 'AI助手'}
                          </span>
                          <span className={cn(
                            "text-xs",
                            message.type === 'user' ? "text-white/60" : "text-apple-gray"
                          )}>
                            {message.timestamp.toLocaleTimeString('zh-CN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        
                        <div className={cn(
                          "prose prose-sm max-w-none",
                          message.type === 'user' ? "text-white" : "text-foreground"
                        )}>
                          {message.type === 'assistant' ? (
                            <pre className="whitespace-pre-wrap font-sans leading-relaxed">
                              {message.content}
                            </pre>
                          ) : (
                            <p className="leading-relaxed">{message.content}</p>
                          )}
                        </div>
                        
                        {message.type === 'assistant' && (
                          <div className="mt-6 pt-4 border-t border-apple-border">
                            <Button
                              onClick={() => handleExportToPDF(message)}
                              variant="outline"
                              size="sm"
                              className="gap-2 hover:bg-apple-light-gray"
                            >
                              <Download className="w-4 h-4" />
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
                <div className="flex justify-start apple-slide-up">
                  <div className="max-w-3xl apple-card p-6 bg-white">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-apple-light-gray flex items-center justify-center">
                        <Bot className="w-4 h-4 text-apple-gray" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="text-sm font-medium text-apple-gray">AI助手</span>
                          <Loader2 className="w-4 h-4 animate-spin text-apple-blue" />
                        </div>
                        <div className="flex items-center gap-2 text-sm text-apple-gray">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-apple-blue rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-apple-blue rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-apple-blue rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          正在生成PRD文档...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-apple-border bg-white/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto p-6">
          <form onSubmit={handleSubmit} className="flex gap-4">
            <div className="flex-1">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="描述您的产品需求..."
                className="apple-input resize-none min-h-[60px] text-sm"
                disabled={isGenerating}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>
            <Button
              type="submit"
              disabled={!input.trim() || isGenerating}
              className="apple-button self-end"
            >
              {isGenerating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
          
          <div className="mt-3 flex items-center justify-between text-xs text-apple-gray">
            <span>按 Enter 发送，Shift + Enter 换行</span>
            <span className={input.length > 800 ? 'text-red-500' : ''}>{input.length}/1000</span>
          </div>
        </div>
      </div>
    </div>
  );
};