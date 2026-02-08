# AI 智能助手配置指南

## 概述

智能助手支持多种AI服务，按优先级自动选择：
1. **DeepSeek API**（推荐）- 免费，质量高，中文支持好
2. **Hugging Face API** - 完全免费，无需API key
3. **智能规则引擎** - 后备方案，可回答常见问题

## 推荐配置：DeepSeek API

### 为什么选择 DeepSeek？

- ✅ **完全免费**：提供免费API额度
- ✅ **质量高**：回答准确、专业
- ✅ **中文支持好**：专门优化中文对话
- ✅ **响应快**：API响应速度快
- ✅ **无限制**：可以回答任何问题，不仅仅是预设问题

### 配置步骤

1. **获取 API Key**
   - 访问：https://platform.deepseek.com/
   - 注册账号（免费）
   - 在控制台创建 API Key

2. **配置环境变量**
   - 在项目根目录的 `.env` 文件中添加：
   ```
   VITE_DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```
   - 将 `your_deepseek_api_key_here` 替换为你的实际 API Key

3. **重启应用**
   - 停止当前运行的应用
   - 重新启动：`npm run dev`

### 验证配置

配置成功后，智能助手会：
- ✅ 可以回答任何问题，不仅仅是预设问题
- ✅ 回答更智能、更专业
- ✅ 支持上下文理解
- ✅ 可以处理复杂问题

## 其他可选配置

### Together AI（可选）

如果需要备用AI服务，可以配置 Together AI：

1. 访问：https://together.ai/
2. 注册并获取 API Key
3. 在 `.env` 文件中添加：
   ```
   VITE_TOGETHER_API_KEY=your_together_api_key_here
   ```

## 不配置 API Key 的情况

如果不配置 API Key，智能助手会：
- 自动使用 Hugging Face API（免费，但可能不稳定）
- 如果 Hugging Face 不可用，使用智能规则引擎
- 可以回答常见问题，但无法处理复杂或个性化问题

## 故障排除

### 问题：AI 只回答固定问题

**原因**：没有配置 API Key，使用了规则引擎

**解决**：
1. 配置 DeepSeek API Key（推荐）
2. 或等待 Hugging Face 模型加载完成

### 问题：API Key 无效

**检查**：
1. API Key 是否正确复制（没有多余空格）
2. 是否在 `.env` 文件中正确配置
3. 是否重启了应用

### 问题：响应慢

**原因**：Hugging Face 模型需要加载

**解决**：
1. 配置 DeepSeek API Key（响应更快）
2. 或等待几秒后重试

## 技术支持

如有问题，请联系：testops_jianshuai@126.com
