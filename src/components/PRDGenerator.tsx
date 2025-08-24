import React, { useState, useEffect } from 'react';
import { Sidebar } from './Sidebar';
import { ChatArea } from './ChatArea';
import { InputArea } from './InputArea';
import { universalDifyService } from '@/services/universalDifyService';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { RefreshCw, Wifi } from 'lucide-react';

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
  conversationId?: string; // Dify conversation ID
}

const PRDGenerator: React.FC = () => {
  const [sessions, setSessions] = useState<PRDSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PRDSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  // 使用 Supabase Edge Function 服务
  const [streamingContent, setStreamingContent] = useState('');
  const [isTestingConnection, setIsTestingConnection] = useState(false);

  // 测试API连接
  const testConnection = async () => {
    setIsTestingConnection(true);
    console.log('🧪 测试 Supabase Edge Function 连接...');
    
    try {
      await universalDifyService.sendMessage(
        '测试连接',
        undefined,
        undefined,
        (error) => {
          toast({
            title: "连接失败 ❌",
            description: `API 错误: ${error.message}`,
            variant: "destructive",
          });
        },
        () => {
          toast({
            title: "连接成功! ✅",
            description: "AI API 连接正常",
          });
        }
      );
    } catch (error) {
      toast({
        title: "测试失败 ❌", 
        description: "Edge Function 连接测试异常",
        variant: "destructive",
      });
    } finally {
      setIsTestingConnection(false);
    }
  };

  const createNewSession = () => {
    const newSession: PRDSession = {
      id: `session-${Date.now()}`,
      title: '新的PRD生成',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
  };

  const selectSession = (session: PRDSession) => {
    setCurrentSession(session);
  };

  const generatePRD = async (input: string) => {
    if (!currentSession || !input.trim()) {
      return;
    }

    setIsGenerating(true);
    setStreamingContent('');
    
    // Add user message
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
      title: currentSession.messages.length === 0 ? input.slice(0, 30) + '...' : currentSession.title
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
          console.error('Supabase Dify Service Error:', error);
          
          // 显示更详细的错误信息
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
            updatedAt: new Date()
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
    <div className="flex h-screen bg-background">
      <Sidebar 
        sessions={sessions}
        currentSession={currentSession}
        onSelectSession={selectSession}
        onNewSession={createNewSession}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Header with connection test */}
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h1 className="text-lg font-semibold">PRD 生成器</h1>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={testConnection}
              disabled={isTestingConnection}
              className="gap-2"
            >
              {isTestingConnection ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Wifi className="h-4 w-4" />
              )}
              {isTestingConnection ? '测试中...' : '测试连接'}
            </Button>
          </div>
        </div>

        <ChatArea 
          session={currentSession}
          isGenerating={isGenerating}
          streamingContent={streamingContent}
        />
        
        <InputArea 
          onGenerate={generatePRD}
          isGenerating={isGenerating}
          disabled={!currentSession}
        />
      </div>
    </div>
  );
};

export default PRDGenerator;