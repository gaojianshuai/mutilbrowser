import { useState, useRef, useEffect } from 'react'
import { ChevronDown, ArrowUp, ArrowDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Chain, SUPPORTED_CHAINS } from '../types/chain'
import { useQuery } from 'react-query'
import { blockchainAPI } from '../services/api'

interface ChainSelectorProps {
  selectedChain: Chain
  onSelectChain: (chain: Chain) => void
}

export default function ChainSelector({ selectedChain, onSelectChain }: ChainSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // 获取价格信息
  const { data: cryptoPrices } = useQuery(
    ['cryptoPrices'],
    () => blockchainAPI.getCryptoPrices(SUPPORTED_CHAINS.map(c => c.id)),
    {
      refetchInterval: 60000,
      refetchOnWindowFocus: true,
      staleTime: 30000,
    }
  )

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass rounded-xl px-4 py-3 flex items-center gap-3 min-w-[180px] hover:bg-white/15 transition-all"
      >
        <div className="text-2xl">{selectedChain.icon}</div>
        <div className="flex-1 text-left">
          <div className="font-semibold">{selectedChain.name}</div>
          <div className="text-xs text-gray-400">{selectedChain.symbol}</div>
        </div>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full mt-2 left-0 right-0 glass-strong rounded-xl overflow-hidden z-[9999] max-h-96 overflow-y-auto shadow-2xl"
            style={{ position: 'absolute' }}
          >
            {SUPPORTED_CHAINS.map((chain) => {
              const priceInfo = cryptoPrices?.[chain.id]
              const priceChange = priceInfo?.priceChangePercent24h || 0
              const isPositive = priceChange >= 0
              
              return (
                <button
                  key={chain.id}
                  onClick={() => {
                    onSelectChain(chain)
                    setIsOpen(false)
                  }}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-white/10 transition-all ${
                    selectedChain.id === chain.id ? 'bg-white/10' : ''
                  }`}
                >
                  <div className="text-2xl">{chain.icon}</div>
                  <div className="flex-1 text-left">
                    <div className="font-semibold">{chain.name}</div>
                    <div className="text-xs text-gray-400">{chain.symbol}</div>
                  </div>
                  {priceInfo && priceInfo.price > 0 && (
                    <div className="text-right">
                      <div className="text-xs font-semibold text-white">
                        ${priceInfo.price >= 0.01 
                          ? priceInfo.price.toLocaleString('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: priceInfo.price >= 1 ? 2 : 4 
                            })
                          : priceInfo.price.toFixed(6)
                        }
                      </div>
                      {priceChange !== 0 && (
                        <div className={`text-[10px] flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {isPositive ? (
                            <ArrowUp className="w-2.5 h-2.5" />
                          ) : (
                            <ArrowDown className="w-2.5 h-2.5" />
                          )}
                          <span>{Math.abs(priceChange).toFixed(2)}%</span>
                        </div>
                      )}
                    </div>
                  )}
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
