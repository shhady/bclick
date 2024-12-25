export default function manifest() {
    return {
      name: 'BClick - Manage Your Suppliers and Clients',
      short_name: 'BClick',
      description: 'BClick is the ultimate platform for suppliers to manage products, categories, clients, and orders efficiently. Built for scalability and ease of use.',
      start_url: '/',
      display: 'standalone',
      background_color: '#ffffff',
      theme_color: '#000000',
      icons: [
        {
          src: '/blogo192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: '/blogo512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
      orientation: "portrait"
    }
  }
  