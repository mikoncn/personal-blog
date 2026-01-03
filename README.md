# GeekBlog (极客博客) - Cyberpunk Style

GeekBlog 是一个视觉风格独特的全栈博客应用，采用了经典的 **赛博朋克 (Cyberpunk)** 美学设计。项目不仅拥有酷炫的前端交互（Matrix 数字雨、CRT 扫描线），在架构上也遵循了现代化开发的最佳实践。

## 🚀 项目亮点

- **沉浸式视觉体验**: 
  - 集成 `HTML5 Canvas` 实现黑客帝国风格的数字雨背景。
  - 使用 CSS 伪元素模拟老式 CRT 显示器的扫描线效果。
- **现代化技术栈**: 基于 Vue 3 (Composition API) 和 Vite 构建，享受极致的开发体验。
- **全栈无服务架构**: 后端直接对接 **Supabase**，无需维护服务器即可拥有完整的 Database 和 Auth 能力。
- **组件化设计**: 代码高内聚低耦合，业务逻辑与视图分离。

## 🛠️ 技术栈架构

### 前端 (Frontend)
- **核心框架**: [Vue 3](src/main.js)
- **构建工具**: [Vite](vite.config.js)
- **路由管理**: Vue Router 4 (SPA 单页应用)
- **样式方案**: 原生 CSS + CSS3 Animations

### 后端 (Backend / BaaS)
- **Core**: Supabase
- **Database**: PostgreSQL
- **Auth**: Supabase Auth (支持邮箱、第三方登录)

## 📂 核心架构分析

通过对源码的静态分析，本项目采用了以下设计模式：

### 1. 业务逻辑分层 (Service Pattern)
项目避免了在 Vue 组件中直接调用 Supabase API，而是将数据交互封装在独立的 Service 层中。
*   **代码位置**: `src/services/` (如 `postService.js`)
*   **优势**: 提高代码可复用性和可维护性，视图层专注于展示。

### 2. 全局状态管理 (State Management)
*   **实现方式**: 利用 Vue 3 的 `provide / inject` 机制。
*   **逻辑入口**: `src/App.vue`
*   **流程**: `App.vue` 在挂载时监听 Supabase 认证状态，将 `currentUser` 下发给所有子组件，实现了轻量级的全局用户状态管理，避免了引入重型状态库 (Pinia/Vuex)。

### 3. 路由结构
路由配置位于 `src/router/index.js`，主要包含：
*   `/`: 首页 (展示文章列表)
*   `/post/:id`: 文章详情 (支持 Markdown 渲染)
*   `/make-post`: 内容创作 (CMS 功能)
*   `/login` & `/register`: 用户认证体系

## 🏁 快速开始 (Getting Started)

### 1. 环境准备
确保您的环境已安装：
- Node.js (推荐 LTS 版本)
- Git

### 2. 安装依赖
```bash
npm install
```

### 3. 本地开发
```bash
npm run dev
```
启动后访问 `http://localhost:3000` 即可预览。

### 4. 环境变量配置
请确保根目录下 `.env` 文件已配置正确的 Supabase 凭证：
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

## 📄 许可证
MIT License
