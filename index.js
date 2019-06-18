const axios = require('axios');
const { zip } = require('lodash');
const { JSDOM } = require('jsdom');

/**
 * @param {string} s
 * @returns {string}
 */
const trimAndMergeLines = s => s.split('\n').map(x => x.trim()).filter(x => x).join(' ');
const especialKeywords = {
  '%26': '%252526', // &
  '%2F': '%25252F', // /
};

/**
 * @typedef {object} ListaryExtensionResult
 * @property {number=} id
 * @property {string=} title
 * @property {string=} subtitle
 * @property {*[]=} execution
 */
/**
 * @param {string} query
 * @returns {Promise<ListaryExtensionResult[]>}
 */
async function search(query) {
  const HOST = 'http://dictionary.goo.ne.jp';
  const keyword = Object.entries(especialKeywords)
    .reduce((s, [key, val]) => s.split(key).join(val), encodeURIComponent(query));

  let response;
  try {
    response = await axios(`${HOST}/srch/en/${keyword}/m0u/`);
  }
  catch (e) {
    return [{ title: 'error', subtitle: e.message }];
  }
  const dom = new JSDOM(response.data);
  const { document } = dom.window;

  // true if response is redirected to word page directly
  if (response.request.path.startsWith('/word/')) {
    const parent = document.querySelector('.meanging .content-box-ej');

    // remove all unnecessary elements
    for (const element of [...parent.querySelectorAll('script, div.examples')]) {
      element.remove();
    }

    const wordClasses = Array.from(parent.querySelectorAll('.header-hinshi'), x => x.textContent.trim());

    if (wordClasses.length) {
      const listMeanings = Array.from(parent.querySelectorAll('.list-meanings'), x => trimAndMergeLines(x.textContent));
      return zip(wordClasses, listMeanings).map(([wc, lm]) => ({ title: wc, subtitle: lm }));
    }
    // proper nouns or ...
    else {
      const parents = Array.from(document.querySelectorAll('.meanging'));
      return parents.map(x => ({
        title: x.querySelector('.basic_title').textContent.trim(),
        subtitle: trimAndMergeLines(x.querySelector('.content-box-ej').textContent),
      }));
    }
  }

  // list of meanings
  return Array.from(document.querySelectorAll('.search-list .content_list > li'), x => ({
    title: x.querySelector('.title').textContent.trim(),
    subtitle: x.querySelector('.text').textContent.trim(),
    execution: [_ => `${HOST}${x.querySelector('a[href]').href}`],
  }));
}
module.exports = { search };
