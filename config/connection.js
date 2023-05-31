//Import MySQL2 package to connect MySQL database and perform queries
const mysql = require("mysql2")

//Define connection to MySQL
const connection = mysql.createConnection({
    host: '127.0.0.1', //localhost
    port: 3306,
    // username
    user: 'root',
    //My password
    password: '!Pa55w0r--d$',
    database: 'employee_db'
});

module.exports= connection;