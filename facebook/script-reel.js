(function() {
var Ctrl = function() {
  this.util = window['NPUtils'];
  this.main = window['NPMain'];
  this.reels = new Map([]);
  this.storageName = 'np-ctrl-fb.reel';
  this.init();
};
Ctrl.prototype.init = function() {
  console.log('[ ctrl-fb.reel ] init');
  this.restore();
  /* For: Testing
  if (!this.reels.size) {
    let id = this.util.newGuid();
    let item = null;
    item = {
      'page': { 'user': 'giaydeprl' },
      'video': { 'uid': '7054410112210963738', 'desc': 'Sang quá #fyp #fypシ #xuhuong #dép #guốc #giày' },
      'reel': {}, 'comment': {}, 'status': '' };
    item = {
      'page': { 'user': 'quachanhquachanh91' },
      'video': { 'uid': '7047088547416853762', 'desc': 'Chúc tui may mắn nàoo ?' },
      'reel': {}, 'comment': {}, 'status': '' };
    this.reels.set(id, item);
  }*/
  this.check();

  window.addEventListener('beforeunload', () => {
    this.store();
  });
  window.addEventListener('fb:config', (e) => {
    let { detail: { status, input, output } } = e;
    let reel = this.reels.get(input['dispatcher']);
    if (reel) {
      let rstatus =
        status === 'processed' ? 'success' :
        status === 'error' ? 'failed' : status;
      reel['status'] = `config:${rstatus}`;
      this.check();
    }
  });
  window.addEventListener('fb:reel-create', (e) => {
    let { detail: { status, input, output } } = e;
    let reel = this.reels.get(input['dispatcher']);
    if (reel) {
      let rstatus =
        status === 'processed' ? 'success' :
        status === 'error' ? 'failed' : status;
      reel['status'] = `create:${rstatus}`;
      Object.assign(reel['reel'], {
        'id': output['reel-id'],
        'desc': input['video-desc']
      });
      this.check();
    }
  });
  window.addEventListener('fb:reel-comment', (e) => {
    let { detail: { status, input, output } } = e;
    let reel = this.reels.get(input['dispatcher']);
    if (reel) {
      let rstatus =
        status === 'processed' ? 'success' :
        status === 'error' ? 'failed' : status;
      reel['status'] = `comment:${rstatus}`;
      Object.assign(reel['comment'], {
        'id': output['comment-id'],
        'body': input['comment-body']
      })
      this.check();
    }
  });
};
Ctrl.prototype.check = function() {
  for (let [key, item] of this.reels) {
    let { status, page, video } = item;
    const info = this.getInfo(item);
    if (status === '') {
      item['status'] = 'config:start';
      this.main.add('facebook-config-set', {
        'page': page,
        'dispatcher': key
      });
    }
    if (status === 'config:success') {
      item['status'] = 'create:start';
      this.main.add('facebook-reel-create', {
        'video-path': info['video-path'],
        'video-desc': info['reel-desc'],
        'dispatcher': key
      });
    }
    if (status === 'create:success') {
      item['status'] = 'comment:start';
      this.main.add('facebook-reel-comment', {
        'reel-id': item['reel']['id'],
        'comment-body': info['reel-comment'],
        'dispatcher': key
      });
    }
  }
};
Ctrl.prototype.add = function (item) {
  let id = this.util.newGuid();
  this.reels.set(id, item);
  this.check();
};
Ctrl.prototype.store = function() {
  if (typeof(Storage) === 'undefined') {
    console.warn('Sorry ! No Web Storage support...'); return;
  }
  let store = {
    'reels': this.reels
  };
  let value = JSON.stringify(store, this.util.jsonReplacer, 0);
  sessionStorage.setItem(this.storageName, value);
};
Ctrl.prototype.restore = function() {
  if (typeof(Storage) === 'undefined') {
    console.warn('Sorry ! No Web Storage support...'); return;
  }
  let store = JSON.parse(sessionStorage.getItem(this.storageName), this.util.jsonReviser);
  let reels = store?.['reels'] || [];
  this.reels = new Map([...this.reels, ...reels]);
};
Ctrl.prototype.getInfo = function(reel) {
  let info = {};
  let { page, video } = reel;
  let edited = true;
  let user_tt = page['user'];
  let reel_desc = '$[video-desc]';
  let reel_comment = '';
  switch (user_tt) {
    case 'quachanhquachanh91':
      user_tt = 'quachanh91';
      reel_desc = 'Sản phẩm trong video 👉 https://shorten.asia/R1R9hJmS | $[video-desc]';
      reel_comment = 'Tất cả đồ Q.Ánh dùng có tại 👇 https://shorten.asia/HDtaCfUK';
      break;
    case 'giaydeprl':
      /* v1:
      user_tt = 'rianlian89';
      reel_desc = 'Sản phẩm 👉 https://shorten.asia/egNPd5DW | $[video-desc]';
      reel_comment = 'Mã giảm giá + Sản phẩm: https://shorten.asia/qh8Faddj';*/
      edited = false;
      user_tt = 'lovefish1607';
      reel_desc = '$[video-desc]';
      reel_comment = 'Mã giảm giá + Sản phẩm: https://shorten.asia/qh8Faddj';
      break;
    case 'the.beauty.fish':
      edited = false;
      user_tt = 'lovefish1607';
      reel_desc = '$[video-desc]';
      reel_comment = 'Mã giảm giá + Sản phẩm: https://shorten.asia/TrurnKTD'
    default:;
  }
  reel_desc = reel_desc.replace('$[video-desc]', video['desc']);

  info['video-path'] = `D:\\Projects\\np-tiktok\\video\\@${user_tt}${edited ? '\\edited' : ''}\\${video['uid']}.mp4`;
  info['reel-desc'] = reel_desc;
  info['reel-comment'] = reel_comment;
  return info;
};
var ctrl = new Ctrl();
window['NPCtrlReel'] = ctrl;
})();