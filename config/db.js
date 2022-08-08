// let mysql =require('mysql');
// let connection = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: 'nizanth7',
//     database: 'yatta'
// });



const MysqlCache = require('mysql-cache')

var connection = new MysqlCache({
	host     : 'localhost',
	user     : 'root',
	password : 'nizanth7',
	connectionLimit : 1000, 
	database : 'family_tree',
	hashing: 'farmhash64',
	prettyError:true,
	stdoutErrors: true,
	verbose: true,
	TTL: 0,
	caching: true,
	cacheProvider:   'LRU',
	cacheProviderSetup: {
        // For example when we use memcached (checking the module configuration object) we can do this:
        serverLocation: 'localhost:12000',
        options: {
            retries:10,
            retry:10000,
            remove:true,
            failOverServers:['localhost:12000'],
        }
    }

});
connection.connect(function(err) {
    if (err) throw err;
    
});

module.exports = connection; 

