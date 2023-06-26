(function() {
var Utils = function() {
  this.jsonReplacer = (key, value) => {
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
  };
  this.jsonReviser = (key, value) => {
    if (value !== null && typeof value === 'object' &&
        value.dataType === 'Map') {
      return new Map(value.value);
    }
    if (typeof value === 'string' &&
        // template: "yyyy-MM-ddTHH:mm:ss[|.number][|Z]"
        /^([1-9]\d{3})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9]):([0-5][0-9])((\.\d+)?)(Z?)$/.test(value)) {
      let time = new Date(value).getTime();
      return new Date(time);
    }
    return value;
  };
  this.newGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };
  this.isNumber = (number, options) => {
    let valid = /^\d+(\.\d+)?$/.test(number);
    if (valid) {
      number = parseFloat(number);
      if (options?.['greater-than'] !== undefined) {
        valid = number > options['greater-than'];
      }
    }
    return valid;
  };
  this.isEmail = (email) => {
    return /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/.test(email);
  };
  this.isPhone = (phone) => {
    let digits = phone.replace(/[^\d]/g, '');
    return digits.length > 6 && /^[\d() \-+]+$/.test(phone); 
  };
  this.wait = async (fn) => {
    let done = false;
    do {
       done = await fn();
      !done && await this.timeout();
    } while (!done);
  };
  this.timeout = (ms) => {
    if ('undefined' === typeof ms) { ms = 1000; }
    return new Promise(resolve => setTimeout(resolve, ms));
  };
  this.sanitizeDesc = (text) => {
    let value = text;
    if (value) {
      value = value.replace(/(\S)#/g, '$1 #');
      value = value.replace(/ {2,}/g, ' ');
    }
    return value;
  };
  this.getUrlInfo = (pUrl) => {
    let url = (pUrl !== undefined && pUrl !== null) ? pUrl : window.location.href;
    let reg = new RegExp("^(?:(?:([a-z]+):)?//([^/?#]+))?(/[^?#]*)?(\\?[^#]*)?(#.*)?$", "gi"), exec = reg.exec(url);
    let protocol = exec[1], host = exec[2], path = exec[3], search = exec[4], hash = exec[5];
    let relative = (path || "") + (search || "") + (hash || "");
    let path_parts = path ? path.split('/').filter(x => x.length) : [];
    let hostname, port;
    if (host) {
      let arr = host.split(':');
      hostname = arr[0], port = arr[1];
    }
    return {
      'url': url,
      'protocol': protocol,
      'host': host,
      'path': path,
      'search': search,
      'hash': hash,
      'relative': relative,
      'path-parts': path_parts,
      'port': port,
      'hostname': hostname,
    };
  };
  this.getUrlParameter = (pName, pUrl) => {
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
  };
  this.setUrlParameter = (pName, pValue, pUrl) => {
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
  };
  this.isVisible = (element) => {
    if (element && (
        element.offsetWidth !== 0 ||
        element.offsetHeight !== 0)) {
      return true;
    }
    return false;
  };
  this.hasScrollBar = (element) => {
    let hwindow = window.innerHeight,
        hscroll = element.scrollHeight,
        hclient = element.clientHeight;
    let scroll =
        hscroll > hwindow &&
        hscroll - hclient > 32;
    return scroll;
  };
  this.getElementsByFn = (fn, target) => {
    let elements = [];
    if ([ undefined, null ].includes(target)) {
      target = document.body;
    }
    if (fn(target)) {
      elements.push(target);
    }
    Array.from(target.children).forEach(element => {
      elements = elements.concat(this.getElementsByFn(fn, element));
    });
    return elements;
  };
  this.getElementsByText = (texts, target) => {
    let elements = [];
    if (typeof texts === 'string') {
      texts = [ texts ];
    }
    for (let text of texts) {
      if ([ undefined, null ].includes(target)) {
        target = document.body;
      }
      let itext = (target.innerText || '').toLowerCase(),
          ihtml = (target.innerHTML || '').toLowerCase();
      if (ihtml == text) {
        elements.push(target);
      } else if (itext.indexOf(text) != -1) {
        Array.from(target.children).forEach(element => {
          elements = elements.concat(this.getElementsByText(text, element));
        });
      }
    }
    return elements;
  };
  this.scrollToBottom = (options) => {
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
  };
  this.scrollToBottomEle = (options) => {
    let $container = options.$container,
        $content = $container.children[0];

    let unit = $container.clientHeight,
        rect = $content.getBoundingClientRect();

    let bottom = 5 > Math.round(rect.bottom) - unit;
    if (!bottom) {
      let coord_y = Math.abs(rect.top) + 256;
      $container.scrollTo(0, coord_y);
    }
    return bottom;
  };
  this.init();
};
Utils.prototype.init = () => {
  if (typeof String.prototype.npTrim === 'undefined') {
    String.prototype.npTrim = function (value) {
      let stripped = this;
      if (value) {
        while (stripped.startsWith(value)) {
          stripped = stripped.substring(value.length);
        }
        while (stripped.endsWith(value)) {
          stripped = stripped.substring(0, stripped.length - value.length);
        }
        return stripped;
      }
      if (!value) {
        stripped = stripped
          .replace(/\u200B/g, '') /* zero-width space */
          .trim();
        return stripped;
      }
    }
  }
};
window['NPUtils'] = new Utils();
document.dispatchEvent(new CustomEvent('np:lib-utils', { bubbles: true, detail: window['NPUtils'] }));
})();

