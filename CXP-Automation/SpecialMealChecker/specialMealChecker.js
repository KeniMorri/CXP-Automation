var fs = require('fs');
var Login = require('../private/login.js');
var Url = require('../private/url.js');
var LocalUrl = require('../private/localUrl.js');
var Nightmare = require('nightmare');
var Log = require('../log.js');
var util = require('util');


var salesPlantCodes = {
	 'YYZ' : '1401' ,
	 'YUL' : '1402' ,
	 'YVR' : '1403' ,
	 'YYC' : '1404' ,
	 'YOW' : '1405' ,
	 'YHZ' : '1406' ,
	 'YEG' : '1407' ,
	 'YWG' : '1408' ,
	 'YEG' : '1409' };

var salesPlantFiles = {
	 'YYZ' : 'AC1401SP00' ,
	 'YUL' : 'AC1402SP00' ,
	 'YVR' : 'AC1403SP00' ,
	 'YYC' : 'AC1404SP00' ,
	 'YOW' : 'AC1405SP00' ,
	 'YHZ' : 'AC1406SP00' ,
	 'YEG' : 'AC1407SP00' ,
	 'YWG' : 'AC1408SP00' ,
	 'YEG' : 'AC1409SP00' };


var diff;
var iterateList;
var flightList;
var salesPlant;
var todaysDate = new Date();
var tomorrowsDate = new Date(new Date().getTime()  + 24 * 60 * 60 * 1000 );
var todayFileSearchDate =  todaysDate.getFullYear() + padDigits( (todaysDate.getMonth() + 1), 2 ) + padDigits( (todaysDate.getDate()), 2 ) ;
var tomorrowFileSearchDate =  tomorrowsDate.getFullYear() + padDigits( (tomorrowsDate.getMonth() + 1), 2 ) + padDigits( (tomorrowsDate.getDate()), 2 ) ;
var todaySlashFormat = (todaysDate.getMonth() + 1) + "/" +(todaysDate.getDate()) + "/" +  (todaysDate.getFullYear().toString()).substring(2,4);
var tomorrowSlashFormat = (tomorrowsDate.getMonth() + 1) + "/" +(tomorrowsDate.getDate()) + "/" +  (tomorrowsDate.getFullYear().toString()).substring(2,4);

function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function init() {
	scafoldNightmare();
	Delay.init();
	/*
	shortDelay = 1000;
	mediumDelay = 2500;
	longDelay = 5000;
	*/
}


//Deals with the current Date
/*
Data required
SalesPlantName
	YYZ/YEG/YUL/etc
Time
	##:##
InternationFlag
	true or false

*/
function initPassengers(salesPlantName, time, interational, auto) {
	diff = [];
	iterateList = [];
	flightList = [];
	salesPlant = salesPlantCodes[salesPlantName];
	Log.initBasic('../Archive/PassengerSPML/' + salesPlantName + '_')
	PassengerFileLoader(salesPlantFiles[salesPlantName], salesPlantName);
	Log.statement('Parsing for todays date: ' + todaySlashFormat, false);
	Log.data(salesPlantName + ' Grand List:', iterateList, true);

	loadSalesPlantTime(salesPlant, todaySlashFormat, time, function(result) {
		if(interational == true) {
			for(var i = 0; result[i]; i++) {
				if(result[i].search('AC00') > -1 || result[i].search('AC08') > -1 || result[i].search('AC19') > -1) {
					flightList.push(result[i]);
				}
			}
		}
		else {
			flightList = result;
		}
		flightList.sort();
		Log.data(salesPlantName + ' flights after: ' + time + ':', flightList, true);
		console.log(salesPlantName + ' flights after: ' + time + ':\n');
		console.log(flightList);
		console.log('\n');
		if(auto) {
			loopController();
		}
	})
}

