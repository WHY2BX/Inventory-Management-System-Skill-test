import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import path from 'path'

const dbPath = path.resolve(process.cwd(), 'prisma/dev.db')
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` })
const prisma = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0])

async function main() {
  console.log('🌱 Seeding database...')

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: 'IT Equipment' },
      update: {},
      create: { name: 'IT Equipment', description: 'อุปกรณ์คอมพิวเตอร์และเทคโนโลยี' },
    }),
    prisma.category.upsert({
      where: { name: 'Office Supply' },
      update: {},
      create: { name: 'Office Supply', description: 'อุปกรณ์สำนักงาน' },
    }),
    prisma.category.upsert({
      where: { name: 'Furniture' },
      update: {},
      create: { name: 'Furniture', description: 'เฟอร์นิเจอร์และของตกแต่ง' },
    }),
    prisma.category.upsert({
      where: { name: 'Stationery' },
      update: {},
      create: { name: 'Stationery', description: 'เครื่องเขียนและอุปกรณ์การเรียน' },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  const products = [
    { name: 'Notebook Dell Inspiron 15', sku: 'DELL-INS-15-001', costPrice: 18500, stockQuantity: 12, categoryId: categories[0].id },
    { name: 'Mouse Logitech M330', sku: 'LOG-M330-001', costPrice: 650, stockQuantity: 3, categoryId: categories[0].id },
    { name: 'Keyboard Mechanical AKKO', sku: 'AKKO-MK-001', costPrice: 1200, stockQuantity: 2, categoryId: categories[0].id },
    { name: 'Monitor LG 27 Inch', sku: 'LG-27-4K-001', costPrice: 7500, stockQuantity: 8, categoryId: categories[0].id },
    { name: 'กระดาษ A4 Double A', sku: 'DBL-A4-500', costPrice: 120, stockQuantity: 45, categoryId: categories[1].id },
    { name: 'ปากกาลูกลื่น Pilot', sku: 'PLT-PEN-BLK', costPrice: 15, stockQuantity: 4, categoryId: categories[3].id },
    { name: 'โต๊ะทำงาน ขนาด 120cm', sku: 'DESK-120-WH', costPrice: 3500, stockQuantity: 0, categoryId: categories[2].id },
    { name: 'เก้าอี้สำนักงาน Ergotrend', sku: 'CHAIR-ERG-01', costPrice: 4200, stockQuantity: 1, categoryId: categories[2].id },
    { name: 'USB Hub 7 Ports', sku: 'USB-HUB-7P', costPrice: 450, stockQuantity: 25, categoryId: categories[0].id },
    { name: 'กระดาษโน้ต Post-it', sku: 'POST-IT-YLW', costPrice: 85, stockQuantity: 30, categoryId: categories[3].id },
  ]

  for (const productData of products) {
    const existing = await prisma.product.findUnique({ where: { sku: productData.sku } })
    if (!existing) {
      const product = await prisma.product.create({ data: productData })
      if (productData.stockQuantity > 0) {
        await prisma.stockTransaction.create({
          data: {
            productId: product.id,
            type: 'IN',
            quantity: productData.stockQuantity,
            reason: 'Initial stock (seed data)',
          },
        })
      }
    }
  }

  console.log(`✅ Created ${products.length} products`)
  console.log('🎉 Seeding complete!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
