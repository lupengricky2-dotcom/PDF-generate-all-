// 代理服务解决方案 - 如果CORS问题无法直接解决
export const createProxyRequest = (originalUrl: string, options: RequestInit) => {
  // 使用一个公共的CORS代理服务
  const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
  
  return {
    url: proxyUrl + originalUrl,
    options: {
      ...options,
      headers: {
        ...options.headers,
        'X-Requested-With': 'XMLHttpRequest',
      }
    }
  };
};

// 备选方案：使用不同的代理服务
export const alternativeProxyRequest = (originalUrl: string, options: RequestInit) => {
  // 另一个代理服务
  const proxyUrl = 'https://api.allorigins.win/raw?url=';
  
  return {
    url: proxyUrl + encodeURIComponent(originalUrl),
    options: {
      ...options,
      method: 'GET', // 某些代理只支持GET
    }
  };
};

// JSONP方式的备选方案（仅适用于支持JSONP的API）
export const createJSONPRequest = (url: string, callback: string = 'callback') => {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    const callbackName = `jsonp_callback_${Date.now()}`;
    
    // @ts-ignore
    window[callbackName] = (data: any) => {
      // @ts-ignore
      delete window[callbackName];
      document.head.removeChild(script);
      resolve(data);
    };
    
    script.src = `${url}&${callback}=${callbackName}`;
    script.onerror = () => {
      // @ts-ignore
      delete window[callbackName];
      document.head.removeChild(script);
      reject(new Error('JSONP request failed'));
    };
    
    document.head.appendChild(script);
  });
};