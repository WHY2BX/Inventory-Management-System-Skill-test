'use client'

import { useEffect, useState } from 'react'
import { ArrowUpCircle, ArrowDownCircle, Filter, Plus } from 'lucide-react'
import AddTransactionModal from '@/components/AddTransactionModal'

interface Transaction {
  id: number
  type: string
  quantity: number
  reason: string | null
  createdAt: string
  product: { name: string; sku: string; category: { name: string } }
}

interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [page, setPage] = useState(1)
  const [showAdd, setShowAdd] = useState(false)

  const fetchTransactions = async (p = 1, type = '') => {
    setLoading(true)
    const params = new URLSearchParams({ page: String(p), limit: '20' })
    if (type) params.set('type', type)
    const res = await fetch(`/api/stock/transactions?${params}`)
    const data = await res.json()
    setTransactions(data.data || [])
    setPagination(data.pagination)
    setLoading(false)
  }

  useEffect(() => { fetchTransactions(page, typeFilter) }, [page, typeFilter])

  const handleTypeChange = (type: string) => {
    setTypeFilter(type)
    setPage(1)
  }

  return (
    <>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">ประวัติการรับ-จ่ายสินค้า</h1>
            <p className="text-gray-500 mt-1">บันทึกการปรับสต็อกทั้งหมด</p>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            เพิ่มประวัติ รับ-จ่าย
          </button>
        </div>

        <div className="flex items-center gap-2 mb-5">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-500">กรอง:</span>
          {[
            { value: '', label: 'ทั้งหมด' },
            { value: 'IN', label: 'รับเข้า (IN)' },
            { value: 'OUT', label: 'จ่ายออก (OUT)' },
          ].map((f) => (
            <button
              key={f.value}
              onClick={() => handleTypeChange(f.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors ${
                typeFilter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">ประเภท</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">สินค้า</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">หมวดหมู่</th>
                <th className="text-center px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">จำนวน</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">เหตุผล</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">วันที่-เวลา</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(8)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(6)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">ไม่พบรายการ</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tx.type === 'IN' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {tx.type === 'IN' ? <ArrowUpCircle className="w-3.5 h-3.5" /> : <ArrowDownCircle className="w-3.5 h-3.5" />}
                        {tx.type === 'IN' ? 'รับเข้า' : 'จ่ายออก'}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900">{tx.product.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{tx.product.sku}</p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="px-2.5 py-1 bg-purple-50 text-purple-700 rounded-full text-xs font-medium">
                        {tx.product.category.name}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <span className={`font-bold ${tx.type === 'IN' ? 'text-green-600' : 'text-red-500'}`}>
                        {tx.type === 'IN' ? '+' : '-'}{tx.quantity}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-500 text-sm max-w-xs truncate">
                      {tx.reason ?? <span className="text-gray-300 italic">ไม่ระบุ</span>}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-400 text-xs whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleString('th-TH', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                แสดง {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} จาก {pagination.total} รายการ
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  ← ก่อนหน้า
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= pagination.totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-50 disabled:opacity-40"
                >
                  ถัดไป →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showAdd && (
        <AddTransactionModal
          onClose={() => setShowAdd(false)}
          onSuccess={() => {
            setShowAdd(false)
            setPage(1)
            fetchTransactions(1, typeFilter)
          }}
        />
      )}
    </>
  )
}
