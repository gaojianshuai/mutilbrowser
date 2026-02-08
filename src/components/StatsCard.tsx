import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface StatsCardProps {
  title: string
  value: string
  icon: ReactNode
  gradient: string
}

export default function StatsCard({ title, value, icon, gradient }: StatsCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      className={`glass rounded-xl p-6 bg-gradient-to-br ${gradient} bg-opacity-10 hover:bg-opacity-20 transition-all border-gray-800/50`}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        <div className="text-gray-400">{icon}</div>
      </div>
      <div className="text-3xl font-bold text-gray-200">{value}</div>
    </motion.div>
  )
}
