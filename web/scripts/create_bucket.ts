import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// use service role key
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.storage.createBucket('documents', {
    public: false, // Private bucket as requested
    fileSizeLimit: 10485760, // 10MB
  });

  if (error) {
    console.error('Error creating bucket (it might already exist):', error.message);
  } else {
    console.log('Bucket created successfully:', data);
  }
}

main();
