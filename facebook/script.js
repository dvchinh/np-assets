(function() {
var Utils = {
  jsonReplacer: (key, value) => {
    if (value instanceof Function) {
      return 'FUNCTION';
    }
    if (value instanceof Map) {
      return {
        dataType: 'Map',
        value: Array.from(value.entries()),
      }
    }
    return value;
  },
  jsonReviser: (key, value) => {
    if (value !== null && typeof value === 'object' &&
        value.dataType === 'Map') {
      return new Map(value.value);
    }
    return value;
  },
  newGuid: () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
  timeout: (ms) => {
    if ('undefined' === typeof ms) { ms = 1000; }
    return new Promise(resolve => setTimeout(resolve, ms));
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
  getUrlParameter: (pName, pUrl) => {
    var value = null;
    var name = encodeURIComponent(pName).toLowerCase();
    var url = 'undefined' !== typeof pUrl ? pUrl : window.location.href;
    var reg = new RegExp("([^\\?#]*)(\\?[^#]*)?(#.*)?", "gi"), exec = reg.exec(url), search = exec[2];
    if ('undefined' !== typeof search) {
        var array = search.substr(1).split("&");
        for (i = 0; i < array.length; i++) {
            var item = array[i];
            var index = item.indexOf("=");
            if (item.substr(0, index).toLowerCase() === name) {
                value = item.substr(index + 1); break;
            }
        }
    }
    return value ? decodeURIComponent(value) : value;
  },
  setUrlParameter: (pName, pValue, pUrl) => {
    var value = ![undefined, null].includes(pValue) ? encodeURIComponent(pValue) : null;
    var name = encodeURIComponent(pName).toLowerCase();
    var url = 'undefined' !== typeof pUrl ? pUrl : window.location.href;
    var reg = new RegExp("([^\\?#]*)(\\?[^#]*)?(#.*)?", "gi"), exec = reg.exec(url), search = exec[2];
    var array = [], exist = false;
    if ('undefined' !== typeof search) {
        array = search.substr(1).split("&");
        for (i = 0; i < array.length; i++) {
            var item = array[i];
            var index = item.indexOf("=");
            var item_name = item.substr(0, index);
            if (item_name.toLowerCase() === name) {
                if (null !== value) {
                    array[i] = item_name + "=" + value;
                }
                if (null === value) {
                    array.splice(i, 1);
                }
                exist = true; break;
            }
        }
    }
    if (!exist && null !== value) {
        array.push(name + "=" + value);
    }
    return exec[1] + (array.length ? "?" : "") + array.join("&") + ('undefined' !== typeof exec[3] ? exec[3] : "");
  },
  isVisible: (element) => {
    if (element &&
        element.offsetWidth !== 0 ||
        element.offsetHeight !== 0) {
      return true;
    }
    return false;
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
  prototypeInit: () => {
    if (typeof String.prototype.npTrim === 'undefined') {
      String.prototype.npTrim = function (value) {
        let stripped = this;
        while (stripped.startsWith(value)) {
          stripped = stripped.substring(value.length);
        }
        while (stripped.endsWith(value)) {
          stripped = stripped.substring(0, stripped.length - value.length);
        }
        return stripped;
      }
    }
  }
};
Utils.prototypeInit();
var Facebook = {
  extractUI: () => {
    const util = Utils;
    let output = {};
    let url = util.getUrlInfo(location.href)['relative'];
    let match;
    if (/^\/reels\/create\/\?page_id=\d+&surface=PAGES$/.test(url)) {
      let create = {};

      let dprogress = util.getElementsByFn(element => {
        let label = element.getAttribute('aria-label') || '';
        let match = label.match(/tiến độ, bước (\d)\/\d/i);
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

      let derror = Array.from(document.querySelectorAll('[data-visualcompletion="ignore-dynamic"]')).filter(element => {
          let tname = element.nodeName.toLowerCase();
          if (!['svg'].includes(tname) &&
               util.isVisible(element)) {
            return true;
          }
          return false;
      })[0];
      if (derror) {
        create['error'] = derror.innerText;
      }

      output['reel-create'] = create;
    }
    match = url.match(/^\/reel\/(\d+)\/\?s=reel_composer$/);
    if (match) {
      let create = {};
      create['id'] = match[1];
      output['reel-create'] = create;
    }
    match = url.match(/^\/reel\/(\d+)$/);
    if (match) {
      let detail = {};
      detail['id'] = match[1];

      let comments = [];
      util.getElementsByFn(element => {
        let label = element.getAttribute('aria-label') || '';
        let match = label.match(/bình luận dưới tên (.+) vào (.+)/i);
        if (match) {
          let url = element.querySelector('a[aria-hidden="true"]')?.getAttribute('href');
          if (url) {
            let author_slug = util.getUrlInfo(url)['path'].npTrim('/'),
                author_name = match[1];
            let comment = {};
            comment['id'] = util.getUrlParameter('comment_id', url);
            comment['author'] = { 'slug': author_slug, 'name': author_name };
            comment['created-at'] = match[2];
            comment['d-comment'] = element;
            comments.push(comment);
            return true;
          }
        }
        return false;
      });
      detail['comments'] = comments;

      let dcomment_ico = util.getElementsByFn(element => {
        let label = (element.getAttribute('aria-label') || '').toLowerCase();
        if (label == 'bình luận') {
          return true;
        }
        return false;
      })[0];
      if (dcomment_ico) {
        detail['d-comment-ico'] = dcomment_ico;
      }

      let dcomment_editor = util.getElementsByFn(element => {
        let label = (element.getAttribute('aria-label') || '').toLowerCase();
        if (label == 'viết bình luận' &&
            util.isVisible(element)) {
          return true;
        }
        return false;
      })[0];
      if (dcomment_editor) {
        detail['d-comment-editor'] = dcomment_editor;
      }

      output['reel'] = detail;
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
  navToReel: async (rID) => {
    const util = Utils;
    let page_reel = `/reel/${rID}`;
    console.log('[ facebook ] nav-to-reel:start, url = %s', util.getUrlInfo(location.href)['relative']);
    if (location.pathname !== page_reel) {
      location.href = page_reel;
      do {
        console.warn('%s | waiting(because "." length is 1, the rest are 2)', new Date().toJSON());
        await util.timeout();
      } while (location.pathname !== page_reel);
    }
    console.log('[ facebook ] nav-to-reel:finish, url = %s', util.getUrlInfo(location.href)['relative']);
  },
  reelCreateS1Start: async () => {
    console.log('[ facebook ] reel-create-step-1st:start');
    const util = Utils;
    const $this = Facebook;
    let dtext = util.getElementsByText('thước phim')[0];
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

    let err = '', ui;
    do {
      ui = $this.extractUI();
      err = ui['reel-create']['error'];
      if (ui['reel-create']?.['step'] !== 1 ||
         !ui['reel-create']?.['next-active']) {
        console.warn('%s | waiting...(so dumb)', new Date().toJSON());
        await util.timeout();
      } else { break; }
    } while (true);
    console.log('[ facebook ] reel-create-step-2nd:finish, error = %s', err);
    return { 'error': err };
  },
  reelCreateS3Next: async () => {
    console.log('[ facebook ] reel-create-step-3rd:start');
    const util = Utils;
    const $this = Facebook;
    let ui = $this.extractUI();
    let dnext = ui['reel-create']['d-next'];
    dnext.dispatchEvent(new Event('click', { bubbles: true }));

    let err = '';
    while (ui['reel-create']?.['step'] !== 2) {
      console.warn('%s | waiting...(dispatch)', new Date().toJSON());
      await util.timeout();
      ui = $this.extractUI();
      err = ui['reel-create']['error'];
    }
    console.log('[ facebook ] reel-create-step-3rd:finish');
    return { 'error': err };
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
    if (task['status'] !== 'error') {
      await $this.reelCreateS1Start();
    }
    if (task['status'] !== 'error') {
      let { error } = await $this.reelCreateS2Upload(task);
      if (error) {
        task['output'] = { 'message': error };
        task['status'] = 'error';
      }
    }
    if (task['status'] !== 'error') {
      let { error } = await $this.reelCreateS3Next();
      if (error) {
        task['output'] = { 'message': error };
        task['status'] = 'error';
      }
    }
    if (task['status'] !== 'error') {
      await $this.reelCreateS4Next();
    }
    if (task['status'] !== 'error') {
      await $this.reelCreateS5Desc(task);
    }
    if (task['status'] !== 'error') {
      let rid = await $this.reelCreateS6Post();
      task['output'] = { 'reel-id': rid };
      task['status'] = 'processed';
    }
    console.log('[ facebook ] reel-create:finish, task =', task);
  },
  reelCommentS1Start: async () => {
    console.log('[ facebook ] reel-comment-step-1st:start');
    const util = Utils;
    const $this = Facebook;
    let ui = $this.extractUI();
    let dico = ui['reel']['d-comment-ico'];
    dico.dispatchEvent(new Event('click', { bubbles: true }));

    while (!ui['reel']['d-comment-editor']) {
      console.warn('%s | waiting...(ease human work)', new Date().toJSON());
      await util.timeout();
      ui = $this.extractUI();
    }
    console.log('[ facebook ] reel-comment-step-1st:finish');
  },
  reelCommentS2Write: async (task) => {
    console.log('[ facebook ] reel-comment-step-2nd:start');
    const util = Utils;
    const $this = Facebook;
    let ui = $this.extractUI();
    let deditor = ui['reel']['d-comment-editor'];
    deditor.setAttribute('name', 'np-reel-comment');
    let value = task['input']['comment-body'];
    main.add('wdriver', {
      'event': 'send.keys',
      'value': value,
      'options': { 'individual': { 'delay': 10 } },
      'selector': '[name="np-reel-comment"]'
    });

    while (deditor.getAttribute('np-status') !== 'done') {
      console.warn('%s | waiting...(How is everything there?)', new Date().toJSON());
      await util.timeout();
    }
    console.log('[ facebook ] reel-comment-step-2nd:finish');
  },
  reelCommentS3Post: async () => {
    console.log('[ facebook ] reel-comment-step-3rd:start');
    const util = Utils;
    const $this = Facebook;
    let ui = $this.extractUI();
    let deditor = ui['reel']['d-comment-editor'];
    deditor.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, view: window, bubbles: true, cancelable: true }));

    let c_id; while (!c_id) {
      console.warn('%s | waiting...(My big pleasure)', new Date().toJSON());
      await util.timeout();
      ui = $this.extractUI();
      c_id = ui['reel']?.['comments'][0]?.['id'];
    }
    console.log('[ facebook ] reel-comment-step-3rd:finish, comment-id = %s', c_id);
    return c_id;
  },
  reelComment: async (task) => {
    const $this = Facebook;
    task['status'] = 'processing';
    console.log('[ facebook ] reel-comment:start, task =', task);
    await $this.navToReel(task['input']['reel-id']);
    await $this.reelCommentS1Start();
    await $this.reelCommentS2Write(task);
    await $this.reelCommentS3Post();
    task['status'] = 'processed';
    console.log('[ facebook ] reel-comment:finish, task =', task);
  },
};
var Main = function() {
  this.queue = new Map([]);
  this.interval = 0;
  this.storageName = "np-facebook";
};
Main.prototype.add = function (type, input) {
  let id = Utils.newGuid();
  let item = { type, input, 'status': '' };
  this.queue.set(id, item);
  console.log('[ main ] add, id = %s, type = %s, input = %s', id, type, JSON.stringify(input, null, 0));
};
Main.prototype.check = async function() {
  const fb = Facebook;
  // console.warn('%s | main.check, checking...(technique)', new Date().toJSON());
  for (let [key, item] of this.queue) {
    let { type, status, recheck } = item;
    let fn; switch (type) {
      case 'facebook-reel-create':
        fn = fb.reelCreate; break;
      case 'facebook-reel-comment':
        fn = fb.reelComment; break;
      default:;
    }
    if (status === '' ||
        status === 'processing' && recheck) {
      fn?.(item);
    }
    delete item['recheck'];
  }
};
Main.prototype.start = function() {
  this.interval = setInterval(this.check.bind(this), 1000);
  console.log('[ main ] start, interval = %d', this.interval);

  this.restore();
  window.addEventListener('beforeunload', () => {
    this.store();
    // console.log('[ window ] event:beforeunload');
  });
  /* [ unnecessary ] window.addEventListener('unload', () => {
    console.log('[ window ] event:unload');
  });*/
};
Main.prototype.store = function () {
  const util = Utils;
  if (typeof(Storage) === 'undefined') {
      console.warn('Sorry ! No Web Storage support...'); return;
  }
  let store = {
    'queue': this.queue
  };
  let value = JSON.stringify(store, util.jsonReplacer, 0);
  sessionStorage.setItem(this.storageName, value);
};
Main.prototype.restore = function(name) {
  const util = Utils;
  if (typeof(Storage) === 'undefined') {
    console.warn('Sorry ! No Web Storage support...'); return;
  }
  let store = JSON.parse(sessionStorage.getItem(this.storageName), util.jsonReviser);
  let queue = store?.['queue'] || [];
  for (let [key, value] of queue) {
    value['recheck'] = true;
  }
  this.queue = new Map([...this.queue, ...queue]);
},
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
};
var main = new Main(); main.start();
window['NPUtils'] = Utils;
window['NPFacebook'] = Facebook;
window['NPMain'] = main;
})();