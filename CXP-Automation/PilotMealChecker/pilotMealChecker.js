
var fs = require('fs');
var Login = require('../private/login.js');
var Url = require('../private/url.js');
var LocalUrl = require('../private/localUrl.js');
var Nightmare = require('nightmare');
var Log = require('../log.js');
var util = require('util');



var todaysDate = new Date();
var tomorrowsDate = new Date(new Date().getTime()  + 24 * 60 * 60 * 1000 );
var firstSalesPlant;
var lastSalesPlant;
var SPML;

var tomorrowsDate = new Date(new Date().getTime()  + 24 * 60 * 60 * 1000 );
var tomorrowFileSearchDate =  tomorrowsDate.getFullYear() + padDigits( (tomorrowsDate.getMonth() + 1), 2 ) + padDigits( (tomorrowsDate.getDate()), 2 ) ;
var tomorrowSlashFormat = (tomorrowsDate.getMonth() + 1) + "/" +(tomorrowsDate.getDate()) + "/" +  (tomorrowsDate.getFullYear().toString()).substring(2,4);
var todayFileDate = todaysDate.toDateString() + ' H' +  todaysDate.getHours();

var unitCodes = {
	 '1402' : 'YULAC' ,
	 '1403' : 'YVRAC' ,
	 '1404' : 'YYCAC' ,
	 '1405' : 'YOWAC' ,
	 '1406' : 'YHZAC' ,
	 '1407' : 'YEGAC' ,
	 '1408' : 'YWGAC' ,
	 '1409' : 'YQRAC' };


function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

var currDiff;
var currSalesPlant;
var currFlightList;
var currUpdatedFile;

function init(first, last) {
	currDiff = [];
	currSalesPlant = first;
	currFlightList = [];



	scafoldNightmare()
	Log.initBasic('../Archive/PilotSPML/PILOTCREWSPML_')
	firstSalesPlant = first;
	lastSalesPlant = last;
	SPML = [];
	Log.statement('Loading CC Files');
	SPMLLoader("CC");
	Log.statement('\nLoading CY Files');
	SPMLLoader("CY");
	//Meals for tmw
	console.log('Read the Data From here, its useful')
	Log.statement('\nInformation to parse:')
	for(var i = firstSalesPlant; i < (lastSalesPlant + 1) ; i++) {
		Log.data('AC' + i, SPML['AC' + i]);
		console.log('AC' + i);
		console.log(SPML['AC' + i]);
	}


	for(var i = first; i < (last + 1); i++) {
		if(SPML['AC' + i]) {
			currFlightList['AC' + i] = [];
			for(var key in SPML['AC' + i]) {
				currFlightList['AC' + i].push(key);
			}
			//console.log(i + ' currFlightList');
			//console.log(currFlightList['AC' + i]);
			currUpdatedFile = SPML;
		}
	}


}

