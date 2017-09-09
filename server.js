// server.js

// set up ======================================================================
// get all the tools we need Bog Test2
var express  = require('express');
var app      = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var port     = process.env.PORT || 8080;
var Nightmare = require('nightmare');

var io = require('socket.io').listen(server);

var fs = require('fs');
var util = require('util');

var cookieParser = require('cookie-parser')
var session      = require('express-session');

var Login = require('./private/login.js');
var Url = require('./private/url.js');

var Prototype = require('./prototype.js');


var debug = require('debug')('Muri');

// set up our express application
app.use('/public', express.static('public'));
app.use('/js', express.static('js'));
app.use('/style', express.static('style'));
app.use('/img', express.static('img'));

app.set('view engine', 'ejs'); // set up ejs for templating

// required for passport
app.use(session({ secret: 'eatcake' })); // session secret


function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

var unitCodes = {
	 '1402' : 'YULAC' ,
	 '1403' : 'YVRAC' ,
	 '1404' : 'YYCAC' ,
	 '1405' : 'YOWAC' ,
	 '1406' : 'YHZAC' ,
	 '1407' : 'YEGAC' ,
	 '1408' : 'YWGAC' ,
	 '1409' : 'YQRAC' };
	
var ccFiles = { '1402' : 'AC1402CC' ,
 '1403' : 'AC1403CC' ,
 '1404' : 'AC1404CC' ,
 '1405' : 'AC1405CC' ,
 '1406' : 'AC1406CC' ,
 '1407' : 'AC1407CC' ,
 '1408' : 'AC1408CC' ,
 '1409' : 'AC1409CC' };

var cyFiles = { '1402' : 'AC1402CY' ,
 '1403' : 'AC1403CY' ,
 '1404' : 'AC1404CY' ,
 '1405' : 'AC1405CY' ,
 '1406' : 'AC1406CY' ,
 '1407' : 'AC1407CY' ,
 '1408' : 'AC1408CY'  };

 
var PAX = []
var SPML = []
var PAXCC = [];
var PAXCY = [];
var SPMLCC = [];
var SPMLCY = [];
var du = new Date();

var todaysDate = new Date();
var tomorrowsDate = new Date(new Date().getTime()  + 24 * 60 * 60 * 1000 );

var todayFileDate = todaysDate.toDateString() + ' H' +  todaysDate.getHours();

var todayFileSearchDate =  tomorrowsDate.getFullYear() + padDigits( (tomorrowsDate.getMonth() + 1), 2 ) + padDigits( (tomorrowsDate.getDate()), 2 ) ;
var tomorrowFileSearchDate =  tomorrowsDate.getFullYear() + padDigits( (tomorrowsDate.getMonth() + 1), 2 ) + padDigits( (tomorrowsDate.getDate()), 2 ) ;
//Adding 1 because month is 0-11
var todaySlashFormat = (todaysDate.getMonth() + 1) + "/" +(todaysDate.getDate()) + "/" +  (todaysDate.getFullYear().toString()).substring(2,4);
var tomorrowSlashFormat = (tomorrowsDate.getMonth() + 1) + "/" +(tomorrowsDate.getDate()) + "/" +  (tomorrowsDate.getFullYear().toString()).substring(2,4);

//Getting tmws date
var currDate = du.getFullYear() + padDigits( (du.getMonth() + 1), 2 ) + padDigits( (du.getDate() + 1), 2 ) ;
//var currDate = "20170901";
console.log("The Current Date is: " + currDate);
//console.log("The Current Date is: " + currDate);
var checkDate = (du.getMonth() + 1) + "/" +(du.getDate() + 1) + "/" +  (du.getFullYear().toString()).substring(2,4);
//var checkDate = "09/01/17";
console.log("The Current Date is: " + checkDate);
var formattedTmwDate = (du.getMonth() + 1) + "/" +(du.getDate() + 1) + "/" +  (du.getFullYear().toString()).substring(2,4);
//var formattedTmwDate = "09/01/17"
console.log("The Current Date is: " + formattedTmwDate);
var formattedTodayDate = (du.getMonth() + 1) + "/" +(du.getDate()) + "/" +  (du.getFullYear().toString()).substring(2,4);

//var formattedTodayDateFile = padDigits( (du.getDate()), 2 ) + padDigits( (du.getMonth() + 1), 2 ) +   du.getFullYear() + 'h' + du.getHours() ;
var formattedTomorrowDateFile = padDigits( (du.getDate() + 1), 2 ) + padDigits( (du.getMonth() + 1), 2 ) +   du.getFullYear() + 'h' + du.getHours() ;
var formattedTodayDateFile = du.toDateString() + ' H' +  du.getHours();




console.log('todaysDate ' + todaysDate + '%%%%' + du);
console.log('tomorrowsDate ' + tomorrowsDate + '%%%%');
console.log('tomorrowFileSearchDate ' + tomorrowFileSearchDate + '%%%%' + currDate);
console.log('todayslash ' + todaySlashFormat + '%%%%' + formattedTodayDate);
console.log('tmwslash ' + tomorrowSlashFormat + '%%%%' + formattedTmwDate);

Prototype.init(tomorrowSlashFormat);


var gfs = require('fs');
var gutil = require('util');


var YVRSP = [];

var YYCSP = [];
var YYZSP = [];
var YVRFlightList = [];
var YYCFlightList = [];
var YYZFlightList = [];
var YVRDiff = [];
var currUpdatedFile;
var currFlightList;
var currDiff = [];
var currSalesPlantName;
var currFilePath;

