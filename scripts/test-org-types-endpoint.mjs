// Test organization types settings endpoint
const testEndpoint = async () => {
  try {
    console.log('Testing /api/platform/settings/organization-types endpoint...\n');
    
    const response = await fetch('http://localhost:3000/api/platform/settings/organization-types', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Add your session cookie here if needed
      },
      credentials: 'include'
    });

    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('\nResponse:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  }
};

testEndpoint();
