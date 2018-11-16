const axios = require(`axios`)
const crypto = require('crypto');
const { marvelAPI } = require('./constants');

export function signRequest({ publicKey, privateKey }) {
  const now = Date.now()
  return {
    hash: crypto.createHash('md5').update(`${now}${privateKey}${publicKey}`).digest("hex"),
    ts: now,
    apikey: publicKey,
  };
}

export function processApiResult(result) {
  // TODO verify response status, etag etc
  return result.data.data;
}

export async function paginateApi({ route, limit, params, ...options }) {
  let offset = 0;
  let total = 1;
  let page = 1;
  let results = [];
  let result, processed;
  while (results.length < total) {
    result = await axios.get(
      route,
      {
        params: {
          limit,
          offset,
          ...params,
          ...signRequest(options),
        }
      }
    );
    page = page + 1;
    offset = limit * (page - 1);
    processed = processApiResult(result);
    results = results.concat(processed.results);
    total = processed.total;
  }

  return results;
}

export async function findIds({ entity, entityFilter, ...options }) {
  const results = await paginateApi({
    route: `${marvelAPI}${entity}`,
    params: {
      ...entityFilter
    },
    ...options
  })

  return results.map(result => result.id)
}
