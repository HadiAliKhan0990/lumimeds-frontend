import React from 'react';
import { AutoLink } from '@/components/elements';

interface ParsedLink {
  type: 'text' | 'link';
  content: string;
  url?: string;
}

/**
 * UPDATED REGEX: 
 * 1. Matches http:// or https:// URLs with paths
 * 2. Matches www. URLs with paths
 * 3. Matches domain patterns (handles multi-level TLDs like .edu.pk, .co.uk)
 * 4. Captures paths (/path), query params (?key=value), and fragments (#anchor)
 */
const URL_CANDIDATE_REGEX = /\b((https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)+([/?#][^\s]*)?))\b/gi;
const TRAILING_PUNCTUATION = /[.,;:!?]+$/;

const cleanTrailingPunctuation = (url: string): string => url.replace(TRAILING_PUNCTUATION, '');

const normalizeUrl = (candidate: string): string => {
  const cleaned = cleanTrailingPunctuation(candidate);
  if (/^https?:\/\//i.test(cleaned)) return cleaned;
  return `https://${cleaned}`;
};

/**
 * ENHANCED VALIDATION:
 * Prevents "www.www" and "www.facebook" (missing TLD) by validating TLD structure
 */
const isValidHostname = (hostname: string): boolean => {
  const parts = hostname.split('.');
  if (parts.length < 2) return false;

  const tld = parts[parts.length - 1];
  // TLD must be 2+ alphabetic chars
  if (!/^[a-zA-Z]{2,}$/.test(tld)) return false;

  // TLD should be 2-10 characters (most TLDs are 2-6, but allow up to 10 for edge cases)
  // This rejects long domain names being used as TLDs (like "facebook" in "www.facebook")
  if (tld.length > 10) return false;

  // Check for common false positives like "www.www"
  if (parts.every(p => p.toLowerCase() === 'www')) return false;

  // If TLD is longer than 4 chars, it's likely not a real TLD (most are 2-4 chars)
  // Allow longer TLDs only if they're in a known list or follow certain patterns
  // For now, reject TLDs longer than 6 chars unless it's a known long TLD pattern
  if (tld.length > 6) {
    // Reject obvious domain names (common words/patterns that aren't TLDs)
    const commonDomainWords = ['facebook', 'google', 'twitter', 'youtube', 'instagram', 'linkedin', 'github', 'amazon', 'microsoft', 'apple'];
    if (commonDomainWords.includes(tld.toLowerCase())) return false;
    
    // Reject if TLD looks like a common word (has vowels and consonants in typical word pattern)
    // Simple heuristic: if it's 7+ chars and has multiple vowels, likely a domain name
    const vowelCount = (tld.match(/[aeiouAEIOU]/g) || []).length;
    if (tld.length >= 7 && vowelCount >= 3) return false;
  }

  // Ensure labels are valid and not empty (handles double dots)
  return parts.every(label => /^[a-zA-Z0-9-]+$/.test(label) && label.length > 0);
};

const isValidUrlWhatsAppStyle = (url: string): boolean => {
  try {
    const parsed = new URL(url);
    // Ensure the domain isn't just "www.com" or similar logic if desired
    return ['http:', 'https:'].includes(parsed.protocol) && isValidHostname(parsed.hostname);
  } catch {
    return false;
  }
};

/**
 * REFINED EXTRACTION:
 * Removed the aggressive "slice" loop that was stripping parts until it worked.
 * We now rely on the cleaner Regex and strict hostname check.
 */
const extractValidDomain = (candidate: string): string | null => {
  // If candidate contains double dots, it's invalid immediately
  if (candidate.includes('..')) return null;

  const normalized = normalizeUrl(candidate);
  if (isValidUrlWhatsAppStyle(normalized)) {
    return cleanTrailingPunctuation(candidate);
  }
  return null;
};

export const parseLinks = (text: string): ParsedLink[] => {
  if (!text) return [];

  const parts: ParsedLink[] = [];
  let lastIndex = 0;
  let match;

  URL_CANDIDATE_REGEX.lastIndex = 0;

  while ((match = URL_CANDIDATE_REGEX.exec(text)) !== null) {
    const candidate = match[0];
    const index = match.index;

    if (index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, index) });
    }

    const validDomain = extractValidDomain(candidate);
    if (validDomain) {
      const normalized = normalizeUrl(validDomain);
      parts.push({ type: 'link', content: validDomain, url: normalized });
    } else {
      parts.push({ type: 'text', content: candidate });
    }

    lastIndex = index + candidate.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: 'text', content: text }];
};

/**
 * Renders parsed links in React using common AutoLink component
 */
export const renderLinks = (parsedContent: ParsedLink[], className?: string): React.ReactNode =>
  parsedContent.map((part, index) =>
    part.type === 'link' && part.url ? (
      <AutoLink key={`link-${index}`} href={part.url} className={className}>
        {part.content}
      </AutoLink>
    ) : (
      <React.Fragment key={`text-${index}`}>{part.content}</React.Fragment>
    )
  );

/**
 * Convenience: parse + render links
 */
export const parseAndRenderLinks = (text: string, className?: string): React.ReactNode => {
  if (!text) return null;
  return renderLinks(parseLinks(text), className);
};