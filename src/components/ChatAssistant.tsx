import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  X, 
  Send, 
  HelpCircle, 
  ChevronDown,
  ExternalLink,
  Loader2,
  Brain,
  Zap
} from 'lucide-react'
import { aiService } from '../services/aiService'

interface Message {
  id: string
  text: string
  sender: 'user' | 'assistant'
  timestamp: Date
}

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '你好！我是 AI 智能助手，基于大语言模型驱动。我可以专业解答关于区块链、交易查询、数据分析等各种问题。有什么可以帮助你的吗？',
      sender: 'assistant',
      timestamp: new Date(),
    },
  ])
  const [inputText, setInputText] = useState('')
  const [isMinimized, setIsMinimized] = useState(false)
  const [isAIThinking, setIsAIThinking] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const quickReplies = [
    '如何使用这个浏览器？',
    '如何查询交易？',
    '如何联系技术支持？',
    '数据分析功能说明',
  ]

  const handleSendMessage = async (text?: string) => {
    const messageText = text || inputText.trim()
    if (!messageText) return

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInputText('')
    setIsAIThinking(true)

    try {
      // 构建对话历史
      const chatHistory = messages
        .filter(m => m.sender !== 'assistant' || m.id !== '1') // 排除初始欢迎消息
        .map(m => ({
          role: m.sender === 'user' ? 'user' as const : 'assistant' as const,
          content: m.text,
        }))
        .concat([{
          role: 'user' as const,
          content: messageText,
        }])

      // 添加上下文信息
      const context = `这是一个多链区块链浏览器，支持30+主流区块链网络（Ethereum、Bitcoin、Polygon、BSC、Solana等）。
用户可以查询交易、地址、区块、Token等信息。还有数据分析和热点新闻功能。
技术支持邮箱：testops_jianshuai@126.com`

      // 调用 AI 服务获取回复
      const aiResponse = await aiService.getAIResponse(chatHistory, context)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse,
        sender: 'assistant',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch (error: any) {
      console.error('AI service error:', error)
      
      // 根据错误类型提供不同的提示
      let errorMessage = '抱歉，AI服务暂时不可用。'
      
      if (error?.message?.includes('API key')) {
        errorMessage = `AI服务需要配置API key才能使用完整功能。\n\n💡 提示：\n1. 获取免费的DeepSeek API key：https://platform.deepseek.com/\n2. 在项目根目录的.env文件中添加：\n   VITE_DEEPSEEK_API_KEY=your_api_key\n3. 重启应用即可使用完整的AI功能\n\n目前使用智能规则引擎，可以回答常见问题。如需技术支持，请联系：testops_jianshuai@126.com`
      } else if (error?.message?.includes('loading')) {
        errorMessage = 'AI模型正在加载中，请稍等几秒后重试。'
      } else {
        errorMessage = `抱歉，AI服务暂时不可用。您可以：\n\n1. 查看首页的使用说明\n2. 联系技术支持：testops_jianshuai@126.com\n3. 稍后再试\n\n💡 提示：配置DeepSeek API key可获得更好的AI体验！`
      }
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        sender: 'assistant',
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setIsAIThinking(false)
    }
  }

  const handleQuickReply = (text: string) => {
    handleSendMessage(text)
  }

  // 自动滚动到底部
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' })
    }
    // 备用方案：使用容器滚动
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight
    }
  }

  // 当消息更新时自动滚动
  useEffect(() => {
    scrollToBottom()
  }, [messages, isAIThinking])

  const handleContactEmail = () => {
    // 显示联系信息
    const email = 'testops_jianshuai@126.com'
    const message = `联系信息已复制！\n\n📧 邮箱：${email}\n\n如有任何问题或建议，请通过以上邮箱联系。`
    
    // 尝试复制到剪贴板并打开邮件客户端
    if (navigator.clipboard) {
      navigator.clipboard.writeText(email).then(() => {
        // 创建临时提示
        const toast = document.createElement('div')
        toast.className = 'fixed top-20 right-6 z-[60] glass-strong rounded-lg px-4 py-3 shadow-2xl border border-cyan-500/30'
        toast.innerHTML = `
          <div class="flex items-center gap-2">
            <svg class="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
            </svg>
            <div>
              <p class="text-sm font-semibold text-white">邮箱已复制</p>
              <p class="text-xs text-gray-400">${email}</p>
            </div>
          </div>
        `
        document.body.appendChild(toast)
        setTimeout(() => {
          toast.remove()
        }, 3000)
        
        // 尝试打开邮件客户端
        window.location.href = `mailto:${email}?subject=MultiChain Explorer 技术支持`
      }).catch(() => {
        alert(message)
        window.location.href = `mailto:${email}?subject=MultiChain Explorer 技术支持`
      })
    } else {
      alert(message)
      window.location.href = `mailto:${email}?subject=MultiChain Explorer 技术支持`
    }
  }

  return (
    <>
      {/* 浮动按钮 */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(true)
          setIsMinimized(false)
        }}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-purple-600 shadow-2xl flex items-center justify-center text-white transition-all ${
          isOpen ? 'hidden' : 'flex'
        }`}
      >
        <MessageCircle className="w-6 h-6" />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute inset-0 rounded-full bg-cyan-400 opacity-30"
        />
      </motion.button>

      {/* 聊天窗口 */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              y: 0, 
              scale: 1,
              height: isMinimized ? 'auto' : '600px'
            }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 w-96 glass-strong rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* 头部 */}
            <div className="bg-gradient-to-r from-cyan-500 to-purple-600 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400/30 to-purple-500/30 flex items-center justify-center border border-yellow-300/20">
                  <Brain className="w-5 h-5 text-yellow-300" />
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 rounded-full bg-yellow-400/10"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Brain className="w-4 h-4 text-yellow-300" />
                    <h3 className="text-white font-semibold">AI 智能助手</h3>
                    <span className="px-1.5 py-0.5 bg-yellow-400/20 text-yellow-300 rounded text-[10px] font-medium">AI</span>
                  </div>
                  <p className="text-xs text-white/80 mt-0.5">基于大语言模型，专业解答</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <ChevronDown 
                    className={`w-4 h-4 text-white transition-transform ${isMinimized ? 'rotate-180' : ''}`} 
                  />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* 消息列表 */}
                <div 
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar min-h-0"
                >
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-3 ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
                            : 'glass text-gray-200'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-line">{message.text}</p>
                        <p className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString('zh-CN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                  
                  {/* AI 思考中提示 */}
                  {isAIThinking && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start"
                    >
                      <div className="glass rounded-2xl p-3 text-gray-200 border border-yellow-400/20">
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <Brain className="w-4 h-4 text-yellow-400 animate-pulse" />
                            <motion.div
                              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
                              transition={{ repeat: Infinity, duration: 1.5 }}
                              className="absolute inset-0 rounded-full bg-yellow-400/30"
                            />
                          </div>
                          <span className="text-sm">AI 正在分析中...</span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  
                  {/* 滚动锚点 */}
                  <div ref={messagesEndRef} />
                </div>

                {/* 快速回复 - 只在初始状态显示 */}
                {messages.length === 1 && (
                  <div className="px-4 pb-2 flex-shrink-0">
                    <p className="text-xs text-gray-400 mb-2">快速问题：</p>
                    <div className="flex flex-wrap gap-2">
                      {quickReplies.map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className="px-3 py-1.5 text-xs glass rounded-full hover:bg-white/20 transition-colors text-gray-300"
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 底部固定区域 - AI能力和联系信息 */}
                <div className="flex-shrink-0 space-y-2 px-4 pb-2">
                  {/* AI 能力说明 - 只在初始状态显示 */}
                  {messages.length === 1 && (
                    <div className="glass rounded-xl p-3 border border-yellow-400/20 bg-yellow-400/5">
                      <div className="flex items-center gap-2 mb-1">
                        <Zap className="w-4 h-4 text-yellow-400" />
                        <span className="text-xs font-semibold text-gray-300">AI 能力</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        基于大语言模型，可解答区块链、交易查询、数据分析等专业问题
                      </p>
                    </div>
                  )}

                  {/* 联系信息卡片 - 始终显示但更紧凑 */}
                  <div className="glass rounded-xl p-2.5 border border-cyan-500/30">
                    <button
                      onClick={handleContactEmail}
                      className="flex items-center gap-2 text-xs text-cyan-400 hover:text-cyan-300 transition-colors w-full"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span className="flex-1 text-left">联系 testops_jianshuai@126.com</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* 输入框 */}
                <div className="p-4 border-t border-white/10">
                  <div 
                    className="flex items-center gap-2"
                    onClick={(e) => {
                      // 点击容器区域时聚焦输入框
                      const input = e.currentTarget.querySelector('input')
                      if (input && e.target !== input) {
                        input.focus()
                      }
                    }}
                    style={{ cursor: 'text' }}
                  >
                    <input
                      type="text"
                      value={inputText}
                      onChange={(e) => {
                        e.stopPropagation()
                        setInputText(e.target.value)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey && !isAIThinking) {
                          e.preventDefault()
                          handleSendMessage()
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        e.currentTarget.focus()
                      }}
                      onFocus={(e) => {
                        e.stopPropagation()
                      }}
                      placeholder="向 AI 提问，支持自然语言..."
                      disabled={isAIThinking}
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ 
                        pointerEvents: 'auto',
                        width: '100%',
                        minWidth: 0
                      }}
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputText.trim() || isAIThinking}
                      className="p-2.5 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-purple-700 transition-colors"
                    >
                      {isAIThinking ? (
                        <Loader2 className="w-4 h-4 text-white animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 text-white" />
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
