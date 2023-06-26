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
    return value;
  };
  this.newGuid = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
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
  this.sanitizeHash = (text) => {
    let value = text;
    if (value) {
      value = value.replace(/(\S)#/g, '$1 #');
    }
    return value;
  };
  this.getUrlInfo = (pUrl) => {
    let url = (pUrl !== undefined && pUrl !== null) ? pUrl : window.location.href;
    let reg = new RegExp("(((https?):)?\/\/([^\/?#]+))?(\/[^?#]*)?(\\?[^#]*)?", "gi"), exec = reg.exec(url);
    let protocol = exec[3], host = exec[4], path = exec[5], search = exec[6], hash = exec[7];
    let relative = (path || "") + (search || "") + (hash || "");
    let path_parts = path ? path.split('/').filter(x => x.length) : [];
    return {
      'url': url,
      'protocol': protocol,
      'host': host,
      'path': path,
      'search': search,
      'hash': hash,
      'relative': relative,
      'path-parts': path_parts,
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
  this.getElementsByFn = (fn, target) => {
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
  };
  this.getElementsByText = (text, target) => {
    let elements = [];
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
    return elements;
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

var Ctrl = function() {
  this.util = new Utils();
  console.log('[ np-ctrl ] init');
};
Ctrl.prototype.fill = async function(input) {
  let host = location.host;
  console.log('[ np-ctrl ] fill, host = %s, input =', host, input);
  if (host === 'ymca.ymcacompetitiveswim.org') {
    let $form = document.querySelector('[name="YMCANumberForm2"]');
    let $input = $form.querySelector('[name="frmSearchCriteria"]');
    let $submit = $form.querySelector('[name="B2"]');
    $input.value = input['value'];
    $submit.click();
  }
};
Ctrl.prototype.list = async function() {
  let host = location.host;
  console.log('[ np-ctrl ] list, host = %s', host);
  if (host === 'www.usms.org') {
    let items = [], pnext = null;
    const $list = document.querySelector('.club-list-new');
    Array.from($list.children).forEach($item => {
      const $link = $item.querySelector('a.club-list-item-new__title-link');
      let url = $link.href, host,
          content = $item.outerHTML;
      let uinfo = this.util.getUrlInfo(url);
      host = uinfo['host'];
      items.push({ url, host, content });
    });
    return { items, 'page-next': pnext };
  }
  if (host === 'usawp.sport80.com') {
    let items = [], pnext = null;
    let $pager, $pnext;
    await this.util.wait(function() {
      console.warn('%s | waiting...(the list with the highest number of teams)', new Date().toJSON());
      $pager = document.querySelector('.v-pagination');
      return $pager;
    });
    $pnext = $pager.querySelector('[aria-label="Next page"]');
    let stop = false; do {
      const $list = document.querySelector('.v-item-group');
      for (let $item of $list.querySelectorAll('.v-expansion-panel')) {
        let club = {};
        let $header = $item.querySelector('.v-expansion-panel-header');
        let $content = null;
        if ($item.ariaExpanded === 'false') {
          $header.dispatchEvent(new Event('click', { bubbles: true }));
        }
        await this.util.wait(function() {
          console.warn('%s | waiting...(brief)', new Date().toJSON());
          $content = $item.querySelector('.v-expansion-panel-content');
          return $content;
        });
        club['name'] = $header.innerText;
        club['zone'] = this.util.getElementsByText('zone', $content)[0].closest('div').nextElementSibling.innerText;
        club['address'] = $content.querySelector('.v-list-item__title').innerText;
        let addr_match = club['address'].match(/(?!\s)[^,]+(?!\s)/g);
        club['addr-state'] = addr_match[2];
        club['contact-email'] = this.util.getElementsByText('club email address', $content)[0].closest('div').nextElementSibling.innerText;
        club['website'] = this.util.getElementsByText('pool site', $content)[0].closest('div').nextElementSibling.innerText;
        club['url'] = `url:${host}/club.${this.util.newGuid()}`;
        club['host'] = host;
        club['content'] = $item.outerHTML;
        items.push(club);
        console.log('club = %s', club['name']);
      }
      stop = $pnext.disabled;
      if (!stop) {
        $pnext.dispatchEvent(new Event('click', { bubbles: true }));
        await this.util.wait(function() {
          console.warn('%s | waiting...(source)', new Date().toJSON());
          return !document.contains($list);
        });
      }
    } while (!stop);
    console.log('[ np-ctrl ] list, items =', items);
    return { items, 'page-next': pnext };
  }
  if (host === 'www.sportsengine.com') {
    let items = [], pnext = null;
    const $result = document.querySelector('.pl-search-page__results');
    const $pager = $result.querySelector('.pl-pagination');
    const $list = $result.querySelectorAll('.pl-listing');
    for (let $item of $list) {
      const $link = $item.querySelector('a.pl-listing__header');
      let url = $link.href, host,
          content = $item.outerHTML;
      let uinfo = this.util.getUrlInfo(url);
      host = uinfo['host'];
      items.push({ url, host, content });
    }
    let $pnext = $pager.querySelector('.pl-pagination__button .pl-icon--right');
    if ($pnext) {
      pnext = $pnext.closest('a.pl-pagination__button').href;
    }
    return { items, 'page-next': pnext };
  }
  if (host === 'www.teamusa.org') {
    let items = [], pnext = null;
    const $result = document.querySelector('[id="EventSearchListing"]');
    const $pager = $result.querySelector('.fullsite .paging');
    const $list = $result.querySelectorAll('.table tr');
    for (let $item of $list) {
      let $link = $item.querySelector('a:not([target="_blank"])');
      if ($link) {
        let url = $link.href, host,
            content = $item.outerHTML;
        let uinfo = this.util.getUrlInfo(url);
        host = uinfo['host'];
        items.push({ url, host, content });
      }
    }
    let $pnext = $pager.querySelector('.fa-angle-right');
    if ($pnext) {
      pnext = $pnext.closest('a').href;
    }
    return { items, 'page-next': pnext };
  }
  if (host === 'www.ncsasports.org') {
    let items = [], pnext = null;
    const $list = document.querySelectorAll('.college-list .row:not(.headers)');
    for (let $item of $list) {
      let college = {};
      const $name = $item.querySelector('[itemprop="name"]');
      const $link = $item.querySelector('a');
      const $addr = $item.querySelector('[itemprop="address"]');
      college['name'] = $name.innerText;
      college['addr-city'] = $addr.querySelector('[itemprop="addressLocality"]').innerText;
      college['addr-state'] = $addr.querySelector('[itemprop="addressRegion"]').innerText;
      college['conference'] = $item.querySelector('[itemprop="member"]').innerText;
      college['url'] = $link.href;
      college['host'] = host;
      college['content'] = $item.outerHTML;
      items.push(college);
      console.log('college = %s', college['name']);
    }
    return { items, 'page-next': pnext };
  }
  if (host === 'ymca.ymcacompetitiveswim.org') {
    let items = [], pnext = null, message;
    let $form = document.querySelector('[name="YMCANumberForm2"]');
    let $result;
    await this.util.wait(() => {
      for (var $prev = $form; $prev && !$result; $prev = $prev.previousElementSibling) {
        if ($prev.nodeName.toLowerCase() === 'table') {
          $result = $prev;
        }
      }
      message = $form.querySelector('tr:last-child [color="red"]').innerText.npTrim();
      console.warn('%s | waiting...(abbreviation)', new Date().toJSON());
      return $result || message;
    });
    
    console.log('$form =', $form, ', $result =', $result);
    for (let $item of $result?.querySelectorAll('tr') || []) {
      const $link = $item.querySelector('a');
      let url = $link.href, host,
          content = $item.outerHTML;
      let uinfo = this.util.getUrlInfo(url);
      host = uinfo['host'];
      items.push({ url, host, content});
      console.log('ymca = %s', url);
    }
    return { items, 'page-next': pnext, message };
  }
};
Ctrl.prototype.detail = async function() {
  let host = location.host;
  if (host === 'www.usms.org') {
    let club = {};
    let addr_name, addr_street, addr_city, addr_state, addr_zipcode;
    let contact_name, contact_phone, contact_email;
    let website = [];
    const $main = document.querySelector('main');
    club['name'] = $main.querySelector('.club__header').innerText;
    const $addr = $main.querySelector('.club-location');
    addr_name = $addr.querySelector('.club-location__address--name').innerText;
    addr_street = $addr.querySelector('.club-location__address--street').innerText;
    let addr_csz = $addr.querySelector('.club-location__address--city-state-zip').innerText;
    let addr_match = addr_csz.match(/^([^,]*), (\w*) ([\d-]*)/);
    if (addr_match) {
      addr_city = addr_match[1];
      addr_state = addr_match[2];
      addr_zipcode = addr_match[3];
    }
    club['addr-name'] = addr_name;
    club['addr-street'] = addr_street;
    club['addr-city'] = addr_city;
    club['addr-state'] = addr_state;
    club['addr-zipcode'] = addr_zipcode;
    const $contact = $main.querySelector('.club-contact__content');
    if ($contact) {
      Array.from($contact.children).forEach($item=> {
        let text = $item.innerText;
        if (this.util.isEmail(text)) {
          contact_email = (contact_email ? '; ' : '') + text;
        } else if (this.util.isPhone(text)) {
          contact_phone = (contact_phone ? '; ' : '') + text;
        } else {
          contact_name = (contact_name ? '; ' : '') + text;
        }
      });
    }
    club['contact-name'] = contact_name;
    club['contact-phone'] = contact_phone;
    club['contact-email'] = contact_email;
    const $website = $main.querySelector('.club-website');
    if ($website) {
      website.push($website.querySelector('a').href);
    }
    const $social = $main.querySelector('.club-social-links');
    if ($social) {
      $social.querySelectorAll('.social-share-icons__item a').forEach($link => {
        website.push($link.href);
      });
    }
    club['website'] = website.join('; ');
    club['content'] = $main.outerHTML;
    return club;
  }
  if (host === 'www.sportsengine.com') {
    let aff = {};
    let website = [];
    const $content = document.querySelector('.pl-site-content');
    $content.querySelectorAll('.pl-detail-section').forEach(($section, index) => {
      const $title = $section.querySelector('.pl-detail-section__title');
      const $content = $section.querySelector('.pl-detail-section__content');
      let title = $title?.innerText.toLowerCase() || '';
      if (title === '' && index === 0) {
        aff['name'] = $content.querySelector('.pl-detail__title').innerText;
        let addr_cs = $content.querySelector('.pl-detail__subtitle').innerText;
        let addr_match = addr_cs.match(/(?!\s)[^,]+(?!\s)/g);
        if (addr_match) {
          aff['addr-city'] = addr_match[0];
          aff['addr-state'] = addr_match[1];
        }
        for (let $item of $content.querySelectorAll('.pl-detail-subsection li')) {
          const $ico = $item.querySelector('.pl-icon');
          const $link = $item.querySelector('a.pl-link');
          let ico_cls = $ico.classList;
          if (ico_cls.contains('svg-earth')) {
            website.push($link.href);
          }
          if (ico_cls.contains('svg-envelope')) {
            aff['email'] = $link.innerText;
          }
          if (ico_cls.contains('svg-phone')) {
            aff['phone'] = $link.innerText;
          }
        }
      }
      if (title === 'contact info') {
        for (let $item of $content.querySelectorAll('.pl-detail-subsection')) {
          const $title = $item.querySelector('.pl-detail-subsection__title');
          const $content = $item.querySelector('.pl-detail-subsection__content');
          let title = $title.innerText.toLowerCase();
          if (title === 'social') {
            website.push($content.querySelector('a').href);
          } else if (title === 'address') {
            aff['address'] = $content.innerText.replace(/\n/g, ', ');
          } else {
            for (let $item of $content.children) {
              if ($item.classList.contains('pl-detail-phone')) {
                aff['contact-phone'] = $item.innerText;
              } else if ($item.querySelector('.svg-envelope-circle')) {
                aff['contact-email'] = $item.href.replace(/^mailto:/i, '');
              } else {
                aff['contact-name'] = $item.innerText;
              }
            }
          }
        }
      }
    });
    aff['website'] = website.join('; ');
    aff['content'] = $content.outerHTML;
    return aff;
  }
  if (host === 'www.teamusa.org') {
    let club = {};
    let address;
    let contact_name;
    let website = [];
    const $main = document.querySelector('main');
    const $header = $main.querySelector('header');
    const $detail = $main.querySelector('.details');
    Array.from($header.children).forEach(($item, index) => {
      let text = $item.innerText;
      if (index === 0) {
        club['name'] = text;
      }
      if (index === 1) {
        address = text;
        club['addr-street'] = text;
      }
      if (index === 2) {
        let match = text.match(/^([^,]+)?,(?: ([\w\s]+)(?<!\d))?(?: (\d+))?$/);
        address += ', ' + text;
        club['addr-city'] = match[1];
        club['addr-state'] = match[2];
        club['addr-zipcode'] = match[3];
      }
      if (index === 3) {
        for (let $link of $item.querySelectorAll('a[target="_blank"]')) {
          website.push($link.href);
        }
      }
    });
    for (let $item of $detail.children) {
      let text = $item.innerText;
      for (let $item2 of $item.children) {
        let text2 = $item2.innerText;
        switch (text2.toLowerCase()) {
          case 'zone':
            club['zone'] = $item2.nextElementSibling.innerText.replace(/\n+/g, '; ');
            break;
          case 'association':
            club['association'] = $item2.nextElementSibling.innerText.replace(/\n+/g, '; ');
            break;
          case 'primary contact':
            let match = text.match(/[^\n]+/g);
            for (let i = 1; i < match.length; i++) {
              let text = match[i];
              if (this.util.isEmail(text)) {
                club['contact-email'] = text;
              } else if (this.util.isPhone(text)) {
                club['contact-phone'] = text;
              } else if (!contact_name) {
                contact_name = text;
              }
            }
            break;
          default:;
        }
      }
    }
    club['address'] = address;
    club['contact-name'] = contact_name;
    club['website'] = website.join('; ');
    club['content'] = $main.outerHTML;
    return club;
  }
  if (host === 'ymca.ymcacompetitiveswim.org') {
    let ymca = {};
    let addrs, programs = [];
    let $table = document.querySelectorAll('table');
        $table = $table[$table.length - 1];
    let fields = new Map([]);
    for (let $row of $table.querySelectorAll('tr')) {
      if ($row.children.length !== 1) {
        let label = $row.children[0].innerText.npTrim(':');
        let value = $row.children[1].innerText;
        fields.set(label.toLowerCase(), { name: label, value: value.npTrim(), origin: value });
      }
    }
    addrs = fields.get('ymca address').origin.split(/\n/);
    let addr_match = addrs[addrs.length - 1].match(/^([^,]*), (\w*) (\d*)/);
    ymca['name'] = fields.get('ymca name').value;
    ymca['address'] = addrs.join(', ').npTrim();
    ymca['addr-state'] = addr_match[2];
    ymca['phone'] = fields.get('ymca phone').value;
    ymca['usa-swim-team'] = fields.get('registered team with usa swimming').value;
    [
      'competitive age group swim program',
      'master swimming',
      'water polo',
      'begin to swim program',
      'diving program'].forEach(key => {
      let { name, value } = fields.get(key);
      if (['yes'].includes(value.toLowerCase())) {
        programs.push(name);
      }
    });
    ymca['programs'] = programs.join('; ');
    ymca['content'] = $table.outerHTML;
    return ymca;
  }
};
Ctrl.prototype.getStates = function() {
  let states = [];
  let columns = [
    {
      'name': 'name',
      'index': 0,
    },
    {
      'name': 'abbr',
      'index': 1,
    },
    {
      'name': 'capital',
      'index': 2,
    },
    {
      'name': 'region',
      'index': 3,
    }
  ];
  const $content = document.querySelector('.sqs-row[data-slot-rendered-content]');
  for (let column of columns) {
    column['$children'] = $content
      .children[column['index']]
      .querySelectorAll('.sqs-html-content p > br');
  }
  // [array] Array.from({ length: rows[0].length }, (_, i) => "" );
  Array.from({ length: columns[0]['$children'].length }).forEach((_, index) => {
    let state = {};
    columns.forEach(column => {
      let { name, $children } = column;
      let value = $children[index].nextSibling.textContent;
      state[name] = value;
    });
    states.push(state);
  });
  return states;
};
var ctrl = new Ctrl();
window['NPCtrl'] = ctrl;
})();