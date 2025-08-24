import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InputAreaProps {
  onGenerate: (input: string) => void;
  isGenerating: boolean;
  disabled: boolean;
}

export const InputArea: React.FC<InputAreaProps> = ({ 
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
    "设计一个在线教育平台的用户管理系统",
    "开发一个企业内部的项目协作工具",
    "创建一个电商平台的订单管理功能",
    "构建一个智能客服机器人系统"
  ];

  return (
    <div className="border-t border-border bg-card/30 backdrop-blur-sm">
      <div className="max-w-4xl mx-auto p-6">
        {/* Example prompts */}
        {input === '' && (
          <div className="mb-4 animate-fade-in">
            <p className="text-sm text-muted-foreground mb-3">试试这些示例：</p>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt)}
                  className="text-xs px-3 py-2 rounded-lg border border-border bg-background hover:bg-accent transition-colors"
                  disabled={disabled || isGenerating}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="描述您的产品需求要点，AI将帮您生成专业的PRD文档..."
              className="min-h-[100px] pr-12 resize-none"
              disabled={disabled || isGenerating}
            />
            <div className="absolute bottom-3 right-3">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>按 Enter 发送，Shift + Enter 换行</span>
            </div>
            
            <Button
              type="submit"
              variant="prd"
              disabled={!input.trim() || isGenerating || disabled}
              className={cn(
                "gap-2 min-w-[100px]",
                isGenerating && "cursor-not-allowed"
              )}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  生成中
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  生成PRD
                </>
              )}
            </Button>
          </div>
        </form>

        {/* Tips */}
        <div className="mt-4 text-xs text-muted-foreground">
          <p>💡 提示：详细描述您的产品需求，包括目标用户、核心功能、预期目标等，可以获得更准确的PRD文档</p>
        </div>
      </div>
    </div>
  );
};