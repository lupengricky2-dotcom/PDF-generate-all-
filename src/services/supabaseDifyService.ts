import { supabase } from '@/integrations/supabase/client';

export interface DifyMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DifyStreamResponse {
  event: string;
  message_id?: string;
  conversation_id?: string;
  answer?: string;
  created_at?: number;
}

export class SupabaseDifyService {
  async sendMessage(
    query: string,
    conversationId?: string,
    onChunk?: (chunk: string) => void,
    onError?: (error: Error) => void,
    onComplete?: (messageId: string, conversationId: string) => void
  ): Promise<void> {
    console.log('🚀 使用 Supabase Edge Function 发送消息:', {
      query: query?.substring(0, 100) + '...',
      conversationId,
      timestamp: new Date().toISOString()
    });

    try {
      // 使用直接 fetch 调用来获取流式响应
      const response = await fetch('https://aclfilhdeedaykwdlgbh.supabase.co/functions/v1/dify-proxy', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbGZpbGhkZWVkYXlrd2RsZ2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDk0MDQsImV4cCI6MjA3MTU4NTQwNH0.mbY7hGdwqcx3izk3On85iazQmyNm9lewF7QZluLrv0Q`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFjbGZpbGhkZWVkYXlrd2RsZ2JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMDk0MDQsImV4cCI6MjA3MTU4NTQwNH0.mbY7hGdwqcx3izk3On85iazQmyNm9lewF7QZluLrv0Q'
        },
        body: JSON.stringify({
          query,
          conversationId
        })
      });

      if (!response.ok) {
        console.error('❌ Edge Function HTTP 错误:', response.status, response.statusText);
        const errorData = await response.json().catch(() => ({ error: 'HTTP 错误' }));
        
        let errorMessage = errorData.error || `HTTP ${response.status} ${response.statusText}`;
        let solution = errorData.solution || '';
        
        const finalMessage = solution ? `${errorMessage}\n\n解决方案:\n${solution}` : errorMessage;
        throw new Error(finalMessage);
      }

      // 处理流式响应
      if (response.body) {
        console.log('🔄 开始处理前端流式响应');
        const reader = response.body.getReader();
        let messageId = '';
        let finalConversationId = conversationId || '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              console.log('✅ 前端流读取完成');
              break;
            }

            const chunk = new TextDecoder().decode(value);
            console.log('📦 收到数据块:', chunk.substring(0, 200));
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr.trim() === '[DONE]') {
                  console.log('✅ 收到完成信号');
                  if (onComplete) {
                    onComplete(messageId, finalConversationId);
                  }
                  return;
                }

                try {
                  const parsed: DifyStreamResponse = JSON.parse(dataStr);
                  console.log('📝 解析前端数据:', {
                    event: parsed.event,
                    hasAnswer: !!parsed.answer,
                    answerPreview: parsed.answer?.substring(0, 50)
                  });
                  
                  // 处理所有事件类型的消息
                  if (parsed.event === 'message' || parsed.event === 'agent_message' || parsed.event === 'text_chunk') {
                    if (parsed.answer && onChunk) {
                      console.log('📤 发送数据块到UI:', parsed.answer.substring(0, 50));
                      onChunk(parsed.answer);
                    }
                    if (parsed.message_id) {
                      messageId = parsed.message_id;
                    }
                    if (parsed.conversation_id) {
                      finalConversationId = parsed.conversation_id;
                    }
                  }
                } catch (e) {
                  console.log('⚠️ 忽略无效数据行:', dataStr.substring(0, 100));
                }
              }
            }
          }
          
          // 如果循环正常结束，也调用完成回调
          if (onComplete) {
            console.log('✅ 流处理完成，调用回调');
            onComplete(messageId, finalConversationId);
          }
        } catch (streamError) {
          console.error('❌ 流处理错误:', streamError);
          if (onError) {
            onError(new Error(`流处理失败: ${streamError instanceof Error ? streamError.message : '未知错误'}`));
          }
        } finally {
          reader.releaseLock();
        }
      } else {
        console.log('❌ 没有收到流数据，response.body为空');
        if (onComplete) {
          onComplete('', conversationId || '');
        }
      }

    } catch (error) {
      console.error('❌ Supabase Dify Service 调用失败:', error);
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      
      if (onError) {
        onError(new Error(`服务调用失败: ${errorMessage}`));
      } else {
        throw new Error(`服务调用失败: ${errorMessage}`);
      }
    }
  }
}

// 导出单例实例
export const supabaseDifyService = new SupabaseDifyService();