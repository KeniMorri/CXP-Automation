
var fs = require('fs');
var Login = require('../private/login.js');
var Url = require('../private/url.js');
var Nightmare = require('nightmare');
var Log = require('../log.js');


Nightmare.action('deferredWait', function(done) {
  var attempt = 0;
  var self = this;

  function doEval() {
    self.evaluate_now(function(selector) {
      return (document.querySelector(selector) !== null);
    }, function(result) {
      if (result) {
        done(null, true);
      } else {
        attempt++;
        if (attempt < 10) {
          setTimeout(doEval, 2000); //This seems iffy.
        } else {
          done(null, false);
        }
      }
    }, '#elem');
  };
  doEval();
  return this;
});

var salesPlantCodes = {
	 'YYZ' : '1401' ,
	 'YUL' : '1402' ,
	 'YVR' : '1403' ,
	 'YYC' : '1404' ,
	 'YOW' : '1405' ,
	 'YHZ' : '1406' ,
	 'YEG' : '1407' ,
	 'YWG' : '1408' ,
	 'YQR' : '1409' };

var saved;
var skipped;
var error;
var wait;
var flightRowStorage;



var salesPlant;
var garbageSalesPlant;
var iterateList;
var mealCodes;
var highLevelCodes;
var autoSave;
var scramble;

var currPackage;


//Tomorrows Date inslash format
function init() {
	Delay.init();
	scafoldNightmare();
	Log.initBasic('../Archive/ADVMealLogs/')
	Log.statement('[-> Parsing Data', true);
	iterateList = [];
	scramble = false;
	wait = true;
	saved = [];
	skipped = [];
	error = [];
	autoSave = false;
	SPMLPassLoader();
	currPackage = [];
	console.log(iterateList[0])
}

function padDigits(number, digits) {
    return Array(Math.max(digits - String(number).length + 1, 0)).join(0) + number;
}

function SPMLPassLoader() {
	var path = process.cwd();
	var buffer = fs.readFileSync('./AdvancedMealUpdater/advDataInput.json');
	var longList = buffer.toString();
	var airlineCode = '';
	console.log('buffer');
	console.log(longList);

	longList = longList.split(/\n/);

	airlineCode = longList[1].split('\t')[1];

	//Loading Meal codes
	mealCodes = longList[1].split('\t')[4];
	for(var i = 5; longList[1].split('\t')[i] != undefined && i < 60; i++) {
		console.log(i + ':' + longList[1].split('\t')[i])
		if(longList[1].split('\t')[i] != '' && longList[1].split('\t')[i] != '\r') {
			mealCodes = mealCodes + 'x' + longList[1].split('\t')[i].split('\r')[0];
		}
	}
	console.log('meals');
	console.log(mealCodes)

	
	highLevelCodes = '';
	highLevelCodes = longList[0].split('\t')[1];
	if(highLevelCodes == 'Y') {
		console.log('finding code')
		for(var i = 2; longList[0].split('\t')[i] != undefined; i++) {
			console.log(longList[0].split('\t')[i])
			if(longList[0].split('\t')[i] != '' && longList[0].split('\t')[i] != '\r') {
				highLevelCodes = highLevelCodes + 'x' + longList[0].split('\t')[i].split('\r')[0];
			}
		}
	}
	else {
		highLevelCodes = highLevelCodes + 'x' + '-1';
	}

	var list = [];
	for(var i = 2; longList[i]; i++) {
		var tmp = [];
		if(isNaN(longList[i].split('\t')[0])){
			if(salesPlantCodes[longList[i].split('\t')[0]]) {
				tmp['salesPlant'] = salesPlantCodes[longList[i].split('\t')[0]];
			}
			else {
				tmp['salesPlant'] = 'X';
			}
		}
		else {
			tmp['salesPlant'] = longList[i].split('\t')[0];
		}
		if(airlineCode == 'X') {
			tmp['flight'] = longList[i].split('\t')[1];
		}
		else {
			tmp['flight'] = airlineCode + padDigits(longList[i].split('\t')[1], 4);
		}
		tmp['class'] = longList[i].split('\t')[2];
		tmp['date'] = longList[i].split('\t')[3];
		for(var j = 4; j < (mealCodes.split('x').length + 4); j++) {
			if(longList[i].split('\t')[j] != '' && longList[i].split('\t')[j] != '\n' && longList[i].split('\t')[j] != '\r') {
				tmp['Meal:' + mealCodes.split('x')[j - 4]] = longList[i].split('\t')[j].split('\r')[0];
			}
		}
		list.push(tmp);
	}
	console.log(list);
	Log.data('[-> Meal codes', mealCodes, true);
	Log.data('[-> HighLevelCodes', highLevelCodes, true);
	Log.data('[-> Data to parse', list, true);
	iterateList = list;
}

