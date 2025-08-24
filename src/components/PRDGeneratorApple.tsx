import React, { useState } from 'react';
import { AppleNavBar } from './apple/AppleNavBar';
import { AppleSidebar } from './apple/AppleSidebar';
import { AppleWorkspace } from './apple/AppleWorkspace';
import { AppleWelcome } from './apple/AppleWelcome';

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
}

const PRDGeneratorApple: React.FC = () => {
  const [sessions, setSessions] = useState<PRDSession[]>([]);
  const [currentSession, setCurrentSession] = useState<PRDSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const createNewSession = () => {
    const newSession: PRDSession = {
      id: `session-${Date.now()}`,
      title: '新建PRD',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'draft'
    };
    setSessions(prev => [newSession, ...prev]);
    setCurrentSession(newSession);
    setSidebarOpen(false);
  };

  const selectSession = (session: PRDSession) => {
    setCurrentSession(session);
    setSidebarOpen(false);
  };

  const generatePRD = async (input: string) => {
    if (!currentSession || !input.trim()) return;

    setIsGenerating(true);
    
    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      type: 'user',
      content: input,
      timestamp: new Date()
    };

    // Simulate PRD generation
    setTimeout(() => {
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        type: 'assistant',
        content: generateMockPRD(input),
        timestamp: new Date()
      };

      const updatedSession = {
        ...currentSession,
        messages: [...currentSession.messages, userMessage, assistantMessage],
        updatedAt: new Date(),
        title: currentSession.messages.length === 0 ? 
          (input.slice(0, 20) + (input.length > 20 ? '...' : '')) : 
          currentSession.title,
        status: 'completed' as const
      };

      setSessions(prev => 
        prev.map(s => s.id === currentSession.id ? updatedSession : s)
      );
      setCurrentSession(updatedSession);
      setIsGenerating(false);
    }, 2500);
  };

  // Initialize with first session
  React.useEffect(() => {
    if (sessions.length === 0) {
      createNewSession();
    }
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <AppleNavBar 
        onNewProject={createNewSession}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentProject={currentSession}
      />

      <div className="flex">
        {/* Sidebar */}
        <AppleSidebar
          isOpen={sidebarOpen}
          sessions={sessions}
          currentSession={currentSession}
          onSelectSession={selectSession}
          onNewSession={createNewSession}
        />

        {/* Main Content */}
        <main className="flex-1 transition-all duration-300 ease-in-out">
          {currentSession ? (
            <AppleWorkspace
              session={currentSession}
              isGenerating={isGenerating}
              onGenerate={generatePRD}
            />
          ) : (
            <AppleWelcome onNewProject={createNewSession} />
          )}
        </main>
      </div>
    </div>
  );
};

// Mock PRD generator with Apple-style content
const generateMockPRD = (input: string): string => {
  return `# PRD: ${input}

## 概述
${input}的产品需求文档，旨在为开发团队提供清晰的产品方向和实现路径。

## 产品目标
通过${input}解决用户核心需求，提供优雅、直观的用户体验。

### 主要目标
• 提升用户工作效率
• 简化复杂流程
• 创造愉悦的使用体验

## 目标用户

### 主要用户群体
**专业用户** - 需要高效工具的知识工作者
**企业用户** - 寻求团队协作解决方案的组织

### 用户画像
• 年龄：25-45岁
• 职业：产品经理、设计师、开发者
• 技能：熟悉数字化工具

## 核心功能

### 基础功能
1. **用户管理**
   - 账户注册与登录
   - 个人资料管理
   - 权限控制

2. **内容管理**
   - 创建与编辑
   - 版本控制
   - 协作功能

3. **数据分析**
   - 使用统计
   - 性能监控
   - 用户反馈

### 高级功能
• AI 辅助功能
• 自动化工作流
• 第三方集成

## 技术架构

### 前端技术栈
• React 18 + TypeScript
• Tailwind CSS
• Vite

### 后端技术栈
• Node.js + Express
• PostgreSQL
• Redis

### 基础设施
• Docker 容器化
• Kubernetes 编排
• CI/CD 自动化

## 设计原则

### 用户体验
• **简洁** - 去除不必要的复杂性
• **直观** - 符合用户心理模型
• **一致** - 保持界面和交互的统一性

### 视觉设计
• 大量留白
• 优雅的字体排版
• 精细的交互动画

## 开发计划

### 第一阶段（4周）
• 核心功能开发
• 基础架构搭建
• 用户界面实现

### 第二阶段（3周）
• 高级功能开发
• 性能优化
• 安全加固

### 第三阶段（2周）
• 全面测试
• 部署上线
• 监控完善

## 成功指标

### 用户指标
• 用户注册转化率 > 20%
• 日活跃用户留存 > 70%
• 用户满意度评分 > 4.5

### 技术指标
• 页面加载时间 < 1.5s
• API 响应时间 < 300ms
• 系统可用性 > 99.9%

## 风险评估

### 技术风险
• **低风险** - 采用成熟技术栈
• **中风险** - 性能优化挑战

### 市场风险
• **低风险** - 用户需求明确
• **中风险** - 竞品压力

### 资源风险
• **低风险** - 团队经验丰富
• **低风险** - 预算充足

---

*本文档遵循简洁明了的原则，专注于核心需求和实现路径。*

生成时间：${new Date().toLocaleString('zh-CN')}`;
};

export default PRDGeneratorApple;