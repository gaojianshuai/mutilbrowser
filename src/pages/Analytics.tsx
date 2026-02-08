import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  Activity, 
  Users, 
  DollarSign, 
  Zap, 
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Network,
  Layers,
  Flame
} from 'lucide-react'
import { useQuery } from 'react-query'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { blockchainAPI } from '../services/api'
import { SUPPORTED_CHAINS, Chain } from '../types/chain'
import ChainSelector from '../components/ChainSelector'

interface AnalyticsData {
  totalTransactions: number
  activeAddresses: number
  newAddresses: number
  totalVolume: number
  averageGasPrice: number
  blockProductionRate: number
  networkHealth: number
  largeTransactions: number
  transactionGrowth: number
  addressGrowth: number
}

export default function Analytics() {
  const [selectedChain, setSelectedChain] = useState<Chain>(SUPPORTED_CHAINS[0])
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h')

  const { data: analyticsData, isLoading } = useQuery(
    ['analytics', selectedChain.id, timeRange],
    () => blockchainAPI.getAnalyticsData(selectedChain, timeRange),
    {
      refetchInterval: 30000, // 每30秒刷新
      refetchOnWindowFocus: true,
    }
  )

  const { data: chainStats } = useQuery(
    ['chainStats', selectedChain.id],
    () => blockchainAPI.getChainStats(selectedChain),
    {
      refetchInterval: 15000,
    }
  )

  const { data: latestTransactions } = useQuery(
    ['latestTransactions', selectedChain.id],
    () => blockchainAPI.getLatestTransactions(selectedChain, 100),
    {
      refetchInterval: 10000,
    }
  )

  // 计算实时指标
  const calculateMetrics = (): AnalyticsData => {
    if (!latestTransactions || latestTransactions.length === 0) {
      return {
        totalTransactions: 0,
        activeAddresses: 0,
        newAddresses: 0,
        totalVolume: 0,
        averageGasPrice: chainStats?.gasPrice ? parseFloat(chainStats.gasPrice.ProposeGasPrice || chainStats.gasPrice.SafeGasPrice || '0') : 0,
        blockProductionRate: 0,
        networkHealth: 0,
        largeTransactions: 0,
        transactionGrowth: 0,
        addressGrowth: 0,
      }
    }

    // 统计活跃地址
    const addressSet = new Set<string>()
    latestTransactions.forEach((tx: any) => {
      if (tx.from) addressSet.add(tx.from)
      if (tx.to) addressSet.add(tx.to)
    })

    // 计算总交易量
    const totalVolume = latestTransactions.reduce((sum: number, tx: any) => {
      return sum + (tx.value || 0)
    }, 0)

    // 计算平均 Gas 价格
    const gasPrices = latestTransactions
      .map((tx: any) => tx.gasPrice)
      .filter((price: any) => price && price > 0)
    const averageGasPrice = gasPrices.length > 0
      ? gasPrices.reduce((sum: number, price: number) => sum + price, 0) / gasPrices.length
      : 0

    // 大额交易数量（超过阈值的交易）
    const threshold = selectedChain.id === 'bitcoin' ? 1 : 
                     selectedChain.id === 'solana' ? 100 : 10
    const largeTransactions = latestTransactions.filter((tx: any) => 
      tx.value && tx.value >= threshold
    ).length

    // 区块生产速率（基于时间戳）
    const timestamps = latestTransactions
      .map((tx: any) => {
        // 处理不同的时间戳格式
        if (tx.timestamp) return tx.timestamp
        if (tx.timeStamp) return tx.timeStamp * 1000
        if (tx.blockTime) return tx.blockTime * 1000
        return null
      })
      .filter((ts: any) => ts && ts > 0)
      .sort((a: number, b: number) => b - a)
    
    let blockProductionRate = 0
    if (timestamps.length > 1) {
      const timeDiff = (timestamps[0] - timestamps[timestamps.length - 1]) / 1000 // 转换为秒
      if (timeDiff > 0) {
        // 计算每分钟的区块数（基于交易数估算，因为一个区块可能包含多个交易）
        const estimatedBlocks = Math.max(1, Math.ceil(latestTransactions.length / 50)) // 假设每个区块平均50笔交易
        blockProductionRate = (estimatedBlocks / timeDiff) * 60 // 每分钟区块数
      }
    }
    
    // 如果计算失败，使用链的默认区块时间估算
    if (blockProductionRate === 0 || !isFinite(blockProductionRate)) {
      // 常见链的区块时间（秒）
      const blockTimes: Record<string, number> = {
        ethereum: 12,
        bitcoin: 600,
        polygon: 2,
        bsc: 3,
        solana: 0.4,
        avalanche: 1,
        arbitrum: 0.25,
        optimism: 2,
      }
      const blockTime = blockTimes[selectedChain.id] || 12
      blockProductionRate = 60 / blockTime // 每分钟区块数
    }

    // 网络健康度（基于交易成功率和 Gas 价格稳定性）
    const successRate = latestTransactions.filter((tx: any) => 
      tx.status !== 'failed'
    ).length / latestTransactions.length

    const gasPriceStdDev = gasPrices.length > 1
      ? Math.sqrt(
          gasPrices.reduce((sum: number, price: number) => 
            sum + Math.pow(price - averageGasPrice, 2), 0
          ) / gasPrices.length
        )
      : 0
    const gasPriceStability = averageGasPrice > 0 
      ? Math.max(0, 1 - (gasPriceStdDev / averageGasPrice))
      : 0

    const networkHealth = (successRate * 0.7 + gasPriceStability * 0.3) * 100

    return {
      totalTransactions: latestTransactions.length,
      activeAddresses: addressSet.size,
      newAddresses: 0, // 需要历史数据计算
      totalVolume,
      averageGasPrice,
      blockProductionRate,
      networkHealth,
      largeTransactions,
      transactionGrowth: 0, // 需要历史数据计算
      addressGrowth: 0, // 需要历史数据计算
    }
  }

  const metrics = analyticsData || calculateMetrics()

  // 准备图表数据
  const chartData = useMemo(() => {
    if (!latestTransactions || latestTransactions.length === 0) {
      return []
    }

    // 按时间分组交易（最近24小时，每小时一组）
    const now = Date.now()
    const hours = 24
    const data: any[] = []

    for (let i = hours - 1; i >= 0; i--) {
      const hourStart = now - (i + 1) * 60 * 60 * 1000
      const hourEnd = now - i * 60 * 60 * 1000
      
      const hourTransactions = latestTransactions.filter((tx: any) => {
        const txTime = tx.timestamp || (tx.timeStamp ? tx.timeStamp * 1000 : 0)
        return txTime >= hourStart && txTime < hourEnd
      })

      const hourVolume = hourTransactions.reduce((sum: number, tx: any) => sum + (tx.value || 0), 0)
      const hourAddresses = new Set<string>()
      hourTransactions.forEach((tx: any) => {
        if (tx.from) hourAddresses.add(tx.from)
        if (tx.to) hourAddresses.add(tx.to)
      })

      const hour = new Date(hourStart).getHours()
      data.push({
        time: `${hour}:00`,
        volume: hourVolume,
        transactions: hourTransactions.length,
        addresses: hourAddresses.size,
      })
    }

    return data
  }, [latestTransactions])

  // 网络活动数据（按小时统计）
  const networkActivityData = useMemo(() => {
    if (!latestTransactions || latestTransactions.length === 0) {
      return []
    }

    const now = Date.now()
    const hours = 24
    const data: any[] = []

    for (let i = hours - 1; i >= 0; i--) {
      const hourStart = now - (i + 1) * 60 * 60 * 1000
      const hourEnd = now - i * 60 * 60 * 1000
      
      const hourTransactions = latestTransactions.filter((tx: any) => {
        const txTime = tx.timestamp || (tx.timeStamp ? tx.timeStamp * 1000 : 0)
        return txTime >= hourStart && txTime < hourEnd
      })

      const hour = new Date(hourStart).getHours()
      data.push({
        time: `${hour}:00`,
        activeAddresses: new Set([
          ...hourTransactions.map((tx: any) => tx.from).filter(Boolean),
          ...hourTransactions.map((tx: any) => tx.to).filter(Boolean),
        ]).size,
        transactions: hourTransactions.length,
      })
    }

    return data
  }, [latestTransactions])

  const formatNumber = (num: number, decimals: number = 2) => {
    if (num >= 1e9) return `${(num / 1e9).toFixed(decimals)}B`
    if (num >= 1e6) return `${(num / 1e6).toFixed(decimals)}M`
    if (num >= 1e3) return `${(num / 1e3).toFixed(decimals)}K`
    return num.toFixed(decimals)
  }

  const formatCurrency = (num: number) => {
    const symbol = selectedChain.symbol || 'ETH'
    if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M ${symbol}`
    if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K ${symbol}`
    return `${num.toFixed(4)} ${symbol}`
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    trend, 
    subtitle,
    gradient 
  }: { 
    title: string
    value: string | number
    icon: any
    trend?: number
    subtitle?: string
    gradient: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-xl p-6 hover:bg-white/10 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg bg-gradient-to-br ${gradient}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? (
              <ArrowUpRight className="w-4 h-4" />
            ) : (
              <ArrowDownRight className="w-4 h-4" />
            )}
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-white">{value}</div>
        <div className="text-sm text-gray-400">{title}</div>
        {subtitle && (
          <div className="text-xs text-gray-500 mt-1">{subtitle}</div>
        )}
      </div>
    </motion.div>
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent">
            区块链数据分析
          </h1>
          <p className="text-gray-400">
            实时监控链上活动、网络健康度和关键指标
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {(['24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                    : 'glass text-gray-300 hover:text-white'
                }`}
              >
                {range === '24h' ? '24小时' : range === '7d' ? '7天' : '30天'}
              </button>
            ))}
          </div>
          <ChainSelector
            selectedChain={selectedChain}
            onSelectChain={setSelectedChain}
          />
        </div>
      </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="总交易数"
          value={isLoading ? '...' : formatNumber(metrics.totalTransactions)}
          icon={Activity}
          trend={metrics.transactionGrowth}
          subtitle={`过去${timeRange === '24h' ? '24小时' : timeRange === '7d' ? '7天' : '30天'}`}
          gradient="from-blue-500 to-cyan-500"
        />
        <StatCard
          title="活跃地址"
          value={isLoading ? '...' : formatNumber(metrics.activeAddresses)}
          icon={Users}
          trend={metrics.addressGrowth}
          subtitle="参与交易的唯一地址"
          gradient="from-green-500 to-emerald-500"
        />
        <StatCard
          title="总交易量"
          value={isLoading ? '...' : formatCurrency(metrics.totalVolume)}
          icon={DollarSign}
          subtitle="所有交易的总价值"
          gradient="from-yellow-500 to-orange-500"
        />
        <StatCard
          title="平均Gas价格"
          value={isLoading ? '...' : `${metrics.averageGasPrice.toFixed(2)} Gwei`}
          icon={Zap}
          subtitle={chainStats?.gasPrice ? `当前: ${chainStats.gasPrice.ProposeGasPrice || chainStats.gasPrice.SafeGasPrice || 'N/A'} Gwei` : ''}
          gradient="from-purple-500 to-pink-500"
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="大额交易"
          value={isLoading ? '...' : metrics.largeTransactions}
          icon={Flame}
          subtitle="超过阈值的交易数量"
          gradient="from-red-500 to-pink-500"
        />
        <StatCard
          title="区块生产速率"
          value={isLoading ? '...' : `${metrics.blockProductionRate.toFixed(2)}/分钟`}
          icon={Layers}
          subtitle="平均每分钟产生的区块数"
          gradient="from-indigo-500 to-blue-500"
        />
        <StatCard
          title="网络健康度"
          value={isLoading ? '...' : `${metrics.networkHealth.toFixed(1)}%`}
          icon={Network}
          subtitle="基于成功率和Gas稳定性"
          gradient="from-teal-500 to-cyan-500"
        />
        <StatCard
          title="最新区块"
          value={isLoading ? '...' : chainStats?.latestBlock ? `#${chainStats.latestBlock.toLocaleString()}` : 'N/A'}
          icon={BarChart3}
          subtitle="当前链高度"
          gradient="from-violet-500 to-purple-500"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Transaction Volume Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            交易量趋势
          </h3>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
              </div>
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    tickFormatter={(value) => {
                      if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`
                      if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`
                      return value.toFixed(0)
                    }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                    }}
                    formatter={(value: any) => [formatCurrency(value), '交易量']}
                  />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#06b6d4"
                    fillOpacity={1}
                    fill="url(#colorVolume)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>暂无数据</p>
                  <p className="text-sm mt-2">实时数据: {formatCurrency(metrics.totalVolume)}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Network Activity Chart */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-strong rounded-xl p-6"
        >
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            网络活动
          </h3>
          <div className="h-64">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
              </div>
            ) : networkActivityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={networkActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      color: '#f3f4f6',
                    }}
                  />
                  <Legend 
                    wrapperStyle={{ color: '#9ca3af', fontSize: '12px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="activeAddresses"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                    name="活跃地址"
                  />
                  <Line
                    type="monotone"
                    dataKey="transactions"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', r: 3 }}
                    name="交易数"
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Network className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p>暂无数据</p>
                  <p className="text-sm mt-2">活跃地址: {formatNumber(metrics.activeAddresses)}</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Real-time Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-strong rounded-xl p-6"
      >
        <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Clock className="w-5 h-5 text-purple-400" />
          实时活动监控
        </h3>
        <div className="space-y-2">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400 mx-auto"></div>
            </div>
          ) : latestTransactions && latestTransactions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {latestTransactions.slice(0, 6).map((tx: any, index: number) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="glass rounded-lg p-4 hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-400">交易</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      tx.status === 'failed' ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'
                    }`}>
                      {tx.status === 'failed' ? '失败' : '成功'}
                    </span>
                  </div>
                  <div className="text-sm font-mono text-gray-300 truncate mb-1">
                    {tx.hash?.slice(0, 16)}...
                  </div>
                  <div className="text-xs text-gray-500">
                    {tx.value ? formatCurrency(tx.value) : 'N/A'}
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              暂无数据
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}