function searchController() {
	if(iterateList[0]) {
		if(garbageSalesPlant ==  ( salesPlant + 1 ) )  {
			salesPlant++;
			garbageSalesPlant = '';
		}
		if(iterateList[0]['salesPlant'] != 'X') {
			salesPlant = iterateList[0]['salesPlant']
			searchForFlight();
		}
		else {
			if(salesPlant < 1409) {
			salesPlant++;
			searchForFlight();
			}
			else if(salesPlant == 1409) {
				console.log('Could not find it, try searching again?');
				salesPlant = 1400;
			}
			else {
				salesPlant = 1400;
				searchController();
			}
		}
	}
	else {
		console.log('Advnaced Meal Updater Query Complete');
		Log.statement('[-> Advnaced Meal Updater Query Complete');
		Log.data('-> SAVED: ', saved, true);
		Log.data('-> SKIPPED: ', skipped, true);
		SocketsManager.boldlog(' Advanced Meal Updater Execution Complete');
		console.log('saved');
		console.log(saved);
		console.log('Skipped');
		console.log(skipped)
	}
}


function searchForFlight(failover = false) {
	console.log('Searching for flight, failover:' + failover);
		nightmare
			.goto(Url.flightUrl)
			.wait('div#for_resultsBox_title.title')
			.type('input#salesPlantCode', '')
			.type('input#flightDate' , '')
			.type('input#carrierCode', '')
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', '')
			.type('input#salesPlantCode', salesPlant)
			.type('input#flightDate' , iterateList[0]['date'])
			.type('div#searchFields_box_contents > table.auto:nth-child(1) > tbody:nth-child(1) > tr:nth-child(2) > td:nth-child(6) > input:nth-child(1)', iterateList[0]['flight'])
			.wait(Delay.short())
			.evaluate(function() {
				document.getElementById('salesPlantName').remove();
			})
			.click('input#subbutton')
			.wait('#salesPlantName')
			.then(function() {
				findFlightInList(failover);
			})
			.catch(function (error) {
				console.error('loopController.searchForFlight failed due to: ', error);
		});
	}

function delay(cb) {
	nightmare
		.wait(Delay.short())
		.evaluate(function() {
			console.log('delay');
		})
		.then(function() {
			cb();
		})
		.catch(function (error) {
			console.error('delay failed due to: ', error);
	});
}

