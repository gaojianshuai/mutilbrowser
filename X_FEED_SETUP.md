# X 动态功能配置指南

## 概述

X 动态功能可以实时显示币圈热点动态和行业大佬的最新动态。系统使用多层数据源确保数据的真实性和实时性。

## 数据源优先级

1. **Twitter API v2**（推荐）- 需要 API key，数据最完整、最实时
2. **RSS Feed**（备用）- 无需 API key，使用 Nitter RSS
3. **其他数据源**（补充）

## 配置 Twitter API（推荐）

### 步骤 1: 获取 Twitter Bearer Token

1. 访问 [Twitter Developer Portal](https://developer.twitter.com/)
2. 注册/登录 Twitter 开发者账号
3. 创建新应用（App）
4. 在应用的 "Keys and tokens" 页面获取 **Bearer Token**

### 步骤 2: 配置环境变量

在项目根目录的 `.env` 文件中添加：

```
VITE_TWITTER_BEARER_TOKEN=your_bearer_token_here
```

### 步骤 3: 重启应用

```bash
npm run dev
```

## 不配置 API Key 的情况

如果不配置 Twitter Bearer Token，系统会自动使用备用方案：

- **RSS Feed**: 通过 Nitter 获取 Twitter RSS 数据
- 支持的主要账号：
  - @elonmusk
  - @VitalikButerin
  - @binance
  - @coinbase
  - @cz_binance

## 功能特点

### 分类筛选

- **全部**: 显示所有动态
- **币圈热点**: 包含加密货币相关关键词的动态
- **大佬动态**: 行业知名人士的动态
- **新闻资讯**: 交易所和项目的官方公告

### 实时更新

- 自动刷新：每60秒自动更新
- 手动刷新：点击刷新按钮立即更新
- 窗口聚焦刷新：切换回页面时自动更新

### 显示内容

- 作者信息（头像、名称、认证标识）
- 推文内容
- 互动数据（点赞、转发、回复）
- 发布时间（相对时间）
- 原文链接

## 监控的账号

系统默认监控以下重要账号：

### 行业大佬
- @elonmusk - 埃隆·马斯克
- @VitalikButerin - 以太坊创始人
- @cz_binance - 币安CEO

### 交易所
- @binance - 币安
- @coinbase - Coinbase

### 其他重要账号
- 更多账号可根据需要添加

## 故障排除

### 问题：没有显示任何动态

**可能原因**：
1. Twitter API key 未配置或无效
2. RSS 服务不可用
3. 网络连接问题

**解决方案**：
1. 检查 API key 是否正确配置
2. 查看浏览器控制台的错误信息
3. 尝试手动刷新

### 问题：数据更新不及时

**解决方案**：
1. 点击刷新按钮手动更新
2. 检查网络连接
3. 确认 API key 有效

### 问题：某些账号没有动态

**可能原因**：
1. 账号设置了隐私保护
2. RSS 服务不支持该账号
3. API 权限不足

**解决方案**：
1. 配置 Twitter API key 以获得完整访问
2. 检查账号是否公开

## 技术支持

如有问题，请联系：testops_jianshuai@126.com
