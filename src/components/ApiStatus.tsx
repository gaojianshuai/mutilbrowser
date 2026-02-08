import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react'
import { validateAllApis, ValidationResult } from '../utils/apiValidator'
import { SUPPORTED_CHAINS } from '../types/chain'

export default function ApiStatus() {
  const [results, setResults] = useState<ValidationResult[]>([])
  const [loading, setLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  const validate = async () => {
    setLoading(true)
    try {
      const validationResults = await validateAllApis()
      setResults(validationResults)
    } catch (error) {
      console.error('Validation error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    validate()
  }, [])

  const getStatusIcon = (result: ValidationResult) => {
    if (result.valid) {
      return <CheckCircle className="w-5 h-5 text-green-400" />
    } else if (result.usingRpc) {
      return <AlertCircle className="w-5 h-5 text-yellow-400" />
    } else {
      return <XCircle className="w-5 h-5 text-red-400" />
    }
  }

  const getStatusColor = (result: ValidationResult) => {
    if (result.valid) return 'border-green-500/50 bg-green-500/10'
    if (result.usingRpc) return 'border-yellow-500/50 bg-yellow-500/10'
    return 'border-red-500/50 bg-red-500/10'
  }

  const ethResult = results.find(r => r.chain === 'ethereum')

  return (
    <div className="space-y-4 h-full">
      {/* 快速状态显示 */}
      <div className="glass rounded-xl p-4 h-full flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-300">API 状态</h3>
          <button
            onClick={validate}
            disabled={loading}
            className="p-1 hover:bg-white/10 rounded transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        {loading ? (
          <div className="text-sm text-gray-400">验证中...</div>
        ) : ethResult ? (
          <div className="flex items-center gap-2 flex-1">
            {getStatusIcon(ethResult)}
            <span className="text-sm">
              {ethResult.valid 
                ? 'API 已配置' 
                : ethResult.usingRpc 
                  ? '使用免费 RPC' 
                  : 'API 验证失败'}
            </span>
          </div>
        ) : null}

        <button
          onClick={() => setShowDetails(!showDetails)}
          className="mt-auto text-xs text-cyan-400 hover:text-cyan-300 pt-2"
        >
          {showDetails ? '隐藏详情' : '查看详情'}
        </button>
      </div>

      {/* 详细状态 */}
      {showDetails && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="glass rounded-xl p-4 space-y-2"
        >
          {results.map((result) => {
            const chainInfo = SUPPORTED_CHAINS.find(c => c.id === result.chain)
            return (
              <div
                key={result.chain}
                className={`flex items-center justify-between p-3 rounded-lg border ${getStatusColor(result)}`}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(result)}
                  <div>
                    <div className="text-sm font-medium">
                      {chainInfo?.name || result.chain}
                    </div>
                    <div className="text-xs text-gray-400">{result.message}</div>
                  </div>
                </div>
                {result.hasApiKey && (
                  <span className="text-xs px-2 py-1 bg-white/10 rounded">
                    API Key
                  </span>
                )}
              </div>
            )
          })}
        </motion.div>
      )}
    </div>
  )
}
