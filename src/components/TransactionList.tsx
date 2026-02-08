import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Clock, Hash, TrendingUp } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { SUPPORTED_CHAINS } from '../types/chain'

interface Transaction {
  hash: string
  from: string
  to: string
  value: number
  blockNumber?: number | null
  timestamp?: number
  gas?: number
  gasPrice?: number
  chain: string
}

interface TransactionListProps {
  transactions: Transaction[]
  title: string
  icon?: React.ReactNode
  isLoading?: boolean
  lastUpdated?: number
}

export default function TransactionList({ transactions, title, icon, isLoading, lastUpdated }: TransactionListProps) {
  const formatAddress = (address: string) => {
    if (address === 'N/A') return address
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatValue = (value: number, chainId: string) => {
    const chain = SUPPORTED_CHAINS.find(c => c.id === chainId)
    const symbol = chain?.symbol || 'ETH'
    
    if (value >= 1000) {
      return `${(value / 1000).toFixed(2)}K ${symbol}`
    }
    return `${value.toFixed(4)} ${symbol}`
  }

  if (isLoading) {
    return (
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          {icon || <Hash className="w-6 h-6 text-cyan-400" />}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="glass rounded-lg p-4 animate-pulse">
              <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-white/5 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (!transactions || transactions.length === 0) {
    return (
      <div className="glass-strong rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-4">
          {icon || <Hash className="w-6 h-6 text-cyan-400" />}
          <h2 className="text-2xl font-bold">{title}</h2>
        </div>
        <div className="text-center py-8 text-gray-400">
          暂无交易数据
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-soft rounded-2xl p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {icon || <Hash className="w-6 h-6 text-cyan-400" />}
          <h2 className="text-2xl font-bold text-gray-200">{title}</h2>
          <span className="text-sm text-gray-500">({transactions.length})</span>
        </div>
        {lastUpdated && (
          <div className="text-xs text-gray-500">
            {formatDistanceToNow(new Date(lastUpdated), { addSuffix: true, locale: zhCN })}
          </div>
        )}
      </div>
      
      <div className="space-y-2 max-h-[600px] overflow-y-auto custom-scrollbar">
        {transactions.map((tx, index) => (
          <motion.div
            key={tx.hash}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.5) }}
          >
            <Link
              to={`/tx/${tx.chain}/${tx.hash}`}
              className="block bg-gray-900/40 hover:bg-gray-900/60 rounded-lg p-4 transition-all group border border-gray-800/50 hover:border-gray-700/70"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Hash className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <code className="text-sm text-cyan-300/80 break-all group-hover:text-cyan-200 font-mono">
                      {tx.hash.slice(0, 16)}...{tx.hash.slice(-8)}
                    </code>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm mb-3">
                    <div>
                      <span className="text-gray-500 text-xs">From: </span>
                      <Link
                        to={`/address/${tx.chain}/${tx.from}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-300 hover:text-cyan-300 font-mono"
                      >
                        {formatAddress(tx.from)}
                      </Link>
                    </div>
                    <div>
                      <span className="text-gray-500 text-xs">To: </span>
                      <Link
                        to={`/address/${tx.chain}/${tx.to}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-300 hover:text-cyan-300 font-mono"
                      >
                        {formatAddress(tx.to)}
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-3 text-xs">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-800/50 rounded border border-gray-700/30">
                      <TrendingUp className="w-3 h-3 text-green-400" />
                      <span className="font-semibold text-green-300">
                        {formatValue(tx.value, tx.chain)}
                      </span>
                    </div>
                    {tx.blockNumber && (
                      <Link
                        to={`/block/${tx.chain}/${tx.blockNumber}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-gray-400 hover:text-cyan-300"
                      >
                        Block #{tx.blockNumber}
                      </Link>
                    )}
                    {tx.timestamp && (
                      <div className="flex items-center gap-1 text-gray-500">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(tx.timestamp * 1000), {
                          addSuffix: true,
                          locale: zhCN,
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-300 transition-colors flex-shrink-0 mt-1" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
