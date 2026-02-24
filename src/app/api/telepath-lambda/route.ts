import config from '@/config';
import { NextRequest, NextResponse } from 'next/server';
import { awsSignedFetch, AwsSignedFetchError } from '@/lib/utils/awsSign';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get('patientId');

  if (!patientId) {
    return NextResponse.json({ error: 'patientId is required' }, { status: 400 });
  }

  const { telepathUrl, awsRegion } = config();
  const TELEPATH_URL = telepathUrl || process.env.TELEPATH_URL;
  if (!TELEPATH_URL) {
    console.error('remote configuration error');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  // Ensure URL ends with / for proper path construction
  const baseUrl = TELEPATH_URL.endsWith('/') ? TELEPATH_URL : `${TELEPATH_URL}/`;
  const targetUrl = `${baseUrl}?patientId=${encodeURIComponent(patientId)}`;
  
  console.log('Fetching Lambda URL:', targetUrl);

  try {
    const data = await awsSignedFetch({ 
      url: targetUrl,
      region: awsRegion,
      method: 'GET', 
    })

    return NextResponse.json(data);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (error instanceof AwsSignedFetchError) {
      return NextResponse.json(
        { 
          error: 'Failed to fetch data', details: error.error },
        { status: error.status }
      );
    }
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

