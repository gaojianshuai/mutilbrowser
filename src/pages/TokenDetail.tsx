import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, DollarSign } from 'lucide-react'
import { blockchainAPI } from '../services/api'
import { SUPPORTED_CHAINS } from '../types/chain'

export default function TokenDetail() {
  const { chain: chainId, address } = useParams<{ chain: string; address: string }>()
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId) || SUPPORTED_CHAINS[0]

  const { data, isLoading, error } = useQuery(
    ['token', chainId, address],
    () => blockchainAPI.getTokenInfo(address!, chain),
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
        <div className="text-red-400">加载失败，请检查Token地址是否正确</div>
      </div>
    )
  }

  const totalSupply = data.totalSupply
    ? (parseInt(data.totalSupply) / Math.pow(10, parseInt(data.decimals || '18'))).toLocaleString()
    : 'N/A'

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
            <h1 className="text-2xl font-bold">{data.tokenName || 'Token'}</h1>
            <p className="text-gray-400 text-sm">{data.tokenSymbol || 'N/A'}</p>
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
            href={`${chain.explorerUrl}/token/${address}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* Token Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm text-gray-400">总供应量</h3>
          </div>
          <div className="text-2xl font-bold">{totalSupply}</div>
          <div className="text-xs text-gray-400 mt-1">{data.tokenSymbol || ''}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-sm text-gray-400 mb-2">小数位数</h3>
          <div className="text-2xl font-bold">{data.decimals || '18'}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl p-6"
        >
          <h3 className="text-sm text-gray-400 mb-2">合约地址</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs break-all">{address}</code>
            <button
              onClick={() => copyToClipboard(address!)}
              className="p-1 hover:bg-white/10 rounded"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </motion.div>
      </div>

      {/* Additional Info */}
      {data.contractAddress && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-strong rounded-2xl p-6"
        >
          <h2 className="text-xl font-semibold mb-4">合约信息</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-400">合约地址</span>
              <Link
                to={`/address/${chainId}/${data.contractAddress}`}
                className="text-cyan-400 hover:text-cyan-300 text-sm"
              >
                查看合约
              </Link>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
