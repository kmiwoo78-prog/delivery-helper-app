
const { createClient } = require('@supabase/supabase-js');

const url = "https://yzgsyyolhsxvavcmussi.supabase.co";
const key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6Z3N5eW9saHN4dmF2Y211c3NpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzY1MjgsImV4cCI6MjA4NTM1MjUyOH0.g6DiBPEfnO5SIsC9iBAzgSurNR3pPF403-JiRUfIS88";

const supabase = createClient(url, key);

async function test() {
    console.log("Testing connection...");
    
    // Test 1: delivery_sync table
    const { data: syncData, error: syncError } = await supabase
        .from('delivery_sync')
        .select('*')
        .limit(1);
        
    console.log("delivery_sync result:", syncData);
    if (syncError) console.log("delivery_sync error:", syncError);

    // Test 2: deliveries table (if exists)
    const { data: delData, error: delError } = await supabase
        .from('deliveries')
        .select('*')
        .limit(1);

    console.log("deliveries result:", delData);
    if (delError) console.log("deliveries error:", delError);
}

test();
