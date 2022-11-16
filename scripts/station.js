//const { request } = require("express");
var daten = new Object();
var daten_json = new Object();
var temperaturen = [];
var luftfeuchtigkeit = [];
var druck = [];
var zeiten = [];
var station_id = "";


var datum_heute = new Date();


function init(id) {
    document.getElementById("date_picker").valueAsDate = datum_heute;
    station(id, datum_heute);
}


function station(id, datum){
    console.log("datum: " + datum);
    station_id = id;
    daten = {}
    request_string = "http://192.168.178.51:3000/api/wetter_data/" + id + "/" + datum;
    get = new XMLHttpRequest;
    get.onreadystatechange = () => {
        if(get.readyState === 4 && get.status === 200){ //Statusprüfung
            daten = get.response;
            daten_json = JSON.parse(get.responseText);
            data_to_arrays();
            plot();
        }
    };
    get.open("GET", request_string, true); //True für Asynchron
    get.send(daten);
}

function plot() {
    var ctx = document.getElementById('temperaturen').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: zeiten,
            datasets: [
            { 
                label: "Temperatur",
                data: temperaturen,
                borderColor: 'rgba(252, 3, 3, 1)'
            }
            ]
        },
        
    });
    var ctx = document.getElementById('druck').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: zeiten,
            datasets: [
            { 
                label: "Luftdruck",
                data: druck,
                borderColor: 'rgba(5, 245, 21, 1)'
            }
            ]
        }
        
    });
    var ctx = document.getElementById('luftfeuchtigkeit').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: zeiten,
            datasets: [
            { 
                label: "Luftfeuchtigkeit",
                data: luftfeuchtigkeit,
                borderColor: 'rgba(5, 93, 245, 1)'
            }
            ]
        }
        
    });
}

function data_to_arrays() {
    temperaturen = [];
    druck = [];
    luftfeuchtigkeit = [];
    zeiten = [];


    
    console.log(daten_json);


    var daten_id = 0;
    for(x in daten_json) {
        temperaturen.push(daten_json[daten_id]["TEMPERATUR"]);
        luftfeuchtigkeit.push(daten_json[daten_id]["FEUCHTIGKEIT"]);
        druck.push(daten_json[daten_id]["DRUCK"]);
        console.log("Zeitpunkt: " + daten_json[daten_id]["ZEITPUNKT"].split('T')[1].substring(0, 8));
        zeiten.push(daten_json[daten_id]["ZEITPUNKT"].split('T')[1].substring(0, 8));
        daten_id++;
    }
    console.log(temperaturen, luftfeuchtigkeit, druck);
}

function select_date() {
    var datum = document.getElementById("date_picker").value;
    console.log(datum);
    station(station_id, datum);
}

