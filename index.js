const axios = require('axios');
const { JSDOM } = require('jsdom');

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

  if (response.request.path.startsWith('/word/')) {
    const meanInfo = document.querySelector('.mean_info');
    const headerHinshi = document.querySelector('.header-hinshi');
    const meanings = Array.from(document.querySelectorAll('.list-meanings > li'));

    // remove all div elements inside of `.list-meanings > li`
    for (const supInfo of meanings.reduce((acc, curr) => [...acc, ...curr.getElementsByTagName('div')], [])) {
      supInfo.remove();
    }
    return [
      { title: meanInfo.textContent.split('\n').map(x => x.trim()).join(' ') },
      {
        title: headerHinshi.textContent.trim(),
        subtitle: meanings.map(x => x.textContent.trim()).join(' '),
      },
    ];
  }
  return Array.from(document.querySelectorAll('.search-list .content_list > li'), x => {
    return {
      title: x.querySelector('.title').textContent.trim(),
      subtitle: x.querySelector('.text').textContent.trim(),
      execution: [_ => `${HOST}${x.querySelector('a[href]').href}`],
    };
  });
}
module.exports = { search };
