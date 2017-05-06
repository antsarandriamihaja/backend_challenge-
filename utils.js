var api_url = 'https://backend-challenge-fall-2017.herokuapp.com/orders.json';
const _ = require('lodash');
const getJSON = require('get-json');
var orders = [];

//get list of all api_urls based on pages
var getUrl_list = (api_url, callback) => {
    var list_url = [];
    list_url.push(api_url);
    getJSON(api_url, (err, response) => {
        if (err) { console.log(err) };
        var pages = Math.ceil(response.pagination.total / response.pagination.per_page);
        for (var i = 2; i < pages + 1; i++) {
            var url = api_url + '?page=' + i;
            list_url.push(url);
        }
        console.log(list_url);
        callback(list_url)
    })
};

//filter json data to return cookie orders that are unfulfilled 
var getData = (url, callback) => {
    var res = {};
    getJSON(url, (err, response) => {
        if (err) { console.log(err) };
        res['available_cookies'] = response.available_cookies;
        response.orders.map((order) => {
            var data = {};
            data.id = order.id;
            var products = order.products.filter((item) => {
                var title = Object.keys(item)[0];
                var amount = Object.keys(item)[1];
                if (item[title] === 'Cookie' && item[amount] < response.available_cookies) { return item }
            });
            if (products.length > 0) { data.products = products }
            if (order.fulfilled === false) {
                data.fulfilled = order.fulfilled;
            }
            if (data.hasOwnProperty('products') && data.hasOwnProperty('fulfilled') && (_.findIndex(orders, data) === -1)) {
                    orders.push(data);
            }
        })
        res['orders'] = orders;
        callback(res);
    });
}

//sort data by amount of cookies, and by id, get amount of remaining cookies
var getOrders = (response, callback) => {
    var obj = {}
    var available_cookies = response.available_cookies;
    var remaining_cookies = available_cookies;
    var orders = response.orders;
    var sorted_orders = orders.sort((a, b) => { return (a.products[0].amount < b.products[0].amount) ? 1 : ((b.products[0].amount > a.products[0].amount) ? -1 : 0); });
    var needed_data = sorted_orders.map((order) => {
        var item = {};
        item.id = order.id;
        item.amount_cookie = order.products[0].amount;
        return item
    })
    var sorted = needed_data.sort(function (x, y) {
        var n = y.amount_cookie - x.amount_cookie;
        if (n !== 0) {
            return n;
        }
        return x.id - y.id;
    });
    obj['remaining_cookies'] = remaining_cookies;
    obj['sorted_orders'] = sorted
    callback(obj);

}

//get unfulfilled result based on amount of cookie and id of order.
var getUnfulfilled = (obj) => {
    var remaining = obj.remaining_cookies;
    var sorted = obj.sorted_orders;
    var result = {}
    var unfulfilled_orders = [];
    for (var i = 0; i < sorted.length; i++) {
        var item = sorted[i];
        if (remaining < item.amount_cookie) {
            unfulfilled_orders.push(item.id);
            continue;
        }
        if (remaining >= item.amount_cookie) {
            remaining -= item.amount_cookie;
        }
    }
    if (Object.keys(result.length === 0)) {
        result['remaining_cookies'] = remaining;
        result['unfulfilled_orders'] = unfulfilled_orders;
        return result
    }
}


module.exports = { getData, getUrl_list, getOrders, getUnfulfilled };