function findFlightInList(failover) {
		nightmare
			.evaluate(function(flight) {
				console.log('inside');
					var retVal = [];
					var status = [];
					var count = 0;
					for(var i = 0; document.getElementById('resultRow_' + i); i++) {
						console.log(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText + ' && ' + flight)
						if(document.getElementById('resultRow_' + i).getElementsByTagName('a')[0].innerText.search(flight) > -1 ) {
							console.log('found it:' + i);
							retVal.push(i);
							//Checks Flight Status
							if(document.getElementById('resultRow_' + i).getElementsByTagName('select')[0].value != '2') {
								status.push(i);
							}
						}
					}
					//Could Not Find it
					if(retVal.length < 1) {
						retVal = -1;
					}
					//Prelim is there, and theres only 1
					else if(status.length > 0 && retVal.length < 2) {
						retVal = -2;
					}
					return retVal;
				}, iterateList[0]['flight']
			)
			.then(function(result) {
				console.log('findFlightInList:' + result);
				//Means didn't find anything
				if(result == -1) {
						if(failover) {
							console.log('Couldnt find it after second run');
							if(scramble == false) {
								console.log('Scramble search is off, reccomended action is to skip');
								SocketsManager.boldlog('Scramble search is off, reccomended action is to skip');
								//skip();
							}
							else if(iterateList[0]['salesPlant'] != 'X') {
								console.log('Starting Scramble Search');
								salesPlant = 1400;
								iterateList[0]['salesPlant'] = 'X';
								searchController();
							}
							else {
								console.log('Trying next plant');
								searchController();
							}
						}
						else {
							//searchForFlight(true);
							delay(function() {
								findFlightInList(true);
							});
							
						}
				}
				else if(result == -2) {
					console.log('Status isnt in prelim');
					SocketsManager.boldlog("Status is not in prelim");
					salesPlant = 1400;
				}
				else if(result.length > 1) {
					Log.statement('2 flights exist for flight: ' + iterateList[0]['flight']);
					console.log('2 Exist');
					flightRowStorage = result;
					salesPlant = 1400;
					//skip();
				}
				else if(result.length == 1) {
					console.log("Found flight: " + iterateList[0]['flight'] + ' in ' + salesPlant);
					Log.statement("[-> Found flight: " + iterateList[0]['flight'] + ' in ' + salesPlant);
					Log.data('-> Flight Data: ', iterateList[0]);
					clickFlightFromList(result[0]);
				}
			})
			.catch(function (error) {
				console.error('findRow failed due to: ', error);
				rebootNightmare();
		});
	}

function clickFlightFromList(row) {
		nightmare
			.click('tr#resultRow_' + row + ' > td.left:nth-child(8) > a:nth-child(1)')
			.wait('div#itemOverview_contents')
			.then(function(i) {
				checkCargo();
				//console.log('Current Flight is: ' + i + ' What we wanted was:' + iterateList[0]['flight'])
				//Log.statement('Current Flight is: ' + i + ' What we wanted was:' + iterateList[0]['flight'], true)
				//salesPlant = 1400;
				//skip();
			})
			.catch(function (error) {
				console.error('clickFlight failed due to: ', error);
		});

		/*
		nightmare
			.click('tr#resultRow_' + row + ' > td.left:nth-child(8) > a:nth-child(1)')
			.wait(Delay.medium())
			.evaluate(function() {
				return document.getElementById('flightDetails_readonly_contents').getElementsByTagName("tr")[0].getElementsByTagName('td')[1].innerText;
			})
			.then(function(i) {
				checkCargo();
				//console.log('Current Flight is: ' + i + ' What we wanted was:' + iterateList[0]['flight'])
				//Log.statement('Current Flight is: ' + i + ' What we wanted was:' + iterateList[0]['flight'], true)
				//salesPlant = 1400;
				//skip();
			})
			.catch(function (error) {
				console.error('clickFlight failed due to: ', error);
		});
		*/
	}

