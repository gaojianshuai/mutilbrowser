import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from 'react-query'
import { 
  Twitter, 
  ExternalLink, 
  RefreshCw, 
  User,
  Heart,
  MessageCircle,
  Repeat2,
  Loader2
} from 'lucide-react'
import { blockchainAPI } from '../services/api'

export default function XFeed() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'crypto' | 'influencer' | 'news'>('all')

  const { data: xPosts, isLoading, refetch, error } = useQuery(
    ['xFeed', selectedCategory],
    () => blockchainAPI.getXFeed(selectedCategory),
    {
      refetchInterval: 60000, // 每60秒刷新
      refetchOnWindowFocus: true,
      staleTime: 30000,
      retry: 2, // 重试2次
      retryDelay: 1000, // 重试延迟1秒
    }
  )

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return '刚刚'
    if (minutes < 60) return `${minutes}分钟前`
    if (hours < 24) return `${hours}小时前`
    if (days < 7) return `${days}天前`
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const filteredPosts = selectedCategory === 'all' 
    ? xPosts 
    : xPosts?.filter(post => post.category === selectedCategory)

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-cyan-400 to-purple-600 bg-clip-text text-transparent flex items-center gap-3">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
            X 币圈动态
          </h1>
          <p className="text-gray-400">
            实时追踪币圈热点动态和行业大佬的最新动态
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 glass rounded-lg hover:bg-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>刷新</span>
        </button>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-2"
      >
        {(['all', 'crypto', 'influencer', 'news'] as const).map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              selectedCategory === category
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                : 'glass text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {category === 'all' ? '全部' : 
             category === 'crypto' ? '币圈热点' :
             category === 'influencer' ? '大佬动态' : '新闻资讯'}
          </button>
        ))}
      </motion.div>

      {/* Posts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-cyan-400 mb-4" />
            <p className="text-gray-400">正在加载X动态...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-gray-400">
            <Twitter className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="mb-2">数据加载失败</p>
            <p className="text-sm mb-4">请稍后重试或点击刷新按钮</p>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 glass rounded-lg hover:bg-white/10 transition-all"
            >
              重新加载
            </button>
          </div>
        ) : filteredPosts && filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="glass-strong rounded-xl p-6 hover:bg-white/5 transition-all"
            >
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {post.author.avatar ? (
                    <img
                      src={post.author.avatar}
                      alt={post.author.name}
                      className="w-12 h-12 rounded-full"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center">
                      <User className="w-6 h-6 text-white" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-white">{post.author.name}</span>
                    {post.author.verified && (
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                      </svg>
                    )}
                    <span className="text-gray-400 text-sm">@{post.author.username}</span>
                    <span className="text-gray-500 text-sm">·</span>
                    <span className="text-gray-500 text-sm">{formatTime(post.createdAt)}</span>
                  </div>

                  <p className="text-gray-200 mb-4 whitespace-pre-wrap break-words">
                    {post.text}
                  </p>

                  {/* Metrics */}
                  <div className="flex items-center gap-6 text-gray-400 text-sm">
                    <button className="flex items-center gap-1 hover:text-blue-400 transition-colors">
                      <MessageCircle className="w-4 h-4" />
                      <span>{formatNumber(post.metrics.replies)}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-green-400 transition-colors">
                      <Repeat2 className="w-4 h-4" />
                      <span>{formatNumber(post.metrics.retweets)}</span>
                    </button>
                    <button className="flex items-center gap-1 hover:text-red-400 transition-colors">
                      <Heart className="w-4 h-4" />
                      <span>{formatNumber(post.metrics.likes)}</span>
                    </button>
                    <a
                      href={post.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 hover:text-cyan-400 transition-colors ml-auto"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>查看原文</span>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 text-gray-400">
            <Twitter className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>暂无动态</p>
          </div>
        )}
      </div>
    </div>
  )
}
