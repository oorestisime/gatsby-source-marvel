require('dotenv').config();

module.exports = {
  siteMetadata: {
    title: 'Gatsby source marvel',
  },
  plugins: [
    {
      // resolve: require.resolve('..'), // Used at dev
      resolve: 'gatsby-source-marvel',
      options: {
        publicKey: process.env.PUBKEY,
        privateKey: process.env.PRIVKEY,
        limit: 100,
        queries: [
          {
            entity: 'characters',
            entityFilter: {
              name: 'Spider-Man',
            },
            resources: ['events'],
          },
          {
            entity: 'comics',
            entityFilter: {
              titleStartsWith: 'Civil War II',
            },
            resources: ['characters'],
          },
        ],
      },
    },
  ],
};
