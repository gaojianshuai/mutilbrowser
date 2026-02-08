# API Keys 配置指南

## 免费 API Keys 获取方式

本项目已经配置了免费的公开 RPC 节点，即使没有 API key 也能正常工作。但为了获得更完整的功能（如交易历史、Token 信息等），建议配置免费的 API keys。

### 1. Ethereum (Etherscan)
- **获取地址**: https://etherscan.io/apis
- **免费 Tier**: 5 calls/sec, 100,000 calls/day
- **配置**: `VITE_ETHERSCAN_API_KEY=your_key`

### 2. Polygon (Polygonscan)
- **获取地址**: https://polygonscan.com/apis
- **免费 Tier**: 5 calls/sec, 100,000 calls/day
- **配置**: `VITE_POLYGONSCAN_API_KEY=your_key`

### 3. BSC (BscScan)
- **获取地址**: https://bscscan.com/apis
- **免费 Tier**: 5 calls/sec, 100,000 calls/day
- **配置**: `VITE_BSCSCAN_API_KEY=your_key`

### 4. Avalanche (Snowtrace)
- **获取地址**: https://snowtrace.io/apis
- **免费 Tier**: 5 calls/sec, 100,000 calls/day
- **配置**: `VITE_SNOWTRACE_API_KEY=your_key`

### 5. Arbitrum (Arbiscan)
- **获取地址**: https://arbiscan.io/apis
- **免费 Tier**: 5 calls/sec, 100,000 calls/day
- **配置**: `VITE_ARBISCAN_API_KEY=your_key`

### 6. Optimism
- **获取地址**: https://optimistic.etherscan.io/apis
- **免费 Tier**: 5 calls/sec, 100,000 calls/day
- **配置**: `VITE_OPTIMISM_API_KEY=your_key`

## 完全免费的链（无需 API Key）

以下链完全免费，无需配置 API key：

- **Bitcoin**: 使用 Blockstream API（完全免费）
- **Solana**: 使用公共 RPC 节点（完全免费）

## 免费 RPC 节点

项目已配置多个免费的公开 RPC 节点，包括：

- **LlamaRPC**: https://eth.llamarpc.com
- **Ankr**: https://rpc.ankr.com
- **PublicNode**: https://ethereum.publicnode.com
- **DRPC**: https://eth.drpc.org
- **1RPC**: https://1rpc.io

这些节点提供故障转移机制，如果一个节点不可用，会自动切换到下一个。

## 配置步骤

1. 创建 `.env` 文件（如果还没有）
2. 添加你的 API keys：
   ```env
   VITE_ETHERSCAN_API_KEY=your_etherscan_key_here
   VITE_POLYGONSCAN_API_KEY=your_polygonscan_key_here
   # ... 其他 keys
   ```
3. 重启开发服务器

## 验证 API Keys

在应用首页的 API 状态面板中，你可以：
- 查看所有链的 API 状态
- 验证 API keys 是否有效
- 查看是否在使用 RPC 回退

## 注意事项

- 所有 API 都提供免费 tier，但需要注册账号
- 免费 tier 有速率限制（通常 5 calls/sec）
- 如果没有 API key，系统会自动使用 RPC 节点（功能可能受限）
- RPC 节点完全免费，但可能不支持所有功能（如交易历史）
