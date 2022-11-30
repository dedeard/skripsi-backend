import { PrismaClient } from '@prisma/client'
import config from '../src/config/config'
import passwordService from '../src/services/password.service'

const prisma = new PrismaClient()

async function main() {
  const superAdminRole = await prisma.role.upsert({
    where: { name: 'Super Admin' },
    update: { name: 'Super Admin', permissions: JSON.stringify([]) },
    create: { name: 'Super Admin', permissions: JSON.stringify([]) },
  })

  const dataSeperAdmin = {
    name: config.superAdmin.name,
    email: config.superAdmin.email,
    password: await passwordService.hash(config.superAdmin.password),
    roleId: superAdminRole.id,
  }
  await prisma.user.upsert({
    where: { email: config.superAdmin.email },
    update: dataSeperAdmin,
    create: dataSeperAdmin,
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
