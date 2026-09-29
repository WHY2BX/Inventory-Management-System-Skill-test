import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

// GET /api/categories
export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    })
    return NextResponse.json({ success: true, data: categories })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name) {
      return NextResponse.json(
        { success: false, error: 'name is required' },
        { status: 400 }
      )
    }

    const existing = await prisma.category.findUnique({ where: { name } })
    if (existing) {
      return NextResponse.json(
        { success: false, error: `Category "${name}" already exists` },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: { name, description },
    })

    return NextResponse.json({ success: true, data: category }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create category'
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
