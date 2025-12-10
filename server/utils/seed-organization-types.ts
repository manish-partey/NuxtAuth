// server/utils/seed-organization-types.ts
import OrganizationType from '../models/OrganizationType';

export async function seedOrganizationTypes() {
  const types = [
    // Healthcare
    { 
      code: 'hospital', 
      name: 'Hospital', 
      category: 'healthcare', 
      icon: 'hospital', 
      description: 'Medical facility providing inpatient and outpatient care',
      displayOrder: 1,
      scope: 'global',
      status: 'active',
    },
    { 
      code: 'clinic', 
      name: 'Clinic', 
      category: 'healthcare', 
      icon: 'clinic-medical', 
      description: 'Outpatient healthcare facility',
      displayOrder: 2,
      scope: 'global',
      status: 'active',
    },
    { 
      code: 'pharmacy', 
      name: 'Pharmacy', 
      category: 'healthcare', 
      icon: 'pills', 
      description: 'Retail pharmacy and dispensary',
      displayOrder: 3,
      scope: 'global',
      status: 'active',
    },
    { 
      code: 'diagnostic_center', 
      name: 'Diagnostic Center', 
      category: 'healthcare', 
      icon: 'microscope',
      description: 'Medical testing and diagnostic facility',
      displayOrder: 4,
      scope: 'global',
      status: 'active',
    },
    
    // Hospitality
    { 
      code: 'hotel', 
      name: 'Hotel', 
      category: 'hospitality', 
      icon: 'hotel',
      description: 'Accommodation facility with rooms for guests',
      displayOrder: 5,
      scope: 'global',
      status: 'active',
    },
    { 
      code: 'resort', 
      name: 'Resort', 
      category: 'hospitality', 
      icon: 'umbrella-beach',
      description: 'Vacation destination with amenities',
      displayOrder: 6,
      scope: 'global',
      status: 'active',
    },
    { 
      code: 'restaurant', 
      name: 'Restaurant', 
      category: 'hospitality', 
      icon: 'utensils',
      description: 'Food service establishment',
      displayOrder: 7,
      scope: 'global',
      status: 'active',
    },
    { 
      code: 'cafe', 
      name: 'Cafe', 
      category: 'hospitality', 
      icon: 'coffee',
      description: 'Coffee shop and light refreshments',
      displayOrder: 8,
      scope: 'global',
      status: 'active',
    },
    
    // Education
    { 
      code: 'university', 
      name: 'University', 
      category: 'education', 
      icon: 'graduation-cap',
      description: 'Higher education institution',
      displayOrder: 9,
      scope: 'global',
      status: 'active',
    },
    { 
      code: 'college', 
      name: 'College', 
      category: 'education', 
      icon: 'school',
      description: 'Post-secondary educational institution',
      displayOrder: 10,
      scope: 'global',
      status: 'active',
    },
    { 
      code: 'school', 
      name: 'School', 
      category: 'education', 
      icon: 'book',
      description: 'Primary or secondary education facility',
      displayOrder: 11,
      scope: 'global',
      status: 'active',
    },
  ];

  let seededCount = 0;
  
  for (const type of types) {
    const existing = await OrganizationType.findOne({ 
      code: type.code,
      scope: 'global'
    });
    
    if (!existing) {
      await OrganizationType.create({
        ...type,
        createdBy: null, // System-created, will be updated if needed
        active: true,
      });
      seededCount++;
    }
  }
  
  console.log(`✅ Seeded ${seededCount} organization types (${types.length - seededCount} already existed)`);
  return seededCount;
}
