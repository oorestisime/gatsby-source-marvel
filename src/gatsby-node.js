// TODO: handle errors
// use url to construct urls
// handle etag
// process data into nodes
// optionaly download thumbnails
const _ = require(`lodash`)
const axios = require(`axios`)
const crypto = require('crypto');

const { signRequest, processApiResult, paginateApi, findIds } = require('./api-helper');
const { marvelAPI } = require('./constants');

const defaultOptions = {
  limit: 100,
};

async function getEntityById({ entity, id, ...options }) {
  const result = await axios.get(
    `${marvelAPI}${entity}/${id}`,
    {
      params: {
        ...signRequest(options),
      },
    },
  );

  return { id, entityResult: processApiResult(result).results[0] };
}

async function getEntitiesByFilter({ entity, entityFilter, ...options}) {
  const ids = await findIds({
    ...options,
    entity,
    entityFilter,
  });

  return await Promise.all(ids.map(id => getEntityById({ entity, id, ...options })))
}

async function getEntityResourcesById({ entity, id, resource, limit, ...options }) {
  return await paginateApi({
    route: `${marvelAPI}${entity}/${id}/${resource}`,
    limit,
    ...options,
  })
}

// const filterEntity = (entity, fields) => _.pick(entity, fields);
// const fitlerResults = (results, fields) => results.map(entity => filterEntity(entity, fields));

const mergeResults = (entities, entity, result) => {
  if (result.id in entities[entity]) {
    entities[entity][result.id] = {...entities[entity][result.id], ...result};
  } else {
    entities[entity][result.id] = result;
  }
}

function processEntities({ actions: { createNode }, entities, createNodeId, cache }) {
  _.keys(entities).forEach(entity => _.values(entities[entity]).forEach(child => {
    createNode({
      parent: `__SOURCE__`,
      internal: {
        type: `${entity}Node`,
        contentDigest: crypto
        .createHash(`md5`)
        .update(JSON.stringify(child))
        .digest(`hex`)
      },
      children: [],
      ...child,
      id: `${child.id}`,
    })
  }))
}

async function runQueries({ queries, ...options}) {
  const entities = {
    characters: {},
    comics: {},
    series: {},
    events: {},
    creators: {},
  };
  for(const { entity, entityFilter, resources } of queries) {
    try {
      const filteredEntities = await getEntitiesByFilter({
        entity,
        entityFilter,
        ...options,
      });
      for (const filtered of filteredEntities) {
        if (!resources) {
          mergeResults(entities, entity, filtered.entityResult);
        } else {
          for (const resource of resources) {
            const resourceResult = await getEntityResourcesById({
              ...options,
              entity,
              id: filtered.id,
              resource,
            });
            filtered.entityResult[`${resource}___NODE`] = resourceResult.map(res => `${res.id}`);
            mergeResults(entities, entity, filtered.entityResult);
            resourceResult.forEach(res => mergeResults(entities, resource, res ));
          };
        }
      }
    } catch (err) {
      console.warn("Something went wrong querying Marvel", err)
    }
  };
  return entities;
}

exports.sourceNodes = async ({ actions, store, cache, createNodeId }, options) => {
  const pluginOptions = { ...defaultOptions, ...options };
  const entities = await runQueries({ queries: pluginOptions.queries, ...options });
  processEntities({ actions, cache, createNodeId, entities });
}
