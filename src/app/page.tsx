'use client'

import { useEffect, useState } from 'react'
import {
  Package,
  Tags,
  AlertTriangle,
  TrendingUp,
  ArrowUpCircle,
  ArrowDownCircle,
} from 'lucide-react'
import Link from 'next/link'

interface Summary {
  totalProducts: number
  totalCategories: number
  lowStockCount: number
  inventoryValue: number
  recentTransactions: Array<{
    id: number
    type: string
    quantity: number
    reason: string | null
    createdAt: string
    product: { name: string; sku: string }
  }>
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
  href,
}: {
  icon: React.ElementType
  label: string
  value: string | number
  color: string
  href?: string
}) {
  const card = (
    <div className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow ${href ? 'cursor-pointer' : ''}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 font-medium">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )

  return href ? <Link href={href}>{card}</Link> : card
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/summary')
      .then((r) => r.json())
      .then((d) => setSummary(d.data))
      .finally(() => setLoading(false))
  }, [])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value)

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">ภาพรวมของระบบคลังสินค้า</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-28 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-3" />
              <div className="h-7 bg-gray-200 rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
            <StatCard
              icon={Package}
              label="สินค้าทั้งหมด"
              value={summary?.totalProducts ?? 0}
              color="bg-red-500"
              href="/products"
            />
            <StatCard
              icon={Tags}
              label="หมวดหมู่"
              value={summary?.totalCategories ?? 0}
              color="bg-purple-500"
              href="/categories"
            />
            <StatCard
              icon={AlertTriangle}
              label="สินค้าใกล้หมด"
              value={summary?.lowStockCount ?? 0}
              color="bg-amber-500"
              href="/low-stock"
            />
            <StatCard
              icon={TrendingUp}
              label="มูลค่าสินค้ารวม"
              value={formatCurrency(summary?.inventoryValue ?? 0)}
              color="bg-green-500"
            />
          </div>

          {/* Recent Transactions */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">รายการล่าสุด</h2>
              <Link href="/transactions" className="text-sm text-red-600 hover:text-red-700 font-medium">
                ดูทั้งหมด →
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {summary?.recentTransactions.length === 0 ? (
                <div className="py-12 text-center text-gray-400 text-sm">ยังไม่มีรายการ</div>
              ) : (
                summary?.recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center gap-4 px-6 py-3.5">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        tx.type === 'IN' ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      {tx.type === 'IN' ? (
                        <ArrowUpCircle className="w-4.5 h-4.5 text-green-600" size={18} />
                      ) : (
                        <ArrowDownCircle className="w-4.5 h-4.5 text-red-500" size={18} />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{tx.product.name}</p>
                      <p className="text-xs text-gray-400">{tx.reason ?? 'ไม่ระบุเหตุผล'}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className={`text-sm font-semibold ${tx.type === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(tx.createdAt).toLocaleDateString('th-TH', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
