import React from 'react';
import {
  Box, Grommet, Heading, Text, Paragraph,
  Anchor, CheckBox, Image, Carousel,
  ResponsiveContext,
} from 'grommet';
import { graphql } from 'gatsby';
import { grommet } from 'grommet/themes';
import { createGlobalStyle } from 'styled-components';
import { Github, Install, Catalog } from 'grommet-icons';


const GlobalTheme = createGlobalStyle`
  body {
    margin: 0;
  }
  pre {
    white-space: pre-wrap;
  }
`;

const queryExample = `
allComicsNode(
  filter: {
    characters : {
      elemMatch: {
        name: {in: ["Captain America", "Iron Man"]}
      }
    }
  }
) {
  edges {
    node {
      title
      thumbnail {
        path
        extension
      }
      prices {
        type
        price
      }
      characters {
        name
      }
    }
  }
}
`;

const configExample = `
{
  resolve: "gatsby-source-marvel",
  options: {
    publicKey: '---',
    privateKey: '---',
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
  }
}
`;

const getImage = thumbnail => (
  `${thumbnail.path.replace(/^http:\/\//i, 'https://')}/portrait_incredible.${thumbnail.extension}`
);

const comicBox = comic => (
  <Box key={comic.node.title} pad="medium">
    <Heading size="small">{`${comic.node.title} - ${comic.node.prices[0].price}$`}</Heading>
    <Image src={getImage(comic.node.thumbnail)} fit="contain" />
    <Paragraph alignSelf="center" textAlign="center">
      <span>
        {comic.node.characters.map(char => char.name).join(', ')}
      </span>
    </Paragraph>
  </Box>
);


