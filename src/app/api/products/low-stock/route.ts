import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/products/low-stock
export async function GET() {
  try {
    const lowStockProducts = await prisma.product.findMany({
      where: { stockQuantity: { lt: 5 } },
      include: { category: true },
      orderBy: { stockQuantity: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: lowStockProducts,
      count: lowStockProducts.length,
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch low stock products' },
      { status: 500 }
    )
  }
}
