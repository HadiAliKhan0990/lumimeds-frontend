// Minimal Calendly OAuth Configuration
export const CALENDLY_CONFIG = {
  CLIENT_ID: process.env.NEXT_PUBLIC_CALENDLY_CLIENT_ID || '',
  REDIRECT_URI: process.env.NEXT_PUBLIC_CALENDLY_REDIRECT_URI || 'http://localhost:3000/provider',
  AUTH_URL: process.env.NEXT_PUBLIC_CALENDLY_AUTH_URL || '',
  SCOPE: '',
};

export const getCalendlyAuthUrl = (doctorId: string) => {
  const params = new URLSearchParams({
    client_id: CALENDLY_CONFIG.CLIENT_ID,
    redirect_uri: CALENDLY_CONFIG.REDIRECT_URI,
    response_type: 'code',
    state: doctorId, // Add doctor ID as state parameter
    // Cache busting to prevent browser caching issues
    _t: Date.now().toString(),
  });

  // Only add scope if it's not empty
  if (CALENDLY_CONFIG.SCOPE) {
    params.append('scope', CALENDLY_CONFIG.SCOPE);
  }

  return `${CALENDLY_CONFIG.AUTH_URL}?${params.toString()}`;
};
