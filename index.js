const OS = require('os');
const Util = require('util');
const Exec = require('child_process').exec;
const ExecPromise = Util.promisify(Exec);
const F = require('./functions');
const alert = require('alert');
const express = require('express');
var app = express();
const mysql = require('mysql2');

var con = mysql.createConnection({
    host: "localhost",
    database: "collection",
    user: "root",
    password: "sastra123"
});

app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'));

app.set('view engine','ejs');
app.get('/',(req,res)=>{
    res.render('main');
})

function sendData(table){
    con.connect(function(err){
        console.log("send data to database");
        if(err) throw err;
        var q;
        for(var i = 0;i<table.length;i++){

                q = "insert into ip_mac values ('"+table[i].ip+"','"+table[i].mac+"','static')";
                con.query(q,function(err,result){
                if(err) throw err;
                });
        }   
    });
}
function TruncData(){
    con.connect(function(err){
        console.log("truncate data from database");
        if(err) throw err;
        var q = "Truncate table ip_mac";
        con.query(q,function(err,result){
            if(err) throw err;
        })
    });
};

app.get('/collectIP_MAC',(req,res)=>{
    console.log("hello");
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
            TruncData();
            sendData(table);
        });

});

app.post('/addIP',(req,res)=>{
    var cip = req.body.ip;
    var cmac = req.body.mac;
    con.query("select * from ip_mac where ip='"+cip+"'" , (err,result)=>{
        if(err) throw err;
        console.log(result);
        console.log(cip);
        console.log(cmac);
        //console.log(result[0].iptype);
        if(result == ""){
            con.query("insert into ip_mac values ('"+cip+"','"+cmac+"','static')",(err,result)=>{
                if(err) throw err;
                else alert("Inserted succefully !!");
             });
        }
        else{
            alert("The given IP address is already present !!!");
        }
    });
    
});

app.post('/checkIP',(req,res)=>{
    var cip = req.body.ip;
    var cmac = req.body.mac;
    var ciptype = req.body.iptype;
    console.log(cip);
    console.log(cmac);
    console.log(ciptype);

    con.query("select * from ip_mac where ip='"+cip+"'" , (err,result)=>{
        console.log(result);
        if(err) throw err;
        else{
            if(result == ""){
                con.query("select * from ip_mac where mac = '"+cmac+"'", (err,result)=>{
                    if(err) throw err;
                    else if(cip != result[0].ip && cmac == result[0].mac && ciptype == "dynamic")
                    alert("There is a Poisoning attack !!!");
                    else
                    alert("No such pair availabel.");
                })
                }
            else if(cip == result[0].ip && cmac != result[0].mac && ciptype == "dynamic")
                alert("There is a Spoofing attack !!!");
            else if(cip == result[0].ip && cmac == result[0].mac && ciptype == "dynamic")
                alert("There is a impersonation attack !!!!");
            else if(cip == result[0].ip && cmac == result[0].mac && ciptype === "static")
                alert("The IP-MAC pair is ready to authorize.");
        }
    });
});

app.post('/deleteIP',(req,res)=>{
    var cip = req.body.ip;

    con.query("delete from ip_mac where ip='"+cip+"'" , (err,result)=>{
        if(err) throw err;
    })
})

app.get('/clearAll',(req,res)=>{
    TruncData();
})


app.listen(4040,()=>console.log("hello proxy is listening"))