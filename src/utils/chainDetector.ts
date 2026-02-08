/**
 * 智能链检测工具
 * 根据地址、交易哈希等格式自动判断可能的链
 */

import { SUPPORTED_CHAINS } from '../types/chain'

export interface ChainMatch {
  chain: typeof SUPPORTED_CHAINS[0]
  confidence: number
  reason: string
}

/**
 * 检测输入可能属于哪些链
 */
export function detectChains(query: string): ChainMatch[] {
  const matches: ChainMatch[] = []
  const trimmedQuery = query.trim()

  // Bitcoin 地址格式 (1, 3, bc1开头)
  if (/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/.test(trimmedQuery) || 
      /^bc1[a-z0-9]{39,59}$/.test(trimmedQuery)) {
    const chain = SUPPORTED_CHAINS.find(c => c.id === 'bitcoin')
    if (chain) {
      matches.push({ chain, confidence: 0.95, reason: 'Bitcoin地址格式' })
    }
  }

  // Bitcoin 交易哈希 (64字符十六进制)
  if (/^[a-fA-F0-9]{64}$/.test(trimmedQuery) && !trimmedQuery.startsWith('0x')) {
    const chain = SUPPORTED_CHAINS.find(c => c.id === 'bitcoin')
    if (chain) {
      matches.push({ chain, confidence: 0.9, reason: 'Bitcoin交易哈希格式' })
    }
  }

  // EVM 地址 (0x开头，42字符)
  if (/^0x[a-fA-F0-9]{40}$/.test(trimmedQuery)) {
    // 所有EVM兼容链都可能是
    const evmChains = SUPPORTED_CHAINS.filter(c => 
      c.id !== 'bitcoin' && c.id !== 'solana' && c.id !== 'cosmos' && c.id !== 'near' && c.id !== 'tron' && c.id !== 'aptos' && c.id !== 'sui'
    )
    evmChains.forEach(chain => {
      matches.push({ 
        chain, 
        confidence: 0.7, 
        reason: 'EVM地址格式（可能属于多个链）' 
      })
    })
  }

  // EVM 交易哈希 (0x开头，66字符)
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmedQuery)) {
    const evmChains = SUPPORTED_CHAINS.filter(c => 
      c.id !== 'bitcoin' && c.id !== 'solana' && c.id !== 'cosmos' && c.id !== 'near' && c.id !== 'tron' && c.id !== 'aptos' && c.id !== 'sui'
    )
    evmChains.forEach(chain => {
      matches.push({ 
        chain, 
        confidence: 0.7, 
        reason: 'EVM交易哈希格式（可能属于多个链）' 
      })
    })
  }

  // Solana 地址 (Base58编码，32-44字符)
  if (/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmedQuery) && 
      !/^0x/.test(trimmedQuery) && 
      !/^[13]/.test(trimmedQuery) && 
      !/^bc1/.test(trimmedQuery)) {
    const chain = SUPPORTED_CHAINS.find(c => c.id === 'solana')
    if (chain) {
      matches.push({ chain, confidence: 0.8, reason: 'Solana地址格式' })
    }
  }

  // Tron 地址 (T开头，34字符)
  if (/^T[A-Za-z1-9]{33}$/.test(trimmedQuery)) {
    const chain = SUPPORTED_CHAINS.find(c => c.id === 'tron')
    if (chain) {
      matches.push({ chain, confidence: 0.95, reason: 'Tron地址格式' })
    }
  }

  // Cosmos 地址 (通常以特定前缀开头)
  if (/^cosmos1[a-z0-9]{38}$/.test(trimmedQuery)) {
    const chain = SUPPORTED_CHAINS.find(c => c.id === 'cosmos')
    if (chain) {
      matches.push({ chain, confidence: 0.95, reason: 'Cosmos地址格式' })
    }
  }

  // NEAR 地址 (通常以.near结尾或特定格式)
  if (trimmedQuery.endsWith('.near') || /^[a-z0-9_-]+$/.test(trimmedQuery)) {
    const chain = SUPPORTED_CHAINS.find(c => c.id === 'near')
    if (chain && trimmedQuery.length < 64) {
      matches.push({ chain, confidence: 0.7, reason: '可能的NEAR地址' })
    }
  }

  // Aptos 地址 (0x开头，但长度不同)
  if (/^0x[a-fA-F0-9]{1,64}$/.test(trimmedQuery) && trimmedQuery.length < 66) {
    const chain = SUPPORTED_CHAINS.find(c => c.id === 'aptos')
    if (chain) {
      matches.push({ chain, confidence: 0.6, reason: '可能的Aptos地址' })
    }
  }

  // Sui 地址 (类似Aptos)
  if (/^0x[a-fA-F0-9]{1,64}$/.test(trimmedQuery) && trimmedQuery.length < 66) {
    const chain = SUPPORTED_CHAINS.find(c => c.id === 'sui')
    if (chain) {
      matches.push({ chain, confidence: 0.6, reason: '可能的Sui地址' })
    }
  }

  // 区块号 (纯数字)
  if (/^\d+$/.test(trimmedQuery)) {
    // 区块号无法直接判断链，需要尝试查询
    // 这里返回所有链，让搜索时尝试
    SUPPORTED_CHAINS.forEach(chain => {
      matches.push({ 
        chain, 
        confidence: 0.3, 
        reason: '区块号（需要查询确认）' 
      })
    })
  }

  // 如果没有匹配，返回所有链（让搜索尝试）
  if (matches.length === 0) {
    SUPPORTED_CHAINS.forEach(chain => {
      matches.push({ 
        chain, 
        confidence: 0.1, 
        reason: '未知格式，将尝试所有链' 
      })
    })
  }

  // 按置信度排序
  return matches.sort((a, b) => b.confidence - a.confidence)
}

/**
 * 检测查询类型
 */
export function detectQueryType(query: string): 'address' | 'transaction' | 'block' | 'unknown' {
  const trimmed = query.trim()
  
  // 交易哈希
  if (/^0x[a-fA-F0-9]{64}$/.test(trimmed) || /^[a-fA-F0-9]{64}$/.test(trimmed)) {
    return 'transaction'
  }
  
  // 区块号
  if (/^\d+$/.test(trimmed)) {
    return 'block'
  }
  
  // 地址
  if (trimmed.length > 20) {
    return 'address'
  }
  
  return 'unknown'
}
