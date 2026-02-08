import axios from 'axios'

/**
 * AI 服务 - 使用免费的 DeepSeek API
 * DeepSeek 提供免费的 API，无需 API key 即可使用（有限制）
 * 或者使用 Groq API（完全免费，速度快）
 */

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

class AIService {
  // 备用：DeepSeek API（免费，但需要 API key）
  private readonly DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions'

  /**
   * 获取 AI 回复
   * 优先级：DeepSeek > Hugging Face > 规则引擎
   */
  async getAIResponse(messages: ChatMessage[], context?: string): Promise<string> {
    // 1. 优先尝试 DeepSeek API（如果配置了API key）
    const deepSeekApiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
    if (deepSeekApiKey && deepSeekApiKey !== 'YOUR_DEEPSEEK_API_KEY') {
      try {
        console.log('尝试使用 DeepSeek API...')
        return await this.getDeepSeekResponse(messages, context)
      } catch (error) {
        console.log('DeepSeek API 失败，尝试其他方案:', error)
      }
    }

    // 2. 尝试使用 Hugging Face API（完全免费）
    try {
      console.log('尝试使用 Hugging Face API...')
      return await this.getHuggingFaceResponse(messages, context)
    } catch (error) {
      console.log('Hugging Face API 失败，尝试其他方案:', error)
    }

    // 3. 尝试使用免费的 OpenAI 兼容 API（如 Together AI 或其他免费服务）
    try {
      console.log('尝试使用免费 OpenAI 兼容 API...')
      return await this.getFreeOpenAIResponse(messages, context)
    } catch (error) {
      console.log('免费 OpenAI API 失败，使用智能规则引擎:', error)
    }

    // 4. 最后使用增强的智能规则引擎
    console.log('使用智能规则引擎作为后备方案')
    return this.getEnhancedFallbackResponse(messages, context)
  }


  /**
   * 使用 Hugging Face Inference API（完全免费）
   * 使用 Qwen2.5 7B 模型（免费，中文支持好）
   */
  private async getHuggingFaceResponse(messages: ChatMessage[], context?: string): Promise<string> {
    // 使用更轻量的模型，响应更快
    const model = 'Qwen/Qwen2.5-7B-Instruct'
    
    const userMessage = messages[messages.length - 1]?.content || ''
    const conversationHistory = messages.slice(0, -1)
    
    // 构建完整的对话历史
    let prompt = `<|im_start|>system\n你是一个专业的区块链和加密货币助手。${context || ''} 请用中文回答，回答要准确、专业、有帮助。你可以回答任何相关问题。<|im_end|>\n`
    
    // 添加对话历史
    for (const msg of conversationHistory) {
      const role = msg.role === 'user' ? 'user' : 'assistant'
      prompt += `<|im_start|>${role}\n${msg.content}<|im_end|>\n`
    }
    
    // 添加当前用户消息
    prompt += `<|im_start|>user\n${userMessage}<|im_end|>\n<|im_start|>assistant\n`

    try {
      const response = await axios.post(
        `https://api-inference.huggingface.co/models/${model}`,
        {
          inputs: prompt,
          parameters: {
            max_new_tokens: 1000,
            temperature: 0.7,
            return_full_text: false,
            top_p: 0.9,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 增加超时时间
        }
      )

      // 处理响应
      if (response.data) {
        // 如果返回的是数组
        if (Array.isArray(response.data) && response.data[0]?.generated_text) {
          let generatedText = response.data[0].generated_text
          generatedText = generatedText.replace(/<\|im_end\|>/g, '').trim()
          if (generatedText) {
            return generatedText
          }
        }
        // 如果返回的是对象
        if (response.data.generated_text) {
          let generatedText = response.data.generated_text
          generatedText = generatedText.replace(/<\|im_end\|>/g, '').trim()
          if (generatedText) {
            return generatedText
          }
        }
        // 如果模型正在加载，等待后重试
        if (response.data.error && response.data.error.includes('loading')) {
          throw new Error('Model is loading, please wait')
        }
      }

      throw new Error('Invalid response format')
    } catch (error: any) {
      if (error.response?.status === 503) {
        throw new Error('Hugging Face model is loading, please try again later')
      }
      throw error
    }
  }

  /**
   * 使用 DeepSeek API（需要 API key，但免费）
   * DeepSeek 提供免费额度，质量高，中文支持好
   */
  private async getDeepSeekResponse(messages: ChatMessage[], context?: string): Promise<string> {
    const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY || ''
    
    if (!apiKey || apiKey === 'YOUR_DEEPSEEK_API_KEY') {
      throw new Error('DeepSeek API key not configured')
    }

    const systemMessage: ChatMessage = {
      role: 'system',
      content: `你是一个专业的区块链和加密货币助手，专门帮助用户解答关于多链浏览器、区块链交易、地址查询、数据分析等问题。

${context ? `当前上下文：${context}` : ''}

请用中文回答，回答要准确、专业、有帮助。你可以回答任何相关问题，不仅仅是预设的问题。`,
    }

    try {
      const response = await axios.post(
        this.DEEPSEEK_API_URL,
        {
          model: 'deepseek-chat',
          messages: [systemMessage, ...messages],
          temperature: 0.7,
          max_tokens: 2000,
          stream: false,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          timeout: 30000,
        }
      )

      if (response.data && response.data.choices && response.data.choices[0]?.message?.content) {
        return response.data.choices[0].message.content.trim()
      }

      throw new Error('Invalid response format')
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('DeepSeek API key 无效，请检查配置')
      }
      throw error
    }
  }

