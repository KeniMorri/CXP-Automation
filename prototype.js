
var fs = require('fs');
var Login = require('./private/login.js');
var Url = require('./private/url.js');
var Nightmare = require('nightmare');

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

var date;
var salesPlant;
var masterList;
var iterationLevel;
var iterateList;
var nightmare;

//Tomorrows Date inslash format
function init(tmw) {
	scafoldNightmare();
	iterationLevel = 0;
	date = tmw;
	SPMLPassLoader(tmw);
}

function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function SPMLPassLoader() {
	var path = process.cwd();
	var buffer = fs.readFileSync('./dataInput.json');
	var longList = buffer.toString();
	console.log('buffer');
	console.log(longList);
	longList = longList.split(/\n/);
	var list = [];
	for(var i = 0; longList[i]; i++) {
		var tmp = [];
		tmp['flight'] = 'AC' + padDigits(longList[i].split('\t')[1], 4);
		tmp['from'] = longList[i].split('\t')[3];
		tmp['to'] = longList[i].split('\t')[4];
		tmp['total'] = longList[i].split('\t')[5].split('\r')[0];
		list.push(tmp);
	}
	masterList = list;
	iterateList = masterList;
	console.log(list);
	/*
	longList = longList.split(/\n/);
	for(var j = 0; longList[j]; j++) {
		if( longList[j].substring(7, 10) == searchKeyword) {
			addToPassenger(longList[j].substring(3, 7),longList[j].substring(18, 22), longList[j].substring(36,37));
		}
	}
	*/
}

function searchController() {
	console.log('>----------------SearchController');
	console.log('Searching for: ' + iterateList[0]['flight'])
	if(iterateList[0]) {
		if(iterationLevel == 0) {
			iterationLevel = 1;
			if(salesPlantCodes[iterateList[0]['from']]) {
				console.log('exists0');
				salesPlant = salesPlantCodes[iterateList[0]['from']];
				searchForFlight(iterateList[0]['flight']);
			}
			else {
				searchController();
			}
		}
		else if(iterationLevel == 1) {
			iterationLevel = 2;
			if(salesPlantCodes[iterateList[0]['to']]) {
				console.log('exists1');
				salesPlant = salesPlantCodes[iterateList[0]['to']];
				searchForFlight(iterateList[0]['flight']);
			}
			else {
				searchController();
			}
		}
		else if(iterationLevel == 2) {
			iterationLevel = 3;
			salesPlant = 1401;
			searchForFlight(iterateList[0]['flight']);
		}
		else {
			if(salesPlant < 1410) {
				salesPlant++;
			}
			else {
				salesPlant = 1401;
			}
			searchForFlight(iterateList[0]['flight']);
		}
		
	}
	else {
		console.log('done?');
	}
}

