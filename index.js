const axios = require('axios');
const { JSDOM } = require('jsdom');

async function search(query) {
  const HOST = 'http://dictionary.goo.ne.jp';
  const response = await axios(`${HOST}/srch/en/${encodeURIComponent(query)}/m0u/`);
  const dom = new JSDOM(response.data);
  const { document } = dom.window;

  const contentList = document.querySelector('.content_list');
  return Array.from(contentList ? contentList.children : [], x => {
    return {
      title: x.querySelector('.title').textContent.trim(),
      subtitle: x.querySelector('.text').textContent.trim(),
      execution: [_ => `${HOST}${x.querySelector('a[href]').href}`],
    };
  });
}
module.exports = { search };
