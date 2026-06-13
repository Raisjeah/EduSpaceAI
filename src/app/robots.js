export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://eduspaceai.com';
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/', '/chat/', '/workspace/', '/editor/', '/profile/', '/project/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
