function shouldUseCalendlySystem(userEmail?: string | null): boolean {
  const showCalendlyModal = true;
  const calendlyWhitelistEmails = process.env.NEXT_PUBLIC_CALENDLY_WHITELIST_EMAILS
    ? process.env.NEXT_PUBLIC_CALENDLY_WHITELIST_EMAILS.split(',').map((email) => email.trim().toLowerCase())
    : [];

  // Check whitelist
  if (userEmail && calendlyWhitelistEmails.length > 0) {
    const normalizedEmail = userEmail.trim().toLowerCase();
    if (calendlyWhitelistEmails.includes(normalizedEmail)) {
      return true; // Whitelisted users always use Calendly
    }
  }

  // Non-whitelisted users follow the flag
  return showCalendlyModal;
}

export function shouldShowCalendlyFeature(userEmail?: string | null): boolean {
  return shouldUseCalendlySystem(userEmail);
}

export function shouldHideCalendlyFeature(userEmail?: string | null): boolean {
  return !shouldUseCalendlySystem(userEmail);
}
