const OS = require('os');
const Util = require('util');
const Exec = require('child_process').exec;
const ExecPromise = Util.promisify(Exec);
const F = require('./functions');
var mysql = require('mysql2');
const { error } = require('console');
const { stdout, stderr, send, exit } = require('process');
const express = require('express');
const { url } = require('inspector');
var app = express();
    //var table = [];

    var con = mysql.createConnection({
        host: "localhost",
        database: "collection",
        user: "root",
        password: "sastra123"
    });

    function sendData(table){
        con.connect(function(err){
            console.log("send data to database");
            if(err) throw err;
            var q;
            for(var i = 0;i<table.length;i++){
                if(table[i].iptype==='static'){

                    q = "insert into ip_mac values ('"+table[i].ip+"','"+table[i].mac+"','"+table[i].iptype+"')";
                    con.query(q,function(err,result){
                    if(err) throw err;
                    });
                }
            }   
        });
    }

    function checkData(){};

    function TrunData(){
        con.connect(function(err){
            console.log("truncate data from database");
            if(err) throw err;
            var q = "Truncate table ip_mac";
            con.query(q,function(err,result){
                if(err) throw err;
            })
        });
    };

    function deleteData(){
        con.connect(function(err){
            console.log("Deleting the data ");

        })
    }

//TrunData();
/*app.get( */

// app.get("/",function addIP_Mac(req,res){

app.get('/',(req,res)=>{
    return new Promise(()=>{
        let flag = '-a';
        let args = ['arp', flag];

        let command = args.join(' ');
        // Get the Address Resolution Protocol cache
        Exec(command, (error,stdout,stderr) => {
            if (error) {
                window.Error(`error: ${error.message}`);
                return;
              }
            const rows = stdout.split('\n');
            
            const table = [];
            for (const row of rows) {
                let words = row.trim().replace(/\s+/g, ' ').split(' ');
                let rIp = null;
                let rMac = null;
                let type = null;
                rIp = words[0];
                rMac = words[1];
                type = words[2]

                if (!F.isMAC(rMac)){
                    continue;
                }
                table.push({
                    ip: rIp,
                    mac: F.normalizeMAC(rMac),
                    iptype : type,
                });
            }
            console.table(table,["ip","mac","iptype"]);
            console.log(table.length);
            sendData(table);
        })
    })
});
    
    

    // con.connect(function(err){
    //     var query = "delete from table where ip = "+ip;
    //     con.query(query,function(err){
    //         if(err) throw err;
    //     })
    // })
//     res.send("console.log('ip is added')")
// });
//addIP_Mac();
//document.getElementById("add").onclick = addIP_Mac();


// app.get('/',arpTable());

// app.get("/",(req,res)=>{
//     res.sendFile('./index.html',{root:__dirname});
// });

// app.listen(4040,function(){
//     console.log("App listening to port 4040");
// }) 