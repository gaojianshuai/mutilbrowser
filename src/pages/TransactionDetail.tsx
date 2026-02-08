import { useParams, Link } from 'react-router-dom'
import { useQuery } from 'react-query'
import { motion } from 'framer-motion'
import { Copy, ExternalLink, ArrowRight, Clock, CheckCircle, DollarSign, Zap, FileText, Layers, Activity } from 'lucide-react'
import { blockchainAPI } from '../services/api'
import { SUPPORTED_CHAINS } from '../types/chain'
import { formatDistanceToNow, format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

export default function TransactionDetail() {
  const { chain: chainId, hash } = useParams<{ chain: string; hash: string }>()
  const chain = SUPPORTED_CHAINS.find((c) => c.id === chainId) || SUPPORTED_CHAINS[0]

  const { data, isLoading, error } = useQuery(
    ['transaction', chainId, hash],
    () => blockchainAPI.getTransactionInfo(hash!, chain),
    { enabled: !!hash && !!chainId }
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
        <div className="text-red-400">加载失败，请检查交易哈希是否正确</div>
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
            <h1 className="text-2xl font-bold flex items-center gap-2">
              交易详情
              <CheckCircle className="w-6 h-6 text-green-400" />
            </h1>
            <p className="text-gray-400 text-sm">{chain.name}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-4 bg-black/20 rounded-lg">
          <code className="flex-1 text-sm break-all">{hash}</code>
          <button
            onClick={() => copyToClipboard(hash!)}
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <a
            href={`${chain.explorerUrl}/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 hover:bg-white/10 rounded transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </motion.div>

      {/* Transaction Status & Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <h3 className="text-sm text-gray-400">交易状态</h3>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span className="text-lg font-semibold text-green-400">成功</span>
          </div>
          {data.confirmations !== undefined && (
            <div className="text-xs text-gray-500 mt-2">
              {data.confirmations} 确认
            </div>
          )}
        </motion.div>

        {data.timestamp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm text-gray-400">时间</h3>
            </div>
            <div className="text-lg font-semibold">
              {formatDistanceToNow(new Date(data.timestamp * 1000), {
                addSuffix: true,
                locale: zhCN,
              })}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {format(new Date(data.timestamp * 1000), 'yyyy-MM-dd HH:mm:ss', { locale: zhCN })}
            </div>
          </motion.div>
        )}

        {data.value !== undefined && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm text-gray-400">交易金额</h3>
            </div>
            <div className="text-2xl font-bold text-gradient">
              {data.value.toFixed(6)} {chain.symbol}
            </div>
            {data.valueUSD && (
              <div className="text-xs text-gray-500 mt-1">
                ≈ ${data.valueUSD.toLocaleString()}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Addresses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-300">发送方 (From)</h3>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
            <code className="flex-1 text-sm break-all font-mono">{data.from || 'N/A'}</code>
            <button
              onClick={() => copyToClipboard(data.from || '')}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="复制地址"
            >
              <Copy className="w-4 h-4" />
            </button>
            {data.from && data.from !== 'N/A' && (
              <Link
                to={`/address/${chainId}/${data.from}`}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="查看地址详情"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
          {data.fromBalance !== undefined && (
            <div className="mt-2 text-xs text-gray-500">
              余额: {data.fromBalance.toFixed(6)} {chain.symbol}
            </div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass rounded-xl p-6"
        >
          <div className="flex items-center gap-2 mb-3">
            <ArrowRight className="w-4 h-4 text-gray-400 rotate-180" />
            <h3 className="text-sm font-semibold text-gray-300">接收方 (To)</h3>
          </div>
          <div className="flex items-center gap-2 p-3 bg-slate-800/50 rounded-lg">
            <code className="flex-1 text-sm break-all font-mono">{data.to || 'N/A'}</code>
            <button
              onClick={() => copyToClipboard(data.to || '')}
              className="p-2 hover:bg-white/10 rounded transition-colors"
              title="复制地址"
            >
              <Copy className="w-4 h-4" />
            </button>
            {data.to && data.to !== 'N/A' && (
              <Link
                to={`/address/${chainId}/${data.to}`}
                className="p-2 hover:bg-white/10 rounded transition-colors"
                title="查看地址详情"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </div>
          {data.toBalance !== undefined && (
            <div className="mt-2 text-xs text-gray-500">
              余额: {data.toBalance.toFixed(6)} {chain.symbol}
            </div>
          )}
        </motion.div>
      </div>

      {/* Block & Gas Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {data.blockNumber && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm text-gray-400">区块号</h3>
            </div>
            <Link
              to={`/block/${chainId}/${data.blockNumber}`}
              className="text-xl font-bold text-cyan-400 hover:text-cyan-300"
            >
              #{data.blockNumber.toLocaleString()}
            </Link>
            {data.transactionIndex !== undefined && (
              <div className="text-xs text-gray-500 mt-1">
                交易索引: {data.transactionIndex}
              </div>
            )}
          </motion.div>
        )}

        {data.gas && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm text-gray-400">Gas使用量</h3>
            </div>
            <div className="text-xl font-semibold">{data.gas.toLocaleString()}</div>
            {data.gasLimit && (
              <div className="text-xs text-gray-500 mt-1">
                限制: {data.gasLimit.toLocaleString()}
                {data.gasLimit > 0 && (
                  <span className="ml-1">
                    ({((data.gas / data.gasLimit) * 100).toFixed(1)}%)
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}

        {data.gasPrice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm text-gray-400">Gas价格</h3>
            </div>
            <div className="text-xl font-semibold">{data.gasPrice.toFixed(2)} Gwei</div>
            {data.maxFeePerGas && (
              <div className="text-xs text-gray-500 mt-1">
                最大费用: {data.maxFeePerGas.toFixed(2)} Gwei
              </div>
            )}
          </motion.div>
        )}

        {data.gas && data.gasPrice && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="glass rounded-xl p-6"
          >
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm text-gray-400">Gas费用</h3>
            </div>
            <div className="text-xl font-semibold">
              {((data.gas * data.gasPrice) / 1e9).toFixed(6)} {chain.symbol}
            </div>
            {data.gasUsed && data.gasPrice && (
              <div className="text-xs text-gray-500 mt-1">
                实际: {((data.gasUsed * data.gasPrice) / 1e9).toFixed(6)} {chain.symbol}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Additional Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0 }}
        className="glass-strong rounded-2xl p-6"
      >
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          交易详情
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.nonce !== undefined && (
            <div>
              <div className="text-xs text-gray-500 mb-1">Nonce</div>
              <div className="text-sm font-mono">{data.nonce}</div>
            </div>
          )}
          {data.input && (
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">输入数据</div>
              <div className="flex items-center gap-2 p-2 bg-slate-800/50 rounded">
                <code className="flex-1 text-xs break-all font-mono">
                  {data.input === '0x' ? '无数据' : `${data.input.slice(0, 66)}...`}
                </code>
                {data.input !== '0x' && (
                  <button
                    onClick={() => copyToClipboard(data.input)}
                    className="p-1 hover:bg-white/10 rounded"
                  >
                    <Copy className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}
          {data.logsCount !== undefined && (
            <div>
              <div className="text-xs text-gray-500 mb-1">日志数量</div>
              <div className="text-sm font-semibold">{data.logsCount}</div>
            </div>
          )}
          {data.methodId && (
            <div>
              <div className="text-xs text-gray-500 mb-1">方法ID</div>
              <div className="text-sm font-mono">{data.methodId}</div>
            </div>
          )}
          {data.contractAddress && (
            <div>
              <div className="text-xs text-gray-500 mb-1">合约地址</div>
              <Link
                to={`/address/${chainId}/${data.contractAddress}`}
                className="text-sm text-cyan-400 hover:text-cyan-300 font-mono"
              >
                {data.contractAddress.slice(0, 10)}...{data.contractAddress.slice(-8)}
              </Link>
            </div>
          )}
          {data.functionName && (
            <div className="md:col-span-2">
              <div className="text-xs text-gray-500 mb-1">函数调用</div>
              <div className="text-sm font-mono">{data.functionName}</div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
