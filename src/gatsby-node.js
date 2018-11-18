const _ = require('lodash');
const crypto = require('crypto');

const {
  marvelAPI, paginateApi, findIds, getEntityById,
} = require('./api-helper');

const defaultOptions = {
  limit: 100,
};

async function getEntitiesByFilter({
  cache, entity, entityFilter, ...options
}) {
  const ids = await findIds({
    entity,
    cache,
    entityFilter,
    ...options,
  });

  return await Promise.all(ids.map(id => getEntityById({
    entity, id, cache, ...options,
  })));
}

async function getEntityResourcesById({
  entity, id, resource, cache, limit, ...options
}) {
  return await paginateApi({
    route: `${marvelAPI}${entity}/${id}/${resource}`,
    limit,
    cache,
    ...options,
  });
}

function processEntities({ actions: { createNode }, entities }) {
  _.keys(entities).forEach(entity => _.values(entities[entity]).forEach((child) => {
    createNode({
      parent: '__SOURCE__',
      internal: {
        type: `${entity}Node`,
        contentDigest: crypto
          .createHash('md5')
          .update(JSON.stringify(child))
          .digest('hex'),
      },
      children: [],
      ...child,
      id: `${child.id}`,
    });
  }));
}

async function runQueries({ cache, queries, ...options }) {
  const entities = {
    characters: {},
    comics: {},
    series: {},
    events: {},
    creators: {},
  };
  const mergeResults = (entity, result) => {
    if (result.id in entities[entity]) {
      entities[entity][result.id] = { ...entities[entity][result.id], ...result };
    } else {
      entities[entity][result.id] = result;
    }
  };
  /* eslint-disable no-restricted-syntax */
  for (const { entity, entityFilter, resources } of queries) {
    try {
      const filteredEntities = await getEntitiesByFilter({
        cache,
        entity,
        entityFilter,
        ...options,
      });

      for (const filtered of filteredEntities) {
        if (!resources) {
          mergeResults(entity, filtered.entityResult);
        } else {
          for (const resource of resources) {
            const resourceResult = await getEntityResourcesById({
              entity,
              resource,
              cache,
              id: filtered.id,
              ...options,
            });
            filtered.entityResult[`${resource}___NODE`] = resourceResult.map(res => `${res.id}`);
            mergeResults(entity, filtered.entityResult);
            resourceResult.forEach(res => mergeResults(resource, res));
          }
        }
      }
    } catch (err) {
      console.warn('Something went wrong querying Marvel', err); // eslint-disable-line no-console
    }
  }
  /* eslint-enable no-restricted-syntax */

  return entities;
}

exports.sourceNodes = async ({ actions, cache }, options) => {
  const pluginOptions = { ...defaultOptions, ...options };
  const entities = await runQueries({ cache, queries: pluginOptions.queries, ...options });
  processEntities({ actions, entities });
};
