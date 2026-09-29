import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/stock/transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')
    const type = searchParams.get('type') // IN or OUT
    const limit = parseInt(searchParams.get('limit') || '50')
    const page = parseInt(searchParams.get('page') || '1')
    const skip = (page - 1) * limit

    const where = {
      ...(productId ? { productId: parseInt(productId) } : {}),
      ...(type ? { type } : {}),
    }

    const [transactions, total] = await prisma.$transaction([
      prisma.stockTransaction.findMany({
        where,
        include: { product: { include: { category: true } } },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip,
      }),
      prisma.stockTransaction.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: transactions,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
