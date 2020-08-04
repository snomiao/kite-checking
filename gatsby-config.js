const urljoin = require("url-join");
const path = require('path')
const config = {
  siteTitle: '上应小风筝',
  siteTitleShort: '上应小风筝',
  siteTitleAlt: '上应小风筝',
  siteDescription: '上应小风筝',
  siteLogo: '/logos/kite.png',
  siteUrl: 'https://kite.snomiao.com',
  pathPrefix: '',
  siteRss: '/rss.xml',
  dateFromFormat: 'YYYY-MM-DD',
  dateFormat: '(YYYYMMDD)',
  copyright: 'Copyright © 2020 snomiao@gmail.com. All rights reserved.',
  themeColor: '#c62828',
  backgroundColor: '#56cde8'
}
// Validate

// Make sure pathPrefix is empty if not needed
if (config.pathPrefix === '/') {
  config.pathPrefix = ''
} else {
  // Make sure pathPrefix only contains the first forward slash
  config.pathPrefix = `/${config.pathPrefix.replace(/^\/|\/$/g, '')}`
}

// Make sure siteUrl doesn't have an ending forward slash
if (config.siteUrl.substr(-1) === '/')
  config.siteUrl = config.siteUrl.slice(0, -1)

// Make sure siteRss has a starting forward slash
// if (config.siteRss && config.siteRss[0] !== "/")
//   config.siteRss = `/${config.siteRss}`;



module.exports = {
  siteMetadata: {
    siteUrl: urljoin(config.siteUrl, config.pathPrefix),
    rssMetadata: {
      site_url: urljoin(config.siteUrl, config.pathPrefix),
      feed_url: urljoin(config.siteUrl, config.pathPrefix, config.siteRss),
      title: config.siteTitle,
      description: config.siteDescription,
      image_url: `${urljoin(
        config.siteUrl,
        config.pathPrefix,
        config.siteLogo,
      )}`,
      copyright: config.copyright
    }
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: path.join(__dirname, `src`, `images`),
      },
    },
    "gatsby-plugin-sharp",
    "gatsby-transformer-sharp",
    
    `gatsby-plugin-typescript`,
    "gatsby-plugin-catch-links",
    "gatsby-plugin-sitemap",
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        precachePages: [
          `/`,
          `/login`,
          `/logout`,
          `/account`,
          `/checking`,
          `/checking/*`,
        ],
      },
    },


    // {
    //   resolve: 'gatsby-transformer-remark',
    //   options: {
    //     // CommonMark mode (default: true)
    //     commonmark: true,
    //     // Footnotes mode (default: true)
    //     footnotes: true,
    //     // Pedantic mode (default: true)
    //     pedantic: true,
    //     // GitHub Flavored Markdown mode (default: true)
    //     gfm: true,
    //     // Plugins configs
    //     plugins: [{
    //       resolve: 'gatsby-remark-autolink-headers',
    //       options: {
    //         offsetY: '100',
    //         icon: '<svg aria-hidden="true" height="20" version="1.1" viewBox="0 0 16 16" width="20"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>',
    //         className: 'header-link-class',
    //         maintainCase: false,
    //         removeAccents: true
    //       }
    //     },
    //     {
    //       resolve: 'gatsby-remark-prismjs',
    //       options: {
    //         classPrefix: 'language-',
    //         inlineCodeMarker: null,
    //         aliases: {},
    //         showLineNumbers: false,
    //         noInlineHighlight: false
    //       }
    //     }]
    //   }
    // }
  ],
}
