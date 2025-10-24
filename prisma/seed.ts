import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.hello.create({
    data: { message: 'Hello World desde la DB con Prisma!' },
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
