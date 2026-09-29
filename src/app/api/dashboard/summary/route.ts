import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

// GET /api/dashboard/summary
export async function GET() {
  try {
    const [totalProducts, totalCategories, lowStockCount, recentTransactions, totalValue] =
      await prisma.$transaction([
        prisma.product.count(),
        prisma.category.count(),
        prisma.product.count({ where: { stockQuantity: { lt: 5 } } }),
        prisma.stockTransaction.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { product: true },
        }),
        prisma.product.findMany({ select: { costPrice: true, stockQuantity: true } }),
      ])

    const inventoryValue = totalValue.reduce(
      (sum, p) => sum + p.costPrice * p.stockQuantity,
      0
    )

    return NextResponse.json({
      success: true,
      data: {
        totalProducts,
        totalCategories,
        lowStockCount,
        inventoryValue,
        recentTransactions,
      },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard summary' },
      { status: 500 }
    )
  }
}
