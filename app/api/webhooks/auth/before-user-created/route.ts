import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  console.log('🔗 Webhook: Before user created - START')
  console.log('🌍 Environment:', process.env.NODE_ENV)
  console.log('🕐 Timestamp:', new Date().toISOString())
  
  try {
    // Get all headers for debugging
    const headersList = await headers()
    const allHeaders = Object.fromEntries(headersList.entries())
    console.log('📋 All headers:', JSON.stringify(allHeaders, null, 2))
    
    // Check for authorization header
    const authorization = headersList.get('authorization')
    const webhookSecret = process.env.BEFORE_USER_CREATED_API_KEY
    
    console.log('🔑 Authorization header:', authorization)
    console.log('🔑 Expected webhook secret:', webhookSecret?.substring(0, 20) + '...')
    
    if (!authorization) {
      console.log('❌ No authorization header found')
      return NextResponse.json(
        { error: 'No authorization header' }, 
        { status: 401 }
      )
    }
    
    if (!webhookSecret) {
      console.log('❌ No webhook secret configured')
      return NextResponse.json(
        { error: 'Webhook secret not configured' }, 
        { status: 500 }
      )
    }
    
    // Verify the webhook secret (try both formats)
    const isValidBearer = authorization === `Bearer ${webhookSecret}`
    const isValidDirect = authorization === webhookSecret
    
    if (!isValidBearer && !isValidDirect) {
      console.log('❌ Invalid authorization token')
      console.log('Expected Bearer format:', `Bearer ${webhookSecret.substring(0, 20)}...`)
      console.log('Expected direct format:', webhookSecret.substring(0, 20) + '...')
      console.log('Received:', authorization.substring(0, 20) + '...')
      return NextResponse.json(
        { error: 'Invalid authorization token' }, 
        { status: 401 }
      )
    }
    
    // Get the request body
    const body = await request.json()
    console.log('📦 Webhook body:', JSON.stringify(body, null, 2))
    
    // Here you can add your custom logic before user creation
    // For example: validate email domain, check blacklists, etc.
    const userData = body.user || body
    console.log('👤 User data:', {
      email: userData.email,
      id: userData.id,
      created_at: userData.created_at
    })
    
    console.log('✅ Webhook: Before user created - SUCCESS')
    
    // Return success response to allow user creation
    return NextResponse.json({ 
      success: true,
      message: 'User creation approved',
      timestamp: new Date().toISOString()
    })
    
  } catch (error) {
    console.error('💥 Webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    )
  }
}