function SPMLLoader(type) {
	var path = process.cwd();
	console.log(LocalUrl.pilotMealFiles + 'AC' + firstSalesPlant + type + '.txt')
	var stats = fs.statSync(LocalUrl.pilotMealFiles + 'AC' + firstSalesPlant + type + '.txt');
	var mtime = new Date(util.inspect(stats.mtime));

	if(mtime.toDateString() == todaysDate.toDateString()) {
		if(mtime.getHours() == todaysDate.getHours() || mtime.getHours() == (todaysDate.getHours() - 1) || mtime.getHours() == (todaysDate.getHours() + 1)) {
			Log.statement(type + ' file is currently up to date ' + mtime.getHours() + ':' + mtime.getMinutes() + ' ' + mtime.toDateString());
			for(var i = firstSalesPlant; i < (lastSalesPlant + 1); i++) {
				if(fs.existsSync(LocalUrl.pilotMealFiles + 'AC' + i + type + '.txt')) {
					Log.statement('Parsing: AC' + i + type + '.txt')
					console.log(i + type + '.txt' + ' Exists');
					var path = process.cwd();
					var buffer = fs.readFileSync(LocalUrl.pilotMealFiles + 'AC' + i + type + '.txt');
					var longList = buffer.toString();
					longList = longList.split(/\n/);
					for(var j = 0; longList[j]; j++) {
						if( longList[j].startsWith("SPML")) {
							//console.log('Searching for: ' + tomorrowFileSearchDate);
							if( longList[j].search(tomorrowFileSearchDate) > -1 ) {
								//console.log("Flight:" + longList[j].substring(11, 15) + " Meal:" +  longList[i].substring(26, 30));
								addToSMPL( type, i, longList[j].substring(11, 15), longList[j].substring(26,30));
							}
						}
					}
				}
				else {
					console.log(i + type + '.txt' + ' Missing');
					Log.statement('Missing: AC' + i + type + '.txt');
				}
			}
		}
		else {
			console.log('Somethings wrong, the last time file was updated is off');
			Log.statement('Hit a snag, file last updated: ' + mtime.getHours() + ':' + mtime.getMinutes() + ' ' + mtime.toDateString());
			Log.statement('Compared to when we are parsing:' + todaysDate.getHours() + ':' + todaysDate.getMinutes() + ' ' + todaysDate.toDateString());
		}
	}
	else {
		console.log('Somethings wrong, the last time file was updated is off');
		Log.statement('Hit a snag, file last updated: ' + mtime.getHours() + ':' + mtime.getMinutes() + ' ' + mtime.toDateString());
		Log.statement('Compared to when we are parsing:' + todaysDate.getHours() + ':' + todaysDate.getMinutes() + ' ' + todaysDate.toDateString());
	}


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




/*
function pilotController() {
	//If currSalesPlant is defined
	if(SPML[currSalesPlant]) {
		//If theres something inside the first entry on the list
		if(SPML[currSalesPlant][0]) {
			for(var key in SPML['AC' + currFlightList][0]) {
				package[0] = key;

				currFlightList['AC' + i].push(key);
			}
		}
		//Else advance
		else {
			Log.statement(currSalesPlant + ' parsed');
			currSalesPlant++;
			pilotController();
		}
	}
	//If we're still between first and last salesplant
	else if(currSalesPlant != lastSalesPlant) {

	}
	//Probably done
	else {

	}



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
		else if(currSalesPlant < lastSalesPlant) {
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
			console.log('Testing new output');
			/*
			for(var key in currDiff) {
				if(Object.keys(currDiff[key]).length > 0) {
					console.log(currDiff[key])
				}
			}

		}
	}

*/

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
			Log.statement("SalesPlant AC" + currSalesPlant + " parsed moving on", true);
			currDiff['AC' + currSalesPlant + 'E'] = 'Sales Plant ' +  currSalesPlant + ' Complete';
			currSalesPlant++;
			currDiff['AC' + currSalesPlant + 'S'] = 'Sales plant ' + currSalesPlant + ' below';
			pilotController();
		}
	}
	else if(currSalesPlant < (lastSalesPlant + 1)) {
		console.log('advance2');
		Log.statement("SalesPlant AC" + currSalesPlant + " appears to be empty"  , true);
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
		Log.data('Final Differences are', currDiff , true);
		console.log('Testing new output');
		/*
		for(var key in currDiff) {
			if(Object.keys(currDiff[key]).length > 0) {
				console.log(currDiff[key])
			}
		}
		*/
	}
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
		.wait(Delay.short())
		.click('input#subbutton')
		.wait('#resultRow_0 td img')
		.wait(Delay.medium())
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

function findRowAlt(flight , cb, failover) {
	console.log('findRow');
	nightmare
		.evaluate(function(flight) {
			console.log('looking for:' + flight)
				var retVal = -1;
				for(var i = 0; document.getElementById('resultRow_' + i); i++) {
					console.log(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText + ' && ' + flight)
					if(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText == flight) {
						retVal = i;
						break;
					}
				}
				console.log('end:' + retVal);
				return retVal;
			}, currFlightList['AC' + currSalesPlant][0]
		)
		.then(function(i) {
			//console.log('The value we are looking for is in ' + i);
			//cb();
			if(failover) {
				console.log('tried looking for it twice, does it exist at all?')
			}
			else if(i == -1) {
				console.log('Flight was Not found');
				setTimeout(function() { findRowAlt(flight, cb, true) }, 4000);
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
		.wait(Delay.short())
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
				Log.statement(currFlightList[0] + " appears to be a garbage flight" , true);
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


function comparePilotCrew(flight, cxpData, cb) {
	console.log('>----------------------Comparing CXP--------------------------<');
	console.log(cxpData);
	console.log('>-------------Updated File Data----------------<');
	console.log(currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]]);
	//Below is the data object relating to the data we care about
	var updatedData = currUpdatedFile['AC' + currSalesPlant][currFlightList['AC' + currSalesPlant][0]];
	var Diff = [];


	Log.statement("Flight " + currFlightList['AC' + currSalesPlant][0] + ' details:');
	Log.data('CXP', cxpData);
	Log.data('Updated File', updatedData);
	
	
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
	
	Log.data('Final Diff:' , Diff, true);
	
	backAlt();
}


function backAlt() {
	currFlightList['AC' + currSalesPlant].shift()
		nightmare
			.click('a#backLink > img:nth-child(1)')
			.wait(Delay.long())
			.then(function() {
				pilotController();
			})
			.catch(function (error) {
				console.error('back failed due to: ', error);
			});
}

var rebootNightmare = function() {
	console.log('Hit a snag, reboot nightmare');
	//scafoldNightmare();
	//setTimeout(function(){ loopController(); }, 5000);
}

var scafoldNightmare = function(cb) {
	console.log('Scafolding nightmare');
	nightmare = Nightmare({
		show: true,
		typeInterval: 20
	})
	nightmare
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
		})
}



exports.init = init;
exports.next = pilotController;