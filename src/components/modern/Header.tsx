import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, History, Sparkles, Menu } from 'lucide-react';
import { PRDSession } from '../PRDGeneratorModern';

interface HeaderProps {
  onNewProject: () => void;
  onShowHistory: () => void;
  currentProject: PRDSession | null;
  showHistory: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onNewProject,
  onShowHistory,
  currentProject,
  showHistory
}) => {
  return (
    <header className="sticky top-0 z-50 card-glass border-b border-border/50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">AI PRD生成器</h1>
              <p className="text-xs text-muted-foreground">智能产品需求文档生成工具</p>
            </div>
          </div>

          {/* Current Project Info */}
          {currentProject && (
            <div className="hidden md:flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${
                  currentProject.status === 'completed' ? 'status-success' :
                  currentProject.status === 'exported' ? 'status-info' : 'status-warning'
                }`} />
                <span className="font-medium">{currentProject.title}</span>
              </div>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                {currentProject.messages.length / 2}轮对话
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowHistory}
              className="lg:hidden"
            >
              <Menu className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={onShowHistory}
              className={`hidden lg:flex ${showHistory ? 'bg-accent' : ''}`}
            >
              <History className="w-4 h-4" />
              历史记录
            </Button>

            <Button
              onClick={onNewProject}
              size="sm"
              className="gradient-primary text-white hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              新建项目
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};