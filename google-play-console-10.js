(function() {
var $this = {
    dev_id: "", dev_auth: null,
    'order-time-sta': null, 'order-time-end': null,
    'orders': [], 'orders-rf': [],
    utils: {
        MinTimeInDay: (_data) => {
            if (typeof _data !== "object" || _data == null) {
                return null;
            }
            return new Date(_data.getFullYear(), _data.getMonth(), _data.getDate(), 0, 0, 0, 0);
        },
        MaxTimeInDay: (_data) => {
            if (typeof _data !== "object" || _data == null) {
                return null;
            }
            return new Date(_data.getFullYear(), _data.getMonth(), _data.getDate() + 1, 0, 0, -1, 0);
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
    },
    FetchInfo: function (path) {
        let headers = []; for (let name in $this['dev_auth']) {
            let hvalue = $this['dev_auth'][name];
            if (![ "Authorization" ].includes(name)) {
                hvalue = encodeURIComponent(hvalue);
            };
            headers.push(`${encodeURIComponent(`${name}:`)}${hvalue}`);
        }
        let nline = encodeURIComponent("\r\n");
        let url  = `https://playconsolemonetization-pa.clients6.google.com/v1/developer`
            url += `/${$this['dev_id']}/${path}`;
            url += `?${encodeURIComponent("$httpHeaders")}=${headers.join(nline) + nline}`;
        return { url };
    },
    FetchAuth: function() {
        return new Promise((resolve, reject) => {
            if ($this['dev_id'] && $this['dev_auth']) {
                resolve();
            } else { (function (xhr) {
                    var open = XMLHttpRequest.prototype.open;
                    xhr.prototype.open = function() {
                        console.log(`[ xhr ] url:`, arguments[1]);
                        if (!$this['dev_id'] && !$this['dev_auth']) {
                            console.log(`[ xhr ] arguments:`, arguments);
                            let url = arguments[1];
                            let reg = new RegExp("/developers/(\\d+)/[^\\?]+(\\?[\\s\\S]+)", "i"), exec = reg.exec(url);
                            if (exec) {
                                let id = exec[1];
                                let query = exec[2];
                                let sheaders = decodeURIComponent($this.utils.getUrlParameter("$httpHeaders", query));
                                let oheaders = {}; sheaders.split("\r\n").forEach(function (item) {
                                    let index = item.indexOf(":");
                                    if (index !== -1) {
                                        oheaders[item.substring(0, index)] = item.substring(index + 1);
                                    }
                                });
                                if (id && oheaders['Authorization']) {
                                    $this['dev_id'] = id, $this['dev_auth'] = oheaders; resolve();
                                }
                                console.log(`[ xhr ] id: ${id}, headers:`, oheaders);
                            }
                        }
                        open.apply(this, arguments);
                    };
            })(XMLHttpRequest); }
        });
    },
    OrderList: function (page, oid = "") {
        let message = "";
        return new Promise((resolve, reject) => {
            let url = $this.FetchInfo("orders:fetch")['url'];
            let body =
            {
                "4": {
                    "1": {
                        "1": `${parseInt($this['order-time-sta'].getTime() / 1000)}`,
                        "2": 0
                    },
                    "2": {
                        "1": `${parseInt($this['order-time-end'].getTime() / 1000)}`,
                        "2": 0
                    },
                    "3": oid
                },
                "5": {
                    "1": this['dev_id']
                },
                "7": page,
                "8": 25
            }
            fetch(url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "vi",
                "content-type": "text/plain;charset=UTF-8",
                "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-client-data": "CKO1yQEIirbJAQimtskBCMG2yQEIqZ3KAQjd08oBCML5ygEIkqHLAQi2vMwBCJq9zAEI48vMAQiL3cwBCPHfzAEIw+HMAQjH48wBCMTkzAEI+ujMAQ=="
            },
            "referrer": "https://play.google.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": JSON.stringify(body, null, 0),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
            }).then(res => {
                if (res.ok) { res.json().then(dataf => {
                    // -: console.log(`[ google-play-console ] data:`, dataf);
                    let data = {
                        'orders': [],
                        'page-next': dataf["2"],
                    };
                    data['orders'] = (dataf['1'] || []).map(function (item) {
                        let id = item['1'];
                        let time = item['9'];
                        let status = "";
                        if (item['2'] && item['3'] === 4) { status = "da tinh phi"; }
                        if (item['2'] && item['3'] === 5) { status = "dang xu ly giao dich hoan tien"; }
                        if (item['2'] && item['3'] === 6) { status = "da hoan tien"; }
                        if (item['2'] && item['3'] === 7) { status = "da hoan lai mot phan tien"; }
                        if (item['2'] && item['3'] === 8) { status = "dang xu ly giao dich hoan tien mot phan"; }
                        if (item['5'] === 1) { status = "tien tra bi tu choi"; }
                        let currency = item['15']['1'];
                        let amount  = parseInt(item['15']['2'] || "0");
                            amount += (item['15']['3'] || 0) / 1000000000;
                        let amountvnd = amount * (
                            currency === "USD" ? 25000 :
                            currency === "MYR" ?  6000 : 1);
                        let pname = [ item['11']['1'], item['11']['2'] ];
                        let pkname = item['13'];
                        let addr_country = item['14']['2'], addr_state = item['14']['4'], addr_city = item['14']['3'], addr_zipcode = item['14']['5'];
                        let payment_type =
                            (addr_country && addr_state && addr_city && addr_zipcode) ? "mail" :
                            (addr_country == "VN" && addr_zipcode) ? "momo" :
                            (addr_country == "VN") ? "zalopay" : "";
                        let rfparam = [ item['22'], item['23']['1'] ];
                        return {
                            'id': id, 'time': time, 'status': status, 'amount': amount, 'currency': currency, 'payment-type': payment_type, 'rf-param': rfparam,
                            'pk-name': pkname, 'p-name': pname, 'addr-country': addr_country, 'addr-state': addr_state, 'addr-city': addr_city, 'addr-zipcode': addr_zipcode, 'amount-vnd': amountvnd };
                    });
                    resolve(data);
                }); } else {
                    message = `The process has been occurred an exception [ status = ${res.status} ]`;
                    reject(message);
                }
            }).catch(err => {
                message = `The process has been occurred an exception [ message= ${err.message}, stack = ${err.stack} ]`;
                reject(message);
            });
        });
    },
    OrderFill: async function () {
        let orders = [], page = "";
        do {
            let result = await $this.OrderList(page);
            orders = orders.concat(result['orders']);
            console.log(`[ np-gpc ] orders.length: ${orders.length}, result:`, result, );
            page = result['page-next']; if (page) {
                await new Promise((resolve, reject) =>{
                    setTimeout(resolve, 5 * 1000, "foo"); });
            }
        } while (page);
        $this['orders'] = orders;

        let orders_rf = orders
            .filter(item => item['amount'] !== 0 && ["da tinh phi", "da hoan lai mot phan tien", ""].includes(item['status']))
            .sort((a, b) => (b['amount-vnd'] - a['amount-vnd']));
        $this['orders-rf'] = orders_rf;

        let total_amount_rf = orders_rf.reduce((prev, order) => prev + order['amount-vnd'], 0);
        console.log(`[ np-gpc ] orders.length: ${$this['orders'].length}, rf-amount: ${total_amount_rf} VND, rf-orders:`, $this['orders-rf']);
    },
    OrderRefund: async function (orders, test) {
        let url = $this.FetchInfo("orders:refund")['url'];
        let body = {
            "6": 1,
            "7": "",
            "8": [],
            "10": {
                "1": $this['dev_id']
            },
            "11": [{}]
        };
        let famount = function (order) {
            let ovalue = { '1': order['id'] };
            let percent = order['rf-percent'];
            if (percent !== 100) {
                let amount = order['amount'] * percent / 100;
                let amount_odd = parseInt(amount % 1 * 1000000000);
                ovalue['3'] = {
                    '1': order['currency'],
                    '2': parseInt(amount).toString()
                };
                if (amount_odd) {
                    ovalue['3']['3'] = amount_odd;
                }
                ovalue['4'] = `${order['id']}:0`;
                ovalue['5'] = order['rf-param'][0];
            }
            if (percent === 100) {
                ovalue['2'] = false;
            }
            return ovalue;
        };
        for (let i = 0; i < orders.length; i++) {
            let order = orders[i];
            if (typeof order === 'string') {
                let result = await $this.OrderList("", order);
                order = result['orders'][0];
                orders[i] = order;
            }
            if (!order['rf-percent']) {
                if (!['USD'].includes(order['currency']) &&
                    !["da hoan lai mot phan tien"].includes(order['status'])) {
                    order['rf-percent'] = 100;
                } else {
                    order['rf-percent'] = 100;
                }
            }
            if (!order['rf-reason']) {
                 order['rf-reason'] = 1;
            }
            // '1': "nguoi mua hoi tiec", '2': "chua nhan duoc mat hang", '3': "san pham bi loi", '4': "mua hang ngau nhien", '5': "don dat hang gian lan", '6': "gian lan khong co y", '7': "khac"
            console.log(`[ np-gpc ] refund.item | ${i + 1}. id: ${order['id']}, amount: ${order['amount']} ${order['currency']}, rf-percent: ${order['rf-percent']}%, rf-reason: ${order['rf-reason']}`);

            body['7'] = "have you bought it randomly?";
            body['8'].push(famount(order));
            if (!i) {
                body['6'] = order['rf-reason'];
                body['11'][0]['1'] = order['rf-param'][1];
            }
        }
        let message = "";
        return new Promise((resolve, reject) => {
            if (test) {
                resolve({ test }); return;
            }
            fetch(url, {
            "headers": {
                "accept": "*/*",
                "accept-language": "vi",
                "content-type": "text/plain;charset=UTF-8",
                "sec-ch-ua": "\"Chromium\";v=\"106\", \"Google Chrome\";v=\"106\", \"Not;A=Brand\";v=\"99\"",
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": "\"Windows\"",
                "sec-fetch-dest": "empty",
                "sec-fetch-mode": "cors",
                "sec-fetch-site": "same-site",
                "x-client-data": "CKO1yQEIirbJAQimtskBCMG2yQEIqZ3KAQjd08oBCML5ygEIkqHLAQi2vMwBCJq9zAEI48vMAQiL3cwBCPHfzAEIw+HMAQjH48wBCMTkzAEI+ujMAQ=="
            },
            "referrer": "https://play.google.com/",
            "referrerPolicy": "strict-origin-when-cross-origin",
            "body": JSON.stringify(body, null, 0),
            "method": "POST",
            "mode": "cors",
            "credentials": "include"
            }).then(res => {
                if (res.ok) { res.json().then(dataf => {
                    if (dataf['1'] instanceof Array && dataf['2'] == 1) {
                        console.error(`[ np-gpc ] The number of refunds is exceeded. Please retry after 24 hours.`);
                    }
                    if (dataf['1'] || dataf['3']) {
                        reject(dataf);
                    } else {
                        resolve(dataf);
                    }
                }); } else {
                    message = `The process has been occurred an exception [ status = ${res.status} ]`;
                    reject(message);
                }
            }).catch(err => {
                message = `The process has been occurred an exception [ message= ${err.message}, stack = ${err.stack} ]`;
                reject(message);
            });
        });
    },
    RefundStart: async function(paraml) {
        let rf_test = !!paraml['rf-test'];
        let rf_async = paraml['rf-async'];
        let rf_page_size = paraml['rf-page-size'] || 10;
        let rf_page_times = paraml['rf-page-times'] || Number.MAX_SAFE_INTEGER;
        let rf_delay_time = paraml['rf-delay-time'] || 5000;
        let rf_list = [];
        $this['orders-rf'].forEach(order => {
            if (rf_list.length === 0 ||
                rf_list[rf_list.length - 1].length === rf_page_size) {
                rf_list.push([]);
            }
            rf_list[rf_list.length - 1].push(order);
        });
        console.log(`[ np-gpc ] refund.list | test: ${rf_test}, page-size: ${rf_page_size}, page-times: ${rf_page_times}, delay-time: ${rf_delay_time}, list:`, rf_list)

        for (let i = 0; i < rf_list.length; i++) {
            if (rf_page_times === i) { break; }
            let rf_item = rf_list[i];
            let rf_result = null;
            if (rf_async) {
                rf_result = $this.OrderRefund(rf_item, rf_test);
            } else {
                i && await new Promise((resolve, reject) => {
                    setTimeout(resolve, rf_delay_time, "foo"); });
                rf_result = await $this.OrderRefund(rf_item, rf_test);
            }
            console.log(`[ np-gpc ] refund.list | ${i + 1}. orders:`, rf_item, `, result:`, rf_result);
        }
    },
    StartProcess: function() {
        console.log(`[ np-gpc ] version: ${NPGPC['version']}`);
        console.log(`[ np-gpc ] authorization is being grabbed.`);
        $this.FetchAuth().then(() => {
            console.log(`[ np-gpc ] authorization has been grabbed, id: ${$this['dev_id']}, auth:`, $this['dev_auth']);
            let d = new Date(); d.setDate(d.getDate() + 1);
            $this['order-time-sta'] = new Date(2008, 0, 1, 0, 0, 0, 0);
            $this['order-time-end'] = $this.utils.MinTimeInDay(d);
            // Nov 03: $this.OrderFill();
        });

        /* intercept of "fetch" request / response
        const constantMock = window.fetch;
        window.fetch = function() {
            console.log(`[ fetch ] arguments:`, arguments);
            return constantMock.apply(this, arguments);
        };*/
        /*
        (function (open) {
            XMLHttpRequest.prototype.open = function (XMLHttpRequest) {
                var self = this;
                this.addEventListener('readystatechange', function() {
                    if (this.responseText.length > 0 &&
                        this.readyState == 4 &&
                        this.responseURL.indexOf('/orders:fetch?')) {
                        Object.defineProperty(self, 'response', {
                            get: function() { return this.bValue; },
                            set: function (newValue) { this.bValue = newValue; },
                            enumerable: true,
                            configurable: true
                        });
                        console.log(`[ xhr ] readystatechange, response:`, self.response);
                    }
                });
                open.apply(this, arguments);
            };
        })(XMLHttpRequest.prototype.open);*/
        var rawOpen = XMLHttpRequest.prototype.open;

        XMLHttpRequest.prototype.open = function() {
            if (!this._hooked) {
                this._hooked = true;
                setupHook(this);
            }
            rawOpen.apply(this, arguments);
        }
        
        function setupHook(xhr) {
            function getter() {
                console.log('get responseText:', xhr.responseText);
        
                delete xhr.responseText;
                var ret = xhr.responseText;
                setup();
                return ret;
            }
        
            function setter(str) {
                console.log('set responseText: %s', str);
            }
        
            function setup() {
                Object.defineProperty(xhr, 'responseText', {
                    get: getter,
                    set: setter,
                    configurable: true
                });
            }
            setup();
        }
    },
    version: "0.3.5",
};
window['NPGPC'] = $this;
})();
NPGPC.StartProcess();