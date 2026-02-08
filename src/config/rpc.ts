/**
 * 免费的公开 RPC 节点配置
 * 这些是市场上公开可用的免费 RPC 端点
 */

export const FREE_RPC_ENDPOINTS: Record<string, string[]> = {
  ethereum: [
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://ethereum.publicnode.com',
    'https://eth.drpc.org',
    'https://1rpc.io/eth',
  ],
  polygon: [
    'https://polygon-rpc.com',
    'https://rpc.ankr.com/polygon',
    'https://polygon.llamarpc.com',
    'https://polygon.drpc.org',
    'https://1rpc.io/matic',
  ],
  bsc: [
    'https://bsc-dataseed.binance.org',
    'https://bsc-dataseed1.defibit.io',
    'https://rpc.ankr.com/bsc',
    'https://bsc-dataseed1.ninicoin.io',
    'https://1rpc.io/bnb',
  ],
  avalanche: [
    'https://api.avax.network/ext/bc/C/rpc',
    'https://avalanche.public-rpc.com',
    'https://rpc.ankr.com/avalanche',
    'https://avax.drpc.org',
    'https://1rpc.io/avax',
  ],
  arbitrum: [
    'https://arb1.arbitrum.io/rpc',
    'https://rpc.ankr.com/arbitrum',
    'https://arbitrum.llamarpc.com',
    'https://arbitrum.drpc.org',
    'https://1rpc.io/arb',
  ],
  optimism: [
    'https://mainnet.optimism.io',
    'https://rpc.ankr.com/optimism',
    'https://optimism.llamarpc.com',
    'https://optimism.drpc.org',
    'https://1rpc.io/op',
  ],
  solana: [
    'https://api.mainnet-beta.solana.com',
    'https://rpc.ankr.com/solana',
    'https://solana.public-rpc.com',
    'https://solana.drpc.org',
  ],
  base: [
    'https://mainnet.base.org',
    'https://base.llamarpc.com',
    'https://base.drpc.org',
    'https://1rpc.io/base',
    'https://rpc.ankr.com/base',
  ],
  linea: [
    'https://rpc.linea.build',
    'https://linea.drpc.org',
    'https://1rpc.io/linea',
  ],
  zksync: [
    'https://mainnet.era.zksync.io',
    'https://zksync.drpc.org',
    'https://1rpc.io/zksync',
  ],
  scroll: [
    'https://rpc.scroll.io',
    'https://scroll.drpc.org',
    'https://1rpc.io/scroll',
  ],
  mantle: [
    'https://rpc.mantle.xyz',
    'https://mantle.drpc.org',
    'https://1rpc.io/mantle',
  ],
  blast: [
    'https://rpc.blast.io',
    'https://blast.drpc.org',
  ],
  starknet: [
    'https://starknet-mainnet.public.blastapi.io',
    'https://rpc.starknet.io',
  ],
  sui: [
    'https://fullnode.mainnet.sui.io',
    'https://sui-mainnet-endpoint.blockvision.org',
  ],
  aptos: [
    'https://fullnode.mainnet.aptoslabs.com',
    'https://aptos-mainnet.public.blastapi.io',
  ],
  tron: [
    'https://api.trongrid.io',
    'https://tron.blockpi.network/v1/rpc/public',
  ],
  cosmos: [
    'https://cosmos-rpc.polkachu.com',
    'https://rpc.cosmos.network',
  ],
  near: [
    'https://rpc.mainnet.near.org',
    'https://near-mainnet.api.onfinality.io/public',
  ],
  fantom: [
    'https://rpc.ftm.tools',
    'https://fantom.drpc.org',
    'https://1rpc.io/ftm',
  ],
  celo: [
    'https://forno.celo.org',
    'https://celo.drpc.org',
  ],
  gnosis: [
    'https://rpc.gnosischain.com',
    'https://gnosis.drpc.org',
  ],
  moonbeam: [
    'https://rpc.api.moonbeam.network',
    'https://moonbeam.drpc.org',
  ],
  cronos: [
    'https://evm.cronos.org',
    'https://cronos.drpc.org',
  ],
  klaytn: [
    'https://public-node-api.klaytnapi.com/v1/cypress',
    'https://klaytn.drpc.org',
  ],
  metis: [
    'https://andromeda.metis.io/?owner=1088',
    'https://metis.drpc.org',
  ],
  boba: [
    'https://mainnet.boba.network',
    'https://boba.drpc.org',
  ],
  aurora: [
    'https://mainnet.aurora.dev',
    'https://aurora.drpc.org',
  ],
  harmony: [
    'https://api.harmony.one',
    'https://harmony.drpc.org',
  ],
  fuse: [
    'https://fuse-rpc.gateway.pokt.network',
    'https://fuse.drpc.org',
  ],
  celestia: [
    'https://rpc.celestia.pops.one',
  ],
  filecoin: [
    'https://api.node.glif.io/rpc/v1',
  ],
  immutable: [
    'https://rpc.immutable.com',
  ],
  zora: [
    'https://rpc.zora.energy',
  ],
  mode: [
    'https://mainnet.mode.network',
  ],
  opbnb: [
    'https://opbnb-mainnet-rpc.bnbchain.org',
  ],
  manta: [
    'https://pacific-rpc.manta.network/http',
  ],
  kava: [
    'https://evm.kava.io',
  ],
  evmos: [
    'https://eth.bd.evmos.org:8545',
  ],
  canto: [
    'https://canto.gravitychain.io',
  ],
  core: [
    'https://rpc.coredao.org',
  ],
  zetachain: [
    'https://zetachain-evm.blockpi.network/v1/rpc/public',
  ],
}

