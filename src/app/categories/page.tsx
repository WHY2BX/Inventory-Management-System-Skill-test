'use client'

import { useEffect, useState } from 'react'
import { Plus, Tags, Package } from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string | null
  createdAt: string
  _count: { products: number }
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch('/api/categories')
    const data = await res.json()
    setCategories(data.data || [])
    setLoading(false)
  }

  useEffect(() => { fetchCategories() }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        setForm({ name: '', description: '' })
        setShowForm(false)
        fetchCategories()
      } else {
        setError(data.error)
      }
    } catch {
      setError('เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const colorMap: Record<number, string> = {
    0: 'bg-red-100 text-red-700',
    1: 'bg-purple-100 text-purple-700',
    2: 'bg-green-100 text-green-700',
    3: 'bg-amber-100 text-amber-700',
    4: 'bg-rose-100 text-rose-700',
    5: 'bg-cyan-100 text-cyan-700',
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">หมวดหมู่</h1>
          <p className="text-gray-500 mt-1">จัดกลุ่มสินค้าตามประเภท</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          เพิ่มหมวดหมู่
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 mb-5">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">เพิ่มหมวดหมู่ใหม่</h3>
          <form onSubmit={handleAdd} className="flex gap-3 items-end flex-wrap">
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-600 mb-1">ชื่อหมวดหมู่ *</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
                placeholder="เช่น IT, Office Supply, Furniture"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex-1 min-w-48">
              <label className="block text-xs font-medium text-gray-600 mb-1">คำอธิบาย</label>
              <input
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="คำอธิบายสั้นๆ (ไม่บังคับ)"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                ยกเลิก
              </button>
              <button type="submit" disabled={saving} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm disabled:bg-gray-300">
                {saving ? 'กำลังบันทึก...' : 'บันทึก'}
              </button>
            </div>
          </form>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      {/* Categories Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-28 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-3" />
              <div className="h-3 bg-gray-100 rounded w-full" />
            </div>
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Tags className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>ยังไม่มีหมวดหมู่ กด &quot;เพิ่มหมวดหมู่&quot; เพื่อเริ่มต้น</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <div key={cat.id} className="bg-white rounded-xl border border-gray-200 shadow-sm p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className={`px-3 py-1 rounded-lg text-sm font-semibold ${colorMap[idx % 6]}`}>
                  {cat.name}
                </div>
              </div>
              {cat.description && (
                <p className="text-sm text-gray-500 mt-2">{cat.description}</p>
              )}
              <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-gray-50">
                <Package className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-500">{cat._count.products} สินค้า</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