const MarvelPage = ({ data }) => (
  <Grommet theme={grommet}>
    <GlobalTheme />
    <Box
      tag="header"
      background="brand"
      pad="medium"
      animation="fadeIn"
    >
      <Box direction="row-responsive" justify="center" gap="small" margin="none">
        <Heading size="medium">Gatsby + Marvel = gatsby-source-marvel</Heading>
      </Box>
    </Box>
    <Box align="center" margin="large">
      <Paragraph size="xxlarge" textAlign="center">
        <span>
          Gatsby source plugin to facilitate accessing the ton of content of the Marvel API
        </span>
      </Paragraph>
    </Box>
    <Box
      direction="row-responsive"
      gap="large"
      justify="center"
      margin={{ vertical: 'xlarge' }}
    >
      <Anchor
        target="_blank"
        href="https://www.npmjs.com/package/gatsby-source-marvel"
        icon={<Install color="brand" size="large" />}
        label={<Text size="large">Released on NPM</Text>}
      />
      <Anchor
        target="_blank"
        a11yTitle="Share feedback on Github"
        href="https://github.com/oorestisime/gatsby-source-marvel"
        icon={<Github color="brand" size="large" />}
        label={<Text size="large">Code on Github</Text>}
      />
    </Box>
    <Box
      gap="medium"
      background="light-1"
      direction="row-responsive"
    >
      <Box basis="1/2" margin="medium">
        <Heading color="brand" size="medium">Configuration examples</Heading>
        <Paragraph size="medium" textAlign="start">
          <span>
            The marvel API contains different
            <Anchor href="https://developer.marvel.com/documentation/entity_types"> entities </Anchor>
            and there are connections in (almost) every imaginable way.
            To get started you need to create your
            <Anchor href="https://developer.marvel.com/documentation/getting_started"> developer access</Anchor>
          </span>
        </Paragraph>
        <Paragraph size="medium" textAlign="start">
          <span>
            The plugin tries to facilitate constructing queries by letting you
            describe the resources you need. You still need to be a bit familiar
            with the API in order to know which filters you are allowed to use,
            and the different connections between the entities
          </span>
        </Paragraph>
        <Paragraph size="medium" textAlign="start">
          <span>
            {`Specifying resources along with an entity will retrieve all the available information for each resource connected to the entity
            filter. For example the example will retrieve all the available events associated with Thor. If you don't specify the resources
            then you only the first 20 results of each connection with the bare minimum information (as it happens on the marvel API)`}
          </span>
        </Paragraph>
      </Box>
      <Box basis="1/2" margin="medium">
        <pre>
          {configExample}
        </pre>
      </Box>
    </Box>
    <Box
      gap="medium"
      direction="row-responsive"
    >
      <Box basis="1/2" margin="medium">
        <Heading color="brand" size="medium">Query example</Heading>
        <Paragraph size="medium" textAlign="start">
          <span>
            The source plugin will create (depending on the configuration) the available
            nodes grouped by entity.
          </span>
        </Paragraph>
        <Paragraph size="medium" textAlign="start">
          <span>Available nodes are:</span>
          <ul>
            <li>charactersNode & allCharactersNode</li>
            <li>comicsNode & allComicsNode</li>
            <li>eventsNode & allEventsNode</li>
            <li>creatorsNode & allCreatorsNode</li>
            <li>seriesNode & allSeriesNode</li>
          </ul>
        </Paragraph>
      </Box>
      <Box basis="1/2" margin="medium">
        <pre>
          {queryExample}
        </pre>
      </Box>
    </Box>
    <Box background="light-1" justify="center" margin="medium" align="center">
      <Heading color="brand" size="medium">Work in progress</Heading>
      <Box direction="row-responsive" margin="none">
        <Box basis="1/2" margin="small">
          <Box direction="column" margin="none">
            <CheckBox disabled checked label="Use gatsby cache along with API etag to avoid hitting rate limiter" />
            <CheckBox disabled checked={false} label="Better error handling of their API" />
            <CheckBox disabled checked={false} label="Option to download remote files" />
          </Box>
        </Box>
        <Box basis="1/2" margin="small">
          <Paragraph size="medium" textAlign="start" margin="none">
            <span>
              {`I'll be trying to work on these problems soon. If you find a bug, thought of a feature
              or even want to share the cool usage of this plugin then you are welcome to create an issue`}
            </span>
          </Paragraph>
        </Box>
      </Box>
    </Box>
    <Box gap="small" direction="row-responsive" margin="medium">
      {data.allCharactersNode.edges.slice(0, 2).map(character => (
        <Box key={character.node.name} pad="small" basis="1/2" border="all">
          <Box direction="row" justify="between" fill="horizontal">
            <Heading color="brand" size="medium">{character.node.name}</Heading>
            <Box pad="large" direction="row">
              <Catalog />
              {' '}
              {character.node.comics.available}
            </Box>
          </Box>
          <Box direction="row" justify="between" fill="horizontal">
            <Box pad="small" direction="row">
              <Paragraph>{character.node.description}</Paragraph>
            </Box>
            <Box pad="small" direction="row">
              <Image src={getImage(character.node.thumbnail)} fit="contain" />
            </Box>
          </Box>
        </Box>
      ))}
    </Box>
    <Box justify="center" align="center">
      <ResponsiveContext.Consumer>
        {(size) => {
          if (size === 'small') {
            return (
              <Carousel>
                {data.allComicsNode.edges.slice(0, 5).map(comic => comicBox(comic))}
              </Carousel>
            );
          }
          if (size === 'medium') {
            return (
              <Carousel>
                {data.allComicsNode.edges.slice(0, 10).map(comic => comicBox(comic))}
              </Carousel>
            );
          }
          if (size === 'large') {
            return (
              <Carousel>
                {data.allComicsNode.edges.map(comic => comicBox(comic))}
              </Carousel>
            );
          }
        }}
      </ResponsiveContext.Consumer>
    </Box>
  </Grommet>
);

export const pageQuery = graphql`
query MarvelQuery {
  allCharactersNode {
    totalCount
    edges {
      node {
        name
        thumbnail {
          path
          extension
        }
        description
        comics {
          available
        }
      }
    }
  }
  allComicsNode(
    filter: {characters : {elemMatch: {name: {in: ["Captain America", "Iron Man"]}}}}
  ) {
    edges {
      node {
        title
        thumbnail {
          path
          extension
        }
        prices {
          type
          price
        }
        characters {
          name
        }
      }
    }
  }
}`;

export default MarvelPage;