function checkCargo() {
	var package = [];
	package.push(highLevelCodes);
	var mealCodesArray = mealCodes.split('x');
	var mealList = '';
	for(var i = 0; i < mealCodesArray.length; i++) {
		if(iterateList[0]['Meal:' + mealCodesArray[i]] != undefined) {
			package.push(mealList + mealCodesArray[i] + 'x' + iterateList[0]['Meal:' + mealCodesArray[i]]);
		}
	}
	console.log(package);
	
	nightmare
		.evaluate(function(package) {
				var missing = [];
				var count = 0;
				var retVal = [];
				var highLevel = '-1';
				var rougeStatus = 0;
				console.log(package);

				if(document.getElementById('commentTexts_0').value.search("GARBAGE") > -1) {
					retVal = 'GARBAGE';
				}
				else {
					//finding menu items
					for(var i = 1; i < package.length; i++) {
						var exists = 0;
						//Loops through every row
						for(var j = 1; document.getElementById('customerMaterialNumbers_' + j); j++) {
							//found menu item
							if(document.getElementById('customerMaterialNumbers_' + j).value.search(package[i].split('x')[0]) > -1) {
								if(document.getElementById('deleted_' + j).checked == false) {
									if(package[0].split('x')[0] == 'Y') {
										highLevel = document.getElementById('highLevelItemNumbers_' + j).value;
									}
									exists++;
									if(document.getElementById('customerMaterialNumbers_' + j).value == '3' + package[i].split('x')[0]) {
										rougeStatus = 1;
									}
									break;
								}
							}
							else {
								//If its deleted
							}
						}
						if(exists == 0 && package[i].split('x')[1] != 0) {
							missing.push(package[i])
						}
						else {
							count++;
						}

					}
					//If highlevel/rouge wasn't found from above
					var highLevelArray = package[0].split('x');
					if(highLevel == '-1' && highLevelArray[0] == 'Y') {
						console.log('HighLevel')
						for(var i = 1; i < highLevelArray.length; i++) {
							for(var j = 1; document.getElementById('customerMaterialNumbers_' + j); j++) {
								//found menu item
								if(document.getElementById('customerMaterialNumbers_' + j).value.search(highLevelArray[i]) > -1) {
									highLevel = document.getElementById('highLevelItemNumbers_' + j).value;
									if(document.getElementById('customerMaterialNumbers_' + j).value == '3' + highLevelArray[i]) {
										rougeStatus = 1;
									}
									break;
								}
							}
						}
					}
					retVal.push(highLevel);
					retVal.push(rougeStatus);
					if(count < (package.length -1)) {
						//Means we're missing something
						console.log('Add: ' + missing[0]);
						retVal.push('ADD');
						for(var i = 0; i < missing.length; i++) {
							retVal.push(missing[i]);
						}
					}
					else {
						console.log('update: ' + package[1])
						retVal.push('UPDATE');
						for(var i = 1; i < package.length; i++) {
							retVal.push(package[i]);
						}
					}
				}
				return retVal;
			}, package
		)
		.then(function(result) {
				console.log(result);
				if(result == 'GARBAGE') {
					Log.statement('Garbage Salesplant:' + salesPlant);
					if(scramble == false) {
						console.log('Scramble search is off, reccomended action is to skip');
						SocketsManager.boldlog("Scramble Search is off, reccomended action is to skip");
					}
					else {
						garbageSalesPlant = salesPlant;
						salesPlant = 1400;
						if(iterateList[0]['salesPlant'] != 'X') {
							iterateList[0]['salesPlant'] = 'X';
						}

						searchController();
					}
				}
				else if(result[2] == 'ADD') {
					Log.data('-> Adding Menu Items:', result);
					addMealItems(result);
				}
				else if(result[2] == 'UPDATE') {
					Log.data('-> Updating Menu Items:', result);
					updateValue(result);
				}
				else {
					console.log('alright somethings really wrong');
				}
		})
		.catch(function (error) {
			console.error('checkCargo failed due to: ', error);
		});
		
}

function addMealItems(package) {
	var count = package.length;
	console.log(package);
	console.log('ROUGE STATUS');
	console.log(package[1])
	package.push(iterateList[0]['class'])
	console.log('Class');
	console.log(package[package.length - 1])
	console.log(package);

	var rowNum;

	nightmare
		.evaluate(function() {
			return document.getElementById('lastRowNumber').value;
		})
		.then(function(val) {
			val = val;
			return nightmare
				.type('input#numToAdd', '')
					.type('input#numToAdd', count)
					.click('input#addButtonMaterialButton')
					.wait('span#row_' + val)
					.evaluate(function(package) {
						var row = 0;
						var count = 0;
						for(count = 0; document.getElementById('customerMaterialNumbers_' + count); count++) {
						}
						count = count - 1;

						for(var i = 3; i < (package.length - 1); i++) {
							document.getElementById('quantities_' + count).value = package[i].split('x')[1];
							if(package[0] != -1) {
								document.getElementById('highLevelItemNumbers_' + count).value = package[0];
							}
							console.log('rouge:' + package[1])
							if(package[1] == 1) {
								document.getElementById('customerMaterialNumbers_' + count).value = '3' + package[i].split('x')[0];
							}
							else {
								document.getElementById('customerMaterialNumbers_' + count).value = package[i].split('x')[0];
							}
							if(package[package.length - 1] != 'X') {
								document.getElementById('classesOfService_' + count).value = package[package.length - 1];
							}
							document.getElementById('deactivatedIds_' + count).click();
							document.getElementById('deactivatedIds_' + count).click();
							count = count - 1;
						}
					}, package
					)
					.then(function(result) {
						//console.log('double check');
						explodeReroute();
					})
					.catch(function (error) {
						console.error('update failed due to: ', error);
					});
		})
}

