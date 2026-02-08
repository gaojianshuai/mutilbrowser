import { useParams } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, Hash, Clock, FileText } from 'lucide-react'
import { blockchainAPI } from '../services/api'
import { SUPPORTED_CHAINS } from '../types/chain'
import { formatDistanceToNow } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function BlockDetail() {
  const { chain: chainId, number } = useParams<{ chain: string; number: string }>()
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId) || SUPPORTED_CHAINS[0]

  const { data, isLoading, error } = useQuery(
    ['block', chainId, number],
    () => blockchainAPI.getBlockInfo(number!, chain),
    { enabled: !!number && !!chainId }
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
        <div className="text-red-400">加载失败，请检查区块号是否正确</div>
      </div>
    )
  }

  const timestamp = data.timestamp
    ? new Date(typeof data.timestamp === 'number' ? data.timestamp * 1000 : data.timestamp)
    : null

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
            <h1 className="text-2xl font-bold">区块 #{data.number || data.height || data.slot}</h1>
            <p className="text-gray-400 text-sm">{chain.name}</p>
          </div>
        </div>

        {data.hash && (
          <div className="flex items-center gap-2 p-4 bg-black/20 rounded-lg">
            <Hash className="w-4 h-4 text-gray-400" />
            <code className="flex-1 text-sm break-all">{data.hash}</code>
            <button
              onClick={() => copyToClipboard(data.hash!)}
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <Copy className="w-4 h-4" />
            </button>
            <a
              href={`${chain.explorerUrl}/block/${data.number || data.height || data.slot}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 hover:bg-white/10 rounded transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </motion.div>

      {/* Block Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {timestamp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm text-gray-400">时间戳</h3>
            </div>
            <div className="text-lg font-semibold">
              {formatDistanceToNow(timestamp, { addSuffix: true, locale: zhCN })}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {timestamp.toLocaleString('zh-CN')}
            </div>
          </motion.div>
        )}

        {data.transactions !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm text-gray-400">交易数量</h3>
            </div>
            <div className="text-2xl font-bold">{data.transactions}</div>
          </motion.div>
        )}

        {data.gasUsed && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-sm text-gray-400 mb-2">Gas使用量</h3>
            <div className="text-xl font-semibold">{data.gasUsed.toLocaleString()}</div>
            {data.gasLimit && (
              <div className="text-xs text-gray-400 mt-1">
                限制: {data.gasLimit.toLocaleString()}
              </div>
            )}
          </motion.div>
        )}

        {data.size && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-sm text-gray-400 mb-2">区块大小</h3>
            <div className="text-xl font-semibold">{(data.size / 1024).toFixed(2)} KB</div>
          </motion.div>
        )}

        {data.weight && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-xl p-6"
          >
            <h3 className="text-sm text-gray-400 mb-2">权重</h3>
            <div className="text-xl font-semibold">{data.weight}</div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
