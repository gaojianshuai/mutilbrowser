import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import ChatAssistant from './ChatAssistant'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen">
      <nav className="glass-strong border-b border-gray-800/50 sticky top-0 z-50 backdrop-blur-xl bg-gray-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <svg 
                  className="w-6 h-6 text-white" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* 多层区块链图标 */}
                  <path 
                    d="M12 2L2 7L12 12L22 7L12 2Z" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="rgba(255,255,255,0.1)"
                  />
                  <path 
                    d="M2 12L12 17L22 12" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="rgba(255,255,255,0.1)"
                  />
                  <path 
                    d="M2 17L12 22L22 17" 
                    stroke="currentColor" 
                    strokeWidth="1.5" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                    fill="rgba(255,255,255,0.1)"
                  />
                  {/* 连接线 */}
                  <line x1="12" y1="2" x2="12" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="12" x2="12" y2="17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12" y2="22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </div>
              <span className="text-xl font-bold text-gradient">MultiChain Explorer</span>
            </Link>
            
            <div className="flex items-center space-x-6">
              <Link 
                to="/x" 
                className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors flex items-center gap-1"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                X动态
              </Link>
              <Link 
                to="/" 
                className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
              >
                浏览器
              </Link>
              <Link 
                to="/analytics" 
                className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
              >
                数据分析
              </Link>
              <Link 
                to="/news" 
                className="text-sm font-medium text-gray-400 hover:text-gray-200 transition-colors"
              >
                热点新闻
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      <footer className="mt-20 glass border-t border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>© 2026 MultiChain Explorer. 全球领先的多链数据浏览器</p>
          </div>
        </div>
      </footer>

      {/* 智能助手 */}
      <ChatAssistant />
    </div>
  )
}
