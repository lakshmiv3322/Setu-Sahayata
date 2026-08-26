const SUPABASE_URL = 'https://gzhcmypgymyxevzhszlz.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_z8reSTx6hAYl6fyuu4FVaA_vEReJAL7';

async function checkOpenApi() {
  console.log('Fetching PostgREST OpenAPI schema from Supabase (new URL)...');
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/`, {
      headers: {
        'apikey': SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      },
    });
    const data = await res.json();
    if (data.definitions) {
      console.log('Exposed tables in PostgREST schema cache:');
      console.log(Object.keys(data.definitions));
    } else {
      console.log('No definitions found in OpenAPI spec:', data);
    }
  } catch (err) {
    console.error('Error fetching OpenAPI spec:', err);
  }
}

checkOpenApi();
