import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('Reverse geocode request received')
    const { longitude, latitude } = await req.json()
    
    console.log(`Reverse geocoding coordinates: ${latitude}, ${longitude}`)
    
    if (!longitude || !latitude) {
      console.error('Missing coordinates')
      return new Response(
        JSON.stringify({ error: 'Longitude and latitude are required' }),
        { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    const token = Deno.env.get('MAPBOX_PUBLIC_TOKEN')
    
    if (!token) {
      console.error('Mapbox token not configured')
      return new Response(
        JSON.stringify({ error: 'Mapbox token not configured' }),
        { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      )
    }

    console.log('Making request to Mapbox API')
    
    // Call Mapbox Geocoding API for reverse geocoding
    const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${token}&types=address`
    const response = await fetch(mapboxUrl)

    console.log(`Mapbox response status: ${response.status}`)

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Mapbox API error:', errorText)
      throw new Error(`Mapbox API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('Mapbox response data:', JSON.stringify(data, null, 2))
    
    const address = data.features?.[0]?.place_name || 'Address not found'
    console.log('Resolved address:', address)

    return new Response(
      JSON.stringify({ address }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in reverse-geocode function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})