(function() {
var Facebook = function() {
  this.util = window['NPUtils'];
  this.main = window['NPMain'];
  this.config = {};
  this.init();
};
Facebook.prototype.init = function() {
  window.addEventListener('np:lib-utils', e => {
    this.util = e.detail;
  });
  window.addEventListener('np:lib-main', e => {
    this.main = e.detail;
  });
};
Facebook.prototype.extractUI = function() {
  let uinfo = this.util.getUrlInfo(location.href);
  let uhost = uinfo['host'];
  if (uhost === 'www.facebook.com') {
    return this.extractUIStoreF({ uinfo });
  }
  if (uhost === 'business.facebook.com') {
    return this.extractUIBusiness({ uinfo });
  }
};
Facebook.prototype.extractUIStoreF = function ({ uinfo }) {
  let output = {};
  let url = uinfo['relative'];
  let match, reg, exec;
  if (/^\/reels\/create\/\?page_id=\d+&surface=PAGES$/.test(url) ||
     (/^\/reels\/create\/\?surface=ADDL_PROFILE_PLUS$/.test(url))) {
    let create = {};

    let dprogress = this.util.getElementsByFn(element => {
      let label = element.getAttribute('aria-label') || '';
      let match = label.match(/tiến độ, bước (\d)\/(\d)/i);
      if (match) {
          create['step'] = parseInt(match[1]);
          create['total'] = parseInt(match[2]);
          return true;
      }
      return false;
    })[0];
    if (dprogress) {
      create['d-progress'] = dprogress;
    }

    let dtext = this.util.getElementsByText('tiếp')[0];
    let dnext = dtext?.closest('[tabindex]');
    if (dnext) {
      create['d-next'] = dnext;
      create['next-active'] = dnext.getAttribute('tabindex') === '0';
    }

    dtext = this.util.getElementsByText('đăng')[0];
    let dpost = dtext?.closest('[tabindex]');
    if (dpost) {
      create['d-post'] = dpost;
      create['post-active'] = dpost.getAttribute('tabindex') === '0';
    }

    let ddesc = Array.from(document.querySelectorAll('[tabindex][role="textbox"]')).filter(element => {
      let label = (element.getAttribute('aria-label') || '').toLowerCase();
      if (label === 'mô tả thước phim của bạn...' &&
          this.util.isVisible(element)) {
        return true;
      }
      return false;
    })[0];
    if (ddesc) {
      create['d-desc'] = ddesc;
    }

    let derror = Array.from(document.querySelectorAll('[data-visualcompletion="ignore-dynamic"]')).filter(element => {
        let tname = element.nodeName.toLowerCase();
        if (!['svg'].includes(tname) &&
             this.util.isVisible(element)) {
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

    let $video = document.querySelector('[data-pagelet="Reels"]');
    if (!$video) { $video = document.querySelector('[data-video-id]'); }
    let $cover = $video.closest('[role="button"]').querySelector('.__fb-dark-mode');
    let $desc = $cover.querySelector('span[dir="auto"]');
    detail['desc'] = $desc.innerText;

    let comments = [];
    this.util.getElementsByFn(element => {
      let label = element.getAttribute('aria-label') || '';
      let match = label.match(/bình luận dưới tên (.+) vào (.+)/i);
      if (match) {
        let url = element.querySelector('a[aria-hidden="true"]')?.getAttribute('href');
        if (url) {
          let author_slug = this.util.getUrlInfo(url)['path'].npTrim('/'),
              author_name = match[1];
          let comment = {};
          comment['id'] = this.util.getUrlParameter('comment_id', url);
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

    let dlike_ico = this.util.getElementsByFn(element => {
      let label = (element.getAttribute('aria-label') || '').toLowerCase();
      if (['thích', 'nút thích đang hoạt động'].includes(label)) {
        return true;
      }
      return false;
    })[0];
    if (dlike_ico) {
      detail['d-like-ico'] = dlike_ico;
    }

    let dcomment_ico = this.util.getElementsByFn(element => {
      let label = (element.getAttribute('aria-label') || '').toLowerCase();
      if (label == 'bình luận') {
        return true;
      }
      return false;
    })[0];
    if (dcomment_ico) {
      detail['d-comment-ico'] = dcomment_ico;
    }

    let dcomment_editor = this.util.getElementsByFn(element => {
      let label = (element.getAttribute('aria-label') || '').toLowerCase();
      if (label == 'viết bình luận' &&
          this.util.isVisible(element)) {
        return true;
      }
      return false;
    })[0];
    if (dcomment_editor) {
      detail['d-comment-editor'] = dcomment_editor;
    }

    output['reel'] = detail;
  }
  reg = new RegExp('^\/'.concat(this.config['profile-user'], '$'), 'gi'), exec = reg.exec(url);
  if (exec) {
    let reels = [];
    document.querySelectorAll('[aria-posinset]').forEach($area => {
      let $content = $area.querySelector('div[id^=":r"], div[id^=":R"]');
      let $link = null;
      $content.querySelectorAll('a[aria-label]').forEach($item => {
        let label = ($item.getAttribute('aria-label') || '').toLowerCase();
        if (label === 'mở thước phim trong công cụ xem của reels') {
          $link = $item;
        }
      }); if (!$link) { return; }
      let $desc = $link.querySelectorAll('span[dir="auto"]')[0];
      let desc = $desc.innerText;
      let link = $link.getAttribute('href');
      let uparts = this.util.getUrlInfo(link)['path-parts'];
      if (uparts[0] === 'reel') {
        let rid = uparts[1];
        reels.push({ 'id': rid, 'desc': desc });
      }
    });

    output['home'] = { 'reels': reels };
  }

  let $profile_img = this.util.getElementsByFn(element => {
    let label = (element.ariaLabel || '').toLowerCase();
    if (label === 'trang cá nhân của bạn' && element.role === 'img') {
      return true;
    }
    return false;
  })[0];
  if ($profile_img) {
    let profile = {};
    profile['$img'] = $profile_img;

    let $dialog = this.util.getElementsByFn(element => {
      let label = (element.ariaLabel || '').toLowerCase();
      if (label === 'trang cá nhân của bạn' && element.role === 'dialog') {
        return true;
      }
      return false;
    })[0];
    if ($dialog) {
      profile['$dialog'] = $dialog;
      let $me = $dialog.querySelector('[role="link"][href="/me/"]');
      if ($me) { profile['me'] = { 'name': $me.textContent, '$': $me }; }
      let $view_all = this.util.getElementsByText('xem tất cả trang cá nhân', $dialog)[0];
      if ($view_all) { profile['$view-all'] = $view_all; }
      let list = [];
      for (let $item of $dialog.querySelectorAll('[role="radio"]')) {
        let item = { '$': $item };
        item['name'] = $item.querySelector('[dir="auto"]').innerText;
        item['selected'] = $item.ariaChecked === 'true';
        list.push(item);
      }
      profile['list'] = list;
    }
    output['profile'] = profile;
  }
  return output;
};
Facebook.prototype.extractUIBusiness = function ({ uinfo }) {
  var fn_headings = function ($section) {
    let list = [];
    for (let $item of $section.querySelectorAll('[role="heading"][aria-level]')) {
      let label = $item.innerText.npTrim().toLowerCase();
      let level = parseInt($item.ariaLevel);
      list.push({ label, level });
    }
    return list;
  };
  let output = {};
  let upath = uinfo['path'];
  if (upath === '/latest/home') {
    let $section;
    let $scroll = this.util.getElementsByFn(element => {
      return this.util.hasScrollBar(element);
    })[0];
    if ($scroll) {
      output['$scrollbar'] = $scroll;
    }

    $section = document.querySelector('[data-pagelet="BizKitAudienceGrowthCardRenderer"]');
    if ($section) {
      let section = {};
      section['$pagelet'] = $section;
      section['headings'] = fn_headings($section);
      for (let $button of $section.querySelectorAll('[role="button"][aria-busy="false"]')) {
        let label = $button.innerText.toLowerCase();
        if (['invite friends', 'mời bạn bè', 'bắt đầu'].includes(label)) {
          section['$invite-friends'] = $button;
        }
        if (['send invites', 'gửi lời mời'].includes(label)) {
          section['$send-invites'] = $button;
        }
      }

      let $popup = document.querySelector('body > [data-visualcompletion="ignore"]');
      if ($popup) {
        section['$popup'] = $popup;
        for (let $button of $popup.querySelectorAll('[role="button"][aria-busy]')) {
          let label = $button.innerText.npTrim().toLowerCase();
          if (['close', 'đóng'].includes(label)) {
            section['$popup-close'] = $button;
          }
          if (['cancel', 'hủy'].includes(label)) {
            if (section['$popup-cancel']) {
              section['$popup-cancel-confirm'] = section['$popup-cancel'];
            }
            section['$popup-cancel'] = $button;
          }
          if (['send invite', 'gửi lời mời', 'invite friend', 'mời bạn bè'].some(text => {
            let matched = label.startsWith(text);
            if (matched) {
              let match = label.match(/\d+/g);
              let invites = parseInt(match?.[0]) || 0;
              section['popup-invites'] = invites;
            }
            return matched;
          })) {
            if (section['$popup-submit']) {
              section['$popup-submit-confirm'] = section['$popup-submit'];
            }
            section['$popup-submit'] = $button;
          }
          if (['tạo bài viết'].includes(label)) {
            section['$popup-create-post'] = $button;
          }
        }
        section['popup-headings'] = fn_headings($popup);
        section['$popup-all'] = $popup.querySelector('input[type="checkbox"][name="select all"]');
        section['$popup-list'] = $popup.querySelectorAll('input[type="checkbox"][name="select user"]');
      }
      output['audience-growth'] = section;
    }

    $section = document.querySelector('[data-pagelet="BizKitProductUpdatesCardRenderer"]');
    if ($section) {
      let section = {};
      section['$pagelet'] = $section;
      section['headings'] = fn_headings($section);
      output['product-updates'] = section;
    }
  }
  return output;
};
Facebook.prototype.findProfile = function ({ name, user }) {
  const list = [
    { name: 'Makeup Artist VN', user: 'makeup.artist.plus'},
    { name: 'Trang Lê' },
    { name: 'Cười VN - plus', user: 'cuoi.vn.plus' },
    { name: 'The Beauty Of Fish', user: 'the.beauty.fish' },
    { name: 'Quỳnh Thi' },
    { name: 'Fashion VN', user: 'fashion.vn.plus' },
    { name: 'Trần Phước' },
  ];
  let result;
  if ('undefined' !== typeof name) {
    result = list.find(item => item.name === name);
  }
  if ('undefined' !== typeof user) {
    result = list.find(item => item.name === name);
  }
  return result || null;
};
Facebook.prototype.setConfig = function (options) {
  if (!['undefined', 'string'].includes(typeof options)) {
    let clone = JSON.parse(JSON.stringify(options));
    Object.assign(this.config, clone);
  }
};
Facebook.prototype.setProfile = async function (task, user) {
  console.log('[ facebook ] set-profile:start');
  let next = true, error = '';
  if (this.config['profile-user'] === user) {
    console.warn(`[ facebook ] The profile is matched with the current, user = ${user}`);
    next = false;
  }
  if (next) {
    let profile = this.extractUI()['profile'];
    profile['$img'].dispatchEvent(new CustomEvent('click', { bubbles: true }));
    await this.util.wait(() => {
      profile = this.extractUI()['profile'];
      console.warn('%s | waiting...(probation)', new Date().toJSON());
      return profile['$dialog'];
    });

    let pme = profile['me'];
    let fme = this.findProfile({ name: pme.name });
    if (fme.user === user) {
      console.warn(`[ facebook ] The profile has been selected, user = ${user}`);
      this.setConfig({ 'profile-user': user });
      next = false;
    }
    if (next) {
      profile['$view-all'].dispatchEvent(new CustomEvent('click', { bubbles: true }));
      await this.util.wait(() => {
        profile = this.extractUI()['profile'];
        console.warn('%s | waiting...(court)', new Date().toJSON());
        return profile['list'].length;
      });

      let pitem;
      if (profile['list'].some(item => {
        pitem = this.findProfile({ name: item.name});
        let matched = pitem?.user === user;
        if (matched) { pitem.$ = item.$; }
        return matched;
      })) {
        pitem.$.dispatchEvent(new CustomEvent('click', { bubbles: true }));
        task['steps'].push('profile:waiting');
        await this.util.wait(() => {
          console.warn('%s | waiting...(embarrass)', new Date().toJSON());
        });
      } else {
        error = `The profile could not be found, user = ${user}`;
        console.warn(`[ facebook ] ${error}`);
        next = false;
      }
    }
    profile['$img'].dispatchEvent(new CustomEvent('click', { bubbles: true }));
    await this.util.wait(() => {
      profile = this.extractUI()['profile'];
      console.warn('%s | waiting...(patch)', new Date().toJSON());
      return !profile['$dialog'];
    });
  }
  console.log('[ facebook ] set-profile:finish');
  task['steps'].push('profile');
  return { error };
};
Facebook.prototype.navToHome = async function (task) {
  let page_home = `/${this.config['profile-user']}`;
  console.log('[ facebook ] nav-to-home:start, url = %s', this.util.getUrlInfo(location.href)['relative']);
  if (location.pathname !== page_home) {
    location.href = page_home;
    do {
      console.warn('%s | waiting...(make-up artist)', new Date().toJSON());
      await this.util.timeout();
    } while (location.pathname !== page_home);
  }
  task['steps'].push('entry');
  console.log('[ facebook ] nav-to-home:finish, url = %s', this.util.getUrlInfo(location.href)['relative']);
};
Facebook.prototype.navToReel = async function (rID) {
  let page_reel = `/reel/${rID}`;
  console.log('[ facebook ] nav-to-reel:start, url = %s', this.util.getUrlInfo(location.href)['relative']);
  if (location.pathname !== page_reel) {
    location.href = page_reel;
    do {
      console.warn('%s | waiting(because "." length is 1, the rest are 2)', new Date().toJSON());
      await this.util.timeout();
    } while (location.pathname !== page_reel);
  }
  console.log('[ facebook ] nav-to-reel:finish, url = %s', this.util.getUrlInfo(location.href)['relative']);
};
Facebook.prototype.reelCreateS1Start = async function (task) {
  console.log('[ facebook ] reel-create-step-1st:start');
  let dtext; do {
    await this.util.timeout();
    dtext = this.util.getElementsByText(['reel', 'thước phim'])[0];
    if (!dtext) {
      console.warn('%s | waiting...(personal income tax finalization)', new Date().toJSON());
    }
  } while (!dtext);
  let darea = dtext?.closest('[tabindex]');
  darea.dispatchEvent(new Event('click', { bubbles: true }));

  do {
    let ui = this.extractUI();
    if (ui['reel-create']?.['step'] !== 1) {
      console.warn('%s | waiting...(sellout)', new Date().toJSON());
      await this.util.timeout();
    } else { break; }
  } while (true);
  task['steps'].push('start');
  console.log('[ facebook ] reel-create-step-1st:finish');
};
Facebook.prototype.reelCreateS2Upload = async function (task) {
  console.log('[ facebook ] reel-create-step-2nd:start');
  let dtext = this.util.getElementsByText('thêm video')[0];
  let darea = dtext.closest('[tabindex]');
  let dfile = darea.previousSibling;
  dfile.setAttribute('name', 'np-reel-upload');
  let value = task['input']['video-path'];
  this.main.add('wdriver', {
    'event': 'send.keys',
    'value': value,
    'selector': '[name="np-reel-upload"]'
  });

  let err = '', ui;
  do {
    ui = this.extractUI();
    err = ui['reel-create']['error'];
    if (ui['reel-create']?.['step'] !== 1 ||
       !ui['reel-create']?.['next-active']) {
      console.warn('%s | waiting...(so dumb)', new Date().toJSON());
      await this.util.timeout();
    } else { break; }
  } while (true);
  task['steps'].push('upload');
  console.log('[ facebook ] reel-create-step-2nd:finish, error = %s', err);
  return { 'error': err };
};
Facebook.prototype.reelCreateS3Next = async function (task) {
  console.log('[ facebook ] reel-create-step-3rd:start');
  let ui = this.extractUI();
  let dnext = ui['reel-create']['d-next'];
  dnext.dispatchEvent(new Event('click', { bubbles: true }));

  let err = '';
  while (ui['reel-create']?.['step'] !== 2) {
    console.warn('%s | waiting...(dispatch)', new Date().toJSON());
    await this.util.timeout();
    ui = this.extractUI();
    err = ui['reel-create']['error'];
  }
  task['steps'].push('next-1');
  console.log('[ facebook ] reel-create-step-3rd:finish, error = %s', err);
  return { 'error': err };
};
Facebook.prototype.reelCreateS4Next = async function (task) {
  console.log('[ facebook ] reel-create-step-4th:start');
  let ui = this.extractUI();
  if (ui['reel-create']['total'] === 3) {
    let dnext = ui['reel-create']['d-next'];
    dnext.dispatchEvent(new Event('click', { bubbles: true }));

    await this.util.wait(() => {
      ui = this.extractUI();
      return ui['reel-create']?.['step'] === 3;
    });
  } else {
    console.log('%s | ignored...(quite a while)', new Date().toJSON());
  }
  task['steps'].push('next-2');
  console.log('[ facebook ] reel-create-step-4th:finish');
};
Facebook.prototype.reelCreateS5Desc = async function (task) {
  console.log('[ facebook ] reel-create-step-5th:start');
  let ui = this.extractUI();
  let ddesc = ui['reel-create']['d-desc'];
  ddesc.setAttribute('name', 'np-reel-describe');
  let value = this.util.sanitizeDesc(task['input']['video-desc']);
  this.main.add('wdriver', {
    'event': 'send.keys',
    'value': value,
    'selector': '[name="np-reel-describe"]'
  });
  task['input']['video-desc'] = value;

  await this.util.wait(() => {
    ui = this.extractUI();
    return ddesc.getAttribute('np-status') === 'done' &&
      (value === '' || ddesc.innerText === value);
  });
  task['steps'].push('desc');
  console.log('[ facebook ] reel-create-step-5th:finish');
};
Facebook.prototype.reelCreateS6Post = async function (task) {
  console.log('[ facebook ] reel-create-step-6th:start');
  let ui = this.extractUI();
  if (!task['steps'].includes('post:waiting')) {
    let dpost = ui['reel-create']['d-post'];
    dpost.dispatchEvent(new Event('click', { bubbles: true }));
    task['steps'].push('post:waiting');
  }

  let r_id = null, reel;
  await this.util.wait(async () => {
    ui = this.extractUI();
    if (ui.hasOwnProperty('home')) {
      reel = ui['home']['reels']?.[0];
    }
    if (ui.hasOwnProperty('reel')) {
      reel = ui['reel'];
      console.log('[ facebook ] It is navigated to the reel details page.');
    }
    if (reel) {
      let rdesc = reel['desc'].replace(/(… xem thêm$)|( ẩn bớt$)/i, '');
      let idesc = task['input']['video-desc'];
      if (reel && (
          idesc === '' && rdesc === '' ||
          idesc !== '' && idesc.startsWith(rdesc))) {
        r_id = reel['id'];
      } else {
        await this.util.timeout(10 * 1000);
        location.reload();
      }
    }
    if (ui.hasOwnProperty('reel-create')) {
      r_id = ui['reel-create']['id'];
    }
    return r_id;
  });
  task['steps'].push('post');
  console.log('[ facebook ] reel-create-step-6th:finish, reel-id = %s', r_id);
  return r_id;
};
Facebook.prototype.reelCreate = async function (task) {
  task['status'] = 'processing';
  task['start-at'] = task['start-at'] || new Date();
  console.log('[ facebook ] reel-create:start, task =', task);
  let puser = task['input']['profile-user'];
  let time_max = 5 * 60;
  let time_elapsed = new Date() - task['start-at'];
  let timeout = setTimeout(() => {
    task['output'] = { 'message': `Task timed out after ${time_max} seconds.` };
    task['status'] = 'error';
    fn_finish();
  }, time_max * 1000 - time_elapsed);
  var fn_finish = () => {
    clearTimeout(timeout);
    task['finish-at'] = new Date();
    console.log('[ facebook ] reel-create:finish, task =', task);
    document.dispatchEvent(new CustomEvent('fb:reel-create', { bubbles: true, detail: task }));
  };
  if (task['status'] !== 'error' && !task['steps'].includes('post:waiting')) {
    let { error } = await this.setProfile(task, puser);
    if (error) {
      task['output'] = { 'message': error };
      task['status'] = 'error';
    }
  }
  if (task['status'] !== 'error' && !task['steps'].includes('post:waiting')) {
    await this.navToHome(task);
  }
  if (task['status'] !== 'error' && !task['steps'].includes('post:waiting')) {
    await this.reelCreateS1Start(task);
  }
  if (task['status'] !== 'error' && !task['steps'].includes('post:waiting')) {
    let { error } = await this.reelCreateS2Upload(task);
    if (error) {
      task['output'] = { 'message': error };
      task['status'] = 'error';
    }
  }
  if (task['status'] !== 'error' && !task['steps'].includes('post:waiting')) {
    let { error } = await this.reelCreateS3Next(task);
    if (error) {
      task['output'] = { 'message': error };
      task['status'] = 'error';
    }
  }
  if (task['status'] !== 'error' && !task['steps'].includes('post:waiting')) {
    await this.reelCreateS4Next(task);
  }
  if (task['status'] !== 'error' && !task['steps'].includes('post:waiting')) {
    await this.reelCreateS5Desc(task);
  }
  if (task['status'] !== 'error' && !task['steps'].includes('post')) {
    let rid = await this.reelCreateS6Post(task);
    task['output'] = { 'reel-id': rid };
    task['status'] = 'processed';
  }
  fn_finish();
};
Facebook.prototype.reelCommentS1Start = async function() {
  console.log('[ facebook ] reel-comment-step-1st:start');
  let ui = this.extractUI();
  if (!ui['reel']['d-comment-editor']) {
    let dico = ui['reel']['d-comment-ico'];
    dico.dispatchEvent(new Event('click', { bubbles: true }));
  }
  await this.util.wait(() => {
    ui = this.extractUI();
    return ui['reel']['d-comment-editor'];
  });
  console.log('[ facebook ] reel-comment-step-1st:finish');
};
Facebook.prototype.reelCommentS2Write = async function (task) {
  console.log('[ facebook ] reel-comment-step-2nd:start');
  let ui = this.extractUI();
  let deditor = ui['reel']['d-comment-editor'];
  deditor.setAttribute('name', 'np-reel-comment');
  let value = task['input']['comment-body'];
  this.main.add('wdriver', {
    'event': 'send.keys',
    'value': value,
    'options': { 'individual': { 'delay': 10 } },
    'selector': '[name="np-reel-comment"]'
  });

  while (deditor.getAttribute('np-status') !== 'done') {
    console.warn('%s | waiting...(How is everything there?)', new Date().toJSON());
    await this.util.timeout();
  }
  console.log('[ facebook ] reel-comment-step-2nd:finish');
};
Facebook.prototype.reelCommentS3Post = async function() {
  console.log('[ facebook ] reel-comment-step-3rd:start');
  let ui = this.extractUI();
  let deditor = ui['reel']['d-comment-editor'];
  deditor.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 13, view: window, bubbles: true, cancelable: true }));

  let c_id; while (!c_id) {
    console.warn('%s | waiting...(My big pleasure)', new Date().toJSON());
    await this.util.timeout();
    ui = this.extractUI();
    c_id = ui['reel']?.['comments'][0]?.['id'];
  }
  console.log('[ facebook ] reel-comment-step-3rd:finish, comment-id = %s', c_id);
  return c_id;
};
Facebook.prototype.reelCommentS4Like = async function() {
  console.log('[ facebook ] reel-comment-step-4th:start');
  let ui = this.extractUI();
  let dico = ui['reel']['d-like-ico'];
  if (dico.getAttribute('aria-label').toLowerCase() === 'thích') {
    dico.dispatchEvent(new Event('click', { bubbles: true }));
  }

  await this.util.wait(() => {
    ui = this.extractUI();
    dico = ui['reel']['d-like-ico'];
    return dico.getAttribute('aria-label').toLowerCase() === 'nút thích đang hoạt động';
  });
  console.log('[ facebook ] reel-comment-step-4th:finish');
};
Facebook.prototype.reelComment = async function (task) {
  task['status'] = 'processing';
  console.log('[ facebook ] reel-comment:start, task =', task);
  let puser = task['input']['profile-user'];
  if (task['status'] !== 'error') {
    let { error } = await this.setProfile(task, puser);
    if (error) {
      task['output'] = { 'message': error };
      task['status'] = 'error';
    }
  }
  if (task['status'] !== 'error') {
    await this.navToReel(task['input']['reel-id']);
  }
  if (task['status'] !== 'error') {
    await this.reelCommentS1Start();
  }
  if (task['status'] !== 'error') {
    await this.reelCommentS2Write(task);
  }
  if (task['status'] !== 'error') {
    let cid = await this.reelCommentS3Post();
    await this.reelCommentS4Like();
    task['output'] = { 'comment-id': cid };
    task['status'] = 'processed';
  }
  console.log('[ facebook ] reel-comment:finish, task =', task);
  document.dispatchEvent(new CustomEvent('fb:reel-comment', { bubbles: true, detail: task }));
};
Facebook.prototype.renderAudienceGrowth = async function (task) {
  let ui = null, audience;
  let stop = false, bottom = false;
  do {
    ui = this.extractUI();
    audience = ui['audience-growth'];
    // [unused] stop = audience?.['$invite-friends'] || audience?.['$send-invites'];
    stop = audience?.['headings'].length || ui['product-updates'];
    if (!stop) {
      bottom = this.util.scrollToBottomEle({ $container: ui['$scrollbar'] });
      await this.util.timeout();
    }
    console.warn('%s | waiting...(clue)', new Date().toJSON());
  } while (!stop);

  if (!audience) {
    task['output'] = { 'message': 'The [audience growth] section could not be found.' };
    task['status'] = 'error'; return;
  }
};
Facebook.prototype.sendInviteOpen = async function (task) {
  let event = task?.['input']['event'];
  let ui = this.extractUI();
  let audience = ui['audience-growth'];
  let $click = event === 'invite-react' ?
      audience['$send-invites'] : audience['$invite-friends'];
  if (!$click) {
    task['output'] = { 'message': 'This feature is currently unavailable.' };
    task['status'] = 'error'; return;
  }
  $click.dispatchEvent(new Event('click', { bubbles: true }));
  await this.util.wait(() => {
    ui = this.extractUI();
    audience = ui['audience-growth'];
    console.warn('%s | waiting...(suspicious)', new Date().toJSON());
    return audience['$popup-list']?.length || audience['$popup-create-post'];
  });
  if (audience['$popup-create-post']) {
    let message = event === 'invite-react' ?
      'Không có ai bày tỏ cảm xúc về bài viết của bạn trong vòng [n] tháng qua.' :
      'Chưa có ai để mời.'
    task['output'] = { 'message': message };
    task['status'] = 'error'; return;
  }
  if (audience['popup-headings'].some(heading => {
    return ['you\'ve reached your limit', 'bạn đã đạt đến giới hạn'].includes(heading['label']);
  })) {
    task['output'] = { 'message': 'You\'ve reached your limit.' };
    task['status'] = 'error'; return;
  }
};
Facebook.prototype.sendInviteSubmit = async function (task) {
  let ui = this.extractUI();
  let audience = ui['audience-growth'];
  const $popup = audience['$popup'];
  let invites = audience['popup-invites'];
  if (invites) {
    audience['$popup-all'].dispatchEvent(new Event('click', { bubbles: true }));
    await this.util.wait(() => {
      ui = this.extractUI();
      audience = ui['audience-growth'];
      console.warn('%s | waiting...(solve)', new Date().toJSON());
      return !audience['popup-invites'];
    });
  }
  for ($item of audience['$popup-list']) {
    invites = audience['popup-invites'];
    if (invites >= 45) { break; }

    let label = $item.ariaLabel,
        checked = $item.checked,
        disabled = $item.disabled;
    if (disabled) {
      console.log(`[ send.invite ] DISABLED, label = ${label}`); break;
    }
    if (!checked) {
      $item.dispatchEvent(new Event('click', { bubbles: true }));
      console.log(`[ send.invite ] count = ${invites + 1}, label = ${label}`);
      await this.util.wait(() => {
        ui = this.extractUI();
        audience = ui['audience-growth'];
        console.warn('%s | waiting...(typo)', new Date().toJSON());
        return audience['popup-invites'] === invites + 1;
      });
    }
  }

  await this.util.timeout(5 * 1000);
  let $submit = audience['$popup-submit'];
      $submit.dispatchEvent(new Event('click', { bubbles: true }));
  await this.util.wait(() => {
    ui = this.extractUI();
    audience = ui['audience-growth'];
    console.warn('%s | waiting...(expose)', new Date().toJSON());
    return !document.contains($popup) || audience['$popup-submit-confirm'];
  });
  if (document.contains($popup)) {
    await this.util.timeout(5 * 1000);
    let $confirm = audience['$popup-submit-confirm'];
        $confirm.dispatchEvent(new Event('click', { bubbles: true }));
    await this.util.wait(() => {
      console.warn('%s | waiting...(ongoing efforts)', new Date().toJSON());
      return !document.contains($popup);
    });
  }
  task['status'] = 'processed';
};
Facebook.prototype.inviteFriend = async function (task) {
  task = task || {};
  task['input'] = Object.assign({}, task['input'], { 'event': 'invite-friend' });
  task['status'] = 'processing';
  console.log('[ fb ] invite-friend:start, task =', task);
  if (task['status'] !== 'error') {
    await this.renderAudienceGrowth(task);
  }
  if (task['status'] !== 'error') {
    await this.sendInviteOpen(task);
  }
  if (task['status'] !== 'error') {
    await this.sendInviteSubmit(task);
  }
  console.log('[ fb ] invite-friend:finish, task =', task);
};
Facebook.prototype.inviteReact = async function (task) {
  task = task || {};
  task['input'] = Object.assign({}, task['input'], { 'event': 'invite-react' });
  task['status'] = 'processing';
  console.log('[ fb ] invite-react:start, task =', task);
  if (task['status'] !== 'error') {
    await this.renderAudienceGrowth(task);
  }
  if (task['status'] !== 'error') {
    await this.sendInviteOpen(task);
  }
  if (task['status'] !== 'error') {
    await this.sendInviteSubmit(task);
  }
  console.log('[ fb ] invite-react:finish, task =', task);
};
window['NPFacebook'] = new Facebook();
document.dispatchEvent(new CustomEvent('np:lib-facebook', { bubbles: true, detail: window['NPFacebook'] }));
})();

(function() {
var Main = function() {
  this.util = window['NPUtils'];
  this.facebook = window['NPFacebook'];
  this.queue = new Map([]);
  this.api = {
    uri: 'http://localhost:5000'
  };
  this.interval = 0;
  this.storageName = 'np-facebook';
};
Main.prototype.add = function (type, input) {
  let id = this.util.newGuid();
  let item = { type, input, 'status': '', 'steps': [] };
  this.queue.set(id, item);
  console.log('[ main ] add, id = %s, type = %s, input = %s', id, type, JSON.stringify(input, null, 0));
};
Main.prototype.check = async function() {
  for (let [key, item] of this.queue) {
    let { type, status, recheck } = item;
    let fn; switch (type) {
      case 'facebook-reel-create':
        fn = this.facebook.reelCreate; break;
      case 'facebook-reel-comment':
        fn = this.facebook.reelComment; break;
      default:;
    }
    if (status === '' ||
        status === 'processing' && recheck) {
      fn?.call(this.facebook, item);
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
  for (let ename of ['fb:reel-create', 'fb:reel-comment']) {
    window.addEventListener(ename, (e) => {
      let { detail: { status, input, output } } = e;
      if (['fb:reel-create', 'fb:reel-comment'].includes(ename)) {
        status = ['processed'].includes(status) ? 'success' : 'failure';
        let id = input['dispatcher'];
        let url = this.api.uri.concat('/job-upsert');
        let body = { id, output, status };
        if (!this.util.isNumber(id, { 'greater-than': 0 })) {
          Object.assign(body, { input, type: ename });
        }
        if (status === 'failure') {
          Object.assign(body, { message: output['message'] });
        }
        this.add('wdriver', {
          'event': 'send.http',
          'url': `${url}?r=${Math.random()}`,
          'body': body,
          'method': 'post',
        });
        this.add('wdriver', {
          'event': 'client.event',
          'name': ename,
          'data': { status, input, output }
        });
      }
      /* [ unnecessary ] if (event === 'fb:reel-comment') {
        status = ['processed'].includes(status) ? 'success' : status;
        let url = this.api.uri.concat('/job-upsert');
        let datap = {
          'output': output,
          'status': status,
        };
        var f_success = (data) => {
          console.log('[ request ] success, data =', data);
        };
        var f_failure = (data) => {
          let msg = data;
          if (data?.['message']) {
            msg = `message = ${data['message']}, stack = ${data['stack']}`;
          }
          if (data?.['status']) {
            msg = `status = ${data['status']}, detail = ${data['detail']}`;
          }
          console.error('[ request ] failure, '.concat(msg));
        };
        fetch(`${url}?r=${Math.random()}`, { method: 'post', body: JSON.stringify(datap) }).then(res => {
          if (res.ok) { res.json().then(dataf => {
            f_success(dataf);
          }); } else { res.text().then(dataf => {
            f_failure({ 'status': res.status, 'detail': dataf });
          }); }
        }).catch(f_failure);
      }*/
    });
  }
};
Main.prototype.store = function() {
  this.storeToClient();
  this.storeToServer();
};
Main.prototype.storeToClient = function() {
  if (typeof(Storage) === 'undefined') {
    console.warn('Sorry ! No Web Storage support...'); return;
  }
  let store = {
    'queue': this.queue,
    'config': this.facebook.config
  };
  let value = JSON.stringify(store, this.util.jsonReplacer, 0);
  sessionStorage.setItem(this.storageName, value);
};
Main.prototype.storeToServer = function() {
  let url = this.api.uri.concat('/storage-set');
  let data = {
    'name': this.storageName,
    'value': {
      'queue': this.queue,
      'config': this.facebook.config
    },
    'type': 'storage.session',
    'source': 'chrome::[profile]::[username]',
  };
  let body = JSON.stringify(data, this.util.jsonReplacer, 0);
  var f_success = (data) => {
    console.warn('[ request ] success, data =', data);
  };
  var f_failure = (data) => {
    let msg = data;
    if (data?.['message']) {
      msg = `message = ${data['message']}, stack = ${data['stack']}`;
    }
    if (data?.['status']) {
      msg = `status = ${data['status']}, detail = ${data['detail']}`;
    }
    console.error('[ request ] failure,', msg);
  };
  fetch(`${url}?r=${Math.random()}`, { method: 'post', headers: { 'Content-Type': 'application/json' }, body: body }).then(res => {
    if (res.ok) { res.json().then(dataf => {
      f_success(dataf);
    }); } else { res.text().then(dataf => {
      f_failure({ 'status': res.status, 'detail': dataf });
    }); }
  }).catch(f_failure);
};
Main.prototype.restore = function() {
  let store = null;
  if (!store) { store = this.restoreFromClient(); }
  if (!store) { store = this.restoreFromServer(); }
};
Main.prototype.restoreFromClient = function() {
  if (typeof(Storage) === 'undefined') {
    console.warn('Sorry ! No Web Storage support...'); return;
  }
  let store = JSON.parse(sessionStorage.getItem(this.storageName), this.util.jsonReviser);
  let queue = store?.['queue'] || [];
  for (let [key, value] of queue) {
    value['recheck'] = true;
  }
  this.queue = new Map([...this.queue, ...queue]);
  this.facebook.setConfig(store?.['config']);
  console.warn('[ restore.client ] store =', store);
  return store;
};
Main.prototype.restoreFromServer = async function() {
  let url = this.api.uri.concat('/storage-get');
  let data = {
    'name': this.storageName,
    'type': 'storage.session',
    'source': 'chrome::[profile]::[username]',
  };
  let request = await fetch(`${url}?r=${Math.random()}`, { method: 'post', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  let response = await request.json();
  let store = JSON.parse(response['data'], this.util.jsonReviser);
  let queue = store?.['queue'] || [];
  for (let [key, value] of queue) {
    value['recheck'] = true;
  }
  this.queue = new Map([...this.queue, ...queue]);
  this.facebook.setConfig(store?.['config']);
  console.warn('[ restore.server ] store =', store);
  return store;
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
};
var main = new Main();
window['NPMain'] = main;
document.dispatchEvent(new CustomEvent('np:lib-main', { bubbles: true, detail: window['NPMain'] }));
main.start();
})();