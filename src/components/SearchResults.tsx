import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ExternalLink, ArrowRight, Hash, MapPin, Layers } from 'lucide-react'
import { Chain, SUPPORTED_CHAINS } from '../types/chain'

export interface SearchResult {
  chain: Chain
  type: 'address' | 'transaction' | 'block'
  data: any
  query: string
}

interface SearchResultsProps {
  results: SearchResult[]
  isLoading: boolean
  query: string
}

export default function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6"
      >
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mb-4"></div>
          <div className="text-gray-400">正在搜索 {query}...</div>
        </div>
      </motion.div>
    )
  }

  if (results.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6"
      >
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">未找到结果</div>
          <div className="text-sm text-gray-500">请检查输入是否正确</div>
        </div>
      </motion.div>
    )
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'transaction':
        return <Hash className="w-5 h-5 text-cyan-400" />
      case 'address':
        return <MapPin className="w-5 h-5 text-green-400" />
      case 'block':
        return <Layers className="w-5 h-5 text-purple-400" />
      default:
        return <Hash className="w-5 h-5" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'transaction':
        return '交易'
      case 'address':
        return '地址'
      case 'block':
        return '区块'
      default:
        return '未知'
    }
  }

  const formatValue = (data: any, type: string, chainId: string) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)
    const symbol = chain?.symbol || 'ETH'
    
    if (type === 'address') {
      if (data.balance !== undefined) {
        return `余额: ${data.balance.toFixed(6)} ${symbol}`
      }
      if (data.transactionCount !== undefined) {
        return `交易数: ${data.transactionCount}`
      }
      return '地址'
    }
    if (type === 'transaction') {
      if (data.value !== undefined) {
        return `金额: ${data.value.toFixed(6)} ${symbol}`
      }
      if (data.blockNumber) {
        return `区块: #${data.blockNumber.toLocaleString()}`
      }
      return '交易'
    }
    if (type === 'block') {
      if (data.number) {
        return `区块 #${data.number.toLocaleString()}`
      }
      if (data.height) {
        return `区块 #${data.height.toLocaleString()}`
      }
      return '区块'
    }
    return '详情'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-6"
    >
      <h2 className="text-2xl font-bold mb-4">搜索结果</h2>
      <div className="space-y-3">
        {results.map((result, index) => (
          <motion.div
            key={`${result.chain.id}-${index}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Link
              to={
                result.type === 'transaction'
                  ? `/tx/${result.chain.id}/${result.query}`
                  : result.type === 'block'
                  ? `/block/${result.chain.id}/${result.query}`
                  : `/address/${result.chain.id}/${result.query}`
              }
              className="block glass rounded-lg p-4 hover:bg-gray-800/30 transition-all group border border-gray-800/30"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className="text-3xl flex-shrink-0">{result.chain.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {getTypeIcon(result.type)}
                      <span className="text-sm font-semibold text-gray-300">
                        {result.chain.name}
                      </span>
                      <span className="text-xs px-2 py-0.5 bg-cyan-500/20 text-cyan-300 rounded">
                        {getTypeLabel(result.type)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 truncate font-mono">
                      {result.query.length > 42 ? `${result.query.slice(0, 20)}...${result.query.slice(-20)}` : result.query}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatValue(result.data, result.type, result.chain.id)}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <a
                    href={`${result.chain.explorerUrl}/${result.type === 'transaction' ? 'tx' : result.type === 'block' ? 'block' : 'address'}/${result.query}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 hover:bg-white/10 rounded transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 text-gray-400" />
                  </a>
                  <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-cyan-400 transition-colors" />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
