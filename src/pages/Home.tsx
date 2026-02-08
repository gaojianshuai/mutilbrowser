import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, TrendingUp, Zap, Shield, BarChart3, Globe, Activity, DollarSign, ArrowUp, ArrowDown } from 'lucide-react'
import { SUPPORTED_CHAINS, Chain } from '../types/chain'
import { useQuery } from 'react-query'
import { blockchainAPI } from '../services/api'
import StatsCard from '../components/StatsCard'
import ApiStatus from '../components/ApiStatus'
import TransactionList from '../components/TransactionList'
import SearchResults, { SearchResult } from '../components/SearchResults'
import { detectChains, detectQueryType } from '../utils/chainDetector'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0])
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const navigate = useNavigate()

  const { data: chainStats, isLoading: statsLoading } = useQuery(
    ['chainStats', selectedChain.id],
    () => blockchainAPI.getChainStats(selectedChain),
    { 
      refetchInterval: 15000, // 每15秒刷新一次
      refetchOnWindowFocus: true,
    }
  )

  // 根据选择的链获取最新交易（实时数据）
  const { 
    data: latestTransactions, 
    isLoading: latestLoading, 
    dataUpdatedAt: latestUpdatedAt 
  } = useQuery(
    ['latestTransactions', selectedChain.id],
    () => blockchainAPI.getLatestTransactions(selectedChain, 20),
    {
      refetchInterval: 10000, // 每10秒自动刷新
      refetchOnWindowFocus: true, // 窗口聚焦时刷新
      refetchOnMount: true, // 组件挂载时刷新
      enabled: true,
      staleTime: 5000, // 数据5秒后视为过期
    }
  )

  // 获取所有链的价格信息
  const { data: cryptoPrices } = useQuery(
    ['cryptoPrices'],
    () => blockchainAPI.getCryptoPrices(SUPPORTED_CHAINS.map(c => c.id)),
    {
      refetchInterval: 60000, // 每60秒刷新一次价格
      refetchOnWindowFocus: true,
      staleTime: 30000, // 30秒内数据视为新鲜
    }
  )

  // 根据选择的链获取大额交易（实时数据）
  // 不同链使用不同的大额阈值
  const getLargeTransactionThreshold = (chainId: string): number => {
    const thresholds: Record<string, number> = {
      bitcoin: 1, // 1 BTC
      ethereum: 10, // 10 ETH
      polygon: 1000, // 1000 MATIC
      bsc: 50, // 50 BNB
      avalanche: 100, // 100 AVAX
      arbitrum: 10, // 10 ETH
      optimism: 10, // 10 ETH
      solana: 100, // 100 SOL
      base: 10, // 10 ETH
      linea: 10, // 10 ETH
      zksync: 10, // 10 ETH
      scroll: 10, // 10 ETH
      mantle: 1000, // 1000 MNT
      blast: 10, // 10 ETH
      starknet: 10, // 10 ETH
      sui: 100, // 100 SUI
      aptos: 100, // 100 APT
      tron: 10000, // 10000 TRX
      cosmos: 100, // 100 ATOM
      near: 100, // 100 NEAR
      fantom: 1000, // 1000 FTM
      celo: 1000, // 1000 CELO
      gnosis: 10, // 10 GNO
      moonbeam: 1000, // 1000 GLMR
      cronos: 1000, // 1000 CRO
      klaytn: 1000, // 1000 KLAY
      metis: 10, // 10 METIS
      boba: 10, // 10 ETH
      aurora: 10, // 10 ETH
      harmony: 1000, // 1000 ONE
      opbnb: 50, // 50 BNB
      zora: 10, // 10 ETH
      mode: 10, // 10 ETH
      manta: 10, // 10 ETH
    }
    return thresholds[chainId] || 10
  }

  const largeThreshold = getLargeTransactionThreshold(selectedChain.id)
  
  const { 
    data: largeTransactions, 
    isLoading: largeLoading, 
    dataUpdatedAt: largeUpdatedAt 
  } = useQuery(
    ['largeTransactions', selectedChain.id, largeThreshold],
    () => blockchainAPI.getLargeTransactions(selectedChain, largeThreshold, 20),
    {
      refetchInterval: 20000, // 每20秒自动刷新
      refetchOnWindowFocus: true, // 窗口聚焦时刷新
      refetchOnMount: true, // 组件挂载时刷新
      enabled: true,
      staleTime: 10000, // 数据10秒后视为过期
    }
  )

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchQuery.trim()) {
      setShowSearchResults(false)
      return
    }

    const query = searchQuery.trim()
    setIsSearching(true)
    setShowSearchResults(true)
    
    try {
      // 检测可能的链
      const possibleChains = detectChains(query)
      const queryType = detectQueryType(query)
      
      // 按置信度排序，优先查询高置信度的链
      const sortedChains = possibleChains
        .sort((a, b) => b.confidence - a.confidence)
        .slice(0, 5) // 最多查询5个链
      
      const results: SearchResult[] = []
      
      // 并行查询多个链
      const searchPromises = sortedChains.map(async ({ chain }) => {
        try {
          let data = null
          
          if (queryType === 'transaction') {
            data = await blockchainAPI.getTransactionInfo(query, chain)
          } else if (queryType === 'block') {
            data = await blockchainAPI.getBlockInfo(query, chain)
          } else {
            data = await blockchainAPI.getAddressInfo(query, chain)
          }
          
          if (data) {
            return {
              chain,
              type: queryType as 'address' | 'transaction' | 'block',
              data,
              query,
            } as SearchResult
          }
        } catch (error) {
          // 这个链没有找到，继续尝试其他链
          return null
        }
      })
      
      const searchResults = await Promise.allSettled(searchPromises)
      
      searchResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value) {
          results.push(result.value)
        }
      })
      
      setSearchResults(results)
      
      // 如果只有一个结果，延迟一下再自动跳转（让用户看到结果）
      if (results.length === 1) {
        setTimeout(() => {
          const result = results[0]
          if (result.type === 'transaction') {
            navigate(`/tx/${result.chain.id}/${query}`)
          } else if (result.type === 'block') {
            navigate(`/block/${result.chain.id}/${query}`)
          } else {
            navigate(`/address/${result.chain.id}/${query}`)
          }
          setShowSearchResults(false)
        }, 500)
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center space-y-6"
      >
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">多链浏览器</span>
          </h1>
          <p className="text-base md:text-lg text-gray-400 max-w-2xl mx-auto">
            一站式查询交易、地址、区块、Token和NFT信息，支持30+主流区块链网络
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="max-w-4xl mx-auto space-y-4">
          <div className="glass-strong rounded-2xl p-2 flex flex-col md:flex-row gap-2">
            <div className="flex-1 flex items-center gap-3 px-4">
              <Search className="w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  if (!e.target.value.trim()) {
                    setShowSearchResults(false)
                  }
                }}
                placeholder="输入地址、交易哈希或区块号，自动识别链..."
                className="flex-1 bg-transparent border-none outline-none text-gray-200 placeholder-gray-500 text-lg"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl font-semibold hover:from-cyan-600 hover:to-purple-700 transition-all transform hover:scale-105"
            >
              搜索
            </button>
          </div>
          
          {/* Search Results */}
          {showSearchResults && (
            <SearchResults
              results={searchResults}
              isLoading={isSearching}
              query={searchQuery}
            />
          )}
        </form>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="最新区块"
          value={
            statsLoading 
              ? '加载中...' 
              : chainStats?.latestBlock 
                ? `#${chainStats.latestBlock.toLocaleString()}` 
                : 'N/A'
          }
          icon={<Zap className="w-6 h-6" />}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatsCard
          title="Gas价格"
          value={
            statsLoading
              ? '加载中...'
              : chainStats?.gasPrice
                ? (() => {
                    const gasPrice = chainStats.gasPrice
                    if (typeof gasPrice === 'object' && gasPrice !== null) {
                      const price = gasPrice.ProposeGasPrice || gasPrice.SafeGasPrice || gasPrice.FastGasPrice
                      if (price) {
                        return `${price} Gwei`
                      }
                    }
                    // 如果是数字，直接显示
                    if (typeof gasPrice === 'number') {
                      return `${gasPrice.toFixed(0)} Gwei`
                    }
                    return '获取中...'
                  })()
                : '获取中...'
          }
          icon={<TrendingUp className="w-6 h-6" />}
          gradient="from-purple-500 to-pink-500"
        />
        <StatsCard
          title="网络状态"
          value={chainStats ? "正常" : "检查中..."}
          icon={<Shield className="w-6 h-6" />}
          gradient="from-green-500 to-emerald-500"
        />
        
        {/* API 状态 - 简化显示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <ApiStatus />
        </motion.div>
      </div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <FeatureCard
          icon={<Search className="w-8 h-8" />}
          title="智能搜索"
          description="自动识别地址、交易、区块和Token，一键查询所有信息"
        />
        <FeatureCard
          icon={<Globe className="w-8 h-8" />}
          title="多链支持"
          description="支持Ethereum、Bitcoin、Polygon、BSC、Solana等8+主流链"
        />
        <FeatureCard
          icon={<BarChart3 className="w-8 h-8" />}
          title="数据分析"
          description="实时数据可视化，深度分析链上活动和资金流向"
        />
      </motion.div>

      {/* Supported Chains */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="space-y-6"
      >
        <h2 className="text-3xl font-bold text-center">支持的区块链</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
          {SUPPORTED_CHAINS.map((chain) => {
            const priceInfo = cryptoPrices?.[chain.id]
            const priceChange = priceInfo?.priceChangePercent24h || 0
            const isPositive = priceChange >= 0
            
            return (
              <motion.button
                key={chain.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedChain(chain)}
                className={`glass rounded-xl p-4 text-center transition-all relative ${
                  selectedChain.id === chain.id
                    ? 'ring-2 ring-cyan-500 bg-white/20'
                    : 'hover:bg-white/10'
                }`}
              >
                <div className="text-3xl mb-2">{chain.icon}</div>
                <div className="text-sm font-semibold mb-1">{chain.name}</div>
                <div className="text-xs text-gray-400 mb-2">{chain.symbol}</div>
                
                {/* 价格信息 */}
                {priceInfo && priceInfo.price > 0 ? (
                  <div className="space-y-1 mt-2 pt-2 border-t border-white/10">
                    <div className="text-xs font-semibold text-white">
                      ${priceInfo.price >= 0.01 
                        ? priceInfo.price.toLocaleString('en-US', { 
                            minimumFractionDigits: 2, 
                            maximumFractionDigits: priceInfo.price >= 1 ? 2 : 6 
                          })
                        : priceInfo.price.toFixed(8)
                      }
                    </div>
                    {priceChange !== 0 && (
                      <div className={`text-[10px] flex items-center justify-center gap-0.5 ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isPositive ? (
                          <ArrowUp className="w-3 h-3" />
                        ) : (
                          <ArrowDown className="w-3 h-3" />
                        )}
                        <span>{Math.abs(priceChange).toFixed(2)}%</span>
                      </div>
                    )}
                  </div>
                ) : priceInfo === undefined ? (
                  <div className="text-[10px] text-gray-500 mt-2 pt-2 border-t border-white/10">
                    加载中...
                  </div>
                ) : null}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Latest Transactions Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h2 className="text-3xl font-bold">实时交易数据</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span>实时更新</span>
            </div>
            <div className="text-xs text-gray-500">
              最新交易: 每10秒 | 大额交易: 每20秒
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 最新交易 */}
          <TransactionList
            transactions={latestTransactions || []}
            title="最新交易"
            icon={<Activity className="w-6 h-6 text-cyan-400" />}
            isLoading={latestLoading}
            lastUpdated={latestUpdatedAt}
          />

          {/* 大额交易 */}
          <TransactionList
            transactions={largeTransactions || []}
            title="大额交易 (≥10 ETH)"
            icon={<DollarSign className="w-6 h-6 text-yellow-400" />}
            isLoading={largeLoading}
            lastUpdated={largeUpdatedAt}
          />
        </div>
      </motion.div>
    </div>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="glass rounded-xl p-6 hover:bg-white/15 transition-all">
      <div className="text-cyan-400 mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  )
}
