const { request, response } = require('express');
const express = require('express');
const path = require('path');


var Chart = require('chart.js');
var bodyParser = require("body-parser");


var mysql = require('mysql');
const { send } = require('process');




var con = mysql.createConnection({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "masterkey",
  database: "wetter"
});

const app = express();
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));




app.use(express.static(__dirname + '/public'));

app.get('/', (request, response) => {
    response.sendFile('./index.html', {root: __dirname});
});

app.get('/style.css', function(req, res) {
  res.sendFile(path.join(__dirname + "/style.css"));
});

app.get('/scripts/script.js', function(req, res) {
    res.sendFile(path.join(__dirname + '/scripts/script.js'));
});

app.get('/station/scripts/station.js', function(req, res) {
  res.sendFile(path.join(__dirname + '/scripts/station.js'));
});


app.get('/api/name', (request, response) => {
  response.json(stationen);
});

app.get('/station/:id', function (req, res, next) {
  res.render('station',  {name: stationen[req.params.id].NAME, ort: stationen[req.params.id].ORT, id: stationen[req.params.id].ID});
});


app.get('/api/wetter_data/:id/:datum', function (req, res)  {
  var daten = [];

  var datum = req.params.datum;

  var begin = formatDate(req.params.datum) + ' 00:00:00';
  var end = formatDate(req.params.datum) + ' 23:59:59';
  console.log(begin);




  querry_string = "SELECT * FROM wetter_daten WHERE ID=" + req.params.id + " AND `ZEITPUNKT` BETWEEN " + "'"+ begin + "' AND " + "'" + end + "'" + "ORDER BY `ZEITPUNKT` ASC";

  con.query(querry_string, function (err, result, fields) {
    if (err) throw err;

    console.log(result);
    var string=JSON.stringify(result);
    var json =  JSON.parse(string);
    daten_id = 0;
    for(datensatz in json) {
      daten.push(json[daten_id]);
      daten_id++;
    }
    res.send(daten);
  });
  
  
});


app.get('/api/wetter_data/:id/:begin_datum/:end_datum', function (req, res) {
  var daten = [];
  console.log("zeitraum");


  var begin = formatDate(req.params.begin_datum) + ' 00:00:00';
  var end = formatDate(req.params.end_datum) + ' 23:59:59';

  querry_string = "SELECT * FROM wetter_daten WHERE ID=" + req.params.id + " AND `ZEITPUNKT` BETWEEN " + "'"+ begin + "' AND " + "'" + end + "'" + "ORDER BY `ZEITPUNKT` ASC";

  con.query(querry_string, function (err, result, fields) {
    if (err) throw err;

    console.log(result);
    var string=JSON.stringify(result);
    var json =  JSON.parse(string);
    daten_id = 0;
    for(datensatz in json) {
      daten.push(json[daten_id]);
      daten_id++;
    }
    res.send(daten);
  });

});


var stationen = [];

function start(){
  con.query("SELECT * FROM messstationen", function (err, result, fields) {
    if (err) throw err;
    id = 0;
    for(station in result){
      stationen.push(result[id]);
      id++;
    }
    
  });
}


function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) 
      month = '0' + month;
  if (day.length < 2) 
      day = '0' + day;

  return [year, month, day].join('-');
}


start();

app.listen(3000, () => console.log('Server running on port 3000'));