function PassengerFileLoader(file, search) {
		var path = process.cwd();
		var stats = fs.statSync(LocalUrl.specialMealFiles + file + '.txt');
		var mtime = new Date(util.inspect(stats.mtime));
		console.log(mtime);

		if(mtime.toDateString() == todaysDate.toDateString()) {
			if(mtime.getHours() == todaysDate.getHours() || mtime.getHours() == (todaysDate.getHours() - 1) || mtime.getHours() == (todaysDate.getHours() + 1)) {
				Log.statement('Looks like file is currently up to date:' + mtime.getHours() + ':' + mtime.getMinutes() + ' ' + mtime.toDateString());
				console.log('Looks like file is currently up to date:' + mtime.getHours() + ':' + mtime.getMinutes() + ' ' + mtime.toDateString());
				var buffer = fs.readFileSync(LocalUrl.specialMealFiles + file + '.txt'); //This
				var longList = buffer.toString();
				longList = longList.split(/\n/);
				for(var j = 0; longList[j]; j++) {
					//Checks to make sure we're searching the correct file
					if( longList[j].search(todayFileSearchDate) > -1 ) {
						if( longList[j].substring(7, 10) == search) {
							addToPassenger(longList[j].substring(3, 7),longList[j].substring(18, 22), longList[j].substring(36,37));
						}
					}
					else {
						console.log('The date on this file appears to be wrong, can you double check it!');
						Log.statement('The date on this file appears to be wrong, can you double check it!', true);
						console.log(todayFileSearchDate);
						console.log(longList[j]);
						break;
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
		var count = 0;
		for( var key in iterateList) {
			count++;
		}
		console.log(count + ' flights were loaded');
		SocketsManager.consolelog(count + ' flights were loaded');
	}
	
	function addToPassenger(flight, mealname, type) {
		flight = 'AC' + flight;
		if(type == 'Y') type = 'EC';
		else if(type == 'W') type = 'EU';
		else if(type == 'J') type = 'BC';
		if(iterateList[flight]) {
			if(iterateList[flight][type]) {
				if(iterateList[flight][type][mealname]) {
					iterateList[flight][type][mealname] = iterateList[flight][type][mealname] + 1;
				}
				else {
					iterateList[flight][type][mealname] = 1;
				}
			}
			else {
				iterateList[flight][type] = []
				//iterateList[flight][type + 'Total'] = [];
				iterateList[flight][type][mealname] = 1;
			}
		}
		else {
			iterateList[flight] = []
			iterateList[flight][type] = []
			//iterateList[flight][type + 'Total'] = [];
			iterateList[flight][type][mealname] = 1;
		}
		/*
		if(mealname.substring(0,1) == 'P' || mealname.substring(0,1) == 'R') {
			if(!iterateList[flight][type + 'Total']['BOB']) {
				iterateList[flight][type + 'Total']['BOB'] = 1;
			}
			else {
				iterateList[flight][type + 'Total']['BOB']++;
			}
		}
		else {
			if(!iterateList[flight][type + 'Total']['ML']) {
				iterateList[flight][type + 'Total']['ML'] = 1;
			}
			else {
				iterateList[flight][type + 'Total']['ML']++;
			}
		}
		*/
	}


function loadSalesPlantTime(salesPlant, today, time, cb) {
	nightmare
		.goto(Url.flightUrl)
		.wait('div#for_resultsBox_title.title')
		.evaluate(function() {

		})
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
		})
		.catch(function (error) {
			console.error('loadSalesPlant failed due to: ', error);
	});
}

function getPrimaryFlightList(cb) {
	nightmare
		.wait(Delay.extraLong())
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
			cb(result);
		})
		.catch(function (error) {
			console.error('getPrimaryFlightList failed due to: ', error);
		});

}

function loopController() {
	console.log('>---------------Current flight is: ' + flightList[0]);
	if(iterateList[flightList[0]]) {
		console.log('Flight exists in updated list');
		loadSalesPlantAndFlightToday(salesPlant, flightList[0], function() {
			console.log(flightList + ' Scanned');
		})
	}
	else if(flightList[0]) {
		console.log('Flight wasnt in updated list');
		Log.statement("Flight " + flightList[0] + " was not in the list of flights to be updated", true);
		flightList.shift();
		loopController();
	}
	else {
		console.log('Done?');
		console.log(flightList);
		console.log('diff');
		console.log(diff);
		Log.data('Final Diffs for ' + salesPlant + ':', diff, true);
		Log.statement('For Excel', true);
		for(var key in diff) {
			var tmp = 0;
			for(var key2 in diff[key]) {
				if(Object.keys(diff[key][key2]).length > 0) {
					for( var key3 in diff[key][key2]) {
						if(tmp == 0) {
							Log.print( key + '\t');
							tmp++;
						}
						else {
							Log.print('\t')
						}
						Log.statement(diff[key][key2][key3].split('x')[0] + '\t' + ' ' + '\t' + key2 + '\t' + key3 + '\t' + diff[key][key2][key3].split('x')[1], false)
					}
				}
			}
		}
		SocketsManager.boldlog(' Task Complete, please verify ');
	}
}

