import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Menu, FileText } from 'lucide-react';
import { PRDSession } from '../PRDGeneratorApple';

interface AppleNavBarProps {
  onNewProject: () => void;
  onToggleSidebar: () => void;
  currentProject: PRDSession | null;
}

export const AppleNavBar: React.FC<AppleNavBarProps> = ({
  onNewProject,
  onToggleSidebar,
  currentProject
}) => {
  return (
    <nav className="h-16 bg-white/80 backdrop-blur-xl border-b border-apple-border sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleSidebar}
            className="lg:hidden hover:bg-apple-light-gray"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 bg-apple-blue rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg text-foreground">PRD Generator</h1>
            </div>
          </div>
        </div>

        {/* Center - Current Project */}
        {currentProject && (
          <div className="hidden md:flex items-center gap-2 text-sm">
            <div className={`w-2 h-2 rounded-full ${
              currentProject.status === 'completed' ? 'bg-green-500' :
              currentProject.status === 'exported' ? 'bg-blue-500' : 
              'bg-yellow-500'
            }`} />
            <span className="font-medium text-foreground">{currentProject.title}</span>
            <span className="text-apple-gray">•</span>
            <span className="text-apple-gray">
              {Math.floor(currentProject.messages.length / 2)} 轮对话
            </span>
          </div>
        )}

        {/* Right side */}
        <Button
          onClick={onNewProject}
          className="apple-button text-sm"
        >
          <Plus className="w-4 h-4" />
          新建
        </Button>
      </div>
    </nav>
  );
};