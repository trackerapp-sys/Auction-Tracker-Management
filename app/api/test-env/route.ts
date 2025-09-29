import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const envVars = {
      hasFacebookToken: !!process.env.FACEBOOK_ACCESS_TOKEN,
      facebookTokenLength: process.env.FACEBOOK_ACCESS_TOKEN?.length || 0,
      hasMongoDbUri: !!process.env.MONGODB_URI,
      nodeEnv: process.env.NODE_ENV,
      // Note: Don't expose actual token values for security
    }

    return NextResponse.json({
      success: true,
      environmentVariables: envVars,
      message: 'Environment check complete'
    })
  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to check environment variables' 
      },
      { status: 500 }
    )
  }
}