function plot_time_span() {
    var tage_dict = {}

    var mins = {};
    var maxs = {};
    var avgs = {};

    var begin_datum = document.getElementById("begin_date").value;
    var end_datum = document.getElementById("end_date").value;
    if(begin_datum > end_datum) {
        alert("Das erste Datum muss vor dem Zweiten liegen!");
    }
    else {
        request_string = "http://192.168.178.51:3000/api/wetter_data/" + station_id + "/" + begin_datum + "/" + end_datum;
        get = new XMLHttpRequest;
        get.onreadystatechange = () => {
            if(get.readyState === 4 && get.status === 200){ //Statusprüfung

                daten_json = JSON.parse(get.responseText);
                console.log(daten_json); 
                for(var i = 0; i < daten_json.length; i++){
                    console.log(daten_json[i].ZEITPUNKT.substring(0, 10));
                    if(!(daten_json[i].ZEITPUNKT.substring(0, 10) in tage_dict)){
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)] = {};
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)]["temperatur"] = [];
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)]["feuchtigkeit"] = [];
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)]["druck"] = [];
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)]["temperatur"].push(daten_json[i].TEMPERATUR);
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)]["feuchtigkeit"].push(daten_json[i].FEUCHTIGKEIT);
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)]["druck"].push(daten_json[i].DRUCK);
                    }
                    else {
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)]["temperatur"].push(daten_json[i].TEMPERATUR);
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)]["feuchtigkeit"].push(daten_json[i].FEUCHTIGKEIT);
                        tage_dict[daten_json[i].ZEITPUNKT.substring(0, 10)]["druck"].push(daten_json[i].DRUCK);
                    }
                    
                }
                console.log(tage_dict);

                var tage = [];
                for(key in tage_dict) {
                    mins[key] = {};
                    maxs[key] = {};
                    avgs[key] = {};


                    sum = 0;
                    for(temp in tage_dict[key]["temperatur"]) {
                        sum += parseFloat(tage_dict[key]["temperatur"][temp], 10);
                        tage_dict[key]["temperatur"][temp] = parseFloat(tage_dict[key]["temperatur"][temp], 10);
                    }
                    avgs[key]["temperatur"] = sum / tage_dict[key]["temperatur"].length;
                    mins[key]["temperatur"] = Math.min.apply(Math, tage_dict[key]["temperatur"]);
                    maxs[key]["temperatur"] = Math.max.apply(Math, tage_dict[key]["temperatur"]);

                    sum = 0;
                    for(temp in tage_dict[key]["feuchtigkeit"]) {
                        sum += parseFloat(tage_dict[key]["feuchtigkeit"][temp], 10);
                        tage_dict[key]["feuchtigkeit"][temp] = parseFloat(tage_dict[key]["feuchtigkeit"][temp], 10);
                    }
                    avgs[key]["feuchtigkeit"] = sum / tage_dict[key]["feuchtigkeit"].length;
                    mins[key]["feuchtigkeit"] = Math.min.apply(Math, tage_dict[key]["feuchtigkeit"]);
                    maxs[key]["feuchtigkeit"] = Math.max.apply(Math, tage_dict[key]["feuchtigkeit"]);

                    sum = 0;
                    for(temp in tage_dict[key]["druck"]) {
                        sum += parseFloat(tage_dict[key]["druck"][temp], 10);
                    }
                    avgs[key]["druck"] = sum / tage_dict[key]["druck"].length;
                    mins[key]["druck"] = Math.min.apply(Math, tage_dict[key]["druck"]);
                    maxs[key]["druck"] = Math.max.apply(Math, tage_dict[key]["druck"]);
                    tage.push(key);
                }
                console.log(mins);

                var temps = {};
                temps["min"] = [];
                temps["max"] = [];
                temps["avg"] = [];

                var feucht = {};
                feucht["min"] = [];
                feucht["max"] = [];
                feucht["avg"] = [];

                var druck_timpe_spann = {};
                druck_timpe_spann["min"] = [];
                druck_timpe_spann["max"] = [];
                druck_timpe_spann["avg"] = [];

                for(key in tage) {
                    console.log(tage[key]);
                    temps["min"].push(mins[tage[key]]["temperatur"])
                    temps["max"].push(maxs[tage[key]]["temperatur"])
                    temps["avg"].push(avgs[tage[key]]["temperatur"])

                    feucht["min"].push(mins[tage[key]]["feuchtigkeit"])
                    feucht["max"].push(maxs[tage[key]]["feuchtigkeit"])
                    feucht["avg"].push(avgs[tage[key]]["feuchtigkeit"])

                    druck_timpe_spann["min"].push(mins[tage[key]]["druck"])
                    druck_timpe_spann["max"].push(maxs[tage[key]]["druck"])
                    druck_timpe_spann["avg"].push(avgs[tage[key]]["druck"])
                }

                create_plot_time_span(temps, feucht, druck_timpe_spann, tage);

            }
        };
        get.open("GET", request_string, true); //True für Asynchron
        get.send();

        
    }
}


function create_plot_time_span(temps, feucht, druck_timpe_spann, tage) {
    var ctx = document.getElementById('temperaturen').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tage,
            datasets: [
            { 
                label: "Temperatur Duchschnitt", 
                data: temps["avg"],
                borderColor: 'rgba(66, 245, 78, 1)'
            },
            {
                label: "Temperatur min", 
                data: temps["min"],
                borderColor: 'rgba(66, 135, 245, 1)' 
            },
            {
                label: "Temperatur max", 
                data: temps["max"],
                borderColor: 'rgba(252, 3, 3, 1)' 
            }
            ]
        },
        
    });
    var ctx = document.getElementById('druck').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tage,
            datasets: [
                { 
                    label: "Luftdruck Duchschnitt", 
                    data: druck_timpe_spann["avg"],
                    borderColor: 'rgba(66, 245, 78, 1)'
                },
                {
                    label: "Luftdruck min", 
                    data: druck_timpe_spann["min"],
                    borderColor: 'rgba(66, 135, 245, 1)' 
                },
                {
                    label: "Luftdruck max", 
                    data: druck_timpe_spann["max"],
                    borderColor: 'rgba(252, 3, 3, 1)' 
                }
            ]
        }
        
    });
    var ctx = document.getElementById('luftfeuchtigkeit').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: tage,
            datasets: [
                { 
                    label: "Luftfeuchtigkeit Duchschnitt", 
                    data: temps["avg"],
                    borderColor: 'rgba(66, 245, 78, 1)'
                },
                {
                    label: "Luftfeuchtigkeit min", 
                    data: temps["min"],
                    borderColor: 'rgba(66, 135, 245, 1)' 
                },
                {
                    label: "Luftfeuchtigkeit max", 
                    data: temps["max"],
                    borderColor: 'rgba(252, 3, 3, 1)' 
                }
            ]
        }
        
    });
}