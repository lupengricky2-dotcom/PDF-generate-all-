# AI PRD Generator - Vercel 部署指南

## 🚀 快速部署到Vercel

### 方法一：一键部署（推荐）

1. **点击Deploy按钮**
   
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/ai-prd-forge)

2. **配置项目**
   - 连接你的GitHub账户
   - 选择仓库名称
   - 点击 "Deploy"

### 方法二：从现有仓库部署

#### 1. 准备Git仓库

首先，将项目推送到GitHub：

```bash
# 在项目根目录
git init
git add .
git commit -m "Initial commit: AI PRD Generator"

# 创建GitHub仓库后
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

#### 2. 部署到Vercel

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 "New Project"
3. 从GitHub导入你的仓库
4. 配置项目设置：
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### 3. 环境变量配置

在Vercel项目设置中添加以下环境变量（如果需要）：

```env
# Dify API配置（已在代码中硬编码，可选）
DIFY_API_KEY=app-uRSuEuFh7i3WOSTVGSQylStu
DIFY_WORKFLOW_ID=27f4e8b1-1200-4289-b5d7-f7f28275c200

# 其他可选配置
NODE_ENV=production
```

#### 4. 部署

点击 "Deploy" 按钮，Vercel将自动：
- 安装依赖
- 构建项目
- 部署应用
- 提供访问链接

## 📁 部署文件结构

部署后，你的项目将包含以下关键文件：

```
ai-prd-forge/
├── api/
│   └── dify-proxy.ts          # Vercel Edge Function (替代Supabase)
├── src/
│   ├── components/
│   ├── services/
│   │   └── universalDifyService.ts  # 智能API服务
│   └── utils/
├── vercel.json               # Vercel配置
└── package.json
```

## 🔧 核心功能说明

### 智能API路由

应用会自动检测运行环境：
- **本地开发**: 使用Supabase Edge Function
- **Vercel生产环境**: 使用Vercel Edge Function (`/api/dify-proxy`)

### Edge Function功能

- ✅ 流式响应支持
- ✅ CORS处理
- ✅ 错误处理和重试
- ✅ 多端点尝试
- ✅ 详细日志记录

## 🛠️ 本地开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run preview
```

## 📋 部署检查清单

在部署前，请确认：

- [ ] 所有文件已提交到Git仓库
- [ ] `vercel.json` 配置文件存在
- [ ] `api/dify-proxy.ts` Edge Function文件存在
- [ ] 构建命令测试通过 (`npm run build`)
- [ ] 没有环境变量依赖问题

## 🔍 故障排除

### 常见问题

1. **部署失败**
   ```bash
   # 本地测试构建
   npm run build
   
   # 检查错误日志
   vercel logs YOUR_PROJECT_URL
   ```

2. **API调用失败**
   - 检查Edge Function日志
   - 确认Dify API Key有效
   - 验证工作流已发布

3. **静态资源404**
   - 确认`vercel.json`中的重写规则
   - 检查构建输出目录配置

### 调试工具

- **Vercel CLI**: `npm i -g vercel`
- **本地测试**: `vercel dev`
- **查看日志**: `vercel logs`

## 🚀 性能优化

部署后的性能特点：

- ⚡ **Edge Function**: 全球分布，低延迟
- 🔄 **流式响应**: 实时PRD生成体验
- 📦 **静态资源**: CDN加速
- 🎯 **自动缓存**: 优化加载速度

## 📞 技术支持

如果遇到部署问题：

1. 检查 [Vercel文档](https://vercel.com/docs)
2. 查看项目Issues
3. 联系项目维护者

---

**部署成功后，你的AI PRD生成器将在几分钟内上线，支持全球访问！** 🎉