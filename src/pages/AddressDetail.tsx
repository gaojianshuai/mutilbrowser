import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, ArrowRight, Clock, Hash } from 'lucide-react'
import { blockchainAPI } from '../services/api'
import { SUPPORTED_CHAINS } from '../types/chain'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function AddressDetail() {
  const { chain: chainId, address } = useParams<{ chain: string; address: string }>()
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId) || SUPPORTED_CHAINS[0]

  const { data, isLoading, error } = useQuery(
    ['address', chainId, address],
    () => blockchainAPI.getAddressInfo(address!, chain),
    { enabled: !!address && !!chainId }
  )

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-xl">加载中...</div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="text-center min-h-[400px] flex items-center justify-center">
        <div className="text-red-400">加载失败，请检查地址是否正确</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-2xl p-6"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="text-4xl">{chain.icon}</div>
          <div>
            <h1 className="text-2xl font-bold">{chain.name} 地址</h1>
            <p className="text-gray-400 text-sm">地址详情</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 bg-black/20 rounded-lg">
          <code className="flex-1 text-sm break-all">{address}</code>
          <button
            onClick={() => copyToClipboard(address!)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={`${chain.explorerUrl}/address/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* Balance Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-strong rounded-2xl p-6"
      >
        <h2 className="text-xl font-semibold mb-4">余额</h2>
        <div className="text-4xl font-bold text-gradient">
          {data.balance?.toFixed(6) || '0'} {chain.symbol}
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <div className="text-sm text-gray-400 mb-2">交易数量</div>
          <div className="text-2xl font-bold">{(data as any).transactionCount || 0}</div>
        </motion.div>
      </div>

      {/* Transactions */}
      {(data as any).transactions && (data as any).transactions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-strong rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">最近交易</h2>
          <div className="space-y-3">
            {(data as any).transactions.slice(0, 10).map((tx: any, index: number) => (
              <Link
                key={tx.hash || index}
                to={`/tx/${chainId}/${tx.hash || tx.txid}`}
                className="block glass rounded-lg p-4 hover:bg-white/10 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Hash className="w-4 h-4 text-gray-400" />
                    <code className="text-sm">{tx.hash || tx.txid}</code>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
                {tx.timeStamp && (
                  <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(parseInt(tx.timeStamp) * 1000), {
                      addSuffix: true,
                      locale: zhCN,
                    })}
                  </div>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