function loadSalesPlantAndFlightToday() {
	console.log('loadSalesPlantAndFlightToday');
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
		.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', flightList[0])
		.wait(Delay.short())
		.click('input#subbutton')
		.wait('#resultRow_0 td img')
		.wait(Delay.medium())
		.then(function() {
			findRow();
			//console.log("successfully entered flight overview");
		})
		.catch(function (error) {
			console.error('loadSalesPlantAndFlight failed due to: ', error);
			rebootNightmare();
			//return nightmare.end();
	});
}



function findRow() {
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
			}, flightList[0]
		)
		.then(function(i) {
			//console.log('The value we are looking for is in ' + i);
			//cb();
			if(i == -1) {
				console.log('Flight was Not found');
				rebootNightmare();
			}
			else {
				clickFlight(i);
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


function clickFlight(row) {
	nightmare
		.click('tr#resultRow_' + row + ' > td.center:nth-child(25) > a:nth-child(1)')
		.then(function(i) {
			scanFlight();
		})
		.catch(function (error) {
			console.error('clickFlight failed due to: ', error);
	});
		
		//.click('tr#resultRow_5 > td.center:nth-child(25) > a:nth-child(1)')
		//.click('tr#resultRow_14 > td.center:nth-child(25) > a:nth-child(1)')
}



function scanFlight() {
	nightmare
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
				checkItems();
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
				var retVal = [];
				if(BC) { retVal['BC'] = BC; }
				if(EC) { retVal['EC'] = EC; }
				if(EU) { retVal['EU'] = EU; }
				if(CC) { retVal['CC'] = CC; }
				if(CY) { retVal['CY'] = CY; }
				
				compare(retVal);
			}
		})
		.catch(function (error) {
			console.error('scanFlight failed due to: ', error);
		});
}


function checkItems() {
	nightmare
		.click('div#layout_navigation > div.rightContent:nth-child(6) > div.tabs:nth-child(1) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td.tab:nth-child(2) > table:nth-child(1) > tbody:nth-child(1) > tr:nth-child(1) > td.m:nth-child(2) > a:nth-child(1)')
		.wait('table#table_row_0')
		.evaluate(function() {
			return document.getElementById('commentTexts_0').value;
		})
		.then(function(result) {
			if(result.search("GARBAGE") > -1) {
				console.log(flightList[0] + ' is a Garbage flight');
				Log.statement("Flight " + flightList[0] + " was determined to be a garbage flight", true);
				back();
			}
			else {
				console.log(flightList[0] + ' is not a Garbage flight');
				var tmp = [];
				compare(tmp); 
			}
		})
		.catch(function (error) {
			console.error('checkItems failed due to: ', error);
		});
}



