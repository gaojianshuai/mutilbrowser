/**
 * API 验证工具
 * 用于验证配置的 API keys 是否可用
 */

import { blockchainAPI } from '../services/api'

export interface ValidationResult {
  chain: string
  valid: boolean
  message: string
  hasApiKey: boolean
  usingRpc: boolean
}

/**
 * 检查环境变量中是否有 API key
 */
function hasApiKeyInEnv(chainId: string): boolean {
  const env = import.meta.env
  const upperChainId = chainId.toUpperCase()
  
  // 直接访问已知的环境变量键
  const key1 = `VITE_${upperChainId}_API_KEY`
  const key2 = `VITE_${upperChainId}SCAN_API_KEY`
  
  // 使用类型安全的方式访问
  const value1 = env[key1 as keyof typeof env]
  const value2 = env[key2 as keyof typeof env]
  
  return !!(value1 || value2)
}

/**
 * 验证所有 API keys
 */
export async function validateAllApis(): Promise<ValidationResult[]> {
  const results = await blockchainAPI.validateApiKeys()
  const validationResults: ValidationResult[] = []

  for (const [chainId, result] of Object.entries(results)) {
    validationResults.push({
      chain: chainId,
      valid: result.valid,
      message: result.message,
      hasApiKey: hasApiKeyInEnv(chainId),
      usingRpc: !result.valid || result.message.includes('RPC'),
    })
  }

  return validationResults
}

/**
 * 验证单个 API key
 */
export async function validateApiKey(chainId: string): Promise<ValidationResult> {
  const results = await blockchainAPI.validateApiKeys()
  const result = results[chainId] || { valid: false, message: 'Chain not found' }
  
  return {
    chain: chainId,
    valid: result.valid,
    message: result.message,
    hasApiKey: hasApiKeyInEnv(chainId),
    usingRpc: !result.valid || result.message.includes('RPC'),
  }
}
