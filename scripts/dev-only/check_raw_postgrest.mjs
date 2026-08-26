const SUPABASE_URL = 'https://pvwrwjggazjaktzzqipc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GET_nUJFMaETzYhSaOWTfQ_aupp0BPK';

async function checkOpenApi() {
  console.log('Fetching PostgREST OpenAPI schema from Supabase...');
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
