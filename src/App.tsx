import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import AddressDetail from './pages/AddressDetail'
import TransactionDetail from './pages/TransactionDetail'
import BlockDetail from './pages/BlockDetail'
import TokenDetail from './pages/TokenDetail'
import Analytics from './pages/Analytics'
import News from './pages/News'
import XFeed from './pages/XFeed'
import Layout from './components/Layout'

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/news" element={<News />} />
          <Route path="/x" element={<XFeed />} />
          <Route path="/address/:chain/:address" element={<AddressDetail />} />
          <Route path="/tx/:chain/:hash" element={<TransactionDetail />} />
          <Route path="/block/:chain/:number" element={<BlockDetail />} />
          <Route path="/token/:chain/:address" element={<TokenDetail />} />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
