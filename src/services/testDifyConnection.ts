// 测试Dify连接的工具函数
export const testDifyConnection = async () => {
  const testUrl = 'http://teach.excelmaster.ai/v1/info';
  const apiKey = 'app-uRSuEuFh7i3WOSTVGSQylStu';

  console.log('🧪 测试Dify API连接...');
  console.log('URL:', testUrl);

  try {
    // 使用更宽松的fetch配置
    const response = await fetch(testUrl, {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache', 
      credentials: 'omit',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('📡 测试响应:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (response.ok) {
      const data = await response.json();
      console.log('✅ API连接成功, 应用信息:', data);
      return { success: true, data };
    } else {
      const errorText = await response.text();
      console.error('❌ API连接失败, HTTP Status:', response.status);
      console.error('❌ 错误内容:', errorText);
      return { success: false, error: `HTTP ${response.status}: ${errorText}` };
    }
  } catch (error) {
    console.error('❌ 连接测试失败:', error);
    
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      console.error('❌ 这是CORS或网络问题');
      return { 
        success: false, 
        error: 'CORS问题：浏览器阻止了跨域请求。\n\n可能的解决方案：\n1. 服务器需要设置CORS头\n2. 使用代理服务器\n3. 或在服务器端调用API' 
      };
    }
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
};

// 简单的ping测试
export const pingDifyServer = async () => {
  const testUrl = 'http://teach.excelmaster.ai/v1/parameters';
  const apiKey = 'app-uRSuEuFh7i3WOSTVGSQylStu';

  try {
    const response = await fetch(testUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
      }
    });

    return {
      accessible: response.status < 500,
      status: response.status,
      statusText: response.statusText
    };
  } catch (error) {
    return {
      accessible: false,
      error: error instanceof Error ? error.message : '连接失败'
    };
  }
};