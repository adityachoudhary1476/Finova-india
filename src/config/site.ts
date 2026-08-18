const fallbackContactEmail = 'contact@example.com';

export const SITE_CONTACT = {
  email: import.meta.env.PUBLIC_CONTACT_EMAIL ?? fallbackContactEmail,
  isPlaceholder: (import.meta.env.PUBLIC_CONTACT_EMAIL ?? fallbackContactEmail) === fallbackContactEmail,
} as const;
