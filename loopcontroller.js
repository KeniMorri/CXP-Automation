var salesPlant;
var salesPlantName;
var loggingFilePath;
var date;
var timePeriod;
var flightList;
var updatedFile;
var diff;


function initPassenger(isalesPlant, isalesPlantName, salesPlantDataFilePath, idate, itimePeriod, iflightList, constraints) {
	salesPlant = isalesPlant;
	salesPlantName = isalesPlantName;
	date = idate;
	timePeriod = itimePeriod;
	//This will fill updatedFile
	SPMLPassLoader(salesPlantDataFilePath, salesPlantName);
	//This will fill flightList
	searchForFlightList(function(result) {
		if(constraints) {
			var tmp = [];
			for(var i = 0; result[i]; i++) {
				if(result[i].search('AC00') > -1 || result[i].search('AC08') > -1 || result[i].search('AC19') > -1) {
					tmp.push(result[i]);
				}
			}
			result = tmp;
		}
		result.sort();
		flightList = result;
		loopController();
	})
}

function SPMLPassLoader(filePath, searchKeyword) {
	var path = process.cwd();
	var buffer = fs.readFileSync(filePath);
	var longList = buffer.toString();
	longList = longList.split(/\n/);
	for(var j = 0; longList[j]; j++) {
		if( longList[j].substring(7, 10) == searchKeyword) {
			addToPassenger(longList[j].substring(3, 7),longList[j].substring(18, 22), longList[j].substring(36,37));
		}
	}
}

function addToPassenger(flight, mealname, type) {
	flight = 'AC' + flight;
	if(type == 'Y') type = 'EC';
	else if(type == 'W') type = 'EU';
	else if(type == 'J') type = 'BC';
	
	if(updatedFile[flight]) {
		if(updatedFile[flight][type]) {
			if(updatedFile[flight][type][mealname]) {
				updatedFile[flight][type][mealname] = updatedFile[flight][type][mealname] + 1;
			}
			else {
				updatedFile[flight][type][mealname] = 1;
			}
		}
		else {
			updatedFile[flight][type] = []
			updatedFile[flight][type + 'Total'] = [];
			updatedFile[flight][type][mealname] = 1;
		}
	}
	else {
		updatedFile[flight] = []
		updatedFile[flight][type] = []
		updatedFile[flight][type + 'Total'] = [];
		updatedFile[flight][type][mealname] = 1;
	}
	if(mealname.substring(0,1) == 'P' || mealname.substring(0,1) == 'R') {
		if(!updatedFile[flight][type + 'Total']['BOB']) {
			updatedFile[flight][type + 'Total']['BOB'] = 1;
		}
		else {
			updatedFile[flight][type + 'Total']['BOB']++;
		}
	}
	else {
		if(!updatedFile[flight][type + 'Total']['ML']) {
			updatedFile[flight][type + 'Total']['ML'] = 1;
		}
		else {
			updatedFile[flight][type + 'Total']['ML']++;
		}
	}
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

	function searchForFlightList(cb) {
		nightmare
			.goto(Url.flightUrl)
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(4) > input:nth-child(1)')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , date)
			.type('input#carrierCode', 'AC')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(4) > input:nth-child(1)', timePeriod)
			.click('input#subbutton')
			.wait('#resultRow_0 td img')
			.then(function() {
				getFlights(cb);
			})
			.catch(function (error) {
				console.error('loadSalesPlant failed due to: ', error);
		});
	}

	function getFlights(cb) {
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
				cb(result);
			})
			.catch(function (error) {
				console.error('getPrimaryFlightList failed due to: ', error);
			});

	}

	//Uses Globals SalesPlant, date, timeperiod, 
	function searchForFlight(flight) {
		//console.log('loadFlightToday');
		nightmare
			.goto(Url.flightUrl)
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(4) > input:nth-child(1)', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', '')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , date)
			.type('input#carrierCode', 'AC')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(3) > td:nth-child(4) > input:nth-child(1)', timePeriod)
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', flight)
			.wait(1000)
			.click('input#subbutton')
			.wait('#resultRow_0 td img')
			.wait(2000)
			.then(function() {
				findFlightInList(flight);
			})
			.catch(function (error) {
				console.error('loopController.searchForFlight failed due to: ', error);
		});
	}

	function findFlightInList(flight) {
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
	}

	function clickFlightFromList(row ,flight) {
		nightmare
			.click('tr#resultRow_' + row + ' > td.center:nth-child(25) > a:nth-child(1)')
			.then(function(i) {
				scanFlight(flight);
			})
			.catch(function (error) {
				console.error('clickFlight failed due to: ', error);
		});
	}

	function scanFlight(flight) {
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
					checkCargo(flight);
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
					
					compareCargo(flight,retVal);
				}
			})
			.catch(function (error) {
				console.error('scanFlight failed due to: ', error);
			});
	}

	function checkCargo(flight) {
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
					compareCargo(flight, tmp); 
				}
			})
			.catch(function (error) {
				console.error('checkItems failed due to: ', error);
			});
			
		
	}

	function compareCargo(flight, cate, cb) {
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