function compare(cate) {
	console.log('>---------------Comparing CXP----------------<');
	console.log(cate);
	console.log('>---------------Updated File------------------<');
	console.log(iterateList[flightList[0]]);
	Log.statement("Flight " + flightList[0] + ' details:', false);
	Log.data("CXP", cate, false);
	Log.data('Updated File', iterateList[flightList[0]], false);
	var Diff = [];
	if(iterateList[flightList[0]]['EC']) {
		Diff['EC'] = [];
		for(var key in iterateList[flightList[0]]['EC']) {
			if(cate['EC']) {
				if(cate['EC'][key]) {
					//console.log('CXP has ' + key + 'Updated:' + YVRSP[flight]['EC'][key] + ' VS CXP:' + cate['EC'][key]);
					var tmp = parseInt(iterateList[flightList[0]]['EC'][key]) - parseInt(cate['EC'][key]);
					if( tmp != 0) {
						Diff['EC'][key] = parseInt(iterateList[flightList[0]]['EC'][key]) - parseInt(cate['EC'][key]);
						Diff['EC'][key] = Diff['EC'][key] +  'x' + iterateList[flightList[0]]['EC'][key];
					}
				}
				else {
					Diff['EC'][key] = parseInt(iterateList[flightList[0]]['EC'][key]);
					Diff['EC'][key] = Diff['EC'][key] +  'x' + iterateList[flightList[0]]['EC'][key];
				}
			}
			else {
				Diff['EC'][key] = parseInt(iterateList[flightList[0]]['EC'][key]);
				Diff['EC'][key] = Diff['EC'][key] +  'x' + iterateList[flightList[0]]['EC'][key];
			}
		}
	}
	if(iterateList[flightList[0]]['EU']) {
		Diff['EU'] = [];
		for(var key in iterateList[flightList[0]]['EU']) {
			if(cate['EU']) {
				if(cate['EU'][key]) {
					//console.log('CXP has ' + key + 'Updated:' + YVRSP[flight]['EU'][key] + ' VS CXP:' + cate['EU'][key]);
					var tmp = parseInt(iterateList[flightList[0]]['EU'][key]) - parseInt(cate['EU'][key]);
					if( tmp != 0) {
						Diff['EU'][key] = parseInt(iterateList[flightList[0]]['EU'][key]) - parseInt(cate['EU'][key]) ;
						Diff['EU'][key] = Diff['EU'][key] +  'x' + iterateList[flightList[0]]['EU'][key];
					}
				}
				else {
					Diff['EU'][key] = parseInt(iterateList[flightList[0]]['EU'][key]);
					Diff['EU'][key] = Diff['EU'][key] +  'x' + iterateList[flightList[0]]['EU'][key];
				}
			}
			else {
				Diff['EU'][key] = parseInt(iterateList[flightList[0]]['EU'][key]);
				Diff['EU'][key] = Diff['EU'][key] +  'x' + iterateList[flightList[0]]['EU'][key];
			}
		}
	}
	if(iterateList[flightList[0]]['BC']) {
		Diff['BC'] = [];
		for(var key in iterateList[flightList[0]]['BC']) {
			if(cate['BC']) {
				if(cate['BC'][key]) {
					//console.log('CXP has ' + key + 'Updated:' + YVRSP[flight]['BC'][key] + ' VS CXP:' + cate['BC'][key]);
					var tmp = parseInt(iterateList[flightList[0]]['BC'][key]) - parseInt(cate['BC'][key]);
					if( tmp != 0) {
						Diff['BC'][key] = parseInt(iterateList[flightList[0]]['BC'][key]) - parseInt(cate['BC'][key]) ;
						Diff['BC'][key] = Diff['BC'][key] +  'x' + iterateList[flightList[0]]['BC'][key];
					}
				}
				else {
					Diff['BC'][key] = parseInt(iterateList[flightList[0]]['BC'][key]);
					Diff['BC'][key] = Diff['BC'][key] +  'x' + iterateList[flightList[0]]['BC'][key];
				}
			}
			else {
				Diff['BC'][key] = parseInt(iterateList[flightList[0]]['BC'][key]);
				Diff['BC'][key] = Diff['BC'][key] +  'x' + iterateList[flightList[0]]['BC'][key];
			}
		}
	}
	console.log('>----------------Final Diff for ' + flightList[0] + ' is ');
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
		diff[flightList[0]] = Diff;
	}
	Log.data('Final Diff', Diff, true);
	back();
}

function back() {
	flightList.shift()
		nightmare
			.click('a#backLink > img:nth-child(1)')
			.wait('div#for_resultsBox_title.title')
			.then(function() {
				loopController();
			})
			.catch(function (error) {
				console.error('back failed due to: ', error);
			});
}

function skip() {
	flightList.shift();
	loopController();
}

var rebootNightmare = function() {
	console.log('Hit a snag, maybe increase delays? can you init nightmare again?');
	SocketsManager.boldlog('Hit a snag, maybe increase delays? can you init nightmare again?');
	//scafoldNightmare();
	//setTimeout(function(){ loopController(); }, 5000);
}

var scafoldNightmare = function(cb) {
	console.log('Scafolding nightmare');
	nightmare = Nightmare({
		show: true,
		typeInterval: 20,
		webPreferences: {
        	images: false
    	}
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
			SocketsManager.consolelog('Ready for next step')
			//cb();
		})
		.catch(function (error) {
			console.error('firstLogin failed due to: ', error);
		})
}

exports.init = init;
exports.initPassengers = initPassengers;
exports.next = loopController;
exports.skip = skip;