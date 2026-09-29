import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const search = searchParams.get('search')

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId: parseInt(categoryId) } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { sku: { contains: search } },
              ],
            }
          : {}),
      },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: products })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

// POST /api/products - Create a new product
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, sku, costPrice, stockQuantity, categoryId } = body

    // Validation
    if (!name || !sku || costPrice === undefined || !categoryId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: name, sku, costPrice, categoryId' },
        { status: 400 }
      )
    }

    if (costPrice < 0) {
      return NextResponse.json(
        { success: false, error: 'costPrice must be non-negative' },
        { status: 400 }
      )
    }

    if (stockQuantity !== undefined && stockQuantity < 0) {
      return NextResponse.json(
        { success: false, error: 'stockQuantity must be non-negative' },
        { status: 400 }
      )
    }

    // Check SKU uniqueness
    const existing = await prisma.product.findUnique({ where: { sku } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: `SKU "${sku}" already exists` },
        { status: 409 }
      )
    }

    // Check category exists
    const category = await prisma.category.findUnique({ where: { id: categoryId } })
    if (!category) {
      return NextResponse.json(
        { success: false, error: `Category with id ${categoryId} not found` },
        { status: 404 }
      )
    }

    const initialStock = stockQuantity ?? 0

    // Create product and initial stock transaction in a transaction
    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: { name, sku, costPrice, stockQuantity: initialStock, categoryId },
        include: { category: true },
      })

      // Record initial stock if > 0
      if (initialStock > 0) {
        await tx.stockTransaction.create({
          data: {
            productId: newProduct.id,
            type: 'IN',
            quantity: initialStock,
            reason: 'Initial stock on product creation',
          },
        })
      }

      return newProduct
    })

    return NextResponse.json({ success: true, data: product }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create product'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
