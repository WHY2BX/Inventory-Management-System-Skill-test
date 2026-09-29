'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, Package, BarChart2 } from 'lucide-react'
import StockAdjustModal from '@/components/StockAdjustModal'

interface Product {
  id: number
  name: string
  sku: string
  costPrice: number
  stockQuantity: number
  category: { id: number; name: string }
  createdAt: string
}

export default function LowStockPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null)

  const fetchLowStock = async () => {
    setLoading(true)
    const res = await fetch('/api/products/low-stock')
    const data = await res.json()
    setProducts(data.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchLowStock() }, [])

  const formatCurrency = (v: number) =>
    new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(v)

  const getStockLevel = (qty: number) => {
    if (qty === 0) return { label: 'หมดสต็อก', cls: 'bg-red-100 text-red-700 border-red-200', barCls: 'bg-red-500', width: '0%' }
    if (qty <= 2) return { label: 'วิกฤต', cls: 'bg-red-100 text-red-700 border-red-200', barCls: 'bg-red-500', width: `${(qty / 5) * 100}%` }
    return { label: 'ใกล้หมด', cls: 'bg-amber-100 text-amber-700 border-amber-200', barCls: 'bg-amber-400', width: `${(qty / 5) * 100}%` }
  }

  return (
    <div className="p-8">
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">สินค้าใกล้หมด</h1>
            <p className="text-gray-500 mt-0.5">สินค้าที่มีจำนวนน้อยกว่า 5 ชิ้น</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-36 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="h-2 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-gray-500">สินค้าทุกรายการมีสต็อกเพียงพอ</p>
          <p className="text-sm mt-1">ไม่มีสินค้าที่มีจำนวนน้อยกว่า 5 ชิ้น</p>
        </div>
      ) : (
        <>
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              พบ <strong>{products.length}</strong> รายการที่ต้องเติมสต็อก
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products.map((p) => {
              const level = getStockLevel(p.stockQuantity)
              return (
                <div key={p.id} className={`bg-white rounded-xl border shadow-sm p-5 ${level.cls.includes('red') ? 'border-red-200' : 'border-amber-200'}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 pr-2">
                      <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 font-mono mt-0.5">{p.sku}</p>
                    </div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border flex-shrink-0 ${level.cls}`}>
                      {level.label}
                    </span>
                  </div>

                  {/* Stock Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>คงเหลือ</span>
                      <span className="font-bold text-gray-800">{p.stockQuantity} / 5 ชิ้น</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${level.barCls} transition-all`} style={{ width: level.width }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400">หมวดหมู่</p>
                      <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
                        {p.category.name}
                      </span>
                    </div>
                    <button
                      onClick={() => setAdjustTarget(p)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium transition-colors"
                    >
                      <BarChart2 className="w-3.5 h-3.5" />
                      เติมสต็อก
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}

      {adjustTarget && (
        <StockAdjustModal
          product={adjustTarget}
          onClose={() => setAdjustTarget(null)}
          onSuccess={() => { setAdjustTarget(null); fetchLowStock() }}
        />
      )}
    </div>
  )
}
