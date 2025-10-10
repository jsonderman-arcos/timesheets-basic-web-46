import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting demo data refresh...');

    // Get the most recent time entry date
    const { data: latestEntry, error: latestError } = await supabase
      .from('time_entries')
      .select('date')
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (latestError) {
      console.error('Error fetching latest entry:', latestError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch latest entry' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!latestEntry) {
      console.log('No time entries found');
      return new Response(
        JSON.stringify({ message: 'No time entries to update' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Calculate days to shift (to make the most recent entry from this week)
    const latestDate = new Date(latestEntry.date);
    const today = new Date();
    const daysToShift = Math.floor((today.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24));

    console.log(`Latest entry date: ${latestDate.toISOString()}`);
    console.log(`Days to shift forward: ${daysToShift}`);

    if (daysToShift <= 0) {
      console.log('Data is already current');
      return new Response(
        JSON.stringify({ message: 'Data is already current', daysToShift: 0 }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update all time entries by shifting dates forward
    const { error: updateError } = await supabase.rpc('shift_time_entry_dates', {
      days_to_add: daysToShift
    });

    if (updateError) {
      console.error('Error updating time entries:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update time entries', details: updateError }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Successfully shifted ${daysToShift} days forward`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Time entries updated successfully`,
        daysShifted: daysToShift,
        newLatestDate: new Date(latestDate.getTime() + daysToShift * 24 * 60 * 60 * 1000).toISOString()
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