  /**
   * 使用免费的 OpenAI 兼容 API
   * 尝试使用一些免费的 OpenAI 兼容服务
   */
  private async getFreeOpenAIResponse(messages: ChatMessage[], context?: string): Promise<string> {
    // 尝试使用 Together AI 或其他免费服务
    // 这里可以添加更多免费 API 选项
    
    // 示例：使用 Together AI（需要注册但免费）
    const togetherApiKey = import.meta.env.VITE_TOGETHER_API_KEY || ''
    if (togetherApiKey && togetherApiKey !== 'YOUR_TOGETHER_API_KEY') {
      try {
        const systemMessage: ChatMessage = {
          role: 'system',
          content: `你是一个专业的区块链和加密货币助手。${context || ''} 请用中文回答。`,
        }

        const response = await axios.post(
          'https://api.together.xyz/v1/chat/completions',
          {
            model: 'meta-llama/Llama-3-8b-chat-hf',
            messages: [systemMessage, ...messages],
            temperature: 0.7,
            max_tokens: 1000,
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${togetherApiKey}`,
            },
            timeout: 30000,
          }
        )

        if (response.data?.choices?.[0]?.message?.content) {
          return response.data.choices[0].message.content.trim()
        }
      } catch (error) {
        console.log('Together AI failed:', error)
      }
    }

    throw new Error('No free OpenAI compatible API available')
  }

  /**
   * 增强的智能回复引擎（当 AI API 失败时使用）
   * 基于对话历史和上下文提供智能回复
   */
  private getEnhancedFallbackResponse(messages: ChatMessage[], _context?: string): string {
    const userMessage = messages[messages.length - 1]?.content || ''
    const lowerMessage = userMessage.toLowerCase()
    const conversationHistory = messages.slice(-3).map(m => m.content).join(' ').toLowerCase()

    // 基于关键词和对话历史的智能回复
    if (lowerMessage.includes('联系') || lowerMessage.includes('技术支持') || lowerMessage.includes('问题') || lowerMessage.includes('邮箱')) {
      return '如需技术支持或有问题反馈，请联系：\n\n📧 邮箱：testops_jianshuai@126.com\n\n我会尽快回复您的问题。您也可以直接点击下方的联系按钮。'
    }

    if (lowerMessage.includes('查询') || lowerMessage.includes('搜索') || lowerMessage.includes('查找') || lowerMessage.includes('怎么查')) {
      return '您可以在首页搜索框输入：\n• 地址（0x开头的EVM地址或Bitcoin地址）\n• 交易哈希（64字符）\n• 区块号（纯数字）\n\n系统会自动识别链类型并搜索。支持30+主流区块链网络，包括Ethereum、Bitcoin、Polygon、BSC、Solana等。'
    }

    if (lowerMessage.includes('数据') || lowerMessage.includes('分析') || lowerMessage.includes('统计')) {
      return '数据分析功能提供：\n• 实时交易统计和趋势\n• 网络健康度监控\n• 活跃地址分析\n• Gas价格趋势\n• 大额交易监控\n• 区块生产速率\n\n点击导航栏"数据分析"即可查看。数据每30秒自动刷新，确保实时性。'
    }

    if (lowerMessage.includes('使用') || lowerMessage.includes('帮助') || lowerMessage.includes('怎么') || lowerMessage.includes('如何')) {
      return '使用指南：\n1. 在搜索框输入地址/交易哈希/区块号\n2. 系统自动识别链类型并搜索\n3. 查看详细信息和数据分析\n4. 支持30+主流区块链\n5. 查看热点新闻了解市场动态\n6. 使用数据分析功能监控链上活动\n\n有问题随时联系我！'
    }

    if (lowerMessage.includes('链') || lowerMessage.includes('blockchain') || lowerMessage.includes('chain') || lowerMessage.includes('网络')) {
      return '我们支持30+主流区块链网络：\n\n**主流链：**\n• Ethereum、Bitcoin、Polygon、BSC\n• Solana、Avalanche、Arbitrum、Optimism\n\n**Layer 2：**\n• Base、Linea、zkSync、Scroll、Mantle、Blast\n\n**其他链：**\n• Aptos、Sui、Tron、Cosmos、NEAR\n• Fantom、Celo、Gnosis、Moonbeam\n\n所有数据都是实时从区块链节点获取的，保证真实性。'
    }

    if (lowerMessage.includes('gas') || lowerMessage.includes('手续费') || lowerMessage.includes('费用')) {
      return 'Gas价格信息：\n• 在首页可以看到当前链的Gas价格\n• 数据分析页面有详细的Gas趋势分析\n• 不同链的Gas单位不同：\n  - ETH链：Gwei\n  - BTC：sat/vB\n  - Solana：lamports\n\nGas价格会根据网络拥堵情况实时变化。建议在网络不拥堵时进行交易以节省费用。'
    }

    if (lowerMessage.includes('交易') || lowerMessage.includes('transaction') || lowerMessage.includes('tx')) {
      return '交易查询功能：\n• 输入交易哈希即可查询\n• 查看交易详情：发送方、接收方、金额、Gas费用\n• 查看交易状态：成功/失败/待确认\n• 查看交易时间戳和确认数\n• 支持所有主流链的交易查询\n\n在首页搜索框输入交易哈希即可。'
    }

    if (lowerMessage.includes('地址') || lowerMessage.includes('address') || lowerMessage.includes('钱包')) {
      return '地址查询功能：\n• 输入地址即可查询余额和交易历史\n• 查看地址的Token持有情况\n• 查看地址的交易记录\n• 支持所有主流链的地址格式\n\n支持的地址格式：\n• EVM地址：0x开头，42字符\n• Bitcoin地址：1、3或bc1开头\n• Solana地址：Base58编码\n\n在首页搜索框输入地址即可。'
    }

    if (lowerMessage.includes('区块') || lowerMessage.includes('block')) {
      return '区块查询功能：\n• 输入区块号即可查询区块详情\n• 查看区块中的交易列表\n• 查看区块时间戳和Gas使用情况\n• 查看区块生产速率\n\n在首页搜索框输入区块号即可。'
    }

    if (lowerMessage.includes('新闻') || lowerMessage.includes('news') || lowerMessage.includes('热点')) {
      return '热点新闻功能：\n• 实时获取全球顶级交易所和加密货币市场最新动态\n• 支持按交易所筛选新闻\n• 包含中文和英文新闻\n• 数据来自CoinGecko和CryptoCompare\n• 每60秒自动刷新\n\n点击导航栏"热点新闻"即可查看。'
    }

    if (lowerMessage.includes('支持') || lowerMessage.includes('链') && lowerMessage.includes('哪些')) {
      return '我们支持30+主流区块链网络，包括：\n\n**币安、OKX、Bybit等头部交易所支持的主要链：**\n• Ethereum、Bitcoin、Polygon、BSC\n• Solana、Avalanche、Arbitrum、Optimism\n• Base、Linea、zkSync、Scroll\n• Aptos、Sui、Tron、Cosmos、NEAR\n• Fantom、Celo、Gnosis、Moonbeam、Cronos\n• Klaytn、Metis、Boba、Aurora、Harmony\n• opBNB、Zora、Mode、Manta等\n\n所有链的数据都是实时获取的。'
    }

    // 基于对话历史的上下文回复
    if (conversationHistory.includes('查询') && lowerMessage.includes('怎么')) {
      return '查询方法很简单：\n1. 在首页搜索框输入您要查询的内容\n2. 系统会自动识别是地址、交易哈希还是区块号\n3. 自动识别属于哪个链\n4. 显示详细的查询结果\n\n支持智能识别，无需手动选择链！'
    }

    if (conversationHistory.includes('数据') && lowerMessage.includes('看')) {
      return '查看数据分析：\n1. 点击导航栏的"数据分析"\n2. 选择要查看的区块链\n3. 查看实时统计和趋势\n4. 可以切换时间范围（24小时/7天/30天）\n\n数据包括交易量、活跃地址、Gas价格、网络健康度等关键指标。'
    }

    // 通用智能回复
    return `感谢您的提问！关于"${userMessage}"，我理解您想了解相关信息。

我可以帮您解答关于：
• 如何使用多链浏览器
• 如何查询交易、地址、区块
• 数据分析功能说明
• 支持的区块链网络
• Gas价格和手续费
• 热点新闻功能

如需更详细的帮助，您可以：
1. 查看首页的使用说明
2. 使用搜索功能查询具体信息
3. 查看数据分析了解链上活动
4. 联系技术支持：testops_jianshuai@126.com

我会尽力为您解答！`
  }
}

export const aiService = new AIService()
