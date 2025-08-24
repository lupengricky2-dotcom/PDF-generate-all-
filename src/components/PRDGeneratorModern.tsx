import React, { useState } from 'react';
import { Header } from './modern/Header';
import { WorkspaceCard } from './modern/WorkspaceCard';
import { HistoryPanel } from './modern/HistoryPanel';
import { GeneratorCard } from './modern/GeneratorCard';
import { universalDifyService } from '@/services/universalDifyService';
import { toast } from '@/hooks/use-toast';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PRDSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  status: 'draft' | 'completed' | 'exported';
  conversationId?: string; // Dify conversation ID
}

const PRDGeneratorModern: React.FC = () => {
  const [sessions, setSessions] = useState<PRDSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PRDSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');

  const createNewSession = () => {
    const newSession: PRDSession = {
      id: `session-${Date.now()}`,
      title: '新的PRD项目',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setShowHistory(false);
  };

  const selectSession = (session: PRDSession) => {
    setCurrentSession(session);
    setShowHistory(false);
  };

  const generatePRD = async (input: string) => {
    if (!currentSession || !input.trim()) return;

    setIsGenerating(true);
    setStreamingContent('');
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    // Update session with user message
    const sessionWithUserMessage = {
      ...currentSession,
      messages: [...currentSession.messages, userMessage],
      updatedAt: new Date(),
      title: currentSession.messages.length === 0 ? input.slice(0, 25) + (input.length > 25 ? '...' : '') : currentSession.title
    };

    setSessions(prev => 
      prev.map(s => s.id === currentSession.id ? sessionWithUserMessage : s)
    );
    setCurrentSession(sessionWithUserMessage);

    let accumulatedContent = '';

    try {
      await universalDifyService.sendMessage(
        input,
        sessionWithUserMessage.conversationId, // 使用更新后的session
        // onChunk callback
        (chunk: string) => {
          accumulatedContent += chunk;
          setStreamingContent(accumulatedContent);
        },
        // onError callback
        (error: Error) => {
          console.error('Dify Service Error:', error);
          
          let errorTitle = "生成失败";
          let errorDescription = error.message;
          
          if (error.message.includes('Workflow not published')) {
            errorTitle = "Dify 配置错误";
            errorDescription = "工作流未发布。请登录 Dify 平台检查应用设置并发布工作流。";
          } else if (error.message.includes('所有 Dify API 端点都失败')) {
            errorTitle = "API 调用失败";
            errorDescription = "所有 Dify API 端点都无法访问，请检查 API Key 或联系管理员。";
          }
          
          toast({
            title: errorTitle,
            description: errorDescription,
            variant: "destructive",
          });
          
          // 确保清理所有状态
          setIsGenerating(false);
          setStreamingContent('');
        },
        // onComplete callback
        (messageId: string, conversationId: string) => {
          const assistantMessage: ChatMessage = {
            id: messageId || `msg-${Date.now()}`,
            type: 'assistant',
            content: accumulatedContent || '生成完成，但未收到内容。',
            timestamp: new Date()
          };

          const finalSession = {
            ...sessionWithUserMessage,
            messages: [...sessionWithUserMessage.messages, assistantMessage],
            conversationId, // 确保保存最新的conversationId
            updatedAt: new Date(),
            status: 'completed' as const
          };

          // 同时更新sessions列表和currentSession  
          setSessions(prev => 
            prev.map(s => s.id === sessionWithUserMessage.id ? finalSession : s)
          );
          setCurrentSession(finalSession);
          setIsGenerating(false);
          setStreamingContent('');
        }
      );
    } catch (error) {
      console.error('发送消息失败:', error);
      toast({
        title: "发送失败",
        description: "无法连接到AI服务，请检查网络连接",
        variant: "destructive",
      });
      setIsGenerating(false);
      setStreamingContent('');
    }
  };

  // Initialize with first session
  React.useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-surface">
      <Header 
        onNewProject={createNewSession}
        onShowHistory={() => setShowHistory(!showHistory)}
        currentProject={currentSession}
        showHistory={showHistory}
      />
      
      <main className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* History Panel */}
          <div className={`lg:col-span-1 ${showHistory ? 'block' : 'hidden lg:block'} animate-fade-in`}>
            <HistoryPanel
              sessions={sessions}
              currentSession={currentSession}
              onSelectSession={selectSession}
              onNewSession={createNewSession}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {currentSession ? (
              <>
                <WorkspaceCard
                  session={currentSession}
                  isGenerating={isGenerating}
                  streamingContent={streamingContent}
                />
                
                <GeneratorCard
                  onGenerate={generatePRD}
                  isGenerating={isGenerating}
                  disabled={!currentSession}
                />
              </>
            ) : (
              <div className="card-modern p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-16 h-16 mx-auto mb-6 gradient-primary rounded-2xl flex items-center justify-center">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold mb-3">欢迎使用AI PRD生成器</h2>
                  <p className="text-muted-foreground mb-6">创建新项目，让AI帮您生成专业的产品需求文档</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PRDGeneratorModern;