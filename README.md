# Gatsby source marvel example [![npm version](https://badge.fury.io/js/gatsby-source-marvel.svg)](https://badge.fury.io/js/gatsby-source-marvel)


## Install

To install the source plugin `yarn add gatsby-source-marvel`.

## Configure

* You first need to create a Marvel developer account and retrieve you Key pair to use the plugin. http://developer.marvel.com/ has all the info you need.

* Make sure to have a look at these sections of their documentation https://developer.marvel.com/documentation/entity_types (to understand the different entities and their fields) https://developer.marvel.com/docs (to find out about their filters) and if you are using their images https://developer.marvel.com/documentation/images

* Here is a configuration example to get the available information for Thor:

```

{
  resolve: "gatsby-source-marvel",
  options: {
    publicKey: --,
    privateKey: --,
    queries: [
      {
        entity: 'characters',
        entityFilter: {
          name: 'Thor',
        },
      },
    ],
  }
},
```

* Check the example website https://gatsby-source-marvel.netlify.com/ for more examples, how to query data and happy marvel hacking
