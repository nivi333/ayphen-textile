#!/usr/bin/env node
/**
 * Cleanup script to fix legacy companies without default locations
 * This creates a default headquarters location for companies that are missing them
 */

const { PrismaClient } = require('@prisma/client');
const { v4: uuidv4 } = require('uuid');
const prisma = new PrismaClient();

async function fixLegacyCompanies() {
  console.log('🔧 Fixing legacy companies without valid default locations...\n');

  try {
    // Find all companies - then check which ones are missing a VALID default location
    // Valid = is_default=true AND is_headquarters=true AND is_active=true
    const companies = await prisma.companies.findMany({
      include: {
        company_locations: {
          where: {
            is_default: true,
            is_headquarters: true,
            is_active: true,
          },
        },
      },
    });

    const companiesWithoutDefault = companies.filter(c => c.company_locations.length === 0);

    if (companiesWithoutDefault.length === 0) {
      console.log('✅ All companies have default locations. Nothing to fix.');
      return;
    }

    console.log(`Found ${companiesWithoutDefault.length} companies without default locations:\n`);

    for (const company of companiesWithoutDefault) {
      console.log(`  📍 Fixing: ${company.name} (${company.id})`);

      // Create a default headquarters location
      const locationId = uuidv4();
      const now = new Date();

      await prisma.$transaction(async tx => {
        // Create the headquarters location
        await tx.company_locations.create({
          data: {
            id: locationId,
            location_id: `LOC-${Date.now()}`,
            company_id: company.id,
            tenant_id: company.tenant_id,
            name: 'Headquarters',
            location_type: 'FACTORY',
            address_line_1: company.address_line_1 || company.address1 || '123 Main Street',
            city: company.city || 'Mumbai',
            state: company.state || 'Maharashtra',
            country: company.country || 'India',
            pincode: company.pincode || '400001',
            is_default: true,
            is_headquarters: true,
            is_active: true,
            created_at: now,
            updated_at: now,
          },
        });

        // Update the company to reference this default location
        await tx.companies.update({
          where: { id: company.id },
          data: {
            default_location: locationId,
            updated_at: now,
          },
        });
      });

      console.log(`     ✅ Created default location for ${company.name}`);
    }

    console.log('\n✨ All legacy companies fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing legacy companies:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

fixLegacyCompanies();
