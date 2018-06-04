var mysql  = require('mysql');
/*
var connection = mysql.createConnection({
    host    :'127.0.0.1',
    port : 3306,
    user : 'mixandmalt2',
    password : 'mixandmalt123',
    database:'mixandmalt2'
});
*/

var connection = mysql.createConnection({
    host    :'127.0.0.1',
    port : 3306,
    user : 'wookie002',
    password : 'Wlsdnr79',
    database:'mixandmalt'
});

module.exports = connection;