'use client'

import { useState, useEffect } from 'react'
import { X, TrendingUp, TrendingDown, Search } from 'lucide-react'

interface Product {
  id: number
  name: string
  sku: string
  stockQuantity: number
}

interface Props {
  onClose: () => void
  onSuccess: () => void
}

export default function AddTransactionModal({ onClose, onSuccess }: Props) {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [adjustment, setAdjustment] = useState('')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [error, setError] = useState('')
  const [showDropdown, setShowDropdown] = useState(false)

  const adjNum = parseInt(adjustment) || 0
  const newStock = selectedProduct ? selectedProduct.stockQuantity + adjNum : 0

  useEffect(() => {
    const timeout = setTimeout(async () => {
      setFetching(true)
      const res = await fetch(`/api/products${search ? `?search=${encodeURIComponent(search)}` : ''}`)
      const data = await res.json()
      setProducts(data.data || [])
      setFetching(false)
    }, 300)
    return () => clearTimeout(timeout)
  }, [search])

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product)
    setSearch(product.name)
    setShowDropdown(false)
    setAdjustment('')
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedProduct) { setError('กรุณาเลือกสินค้า'); return }
    if (!adjustment || adjNum === 0) { setError('กรุณาระบุจำนวนที่ต้องการปรับ'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/stock/adjust', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: selectedProduct.id, adjustment: adjNum, reason }),
      })
      const data = await res.json()
      if (data.success) { onSuccess() } else { setError(data.error) }
    } catch { setError('เกิดข้อผิดพลาด กรุณาลองใหม่') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">เพิ่มประวัติ รับ-จ่าย</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">สินค้า <span className="text-red-500">*</span></label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setSelectedProduct(null); setShowDropdown(true) }}
                onFocus={() => setShowDropdown(true)}
                placeholder="ค้นหาชื่อสินค้า หรือ SKU..."
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {fetching ? (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center">กำลังโหลด...</div>
                ) : products.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-400 text-center">ไม่พบสินค้า</div>
                ) : (
                  products.map((p) => (
                    <button key={p.id} type="button" onClick={() => handleSelectProduct(p)}
                      className="w-full text-left px-4 py-3 hover:bg-red-50 transition-colors border-b border-gray-50 last:border-0">
                      <p className="text-sm font-medium text-gray-900">{p.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku} · สต็อก: {p.stockQuantity}</p>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {selectedProduct && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm text-gray-500">สินค้าที่เลือก</p>
              <p className="font-semibold text-gray-900 mt-0.5">{selectedProduct.name}</p>
              <p className="text-xs text-gray-400 font-mono mt-0.5">{selectedProduct.sku}</p>
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200">
                <span className="text-sm text-gray-500">สต็อกปัจจุบัน:</span>
                <span className="text-lg font-bold text-gray-900">{selectedProduct.stockQuantity}</span>
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ปรับเร็ว</label>
            <div className="grid grid-cols-6 gap-2">
              {[-10, -5, -1, 1, 5, 10].map((v) => (
                <button key={v} type="button" onClick={() => setAdjustment(String(v))}
                  className={`py-1.5 rounded-lg text-sm font-medium border transition-colors ${v < 0 ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-600 hover:bg-green-50'} ${adjustment === String(v) ? (v < 0 ? 'bg-red-50' : 'bg-green-50') : 'bg-white'}`}>
                  {v > 0 ? `+${v}` : v}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">จำนวน <span className="text-red-500">*</span> <span className="text-gray-400 text-xs">(ใส่ - สำหรับตัดออก)</span></label>
            <input type="number" value={adjustment} onChange={(e) => setAdjustment(e.target.value)}
              placeholder="เช่น +10 หรือ -5"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          {selectedProduct && adjNum !== 0 && (
            <div className={`flex items-center gap-3 p-3.5 rounded-xl border ${newStock < 0 ? 'bg-red-50 border-red-200' : adjNum > 0 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
              {adjNum > 0 ? <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0" /> : <TrendingDown className="w-5 h-5 text-red-500 flex-shrink-0" />}
              <div className="text-sm">
                <span className="text-gray-600">{selectedProduct.stockQuantity}</span>
                <span className="mx-2 text-gray-400">→</span>
                <span className={`font-bold ${newStock < 0 ? 'text-red-600' : 'text-gray-900'}`}>{newStock}</span>
                {newStock < 0 && <span className="ml-2 text-red-600 text-xs">สต็อกไม่พอ!</span>}
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">เหตุผล <span className="text-gray-400 text-xs">(ไม่บังคับ)</span></label>
            <input value={reason} onChange={(e) => setReason(e.target.value)}
              placeholder="เช่น รับของจากซัพพลายเออร์, ขายให้ลูกค้า"
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors">ยกเลิก</button>
            <button type="submit" disabled={loading || !selectedProduct || adjNum === 0 || newStock < 0}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white rounded-lg text-sm font-medium transition-colors">
              {loading ? 'กำลังบันทึก...' : 'บันทึกรายการ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