function explodeReroute() {
	nightmare
		.evaluate(function() {
			return document.getElementById('lastRowNumber').value;
		})
		.then(function(val) {
			val = val;
			return nightmare
				.type('input#numToAdd', '')
					.type('input#numToAdd', '1')
					.click('input#addButtonMaterialButton')
					.wait('span#row_' + val)
					.then(function(result) {
						checkCargo();
					})
		})

		/*
	nightmare
			.click('#explodeBOMButton')
			.wait(Delay.extraLong())
			
			.catch(function (error) {
			});
			*/
}

function updateValue(package) {
		nightmare
			.wait(Delay.short())
			.evaluate(function(package) {
				/*
				for(var k = 1; document.getElementById('customerMaterialNumbers_' + k); k++) {
					if(document.getElementById('customerMaterialNumbers_' + k).value.search('79320') > -1) {
						console.log('Found one of those veggie meals');
						if(document.getElementById('deleted_' + k).checked == false) {
							document.getElementById('deleted_' + k).click();
						}
						else {
							document.getElementById('deleted_' + k).click();
							document.getElementById('deleted_' + k).click();
						}
						break;
					}
				}
				*/
				for(var i = 3; i < package.length; i++) {
					for(var j = 1; document.getElementById('customerMaterialNumbers_' + j); j++) {
						if(document.getElementById('customerMaterialNumbers_' + j).value.search(package[i].split('x')[0]) > -1) {
							if(document.getElementById('deleted_' + j).checked == false) {
								if(package[i].split('x')[1] == '0') {
									document.getElementById('deleted_' + j).click();
								}
								else if(document.getElementById('quantities_' + j).value.split('.0')[0] != package[i].split('x')[1]) {
									document.getElementById('quantities_' + j).value = package[i].split('x')[1];
									if(document.getElementById('deactivatedIds_' + j).checked == true) {
										document.getElementById('deactivatedIds_' + j).click();
										document.getElementById('deactivatedIds_' + j).click();
									}
									else {
										document.getElementById('deactivatedIds_' + j).click();
									}
								}
								break;
							}
							else {
								//If its deleted
							}
						}
					}
				}
			}, package
			)
			.then(function(result) {
				explode();
			})
			.catch(function (error) {
				console.error('update failed due to: ', error);
			});
	}

	function explode() {
		var package = [];
		var mealCodesArray = mealCodes.split('x');
		var mealList = '';
		for(var i = 0; i < mealCodesArray.length; i++) {
			if(iterateList[0]['Meal:' + mealCodesArray[i]] != undefined) {
				package.push(mealList + mealCodesArray[i] + 'x' + iterateList[0]['Meal:' + mealCodesArray[i]]);
			}
		}
		console.log(package);

		/*
		nightmare
		.evaluate(function() {
			return document.getElementById('lastRowNumber').value;
		})
		.then(function(val) {
			val = val;
			return nightmare
				.type('input#numToAdd', '')
					.type('input#numToAdd', '1')
					.click('input#addButtonMaterialButton')
					.wait('span#row_' + val)
					.then(function(result) {
						checkCargo();
					})
		})*/

		nightmare
			.click('#explodeBOMButton')
			.wait(Delay.extraLong())
			.evaluate(function(package) {
				var retVal = [];
				for(var i = 0; i < package.length; i++) {
					for(var j = 1; document.getElementById('customerMaterialNumbers_' + j); j++) {
						if(document.getElementById('customerMaterialNumbers_' + j).value.search(package[i].split('x')[0]) > -1) {
							if(document.getElementById('deleted_' + j).checked == false) {
								retVal.push(package[i].split('x')[0] + 'x' + document.getElementById('quantities_' + j).value.split('.')[0])
								break;
							}
							else {
								console.log('found the deletion for: ' + package[i].split('x')[0] );
								retVal.push(package[i].split('x')[0] + 'x0')
							}
						}
					}
				}
				console.log(retVal);
				return retVal;
			}, package
			)
			.then(function(result) {
				console.log('The total is now:' + result)
				var matches = 0;
				Log.statement('-> Comparing Menu Items:')
				for(var i = 0; i < package.length; i++) {
					for(var j = 0; j < result.length; j++) {
						if(package[i].split('x')[0] == result[j].split('x')[0]) {
							console.log('Meal:' +  package[i].split('x')[0] + ' -> FILE: ' + package[i].split('x')[1] + '=' + result[j].split('x')[1] + ' :CXP')
							if(package[i].split('x')[1] == result[j].split('x')[1]) {
								matches++;
								Log.statement('Meal:' +  package[i].split('x')[0] + ' -> FILE: ' + package[i].split('x')[1] + '=' + result[j].split('x')[1] + ' :CXP');
								break;
							}
						}
					}
				}
				if(matches == package.length) {
					console.log('safe to save now, values match');
					Log.statement('Values match!');
					if(autoSave == true) {
						save();
					}
				}
				else {
					console.log('lol wot')
					Log.statement('->>>>>>>>>>Somethings Wrong');
				}
			})
			.catch(function (error) {
				console.error('explode failed due to: ', error);
				//searchController();
			});
	}

