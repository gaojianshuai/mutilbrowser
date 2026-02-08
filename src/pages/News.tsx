import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { 
  TrendingUp, 
  ExternalLink, 
  Clock, 
  Globe,
  RefreshCw,
  Newspaper
} from 'lucide-react'
import { blockchainAPI } from '../services/api'

interface NewsItem {
  id: string
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  image?: string
  lang?: string
}

export default function News() {
  const [selectedExchange, setSelectedExchange] = useState<string>('all')

  const exchanges = [
    { id: 'all', name: '全部', symbol: 'ALL' },
    { id: 'binance', name: 'Binance', symbol: 'BNB' },
    { id: 'okx', name: 'OKX', symbol: 'OKB' },
    { id: 'bybit', name: 'Bybit', symbol: 'BYBIT' },
    { id: 'bitget', name: 'Bitget', symbol: 'BGB' },
    { id: 'kucoin', name: 'KuCoin', symbol: 'KCS' },
    { id: 'coinbase', name: 'Coinbase', symbol: 'COIN' },
    { id: 'kraken', name: 'Kraken', symbol: 'KRAKEN' },
    { id: 'huobi', name: 'Huobi', symbol: 'HT' },
    { id: 'gate', name: 'Gate.io', symbol: 'GT' },
    { id: 'mexc', name: 'MEXC', symbol: 'MX' },
  ]

  const { data: newsData, isLoading, refetch, dataUpdatedAt } = useQuery(
    ['cryptoNews', selectedExchange],
    () => blockchainAPI.getCryptoNews(selectedExchange),
    {
      refetchInterval: 60000, // 每分钟刷新
      refetchOnWindowFocus: true,
      staleTime: 30000, // 30秒内不重新获取
    }
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN')
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            热点新闻
          </h1>
          <p className="text-gray-400">
            实时获取全球顶级交易所和加密货币市场最新动态
          </p>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="px-4 py-2 glass rounded-lg hover:bg-gray-800/50 transition-all disabled:opacity-50 flex items-center gap-2 text-gray-300"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>刷新</span>
          </button>
          {dataUpdatedAt && (
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatTime(new Date(dataUpdatedAt).toISOString())}更新
            </div>
          )}
        </div>
      </motion.div>

      {/* Exchange Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-xl p-4"
      >
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-gray-400" />
          <span className="text-sm font-semibold text-gray-300">筛选交易所</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {exchanges.map((exchange) => (
            <button
              key={exchange.id}
              onClick={() => setSelectedExchange(exchange.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedExchange === exchange.id
                  ? 'bg-gray-800 text-gray-200 border border-gray-700'
                  : 'glass text-gray-400 hover:text-gray-200 hover:bg-gray-800/30'
              }`}
            >
              {exchange.name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* News List */}
      {isLoading ? (
        <div className="glass-strong rounded-2xl p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="glass rounded-lg p-4 animate-pulse">
                <div className="h-4 bg-gray-800/50 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-800/30 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-800/30 rounded w-5/6"></div>
              </div>
            ))}
          </div>
        </div>
      ) : newsData && newsData.length > 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {newsData.map((news: NewsItem, index: number) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-strong rounded-xl p-6 hover:bg-gray-900/50 transition-all border border-gray-800/50"
            >
              <div className="flex items-start gap-4">
                {news.image && (
                  <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-gray-900">
                    <img
                      src={news.image}
                      alt={news.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-gray-200 hover:text-gray-100 transition-colors line-clamp-2">
                      {news.title}
                    </h3>
                    <a
                      href={news.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0 p-2 glass rounded-lg hover:bg-gray-800/50 transition-all"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="w-4 h-4 text-gray-400" />
                    </a>
                  </div>
                  
                  {news.description && (
                    <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                      {news.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Newspaper className="w-3 h-3" />
                      <span>{news.source}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(news.publishedAt)}</span>
                    </div>
                    {news.lang === 'zh' && (
                      <span className="px-2 py-0.5 bg-gray-800/50 rounded text-gray-400 border border-gray-700/50">
                        中文
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <a
                href={news.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-gray-300 transition-colors"
              >
                阅读全文
                <ExternalLink className="w-3 h-3" />
              </a>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="glass-strong rounded-2xl p-12 text-center">
          <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 mb-2">暂无新闻数据</p>
          <p className="text-sm text-gray-500">请稍后刷新或检查网络连接</p>
        </div>
      )}
    </div>
  )
}
