import { ChatMessage } from '@/components/PRDGenerator';

export const exportToPDF = (message: ChatMessage, sessionTitle: string = 'PRD文档') => {
  try {
    // 创建一个新的窗口用于打印
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    if (!printWindow) {
      throw new Error('无法打开打印窗口，可能被浏览器阻止');
    }

    // 生成HTML内容
    const htmlContent = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${sessionTitle}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: white;
        }
        
        h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 30px;
            font-size: 28px;
        }
        
        h2 {
            color: #34495e;
            margin-top: 30px;
            margin-bottom: 15px;
            font-size: 22px;
            border-left: 4px solid #3498db;
            padding-left: 15px;
        }
        
        h3 {
            color: #2c3e50;
            margin-top: 25px;
            margin-bottom: 12px;
            font-size: 18px;
        }
        
        h4, h5, h6 {
            color: #34495e;
            margin-top: 20px;
            margin-bottom: 10px;
        }
        
        p {
            margin-bottom: 12px;
            text-align: justify;
        }
        
        ul, ol {
            margin-bottom: 15px;
            padding-left: 30px;
        }
        
        li {
            margin-bottom: 5px;
        }
        
        strong, **strong** {
            color: #2c3e50;
            font-weight: 600;
        }
        
        code {
            background-color: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Monaco', 'Consolas', 'Courier New', monospace;
            font-size: 14px;
        }
        
        pre {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            border: 1px solid #e9ecef;
            overflow-x: auto;
            margin-bottom: 15px;
        }
        
        blockquote {
            border-left: 4px solid #bdc3c7;
            padding-left: 15px;
            margin: 15px 0;
            font-style: italic;
            color: #7f8c8d;
        }
        
        table {
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 15px;
        }
        
        table, th, td {
            border: 1px solid #ddd;
        }
        
        th, td {
            padding: 12px;
            text-align: left;
        }
        
        th {
            background-color: #f2f3f4;
            font-weight: 600;
        }
        
        .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #ecf0f1;
        }
        
        .metadata {
            background-color: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 25px;
            font-size: 14px;
            color: #6c757d;
        }
        
        .content {
            white-space: pre-wrap;
            word-wrap: break-word;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 1px solid #ecf0f1;
            text-align: center;
            font-size: 12px;
            color: #95a5a6;
        }
        
        @media print {
            body {
                margin: 0;
                padding: 15px;
                font-size: 12px;
            }
            
            h1 {
                font-size: 20px;
            }
            
            h2 {
                font-size: 16px;
            }
            
            h3 {
                font-size: 14px;
            }
            
            .no-print {
                display: none;
            }
            
            @page {
                margin: 2cm;
                size: A4;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${sessionTitle}</h1>
    </div>
    
    <div class="metadata">
        <p><strong>生成时间：</strong> ${message.timestamp.toLocaleString('zh-CN')}</p>
        <p><strong>文档类型：</strong> 产品需求文档 (PRD)</p>
        <p><strong>生成工具：</strong> AI PRD Generator</p>
    </div>
    
    <div class="content">
        ${formatContent(message.content)}
    </div>
    
    <div class="footer">
        <p>本文档由 AI PRD Generator 生成 | 导出时间：${new Date().toLocaleString('zh-CN')}</p>
    </div>
    
    <script>
        // 等待内容加载完成后自动打印
        window.onload = function() {
            setTimeout(function() {
                window.print();
                // 打印完成后关闭窗口
                setTimeout(function() {
                    window.close();
                }, 1000);
            }, 500);
        };
    </script>
</body>
</html>`;

    // 写入内容到新窗口
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    return true;
  } catch (error) {
    console.error('PDF导出失败:', error);
    return false;
  }
};

// 格式化内容，将Markdown转换为HTML
function formatContent(content: string): string {
  let html = content
    // 转义HTML标签
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    
    // 标题
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    
    // 粗体
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    
    // 列表项
    .replace(/^- (.*$)/gim, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li>$2</li>')
    
    // 换行
    .replace(/\n\n/g, '</p><p>')
    .replace(/\n/g, '<br>');
    
  // 包装段落
  html = '<p>' + html + '</p>';
  
  // 处理列表
  html = html.replace(/(<li>.*?<\/li>)/gs, (match) => {
    return '<ul>' + match + '</ul>';
  });
  
  // 清理空段落
  html = html.replace(/<p><\/p>/g, '');
  html = html.replace(/<p><br><\/p>/g, '');
  
  return html;
}

// 简化版导出（直接下载文本文件）
export const exportToText = (message: ChatMessage, sessionTitle: string = 'PRD文档') => {
  try {
    const content = `${sessionTitle}\n${'='.repeat(sessionTitle.length)}\n\n生成时间: ${message.timestamp.toLocaleString('zh-CN')}\n\n${message.content}\n\n---\n本文档由 AI PRD Generator 生成\n导出时间: ${new Date().toLocaleString('zh-CN')}`;
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRD_${sessionTitle.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('文本导出失败:', error);
    return false;
  }
};