app.get('/', function(req, res) {
	//console.log(currDate);
	res.render('index.ejs'); // load the index.ejs file
    });
	
	function loadSalesPlant(salesPlant, cb) {
		nightmare
			.goto(Url.flightUrl)
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , tomorrowSlashFormat)
			.type('input#carrierCode', 'AC')
			.click('input#subbutton')
			.wait('#resultRow_0 td img')
			.wait(2000)
			.then(function() {
				cb();
				//console.log("successfully entered flight overview");
			})
			.catch(function (error) {
				console.error('loadSalesPlant failed due to: ', error);
		});
	}
	function loadSalesPlantTime(salesPlant, today, time, cb) {
		nightmare
			.goto(Url.flightUrl)
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(4) > input:nth-child(1)')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , today)
			.type('input#carrierCode', 'AC')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(4) > input:nth-child(1)', time)
			.click('input#subbutton')
			.wait('#resultRow_0 td img')
			.then(function() {
				getPrimaryFlightList(cb);
				//console.log("successfully entered flight overview");
			})
			.catch(function (error) {
				console.error('loadSalesPlant failed due to: ', error);
		});
	}
	
	function loadSalesPlantAndFlight(salesPlant, flight, cb) {
		nightmare
			.goto(Url.flightUrl)
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', '')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , tomorrowSlashFormat)
			.type('input#carrierCode', 'AC')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', flight)
			.wait(500)
			.click('input#subbutton')
			.wait('#resultRow_0 td img')
			.then(function() {
				findRow(flight, cb);
				//console.log("successfully entered flight overview");
			})
			.catch(function (error) {
				console.error('loadSalesPlantAndFlight failed due to: ', error);
		});
	}
	
	function loadSalesPlantAndFlightToday(salesPlant, flight, cb) {
		console.log('loadSalesPlantAndFlightToday');
		nightmare
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', '')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , todaySlashFormat)
			.type('input#carrierCode', 'AC')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', flight)
			.wait(1000)
			.click('input#subbutton')
			.wait('#resultRow_0 td img')
			.wait(2000)
			.then(function() {
				findRow(flight, cb);
				//console.log("successfully entered flight overview");
			})
			.catch(function (error) {
				console.error('loadSalesPlantAndFlight failed due to: ', error);
				rebootNightmare();
				//return nightmare.end();
		});
	}
	function loadFlightToday(salesPlant, flight, cb) {
		//console.log('loadFlightToday');
		nightmare
			.goto(Url.flightUrl)
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', '')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , todaySlashFormat)
			.type('input#carrierCode', 'AC')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', flight)
			.wait(1000)
			.click('input#subbutton')
			.wait('#resultRow_0 td img')
			.wait(2000)
			.then(function() {
				findRowParse(flight, cb);
				//console.log("successfully entered flight overview");
			})
			.catch(function (error) {
				diffController();
				console.error('loadSalesPlantAndFlight failed due to: ', error);
				//rebootNightmare();
				//return nightmare.end();
		});
	}
	function findRowParse(flight , cb) {
		//console.log('findRowParse');
		nightmare
			.evaluate(function(flight) {
					var retVal = -1;
					for(var i = 0; document.getElementById('resultRow_' + i); i++) {
						console.log(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText + ' && ' + flight)
						if(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText == flight) {
							retVal = i;
							break;
						}
					}
					console.log(retVal);
					return retVal;
				}, currFlightList[0]
			)
			.then(function(i) {
				//console.log('The value we are looking for is in ' + i);
				//cb();
				if(i == -1) {
					console.log('Flight was Not found');
					
				}
				else {
					clickFlightParse(i,flight,  cb);
				}
				//console.log("successfully entered flight overview");
			})
			.catch(function (error) {
				diffController();
				console.error('findRow failed due to: ', error);
		});
	}
	function clickFlightParse(row ,flight,  cb) {
		//console.log('clickFlightParse');
		nightmare
			.click('tr#resultRow_' + row + ' > td.center:nth-child(25) > a:nth-child(1)')
			.then(function(i) {
				scanFlightParse(flight, cb);
			})
			.catch(function (error) {
				console.error('clickFlight failed due to: ', error);
		});
			
			//.click('tr#resultRow_5 > td.center:nth-child(25) > a:nth-child(1)')
			//.click('tr#resultRow_14 > td.center:nth-child(25) > a:nth-child(1)')
	}
	function scanFlightParse(flight, cb) {
		//console.log('scanFlightParse');
		nightmare
			.wait(500)
			.wait('div#specialMeals_title')
			.evaluate(function() {
				var i = 1;
				var BC = [];
				var EC = [];
				var EU = [];
				var CC = [];
				var CY = [];
				var retVal = [];
				while(document.getElementById('deleted_' + i)) {
					if(document.getElementById('deleted_' + i).checked == false) {
						if(document.getElementById('class_' + i).value == "BC") {
							if( BC[document.getElementById('code_' + i).value] ) {
								BC[document.getElementById('code_' + i).value] = parseInt(BC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								BC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "EU") {
							if( EU[document.getElementById('code_' + i).value] ) {
								EU[document.getElementById('code_' + i).value] = parseInt(EU[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								EU[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "EC") {
							if( EC[document.getElementById('code_' + i).value] ) {
								EC[document.getElementById('code_' + i).value] = parseInt(EC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								EC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "CC") {
							if( CC[document.getElementById('code_' + i).value] ) {
								CC[document.getElementById('code_' + i).value] = parseInt(CC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								CC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "CY") {
							if( CY[document.getElementById('code_' + i).value] ) {
								CY[document.getElementById('code_' + i).value] = parseInt(CY[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								CY[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
					}
					i++;
				}
				var tmpBC = 'BC';
				for( var key in BC ) {
					tmpBC = tmpBC + 'x' + key + ':' + JSON.stringify(BC[key]);
				}
				
				var tmpEC = 'EC';
				for( var key in EC ) {
					tmpEC = tmpEC + 'x' + key + ':' + JSON.stringify(EC[key]);
				}
				
				var tmpEU = 'EU';
				for( var key in EU ) {
					tmpEU = tmpEU + 'x' + key + ':' + JSON.stringify(EU[key]);
				}
				
				var tmpCC = 'CC';
				for( var key in CC ) {
					tmpCC = tmpCC + 'x' + key + ':' + JSON.stringify(CC[key]);
				}
				
				var tmpCY = 'CY';
				for( var key in CY ) {
					tmpCY = tmpCY + 'x' + key + ':' + JSON.stringify(CY[key]);
				}
				retVal.push(tmpBC);
				retVal.push(tmpEC);
				retVal.push(tmpEU);
				retVal.push(tmpCC);
				retVal.push(tmpCY);			
				return retVal;
			})
			.then(function(result) {
				if(result[0].split('x').length > 1) {
					var BC = [];
					for(var i = 1; result[0].split('x')[i]; i++) {
						BC[result[0].split('x')[i].split(':')[0]] = result[0].split('x')[i].split(':')[1];
					}
				}
				if(result[1].split('x').length > 1) {
					var EC = [];
					for(var i = 1; result[1].split('x')[i]; i++) {
						EC[result[1].split('x')[i].split(':')[0]] = result[1].split('x')[i].split(':')[1];
					}
				}
				
				if(result[2].split('x').length > 1) {
					var EU = [];
					for(var i = 1; result[2].split('x')[i]; i++) {
						EU[result[2].split('x')[i].split(':')[0]] = result[2].split('x')[i].split(':')[1];
					}
				}
				/*
				console.log('-');
				console.log(BC);
				console.log('-');
				console.log(EC);
				console.log('-');
				console.log(EU);
				console.log('-');
				*/
				var retVal = [];
				if(BC) { retVal['BC'] = BC; }
				if(EC) { retVal['EC'] = EC; }
				if(EU) { retVal['EU'] = EU; }
				
				compareParse(flight,retVal, cb);
			})
			.catch(function (error) {
				console.error('scanFlight failed due to: ', error);
			});
	}

	var currBob = [];
	var currMeal = [];

	function compareParse(flight, cxpData, cb) {
		console.log('>---------------Current CXP Meal Count----------------<');
		console.log(cxpData);
		console.log('>---------------Proposed changes------------------<');	
		var bob = [];
		var meal = [];
		if(currUpdatedFile[currFlightList[0]]['EC']) {
			//console.log('*-------EC changes----------*');
			for( var key in currUpdatedFile[currFlightList[0]]['EC']) {
				if(key == 'PRCH' || key == 'PRBF' || key == 'PRBK' || key == 'RPCK' || key == 'RPBF') {
					//console.log('Adding Bob');
					if(currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[0] > 0) {
						if(!bob['EC']) {
							bob['EC'] = [];
						}
						var tmp =  [];
						tmp['add'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[0];
						tmp['total'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[1];
						bob['EC'][key] = tmp;
						//console.log(meal);
						//console.log(bob);
					}
				}
				else {
					if(currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[0] > 0) {
						if(!meal['EC']) {
							meal['EC'] = [];
						}
						//console.log('Adding Meal');
						var tmp =  [];
						tmp['add'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[0];
						tmp['total'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[1];
						meal['EC'][key] = tmp;
						//console.log(meal);
					}
				}
			}
		}
		if(currUpdatedFile[currFlightList[0]]['EU']) {
			console.log('*-------EU changes----------*');
			for( var key in currUpdatedFile[currFlightList[0]]['EU']) {
				if(key == 'PRCH' || key == 'PRBF' || key == 'PRBK' || key == 'RPCK' || key == 'RPBF') {
					//console.log('Adding Bob');
					if(!bob['EU']) {
						bob['EU'] = [];
					}
					var tmp =  [];
					tmp['add'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[0];
					tmp['total'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[1];
					bob['EU'][key] = tmp;
					//console.log(meal);
					//console.log(bob);
				}
				else {
					if(!meal['EU']) {
						meal['EU'] = [];
					}
					//console.log('Adding Meal');
					var tmp =  [];
					tmp['add'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[0];
					tmp['total'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[1];
					meal['EU'][key] = tmp;
					//console.log(meal);
				}
			}
		}
		if(currUpdatedFile[currFlightList[0]]['BC']) {
			console.log('*-------BC changes----------*');
			for( var key in currUpdatedFile[currFlightList[0]]['BC']) {
				if(key == 'PRCH' || key == 'PRBF' || key == 'PRBK' || key == 'RPCK' || key == 'RPBF') {
					//console.log('Adding Bob');
					if(!bob['BC']) {
						bob['BC'] = [];
					}
					var tmp =  [];
					tmp['add'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[0];
					tmp['total'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[1];
					bob['BC'][key] = tmp;
					//console.log(meal);
					//console.log(bob);
				}
				else {
					if(!meal['BC']) {
						meal['BC'] = [];
					}
					//console.log('Adding Meal');
					var tmp =  [];
					tmp['add'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[0];
					tmp['total'] = currUpdatedFile[currFlightList[0]]['EC'][key].split('x')[1];
					meal['BC'][key] = tmp;
					//console.log(meal);
				}
			}
		}
		if(bob['EC'] || meal['EC']) {
		console.log('<-----EC----->')
			if(bob['EC']) {
				console.log(' ^--Bobs--^');
				currBob['EC'] = [];
				currBob['EC'] = bob['EC'];
				for(var key in bob['EC']) {
					console.log(key + ' + ' + bob['EC'][key]['add'] + ' = ' + bob['EC'][key]['total'])
				}
				//console.log('bob');
				//console.log(currBob);
			}
			if(meal['EC']) {
				console.log(' ^--Meals--^');
				currMeal['EC'] = [];
				currMeal['EC'] = meal['EC'];
				for(var key in meal['EC']) {
					console.log(key + ' + ' + meal['EC'][key]['add'] + ' = ' + meal['EC'][key]['total'])
				}
				//console.log('meal');
				//console.log(currMeal);
			}
		}
		if(bob['EU'] || meal['EU']) {
		console.log('<-----EU----->')
			if(bob['EU']) {
				console.log(' ^--Bobs--^');
				currBob['EU'] = [];
				currBob['EU'] = bob['EU'];
				for(var key in bob['EU']) {
					console.log(key + ' + ' + bob['EU'][key]['add'] + ' = ' + bob['EU'][key]['total'])
				}
			}
			if(meal['EU']) {
				console.log(' ^--Meals--^');
				currMeal['EU'] = [];
				currMeal['EU'] = meal['EU'];
				for(var key in meal['EU']) {
					console.log(key + ' + ' + meal['EU'][key]['add'] + ' = ' + meal['EU'][key]['total'])
				}
			}
		}
		if(bob['BC'] || meal['BC']) {
		console.log('<-----BC----->')
			if(bob['BC']) {
				currBob['BC'] = [];
				currBob['BC'] = bob['BC'];
				console.log(' ^--Bobs--^');
				for(var key in bob['BC']) {
					console.log(key + ' + ' + bob['BC'][key]['add'] + ' = ' + bob['BC'][key]['total'])
				}
			}
			if(meal['BC']) {
				console.log(' ^--Meals--^');
				currMeal['BC'] = [];
				currMeal['BC'] = meal['BC'];
				for(var key in meal['BC']) {
					console.log(key + ' + ' + meal['BC'][key]['add'] + ' = ' + meal['BC'][key]['total'])
				}
			}
		}
		//var Diff = [];
	}

	function fillBobMeal(ecType) {
		var fillin = [];
		var count = 0;
		if(ecType == 'bob') {
			var tmp = 0;
			for(var key in currBob['EC']) {
				fillin.push('ECx' + key + 'x' + currBob['EC'][key]['add'] + 'x' + currBob['EC'][key]['total']);
				count++;
				if(tmp == 0) {
					gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'excel' + todayFileDate + '.json', currFlightList[0] + '\t' ,'utf-8');
					tmp++;
				}
				else {
					gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'excel' + todayFileDate + '.json', '\t' ,'utf-8');
				}
				gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'excel' + todayFileDate + '.json', currBob['EC'][key]['add'] + '\t' + ' ' + '\t' + 'EC' + '\t' + key + '\t'  + currBob['EC'][key]['total'] + '\n' ,'utf-8');

			}
		}
		else if(ecType == 'meal') {
			var tmp = 0;
			for(var key in currMeal['EC']) {
				fillin.push('ECx' + key + 'x' + currMeal['EC'][key]['add'] + 'x' + currMeal['EC'][key]['total']);
				count++;
				if(tmp == 0) {
					gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'excel' + todayFileDate + '.json', currFlightList[0] + '\t' ,'utf-8');
					tmp++;
				}
				else {
					gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'excel' + todayFileDate + '.json', '\t' ,'utf-8');
				}
				gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'excel' + todayFileDate + '.json', currMeal['EC'][key]['add'] + '\t' + ' ' + '\t' + 'EC' + '\t' + key + '\t' + currMeal['EC'][key]['total'] + '\n' ,'utf-8');
			}
		}
		console.log('fillin');
		console.log(count);
		nightmare
			.type('input#numToAdd', '')
			.type('input#numToAdd', count)
	  		.click('input#addButtonMaterialButton')
	  		.wait(2000)
	  		.evaluate(function() {
	  			//find first empty row
	  			var firstEmpty = 0;
	  			for(var i = 1; document.getElementById('class_' + i).classList.contains('readonly'); i++) {
	  				firstEmpty = i;
	  			}
	  			firstEmpty++;
	  			return firstEmpty;
	  		})
	  		.then(function(result) {
	  			fillLoop(result, fillin, 0);
	  		})

	}

	function fillLoop(iterator, list, next) {
		if(list[next]) {
			console.log('fillloop list is' + list[next])
			nightmare
				.type('input#class_' + iterator, list[next].split('x')[0])
				.type('input#code_' + iterator, list[next].split('x')[1])
				.type('input#quantity_' + iterator, list[next].split('x')[2])
				.then(function() {
					next++;
					iterator++;
					fillLoop(iterator, list, next);
				})
		}
		else {
			console.log('fillloop else');
			nightmare
				 .click('input#submitButton')
				 .wait(4000)
				 .wait('input#class_1')
				 .evaluate(function() {
				 		var bc = [];
						var ec = [];
						var eu = [];
						var i = 1;
						while(document.getElementById('deleted_' + i)) { 
							if(document.getElementById('deleted_' + i).checked == false) {
								if(document.getElementById('class_' + i).value == "BC") {
									if( bc[document.getElementById('code_' + i).value] ) {
										bc[document.getElementById('code_' + i).value] = parseInt(bc[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
									}
									else {
										bc[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
									}
								}
								else if(document.getElementById('class_' + i).value == "EU") {
									if( eu[document.getElementById('code_' + i).value] ) {
										eu[document.getElementById('code_' + i).value] = parseInt(eu[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
									}
									else {
										eu[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
									}
								}
								else if(document.getElementById('class_' + i).value == "EC") {
									if( ec[document.getElementById('code_' + i).value] ) {
										ec[document.getElementById('code_' + i).value] = parseInt(ec[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
									}
									else {
										ec[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
									}
								}
							}
							i++;
						}
						var altEC = [];
						for (var key in ec) {
							console.log(key);
							altEC.push('ECx' + key + 'x' + ec[key]);
						}
						return altEC;
				 })
				 .then(function(result) {
				 	console.log('results');
				 	console.log(result);
				 	console.log(result[0]);
				 	var ec = [];
				 	for(var i = 0; result[i]; i++) {
				 		if(result[i].split('x')[0] == 'EC') {
				 			ec[result[i].split('x')[1]] = result[i].split('x')[2];
				 		}
				 	}
				 	if(currBob['EC']) {
						for(var key in currBob['EC']) {
				 			if(currBob['EC'][key]['total'] == ec[key]) {
				 				console.log(key + ' numbers matched: ' + ec[key]);
				 				console.log(key + 'Matched! ' + currBob['EC'][key]['total'] + ' == ' +  ec[key]);
				 			}
				 			else {
				 				console.log(key + ':' + currBob['EC'][key]['total'] + ' != ' +  ec[key]);
				 			}
				 		}
					 }
				 	if(currMeal['EC']) {
				 		for(var key in currMeal['EC']) {
				 			if(currMeal['EC'][key]['total'] == ec[key]) {
				 				console.log(key + ' numbers matched: ' + ec[key]);
				 				console.log(key + 'Matched! ' + currMeal['EC'][key]['total'] + ' == ' +  ec[key]);
				 			}
				 			else {
				 				console.log(key + ':' + currMeal['EC'][key]['total'] + ' != ' +  ec[key]);
				 			}
				 		}
				 	}
				 })
		}
	}

	function saveFlight() {
		currBob = [];
		currMeal = [];
		nightmare
			.click('a#permanentSaveLink > img:nth-child(1)')
			.then(function() {

			})
	}


	function scanFlightParse2(flight, cb) {
		console.log('scanFlightParse');
		nightmare
			.wait(500)
			.wait('div#specialMeals_title')
			.evaluate(function() {
				var i = 1;
				var BC = [];
				var EC = [];
				var EU = [];
				var CC = [];
				var CY = [];
				var retVal = [];
				while(document.getElementById('deleted_' + i)) {
					if(document.getElementById('deleted_' + i).checked == false) {
						if(document.getElementById('class_' + i).value == "BC") {
							if( BC[document.getElementById('code_' + i).value] ) {
								BC[document.getElementById('code_' + i).value] = parseInt(BC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								BC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "EU") {
							if( EU[document.getElementById('code_' + i).value] ) {
								EU[document.getElementById('code_' + i).value] = parseInt(EU[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								EU[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "EC") {
							if( EC[document.getElementById('code_' + i).value] ) {
								EC[document.getElementById('code_' + i).value] = parseInt(EC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								EC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "CC") {
							if( CC[document.getElementById('code_' + i).value] ) {
								CC[document.getElementById('code_' + i).value] = parseInt(CC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								CC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "CY") {
							if( CY[document.getElementById('code_' + i).value] ) {
								CY[document.getElementById('code_' + i).value] = parseInt(CY[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								CY[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
					}
					i++;
				}
				var tmpBC = 'BC';
				for( var key in BC ) {
					tmpBC = tmpBC + 'x' + key + ':' + JSON.stringify(BC[key]);
				}
				
				var tmpEC = 'EC';
				for( var key in EC ) {
					tmpEC = tmpEC + 'x' + key + ':' + JSON.stringify(EC[key]);
				}
				
				var tmpEU = 'EU';
				for( var key in EU ) {
					tmpEU = tmpEU + 'x' + key + ':' + JSON.stringify(EU[key]);
				}
				
				var tmpCC = 'CC';
				for( var key in CC ) {
					tmpCC = tmpCC + 'x' + key + ':' + JSON.stringify(CC[key]);
				}
				
				var tmpCY = 'CY';
				for( var key in CY ) {
					tmpCY = tmpCY + 'x' + key + ':' + JSON.stringify(CY[key]);
				}
				retVal.push(tmpBC);
				retVal.push(tmpEC);
				retVal.push(tmpEU);
				retVal.push(tmpCC);
				retVal.push(tmpCY);			
				return retVal;
			})
			.then(function(result) {
				if(result[0].split('x').length > 1) {
					var BC = [];
					for(var i = 1; result[0].split('x')[i]; i++) {
						BC[result[0].split('x')[i].split(':')[0]] = result[0].split('x')[i].split(':')[1];
					}
				}
				if(result[1].split('x').length > 1) {
					var EC = [];
					for(var i = 1; result[1].split('x')[i]; i++) {
						EC[result[1].split('x')[i].split(':')[0]] = result[1].split('x')[i].split(':')[1];
					}
				}
				
				if(result[2].split('x').length > 1) {
					var EU = [];
					for(var i = 1; result[2].split('x')[i]; i++) {
						EU[result[2].split('x')[i].split(':')[0]] = result[2].split('x')[i].split(':')[1];
					}
				}
				console.log('-');
				console.log(BC);
				console.log('-');
				console.log(EC);
				console.log('-');
				console.log(EU);
				console.log('-');
				
				var retVal = [];
				if(BC) { retVal['BC'] = BC; }
				if(EC) { retVal['EC'] = EC; }
				if(EU) { retVal['EU'] = EU; }
				
				//compareParse(flight,retVal, cb);
			})
			.catch(function (error) {
				console.error('scanFlight failed due to: ', error);
			});
	}
 
	
	function loadSalesPlantAndFlightTmw(salesPlant, flight, cb) {
		console.log('loadSalesPlantAndFlightTomorrow');
		nightmare
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', '')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , tomorrowSlashFormat)
			.type('input#carrierCode', 'AC')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', flight)
			.wait(1000)
			.click('input#subbutton')
			.wait('#resultRow_0 td img')
			.wait(2000)
			.then(function() {
				findRowAlt(flight, cb);
				//console.log("successfully entered flight overview");
			})
			.catch(function (error) {
				console.error('loadSalesPlantAndFlight failed due to: ', error);
				//nightmare.end();
				rebootNightmareAlt();
		});
	}
	
	function findRowAlt(flight , cb) {
		console.log('findRow');
		nightmare
			.evaluate(function(flight) {
					var retVal = -1;
					for(var i = 0; document.getElementById('resultRow_' + i); i++) {
						console.log(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText + ' && ' + flight)
						if(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText == flight) {
							retVal = i;
							break;
						}
					}
					console.log(retVal);
					return retVal;
				}, currFlightList['AC' + currSalesPlant][0]
			)
			.then(function(i) {
				//console.log('The value we are looking for is in ' + i);
				//cb();
				if(i == -1) {
					console.log('Flight was Not found');
					
				}
				else {
					clickFlightAlt(i,flight,  cb);
				}
				//console.log("successfully entered flight overview");
			})
			.catch(function (error) {
				console.error('findRow failed due to: ', error);
		});
			
			//.click('tr#resultRow_5 > td.center:nth-child(25) > a:nth-child(1)')
			//.click('tr#resultRow_14 > td.center:nth-child(25) > a:nth-child(1)')
	}
	function clickFlightAlt(row ,flight,  cb) {
		nightmare
			.click('tr#resultRow_' + row + ' > td.center:nth-child(25) > a:nth-child(1)')
			.then(function(i) {
				scanFlightAlt(flight, cb);
			})
			.catch(function (error) {
				console.error('clickFlight failed due to: ', error);
		});
			
			//.click('tr#resultRow_5 > td.center:nth-child(25) > a:nth-child(1)')
			//.click('tr#resultRow_14 > td.center:nth-child(25) > a:nth-child(1)')
	}
	function scanFlightAlt(flight, cb) {
		nightmare
			.wait(500)
			.wait('div#specialMeals_title')
			.evaluate(function() {
				var i = 1;
				var BC = [];
				var EC = [];
				var EU = [];
				var CC = [];
				var CY = [];
				var retVal = [];
				while(document.getElementById('deleted_' + i)) {
					if(document.getElementById('deleted_' + i).checked == false) {
						if(document.getElementById('class_' + i).value == "BC") {
							if( BC[document.getElementById('code_' + i).value] ) {
								BC[document.getElementById('code_' + i).value] = parseInt(BC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								BC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "EU") {
							if( EU[document.getElementById('code_' + i).value] ) {
								EU[document.getElementById('code_' + i).value] = parseInt(EU[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								EU[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "EC") {
							if( EC[document.getElementById('code_' + i).value] ) {
								EC[document.getElementById('code_' + i).value] = parseInt(EC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								EC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "CC") {
							if( CC[document.getElementById('code_' + i).value] ) {
								CC[document.getElementById('code_' + i).value] = parseInt(CC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								CC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "CY") {
							if( CY[document.getElementById('code_' + i).value] ) {
								CY[document.getElementById('code_' + i).value] = parseInt(CY[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								CY[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
					}
					i++;
				}
				var tmpBC = 'BC';
				for( var key in BC ) {
					tmpBC = tmpBC + 'x' + key + ':' + JSON.stringify(BC[key]);
				}
				
				var tmpEC = 'EC';
				for( var key in EC ) {
					tmpEC = tmpEC + 'x' + key + ':' + JSON.stringify(EC[key]);
				}
				
				var tmpEU = 'EU';
				for( var key in EU ) {
					tmpEU = tmpEU + 'x' + key + ':' + JSON.stringify(EU[key]);
				}
				
				var tmpCC = 'CC';
				for( var key in CC ) {
					tmpCC = tmpCC + 'x' + key + ':' + JSON.stringify(CC[key]);
				}
				
				var tmpCY = 'CY';
				for( var key in CY ) {
					tmpCY = tmpCY + 'x' + key + ':' + JSON.stringify(CY[key]);
				}
				retVal.push(tmpBC);
				retVal.push(tmpEC);
				retVal.push(tmpEU);
				retVal.push(tmpCC);
				retVal.push(tmpCY);
				return retVal;
			})
			.then(function(result) {
				//0BC,1EC,2EU,3CC,4CY
				if(result[3].split('x').length <= 1 && result[4].split('x').length <= 1) {
					console.log('Empty Lists, checking items');
					checkItemsAlt(flight, cb);
				}
				else {
					if(result[3].split('x').length > 1) {
						var CC = [];
						for(var i = 1; result[3].split('x')[i]; i++) {
							CC[result[3].split('x')[i].split(':')[0]] = result[3].split('x')[i].split(':')[1];
						}
					}
					
					if(result[4].split('x').length > 1) {
						var CY = [];
						for(var i = 1; result[4].split('x')[i]; i++) {
							CY[result[4].split('x')[i].split(':')[0]] = result[4].split('x')[i].split(':')[1];
						}
					}
					
					var retVal = [];
					if(CC) { retVal['CC'] = CC; }
					if(CY) { retVal['CY'] = CY; }
					
					comparePilotCrew(flight,retVal, cb);
				}
			})
			.catch(function (error) {
				console.error('scanFlight failed due to: ', error);
			});
	}
	
	function checkItemsAlt(flight, cb) {
		nightmare
			.click('div#layout_navigation > div.rightContent:nth-child(6) > div.tabs:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td.tab:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td.m:nth-child(2) > a:nth-child(1)')
			.wait('table#table_row_0')
			.evaluate(function() {
				return document.getElementById('commentTexts_0').value;
			})
			.then(function(result) {
				if(result.search("GARBAGE") > -1) {
					console.log(currFlightList[0] + ' is a Garbage flight');
					gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', currFlightList[0] + " appears to be a garbage flight\n\n" , 'utf-8');
					backAlt();
				}
				else {
					console.log(currFlightList[0] + ' is not a Garbage flight');
					var tmp = [];
					comparePilotCrew(flight, tmp, cb); 
				}
			})
			.catch(function (error) {
				console.error('checkItems failed due to: ', error);
			});
			
		
	}
	
	function compareAlt(flight, cate, cb) {
		console.log('>----------------------Comparing CXP--------------------------<');
		console.log(cate);
		console.log('How to get data spits out ');
		console.log(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]);
		
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "Flight " + currFlightList['AC' + currSalesPlant][0] + ' details:\n' , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "CXP" , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', gutil.inspect(cate) , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "\n" , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "Updated File\n" , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', gutil.inspect(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]) , 'utf-8');
		
		var Diff = [];
		if(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CC']) {
			Diff['EC'] = [];
			for(var key in currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CC']) {
				if(cate['CC']) {
					if(cate['CC'][key]) {
						var tmp = parseInt(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CC'][key]) - parseInt(cate['CC'][key]);
						if( tmp != 0) {
							Diff['CC'][key] = parseInt(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CC'][key]) - parseInt(cate['CC'][key]);
							Diff['CC'][key] = Diff['CC'][key] +  'x' + currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CC'][key];
						}
					}
					else {
						Diff['CC'][key] = parseInt(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CC'][key]);
						Diff['CC'][key] = Diff['CC'][key] +  'x' + currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CC'][key];
					}
				}
				else {
					Diff['CC'][key] = parseInt(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CC'][key]);
					Diff['CC'][key] = Diff['CC'][key] +  'x' + currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CC'][key];
				}
			}
		}
		if(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CY']) {
			Diff['EC'] = [];
			for(var key in currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CY']) {
				if(cate['CY']) {
					if(cate['CY'][key]) {
						var tmp = parseInt(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CY'][key]) - parseInt(cate['CY'][key]);
						if( tmp != 0) {
							Diff['CY'][key] = parseInt(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CY'][key]) - parseInt(cate['CY'][key]);
							Diff['CY'][key] = Diff['CY'][key] +  'x' + currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CY'][key];
						}
					}
					else {
						Diff['CY'][key] = parseInt(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CY'][key]);
						Diff['CY'][key] = Diff['CY'][key] +  'x' + currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CY'][key];
					}
				}
				else {
					Diff['CY'][key] = parseInt(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CY'][key]);
					Diff['CY'][key] = Diff['CY'][key] +  'x' + currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]['CY'][key];
				}
			}
		}
		console.log('Final Diff for ' + currFlightList['AC' + currSalesPlant][0] + ' is ');
		console.log(Diff);
		
		currDiff[currFlightList['AC' + currSalesPlant][0]] = Diff;
		backAlt();
	}
	
	function comparePilotCrew(flight, cxpData, cb) {
		console.log('>----------------------Comparing CXP--------------------------<');
		console.log(cxpData);
		console.log('>-------------Updated File Data----------------<');
		console.log(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]);
		//Below is the data object relating to the data we care about
		var updatedData = currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]];
		var Diff = [];
		
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "Flight " + currFlightList['AC' + currSalesPlant][0] + ' details:\n' , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "CXP" , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', gutil.inspect(cxpData) , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "\n" , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "Updated File\n" , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', gutil.inspect(updatedData) , 'utf-8');
		
		
		if(updatedData['CC']) {
			Diff['CC'] = [];
			for(var key in updatedData['CC']) {
				if(cxpData['CC']) {
					if(cxpData['CC'][key]) {
						var tmp = parseInt(updatedData['CC'][key]) - parseInt(cxpData['CC'][key]);
						if( tmp != 0) {
							Diff['CC'][key] = parseInt(updatedData['CC'][key]) - parseInt(cxpData['CC'][key]);
							Diff['CC'][key] = Diff['CC'][key] +  'x' + updatedData['CC'][key];
						}
					}
					else {
						Diff['CC'][key] = parseInt(updatedData['CC'][key]);
						Diff['CC'][key] = Diff['CC'][key] + 'x' + updatedData['CC'][key];
					}
				}
				else {
					Diff['CC'][key] = parseInt(updatedData['CC'][key]);
					Diff['CC'][key] = Diff['CC'][key] + 'x' + updatedData['CC'][key];
				}
			}
		}
		if(updatedData['CY']) {
			Diff['CY'] = [];
			for(var key in updatedData['CY']) {
				if(cxpData['CY']) {
					if(cxpData['CY'][key]) {
						var tmp = parseInt(updatedData['CY'][key]) - parseInt(cxpData['CY'][key]);
						if( tmp != 0) {
							Diff['CY'][key] = parseInt(updatedData['CY'][key]) - parseInt(cxpData['CY'][key]);
							Diff['CY'][key] = Diff['CY'][key] +  'x' + updatedData['CY'][key];
						}
					}
					else {
						Diff['CY'][key] = parseInt(updatedData['CY'][key]);
						Diff['CY'][key] = Diff['CY'][key] +  'x' + updatedData['CY'][key];
					}
				}
				else {
					Diff['CY'][key] = parseInt(updatedData['CY'][key]);
					Diff['CY'][key] = Diff['CY'][key] +  'x' + updatedData['CY'][key];
				}
			}
		}
		console.log('>---------------Final Diff for ' + currFlightList['AC' + currSalesPlant][0] + ' is ');
		console.log(Diff);
		currDiff[currFlightList['AC' + currSalesPlant][0]] = Diff;
		console.log('\n\n');
		
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "\n Final Diff \n" , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', gutil.inspect(Diff) , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "\n\n" , 'utf-8');
		
		
		backAlt();
	}
	
	function getPrimaryFlightList(cb) {
		nightmare
			.wait(5000)
			.evaluate(function() {
				var flightList = [];
				var trigger = "odd";
				for(var i = 0; document.getElementById('resultRow_' + i); i++) {
					if(document.getElementById('resultRow_' + i).classList.contains(trigger)) {
						flightList.push(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText);
						console.log(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText);
						if(trigger == "odd") {
							trigger = "even";
						}
						else {
							trigger = "odd";
						}
					}
					else if(document.getElementById('resultRow_' + i).classList.contains('odd_inactive')) {
						trigger = 'even';
					}
					else if(document.getElementById('resultRow_' + i).classList.contains('even_inactive')) {
						trigger = 'odd';
					}
				}
				return flightList;
			})
			.then(function(result) {
				console.log('primarylist');
				//console.log(result);
				cb(result);
			})
			.catch(function (error) {
				console.error('getPrimaryFlightList failed due to: ', error);
			});

	}
	
	function findRow(flight , cb) {
		console.log('findRow');
		nightmare
			.evaluate(function(flight) {
					var retVal = -1;
					for(var i = 0; document.getElementById('resultRow_' + i); i++) {
						console.log(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText + ' && ' + flight)
						if(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText == flight) {
							retVal = i;
							break;
						}
					}
					console.log(retVal);
					return retVal;
				}, currFlightList[0]
			)
			.then(function(i) {
				//console.log('The value we are looking for is in ' + i);
				//cb();
				if(i == -1) {
					console.log('Flight was Not found');
					rebootNightmare();
				}
				else {
					clickFlight(i,flight,  cb);
				}
				//console.log("successfully entered flight overview");
			})
			.catch(function (error) {
				console.error('findRow failed due to: ', error);
				rebootNightmare();
		});
			
			//.click('tr#resultRow_5 > td.center:nth-child(25) > a:nth-child(1)')
			//.click('tr#resultRow_14 > td.center:nth-child(25) > a:nth-child(1)')
	}
	
	function clickFlight(row ,flight,  cb) {
		nightmare
			.click('tr#resultRow_' + row + ' > td.center:nth-child(25) > a:nth-child(1)')
			.then(function(i) {
				scanFlight(flight, cb);
			})
			.catch(function (error) {
				console.error('clickFlight failed due to: ', error);
		});
			
			//.click('tr#resultRow_5 > td.center:nth-child(25) > a:nth-child(1)')
			//.click('tr#resultRow_14 > td.center:nth-child(25) > a:nth-child(1)')
	}
	
	function loopController(salesPlant, updatedFile, flightList) {
		console.log('>---------------Current flight is: ' + currFlightList[0]);
		if(currUpdatedFile[currFlightList[0]]) {
			console.log('Flight exists in updated list');
			loadSalesPlantAndFlightToday(currSalesPlant, currFlightList[0], function() {
				console.log(currFlightList + ' Scanned');
				//currFlightList.shift();
			})
		}
		else if(currFlightList[0]) {
			console.log('Flight wasnt in updated list');
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "Flight " + currFlightList[0] + " was not in the list of flights to be updated\n\n" , 'utf-8');
			logging(currFilePath, "Flight " + currFlightList[0] + " was not in the list of flights to be updated\n\n")
			currFlightList.shift();
			loopController();
		}
		else {
			console.log('Done?');
			console.log(currFlightList);
			console.log('currDiff');
			console.log(currDiff);
			//var fs = require('fs');
			//fs.appendFileSync('Log Files.txt', 'Diff\n');
			//fs.appendFileSync('Log Files.txt', currDiff);
			var util = require('util');
			//fs.writeFileSync('./PassengerFiles/' + currSalesPlantName + 'Diff_' + todayFileDate + '.json', util.inspect(currDiff) , 'utf-8');
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "Final Differences are\n" , 'utf-8');
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(currDiff) , 'utf-8');
			logging(currFilePath, "Final Differences are:", currDiff);
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', '\n' ,'utf-8');
			console.log('Object size is:' + Object.keys(currDiff).length );
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', 'For Excel\n' ,'utf-8');
			for(var key in currDiff) {
				var tmp = 0;
				for(var key2 in currDiff[key]) {
					if(Object.keys(currDiff[key][key2]).length > 0) {
						for( var key3 in currDiff[key][key2]) {
							if(tmp == 0) {
								gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', key + '\t' ,'utf-8');
								tmp++;
							}
							else {
								gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', '\t' ,'utf-8');
							}
							gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', currDiff[key][key2][key3].split('x')[0] + '\t' + ' ' + '\t' + key2 + '\t' + key3 + '\t' + currDiff[key][key2][key3].split('x')[1] + '\n' ,'utf-8');
						}
					}
				}
			}
		}
	}
	
	function pilotController(salesPlant, updatedFile, flightList) {
		if(currFlightList['AC' + currSalesPlant]) {
			console.log('Current flight is: ' + currFlightList['AC' + currSalesPlant][0]);
		}
		if(currFlightList['AC' + currSalesPlant]) {
			if(currFlightList['AC' + currSalesPlant][0]) {
				loadSalesPlantAndFlightTmw(currSalesPlant, currFlightList['AC' + currSalesPlant][0], function() {
					console.log(currFlightList + ' Scanned');
				})
			}
			else {
				console.log('advance');
				gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "SalesPlant AC" + currSalesPlant + " parsed moving on \n\n"  , 'utf-8');
				currDiff['AC' + currSalesPlant + 'E'] = 'Sales Plant ' +  currSalesPlant + ' Complete';
				currSalesPlant++;
				currDiff['AC' + currSalesPlant + 'S'] = 'Sales plant ' + currSalesPlant + ' below';
				pilotController();
			}
		}
		else if(currSalesPlant < 1410) {
			console.log('advance2');
			gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "SalesPlant AC" + currSalesPlant + " appears to be empty \n\n"  , 'utf-8');
			currDiff['AC' + currSalesPlant + 'E'] = 'Sales Plant ' + currSalesPlant + ' Complete';
			currSalesPlant++;
			currDiff['AC' + currSalesPlant + 'S'] = 'Sales plant ' + currSalesPlant + ' below';
			pilotController();
		}
		else {
			console.log('Done?');
			console.log('currDiff');
			console.log(currDiff);
			var util = require('util');
			gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "Final Differences are\n" , 'utf-8');
			gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', gutil.inspect(currDiff) , 'utf-8');
		}
	}
	
	function diffController() {
		//currDiff
		//currSalesPlant
		//currflightList
		console.log('\n>-------------------Current flight is: ' + currFlightList[0]);
		loadFlightToday(currSalesPlant, currFlightList[0], function() {
				console.log(currFlightList + ' Scanned?');
			})
	}
	
	function scanFlight(flight, cb) {
		nightmare
			.wait(500)
			.wait('div#specialMeals_title')
			.evaluate(function() {
				var i = 1;
				var BC = [];
				var EC = [];
				var EU = [];
				var CC = [];
				var CY = [];
				var retVal = [];
				while(document.getElementById('deleted_' + i)) {
					if(document.getElementById('deleted_' + i).checked == false) {
						if(document.getElementById('class_' + i).value == "BC") {
							if( BC[document.getElementById('code_' + i).value] ) {
								BC[document.getElementById('code_' + i).value] = parseInt(BC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								BC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "EU") {
							if( EU[document.getElementById('code_' + i).value] ) {
								EU[document.getElementById('code_' + i).value] = parseInt(EU[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								EU[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "EC") {
							if( EC[document.getElementById('code_' + i).value] ) {
								EC[document.getElementById('code_' + i).value] = parseInt(EC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								EC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "CC") {
							if( CC[document.getElementById('code_' + i).value] ) {
								CC[document.getElementById('code_' + i).value] = parseInt(CC[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								CC[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
						else if(document.getElementById('class_' + i).value == "CY") {
							if( CY[document.getElementById('code_' + i).value] ) {
								CY[document.getElementById('code_' + i).value] = parseInt(CY[document.getElementById('code_' + i).value]) + parseInt(document.getElementById('quantity_' + i).value);
							}
							else {
								CY[document.getElementById('code_' + i).value] = parseInt(document.getElementById('quantity_' + i).value);
							}
						}
					}
					i++;
				}
				var tmpBC = 'BC';
				for( var key in BC ) {
					tmpBC = tmpBC + 'x' + key + ':' + JSON.stringify(BC[key]);
				}
				
				var tmpEC = 'EC';
				for( var key in EC ) {
					tmpEC = tmpEC + 'x' + key + ':' + JSON.stringify(EC[key]);
				}
				
				var tmpEU = 'EU';
				for( var key in EU ) {
					tmpEU = tmpEU + 'x' + key + ':' + JSON.stringify(EU[key]);
				}
				
				var tmpCC = 'CC';
				for( var key in CC ) {
					tmpCC = tmpCC + 'x' + key + ':' + JSON.stringify(CC[key]);
				}
				
				var tmpCY = 'CY';
				for( var key in CY ) {
					tmpCY = tmpCY + 'x' + key + ':' + JSON.stringify(CY[key]);
				}
				retVal.push(tmpBC);
				retVal.push(tmpEC);
				retVal.push(tmpEU);
				retVal.push(tmpCC);
				retVal.push(tmpCY);
				return retVal;
			})
			.then(function(result) {
				//0BC,1EC,2EU,3CC,4CY
				if(result[0].split('x').length <= 1 && result[1].split('x').length <= 1 && result[2].split('x').length <= 1) {
					console.log('Empty Lists, checking items');
					checkItems(flight, cb);
				}
				else {
					if(result[0].split('x').length > 1) {
						var BC = [];
						for(var i = 1; result[0].split('x')[i]; i++) {
							BC[result[0].split('x')[i].split(':')[0]] = result[0].split('x')[i].split(':')[1];
						}
					}
					if(result[1].split('x').length > 1) {
						var EC = [];
						for(var i = 1; result[1].split('x')[i]; i++) {
							EC[result[1].split('x')[i].split(':')[0]] = result[1].split('x')[i].split(':')[1];
						}
					}
					
					if(result[2].split('x').length > 1) {
						var EU = [];
						for(var i = 1; result[2].split('x')[i]; i++) {
							EU[result[2].split('x')[i].split(':')[0]] = result[2].split('x')[i].split(':')[1];
						}
					}
					
					if(result[3].split('x').length > 1) {
						var CC = [];
						for(var i = 1; result[3].split('x')[i]; i++) {
							CC[result[3].split('x')[i].split(':')[0]] = result[3].split('x')[i].split(':')[1];
						}
					}
					
					if(result[4].split('x').length > 1) {
						var CY = [];
						for(var i = 1; result[4].split('x')[i]; i++) {
							CY[result[4].split('x')[i].split(':')[0]] = result[4].split('x')[i].split(':')[1];
						}
					}
					/*
					console.log('-');
					console.log(BC);
					console.log('-');
					console.log(EC);
					console.log('-');
					console.log(EU);
					console.log('-');
					console.log(CC);
					console.log('-');
					console.log(CY);
					console.log('-');
					*/
					
					var retVal = [];
					if(BC) { retVal['BC'] = BC; }
					if(EC) { retVal['EC'] = EC; }
					if(EU) { retVal['EU'] = EU; }
					if(CC) { retVal['CC'] = CC; }
					if(CY) { retVal['CY'] = CY; }
					
					compare(flight,retVal, cb);
				}
			})
			.catch(function (error) {
				console.error('scanFlight failed due to: ', error);
			});
	}
	
	function checkItems(flight, cb) {
		nightmare
			.click('div#layout_navigation > div.rightContent:nth-child(6) > div.tabs:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td.tab:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td.m:nth-child(2) > a:nth-child(1)')
			.wait('table#table_row_0')
			.evaluate(function() {
				return document.getElementById('commentTexts_0').value;
			})
			.then(function(result) {
				if(result.search("GARBAGE") > -1) {
					console.log(currFlightList[0] + ' is a Garbage flight');
					gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "Flight " + currFlightList[0] + " was determined to be a garbage flight\n\n" , 'utf-8');
					logging('currFilePath', "Flight " + currFlightList[0] + " was determined to be a garbage flight")
					back();
				}
				else {
					console.log(currFlightList[0] + ' is not a Garbage flight');
					var tmp = [];
					compare(flight, tmp, cb); 
				}
			})
			.catch(function (error) {
				console.error('checkItems failed due to: ', error);
			});
			
		
	}


	function logging(filepath, title, data, spacing) {
		/*
		fs.appendFileSync(filepath, title , 'utf-8');
		fs.appendFileSync(filepath, '\n' , 'utf-8');
		if(data) {
			fs.appendFileSync(filepath, util.inspect(data) , 'utf-8');
			fs.appendFileSync(filepath, '\n' , 'utf-8');
		}
		if(spacing) {
			fs.appendFileSync(filepath, '\n' , 'utf-8');
		}
		*/
	}
	
	function compare(flight, cate, cb) {
		console.log('>---------------Comparing CXP----------------<');
		console.log(cate);
		console.log('>---------------Updated File------------------<');
		console.log(currUpdatedFile[currFlightList[0]]);
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "Flight " + currFlightList[0] + ' details:\n' , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "CXP\n" , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(cate) , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "\n" , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "Updated File\n" , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(currUpdatedFile[currFlightList[0]]) , 'utf-8');

		logging(currFilePath, "Flight " + currFlightList[0] + ' details: \n CXP', cate);
		logging(currFilePath, "Updated File", currUpdatedFile[currFlightList[0]])

		var Diff = [];
		if(currUpdatedFile[currFlightList[0]]['EC']) {
			Diff['EC'] = [];
			for(var key in currUpdatedFile[currFlightList[0]]['EC']) {
				if(cate['EC']) {
					if(cate['EC'][key]) {
						//console.log('CXP has ' + key + 'Updated:' + YVRSP[flight]['EC'][key] + ' VS CXP:' + cate['EC'][key]);
						var tmp = parseInt(currUpdatedFile[currFlightList[0]]['EC'][key]) - parseInt(cate['EC'][key]);
						if( tmp != 0) {
							Diff['EC'][key] = parseInt(currUpdatedFile[currFlightList[0]]['EC'][key]) - parseInt(cate['EC'][key]);
							Diff['EC'][key] = Diff['EC'][key] +  'x' + currUpdatedFile[currFlightList[0]]['EC'][key];
						}
					}
					else {
						Diff['EC'][key] = parseInt(currUpdatedFile[currFlightList[0]]['EC'][key]);
						Diff['EC'][key] = Diff['EC'][key] +  'x' + currUpdatedFile[currFlightList[0]]['EC'][key];
					}
				}
				else {
					Diff['EC'][key] = parseInt(currUpdatedFile[currFlightList[0]]['EC'][key]);
					Diff['EC'][key] = Diff['EC'][key] +  'x' + currUpdatedFile[currFlightList[0]]['EC'][key];
				}
			}
		}
		if(currUpdatedFile[currFlightList[0]]['EU']) {
			Diff['EU'] = [];
			for(var key in currUpdatedFile[currFlightList[0]]['EU']) {
				if(cate['EU']) {
					if(cate['EU'][key]) {
						//console.log('CXP has ' + key + 'Updated:' + YVRSP[flight]['EU'][key] + ' VS CXP:' + cate['EU'][key]);
						var tmp = parseInt(currUpdatedFile[currFlightList[0]]['EU'][key]) - parseInt(cate['EU'][key]);
						if( tmp != 0) {
							Diff['EU'][key] = parseInt(currUpdatedFile[currFlightList[0]]['EU'][key]) - parseInt(cate['EU'][key]) ;
							Diff['EU'][key] = Diff['EU'][key] +  'x' + currUpdatedFile[currFlightList[0]]['EU'][key];
						}
					}
					else {
						Diff['EU'][key] = parseInt(currUpdatedFile[currFlightList[0]]['EU'][key]);
						Diff['EU'][key] = Diff['EU'][key] +  'x' + currUpdatedFile[currFlightList[0]]['EU'][key];
					}
				}
				else {
					Diff['EU'][key] = parseInt(currUpdatedFile[currFlightList[0]]['EU'][key]);
					Diff['EU'][key] = Diff['EU'][key] +  'x' + currUpdatedFile[currFlightList[0]]['EU'][key];
				}
			}
		}
		if(currUpdatedFile[currFlightList[0]]['BC']) {
			Diff['BC'] = [];
			for(var key in currUpdatedFile[currFlightList[0]]['BC']) {
				if(cate['BC']) {
					if(cate['BC'][key]) {
						//console.log('CXP has ' + key + 'Updated:' + YVRSP[flight]['BC'][key] + ' VS CXP:' + cate['BC'][key]);
						var tmp = parseInt(currUpdatedFile[currFlightList[0]]['BC'][key]) - parseInt(cate['BC'][key]);
						if( tmp != 0) {
							Diff['BC'][key] = parseInt(currUpdatedFile[currFlightList[0]]['BC'][key]) - parseInt(cate['BC'][key]) ;
							Diff['BC'][key] = Diff['BC'][key] +  'x' + currUpdatedFile[currFlightList[0]]['BC'][key];
						}
					}
					else {
						Diff['BC'][key] = parseInt(currUpdatedFile[currFlightList[0]]['BC'][key]);
						Diff['BC'][key] = Diff['BC'][key] +  'x' + currUpdatedFile[currFlightList[0]]['BC'][key];
					}
				}
				else {
					Diff['BC'][key] = parseInt(currUpdatedFile[currFlightList[0]]['BC'][key]);
					Diff['BC'][key] = Diff['BC'][key] +  'x' + currUpdatedFile[currFlightList[0]]['BC'][key];
				}
			}
		}
		console.log('>----------------Final Diff for ' + currFlightList[0] + ' is ');
		console.log(Diff);
		var flag = 0;
		if(Diff['EC']) {
			if(Object.keys(Diff['EC']).length > 0)
				flag++;
		}
		if(Diff['EU']) {
			if(Object.keys(Diff['EU']).length > 0)
				flag++;
		}
		if(Diff['BC']) {
			if(Object.keys(Diff['BC']).length > 0)
				flag++;
		}		
		if(Diff['EC']) 	console.log('EC Size: ' + Object.keys(Diff['EC']).length);
		if(Diff['EU']) 	console.log('EU Size: ' + Object.keys(Diff['EU']).length);
		if(Diff['BC']) 	console.log('BC Size: ' + Object.keys(Diff['BC']).length);
		console.log('\n\n\n');
		if(flag > 0) {
			currDiff[currFlightList[0]] = Diff;
		}
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "\n Final Diff \n" , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(Diff) , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "\n\n" , 'utf-8');
		logging(currFilePath, 'Final Diff', Diff);
		back();
	}
	
	function back() {
		currFlightList.shift()
			nightmare
				.click('a#backLink > img:nth-child(1)')
				.wait(5000)
				.then(function() {
					loopController();
				})
				.catch(function (error) {
					console.error('back failed due to: ', error);
				});
	}
	function backAlt() {
		currFlightList['AC' + currSalesPlant].shift()
			nightmare
				.click('a#backLink > img:nth-child(1)')
				.wait(5000)
				.then(function() {
					pilotController();
				})
				.catch(function (error) {
					console.error('back failed due to: ', error);
				});
	}
	
	function PaxLoader(paxfiles, type ) {
		var i = 1402;
		while(paxfiles[i]) {
			var path = process.cwd();
			var buffer = fs.readFileSync("./PilotCrewFiles/" + paxfiles[i] + ".txt");
			var longList = buffer.toString();
			longList = longList.split(/\n/);
			for(var j = 0; longList[j]; j++) {
				if( longList[j].startsWith(unitCodes[i])) {
					if( longList[j].search(tomorrowFileSearchDate) > -1 ) {
						//console.log("flight: " + longList[j].substring(6, 10) + " num meals: " +  longList[j].substring(23, 25));
						addToPax( type, i, longList[j].substring(6, 10), longList[j].substring(23,25));
					}
				}
			}
			i++;
		}
		//console.log(array);
	}
	function SPMLLoader(smplfiles, type) {
		var i = 1402;
		while(i < 1410) {
			if(smplfiles[i]) {
				//console.log('Scanning: ' + i);
				var path = process.cwd();
				var buffer = fs.readFileSync("./PilotCrewFiles/" + smplfiles[i] + ".txt");
				var longList = buffer.toString();
				longList = longList.split(/\n/);
				for(var j = 0; longList[j]; j++) {
					if( longList[j].startsWith("SPML")) {
						console.log('Searching for: ' + currDate);
						if( longList[j].search(tomorrowFileSearchDate) > -1 ) {
							//console.log("Flight:" + longList[j].substring(11, 15) + " Meal:" +  longList[i].substring(26, 30));
							addToSMPL( type, i, longList[j].substring(11, 15), longList[j].substring(26,30));
						}
					}
				}
			}
			i++;
		}
		console.log(SPML);
		
		
	}
	function addToPax(list, flight, qty) {
		flight = 'AC' + flight;
		list[flight] = parseInt(qty);
	}
	function addToSMPL(type, AC, flight, mealname) {
		AC = 'AC' + AC;
		flight = 'AC' + flight;
		if(SPML[AC]) {
			if(SPML[AC][flight]) {
				if(SPML[AC][flight][type]) {
					if(SPML[AC][flight][type][mealname]) {
						SPML[AC][flight][type][mealname] = SPML[AC][flight][type][mealname] + 1;
					}
					else {
						SPML[AC][flight][type][mealname] = 1;
					}
				}
				else {
					SPML[AC][flight][type] = []
					SPML[AC][flight][type][mealname] = 1;
				}
			}
			else {
				SPML[AC][flight] = []
				SPML[AC][flight][type] = []
				SPML[AC][flight][type][mealname] = 1;
			}
		}
		else {
			SPML[AC] = []
			SPML[AC][flight] = []
			SPML[AC][flight][type] = []
			SPML[AC][flight][type][mealname] = 1;
		}
	}
	
	function YVRLoader() {
		var path = process.cwd();
		var buffer = fs.readFileSync("AC1401SP00.txt"); //This
		var longList = buffer.toString();
		longList = longList.split(/\n/);
		for(var j = 0; longList[j]; j++) {
			if( longList[j].substring(7, 10) == "YYZ") { //This
				addToYVR(longList[j].substring(3, 7),longList[j].substring(18, 22), longList[j].substring(36,37));
			}
		}
	}
	
	function SPMLPassLoader(list, file, search) {
		var path = process.cwd();
		var buffer = fs.readFileSync("./PassengerFiles/" + file + '.txt'); //This
		var longList = buffer.toString();
		longList = longList.split(/\n/);
		for(var j = 0; longList[j]; j++) {
			if( longList[j].substring(7, 10) == search) { //This
				addToPassenger(list,longList[j].substring(3, 7),longList[j].substring(18, 22), longList[j].substring(36,37));
			}
		}
		//console.log(list);
		var util = require('util');
		//fs.writeFileSync('./PassengerFiles/' + search + '_' + formattedTodayDateFile + '.json', util.inspect(list) , 'utf-8'); // Change data name, and injected
	}
	
	function addToPassenger(list,flight, mealname, type) {
		flight = 'AC' + flight;
		if(type == 'Y') type = 'EC';
		else if(type == 'W') type = 'EU';
		else if(type == 'J') type = 'BC';
		
		if(list[flight]) {
			if(list[flight][type]) {
				if(list[flight][type][mealname]) {
					list[flight][type][mealname] = list[flight][type][mealname] + 1;
				}
				else {
					list[flight][type][mealname] = 1;
				}
			}
			else {
				list[flight][type] = []
				list[flight][type + 'Total'] = [];
				list[flight][type][mealname] = 1;
			}
		}
		else {
			list[flight] = []
			list[flight][type] = []
			list[flight][type + 'Total'] = [];
			list[flight][type][mealname] = 1;
		}
		if(mealname.substring(0,1) == 'P' || mealname.substring(0,1) == 'R') {
			if(!list[flight][type + 'Total']['BOB']) {
				list[flight][type + 'Total']['BOB'] = 1;
			}
			else {
				list[flight][type + 'Total']['BOB']++;
			}
		}
		else {
			if(!list[flight][type + 'Total']['ML']) {
				list[flight][type + 'Total']['ML'] = 1;
			}
			else {
				list[flight][type + 'Total']['ML']++;
			}
		}
	}
	
	function addToYVR(flight, mealname, type) {
		flight = 'AC' + flight;
		if(YVRSP[flight]) {
			if(YVRSP[flight][type]) {
				if(YVRSP[flight][type][mealname]) {
					YVRSP[flight][type][mealname] = YVRSP[flight][type][mealname] + 1;
				}
				else {
					YVRSP[flight][type][mealname] = 1;
				}
			}
			else {
				YVRSP[flight][type] = []
				YVRSP[flight][type + 'Total'] = [];
				YVRSP[flight][type][mealname] = 1;
			}
		}
		else {
			YVRSP[flight] = []
			YVRSP[flight][type] = []
			YVRSP[flight][type + 'Total'] = [];
			YVRSP[flight][type][mealname] = 1;
		}
		if(mealname.substring(0,1) == 'P' || mealname.substring(0,1) == 'R') {
			if(!YVRSP[flight][type + 'Total']['BOBtotal']) {
				YVRSP[flight][type + 'Total']['BOBtotal'] = 1;
			}
			else {
				YVRSP[flight][type + 'Total']['BOBtotal']++;
			}
		}
		else {
			if(!YVRSP[flight][type + 'Total']['MLtotal']) {
				YVRSP[flight][type + 'Total']['MLtotal'] = 1;
			}
			else {
				YVRSP[flight][type + 'Total']['MLtotal']++;
			}
		}
	}

io.sockets.on('connection', function(socket) {
	console.log("Client has connected on ip: " + socket.handshake.address);
	
	socket.on('Login', function() {
		firstLogin(function() {
			console.log('First Login');
		});
	})
	
	
	socket.on('Scan', function() {
		console.log('Scanning page');
		scanner();
	})

	socket.on('CheckList', function() {
		console.log('check list');
	})
	
	socket.on('CheckFlight', function() {
		console.log('check flight');
	})
	
	socket.on('debug1', function() {
		console.log('Debug1 Pressed');
		loadSalesPlant('1403', function() {
			console.log('completed run');
		})
	})
	
	socket.on('debug2', function() {
		console.log('Debug2 Pressed');
		findRow('AC0025', function() {
			console.log('find row complete');
		})	
	})
	
	socket.on('debug3', function() {
		console.log('Debug3 Pressed');
		loadSalesPlantAndFlight('1403', 'AC0025', function() {
			console.log('comple');
		})
	})
	socket.on('debug4', function() {
		console.log('Debug4 Pressed');
		console.log('Current Diff');
		console.log(currDiff);
	})
	socket.on('debug5', function() {
		console.log('Debug5 Pressed');
		console.log('Parse Numerous');
	})
	socket.on('pass', function() {
		console.log('pass Pressed');
		//These Parse for the morning
		console.log('Parse');
		YVRSP = [];
		YYCSP = [];
		YYZSP = [];
		SPMLPassLoader(YVRSP, 'AC1403SP00', 'YVR');
		SPMLPassLoader(YYCSP, 'AC1404SP00', 'YYC');
		SPMLPassLoader(YYZSP, 'AC1401SP00', 'YYZ');
		console.log('YVR');
		console.log(YVRSP);
	})
	socket.on('step1', function() {
		console.log('step1 Pressed');
		YVRSP = [];
		SPMLPassLoader(YVRSP, 'AC1403SP00', 'YVR');
		console.log('Updated Passenger File YVRSP is:');
		console.log(YVRSP);
		console.log('End Updated Passenger File');
	})
	socket.on('step2', function() {
		console.log('Step 2 Pressed');
		loadSalesPlantTime( '1403' , todaySlashFormat , '15:00', function(result) {
			console.log('Loaded flightslist');
			console.log(result);
			YVRFlightList = result;
		})
	})
	socket.on('setupYVR', function() {
		//var fs = require('fs');
		currDiff = [];
		currSalesPlant = '1403';
		currSalesPlantName = 'YVR';
		currFilePath =  './PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.txt'
		//fs.appendFileSync('Log Files.txt', "YVR");
		console.log('Setting up Environment for YVR');
		YVRSP = [];
		SPMLPassLoader(YVRSP, 'AC1403SP00', 'YVR');
		console.log('Updated Passenger File YVRSP is:');
		console.log(YVRSP);
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "Todays Date is: " + todayFileDate + " And we are parsing for todays date after " + "15:00\n" , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', 'YVR Grand List is\n' , 'utf-8');		
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(YVRSP) , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', '\n\n' , 'utf-8');
		console.log('End Updated Passenger File');
		console.log('Step 2 Pressed');
		loadSalesPlantTime( '1403' , todaySlashFormat , '15:00', function(result) {
			console.log('Loaded flightslist');
			//console.log(result);
			YVRFlightList = result;
			YVRFlightList.sort();
			currFlightList = YVRFlightList;
			console.log(currFlightList);
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', 'YVR Flights to be scanned today\n' , 'utf-8');		
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(currFlightList) , 'utf-8');
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', '\n\n' , 'utf-8');	
			currUpdatedFile = YVRSP;
			//var fs = require('fs');
			//fs.appendFileSync('Log Files.txt', "Full Flight List");
			//fs.appendFileSync('Log Files.txt', YVRFlightList);
			loopController();
		})
		
	})
	socket.on('setupYYC', function() {
		//var fs = require('fs');
		currDiff = [];
		currSalesPlant = '1404';
		currSalesPlantName = 'YYC';
		currFilePath =  './PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.txt'
		//fs.appendFileSync('Log Files.txt', "YYC\n");
		console.log('Setting up Environment for YYC');
		YYCSP = [];
		SPMLPassLoader(YYCSP, 'AC1404SP00', 'YYC');
		console.log('Updated Passenger File YYCSP is:');
		console.log(YYCSP);
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "Todays Date is: " + todayFileDate + " And we are parsing for todays date after " + "15:00\n" , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', 'YYC Grand List is\n' , 'utf-8');		
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(YYCSP) , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', '\n\n' , 'utf-8');
		
		logging(currFilePath, "Todays Date is: " + todayFileDate + " And we are parsing for todays date after " + "15:00\n YYC Grand List", YYCSP, true);
		console.log('End Updated Passenger File');
		console.log('Step 2 Pressed');
		loadSalesPlantTime( '1404' , todaySlashFormat , '15:00', function(result) {
			console.log('Loaded flightslist');
			//console.log(result);
			YYCFlightList = result;
			YYCFlightList.sort();
			currFlightList = YYCFlightList;
			console.log(currFlightList);
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', 'YYC Flights to be scanned today\n' , 'utf-8');		
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(currFlightList) , 'utf-8');
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', '\n\n' , 'utf-8');	
			logging(currFilePath, "YYC Flights to be scanned today:", currFlightList, true);
			currUpdatedFile = YYCSP;
			//var fs = require('fs');
			//fs.appendFileSync('Log Files.txt', "Full Flight List\n");
			//fs.appendFileSync('Log Files.txt', YYCFlightList);
			//fs.appendFileSync('Log Files.txt', "\n");
			loopController();
		})
		
	})
	socket.on('setupYYZ', function() {
		//var fs = require('fs');
		currDiff = [];
		currSalesPlant = '1401';
		currSalesPlantName = 'YYZ';
		currFilePath =  './PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.txt'
		//fs.appendFileSync('Log Files.txt', "YYZ");
		console.log('Setting up Environment for YYZ');
		YYZSP = [];
		SPMLPassLoader(YYZSP, 'AC1401SP00', 'YYZ');
		console.log('Updated Passenger File YYZSP is:');
		console.log(YYZSP);
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', "Todays Date is: " + todayFileDate + " And we are parsing for todays date after " + "17:00\n" , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', 'YYZ Grand List is\n' , 'utf-8');		
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(YYZSP) , 'utf-8');
		gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', '\n\n' , 'utf-8');

		logging(currFilePath, "Todays Date is: " + todayFileDate + " And we are parsing for todays date after " + "17:00\n YYZ Grand List", YYZSP, true);
		console.log('End Updated Passenger File');
		console.log('Step 2 Pressed');
		loadSalesPlantTime( '1401' , todaySlashFormat , '17:00', function(result) {
			console.log('Loaded flightslist');
			//console.log(result);
			for(var i = 0; result[i]; i++) {
				if(result[i].search('AC00') > -1 || result[i].search('AC08') > -1 || result[i].search('AC19') > -1) {
					YYZFlightList.push(result[i]);
				}
			}
			//YYZFlightList = result;
			YYZFlightList.sort();
			currFlightList = YYZFlightList;
			console.log(currFlightList);
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', 'YYZ Flights to be scanned today\n' , 'utf-8');		
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', gutil.inspect(currFlightList) , 'utf-8');
			gfs.appendFileSync('./PassengerFiles/' + currSalesPlantName + 'DeepLog_' + todayFileDate + '.json', '\n\n' , 'utf-8');	
			logging(currFilePath, "YYZ Flights to be scanned today:", currFlightList, true);
			currUpdatedFile = YYZSP;
			//var fs = require('fs');
			//fs.appendFileSync('Log Files.txt', "Full Flight List");
			//fs.appendFileSync('Log Files.txt', YYZFlightList);
			loopController();
		})
		
	})
	socket.on('NextFlight', function() {
		console.log('Queuing Next Flight');
		loopController();
	})
	socket.on('setupPilot', function() {
		console.log('setupPilot Pressed');
		SPMLLoader(ccFiles , "CC");
		console.log(ccFiles);
		SPMLLoader(cyFiles , "CY");
		console.log(cyFiles);
		currFlightList = [];
		currSalesPlant = '1402';
		currDiff = [];
		currDiff['AC1402S'] = "Sales plant 1402 below";
		currFilePath =  './PilotCrewFiles/SPML' + todayFileDate + '.json'
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "Todays Date is: " + todayFileDate + " And we are parsing for tomorrows date\n" , 'utf-8');
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', "PilotCrewFiles List\n" , 'utf-8');
		for(var i = 1402; i < 1410; i++) {
			if(SPML['AC' + i]) {
				currFlightList['AC' + i] = [];
				for(var key in SPML['AC' + i]) {
					currFlightList['AC' + i].push(key);
				}
				console.log(i + ' currFlightList');
				console.log(currFlightList['AC' + i]);
				currUpdatedFile = SPML;
			}
		}
		console.log('Manual Data');
		for(var i = 1402; i < 1410; i++) {
			if(SPML['AC' + i]) {
				console.log('AC' + i);
				gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', 'Sales Plant: AC' + i + '\n' , 'utf-8');
				console.log(SPML['AC' + i]);
				gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', gutil.inspect(SPML['AC' + i]) , 'utf-8');
			}
			gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', '\n\n' , 'utf-8');
		}
		gfs.appendFileSync('./PilotCrewFiles/SPML' + todayFileDate + '.json', '\n\n' , 'utf-8');
	})
	socket.on('startDiff', function() {
		console.log('What I have to work with');
		console.log(currUpdatedFile);
		console.log('-');
		console.log(currDiff);
		currFlightList = [];
		for(var key in currDiff) {
				currFlightList.push(key);
				console.log('key is:' + key);
		}
		console.log('CurrFlightList');
		console.log(currFlightList);
		console.log(currFlightList[0]);
		console.log('CurrUpdatedfile');
		console.log(currUpdatedFile);
		//diffController();
		
	})
	socket.on('nextDiff', function() {
		diffController();
	})
	socket.on('skipDiff', function() {
		currBob = [];
		currMeal = [];
		currFlightList.shift();
		diffController();
	})
	socket.on('fillBob', function() {
		fillBobMeal('bob');
	})
	socket.on('fillMeal', function() {
		fillBobMeal('meal');
	})
	socket.on('saveFlight', function() {
		currFlightList.shift();
		saveFlight();
	})


	fillBobMeal
	socket.on('NextPilotFlight', function() {
		console.log('Queuing Next Pilot Flight');
		pilotController();
	})
	socket.on('skipPilotFlight', function() {
		console.log('Queuing Next Pilot Flight');
		currFlightList['AC' + currSalesPlant].shift()
		pilotController();
	})
	socket.on('step3', function() {
		console.log('YVR');
		loopController('1403', YVRSP, YVRFlightList);
	})
	socket.on('pilot', function() {
		console.log('pilot Pressed');
		SPMLLoader(ccFiles , "CC");
		SPMLLoader(cyFiles , "CY");
		console.log('Read the Data From here, its useful')
		for(var i = 1402; SPML['AC' + i]; i++) {
			console.log('AC' + i);
			console.log(SPML['AC' + i]);
		}
	})

	socket.on('debug', function() {
		socket.emit('debug', 'Message Received in app.js');
	})
	socket.on('searchForFlights', function() {
		Prototype.searchController();
	})
	socket.on('skipProto', function() {
		Prototype.skip();
	})
	socket.on('saveProto', function() {
		Prototype.save();
	})
	socket.on('resetProto', function() {
		Prototype.hardReset();
	})

	socket.on('disconnect', function() {
		console.log("Client has disconnected on ip: " + socket.handshake.address);
	})
});
var nightmare;

var scanner = function() {
	nightmare
			.evaluate(function() {
			var flightList = [];
			var fullTable = document.getElementById('for_resultsTable').getElementsByTagName('tr');
			console.log(fullTable);
			var trigger = "odd";
			for(var i = 0; i < (fullTable.length); i++) {
				if(fullTable[i].classList.contains(trigger)) {
					console.log("Taged");
					flightList.push( [fullTable[i].getElementsByTagName('a')[0].innerText] + "x" +  fullTable[i].getElementsByTagName('input')[40].value + "x" + fullTable[i].getElementsByTagName('input')[40].value);
					if(trigger == "odd") {
						console.log("odd");
						trigger = "even";
					}
					else {
						console.log("even");
						trigger = "odd";
					}
				}
				console.log('v2' + flightList);
			}
			console.log("v1" + flightList);
			return flightList;
			})
			.then(function(result) {
				console.log(result);
				console.log("remove successful?");
				minion("yes you can");
			})
			.catch(function (error) {
				console.error('firstLogin failed due to: ', error);
		});
}

var minion = function(passed) {
	nightmare
		.evaluate(function(passu) {
			return passu;
			}, passed
		)
		.then(function(result) {
				console.log(result);
		})
}

	
		//Logins into bato.to
var firstLogin = function(cb) {
	debug('firstLogin');
	console.log('Scafolding nightmare');
	
	nightmare = Nightmare({
		show: false,
		typeInterval: 20
	})
	
	/*
	nightmare = Nightmare({
		show: true,
		typeInterval: 20,
		webPreferences: {
			images: true,
			partition: 'persist: batoto'
		},
		openDevTools: {
			mode: 'detach'
		}
	})
	*/
	nightmare
		.viewport(1000, 800)
		.goto(Url.loginUrl)
		.wait('#j_username')
		.type('#j_username', Login.login)
		.type('#j_password', Login.password)
		.click('html > body > table.outside:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td.outside:nth-child(1) > table.inside:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td.lbar:nth-child(1) > table.box:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td.box-mm:nth-child(2) > form:nth-child(2) > table:nth-child(2) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(2) > input.button:nth-child(1)')
		.wait('#act0')
		.goto(Url.flightUrl)
		.wait('#for_resultsBoxContents')
		.then(function() {
			console.log("successfully entered flight overview");
			//cb();
		})
		.catch(function (error) {
			console.error('firstLogin failed due to: ', error);
	});
}

var rebootNightmare = function() {
	console.log('Trying to reboot nightmare');
	firstLogin();
	setTimeout(function(){ loopController(); }, 5000);
}
var rebootNightmareAlt = function() {
	console.log('Trying to reboot nightmare');
	firstLogin();
	setTimeout(function(){ pilotController(); }, 5000);
}

server.listen(port);

// launch ======================================================================
//app.listen(port);
console.log('The magic happens on port ' + port);






