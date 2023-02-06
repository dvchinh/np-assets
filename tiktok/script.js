(function() {
var Utils = {
  assign: (target, ...sources) => {
    const ivalues = [ undefined ];
    Object.assign(target, ...sources.map(x =>
      Object.entries(x)
        .filter(([key, value]) => !ivalues.includes(value))
        .reduce((obj, [key, value]) => (obj[key] = value, obj), {})
    ));
    return target;
  },
  timeout: (ms) => {
    if ('undefined' === typeof ms) { ms = 1000; }
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  scrollToBottom: (options) => {
    let dmain = options?.dmain;
    if ('undefined' === typeof dmain) { dmain = null; }
    let h_unit = window.innerHeight;
    let h_main = dmain ? Math.round(dmain.getBoundingClientRect().height) : 0;
    let h_body = Math.max(Math.round(document.body.getBoundingClientRect().height), h_main);
    let bottom = 5 > (h_body - h_unit - window.scrollY);
    if (!bottom) {
      let coord_y = window.scrollY + 256 /* h_body - h_unit */;
      window.scrollTo(0, coord_y);
    }
    return bottom;
  },
};
var TikTok = {
  info: {
    'api-url': "http://localhost/np-shop-9link/np-ecommerce/api-prod.php",
    'api-key': "tiktok",
  },
  crawlPage: async () => {
    const $this = TikTok;
    await $this.loadItems();
    let { videos } = $this.extractPage();
    await $this.postVideos(videos);
  },
  loadItems: async () => {
    console.log("[ tiktok ] load-items:start");
    const dcontent = document.querySelector("[id='app']");
    while (!Utils.scrollToBottom({ dmain: dcontent })) {
      await Utils.timeout();
    }
    console.log("[ tiktok ] load-items:finish");
  },
  extractPage: () => {
    console.log("[ tiktok ] extract-page:start");
    const dcontent = document.querySelector("[id='app']");
    let dlist = dcontent.querySelector("[data-e2e='user-post-item-list']");
    let videos = Array.prototype.map.call(dlist.children, ditem => {
      let item = {};
      let dmain = ditem.querySelector("[data-e2e='user-post-item']");
      let ddesc = ditem.querySelector("[data-e2e='user-post-item-desc']");
      item['url'] = dmain.querySelector("a").getAttribute("href");
      item['desc'] = ddesc?.innerText;
      item['views'] = dmain.querySelector("[data-e2e='video-views']").innerHTML;
      item['cover'] = dmain.querySelector("img").getAttribute("src");
      let match = item['url'].match(/@(\w+)\/video\/(\d+)/);
      item['uid'] = match[2];
      item['author-slug'] = match[1];
      return item;
    });
    console.log("[ tiktok ] extract-page:finish | videos =", videos);
    return { videos };
  },
  postVideos: async (videos) => {
    console.log(`[ tiktok ] post-videos:start`);
    const { info } = TikTok;
    let url = `${info['api-url']}?api-key=${info['api-key']}&api-action=video-add`;
    for (let [i, video] of videos.reverse().entries()) {
      let count = i + 1;
      let datap = {
        'video-uid': video['uid'],
        'video-url': video['url'],
        'video-desc': video['desc'],
        'video-views': video['views'],
        'video-cover': video['cover'],
        'author-slug': video['author-slug'],
      };
      let request = await fetch(`${url}&r=${Math.random()}`, { method: "post", body: JSON.stringify(datap, null, 0) });
      let response = await request.json();
      video['api-result'] = response;
      if (count % 25 === 0) {
        console.log(`[ tiktok ] ${count}/${videos.length} video(s) have been processed.`);
      }
      await Utils.timeout();
    };
    console.log(`[ tiktok ] post-videos:finish | ${videos.length} video(s)`);
  },
};
window['NPUtils'] = Utils;
window['NPTikTok'] = TikTok;
})();