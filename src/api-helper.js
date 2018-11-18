const axios = require('axios');
const crypto = require('crypto');

export const marvelAPI = 'https://gateway.marvel.com/v1/public/';
const paginateFilterCacheKey = (route, filter, offset, limit) => `${route}-${JSON.stringify(filter)}-${offset}-${limit}`;
const entityFilterCacheKey = (entity, id) => `${entity}-${id}`;

export function signRequest({ publicKey, privateKey }) {
  const now = Date.now();

  return {
    hash: crypto.createHash('md5').update(`${now}${privateKey}${publicKey}`).digest('hex'),
    ts: now,
    apikey: publicKey,
  };
}

export async function verifyEtag({
  cache, route, cacheKey, ...options
}) {
  const cached = await cache.get(cacheKey);
  if (cached) {
    try {
      await axios.get(
        route,
        {
          params: { ...signRequest(options) },
          headers: {
            Accept: '*/*',
            'If-None-Match': cached.etag,
          },
          validateStatus: status => status === 304,
        },
      );

      return cached;
    } catch (err) {
      // ignore error
      return false;
    }
  }

  return false;
}

export function processApiResult(result) {
  return { data: result.data.data, etag: result.data.etag };
}

async function queryWithOffset({ route, params, ...options }) {
  const result = await axios.get(
    route,
    {
      params: {
        ...params,
        ...signRequest(options),
      },
    },
  );

  return processApiResult(result);
}

export async function paginateApi({
  route, limit, params, cache, ...options
}) {
  let result;
  let offset = 0;
  let page = 1;
  let results = [];
  // We query first without cache to get the updated total results.
  result = await queryWithOffset({
    route,
    params: {
      offset,
      limit,
      ...params,
    },
    ...options,
  });
  results = results.concat(result.data.results);
  const { total } = result.data;

  while (results.length < total) {
    page += 1;
    offset = limit * (page - 1);
    // apparently marvel decided that etag is different for each paginated result
    const cacheKey = paginateFilterCacheKey(route, params, offset, limit);
    const cached = await verifyEtag({
      cache,
      route,
      cacheKey,
      ...options,
    });
    if (cached) {
      results = results.concat(cached.result.results);
    } else {
      result = await queryWithOffset({
        route,
        params: {
          offset,
          limit,
          ...params,
        },
        ...options,
      });
      results = results.concat(result.data.results);
      await cache.set(cacheKey, { results: result.data, etag: result.etag });
    }
  }

  return results;
}

export async function findIds({
  entity, entityFilter, cache, ...options
}) {
  const results = await paginateApi({
    route: `${marvelAPI}${entity}`,
    params: {
      ...entityFilter,
    },
    cache,
    ...options,
  });

  return results.map(result => result.id);
}

export async function getEntityById({
  entity, id, cache, ...options
}) {
  const route = `${marvelAPI}${entity}/${id}`;
  const cacheKey = entityFilterCacheKey(entity, id);
  const cached = await verifyEtag({
    cache,
    route,
    cacheKey,
    ...options,
  });
  if (cached) {
    return { id, entityResult: cached.result.results[0] };
  }

  const result = processApiResult(await axios.get(
    route,
    {
      params: {
        ...signRequest(options),
      },
    },
  ));

  await cache.set(cacheKey, { result: result.data, etag: result.etag });

  return { id, entityResult: result.data.results[0] };
}
