// server/api/platforms/seed.post.ts
import { defineEventHandler, createError } from 'h3';
import Platform from '~/server/models/Platform';
import { connectToDatabase } from '~/server/utils/db';

export default defineEventHandler(async (event) => {
  try {
    await connectToDatabase();
    
    // Check if platforms already exist
    const existingPlatforms = await Platform.countDocuments();
    if (existingPlatforms > 0) {
      return {
        success: true,
        message: 'Platforms already exist',
        count: existingPlatforms
      };
    }

    // Create sample platforms
    const samplePlatforms = [
      {
        name: 'EaseMyCargo Logistics',
        slug: 'easemycargo-logistics',
        description: 'Complete logistics and supply chain management platform',
        status: 'active'
      },
      {
        name: 'Global Freight Network',
        slug: 'global-freight-network',
        description: 'International freight forwarding and shipping solutions',
        status: 'active'
      },
      {
        name: 'Maritime Trade Hub',
        slug: 'maritime-trade-hub',
        description: 'Port operations and maritime logistics platform',
        status: 'active'
      },
      {
        name: 'Supply Chain Pro',
        slug: 'supply-chain-pro',
        description: 'Enterprise supply chain management and optimization',
        status: 'active'
      }
    ];

    const createdPlatforms = await Platform.insertMany(samplePlatforms);

    return {
      success: true,
      message: 'Sample platforms created successfully',
      platforms: createdPlatforms.map(p => ({
        id: p._id,
        name: p.name,
        slug: p.slug,
        description: p.description
      }))
    };

  } catch (err: any) {
    console.error('[API] Platform seed error:', err);
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to seed platforms',
    });
  }
});
