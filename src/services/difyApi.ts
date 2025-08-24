// Dify API Service
export interface DifyMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface DifyStreamResponse {
  event: string;
  task_id?: string;
  message_id?: string;
  conversation_id?: string;
  answer?: string;
  created_at?: number;
  metadata?: any;
  message?: string; // 错误消息
  status?: number; // HTTP状态码
  code?: string; // 错误码
}

export interface DifyConfig {
  apiKey: string;
  baseUrl: string;
  userId: string;
}

export class DifyApiService {
  private config: DifyConfig;

  constructor(config: DifyConfig) {
    this.config = config;
  }

  async sendMessage(
    query: string,
    conversationId?: string,
    onChunk?: (chunk: string) => void,
    onError?: (error: Error) => void,
    onComplete?: (messageId: string, conversationId: string) => void
  ): Promise<void> {
    console.log('🚀 开始发送消息到Dify API:', {
      url: `${this.config.baseUrl}/chat-messages`,
      query,
      conversationId,
      userId: this.config.userId
    });

    try {
      const requestBody = {
        inputs: {},
        query,
        response_mode: 'streaming',
        conversation_id: conversationId || '',
        user: this.config.userId,
        auto_generate_name: true,
      };

      console.log('📝 请求参数:', requestBody);

      // 尝试不同的请求配置来解决CORS问题
      const response = await fetch(`${this.config.baseUrl}/chat-messages`, {
        method: 'POST',
        mode: 'cors', // 明确指定CORS模式
        cache: 'no-cache',
        credentials: 'omit', // 不发送凭据
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'User-Agent': 'PRD-Generator/1.0',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('📡 收到响应:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP错误响应:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应流');
      }

      const decoder = new TextDecoder();
      let buffer = '';
      let finalMessageId = '';
      let finalConversationId = '';

      console.log('📖 开始读取流式响应...');

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          console.log('✅ 流式响应读取完成');
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data: DifyStreamResponse = JSON.parse(line.slice(6));
              console.log('📦 收到数据块:', data);
              
              switch (data.event) {
                case 'message':
                  if (data.answer && onChunk) {
                    onChunk(data.answer);
                  }
                  if (data.message_id) {
                    finalMessageId = data.message_id;
                  }
                  if (data.conversation_id) {
                    finalConversationId = data.conversation_id;
                  }
                  break;
                
                case 'message_end':
                  console.log('🏁 消息生成完成');
                  if (data.message_id) {
                    finalMessageId = data.message_id;
                  }
                  if (data.conversation_id) {
                    finalConversationId = data.conversation_id;
                  }
                  if (onComplete) {
                    onComplete(finalMessageId, finalConversationId);
                  }
                  break;
                
                case 'error':
                  console.error('❌ 服务器错误:', data);
                  if (onError) {
                    onError(new Error(data.message || '生成过程中出现错误'));
                  }
                  break;
              }
            } catch (e) {
              console.warn('⚠️ 解析SSE数据失败:', line, e);
            }
          }
        }
      }
    } catch (error) {
      console.error('❌ Dify API 调用失败:', error);
      
      // 提供更详细的错误信息
      let errorMessage = '请求失败';
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        errorMessage = '网络连接失败，可能是CORS问题或服务器不可用。请检查：\n1. 网络连接是否正常\n2. API服务器是否可访问\n3. 是否存在跨域限制';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      if (onError) {
        onError(new Error(errorMessage));
      }
    }
  }

  async getConversations(): Promise<any[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/conversations?user=${this.config.userId}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('获取会话列表失败:', error);
      return [];
    }
  }

  async getConversationMessages(conversationId: string): Promise<any[]> {
    try {
      const response = await fetch(
        `${this.config.baseUrl}/messages?conversation_id=${conversationId}&user=${this.config.userId}`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('获取会话消息失败:', error);
      return [];
    }
  }

  async deleteConversation(conversationId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.baseUrl}/conversations/${conversationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user: this.config.userId,
        }),
      });

      return response.ok;
    } catch (error) {
      console.error('删除会话失败:', error);
      return false;
    }
  }
}

// 固定配置
export const DIFY_CONFIG = {
  baseUrl: 'http://teach.excelmaster.ai/v1',
  apiKey: 'app-uRSuEuFh7i3WOSTVGSQylStu',
  userId: `user-${Date.now()}`, // 生成唯一用户ID
};