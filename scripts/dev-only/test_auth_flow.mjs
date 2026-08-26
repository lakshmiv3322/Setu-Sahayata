import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://pvwrwjggazjaktzzqipc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_GET_nUJFMaETzYhSaOWTfQ_aupp0BPK';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const timestamp = Date.now();
const testEmail = `citizen.test.${timestamp}@gmail.com`;
const testPassword = `Pass_${timestamp}!`;
const testName = 'Citizens Test User';

async function runTestFlow() {
  console.log('=== STEP 1: Citizen Sign-Up via Supabase Auth ===');
  console.log(`Registering user: ${testEmail}`);
  
  const { data: authData, error: authErr } = await supabase.auth.signUp({
    email: testEmail,
    password: testPassword,
    options: {
      data: { full_name: testName }
    }
  });

  if (authErr) {
    console.error('Sign-up failed:', authErr);
    process.exit(1);
  }

  console.log('Sign-up successful!');
  console.log('User ID:', authData.user?.id);
  console.log('Session access token present:', !!authData.session?.access_token);

  const session = authData.session;
  const user = authData.user;

  console.log('\n=== STEP 2: Creating User Profile ===');
  const { data: profileData, error: profileErr } = await supabase.from('profiles').insert({
    user_id: user.id,
    name: testName,
    age: 29,
    gender: 'Female',
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    occupation: 'Street Vendor',
    income: 180000,
    category: 'OBC',
    family_size: 4,
    has_aadhaar: true,
    has_ration_card: true,
    has_udyam: true,
    consent_given: true,
    consent_timestamp: new Date().toISOString()
  }).select('*').single();

  if (profileErr) {
    console.error('Profile creation error:', profileErr);
  } else {
    console.log('Profile created in Supabase table:', profileData);
  }

  console.log('\n=== STEP 3: Testing RLS Protection on Non-Admin User ===');
  console.log('Attempting to insert a scheme directly as non-admin citizen user...');
  const { error: rlsInsertErr } = await supabase.from('schemes').insert({
    id: 'unauthorized-scheme-test',
    name: 'Unauthorized Scheme',
    name_hindi: 'अनधिकृत योजना',
    active: true
  });

  console.log('Non-Admin Insert Result (Expecting RLS Error 42501):', rlsInsertErr);

  console.log('\n=== STEP 4: Upgrading User to Admin via Profile Update ===');
  // Elevate user to admin in profile table to ingest schemes
  const { error: adminUpdateErr } = await supabase.from('profiles')
    .update({ is_admin: true })
    .eq('user_id', user.id);

  if (adminUpdateErr) {
    console.error('Admin elevation error:', adminUpdateErr);
  } else {
    console.log('User successfully upgraded to Admin on profiles table.');
  }

  console.log('\n=== STEP 5: Ingesting Schemes as Authenticated Admin ===');
  const mockSchemes = [
    { id: 'pm-svanidhi', name: 'PM SVANidhi', name_hindi: 'पीएम स्वनिधि', ministry: 'Ministry of Housing & Urban Affairs', ministry_hindi: 'आवास और शहरी मामलों के मंत्रालय', benefit: 'Collateral-free working capital loan up to ₹10,000', benefit_hindi: 'बिना गारंटी कार्यशील पूंजी ऋण ₹10,000 तक', benefit_amount: '₹10,000', time_to_apply: '5 minutes', time_to_apply_hindi: '5 मिनट', description: 'A micro-credit scheme for street vendors to restart their businesses after the pandemic.', description_hindi: 'सड़क विक्रेताओं के लिए एक सूक्ष्म-क्रेडिट योजना।', category: 'Finance', icon: 'Store', eligibility_tags: ['Street Vendor', 'Udyam Certificate', 'Urban Area'], eligibility_rules: [{ field: 'income', op: 'lte', value: 200000, label: 'Annual income ≤ ₹2,00,000', labelHindi: 'वार्षिक आय ≤ ₹2,00,000' }, { field: 'has_aadhaar', op: 'is_true', value: true, label: 'Has Aadhaar card', labelHindi: 'आधार कार्ड है' }], active: true },
    { id: 'mudra-yojana', name: 'Pradhan Mantri Mudra Yojana', name_hindi: 'प्रधानमंत्री मुद्रा योजना', ministry: 'Ministry of Finance', ministry_hindi: 'वित्त मंत्रालय', benefit: 'Business loan up to ₹10,00,000 without collateral', benefit_hindi: 'बिना गारंटी व्यापार ऋण ₹10,00,000 तक', benefit_amount: '₹10,00,000', time_to_apply: '15 minutes', time_to_apply_hindi: '15 मिनट', description: 'Provides loans to small and micro enterprises.', description_hindi: 'छोटे और सूक्ष्म उद्यमों को तीन श्रेणियों में ऋण प्रदान करता है।', category: 'Finance', icon: 'Landmark', eligibility_tags: ['Small Business', 'Income < ₹8L', 'Non-farm'], eligibility_rules: [{ field: 'income', op: 'lte', value: 800000, label: 'Annual income ≤ ₹8,00,000', labelHindi: 'वार्षिक आय ≤ ₹8,00,000' }], active: true },
    { id: 'ayushman-bharat', name: 'Ayushman Bharat (PM-JAY)', name_hindi: 'आयुष्मान भारत (पीएम-जय)', ministry: 'Ministry of Health & Family Welfare', ministry_hindi: 'स्वास्थ्य और परिवार कल्याण मंत्रालय', benefit: 'Health insurance cover of ₹5,00,000 per family per year', benefit_hindi: 'प्रति परिवार प्रति वर्ष ₹5,00,000 का स्वास्थ्य बीमा', benefit_amount: '₹5,00,000', time_to_apply: '10 minutes', time_to_apply_hindi: '10 मिनट', description: 'Healthcare program providing a health cover of ₹5 lakh per family per year.', description_hindi: 'स्वास्थ्य देखभाल कार्यक्रम।', category: 'Health', icon: 'HeartPulse', eligibility_tags: ['Low Income', 'Ration Card', 'Family Coverage'], eligibility_rules: [{ field: 'income', op: 'lte', value: 500000, label: 'Annual income ≤ ₹5,00,000', labelHindi: 'वार्षिक आय ≤ ₹5,00,000' }], active: true },
    { id: 'pmay', name: 'Pradhan Mantri Awas Yojana', name_hindi: 'प्रधानमंत्री आवास योजना', ministry: 'Ministry of Housing & Urban Affairs', ministry_hindi: 'आवास और शहरी मामलों के मंत्रालय', benefit: 'Interest subsidy on home loans up to ₹2.67 lakh', benefit_hindi: 'गृह ऋण पर ₹2.67 लाख तक ब्याज सब्सिडी', benefit_amount: '₹2.67 L', time_to_apply: '20 minutes', time_to_apply_hindi: '20 मिनट', description: 'Interest subsidies on home loans.', description_hindi: 'गृह ऋण पर ब्याज सब्सिडी।', category: 'Housing', icon: 'Home', eligibility_tags: ['No pucca house', 'Income < ₹6L', 'Family'], eligibility_rules: [{ field: 'income', op: 'lte', value: 600000, label: 'Annual income ≤ ₹6,00,000', labelHindi: 'वार्षिक आय ≤ ₹6,00,000' }], active: true },
    { id: 'sukanya-samriddhi', name: 'Sukanya Samriddhi Yojana', name_hindi: 'सुकन्या समृद्धि योजना', ministry: 'Ministry of Finance', ministry_hindi: 'वित्त मंत्रालय', benefit: 'Savings account with 8.2% interest for girl child', benefit_hindi: 'बालिका के लिए 8.2% ब्याज दर का बचत खाता', benefit_amount: '8.2% p.a.', time_to_apply: '8 minutes', time_to_apply_hindi: '8 मिनट', description: 'Small savings scheme for girl child.', description_hindi: 'बालिका के लिए छोटी बचत योजना।', category: 'Women', icon: 'GraduationCap', eligibility_tags: ['Girl Child', 'Age < 10', 'Savings'], eligibility_rules: [{ field: 'gender', op: 'eq', value: 'Female', label: 'Applicant is female', labelHindi: 'आवेदक महिला है' }], active: true },
    { id: 'anna-yojana', name: 'Antyodaya Anna Yojana', name_hindi: 'अंत्योदय अन्न योजना', ministry: 'Ministry of Consumer Affairs', ministry_hindi: 'उपभोक्ता मामलों के मंत्रालय', benefit: '35 kg food grains at subsidized rates per month', benefit_hindi: 'प्रति माह 35 किग्रा अनाज सब्सिडी दर पर', benefit_amount: '35 kg/mo', time_to_apply: '7 minutes', time_to_apply_hindi: '7 मिनट', description: '35 kg of food grains at highly subsidized prices.', description_hindi: 'प्रति परिवार प्रति माह 35 किग्रा अनाज।', category: 'Food', icon: 'Wheat', eligibility_tags: ['BPL Card', 'Ration Card', 'Lowest Income'], eligibility_rules: [{ field: 'income', op: 'lte', value: 100000, label: 'Annual income ≤ ₹1,00,000', labelHindi: 'वार्षिक आय ≤ ₹1,00,000' }], active: true },
    { id: 'pm-kisan', name: 'PM Kisan Samman Nidhi', name_hindi: 'पीएम किसान सम्मान निधि', ministry: 'Ministry of Agriculture & Farmers Welfare', ministry_hindi: 'कृषि एवं किसान कल्याण मंत्रालय', benefit: '₹6,000 per year direct income support', benefit_hindi: 'प्रति वर्ष ₹6,000 सीधी आय सहायता', benefit_amount: '₹6,000/yr', time_to_apply: '10 minutes', time_to_apply_hindi: '10 मिनट', description: 'Direct income support of ₹6,000 per annum.', description_hindi: 'किसान परिवारों के लिए आय सहायता।', category: 'Finance', icon: 'Wheat', eligibility_tags: ['Farmer', 'Aadhaar Linked', 'Landholder'], eligibility_rules: [{ field: 'has_aadhaar', op: 'is_true', value: true, label: 'Has Aadhaar card', labelHindi: 'आधार कार्ड है' }], active: true },
    { id: 'pmkvy', name: 'Pradhan Mantri Kaushal Vikas Yojana', name_hindi: 'प्रधानमंत्री कौशल विकास योजना', ministry: 'Ministry of Skill Development & Entrepreneurship', ministry_hindi: 'कौशल विकास और उद्यमिता मंत्रालय', benefit: 'Free industry-relevant skill training', benefit_hindi: 'निःशुल्क कौशल प्रशिक्षण', benefit_amount: 'Free Training', time_to_apply: '12 minutes', time_to_apply_hindi: '12 मिनट', description: 'Skill certification scheme.', description_hindi: 'कौशल प्रशिक्षण योजना।', category: 'Education', icon: 'GraduationCap', eligibility_tags: ['Youth', 'Skill Training', 'Free Certification'], eligibility_rules: [{ field: 'has_aadhaar', op: 'is_true', value: true, label: 'Has Aadhaar card', labelHindi: 'आधार कार्ड है' }], active: true },
    { id: 'ujjwala-yojana', name: 'Pradhan Mantri Ujjwala Yojana', name_hindi: 'प्रधानमंत्री उज्जवला योजना', ministry: 'Ministry of Petroleum & Natural Gas', ministry_hindi: 'पेट्रोलियम एवं प्राकृतिक गैस मंत्रालय', benefit: 'Deposit-free LPG connection & financial assistance', benefit_hindi: 'डिपॉजिट-फ्री एलपीजी कनेक्शन', benefit_amount: 'Free LPG Connection', time_to_apply: '15 minutes', time_to_apply_hindi: '15 मिनट', description: 'Deposit-free LPG connections to BPL women.', description_hindi: 'एलपीजी कनेक्शन योजना।', category: 'Women', icon: 'Home', eligibility_tags: ['Women', 'BPL Household', 'Aadhaar Required'], eligibility_rules: [{ field: 'gender', op: 'eq', value: 'Female', label: 'Applicant is female', labelHindi: 'आवेदक महिला है' }], active: true },
    { id: 'pmjjby', name: 'Pradhan Mantri Jeevan Jyoti Bima Yojana', name_hindi: 'प्रधानमंत्री जीवन ज्योति बीमा योजना', ministry: 'Ministry of Finance', ministry_hindi: 'वित्त मंत्रालय', benefit: 'Life insurance cover of ₹2,00,000', benefit_hindi: '₹2,00,000 का जीवन बीमा', benefit_amount: '₹2,00,000', time_to_apply: '5 minutes', time_to_apply_hindi: '5 मिनट', description: 'Life insurance scheme.', description_hindi: 'जीवन बीमा योजना।', category: 'Finance', icon: 'Landmark', eligibility_tags: ['Age 18-50', 'Bank Account', 'Low Premium'], eligibility_rules: [{ field: 'has_aadhaar', op: 'is_true', value: true, label: 'Has Aadhaar card', labelHindi: 'आधार कार्ड है' }], active: true },
    { id: 'pmsby', name: 'Pradhan Mantri Suraksha Bima Yojana', name_hindi: 'प्रधानमंत्री सुरक्षा बीमा योजना', ministry: 'Ministry of Finance', ministry_hindi: 'वित्त मंत्रालय', benefit: 'Accidental death & disability cover up to ₹2,00,000', benefit_hindi: '₹2,00,000 तक दुर्घटना बीमा', benefit_amount: '₹2,00,000', time_to_apply: '5 minutes', time_to_apply_hindi: '5 मिनट', description: 'Accident insurance scheme.', description_hindi: 'दुर्घटना बीमा योजना।', category: 'Health', icon: 'HeartPulse', eligibility_tags: ['Age 18-70', 'Bank Account', 'Micro Insurance'], eligibility_rules: [{ field: 'has_aadhaar', op: 'is_true', value: true, label: 'Has Aadhaar card', labelHindi: 'आधार कार्ड है' }], active: true },
    { id: 'apy', name: 'Atal Pension Yojana', name_hindi: 'अटल पेंशन योजना', ministry: 'Ministry of Finance', ministry_hindi: 'वित्त मंत्रालय', benefit: 'Monthly pension of ₹1,000 to ₹5,000 after age 60', benefit_hindi: '₹1,000 से ₹5,000 की मासिक पेंशन', benefit_amount: 'Up to ₹5,00,000/mo', time_to_apply: '10 minutes', time_to_apply_hindi: '10 मिनट', description: 'Pension scheme for unorganized workers.', description_hindi: 'पेंशन योजना।', category: 'Finance', icon: 'Landmark', eligibility_tags: ['Unorganized Worker', 'Age 18-40', 'Pension'], eligibility_rules: [{ field: 'has_aadhaar', op: 'is_true', value: true, label: 'Has Aadhaar card', labelHindi: 'आधार कार्ड है' }], active: true },
    { id: 'nsp-scholarship', name: 'National Scholarship Portal Scheme', name_hindi: 'राष्ट्रीय छात्रवृत्ति पोर्टल योजना', ministry: 'Ministry of Education', ministry_hindi: 'शिक्षा मंत्रालय', benefit: 'Financial assistance for pre-matric & post-matric students', benefit_hindi: 'छात्रों के लिए वित्तीय सहायता', benefit_amount: 'Up to ₹20,000/yr', time_to_apply: '15 minutes', time_to_apply_hindi: '15 मिनट', description: 'Scholarship portal.', description_hindi: 'छात्रवृत्ति पोर्टल।', category: 'Education', icon: 'GraduationCap', eligibility_tags: ['Students', 'SC/ST/OBC', 'Income < ₹2.5L'], eligibility_rules: [{ field: 'income', op: 'lte', value: 250000, label: 'Annual family income ≤ ₹2,50,000', labelHindi: 'वार्षिक पारिवारिक आय ≤ ₹2,50,000' }], active: true },
    { id: 'pm-poshan', name: 'PM POSHAN Scheme', name_hindi: 'पीएम पोषण योजना', ministry: 'Ministry of Education', ministry_hindi: 'शिक्षा मंत्रालय', benefit: 'Free mid-day meals for school children', benefit_hindi: 'स्कूली बच्चों के लिए मुफ्त भोजन', benefit_amount: 'Free Meals', time_to_apply: '5 minutes', time_to_apply_hindi: '5 मिनट', description: 'Hot cooked meals to school children.', description_hindi: 'स्कूली बच्चों के लिए भोजन।', category: 'Food', icon: 'Wheat', eligibility_tags: ['School Children', 'Nutrition', 'Free Meal'], eligibility_rules: [{ field: 'has_ration_card', op: 'is_true', value: true, label: 'Has ration card', labelHindi: 'राशन कार्ड है' }], active: true },
    { id: 'sbm-gramin', name: 'Swachh Bharat Mission Gramin', name_hindi: 'स्वच्छ भारत मिशन ग्रामीण', ministry: 'Ministry of Jal Shakti', ministry_hindi: 'जल शक्ति मंत्रालय', benefit: 'Incentive of ₹12,000 for IHHL', benefit_hindi: 'शौचालय निर्माण के लिए ₹12,000', benefit_amount: '₹12,00,000', time_to_apply: '10 minutes', time_to_apply_hindi: '10 मिनट', description: 'Financial support for constructing toilets.', description_hindi: 'शौचालय निर्माण सहायता।', category: 'Housing', icon: 'Home', eligibility_tags: ['Rural Household', 'No Toilet', 'BPL/APL'], eligibility_rules: [{ field: 'has_ration_card', op: 'is_true', value: true, label: 'Has ration card', labelHindi: 'राशन कार्ड है' }], active: true },
    { id: 'stand-up-india', name: 'Stand-Up India Scheme', name_hindi: 'स्टैंड-अप इंडिया योजना', ministry: 'Ministry of Finance', ministry_hindi: 'वित्त मंत्रालय', benefit: 'Bank loan between ₹10 lakh to ₹1 crore for SC/ST/Women', benefit_hindi: 'SC/ST और महिलाओं के लिए ऋण', benefit_amount: 'Up to ₹1 Crore', time_to_apply: '20 minutes', time_to_apply_hindi: '20 मिनट', description: 'Bank loans for greenfield enterprises.', description_hindi: 'बैंक ऋण योजना।', category: 'Women', icon: 'Landmark', eligibility_tags: ['SC/ST', 'Women Entrepreneur', 'Greenfield Enterprise'], eligibility_rules: [{ field: 'gender', op: 'eq', value: 'Female', label: 'Applicant is female', labelHindi: 'आवेदक महिला है' }], active: true }
  ];

  const { data: upsertData, error: upsertErr } = await supabase.from('schemes').upsert(mockSchemes, { onConflict: 'id' }).select('id');
  if (upsertErr) {
    console.error('Admin upsert failed:', upsertErr);
  } else {
    console.log(`Admin scheme ingestion successful! Synced ${upsertData?.length} schemes.`);
  }

  console.log('\n=== STEP 6: SELECT count(*) FROM schemes Verification ===');
  const { data: finalSchemes, error: countErr } = await supabase.from('schemes').select('id, name, eligibility_rules');
  if (countErr) {
    console.error('Query count error:', countErr);
  } else {
    console.log(`SELECT count(*) FROM schemes result: ${finalSchemes.length}`);
    console.log('Database Scheme Records Preview:');
    finalSchemes.slice(0, 3).forEach((s) => console.log(` - [${s.id}] ${s.name} | eligibility_rules:`, JSON.stringify(s.eligibility_rules)));
  }
}

runTestFlow();
