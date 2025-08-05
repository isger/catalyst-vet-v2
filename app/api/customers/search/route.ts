import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { query, limit = 20, initial = false } = await request.json()
    
    // If requesting initial customers, don't require query
    if (!initial && (!query || typeof query !== 'string')) {
      return NextResponse.json(
        { error: 'Search query is required' },
        { status: 400 }
      )
    }

    // For initial load, return recent customers; for search, require min length
    if (!initial && query && query.length < 2) {
      return NextResponse.json({ customers: [] })
    }

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

    // Build the query
    let queryBuilder = supabase
      .from('owner')
      .select(`
        id,
        first_name,
        last_name,
        email,
        phone,
        animal (
          id,
          name,
          species,
          breed
        )
      `)
      .eq('tenant_id', tenantData.tenant_id)

    if (initial) {
      // For initial load, get recent customers (ordered by creation date)
      queryBuilder = queryBuilder
        .order('created_at', { ascending: false })
        .limit(Math.min(limit, 10)) // Show fewer for initial load
    } else if (query) {
      // For search, filter by query and order by name
      queryBuilder = queryBuilder
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .order('first_name')
        .limit(Math.min(limit, 50)) // Cap at 50 results
    }

    const { data: customers, error } = await queryBuilder

    if (error) {
      console.error('Error searching customers:', error)
      return NextResponse.json(
        { error: 'Failed to search customers' },
        { status: 500 }
      )
    }

    // Transform the data to match our interface
    const transformedCustomers = customers.map(customer => ({
      id: customer.id,
      first_name: customer.first_name,
      last_name: customer.last_name,
      email: customer.email,
      phone: customer.phone,
      animals: customer.animal || []
    }))

    return NextResponse.json({ customers: transformedCustomers })
  } catch (error) {
    console.error('Customer search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}