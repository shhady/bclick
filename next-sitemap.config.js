 /** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || 'https://bclick-umber.vercel.app',
    generateRobotsTxt: true,
    robotsTxtOptions: {
      policies: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/api/*', '/admin/*']
        }
      ]
    },
    exclude: ['/api/*', '/admin/*', '/server-sitemap.xml'],
    generateIndexSitemap: false,
    changefreq: 'daily',
    priority: 0.7
  } 