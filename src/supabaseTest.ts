import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();
// Read from environment variables, or paste directly (for a quick test)
const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;
console.log(supabaseUrl, supabaseAnonKey);


const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
    // Insert a test message
    const { data: insertData, error: insertError } = await supabase
        .from('test_table')
        .insert([{ message: 'Hello from Supabase!' }])
        .select();

    if (insertError) {
        console.error('Insert error:', insertError);
        return;
    }
    console.log('Insert success:', insertData);

    // Read all messages
    const { data: selectData, error: selectError } = await supabase
        .from('test_table')
        .select('*');

    if (selectError) {
        console.error('Select error:', selectError);
        return;
    }
    console.log('Select success:', selectData);
}

testSupabase();
