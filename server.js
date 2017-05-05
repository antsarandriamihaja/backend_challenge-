const express = require('express');
//const path = require('path');

const { getData, getUrl_list, getOrders, getUnfulfilled } = require('./utils.js');
var app = express();
var port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    var api_url = 'https://backend-challenge-fall-2017.herokuapp.com/orders.json';
    var list = getUrl_list(api_url, (list) => {
        var count = 0;
        for (var i = 0; i < list.length; i++) {
            var url = list[i];
            var orders = getData(url, (response) => {
                 count ++;
                if (count === list.length){
                    getOrders(response, (obj)=>{
                        res.send(getUnfulfilled(obj));
                    });
                }
            })
        }
    });
});

app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
})