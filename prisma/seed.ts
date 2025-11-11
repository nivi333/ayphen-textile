import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { logger } from '../src/utils/logger';

const prisma = new PrismaClient();

async function main() {
  logger.info('Starting database seeding...');

  try {
    // Create sample users
    const hashedPassword = await bcrypt.hash('password123', 12);

    const user1 = await prisma.user.upsert({
      where: { email: 'admin@textile.com' },
      update: {},
      create: {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@textile.com',
        password: hashedPassword,
      },
    });

    const user2 = await prisma.user.upsert({
      where: { email: 'manager@textile.com' },
      update: {},
      create: {
        firstName: 'Manager',
        lastName: 'User',
        email: 'manager@textile.com',
        password: hashedPassword,
      },
    });

    // Create sample tenants
    const tenant1 = await prisma.tenant.upsert({
      where: { slug: 'textile-corp' },
      update: {},
      create: {
        name: 'Textile Corp',
        slug: 'textile-corp',
        industry: 'Textile Manufacturing',
        description: 'Leading textile manufacturing company',
        country: 'India',
      },
    });

    const tenant2 = await prisma.tenant.upsert({
      where: { slug: 'garment-industries' },
      update: {},
      create: {
        name: 'Garment Industries Ltd',
        slug: 'garment-industries',
        industry: 'Garment Manufacturing',
        description: 'Premium garment manufacturing and export',
        country: 'Bangladesh',
      },
    });

    // Create user-tenant relationships
    await prisma.userTenant.upsert({
      where: {
        userId_tenantId: {
          userId: user1.id,
          tenantId: tenant1.id,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        tenantId: tenant1.id,
        role: 'OWNER',
      },
    });

    await prisma.userTenant.upsert({
      where: {
        userId_tenantId: {
          userId: user2.id,
          tenantId: tenant1.id,
        },
      },
      update: {},
      create: {
        userId: user2.id,
        tenantId: tenant1.id,
        role: 'MANAGER',
      },
    });

    await prisma.userTenant.upsert({
      where: {
        userId_tenantId: {
          userId: user1.id,
          tenantId: tenant2.id,
        },
      },
      update: {},
      create: {
        userId: user1.id,
        tenantId: tenant2.id,
        role: 'ADMIN',
      },
    });

    logger.info('Database seeding completed successfully!');
    logger.info('Sample users created:');
    logger.info('- admin@textile.com (password: password123)');
    logger.info('- manager@textile.com (password: password123)');
    logger.info('Sample tenants created:');
    logger.info('- Textile Corp (textile-corp)');
    logger.info('- Garment Industries Ltd (garment-industries)');

  } catch (error) {
    logger.error('Error during seeding:', error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    logger.error('Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
