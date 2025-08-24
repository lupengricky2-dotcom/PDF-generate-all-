import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles, Lightbulb, Target, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneratorCardProps {
  onGenerate: (input: string) => void;
  isGenerating: boolean;
  disabled: boolean;
}

export const GeneratorCard: React.FC<GeneratorCardProps> = ({ 
  onGenerate, 
  isGenerating, 
  disabled 
}) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isGenerating && !disabled) {
      onGenerate(input.trim());
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const examplePrompts = [
    {
      icon: Target,
      title: "在线教育平台",
      description: "设计一个面向K12学生的在线学习平台，包含课程管理、作业系统和进度跟踪"
    },
    {
      icon: Users,
      title: "团队协作工具",
      description: "开发企业内部项目管理工具，支持任务分配、进度监控和团队沟通"
    },
    {
      icon: Zap,
      title: "智能客服系统",
      description: "构建AI驱动的客服机器人，提供7x24小时客户支持和问题解答"
    }
  ];

  return (
    <div className="card-modern">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">PRD生成器</h3>
            <p className="text-sm text-muted-foreground">描述您的产品需求，AI将生成专业PRD文档</p>
          </div>
        </div>

        {/* Quick Examples */}
        {input === '' && (
          <div className="mb-6 animate-fade-in">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">快速开始</span>
            </div>
            <div className="grid gap-3">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt.description)}
                  disabled={disabled || isGenerating}
                  className="text-left p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-accent transition-all group"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                      <prompt.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm mb-1">{prompt.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {prompt.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="详细描述您的产品需求：目标用户、核心功能、业务目标、技术要求等..."
              className="min-h-[120px] pr-12 resize-none text-sm"
              disabled={disabled || isGenerating}
            />
            <div className="absolute bottom-3 right-3">
              <Sparkles className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>按 Enter 发送，Shift + Enter 换行</span>
              <span className={cn(
                "px-2 py-1 rounded-full",
                input.length > 500 ? "bg-red-100 text-red-600" : "bg-muted"
              )}>
                {input.length}/1000
              </span>
            </div>
            
            <Button
              type="submit"
              disabled={!input.trim() || isGenerating || disabled || input.length > 1000}
              className={cn(
                "gap-2 min-w-[120px] gradient-primary text-white",
                isGenerating && "cursor-not-allowed opacity-70"
              )}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  生成PRD
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/10">
          <div className="flex items-start gap-3">
            <div className="w-5 h-5 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Lightbulb className="w-3 h-3 text-primary" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-primary mb-1">💡 生成更好PRD的技巧</p>
              <ul className="text-muted-foreground space-y-1 text-xs">
                <li>• 明确描述目标用户群体和使用场景</li>
                <li>• 列出核心功能需求和优先级</li>
                <li>• 说明业务目标和成功指标</li>
                <li>• 提及技术约束和预算考虑</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};