(function() {
var Utils = {
  timeout: (ms) => {
    if ('undefined' === typeof ms) { ms = 1000; }
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  newGuid: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  sanitizeHash: (text) => {
    let value = text;
    if (value) {
      value = value.replace(/(\S)#/g, '$1 #');
    }
    return value;
  },
  getUrlInfo: (pUrl) => {
    let url = (pUrl !== undefined && pUrl !== null) ? pUrl : window.location.href;
    let reg = new RegExp("(((https?):)?\/\/([^\/?#]+))?(\/[^?#]*)?(\\?[^#]*)?", "gi"), exec = reg.exec(url);
    let protocol = exec[3], host = exec[4], path = exec[5], search = exec[6], hash = exec[7];
    let relative = (path || "") + (search || "") + (hash || "");
    return {
      'url': url,
      'protocol': protocol,
      'host': host,
      'path': path,
      'search': search,
      'hash': hash,
      'relative': relative
    };
  },
  getElementsByFn: (fn, target) => {
    let elements = [];
    const $this = Utils;
    if ([ undefined, null ].includes(target)) {
      target = document.body;
    }
    if (fn(target)) {
      elements.push(target);
    }
    Array.from(target.children).forEach(element => {
      elements = elements.concat($this.getElementsByFn(fn, element));
    });
    return elements;
  },
  getElementsByText: (text, target) => {
    let elements = [];
    const $this = Utils;
    if ([ undefined, null ].includes(target)) {
      target = document.body;
    }
    let itext = (target.innerText || '').toLowerCase(),
        ihtml = (target.innerHTML || '').toLowerCase();
    if (ihtml == text) {
      elements.push(target);
    } else if (itext.indexOf(text) != -1) {
      Array.from(target.children).forEach(element => {
        elements = elements.concat($this.getElementsByText(text, element));
      });
    }
    return elements;
  },
};
var Facebook = {
  extractUI: () => {
    const util = Utils;
    let output = {};
    let url = util.getUrlInfo(location.href)['relative'];

    if (/^\/reels\/create\/\?page_id=\d+&surface=PAGES$/.test(url)) {
      let create = {};

      let dprogress = util.getElementsByFn(element => {
        let label = element.getAttribute('aria-label') || '';
        let match = label.match(/tiến độ, bước (\d)\/3/i);
        if (match) {
            create['step'] = parseInt(match[1]);
            return true;
        }
        return false;
      })[0];
      if (dprogress) {
        create['d-progress'] = dprogress;
      }

      let dtext = util.getElementsByText('tiếp')[0];
      let dnext = dtext?.closest('[tabindex]');
      if (dnext) {
        create['d-next'] = dnext;
        create['next-active'] = dnext.getAttribute('tabindex') === '0';
      }

      dtext = util.getElementsByText('đăng')[0];
      let dpost = dtext?.closest('[tabindex]');
      if (dpost) {
        create['d-post'] = dpost;
        create['post-active'] = dpost.getAttribute('tabindex') === '0';
      }

      let ddesc = document.querySelectorAll('[tabindex][role="textbox"]')[0];
      if (ddesc) {
        create['d-desc'] = ddesc;
      }

      output['reel-create'] = create;
    }
    let match = url.match(/^\/reel\/(\d+)\/\?s=reel_composer$/);
    if (match) {
      let create = {};
      create['id'] = match[1];
      output['reel-create'] = create;
    }
    return output;
  },
  navToHome: async () => {
    const util = Utils;
    let page_user = 'quachanhquachanh91';
    let page_home = `/${page_user}`;
    console.log('[ facebook ] nav-to-home:start, url = %s', util.getUrlInfo(location.href)['relative']);
    if (location.pathname !== page_home) {
      location.href = page_home;
      do {
        console.warn('%s | waiting...(make-up artist)', new Date().toJSON());
        await util.timeout();
      } while (location.pathname !== page_home);
    }
    console.log('[ facebook ] nav-to-home:finish, url = %s', util.getUrlInfo(location.href)['relative']);
  },
  reelCreateS1Start: async () => {
    console.log('[ facebook ] reel-create-step-1st:start');
    const util = Utils;
    const $this = Facebook;
    let dtext = util.getElementsByText('reel')[0];
    let darea = dtext?.closest('[tabindex]');
    darea.dispatchEvent(new Event('click', { bubbles: true }));

    do {
      let ui = $this.extractUI();
      if (ui['reel-create']?.['step'] !== 1) {
        console.warn('%s | waiting...(sellout)', new Date().toJSON());
        await util.timeout();
      } else { break; }
    } while (true);
    console.log('[ facebook ] reel-create-step-1st:finish');
  },
  reelCreateS2Upload: async (task) => {
    console.log('[ facebook ] reel-create-step-2nd:start');
    const util = Utils;
    const $this = Facebook;
    let dtext = util.getElementsByText('thêm video')[0];
    let darea = dtext.closest('[tabindex]');
    let dfile = darea.previousSibling;
    dfile.setAttribute('name', 'np-reel-upload');
    let value = `D:\\Projects\\np-tiktok\\video\\@quachanh91\\${task['input']['video-uid']}.mp4`;
    main.add('wdriver', {
      'event': 'send.keys',
      'value': value,
      'selector': '[name="np-reel-upload"]'
    });

    do {
      let ui = $this.extractUI();
      if (ui['reel-create']?.['step'] !== 1 ||
         !ui['reel-create']?.['next-active']) {
        console.warn('%s | waiting...(so dumb)', new Date().toJSON());
        await util.timeout();
      } else { break; }
    } while (true)
    console.log('[ facebook ] reel-create-step-2nd:finish');
  },
  reelCreateS3Next: async () => {
    console.log('[ facebook ] reel-create-step-3rd:start');
    const util = Utils;
    const $this = Facebook;
    let ui = $this.extractUI();
    let dnext = ui['reel-create']['d-next'];
    dnext.dispatchEvent(new Event('click', { bubbles: true }));

    while (ui['reel-create']?.['step'] !== 2) {
      console.warn('%s | waiting...(dispatch)', new Date().toJSON());
      await util.timeout();
      ui = $this.extractUI();
    }
    console.log('[ facebook ] reel-create-step-3rd:finish');
  },
  reelCreateS4Next: async () => {
    console.log('[ facebook ] reel-create-step-4th:start');
    const util = Utils;
    const $this = Facebook;
    let ui = $this.extractUI();
    let dnext = ui['reel-create']['d-next'];
    dnext.dispatchEvent(new Event('click', { bubbles: true }));

    while (ui['reel-create']?.['step'] !== 3) {
      console.warn('%s | waiting...(quite a while)', new Date().toJSON());
      await util.timeout();
      ui = $this.extractUI();
    }
    console.log('[ facebook ] reel-create-step-4th:finish');
  },
  reelCreateS5Desc: async (task) => {
    console.log('[ facebook ] reel-create-step-5th:start');
    const util = Utils;
    const $this = Facebook;
    let ui = $this.extractUI();
    let ddesc = ui['reel-create']['d-desc'];
    ddesc.setAttribute('name', 'np-reel-describe');
    let value = util.sanitizeHash(task['input']['video-desc']);
    main.add('wdriver', {
      'event': 'send.keys',
      'value': value,
      'options': { 'individual': { 'delay': 10 } },
      'selector': '[name="np-reel-describe"]'
    });

    while (ddesc.getAttribute('np-status') !== 'done') {
      console.warn('%s | waiting...(respective)', new Date().toJSON());
      await util.timeout();
    }
    console.log('[ facebook ] reel-create-step-5th:finish');
  },
  reelCreateS6Post: async () => {
    console.log('[ facebook ] reel-create-step-6th:start');
    const util = Utils;
    const $this = Facebook;
    let ui = $this.extractUI();
    let dpost = ui['reel-create']['d-post'];
    dpost.dispatchEvent(new Event('click', { bubbles: true }));

    let r_id; while (!r_id) {
      console.warn('%s | waiting...(bowl)', new Date().toJSON());
      await util.timeout();
      ui = $this.extractUI();
      r_id = ui['reel-create']?.['id'];
    }
    console.log('[ facebook ] reel-create-step-6th:finish, reel-id = %s', r_id);
    return r_id;
  },
  reelCreate: async (task) => {
    const $this = Facebook;
    task['status'] = 'processing';
    console.log('[ facebook ] reel-create:start, task =', task);
    await $this.navToHome();
    await $this.reelCreateS1Start();
    await $this.reelCreateS2Upload(task);
    await $this.reelCreateS3Next();
    await $this.reelCreateS4Next();
    await $this.reelCreateS5Desc(task);
    let rid = await $this.reelCreateS6Post();
    task['output'] = { 'reel-id': rid };
    task['status'] = 'processed';
    console.log('[ facebook ] reel-create:finish, task =', task);
  },
};
var Main = function() {
  this.queue = new Map([]);
  this.interval = 0;
};
Main.prototype.add = function (type, input) {
  let id = Utils.newGuid();
  let item = { type, input, 'status': '' };
  this.queue.set(id, item);
  console.log('[ main ] add, id = %s, type = %s, input = %s', id, type, JSON.stringify(input, null, 0));
};
Main.prototype.check = async function() {
  const fb = Facebook;
  console.warn('%s | main.check, checking...(technique)', new Date().toJSON());
  for (let [key, item] of this.queue) {
    let type = item['type'];
    let status = item['status'];
    if (type === 'facebook-reel-create') {
      if (status === '') {
        fb.reelCreate(item);
      }
    }
    if (type === 'wdriver') {
      if (status === '') {}
    }
  }
};
Main.prototype.start = function() {
  this.interval = setInterval(this.check.bind(this), 1000);
  console.log('[ main ] start, interval = %d', this.interval);
};
Main.prototype.wdriverList = function() {
  let list = [];
  for (let [key, value] of this.queue) {
    let { type, status } = value;
    if (type === 'wdriver' && status === '') {
      list.push([ key, value ]);
    }
  }
  return list;
};
Main.prototype.wdriverUpdate = function (key, value) {
  let item = this.queue.get(key);
  Object.assign(item, value);
}
var main = new Main(); main.start();
window['NPUtils'] = Utils;
window['NPFacebook'] = Facebook;
window['NPMain'] = main;
})();