var NPShopee = {
    Shop: null,
    ShopList: [
        { 'id': 69885015, 'name': "chinh.dinh", 'products-push': [
            { 'id': "7220689848", 'desc': "DTL - Răng Miệng" },
            { 'id': "6134691978", 'desc': "DTL - Răng Miệng" },
            { 'id': "4738700307", 'desc': "DTL - Răng Miệng" },
            { 'id': "3349492623", 'desc': "DTL - Ngải Cứu" },
            { 'id': "4555769444", 'desc': "DTL - An Nhi" },
            { 'id': "7758171168", 'desc': "DTL - An Phụ Khang" },
            { 'id': "3957242567", 'desc': "LA - Tinh dầu" },
            { 'id': "4860600043", 'desc': "Dầu Húng Chanh" },
            { 'id': "5558573550", 'desc': "Cao Ho Minh Khang" },
            { 'id': "6735151666", 'desc': "Sâm Maca Peru Gold" }] },
        { 'id': 161685121, 'name': "an.tran.1989", 'products-push': [
            { 'id': "4727410839", 'desc': "DTL - Răng Miệng" },
            { 'id': "4934702015", 'desc': "DTL - Răng Miệng" },
            { 'id': "4452401629", 'desc': "DTL - An Nhi" },
            { 'id': "4358184389", 'desc': "DTL - An Phụ Khang" },
            { 'id': "8634380024", 'desc': "LA - Bôi Da" },
            { 'id': "8829865177", 'desc': "LA - Bôi Da" },
            { 'id': "6060574651", 'desc': "Dầu Húng Chanh" },
            { 'id': "6018096944", 'desc': "Dầu Tỏi Diệp Chi" },
            { 'id': "5860545939", 'desc': "Cao Ho Minh Khang" }] },
        { 'id': 55695822, 'name': "trungthanhtrang", 'products-push': [
            { 'id': "4320846573", 'desc': "DTL - Răng Miệng" },
            { 'id': "5534703328", 'desc': "DTL - Răng Miệng" },
            { 'id': "7080373710", 'desc': "DTL - Ngải Cứu" },
            { 'id': "5255773876", 'desc': "DTL - An Nhi" },
            { 'id': "4258189848", 'desc': "DTL - An Phụ Khang" },
            { 'id': "7258577295", 'desc': "LA - Tinh dầu" },
            { 'id': "4360601409", 'desc': "Dầu Húng Chanh" },
            { 'id': "6418475768", 'desc': "Dầu Tỏi Diệp Chi" },
            { 'id': "7335143302", 'desc': "Yến Sào Hồng Sâm" }] },
        { 'id': 207437129, 'name': "vuhoangtran1994", 'products-push': [
            { 'id': "4648934143", 'desc': "DTL - Răng Miệng" },
            { 'id': "6248863308", 'desc': "DTL - Răng Miệng" },
            { 'id': "2922113910", 'desc': "DTL - Ngải Cứu" },
            { 'id': "9902234394", 'desc': "DTL - An Nhi" },
            { 'id': "5067811633", 'desc': "DTL - DDVS" },
            { 'id': "8430807722", 'desc': "LA - Tinh dầu" },
            { 'id': "8832317732", 'desc': "Nở ngực Đào Thi" }]
        }
    ],
    StorageName: "np-shopee",
    Initialize: (callback) => {
        let urlo = NPShopee.utils.getUrlInfo();
        if (urlo['host'] === "banhang.shopee.vn") {
            let $account = document.querySelector(".account-info");
            if (!$account) {
                setTimeout(_ => { NPShopee.Initialize(callback); }, 1000); return;
            }
            let name = $account.querySelector(".account-name").innerText;
            let list = NPShopee['ShopList'];
            for (let i = 0; i < list.length; i++) {
                let item = list[i]; if (item['name'] === name) {
                    NPShopee['Shop'] = item; break;
                }
            }
        }
        callback();
    },
    StartProcess: () => {
        console.log(`np-shopee » version ${NPShopee['version']}`);
        let utils = NPShopee.utils;
        let action = utils.getUrlParameter("np");
        let module, store;
        NPShopee.Initialize(_ => {
            module = NPShopee['MPushProduct'];
            if (action === "push-product" && /\/portal\/product\/list\/active/.test(location.pathname)) {
                console.log(`np-shopee » push-product`);
                let products = NPShopee['Shop']['products-push'];
                module.Init(products); module.StartProcess();
            }

            module = NPShopee['MCrawlShop'];
            store = utils.getStorage(module['info']['storage-name']) || {};
            if (action === "crawl-shop" || store['status'] === "doing") {
                setTimeout(_ => { location.reload(); }, 5 * 60 * 1000);
                console.log(`np-shopee » crawl-shop`);
                module.StartProcess(); return;
            }

            module = NPShopee['MCrawlProduct'];
            store = utils.getStorage(module['Info']['storage-name']) || {};
            if (action === "crawl-product" || store['status'] === "doing") {
                setTimeout(_ => { location.reload(); }, 10 * 60 * 1000);
                console.log(`np-shopee » crawl-product`);
                module.StartProcess(); return;
            }

            module = NPShopee['MCrawl'];
            store = utils.getStorage(module['info']['storage-name']) || {};
            if (action == "crawl" || store['status'] === "doing") {
                setTimeout(_ => { location.reload(); }, 5 * 60 * 1000);
                console.log(`np-shopee » crawl`);
                module.StartProcess(); return;
            }
        });
    },
    utils: {
        getUrlInfo: (pUrl) => {
            var url = (pUrl !== undefined && pUrl !== null) ? pUrl : window.location.href;
            var reg = new RegExp("((https?:)?\/\/([^\/?#]+))?(\/[^?#]*)?(\\?[^#]*)?", "gi"), exec = reg.exec(url);
            var host = exec[3], path = exec[4], search = exec[5], hash = exec[6];
            return {
                'url': url,
                'host': host,
                'path': path,
                'search': search,
                'hash': hash
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
            var value = (pValue !== undefined &&
                         pValue !== null) ? encodeURIComponent(pValue) : null;
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
        normalizeNumber: (input, type) => {
            var output = input;
            if (/ - /.test(output)) {
                output = null;
            }
            if (output !== undefined &&
                output !== null) {
                output = output.replace(/[^\d]/g, "");
            }
            if (type === "integer") {
                output = parseInt(output);
            }
            if (type === "float") {
                output = parseFloat(output);
            }
            return output;
        },
        normalizeKeyword: (input) => {
            var output = input;
            output = output.replace(/^[\n ]+|[\n ]+$/g, "");
            return output;
        },
        parseURL: (input) => {
            var match = input.match(/(https?:)?\/\/[^\/?#]+(\/[^"]*)?/gi);
            return match ? match[0] : null;
        },
        extractURL: (url, type) => {
            var reg, exec;
            var utils = NPShopee.utils;
            var info = utils.getUrlInfo(url);
            var result = { 'url': info['url'] };
            if (type === "product") {
                reg = new RegExp("\/product\/(\\d+)\/(\\d+)", "gi"); exec = reg.exec(info['path']);
                if (exec) {
                    result['shop-id'] = parseInt(exec[1]);
                    result['product-id'] = parseInt(exec[2]);
                    return result;
                }
                reg = new RegExp("\/[^\/]+-i\.(\\d+)\.(\\d+)", "gi"); exec = reg.exec(info['path']);
                if (exec) {
                    result['shop-id'] = parseInt(exec[1]);
                    result['product-id'] = parseInt(exec[2]);
                    return result;
                }
            }
            if (type === "shop") {
                reg = new RegExp("\/shop\/(\\d+)", "gi"), exec = reg.exec(info['path']);
                if (exec) {
                    result['shop-id'] = parseInt(exec[1]);
                    return result;
                }
                reg = new RegExp("\/([^\/?#]+)", "gi"), exec = reg.exec(info['path']);
                if (exec) {
                    result['shop-slug'] = exec[1];
                    return result;
                }
            }
            return result;
        },
        toSEO: (input) => {
            return input.toString()             // convert to string
                .normalize('NFD')               // change diacritics
                .replace(/[\u0300-\u036f]/g,'') // remove illegal characters
                .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                .replace(/[\s\.]+/g,'-')        // change whitespace & dot to dashes
                .toLowerCase()                  // change to lowercase
                .replace(/&/g,'-and-')          // replace ampersand
                .replace(/[^a-z0-9\-]/g,'')     // remove anything that is not a letter, number or dash
                .replace(/-+/g,'-')             // remove duplicate dashes
                .replace(/^-*/,'')              // remove starting dashes
                .replace(/-*$/,'');             // remove trailing dashes
        },
        getStorage: (name) => {
            if (typeof(Storage) === "undefined") {
                console.warn("Sorry ! No Web Storage support..."); return;
            }
            let store = JSON.parse(sessionStorage.getItem(NPShopee.StorageName));
            store = store !== undefined && store !== null ? store : {};
            return store[name];
        },
        setStorage: (name, value) => {
            if (typeof(Storage) === "undefined") {
                console.warn("Sorry ! No Web Storage support..."); return;
            }
            let store = JSON.parse(sessionStorage.getItem(NPShopee.StorageName));
            store = store !== undefined && store !== null ? store : {};
            store[name] = value;

            sessionStorage.setItem(NPShopee.StorageName, JSON.stringify(store, null, 0));
        },
        scrollToBottom: () => {
            let dmain = document.querySelector("[id='main']");
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
    },
    version: "0.4.5"
};
NPShopee['MPushProduct'] = {
    List: [],
    Loop: 1,
    Init: (list) => {
        NPShopee['MPushProduct'].List = list;
    },
    Filter: (type, data) => {
        let list = NPShopee['MPushProduct'].List;
        if (type === "by-id") {
            for (let i = 0; i < list.length; i++) {
                let item = list[i]; if (item['id'] === data) {
                    return item;
                }
            }
        }
        return null;
    },
    ItemPush: ($actionList) => {
        let item = null;
        for (let i = 0; i < $actionList.length; i++) {
            let $action_item = $actionList[i];
            let action_name = $action_item.innerText.trim();
            let action_name_match = action_name.match(/^([0-1]\d|2[0-4]):([0-5]\d):([0-5]\d)$/);
            if (action_name === "Đẩy sản phẩm") {
                item = { name: action_name, $button: $action_item.querySelector(".boost-button") };
            } else if (action_name_match) {
                let hh = parseInt(action_name_match[1]);
                let mm = parseInt(action_name_match[2]);
                let ss = parseInt(action_name_match[3]);
                item = { name: action_name, seconds: (60 * (60 * hh + mm)) + ss };
            }
            if (item) { break; }
        }
        return item;
    },
    Pagination: ($section) => {
        let $pagination = $section.querySelector(".product-list-pagination");
        let $go_input = $pagination.querySelector(".shopee-pagination-jumper .shopee-input__input");
        let $go_button = $pagination.querySelector(".shopee-pagination-jumper .shopee-button");
        let $prev_button = $pagination.querySelector(".shopee-pager .shopee-pager__button-prev");
        let $next_button = $pagination.querySelector(".shopee-pager .shopee-pager__button-next");
        let $first_button = $pagination.querySelector(".shopee-pager .shopee-pager__page:nth-child(1)");
        return {
            'multiple': !$prev_button.disabled || !$next_button.disabled,
            '$go-input': $go_input,
            '$go-button': $go_button,
            '$next-button': $next_button,
            '$first-button': $first_button,
        };
    },
    StartProcess: () => {
        let module = NPShopee['MPushProduct'];
        if (module.Loop > 3) {
            let link = "/portal/product/list/active?page=1&order=sales_dsc&np=push-product";
            let seconds = module.secondsMax + 60 * 15;
            console.log(`np-shopee » push-product » start-process: { seconds: ${seconds}, link: ${link} }`);
            module.setTimeoutID = setTimeout(_ => { location.href = link; }, seconds * 1000); return;
        }
        let  $product_section = document.querySelectorAll(".product-list-section.list")[0];
        if (!$product_section) {
            module.setTimeoutID = setTimeout(_ => module.StartProcess(), 1000); return;
        }
        let $product_list = $product_section.querySelectorAll(".product-list-item.product-list-card");
        for (let i = 0; i < $product_list.length; i++) {
            let $product_item = $product_list[i];
            let $action_list = $product_item.querySelectorAll(".product-action .shopee-dropdown-item");
            let product_id = $product_item.querySelectorAll("input[type='checkbox']")[0].value;
            let action_push = module.ItemPush($action_list);
            let product_push = module.Filter("by-id", product_id);
            if (action_push && action_push['seconds']) {
                module.secondsMax = Math.max(module.secondsMax, action_push['seconds']);
            }
            if (product_push && (
               !product_push['action-checked-times'] || action_push && action_push['seconds'])) {
                product_push['action-name'] = action_push ? action_push['name'] : "";
                product_push['action-seconds'] = action_push ? action_push['seconds'] : 0;
                product_push['action-checked-on'] = new Date();
                product_push['action-checked-times'] = (product_push['action-checked-times'] || 0) + 1;
            }
            if (action_push && !action_push['seconds'] &&
                product_push && (product_push['action-clicked-times'] || 0) < 3) {
                action_push['$button'].click();
                product_push['action-clicked-times'] = (product_push['action-clicked-times'] || 0) + 1;
                console.log(`np-shopee » push-product » start-process: ${JSON.stringify(product_push, null, 0)}`);
                module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 10 * 1000); return;
            }
        }

        let pager = module.Pagination($product_section);
        let pager_multi = pager['multiple'];
        if (pager_multi) {
            let $go_input = pager['$go-input'];
            let $go_button = pager['$go-button'];
            let $next_button = pager['$next-button'];
            let $first_button = pager['$first-button'];
            if (!$next_button.disabled) {
                 $next_button.click();
                console.log(`np-shopee » push-product » start-process: { loop: ${module.Loop}, event: button-next }`);
                module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 15 * 1000); return;
            } else {
                module.Loop++;
                if ($go_input) {
                    $go_input.value = 1;
                    $go_input.dispatchEvent(new Event('input'));
                    $go_input.dispatchEvent(new Event('blur'));
                    module.setTimeoutID = setTimeout(() => $go_button.click(), 1000);
                    console.log(`np-shopee » push-product » start-process: { loop: ${module.Loop}, event: button-go[1] }`);
                } else {
                    $first_button.click();
                    console.log(`np-shopee » push-product » start-process: { loop: ${module.Loop}, event: button-first }`);
                    module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 15 * 1000); return;
                }
                module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 15 * 1000); return;
            }
        } else {
            module.Loop++;
            console.log(`np-shopee » push-product » start-process: { loop: ${module.Loop} }`);
            module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 15 * 1000); return;
        }
    },
    secondsMax: 0,
    setTimeoutID: 0
};
NPShopee['MAdsKeyword'] = {
    Info: {
        'api-url': "https://shop.9link.pro/np-ecommerce/api-shopee-staging.php",
        'api-key': "shopee",
        'product-id': 0,
        'product-name': "",
        'keyword-type': "tu-khoa-chinh-xac",
        'list-limit': 10,
        'list-offset': 0,
        'keywords': [],
        'status': {}
    },
    ListKeyword: () => {
        let module = NPShopee['MAdsKeyword'];
        let info = module.Info;
        let url = `${info['api-url']}?api-key=${info['api-key']}`;
        url += `&api-action=keyword-ads-list`;
        url += `&product-id=${info['product-id']}`;
        url += `&product-name=${info['product-name']}`;
        url += `&keyword-type=${info['keyword-type']}`;
        url += `&limit=${info['list-limit']}&offset=${info['list-offset']}`;
        url += `&r=${new Date().getTime()}`;
        module.SetStatus("keywords:listing", "The keywords are being retrieved.", info);
        /* console.log(`np-shopee » ads-keyword: [${info['status']['code']}] limit = ${info['list-limit']}, offset = ${info['list-offset']}`); */
        fetch(url, { method: "get" })
        .then(function (res) { res.json().then(jres => {
            let list = info['keywords'];
            jres.data.forEach((item, index, array) => {
                let name = item['keyword'];
                let type = item['keyword_type'];
                let price = parseInt(item['price_bid']);
                type = !type ? 'từ khóa chính xác' : type;
                price = price < 400 ? 1024 : price;
                list.push({
                    'name': name,
                    'type': type,
                    'price-bid': price,
                    'other-info': {
                        'id': item['id'],
                        'tags': item['tags'],
                        'count': item['search_count']
                    },
                    'status': {} });
            });
            info['list-offset'] += jres.data.length;
            info['status']['next'] = jres.data.length === info['list-limit'] || list.length > 10000;
            module.SetStatus("keywords.result:success", "The keywords have been retrieved.", info);
            if (!info['status']['next']) {
                console.log(`np-shopee » ads-keyword: Please review the following keywords before adding, length = ${list.length}`);
                list.forEach((item, index, array) => {
                    console.log(`-. name = ${item['name']} [${item['other-info']['count']}], price = ${item['price-bid']}`);
                });
            }
        }); })
        .catch(function (err) {
            module.SetStatus("keywords.result:failure", `An exception has been occurred - ${err}`, info);
            console.warn(`EXCEPTION: np-shopee » ads-keyword: [${info['status']['code']}] ${info['status']['message']}`);
        });
    },
    StoreKeyword: () => {
        let module = NPShopee['MAdsKeyword'];
        let info = module.Info;
        let url = `${info['api-url']}?api-key=${info['api-key']}`;
        url += `&api-action=keyword-ads-add`;
        let product_name = ((name) => {
            if (name === "BP") {
                return "Bô rửa Boom Potty";
            }
            if (name === "RM") {
                return "Tinh dầu Răng Miệng";
            }
            if (name === "TM") {
                return "Kem bôi da Thuần Mộc";
            }
            if (name === "CL") {
                return "Cao lá Thuần Mộc";
            }
            if (name === "MP") {
                return "Sâm Maca Peru Gold";
            }
            if (name === "AN") {
                return "Hô hấp An Nhi";
            }
            if (name === "DTL-APK") {
                return "DTL - An Phụ Khang";
            }
            if (name === "DTL-DD.VS.VP") {
                return "DTL - DD VS PN";
            }
        })(info['product-name']);
        
        let data = {
            "keyword": "?",
            "keyword_type": "?",
            "search_count": "?",
            "price_bid": "?",
            "price_search": "?",
            "price_extend": -1,
            "thu_hang": "",
            "shop_id": NPShopee.Shop['id'],
            "shop_user": NPShopee.Shop['name'],
            "product_id": info['product-id'],
            "product_name": product_name,
            "tags": "NULL",
            "note": ""
        };
        let list = info['keywords'].filter((item) => {
            let code = item['status']['code'];
            if (["keyword:added", "keyword:disabled"].includes(code)) {
                return true;
            }
        });
        if (list.length) {
            module.SetStatus("keywords:storing", "The keywords are being stored into the database.", info);
            console.log(`np-shopee » ads-keyword: [${info['status']['code']}] ${list.length} keywords are being stored into the database.`);
            (async() => {
                for (let i = 0; i < list.length; i++) {
                    await new Promise((resolve, reject) => {
                        setTimeout(resolve, 1000, "foo"); });
                    let item = list[i];
                    module.SetStatus("keyword:storing", "The keyword is being stored into the database.", item);
                    data['keyword'] = item['name'];
                    data['keyword_type'] = item['type'];
                    data['search_count'] = item['ti-le-tim-kiem'];
                    data['price_bid'] = item['price-bid'];
                    data['price_search'] = item['price-bid-search'];
                    const response = await fetch(url, { method: "post", body: JSON.stringify(data) });
                    const jresponse = await response.json();
                    item['other-info']['store'] = jresponse;
                    module.SetStatus("keyword:stored", "The keyword has been stored into the database.", item);
                    console.log(`np-shopee » ads-keyword: [${item['status']['code']}] name = ${item['name']}, type = ${item['type']}, price = ${item['price-bid']}, store = ${JSON.stringify(item['other-info']['store'], null, 0)}`);
                }
                module.SetStatus("keywords:stored", "The keywords have been stored into the database.", info);
                console.log(`np-shopee » ads-keyword: [${info['status']['code']}] ${list.length} keywords have been stored into the database.`);
            })();
        }
    },
    NextKeyword: () => {
        var module = NPShopee['MAdsKeyword'];
        var list = module.Info['keywords'];
        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var code = item['status']['code'] || "";
            if (![
                "keyword:stored", "keyword:storing",
                "keyword:added", "keyword:disabled", "keyword:limited"].includes(code)) {
                return item;
            }
        }
        return null;
    },
    PrintResult: () => {
        let list = NPShopee['MAdsKeyword'].Ads['keywords'];
        list.forEach((item, index, array) => {
            console.log(`${index}. ${item['name']}, ${item['type']}, ${item['ti-le-tim-kiem']}, ${item['price-bid-search']}, ${item['price-bid']}`);
        });
    },
    StartProcess: () => {
        var utils = NPShopee.utils;
        var module = NPShopee['MAdsKeyword'];
        var ui = module.ExtractUI();
        var info = module.Info;
        var m_code = info['status']['code'] || "";
        if (m_code === "") {
            if (ui['dproduct-name']) {
                var ads_pro = false, ads_shop = false;
                var product_id = 0;
                var product_name = ui['dproduct-name'].innerText.toLowerCase();
                if (ui['dproduct-link']) {
                    var pro_link = ui['dproduct-link'].getAttribute('href');
                    var pro_match = pro_link.match(/\/product\/(\d+)/i);
                    product_id = parseInt(pro_match[1]);
                    ads_pro = true;
                } else {
                    var shop_match = location.href.match(/\/assembly\/shop\/(\d+)/i);
                    if (shop_match) {
                        product_id = parseInt(shop_match[1]);
                        ads_shop = true;
                    }
                }

                info['product-id'] = product_id;
                // -: info['product-name'] = product_name;
                if (ads_pro) {
                    if (-1 !== product_name.indexOf("hôi miệng") ||
                        -1 !== product_name.indexOf("sâu răng") ||
                        -1 !== product_name.indexOf("sún răng") ||
                        -1 !== product_name.indexOf("viêm lợi") ||
                        -1 !== product_name.indexOf("chảy máu chân răng") ||
                        -1 !== product_name.indexOf("viêm họng") ||
                        -1 !== product_name.indexOf("amidan") ||
                        -1 !== product_name.indexOf("viêm tai")) {
                        info['product-name'] = "RM";
                    }
                    if (-1 !== product_name.indexOf("cao lá") ||
                        -1 !== product_name.indexOf("trĩ") ||
                        -1 !== product_name.indexOf("rạn da")) {
                        info['product-name'] = "CL";
                    }
                    if (-1 !== product_name.indexOf("sâm maca") ||
                        -1 !== product_name.indexOf("maca peru") ||
                        -1 !== product_name.indexOf("mãn kinh") ||
                        -1 !== product_name.indexOf("kinh nguyệt") ||
                        -1 !== product_name.indexOf("nội tiết tố")) {
                        info['product-name'] = "MP";
                    }
                    if (-1 !== product_name.indexOf("an nhi")) {
                        info['product-name'] = "AN"
                    }
                    if (-1 !== product_name.indexOf("dầu gội")) {
                        info['product-name'] = "DG"
                    }
                }
            }
            module.ListKeyword();
            module.Callback(5 * 1000); return;
        }
        if (m_code === "keywords:listing") {
            module.Callback(); return;
        }
        if (m_code === "keywords.result:failure") {
            module.ListKeyword();
            module.Callback(5 * 1000); return;
        }
        if (m_code === "keywords.result:success") {
            if (info['status']['next']) {
                module.ListKeyword();
                module.Callback(); return;
            }
            module.Callback(5 * 1000); return;
        }
        if (m_code === "keyword:storing") {
            module.Callback(); return;
        }
        if (m_code === "keyword:stored") {
            module.Callback(); return;
        }
        if (m_code === "popup") {
            if (ui['dpopup']) {
                m_code = module.SetStatus("popup:opened", "The popup has been opened.", info)['status']['code'];
            }
            if (!ui['dpopup']) {
                ui['dpopup-open'].click();
                module.SetStatus("popup:opening", "The popup is opening.", info);
                module.Callback(); return;
            }
        }
        if (m_code === "popup:opening") {
            if (ui['dpopup']) {
                m_code = module.SetStatus("popup:opened", "The popup has been opened.", info)['status']['code'];
            }
            if (!ui['dpopup']) {
                console.log(`np-shopee » ads-keyword: [${m_code}] Still waiting the result.`);
                module.Callback(); return;
            }
        }
        if (m_code === "popup:opened") {
            let okeyword = module.NextKeyword();
            if (okeyword) {
                let k_name = okeyword['name'];
                let k_type = okeyword['type'];
                let k_price_bid = okeyword['price-bid'];
                let k_status_code = okeyword['status']['code'] || "";
                if (k_status_code === "") {
                    let dtype = ui['dpopup-keyword-type'];
                    if (k_type !== dtype.innerText.toLowerCase()) {
                        dtype.click();
                        module.SetStatus("keyword-type:changing", "[keyword type] click dropdown.", okeyword);
                        module.Callback(); return;
                    }
                    k_status_code = module.SetStatus("keyword-type:matched", "[keyword type] The value is already matched.", okeyword)['status']['code'];
                }
                if (k_status_code === "keyword-type:changing") {
                    let dpopper = ui['dpopup-keyword-type-popper'];
                    if (!dpopper) {
                        module.Callback(); return;
                    }
                    let dlist = dpopper.querySelectorAll(".shopee-option");
                    for (let i = 0; i < dlist.length; i++) {
                        let ditem = dlist[i];
                        if (k_type === ditem.querySelector(".item-title").innerText.toLowerCase()) {
                            ditem.click();
                            module.SetStatus("keyword-type:changed", "[keyword type] click dropdown-option.", okeyword);
                            module.Callback(); return;
                        }
                    }
                    console.warn(`np-shopee » ads-keyword: [${k_status_code}] DON'T find any matched keyword-type.`);
                }
                if (k_status_code === "keyword-type:changed") {
                    if (k_type !== ui['dpopup-keyword-type'].innerText.toLowerCase()) {
                        module.Callback(); return;
                    }
                    k_status_code = module.SetStatus("keyword-type:matched", "[keyword type] The value is already matched.", okeyword)['status']['code'];
                }
                if (k_status_code === "keyword-type:matched") {
                    ui['dpopup-search-input'].value = k_name;
                    ui['dpopup-search-input'].dispatchEvent(new Event('input'));
                    module.SetStatus("search:input", "[search box] input value.", okeyword);
                    module.Callback(); return;
                }
                if (k_status_code === "search:input") {
                    ui['dpopup-search-input'].dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', key: 'Enter', view: window }));
                    module.SetStatus("search:enter", "[search box] press Enter.", okeyword);
                    module.Callback(); return;
                }
                if (k_status_code === "search:enter") {
                    var warn = ui['dpopup-search-warning'] ? ui['dpopup-search-warning'].innerText : "";
                    var dlist = ui['dpopup-search-list'];
                    if (!dlist.length && ui['dpopup-search-empty'].style.display !== "none") {
                        console.log(`np-shopee » ads-keyword: [${k_status_code}] No Data is being displayed.`);
                        module.SetStatus("", "", okeyword);
                        module.Callback(); return;
                    }
                    for (let i = 0; i < dlist.length; i++) {
                        let ditem = dlist[i];
                        var dkeyword = ditem.querySelectorAll(".keyword")[0];
                        var dti_le_tim_kiem = ditem.querySelector("td:nth-child(3)");
                        var dprice_bid_refer = ditem.querySelector("td:nth-child(4)");
                        var daction = ditem.querySelector("td:last-child button");
                        var i_keyword = utils.normalizeKeyword(dkeyword.childNodes[0].nodeValue);
                        var i_ti_le_tim_kiem = utils.normalizeNumber(dti_le_tim_kiem.innerText, "integer");
                        var i_price_bid_refer = utils.normalizeNumber(dprice_bid_refer.innerText, "integer");
                        if (i == 0 && warn.startsWith(k_name)) {
                            console.warn(`np-shopee » ads-keyword: [${k_status_code}] ${warn}`);
                            module.SetStatus("keyword:limited", "[search box] result » Keyword is limited.", okeyword);
                            module.Callback(); return;
                        }
                        if (i == 0 && i_keyword !== k_name) {
                            console.log(`np-shopee » ads-keyword: [${k_status_code}] Still waiting the result.`);
                            module.Callback(); return;
                        }
                        if (i == 0 && i_keyword === k_name) {
                            okeyword['ti-le-tim-kiem'] = i_ti_le_tim_kiem;
                            okeyword['price-bid-search'] = i_price_bid_refer;
                            if (!daction.disabled) {
                                daction.click();
                                module.SetStatus("keyword:adding", "[search box] result » click Action.", okeyword);
                                module.Callback(); return;
                            }
                            if ( daction.disabled) {
                                module.SetStatus("keyword:disabled", "[search box] result » Action is disabled.", okeyword);
                                module.Callback(); return;
                            }
                        }
                    }
                }
                if (k_status_code === "keyword:adding") {
                    var dselected_item = ui['dpopup-selected-list'].querySelectorAll(".shopee-form-item:last-child")[0];
                    var dselected_name = dselected_item.querySelector(".name");
                    var dselected_price_bid = dselected_item.querySelector("input");
                    var i_selected_name = dselected_name.innerText;
                    var i_selected_price_bid = utils.normalizeNumber(dselected_price_bid.value, "integer");
                    if (i_selected_name !== k_name) {
                        console.log(`np-shopee » ads-keyword: [${k_status_code}] Still waiting the result.`);
                        module.Callback(); return;
                    }
                    if (i_selected_price_bid !== k_price_bid) {
                        dselected_price_bid.value = k_price_bid;
                        dselected_price_bid.dispatchEvent(new Event('input'));
                    }
                    okeyword['price-bid-selected'] = i_selected_price_bid;
                    module.SetStatus("keyword:added", "[selected box] price » changed successful.", okeyword);
                    module.Callback(); return;
                }
            } else {
                module.StoreKeyword();
                module.Callback(5 * 1000); return;
            }
        }
    },
    StopProcess: () => {
        let module = NPShopee['MAdsKeyword'];
        let info = module.Info;
        clearTimeout(module.setTimeoutID);
        module.SetStatus("module:stopped", "The module has been stopped.", info);
        console.log(`np-shopee » ads-keyword: [${info['status']['code']}] The module has been stopped, timeout-id = ${module.setTimeoutID}`);
    },
    ExtractUI: () => {
        var d_product_link = document.querySelector(".detail-header a");
        var d_product_name = document.querySelector(".detail-header .campaign-name");
        var d_popup = document.querySelectorAll(".shopee-modal__mask")[0];
        var d_popup_open = document.querySelectorAll(".mult-actions .shopee-button--primary")[0];
        var d_popup_confirm = d_popup ? d_popup.querySelectorAll(".shopee-modal__footer .shopee-button--primary")[0] : undefined;
        var d_popup_search_input = d_popup ? d_popup.querySelectorAll(".selector .search-input input")[0] : undefined;
        var d_popup_search_list = d_popup ? d_popup.querySelectorAll(".selector .shopee-table__body .shopee-table__row") : undefined;
        var d_popup_search_empty = d_popup ? d_popup.querySelector(".selector .shopee-table__empty") : undefined;
        var d_popup_search_warning = d_popup ? d_popup.querySelector(".selector .warning-tip") : undefined;
        var d_popup_selected_list = d_popup ? d_popup.querySelectorAll(".bucket .list")[0] : undefined;
        var d_keyword_type = d_popup ? d_popup.querySelectorAll(".bucket .action .shopee-selector")[0] : undefined;
        var d_keyword_type_popper = undefined;
        var d_popper_list = document.querySelectorAll(".shopee-popper");
        for (let i = 0; i < d_popper_list.length; i++) {
            let d_item = d_popper_list[i];
            if (d_item.style.display !== "none") {
                d_keyword_type_popper = d_item;
                break;
            }
        }
        return {
            'dproduct-link': d_product_link ? d_product_link : null,
            'dproduct-name': d_product_name ? d_product_name : null,
            'dpopup': d_popup ? d_popup : null,
            'dpopup-open': d_popup_open ? d_popup_open : null,
            'dpopup-confirm': d_popup_confirm ? d_popup_confirm : null,
            'dpopup-search-input': d_popup_search_input ? d_popup_search_input : null,
            'dpopup-search-list': d_popup_search_list ? d_popup_search_list : null,
            'dpopup-search-empty': d_popup_search_empty ? d_popup_search_empty : null,
            'dpopup-search-warning': d_popup_search_warning ? d_popup_search_warning : null,
            'dpopup-selected-list': d_popup_selected_list ? d_popup_selected_list : null,
            'dpopup-keyword-type': d_keyword_type ? d_keyword_type : null,
            'dpopup-keyword-type-popper': d_keyword_type_popper ? d_keyword_type_popper : null
        };
    },
    SetStatus: (pCode, pMessage, pObject) => {
        let obj = pObject;
        obj['status']['code'] = pCode;
        obj['status']['message'] = pMessage;
        if (false) {
            console.log(`set-status: object = ${obj}, code = ${obj['status']['code']}, message = ${obj['status']['message']}`);
        }
        return obj;
    },
    Callback: (pTime) => {
        let time  = pTime ? pTime : 1000;
        let module = NPShopee['MAdsKeyword'];
        module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, time);
    },
    setTimeoutID: 0
};
NPShopee['MStatsKeyword'] = {
    Info: {
        'api-url': "https://shop.9link.pro/np-ecommerce/api-shopee-staging.php",
        'api-key': "shopee",
        'list-limit': 10,
        'list-offset': 0,
        'list-status': {},
        'keywords': []
    },
    ListKeyword: () => {
        let module = NPShopee['MStatsKeyword'];
        let info = module.Info;
        var url = `${info['api-url']}?api-key=${info['api-key']}`;
        url += `&api-action=keyword-list`;
        url += `&limit=${info['list-limit']}&offset=${info['list-offset']}`;
        url += `&r=${new Date().getTime()}`;
        info['list-status']['code'] = "1";
        info['list-status']['message'] = "The request has been started.";
        fetch(url, { method: "get" })
        .then(function (res) { res.json().then(jres => {
            let list = module.Info['keywords'];
            jres.data.forEach((item, index, array) => {
                let name = item['keyword'];
                list.push({
                    'name': name,
                    'status': {},
                    'cpriority': item['crawl-priority'],
                    'csuggestion': item['crawl-suggestion'] == 1,
                    'children': [],
                    'db-info': {
                        'id': item['id'],
                        'tags': item['tags'],
                        'count': item['search-count']
                    }
                });
            });
            if (jres.data.length !== info['list-limit']) {
                info['list-status']['code'] = "2.1"
                info['list-status']['message'] = "The request has been finished: next = 0";
            }
            if (jres.data.length === info['list-limit']) {
                info['list-status']['code'] = "2.2";
                info['list-status']['message'] = "The request has been finished: next = 1";
            }
        }); })
        .catch(function (err) {
            info['list-status']['code'] = "3";
            info['list-status']['message'] = "An exception has been occurred: " + err;
            console.warn("EXCEPTION: np-shopee » stats-keyword » list.keyword - " + err);
        });
    },
    StoreKeyword: (okeyword) => {
        let module = NPShopee['MStatsKeyword'];
        let info = module.Info;
        let url = `${info['api-url']}?api-key=${info['api-key']}`;
        url += `&api-action=keyword-add`;
        (okeyword['csuggestion'] ? okeyword['children'] : []).concat(okeyword).forEach((item, index, array) => {
            let parent = item['parent'];
            let pkeyword = parent ? parent['name'] : "NULL";
            let cpriority = parent && parent['cpriority'] > 0 ? parent['cpriority'] - 1 : 0;
            let csuggestion = cpriority ? 1 : 0;
            let data = {
                'keyword': item['name'],
                'search_count': item['search-count'],
                'tags': "NULL",
                'crawl_priority': cpriority,
                'crawl_suggestion': csuggestion,
                'parent_keyword': pkeyword,
                'from': "Web"
            }
            fetch(url, { method: "post", body: JSON.stringify(data) })
            .then(function (res) { res.json().then(jres => {
                item['status']['code'] = "3.2";
                item['status']['message'] = `The keyword has been stored into database: ${jres.status}`;
            }); })
            .catch(function (err) {
                item['status']['code'] = "3.3";
                item['status']['message'] = "An exception has been occurred: " + err
                console.warn("EXCEPTION: np-shopee » stats-keyword » store.result - " + err);
            });
        });
    },
    NextKeyword: () => {
        let module = NPShopee['MStatsKeyword'];
        var list = module.Info['keywords'];
        for (let i = 0; i < list.length; i++) {
            let item = list[i];
            let code = item['status']['code'] || "";
            if (!code.startsWith("3.")) {
                return item;
            }
        }
        return null;
    },
    MoreKeyword: (parent, name, count) => {
        count = count === null ? -1 : count;
        let tags = count === -1 ? "[suggest-auto]" : "[suggest-result]";
        if (parent['name'] !== name) {
            parent['children'].push({
                'name': name, 'search-count': count, 'tags': tags,
                'parent': { 'name': parent['name'], 'cpriority': parent['cpriority'] }, 'status': {}
            });
        }
    },
    PrintKeyword: () => {
        let module = NPShopee['MStatsKeyword'];
        let list = module.Info['keywords'];
        list.forEach((item, index, array) => {
            console.log(`${index}. name = ${item['name']}, search-count = ${item['search-count']}`);
        });
    },
    StartProcess: () => {
        let utils = NPShopee.utils;
        let module = NPShopee['MStatsKeyword'];
        let list_status_code = module.Info['list-status']['code'] || "";
        if (list_status_code === "") {
            module.ListKeyword();
            module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 1000); return;
        }
        if (list_status_code === "1") {
            module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 1000); return;
        }
        if (list_status_code.startsWith("2.")) {
            let okeyword = module.NextKeyword();
            if (okeyword) {
                let k_name = okeyword['name'];
                let k_status_code = okeyword['status']['code'] || "";
                let dpopup = document.querySelectorAll(".shopee-modal__mask")[0];
                let dinput_search = dpopup.querySelectorAll(".selector .search-input input")[0];
                if (k_status_code === "") {
                    dinput_search.value = k_name;
                    dinput_search.dispatchEvent(new Event('input'));
                    okeyword['status']['code'] = "2.1";
                    okeyword['status']['message'] = "[search box] input keyword.";
                    module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 5000); return;
                }
                if (k_status_code === "2.1") {
                    let dlist = dpopup.querySelectorAll(".selector .search-auto-list .list-item");
                    for (let i = 0; i < dlist.length; i++) {
                        let ditem = dlist[i];
                        let i_keyword = utils.normalizeKeyword(ditem.innerText);
                        module.MoreKeyword(okeyword, i_keyword, null);
                    }
                    dinput_search.dispatchEvent(new KeyboardEvent('keyup', { code: 'Enter', key: 'Enter', view: window }));
                    okeyword['status']['code'] = "2.2";
                    okeyword['status']['message'] = "[search box] press Enter.";
                    module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 1000); return;
                }
                if (k_status_code === "2.2") {
                    var dlist = dpopup.querySelectorAll(".selector .shopee-table__body .shopee-table__row");
                    if (!dlist.length &&
                         dpopup.querySelector(".selector .shopee-table__empty").style.display !== "none") {
                        console.log(`np-shopee » stats-keyword » start-process: [No Data] is being displayed.`);
                        module.ResetProcess(); return;
                    }
                    for (let i = 0; i < dlist.length; i++) {
                        let ditem = dlist[i];
                        var dkeyword = ditem.querySelectorAll(".keyword")[0];
                        var dsearch_count = ditem.querySelector("td:nth-child(3)");
                        var i_keyword = utils.normalizeKeyword(dkeyword.childNodes[0].nodeValue);
                        var i_search_count = utils.normalizeNumber(dsearch_count.innerText, "integer");
                        if (i == 0 && i_keyword !== k_name) {
                            console.log(`np-shopee » stats-keyword » start-process: Still waiting result from search box.`);
                            module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 1000); return;
                        }
                        if (i == 0) {
                            okeyword['search-count'] = i_search_count;
                            okeyword['status']['code'] = "3.1";
                            okeyword['status']['message'] = "[search box] result » Found!";   
                        } else {
                            module.MoreKeyword(okeyword, i_keyword, i_search_count);
                        }
                        if (i === dlist.length - 1) {
                            module.StoreKeyword(okeyword);
                            module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 1000); return;
                        }
                    }
                }
            } else {
                if (list_status_code === "2.2") {
                    module.ListKeyword();
                    module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 1000); return;
                }
                module.PrintKeyword();
            }
        }
        if (list_status_code === "3") {
            module.ListKeyword();
            module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 5 * 60 * 1000); return;
        }
    },
    ResetProcess: () => {
        console.log(`np-shopee » stats-keyword » reset-process`);
        let module = NPShopee['MStatsKeyword'];
        let list = module.Info['keywords'];
        clearTimeout(module.setTimeoutID);
        for (var i = list.length - 1; i > -1; i--) {
            let item = list[i];
            let status = item['status']['code'] || "";
            if (status !== "") {
                console.log(`-. The following keyword has been deleted: ${JSON.stringify(item, null, 0)}`);
                list.splice(i, 1); break;
            }
        }
        module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, 5 * 1000); return;
    },
    setTimeoutID: 0
};
NPShopee['MCrawl'] = {
    info: {
        'api-url': "https://shop.9link.pro/np-ecommerce/api-shopee-staging.php",
        'api-key': "shopee",
        'storage-name': "m-crawl",
    },
    ListFromDB: async (type, limit = 5, offset = 0) => {
        let module = NPShopee['MCrawl'];
        let info = module['info'];
        let url, req, res, list = [];
        url = `${info['api-url']}?api-key=${info['api-key']}`;
        url += `&api-action=crawler-list`;
        url += `&type=${type}`;
        url += `&status=`;
        url += `&limit=${limit}&offset=${offset}`;
        req = await fetch(`${url}&r=${Math.random()}`, { method: "get" });
        res = await req.json();
        res['data'].forEach(item => {
            let litem = {};
            if (type === "shop") {
                litem['id'] = item['shop_id'];
                litem['slug'] = item['shop_slug'];
                litem['status'] = item['status'];
            }
            if (type === "product") {
                litem['id'] = item['prod_id'];
                litem['url'] = item['prod_url'];
                litem['status'] = item['status'];
                litem['shop'] = { 'id': item['shop_id'] };
            }
            list.push(litem);
        });
        return list;
    },
    StartProcess: async _ => {
        let utils = NPShopee.utils;
        let module = NPShopee['MCrawl'];
        let info = module['info'];
        let store = utils.getStorage(info['storage-name']) || {};
        let list;

        list = await module.ListFromDB("shop", 1, 0);
        if (list.length) {
            let item = list[0];
            store['status'] = "doing";
            utils.setStorage(info['storage-name'], store);
            location.href = `/shop/${item['id']}/?np=crawl-shop`; return;
        }
        list = await module.ListFromDB("product", 1, 0);
        if (list.length) {
            let item = list[0];
            store['status'] = "doing";
            utils.setStorage(info['storage-name'], store);
            // Aug 15, 2021: location.href = utils.setUrlParameter("np", "crawl-product", item['url']); return;
            location.href = `/product/${item['shop']['id']}/${item['id']}/?np=crawl-product`; return;
        }

        if (!list.length) {
            store['status'] = "done";
            utils.setStorage(info['storage-name'], store);
            console.log("np-shopee » crawler: The process has been finished.");
        }
    },
};
NPShopee['MCrawlShop'] = {
    info: {
        'api-url': "https://shop.9link.pro/np-ecommerce/api-shopee-staging.php",
        'api-key': "shopee",
        'shop': {
            'products': []
        },
        'status': {},
        'auto-store': true,
        'storage-name': "m-crawl-shop",
    },
    IsLoaded: ui => {
        return ui['dview'] && ui['dshop-link'];
    },
    IsCrawled: module => {
        let list = module['info']['shop']['products'];
        return list.length === 0 || list.length % 2 == 1;
    },
    StoreData: async module => {
        let info = module['info'];
        let shop = info['shop'];
        let products = shop['products'];
        let url, data, req, res;
        url = `${info['api-url']}?api-key=${info['api-key']}&api-action=crawler-product-add`;
        for (const pitem of products) {
            data = {
                'id': pitem['id'],
                'name': pitem['name'],
                'url': pitem['url'],
                'shop': {
                    'id': shop['id'],
                    'slug': shop['slug']
                }
            };
            req = await fetch(`${url}&r=${Math.random()}`, { method: "post", body: JSON.stringify(data) });
            res = await req.json();
            pitem['db-result'] = res;
        }
        if (module.IsCrawled(module)) {
            shop['status'] = "crawled";
            data = {
                'shop': {
                    'id': shop['id'],
                    'slug': shop['slug'],
                    'status': shop['status']
                }
            };
            req = await fetch(`${url}&r=${Math.random()}`, { method: "post", body: JSON.stringify(data) });
            res = await req.json();
            shop['db-result'] = res;
        }
    },
    ExtractUI: _ => {
        var dpage, dinfo, dview,
            dsearch, dsempty,
            dshop_avatar, dshop_link;
        dpage = document.querySelector(".shop-page");
        dinfo = dpage && dpage.querySelector(".shop-page__info");
        dview = dpage && dpage.querySelector(".shop-all-product-view");
        dsearch = dview && dview.querySelector(".shop-search-result-view");
        dshop_avatar = dinfo && dinfo.querySelector(".shopee-avatar");
        dshop_link = dshop_avatar && dshop_avatar.parentNode;

        return {
            'dpage': dpage ? dpage : null,
            'dview': dview ? dview : null,
            'dsearch': dsearch ? dsearch : null,
            'dshop-link': dshop_link ? dshop_link : null
        };
    },
    ConvertToProducts: dsearch => {
        var products = [];
        var utils = NPShopee.utils;
        if (dsearch) {
            var dimg, dname, urlo;
            dsearch.querySelectorAll("a[data-sqe='link']").forEach(ditem => {
                dimg = ditem.querySelector("img");
                dname = dimg.parentNode.nextSibling.children[0].children[0];
                urlo = utils.extractURL(ditem.getAttribute('href'), "product");
                products.push({
                    'url': urlo['url'],
                    'id': urlo['product-id'],
                    'name': dname.innerText,
                    'shop': { 'id': urlo['shop-id'] }
                });
            });
        }
        return products;
    },
    StartProcess: async _ => {
        var utils = NPShopee.utils;
        var module = NPShopee['MCrawlShop'];
        var ui = module.ExtractUI();
        var info = module['info'];
        var store = utils.getStorage(info['storage-name']) || {};
        var m_code = info['status']['code'] || "";
        if (m_code === "") {
            module.SetStatus("page:loading", "The page is being loaded.", info);
            module.Callback(); return;
        }
        if (m_code === "page:loading") {
            if (module.IsLoaded(ui)) {
                module.SetStatus("page:loaded", "The page has been loaded.", info);
            }
            module.Callback(); return;
        }
        if (m_code === "page:loaded") {
            var urlo = utils.extractURL(null, "shop");
            info['shop']['id'] = urlo['shop-id'];
            urlo = utils.extractURL(ui['dshop-link'].getAttribute('href'), "shop");
            info['shop']['slug'] = urlo['shop-slug'];

            var page = parseInt(utils.getUrlParameter("page")) || 0;
            if (!page) {
                store['page'] = 0;
                store['status'] = "doing";
                utils.setStorage(info['storage-name'], store);
            }

            utils.scrollToBottom();
            module.SetStatus("page:scrolling", "The page is being scrolled.", info);
            module.Callback(); return;
        }
        if (m_code === "page:scrolling") {
            if (utils.scrollToBottom()) {
                module.SetStatus("page:scrolled", "The page has been scrolled.", info);
            }
            module.Callback(); return;
        }
        if (m_code === "page:scrolled") {
            info['shop']['products'] = module.ConvertToProducts(ui['dsearch']);
            module.SetStatus("data:storing", "The data is being stored into the database.", info);
            if (info['auto-store']) { await module.StoreData(module); }
            module.SetStatus("data:stored", "The data has been stored into the database.", info);
            module.Callback(); return;
        }
        if (m_code === "data:stored") {
            if (!module.IsCrawled(module)) {
                store['page'] = (store['page'] || 0) + 1;
                utils.setStorage(info['storage-name'], store);
                location.href = `/shop/${info['shop']['id']}?page=${store['page']}`;
            } else {
                store['status'] = "done";
                utils.setStorage(info['storage-name'], store);
                location.href = utils.setUrlParameter("np", null);
                console.log("np-shopee » crawler-shop: The process has been finished.");
            }
        }
    },
    SetStatus: (pCode, pMessage, pObject) => {
        let obj = pObject;
        obj['status']['code'] = pCode;
        obj['status']['message'] = pMessage;
        if (false) {
            console.log(`set-status: object = ${obj}, code = ${obj['status']['code']}, message = ${obj['status']['message']}`);
        }
        return obj;
    },
    Callback: pTime => {
        let time = pTime ? pTime : 1000;
        let module = NPShopee['MCrawlShop'];
        module.setTimeoutID = setTimeout(_ => { module.StartProcess(); }, time);
    },
    setTimeoutID: 0,
};
NPShopee['MCrawlProduct'] = {
    Info: {
        'api-url': "https://shop.9link.pro/np-ecommerce/api-shopee-staging.php",
        'api-key': "shopee",
        'product': {
            'shop': {},
            'media': [],
            'status': "crawled"
        },
        'status': {},
        'auto-store': true,
        'storage-name': "m-crawl-product",
    },
    IsLoaded: ui => {
        return ui['dname'] || ui['dnexist'];
    },
    StoreData: async module => {
        let info = module.Info;
        let url = `${info['api-url']}?api-key=${info['api-key']}&api-action=crawler-product-add`;

        module.SanitizeData(info['product']);
        let product = info['product'];
        let data = JSON.parse(JSON.stringify(product, null, 0));
        delete data['links-ex'];
        let request = await fetch(`${url}&r=${Math.random()}`, { method: "post", body: JSON.stringify(data) });
        let response = await request.json();
        product['db-result'] = response;

        let links = product['links-ex'];
        for (let i = 0; i < links.length; i++) {
            let item = links[i];
            data = {
                'id': item['product-id'],
                'name': item['product-name'],
                'url': item['url'],
                'shop': { 'id': item['shop-id'] }
            };
            request = await fetch(`${url}&r=${Math.random()}`, { method: "post", body: JSON.stringify(data) });
            response = await request.json();
            item['db-result'] = response;
            console.log(`np-shopee » crawler-product: ${i + 1}/${links.length}, id = ${item['product-id']}, result = ${item['db-result']}`);
        }
    },
    SanitizeData: (product) => {
        let option = product['option'];
        if (option) {
            option['list'].forEach(oitem => {
                oitem['variations'].forEach(vitem => {
                    delete vitem['d'];
                });
            });
            option['kits'].forEach(kitem => {
                kitem['variations'].forEach(vitem => {
                    delete vitem['d'];
                });
            });
        }
        if (!option && product.hasOwnProperty('option')) {
            delete product['option'];
        }
    },
    ExtractUI: () => {
        var dpage, dbrief, ddetail, dshop, dNexist;
        dpage = document.querySelector(".page-product");
        dbrief  = dpage && dpage.querySelector(".product-briefing");
        ddetail = dpage && dpage.querySelector(".product-detail");
        dshop   = dpage && dpage.querySelector(".page-product__shop");
        dNexist = dpage && dpage.querySelector(".product-not-exist");

        var dname, ddesc, dcat, dbrand,
            dprice, doptions = [];
        var dmedia_click = null;
        var dbrief_right = null;
        var dshop_avatar, dshop_link;
        var dtmp;
        if (dbrief && ddetail && dshop) {
            for (var i = 0; i < dbrief.children.length; i++) {
                var ditem = dbrief.children[i];
                if (ditem.children.length) {
                    if (!dmedia_click) {
                        dmedia_click = ditem.children[0].children[0].children[0];
                        continue;
                    }
                    if (!dbrief_right) {
                        dbrief_right = ditem.children[0];
                        continue;
                    }
                }
            }
            for (var i = 0; i < dbrief_right.children.length; i++) {
                var ditem = dbrief_right.children[i];
                if (i === 0) {
                    dname = ditem.querySelector("span"); continue;
                }
                if (i === 2) {
                    dprice = ditem; continue;
                }
                if (i === 3) {
                    dtmp = ditem.querySelector(".product-variation");
                    if (dtmp) {
                        dtmp = dtmp.parentNode.parentNode.parentNode;
                        for (var j = 0; j < dtmp.children.length; j++) {
                            var doption = dtmp.children[j];
                            var dlabel = doption.querySelector("label");
                            if (dlabel) {
                                var name = dlabel.innerText.toLowerCase();
                                if (![""/*, "số lượng"*/].includes(name)) {
                                    doptions.push(doption);
                                } else { break; }
                            } else { break; }
                        }
                    }
                    if (doptions.length) { continue; }
                }
            }
            for (var i = 0; i < ddetail.children.length; i++) {
                var ditem = ddetail.children[i];
                if (i === 0) {
                    ditem.children[1].children.forEach(element => {
                        var label = element.children[0].innerText.toLowerCase();
                        if (["danh mục"].includes(label)) {
                            dcat = element.children[1];
                        }
                        if (["thương hiệu"].includes(label)) {
                            dbrand = element.children[1];
                        }
                    });
                }
                if (i === 1) {
                    ddesc = ditem.children[1];
                }
            }
            dshop_avatar = dshop.querySelector(".shopee-avatar");
            dshop_link = dshop_avatar.parentNode;
        }

        var dmodal = document.querySelector("#modal");
        var dmodal_inner = dmodal && dmodal.querySelector(":scope > [tabindex]");
        var dmodal_overlay = null;
        var dmodal_video = null;
        var dmodal_image = null;
        var dmodal_media_bar = null;
        var modal_opened = false;
        if (dmodal_inner) {
            modal_opened = true;
            dmodal_overlay = dmodal_inner.children[1];
            dmodal_video = dmodal.querySelector("video");
            dmodal_image = dmodal_video.nextSibling.children[0];
            dmodal_media_bar = dmodal_video.parentNode.nextSibling.children[1];
        }

        return {
            'dpage': dpage ? dpage : null,
            'dnexist': dNexist ? dNexist : null,
            'dname': dname ? dname : null,
            'ddesc': ddesc ? ddesc : null,
            'dcat': dcat ? dcat : null,
            'dbrand': dbrand ? dbrand : null,
            'dprice': dprice ? dprice : null,
            'doptions': doptions,
            'dmedia-click': dmedia_click ? dmedia_click : null,
            'dshop-link': dshop_link ? dshop_link : null,
            'dmodal-video': dmodal_video ? dmodal_video : null,
            'dmodal-image': dmodal_image ? dmodal_image : null,
            'dmodal-media-bar': dmodal_media_bar ? dmodal_media_bar : null,
            'dmodal-overlay': dmodal_overlay ? dmodal_overlay : null,
            'modal-opened': modal_opened,
            'dbrief-right': dbrief_right ? dbrief_right : null
        };
    },
    ConvertToCat: (dcat) => {
        var text = dcat.innerText;
        var split = text.split("\n");
        var filter = split.filter(item => {
            let name = item.toLowerCase();
            return !["shopee"].includes(name);
        });
        return filter;
    },
    ConvertToOptions: (doptions) => {
        var options = [], kits = [];
        doptions.forEach(doption => {
            var name = doption.querySelector("label").innerText;
            var variations = Array.prototype.map.call(
                doption.querySelectorAll(".product-variation"), dvariation => {
                return { 'd': dvariation, 'name': dvariation.innerText };
            });
            options.push({ name, variations });
            kits = kits.concat(Array
                    .apply(null, Array((kits.length || 1) * variations.length - kits.length))
                    .map(_ => { return { 'variations': [] }; }));
        });

        let num_children = 1;
        for (let oi = options.length - 1; oi > -1; oi--) {
            let option = options[oi];
            let variations = option.variations;
            let ki = 0; do {
                variations.forEach((vitem, vindex, varray) => {
                    for (let ni = 0; ni < num_children; ni++) {
                        let kit = kits[ki++];
                        let kitvs = kit['variations'];
                        kitvs.reverse();
                        kitvs.push({ 'type': option['name'], 'name': vitem['name'], 'd': vitem['d'] });
                        kitvs.reverse();
                    }
                });
            } while (ki < kits.length);
            num_children *= variations.length;
        }
        return options.length ? { 'list': options, 'kits': kits } : null;
    },
    ConvertToPrice: (dprice) => {
        var price = {};
        var utils = NPShopee.utils;
        var text = dprice.innerText;
        var array = text.split("\n");
        var price_1st = utils.normalizeNumber(array[0], "integer"),
            price_2nd = utils.normalizeNumber(array[1], "integer");

        if (!isNaN(price_1st)) {
            price['regular'] = price_1st;
        }
        if (!isNaN(price_2nd)) {
            price['sale'] = price_2nd;
        }
        return price;
    },
    ConvertToLinksEx: (dpage, info) => {
        var links = [];
        var utils = NPShopee.utils;
        var shop_id = info['product']['shop']['id'];
        var product_id = info['product']['id'];
        dpage.querySelectorAll(".product-shop-hot-sales a.item-card-special__link, .recommendation-by-carousel a[data-sqe='link']").forEach(ditem => {
            var dimg, dname;
            if (ditem.classList.contains("item-card-special__link")) {
                dimg = ditem.querySelector(".lazy-image__image");
                dname = ditem.querySelector(".item-card-special__name");
            } else {
                dimg = ditem.querySelector("img");
                dname = dimg.parentNode.nextSibling.children[0].children[0];
            }
            var urlo = utils.extractURL(ditem.getAttribute('href'), "product");
            if ((urlo['shop-id'] !== shop_id ||
                 urlo['product-id'] !== product_id) && links.every(link => {
                return  urlo['shop-id'] !== link['shop-id'] ||
                        urlo['product-id'] !== link['product-id'];
                })) {
                links.push({
                    'url': urlo['url'],
                    'shop-id': urlo['shop-id'],
                    'product-id': urlo['product-id'],
                    'product-name': dname.innerText
                });
            }
        });
        return links;
    },
    OptionNext: (kits) => {
        for (let i = 0; i < kits.length; i++) {
            let kit = kits[i];
            if (!["active", "inactive"].includes(kit['status'])) {
                return kit;
            }
        }
        return null;
    },
    OptionSelect: (kit) => {
        kit['variations'].forEach(item => {
            let  d = item['d'];
            if (!d.classList.contains("product-variation--selected")) {
                 d.click();
            }
        });
        kit['status'] = "selecting";
    },
    OptionUnSelect: attrs => {
        attrs.forEach(aitem => {
            aitem['variations'].forEach(vitem => {
                let d = vitem['d'];
                if (d.classList.contains("product-variation--selected")) {
                    d.click();
                }
            });
        });
    },
    StartProcess: async _ => {
        var utils = NPShopee.utils;
        var module = NPShopee['MCrawlProduct'];
        var ui = module.ExtractUI();
        var info = module.Info;
        var store = utils.getStorage(info['storage-name']) || {};
        var m_code = info['status']['code'] || "";
        if (m_code === "") {
            module.SetStatus("page:loading", "The page is being loaded.", info);
            module.Callback(); return;
        }
        if (m_code === "page:loading") {
            if (module.IsLoaded(ui)) {
                module.SetStatus("page:loaded", "The page has been loaded.", info);
            }
            module.Callback(); return;
        }
        if (m_code === "page:loaded") {
            store['status'] = "doing";
            utils.setStorage(info['storage-name'], store);

            var urlo = utils.extractURL(null, "product");
            info['product']['id'] = urlo['product-id'];
            info['product']['url'] = utils.setUrlParameter("np", null, urlo['url']);
            info['product']['shop']['id'] = urlo['shop-id'];

            if (ui['dnexist']) {
                info['product']['status'] = "nexist";
                module.SetStatus("option:retrieved", "The option have been retrieved.", info);
                module.Callback(); return;
            }

            info['product']['name'] = ui['dname'].innerText;
            info['product']['desc'] = ui['ddesc'].innerText;
            info['product']['cat'] = module.ConvertToCat(ui['dcat']);
            if (ui['dbrand']) {
                info['product']['brand'] = ui['dbrand'].innerText;
            }
            info['product']['price'] = module.ConvertToPrice(ui['dprice']);
            info['product']['option'] = module.ConvertToOptions(ui['doptions']);
            urlo = utils.extractURL(ui['dshop-link'].getAttribute('href'), "shop");
            info['product']['shop']['slug'] = urlo['shop-slug'];

            ui['dmedia-click'].click();
            module.SetStatus("media:popup-opening", "The media popup is being opened.", info);
            module.Callback(); return;
        }
        if (m_code === "media:popup-opening") {
            if (ui['modal-opened']) {
                module.SetStatus("media:popup-opened", "The media popup has been opened.", info);
            }
            module.Callback(); return;
        }
        if (m_code === "media:popup-opened") {
            ui['dmodal-media-bar'].children[0].click();
            module.SetStatus("media:retrieving", "The media are being retrieved.", info);
            module.Callback(); return;
        }
        if (m_code === "media:retrieving") {
            var type, url, url_prev, bar_url, bar_url_prev;
            var list = info['product']['media'];
            var dbar = ui['dmodal-media-bar'];
            if (ui['dmodal-image']) {
                type = "image";
                url = utils.parseURL(ui['dmodal-image'].style.backgroundImage);
            } else
            if (ui['dmodal-video']) {
                type = "video";
                url = ui['dmodal-video'].getAttribute('src');
            }
            bar_url = utils.parseURL(dbar.children[list.length].children[0].children[0].style.backgroundImage);
            if (list.length) {
                url_prev = list[list.length - 1]['url'];
                bar_url_prev = utils.parseURL(dbar.children[list.length - 1].children[0].children[0].style.backgroundImage);
            }

            if (url !== url_prev ||
                bar_url === bar_url_prev) {
                list.push({ type, url });
                if (list.length === dbar.children.length) {
                    ui['dmodal-overlay'].click();
                    module.SetStatus("media:retrieved", "The media have been retrieved.", info);
                }
                if (list.length !== dbar.children.length) {
                    dbar.children[list.length].click();
                }
            }
            module.Callback(); return;
        }
        if (m_code === "media:retrieved") {
            var option = info['product']['option'];
            if (option) {
                module.OptionSelect(module.OptionNext(option['kits']));
                module.SetStatus("option:retrieving", "The option are being retrieved.", info);
            } else {
                module.SetStatus("option:retrieved", "The option have been retrieved.", info);
            }
            module.Callback(); return;
        }
        if (m_code === "option:retrieving") {
            var kits = info['product']['option']['kits'];
            var kit = module.OptionNext(kits);
            var disabled = false;
            if (kit['status'] === "selecting") {
                if (Array.prototype.every.call(kit['variations'], item => {
                    let list = item['d'].classList;
                    if (list.contains("product-variation--disabled")) {
                        disabled = true;
                    }
                    return list.contains("product-variation--selected") || disabled;
                })) {
                    kit['status'] = "inactive";
                    if (!disabled) {
                        kit['price'] = module.ConvertToPrice(ui['dprice']);
                        kit['status'] = "active";
                    }
                    module.OptionUnSelect(info['product']['option']['list']);
                }
            }
            if (["active", "inactive"].includes(kit['status'])) {
                kit = module.OptionNext(kits);
                if (kit) {
                    module.OptionSelect(kit);
                } else {
                    module.SetStatus("option:retrieved", "The option have been retrieved.", info);
                }
            }
            module.Callback(); return;
        }
        if (m_code === "option:retrieved") {
            utils.scrollToBottom();
            module.SetStatus("page:scrolling", "The page is being scrolled.", info);
            module.Callback(); return;
        }
        if (m_code === "page:scrolling") {
            if (utils.scrollToBottom()) {
                module.SetStatus("page:scrolled", "The page has been scrolled.", info);
            }
            module.Callback(); return;
        }
        if (m_code === "page:scrolled") {
            info['product']['links-ex'] = module.ConvertToLinksEx(ui['dpage'], info);
            module.SetStatus("data:storing", "The data is being stored into the database.", info);
            if (info['auto-store']) { await module.StoreData(module); }
            module.SetStatus("data:stored", "The data has been stored into the database.", info);
            module.Callback(); return;
        }
        if (m_code === "data:stored") {
            store['status'] = "done";
            utils.setStorage(info['storage-name'], store);
            location.href = utils.setUrlParameter("np", null);
            console.log("np-shopee » crawler-product: The process has been finished.");
        }
    },
    SetStatus: (pCode, pMessage, pObject) => {
        let obj = pObject;
        obj['status']['code'] = pCode;
        obj['status']['message'] = pMessage;
        if (false) {
            console.log(`set-status: object = ${obj}, code = ${obj['status']['code']}, message = ${obj['status']['message']}`);
        }
        return obj;
    },
    Callback: (pTime) => {
        let time = pTime ? pTime : 1000;
        let module = NPShopee['MCrawlProduct'];
        module.setTimeoutID = setTimeout(() => { module.StartProcess(); }, time);
    },
    setTimeoutID: 0
};
NPShopee['MWP'] = {
    info: {
        'api-url': "https://shop.9link.pro/np-ecommerce/api-shopee-staging.php",
        'api-key': "shopee",
        'api-wp-url': "https://shop.9link.pro/wp-admin/admin-ajax.php",
        'api-wc-url': "https://shop.9link.pro/wp-json/wc/v3",
        'api-wc-key': "ck_3994dbfeb78e4cad2cfb72fb09611e49005a5c31",
        'api-wc-secret': "cs_5961e9ae68cb4e4d3c95a6319e2557812eba3042",
    },
    IPList: async (limit = 10, offset = 0) => {
        let module = NPShopee['MWP'];
        let info = module['info'];
        let url = `${info['api-url']}?api-key=${info['api-key']}`;
        url += `&api-action=crawler-list`;
        url += `&type=product`;
        url += `&status=crawled`;
        // -: url += `&crawl-ids=${[ 9868804353, 3222523639,6592945587 ].join(";")}`;
        url += `&limit=${limit}&offset=${offset}`;
        url += `&r=${new Date().getTime()}`;
        console.log(`-. limit = ${limit}, offset = ${offset}, url = ${url}`);

        if (!offset) {
            info['products'] = [];
        }
        var req = await fetch(url, { method: "get" });
        var res = await req.json();
        let list = res['data'];
        let products = info['products'];
        for (const item of list) {
            let product = JSON.parse(item['prod_object']);

            await module.IPSyncAttrs(product);
            product['sync-id'] = item['sync_id'];
            product['wc-req'] = module.IPWCBuild(product);
            products.push(product);
        }
        offset += list.length;
        if (list.length === limit && products.length < 100) {
            await module.IPList(limit, offset);
        } else {
            console.log(`[ np-wp ] number of products: ${products.length}`);
        }
    },
    IPAttrList: async _ => {
        let module = NPShopee['MWP'];
        let info = module['info'];
        let url, req, res;
        url = `${info['api-wc-url']}/products/attributes`;
        url += `?consumer_key=${info['api-wc-key']}`;
        url += `&consumer_secret=${info['api-wc-secret']}`;
        let auth = "Basic Y2tfYmZhZmZjNzZjODQ2YjRmZDI4YTg0M2YxNmQxYTk5ZGZhZDdiMmNhZjpjc19hYjkxNTlkOWRkOGYzOWY5MzNmZTM3MjllNjY5ZWI0NTlkYTcxNDA3";
        req = await fetch(url, { method: "get"/*, headers: { 'Authorization': auth }*/ });
        res = await req.json();
        info['attributes'] = res;
    },
    IPAttrSync: async name => {
        let module = NPShopee['MWP'];
        let info = module['info'];
        let url, data, req, res;
        url = `${info['api-wc-url']}/products/attributes`;
        url += `?consumer_key=${info['api-wc-key']}`;
        url += `&consumer_secret=${info['api-wc-secret']}`;
        data = {
            'name': name,
            'type': "select",
            'order_by': "menu_order",
            'has_archives': true
        };
        req = await fetch(url, {
            method: "post",
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            },
            body: JSON.stringify(data, null, 0) });
        res = await req.json();
        let attr = res;
        attr['options'] = [];
        info['attributes'].push(attr);

        return attr;
    },
    IPAttrFind: name => {
        let utils = NPShopee.utils;
        let module = NPShopee['MWP'];
        let attrs = module['info']['attributes'];
        let sname = utils.toSEO(name);
        let mname = ["kich-thuoc", "dung-tich"].includes(sname) ? "kich-thuoc-b-dung-tich" : "";
        sname = "pa_" + (mname ? mname : sname);
        let attr = null; attrs.some(item => {
            if (item['slug'].toLowerCase() === sname) {
                attr = item;
            }
            return attr;
        });
        return attr;
    },
    IPOptionList: async _ => {
        let module = NPShopee['MWP'];
        let info = module['info'];
        var attrs = info['attributes'];
        let url, req, res, page_size, item_limit, pages;
        page_size = 100, item_limit = 1000, pages = [];
        for (let i = 0; i < Math.ceil(item_limit / page_size); i++) {
            pages.push(i + 1);
        }
        url = `${info['api-wc-url']}/products/attributes/[$attr-id]/terms`;
        url += `?consumer_key=${info['api-wc-key']}`;
        url += `&consumer_secret=${info['api-wc-secret']}`;
        url += `&per_page=${page_size}&page=[$page]`;
        for (const attr of attrs) {
            for (const page_index of pages) {
                req = await fetch(url.replace("[$attr-id]", attr['id']).replace("[$page]", page_index), { method: "get" });
                res = await req.json();
                attr['options'] = page_index !== 1 ? attr['options'].concat(res) : res;
                if(page_size !== res.length) { break; }
            }
        }
    },
    IPOptionSync: async (name, attr) => {
        let module = NPShopee['MWP'];
        let info = module['info'];
        let url, data, req, res;
        url = `${info['api-wc-url']}/products/attributes/${attr['id']}/terms`;
        url += `?consumer_key=${info['api-wc-key']}`;
        url += `&consumer_secret=${info['api-wc-secret']}`;
        data = {
            'name': name
        };
        req = await fetch(url, {
            method: "post",
            headers: {
                'Content-Type': "application/json; charset=utf-8"
            },
            body: JSON.stringify(data, null, 0) });
        res = await req.json();
        attr['options'].push(res);

        return res;
    },
    IPOptionFind: (name, attr) => {
        let utils = NPShopee.utils;
        let sname = utils.toSEO(name);
        let mname = "";
        if (attr['id'] === 4) {
            if (sname === "lo-5-ml") {
                mname = "chai-5ml";
            }
            if (sname === "lo-5-ml-dung-thu") {
                mname = "chai-5ml-dung-thu";
            }
            if (sname === "lo-20-ml") {
                mname = "chai-20ml";
            }
        }
        sname = mname ? mname : sname;
        let opt = null;  attr['options'].some(item => {
            if (item['slug'].toLowerCase() === sname) {
                opt = item;
            }
            return opt;
        });
        return opt;
    },
    IPSyncList: async products => {
        let module = NPShopee['MWP'];
        console.log(`[ np-wp ] number of products: ${products.length}`);

        for (const item of products) {
            await module.IPSyncItem(item);
            console.log(`-. id = ${item['id']}, sync-id = ${item['sync-id']}, obj = ${item}`);
        };
    },
    IPSyncItem: async product => {
        let module = NPShopee['MWP'];
        let info = module['info'];
        let url, data, req, res;

        url = `${info['api-wp-url']}?action=np_wc_product_set`;
        product['wc-req'] = module.IPWCBuild(product); data = product['wc-req'];
        if (!data['error']) {
            req = await fetch(`${url}&r=${Math.random()}`, { method: "post", body: JSON.stringify(data) });
            res = await req.json();
            product['wc-res'] = res;
            product['sync-id'] = res['info-product']['data']['id'];
            product['status'] = "synced";
        } else {
            product['status'] = "error";
        }

        if (!(
            product['status'] === "synced" && !product['sync-id'])) {
            url = `${info['api-url']}?api-key=${info['api-key']}&api-action=crawler-product-add`;
            data = {
                'id': product['id'],
                'sync-id': product['sync-id'],
                'status': product['status'],
            }
            req = await fetch(`${url}&r=${Math.random()}`, { method: "post", body: JSON.stringify(data) });
            res = await req.json();
            product['db-result'] = res;
        } else {
            console.warn(`ERROR: SyncItem, prod-id = ${product['id']}, shop-id = ${product['shop']['id']}, info = `, product);
        }
    },
    IPSyncItemV2: async product => {
        let module = NPShopee['MWP'];
        let info = module['info'];
        let url, data, req, res;
        url = `${info['api-wp-url']}?action=np_wc_product_set`;
        product['wc-req'] = module.IPWCBuild(product); data = product['wc-req'];
        if (!data['error']) {
            let data1 = { 'product-wc': data['product-wc'] };
            if (data['image-fibu']) { data1['image-fibu'] = data['image-fibu']; }
            req = await fetch(`${url}&r=${Math.random()}`, { method: "post", body: JSON.stringify(data1) });
            res = await req.json();
            product['wc-res'] = res;
            product['sync-id'] = res['info-product']['data']['id'];

            if (data['variation']) {
                for (const item of data['variation']) {

                }
            }

            product['status'] = "synced";

            url = `${info['api-url']}?api-key=${info['api-key']}&api-action=crawler-product-add`;
            data = {
                'id': product['id'],
                'sync-id': product['sync-id'],
                'status': "synced"
            }
            req = await fetch(`${url}&r=${Math.random()}`, { method: "post", body: JSON.stringify(data) });
            res = await req.json();
            product['db-result'] = res;
        }
    },
    IPSyncAttrs: async (pProduct) => {
        var syncVarByAttr = function(pVariations, pAttrName, pSyncID) {
            pVariations.forEach(vitem => {
                for (let i = 0; i < vitem['variations'].length; i++) {
                    let aitem = vitem['variations'][i];
                    if (aitem['type'] === pAttrName) {
                        aitem['sync-type'] = pSyncID; break;
                    }
                }
            });
        };
        var syncVarByOption = function(pVariations, pAttrID, pOptName, pSyncName) {
            pVariations.forEach(vitem => {
                for (let i = 0; i < vitem['variations'].length; i++) {
                    let aitem = vitem['variations'][i];
                    if (aitem['name'] === pOptName &&
                        aitem['sync-type'] === pAttrID) {
                        aitem['sync-name'] = pSyncName; break;
                    }
                }
            });
        };

        let module = NPShopee['MWP'];
        let option = pProduct['option'];
        if (option) {
            let attributes = option['list'];
            let variations = option['kits'];
            for (const aitem of attributes) {
                let  aname = aitem['name'];
                let  attr = module.IPAttrFind(aname);
                if (!attr) { attr = await module.IPAttrSync(aname); }
                aitem['sync-id'] = attr['id'];
                syncVarByAttr(variations, aitem['name'], aitem['sync-id']);

                for (const oitem of aitem['variations']) {
                    let  oname = oitem['name'];
                    let  opt = module.IPOptionFind(oname, attr);
                    if (!opt) { opt = await module.IPOptionSync(oname, attr); }
                    oitem['sync-name'] = opt['name'];
                    syncVarByOption(variations, aitem['sync-id'], oitem['name'], oitem['sync-name']);
                };
            };
        }
    },
    IPWCBuild: (pProduct) => {
        let module = NPShopee['MWP'];
        let product = {};
        let product_id = pProduct['sync-id'];
        let product_wc = {}, image_fibu = {}, variation = [];
        try {
            product_wc['name'] = pProduct['name'];
            product_wc['description'] = pProduct['desc'];
            product_wc['manage_stock'] = true;
            product_wc['stock_quantity'] = 1024;
            product_wc['images'] = [];
            let option = pProduct['option'];
            if (option) {
                product_wc['type'] = "variable";
                let oattrs = module.IPWCBuildAttrs(option);
                product_wc['attributes'] = oattrs['list'];
                product_wc['default_attributes'] = oattrs['default'];

                product['variation'] = module.IPWCBuildVariations(option);
            }
            if (!option) {
                product_wc['type'] = "simple";
                product_wc['regular_price'] = pProduct['price']['regular'].toString();
                let price_sale = pProduct['price']['sale'];
                if (price_sale) {
                    product_wc['sale_price'] = price_sale.toString();
                }
            }

            let media_feature = "";
            pProduct['media'].forEach(item => {
                let type = "image", url = item;
                if (typeof url === "object") {
                    type = url['type']; url = url['url'];
                    if (type === "product") { type = "image"; }
                }
                if (type === "image") {
                    if (!media_feature) {
                        media_feature = url;
                        image_fibu['feature'] = url;
                    } else {
                        if (!image_fibu.hasOwnProperty('gallary')) {
                            image_fibu['gallary'] = [];
                        }
                        image_fibu['gallary'].push(url);
                    }
                }
            });

            if (product_id) {
                product['id'] = product_id;
            }
            product['product-wc'] = product_wc;
            product['image-fibu'] = image_fibu;
        } catch (err) {
            product['error'] = err.stack;
            console.warn(`ERROR: WCBuild, prod-id = ${pProduct['id']}, shop-id = ${pProduct['shop']['id']}, error = ${err.stack}`);
        }
        return product;
    },
    IPWCBuildAttrs: (pAttr) => {
        let alist = [], adefault = [];
        pAttr['list'].forEach(item => {
            let aitem = {};
            aitem['id'] = item['sync-id'];
            aitem['position'] = 0;
            aitem['visible'] = true;
            aitem['variation'] = true;
            aitem['options'] = item['variations'].map(oitem => oitem['sync-name']);
            alist.push(aitem);
        });
        return { 'list': alist, 'default': adefault };
    },
    IPWCBuildVariations: (pAttr) => {
        let vlist = [];
        pAttr['kits'].forEach(item => {
            let active = item['status'] !== "inactive";
            let vitem = {};
            if (active) {
                vitem['regular_price'] = item['price']['regular'].toString();
            }
            vitem['attributes'] = item['variations'].map(aitem => { return {
                'id': aitem['sync-type'],
                'option': aitem['sync-name']
            }});
            vlist.push(vitem);
        });
        return vlist;
    },
    StartProcess: async _ => {
        let module = NPShopee['MWP'];
        await module.IPAttrList();
        await module.IPOptionList();
        await module.IPList();

        let attrs = module['info']['attributes'];
        let prods = module['info']['products'];
        console.log("-. attributes:", attrs, ", products:", prods);
        await module.IPSyncList(prods);
    },
};
NPShopee.StartProcess();
/* Shopee Scripts
var info = NPShopee['MAdsKeyword'].Info;
info['product-name'] = "TM";
info['keyword-type'] = "tu-khoa-chinh-xac";
NPShopee['MAdsKeyword'].SetStatus("popup", "", NPShopee['MAdsKeyword'].Info);
NPShopee['MAdsKeyword'].Ads['product-name'] = "*TM";
NPShopee['MAdsKeyword'].Info;
NPShopee['MAdsKeyword'].StartProcess();
NPShopee['MAdsKeyword'].StopProcess();

NPShopee['MStatsKeyword'].Info;
clearTimeout(NPShopee['MStatsKeyword'].setTimeoutID);
NPShopee['MStatsKeyword'].ResetProcess();
NPShopee['MStatsKeyword'].StartProcess();

NPShopee['MCrawlShop'].StartProcess();
NPShopee['MCrawlProduct'].StartProcess();
https://shopee.vn/?np=crawl
https://shopee.vn/shop/207437129/?np=crawl-shop
https://shopee.vn/product/69885015/5460586511/?np=crawl-product
*/