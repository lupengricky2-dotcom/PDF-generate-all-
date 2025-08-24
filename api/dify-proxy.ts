import { NextRequest, NextResponse } from 'next/server';

export const config = {
  runtime: 'edge'
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

export default async function handler(req: NextRequest) {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 200,
      headers: corsHeaders 
    });
  }

  if (req.method !== 'POST') {
    return new NextResponse('Method not allowed', { 
      status: 405,
      headers: corsHeaders
    });
  }

  try {
    const { query, conversationId } = await req.json();

    console.log('🚀 Vercel Dify Proxy - 收到请求:', {
      query: query?.substring(0, 100) + '...',
      conversationId: conversationId || 'NEW_CONVERSATION',
      timestamp: new Date().toISOString(),
      hasConversationId: !!conversationId
    });

    const DIFY_API_KEY = 'app-uRSuEuFh7i3WOSTVGSQylStu';
    const WORKFLOW_ID = '27f4e8b1-1200-4289-b5d7-f7f28275c200';
    
    // 尝试多个端点，优先使用指定的工作流端点
    const endpoints = [
      {
        url: `http://teach.excelmaster.ai/v1/workflows/${WORKFLOW_ID}/run`,
        body: {
          inputs: { query },
          response_mode: 'streaming',
          user: `user-${Date.now()}`
        }
      },
      {
        url: 'http://teach.excelmaster.ai/v1/workflows/run',
        body: {
          inputs: { query },
          response_mode: 'streaming',
          user: `user-${Date.now()}`
        }
      },
      {
        url: 'http://teach.excelmaster.ai/v1/chat-messages',
        body: {
          inputs: {},
          query,
          response_mode: 'streaming',
          conversation_id: conversationId || undefined,
          user: `user-${Date.now()}`,
          auto_generate_name: true
        }
      }
    ];

    let lastError = null;
    
    for (const endpoint of endpoints) {
      console.log('📡 尝试端点:', endpoint.url);
      
      try {
        // 清理请求体，移除undefined值
        const cleanBody = JSON.parse(JSON.stringify(endpoint.body));
        console.log('📝 请求体:', cleanBody);
        
        const response = await fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${DIFY_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cleanBody)
        });

        console.log('📡 端点响应:', endpoint.url, response.status, response.statusText);

        if (response.ok) {
          console.log('✅ 找到有效端点:', endpoint.url);

          // 创建流式响应
          const stream = new ReadableStream({
            async start(controller) {
              const reader = response.body?.getReader();
              if (!reader) {
                console.log('❌ 没有响应体');
                controller.close();
                return;
              }

              console.log('🔄 开始处理流式响应');

              try {
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) {
                    console.log('✅ 流读取完成');
                    // 发送完成信号
                    controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
                    controller.close();
                    return;
                  }

                  const chunk = new TextDecoder().decode(value);
                  const lines = chunk.split('\n');

                  for (const line of lines) {
                    if (line.startsWith('data: ')) {
                      const data = line.slice(6);
                      if (data.trim() === '[DONE]') {
                        console.log('✅ 收到 DONE 信号');
                        controller.enqueue(new TextEncoder().encode(`data: [DONE]\n\n`));
                        controller.close();
                        return;
                      }

                      try {
                        const parsed = JSON.parse(data);
                        console.log('📝 解析数据:', {
                          event: parsed.event,
                          hasAnswer: !!parsed.answer,
                          answerLength: parsed.answer?.length || 0,
                          messageId: parsed.message_id,
                          conversationId: parsed.conversation_id
                        });
                        
                        // 直接转发原始数据
                        controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                      } catch (e) {
                        console.log('⚠️ 忽略无效数据行:', data.substring(0, 100));
                      }
                    }
                  }
                }
              } catch (error) {
                console.error('❌ 流处理错误:', error);
                controller.error(error);
              } finally {
                reader.releaseLock();
              }
            }
          });

          return new NextResponse(stream, {
            headers: {
              ...corsHeaders,
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              'Connection': 'keep-alive',
            },
          });
        } else {
          const errorText = await response.text();
          lastError = `${endpoint.url}: ${response.status} ${errorText}`;
          console.error('❌ 端点失败:', lastError);
        }
      } catch (fetchError) {
        lastError = `${endpoint.url}: ${fetchError.message}`;
        console.error('❌ 端点连接失败:', lastError);
      }
    }

    // 如果所有端点都失败了
    throw new Error(`所有 Dify API 端点都失败了。最后一个错误: ${lastError}`);

  } catch (error) {
    console.error('❌ Vercel Edge Function 错误:', error);
    
    // 根据错误类型提供具体的解决方案
    let errorMessage = '';
    let solution = '';
    let statusCode = 500;
    
    if (error.message.includes('Workflow not published')) {
      errorMessage = 'Dify 工作流未发布';
      solution = `请按以下步骤操作:
1. 登录 Dify 平台 (http://teach.excelmaster.ai)
2. 找到您的应用
3. 确保工作流已保存
4. 点击右上角"发布"按钮发布工作流
5. 发布后重新测试`;
      statusCode = 400;
    } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      errorMessage = 'API Key 无效';
      solution = '请检查您的 Dify API Key 是否正确';
      statusCode = 401;
    } else {
      errorMessage = `API 调用失败: ${error.message}`;
      solution = '请检查网络连接和API配置';
    }
    
    return new NextResponse(
      JSON.stringify({ 
        error: errorMessage,
        solution: solution,
        timestamp: new Date().toISOString()
      }), 
      {
        status: statusCode,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
}