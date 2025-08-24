import React from 'react';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Target, Users, Zap } from 'lucide-react';

interface AppleWelcomeProps {
  onNewProject: () => void;
}

export const AppleWelcome: React.FC<AppleWelcomeProps> = ({ onNewProject }) => {
  const features = [
    {
      icon: Target,
      title: "智能分析",
      description: "AI深度理解您的需求，生成结构化PRD文档"
    },
    {
      icon: Users, 
      title: "团队协作",
      description: "支持多人协作编辑，实时同步文档状态"
    },
    {
      icon: Zap,
      title: "快速生成",
      description: "几分钟内完成专业级PRD文档的创建"
    }
  ];

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-12">
      <div className="text-center max-w-4xl mx-auto">
        {/* Main icon */}
        <div className="w-24 h-24 bg-apple-blue rounded-3xl flex items-center justify-center mx-auto mb-8 apple-scale">
          <FileText className="w-12 h-12 text-white" />
        </div>

        {/* Title */}
        <h1 className="text-5xl font-bold text-foreground mb-4 apple-fade-in">
          PRD Generator
        </h1>
        
        <p className="apple-subtitle mb-12 max-w-2xl mx-auto apple-fade-in">
          使用AI技术快速生成专业的产品需求文档，让产品规划更高效、更精准
        </p>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="apple-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="apple-card p-8 hover:apple-scale">
                <div className="w-12 h-12 bg-apple-light-gray rounded-xl flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="w-6 h-6 text-apple-blue" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">{feature.title}</h3>
                <p className="apple-body">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="apple-fade-in">
          <Button
            onClick={onNewProject}
            className="apple-button text-lg px-8 py-4 h-auto"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            开始创建PRD
          </Button>
          
          <p className="text-sm text-apple-gray mt-4">
            免费使用，无需注册
          </p>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto apple-fade-in">
          <div>
            <div className="text-2xl font-bold text-foreground">10K+</div>
            <div className="text-sm text-apple-gray">已生成文档</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">5分钟</div>
            <div className="text-sm text-apple-gray">平均生成时间</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-foreground">98%</div>
            <div className="text-sm text-apple-gray">用户满意度</div>
          </div>
        </div>
      </div>
    </div>
  );
};