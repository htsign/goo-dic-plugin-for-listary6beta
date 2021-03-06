const client = require('cheerio-httpcli');
const { compact, join, map, pipe, split, trim, zip } = require('lodash/fp');

/**
 * @param {string} s
 * @returns {string}
 */
const trimAndMergeLines = pipe(split('\n'), map(trim), compact, join(' '));
const especialKeywords = {
  '%26': '%252526', // &
  '%2F': '%25252F', // /
};

/**
 * @typedef {object} Execution
 * @property {string} type 
 * @property {string} url
 */
/**
 * @typedef {object} ListaryExtensionResult
 * @property {number=} id
 * @property {string=} title
 * @property {string=} subtitle
 * @property {Execution[]=} execution
 */
/**
 * @param {string} query
 * @returns {Promise<ListaryExtensionResult[]>}
 */
async function search(query) {
  const HOST = 'https://dictionary.goo.ne.jp';
  const keyword = Object.entries(especialKeywords)
    .reduce((s, [key, val]) => s.split(key).join(val), encodeURIComponent(query));

  let res;
  try {
    res = await client.fetch(`${HOST}/srch/en/${keyword}/m0u/`);
  }
  catch (e) {
    return [{ title: 'error', subtitle: e.message }];
  }
  const { $ } = res;

  // true if response is redirected to word page directly
  const info = $.documentInfo();
  if (info.url.substring(HOST.length).startsWith('/word/')) {
    const $parents = $('.meanging');

    // remove all unnecessary elements
    $parents.find('script, div.examples').remove();

    const titles = $parents.map((_, x) => $(x).find('.basic_title').text().trim());
    const contents = $parents.map((_, x) => trimAndMergeLines($(x).find('.content-box-ej').text()));
    return zip(titles, contents).map(([title, subtitle]) => ({ title, subtitle }));
  }

  // list of meanings
  return $('.search-list .content_list > li').map((_, x) => {
    const $x = $(x);
    return {
      title: $x.find('.title').text().trim(),
      subtitle: $x.find('.text').text().trim(),
      execution: [{ type: 'OpenUrl', url: `${HOST}${$x.find('a[href]').attr('href')}` }],
    };
  }).toArray();
}
module.exports = { search };
