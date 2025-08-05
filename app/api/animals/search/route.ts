import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Animals API Debug ===')
    const { query, limit = 20, initial = false, ownerId } = await request.json()
    console.log('Request params:', { query, limit, initial, ownerId })
    
    // Validation: require query only if not initial load and no owner filter
    if (!initial && !ownerId && (!query || typeof query !== 'string')) {
      console.log('Rejecting: No query provided and not initial/owner-filtered request')
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // For search without owner filter, require minimum query length
    if (!initial && !ownerId && query && query.length < 2) {
      console.log('Rejecting: Query too short for non-owner-filtered search')
      return NextResponse.json({ animals: [] })
    }

    console.log('Validation passed, proceeding with request')
    
    const supabase = await createClient()
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user's tenant
    const { data: tenantData } = await supabase
      .from('tenant_membership')
      .select('tenant_id')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single()

    if (!tenantData) {
      return NextResponse.json(
        { error: 'No active tenant found' },
        { status: 403 }
      )
    }

    // Build the query - start with a simpler query to test
    let queryBuilder = supabase
      .from('animal')
      .select(`
        id,
        name,
        species,
        breed,
        date_of_birth,
        owner_id
      `)
      .eq('tenant_id', tenantData.tenant_id)

    // Filter by owner if specified
    if (ownerId) {
      queryBuilder = queryBuilder.eq('owner_id', ownerId)
    }

    if (initial && !ownerId) {
      // For initial load without owner filter, get recent animals
      queryBuilder = queryBuilder
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 10))
    } else if (query && !ownerId) {
      // For search without owner filter, filter by query
      queryBuilder = queryBuilder
        .or(`name.ilike.%${query}%,species.ilike.%${query}%,breed.ilike.%${query}%`)
        .order('name')
        .limit(Math.min(limit, 50))
    } else if (ownerId) {
      // If owner is specified, just get all their animals (potentially filtered by query)
      if (query && query.length >= 2) {
        queryBuilder = queryBuilder
          .or(`name.ilike.%${query}%,species.ilike.%${query}%,breed.ilike.%${query}%`)
      }
      queryBuilder = queryBuilder
        .order('name')
        .limit(Math.min(limit, 50))
    }

    console.log('Executing query with builder:', JSON.stringify(queryBuilder, null, 2))
    const { data: animals, error } = await queryBuilder

    if (error) {
      console.error('Database error searching animals:', error)
      console.error('Query builder that failed:', queryBuilder)
      return NextResponse.json(
        { error: 'Failed to search animals', details: error.message },
        { status: 500 }
      )
    }

    console.log('Raw animals data:', animals)

    // Transform the data to match our interface (simplified for now)
    const transformedAnimals = animals.map(animal => ({
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      date_of_birth: animal.date_of_birth,
      owner: null // We'll add owner info later once basic query works
    }))

    console.log('Transformed animals:', transformedAnimals)
    console.log('Returning animals count:', transformedAnimals.length)
    console.log('========================')

    return NextResponse.json({ animals: transformedAnimals })
  } catch (error) {
    console.error('Animal search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}