var save = function() {
	
	console.log('saving');
	nightmare
		.click('a#permanentSaveLink > img:nth-child(1)')
		.wait('table#for_resultsTable')
		.then(function() {
			console.log('Done:' + iterateList[0]['flight'])
			Log.statement('[-> SAVING: ' + iterateList[0]['flight'], true);
			Log.statement('\n')
			saved.push(iterateList[0]['flight']);
			iterateList.shift();
			if(iterateList[0]){
				console.log('Now On:' + iterateList[0]['flight'])
			}
			salesPlant = 1400;
			garbageSalesPlant = '';
			searchController();
		})
}

var skip = function() {
	console.log('skip');
	console.log('>>>>>SKIPPING:' + iterateList[0]['flight'])
	Log.statement('[-> SKIPPING: ' + iterateList[0]['flight'], true);
	Log.statement('\n')
	skipped.push(iterateList[0]['flight']);
	iterateList.shift();
	if(iterateList[0]){
		console.log('Now On:' + iterateList[0]['flight'])
	}
	salesPlant = 1400;
	garbageSalesPlant = '';
	searchController();
}

function addNew(package) {
	if(package[0]) {
		nightmare
			.wait(Delay.short())
			.click('#addButtonMaterialButton')
			.wait(Delay.medium())
			.type('#quantities_' + row, iterateList[0]['total'])
			.type('#highLevelItemNumbers_' + row, highlevel)
			.type('#customerMaterialNumbers_' + row, mealCode)
			.type('#classesOfService_' + row, 'EC')
			.wait(Delay.short())
			.then(function() {

				explode(rouge);
			})
	}
	else {
		checkCargo();
	}

}


var scafoldNightmare = function(cb) {
	console.log('Scafolding nightmare');
	nightmare = Nightmare({
		show: true,
		typeInterval: 20
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
		})
}


var next = function() {
	salesPlant = 1400;
	garbageSalesPlant = '';
	searchController();
}

var setWait = function() {
	wait = !wait;
	return wait;
}

var selectRow = function(row) {
	console.log('Manually overide, clicking row:' + row + '-' + flightRowStorage[row])
	clickFlightFromList(flightRowStorage[row]);
}

var setSave = function(toggle = !autoSave) {
	autoSave = toggle;
	console.log('autoSave set to ' + autoSave);
}

var setScramble = function(toggle = !scramble) {
	scramble = toggle;
	console.log('scramble set to ' + scramble);
}

var toggleSave = function() {
	if(autoSave == false) {
		console.log('autoSave now true');
		autoSave = true;
	}
	else {
		console.log('autoSave now false');
		autoSave = false;
	}
}
exports.init = init;

exports.next = next;

exports.skip = skip;

exports.reset = scafoldNightmare;

exports.save = save;

exports.setWait = setWait;

exports.selectRow = selectRow;

exports.toggleSave = toggleSave;
exports.setSave = setSave;
exports.setScramble = setScramble;