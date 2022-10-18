(function() {
var $this = {
    dev_id: "",
    dev_auth: "",
    utils: {
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
        let url  = `https://playconsolemonetization-pa.clients6.google.com/v1/developer/${this['dev_id']}`;
            url += `/${path}?%24httpHeaders=Content-Type%3Aapplication%2Fjson%2Bprotobuf%0D%0AX-Goog-Api-Key%3AAIzaSyBAha_rcoO_aGsmiR5fWbNfdOjqT0gXwbk%0D%0AX-Play-Console-Session-Id%3A4F012EE8%0D%0AX-Goog-AuthUser%3A0%0D%0AAuthorization%3A${this['dev_auth']}%0D%0A`;
        return { url };
    },
    FetchAuth: function() {
        return new Promise((resolve, reject) => {
            if ($this['dev_id'] && $this['dev_auth']) {
                resolve();
            } else { (function (xhr) {
                    var open = XMLHttpRequest.prototype.open;
                    xhr.prototype.open = function() {
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
                                    $this['dev_id'] = id, $this['dev_auth'] = oheaders['Authorization']; resolve();
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
                        "1": "1199145600",
                        "2": 0
                    },
                    "2": {
                        "1": "1666051199",
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
                    data['orders'] = dataf['1'].map(function (item) {
                        let id = item['1'];
                        let time = item['9'];
                        let status = "";
                        if (item['2'] && item['3'] === 4) { status = "da tinh phi"; }
                        if (item['2'] && item['3'] === 5) { status = "dang xu ly giao dich hoan tien"; }
                        if (item['2'] && item['3'] === 6) { status = "da hoan tien"; }
                        if (item['5'] === 1) { status = "tien tra bi tu choi"; }
                        let currency = item['15']['1'];
                        let amount  = parseInt(item['15']['2'] || "0");
                            amount += (item['15']['3'] || 0) / 1000000000;
                        let pname = [ item['11']['1'], item['11']['2'] ];
                        let rfparam = item['23']['1'];
                        return { 'id': id, 'time': time, 'status': status, amount: amount, 'currency': currency, 'rf-param': rfparam, 'p-name': pname };
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
    OrderRefund: function (order) {
        let message = "";
        return new Promise((resolve, reject) => {
            let url = $this.FetchInfo("orders:refund")['url'];
            let body =
            {
                "6": 1,
                "7": "",
                "8": [
                    {
                        "1": order['id'],
                        "2": false
                    }
                ],
                "10": {
                    "1": this['dev_id']
                },
                "11": [
                    {
                        "1": order['rf-param']
                    }
                ]
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
                    if (dataf['2'] === 1) {
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
    RefundStart: async function(refund) {
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
        console.log(`[ np-gpc ] orders =`, orders);

        let orders_rf = orders.filter(item => ["da tinh phi", ""].includes(item['status']));
        for (let i = 0; i < orders_rf.length; i++) {
            let order = orders_rf[i];
            let result = null;
            if (refund) {
                result = await $this.OrderRefund(order);
            }
            console.log(`[ np-gpc ] ${i + 1}. id: ${order['id']}, rf-param: ${order['rf-param']}, amount: ${order['amount']} ${order['currency']}, product: ${order['p-name'].join(" > ")}, status: ${order['status']}, result:`, result);
        }
        return orders;
    },
    StartProcess: function() {
        console.log(`[ np-gpc ] version: ${NPGPC['version']}`);
        console.log(`[ np-gpc ] authorization is being grabbed.`);
        $this.FetchAuth().then(() => {
            console.log(`[ np-gpc ] authorization has been grabbed, id: ${$this['dev_id']}, auth: ${$this['dev_auth']}`);
        });
    },
    version: "0.0.3",
};
window['NPGPC'] = $this;
})();
NPGPC.StartProcess();