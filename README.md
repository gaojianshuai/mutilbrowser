# MultiChain Explorer - 多链浏览器

一个功能强大、界面炫酷的多链区块链数据浏览器，支持查询交易、地址、区块、Token和NFT等信息。

## ✨ 特性

- 🌐 **多链支持**: 支持 Ethereum、Bitcoin、Polygon、BSC、Solana、Avalanche、Arbitrum、Optimism 等 8+ 主流区块链
- 🔍 **智能搜索**: 自动识别地址、交易哈希、区块号和Token合约
- 📊 **实时数据**: 实时显示链上数据，包括最新区块、Gas价格等
- 🎨 **现代化UI**: 采用玻璃态设计，渐变色彩，流畅动画
- 📱 **响应式设计**: 完美适配桌面和移动设备
- ⚡ **高性能**: 使用 React Query 进行数据缓存和优化

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 配置API密钥（可选）

创建 `.env` 文件并添加你的API密钥：

```env
VITE_ETHERSCAN_API_KEY=CY4TPPYA99GZD1TK18C11WJ3GNTG4V2F52
VITE_POLYGONSCAN_API_KEY=your_polygonscan_api_key
VITE_BSCSCAN_API_KEY=your_bscscan_api_key
VITE_SNOWTRACE_API_KEY=your_snowtrace_api_key
VITE_ARBISCAN_API_KEY=your_arbiscan_api_key
VITE_OPTIMISM_API_KEY=your_optimism_api_key
```

> 注意：即使没有API密钥，大部分功能仍然可以正常工作，但某些链的详细数据可能需要API密钥。

### 启动开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

## 🛠️ 技术栈

- **React 18** - UI框架
- **TypeScript** - 类型安全
- **Vite** - 构建工具
- **React Router** - 路由管理
- **React Query** - 数据获取和缓存
- **Tailwind CSS** - 样式框架
- **Framer Motion** - 动画库
- **Lucide React** - 图标库
- **Axios** - HTTP客户端

## 📖 使用说明

### 搜索功能

1. 在主页面选择要查询的区块链
2. 输入以下任意内容：
   - **地址**: 0x开头的42字符地址
   - **交易哈希**: 0x开头的66字符哈希
   - **区块号**: 纯数字
   - **Token合约**: Token合约地址
3. 点击搜索按钮或按回车

### 支持的查询类型

- **地址查询**: 查看地址余额、交易历史等
- **交易查询**: 查看交易详情、Gas费用等
- **区块查询**: 查看区块信息、包含的交易等
- **Token查询**: 查看Token信息、总供应量等

## 🎯 功能对比

相比传统区块链浏览器，本项目的优势：

- ✅ 更炫酷的UI设计（玻璃态、渐变、动画）
- ✅ 多链统一界面，无需切换网站
- ✅ 智能搜索，自动识别查询类型
- ✅ 实时数据更新
- ✅ 更好的移动端体验
- ✅ 更多实用功能（数据分析、可视化等）

## 📝 开发计划

- [ ] NFT查询和展示
- [ ] 数据可视化图表
- [ ] 地址标签和备注
- [ ] 交易追踪
- [ ] 多地址对比
- [ ] 价格走势图
- [ ] 更多区块链支持

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！
