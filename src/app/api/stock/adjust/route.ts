import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// PATCH /api/stock/adjust
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { productId, adjustment, reason } = body

    // Validation
    if (!productId || adjustment === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: productId, adjustment' },
        { status: 400 }
      )
    }

    if (typeof adjustment !== 'number' || !Number.isInteger(adjustment) || adjustment === 0) {
      return NextResponse.json(
        { success: false, error: 'adjustment must be a non-zero integer' },
        { status: 400 }
      )
    }

    // Fetch product
    const product = await prisma.product.findUnique({ where: { id: productId } })
    if (!product) {
      return NextResponse.json(
        { success: false, error: `Product with id ${productId} not found` },
        { status: 404 }
      )
    }

    const newStock = product.stockQuantity + adjustment

    // Prevent negative stock
    if (newStock < 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Insufficient stock. Current: ${product.stockQuantity}, Requested: ${adjustment}`,
          currentStock: product.stockQuantity,
        },
        { status: 422 }
      )
    }

    const transactionType = adjustment > 0 ? 'IN' : 'OUT'

    // Update stock and record transaction atomically
    const [updatedProduct, transaction] = await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { stockQuantity: newStock },
        include: { category: true },
      }),
      prisma.stockTransaction.create({
        data: {
          productId,
          type: transactionType,
          quantity: Math.abs(adjustment),
          reason: reason || null,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        product: updatedProduct,
        transaction,
        previousStock: product.stockQuantity,
        newStock,
        adjustment,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to adjust stock'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