function searchForFlight(flight) {
		//console.log('loadFlightToday');
		//console.log(flight);
		nightmare
			.goto(Url.flightUrl)
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', '')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , date)
			.type('input#carrierCode', 'AC')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', flight)
			.wait(1000)
			.click('input#subbutton')
			.wait(3000)
			.then(function() {
				findFlightInList(flight);
			})
			.catch(function (error) {
				iterationLevel = 0;
				searchController();
				console.error('loopController.searchForFlight failed due to: ', error);
		});
	}

	function findFlightInList(flight, failover) {
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
				}, flight
			)
			.then(function(i) {
				if(i == -1) {
					console.log('Flight was Not found');
					if(failover) {
						iterationLevel++;
						searchController();
					}
					else {
						findFlightInList(flight, true);
					}
				}
				else {
					clickFlightFromList(i,flight);
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
			.click('tr#resultRow_' + row + ' > td.left:nth-child(8) > a:nth-child(1)')
			.wait(2000)
			.then(function(i) {
				checkCargo(flight);
			})
			.catch(function (error) {
				console.error('clickFlight failed due to: ', error);
		});
	}
	function checkCargo(flight) {
		nightmare
			.evaluate(function() {
				var position = 0;
				var total = 0;
				var highLevel = 0;
				var j = 1;
				for(var j = 1; document.getElementById('customerMaterialNumbers_' + j); j++) {
					if(document.getElementById('customerMaterialNumbers_' + j).value == '73300' || document.getElementById('customerMaterialNumbers_' + j).value == '373300') {
						highLevel = document.getElementById('highLevelItemNumbers_' + j).value;
					}
				}
				for(var i = 1; document.getElementById('customerMaterialNumbers_' + i); i++) {
					if(document.getElementById('customerMaterialNumbers_' + i).value == '75910') {
						position = i;
						total = document.getElementById('quantities_' + i).value.split('.')[0];
						break;
					}
				}
				position = position + 'x' + total + 'x' + highLevel + 'x' + j;
				return position;
			})
			.then(function(result) {
				if(result.split('x')[0] == 0) {
					console.log('didnt find it')
					console.log(result);
					//Add new line
					//Also Search for Bob highlevel code
					if(result.split('x')[2] == 0) {
						console.log('No Bobs, so skipping');
						skip();
					}
					else {
						addNew(result.split('x')[2], result.split('x')[3]);
					}
				}
				else {
					console.log('Meal Already In Menu');
					console.log('Currently:' + result.split('x')[1] + ' VS. What we want:' + iterateList[0]['total'])
					if(result.split('x')[1] == iterateList[0]['total']) {
						console.log('Values match, skipping');
						skip();
						//searchController();
					}
					else {
						updateValue(result.split('x')[0])
					}
					//edit the line we have
				}
			})
			.catch(function (error) {
				console.error('checkItems failed due to: ', error);
			});
	}

	function addNew(highlevel, row) {
		nightmare
			.wait(1000)
			.click('#addButtonMaterialButton')
			.wait(2000)
			.type('#quantities_' + row, iterateList[0]['total'])
			.type('#highLevelItemNumbers_' + row, highlevel)
			.type('#customerMaterialNumbers_' + row, '75910')
			.type('#classesOfService_' + row, 'EC')
			.wait(1000)
			.then(function() {
				explode();
			})

	}

	function updateValue(row) {
		console.log('updatevalue:' + row)
		row = row + 'x' + iterateList[0]['total']
		console.log('updatevalue:' + row);
		nightmare
			.wait(1000)
			.evaluate(function(row) {
				document.getElementById('deactivatedIds_' + row.split('x')[0]).click();
				document.getElementById('quantities_' + row.split('x')[0]).value = row.split('x')[1];
			}, row
			)
			.then(function(result) {
				 explode();
			})
			.catch(function (error) {
				console.error('update failed due to: ', error);
			});
	}

	function explode() {
		console.log('explode');
		nightmare
			.click('#explodeBOMButton')
			.wait(6000)
			.evaluate(function() {
				var total = 0;
				for(var i = 1; document.getElementById('customerMaterialNumbers_' + i); i++) {
					if(document.getElementById('customerMaterialNumbers_' + i).value == 75910) {
						total = document.getElementById('quantities_' + i).value;
						break;
					}
				}
				return total;
			}
			)
			.then(function(result) {
				console.log('The total is now:' + result)
				if(result.split('.')[0] == iterateList[0]['total']) {
					console.log('Values match! ' + result.split('.')[0] + ' = ' + iterateList[0]['total']);
					console.log('Safe to save now');
				}
			})
			.catch(function (error) {
				console.error('explode failed due to: ', error);
			});
	}

	var save = function() {
		nightmare
			.click('a#permanentSaveLink > img:nth-child(1)')
			.wait(6000)
			.then(function() {
				console.log('Done:' + iterateList[0])
				iterateList.shift();
				console.log('Now On:' + iterateList[0])
				iterationLevel = 0;
				searchController();
			})
	}

	var skip = function() {
		console.log('Skipping:' + iterateList[0]['flight'])
		iterateList.shift();
		console.log('Now On:' + iterateList[0]['flight'])
		iterationLevel = 0;
		searchController()
	}
	var hardReset = function() {
		iterationLevel = 0;
		scafoldNightmare();
	}

	var scafoldNightmare = function(cb) {
	console.log('Scafolding nightmare');
	
	nightmare = Nightmare({
		show: true,
		typeInterval: 20,
		openDevTools: {
			mode: 'detach'
		}
	})
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

exports.init = init;
exports.searchController = searchController;
exports.skip = skip;
exports.save = save;
exports.hardReset = hardReset;