/**
 * 免费的 API 端点配置
 * 一些链提供免费的公共 API，不需要 API key
 */
export const FREE_API_ENDPOINTS: Record<string, { url: string; requiresKey: boolean; freeTier?: boolean }> = {
  ethereum: {
    url: 'https://api.etherscan.io/api',
    requiresKey: true,
    freeTier: true, // Etherscan 提供免费 tier
  },
  polygon: {
    url: 'https://api.polygonscan.com/api',
    requiresKey: true,
    freeTier: true,
  },
  bsc: {
    url: 'https://api.bscscan.com/api',
    requiresKey: true,
    freeTier: true,
  },
  avalanche: {
    url: 'https://api.snowtrace.io/api',
    requiresKey: true,
    freeTier: true,
  },
  arbitrum: {
    url: 'https://api.arbiscan.io/api',
    requiresKey: true,
    freeTier: true,
  },
  optimism: {
    url: 'https://api-optimistic.etherscan.io/api',
    requiresKey: true,
    freeTier: true,
  },
  bitcoin: {
    url: 'https://blockstream.info/api',
    requiresKey: false, // Blockstream 完全免费，无需 API key
  },
  solana: {
    url: 'https://api.mainnet-beta.solana.com',
    requiresKey: false, // Solana RPC 免费
  },
  base: {
    url: 'https://api.basescan.org/api',
    requiresKey: true,
    freeTier: true,
  },
  linea: {
    url: 'https://api.lineascan.build/api',
    requiresKey: true,
    freeTier: true,
  },
  zksync: {
    url: 'https://block-explorer-api.mainnet.zksync.io/api',
    requiresKey: false,
  },
  scroll: {
    url: 'https://api.scrollscan.com/api',
    requiresKey: true,
    freeTier: true,
  },
  mantle: {
    url: 'https://explorer.mantle.xyz/api',
    requiresKey: false,
  },
  blast: {
    url: 'https://api.blastscan.io/api',
    requiresKey: true,
    freeTier: true,
  },
}

/**
 * 获取可用的 RPC 端点（带故障转移）
 */
export function getRpcUrl(chainId: string, fallbackIndex: number = 0): string {
  const endpoints = FREE_RPC_ENDPOINTS[chainId]
  if (!endpoints || endpoints.length === 0) {
    throw new Error(`No RPC endpoints configured for ${chainId}`)
  }
  return endpoints[fallbackIndex % endpoints.length]
}

/**
 * 测试 RPC 端点是否可用
 */
export async function testRpcEndpoint(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_blockNumber',
        params: [],
      }),
    })
    const data = await response.json()
    return data.result !== undefined
  } catch {
    return false
  }
}
