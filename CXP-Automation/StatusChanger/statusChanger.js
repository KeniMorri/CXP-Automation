
var fs = require('fs');
var Login = require('../private/login.js');
var Url = require('../private/url.js');
var Nightmare = require('nightmare');
var Log = require('../log.js');

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
var status;
var iterateList;

var salesPlant;
var statusValue;
var searchDate;
var doubleCatered;
var airlineCode;
var flightsList;

//Tomorrows Date inslash format
function init(salesplant, statusvalue, idate, doublecatered, airline, flights) {
	//scafoldNightmare();
	iterateList = [];
	salesPlant = salesplant;
	if(statusvalue == 'prelim') {
		statusValue = 2;
	}
	else if(statusvalue == 'final') {
		statusValue = 5;
	}
	searchDate = idate.split('-')[1] + '/' + idate.split('-')[2] + '/' + idate.split('-')[0].split('20')[1];
	doubleCatered = doublecatered;
	airlineCode = airline;
	flightsList = flights;
	flightsList = flightsList.split('\n');
	console.log('Loaded Information:');
	console.log('SalesPlant:' + salesPlant);
	console.log('Changing status to(2 = prelim, 5 = final):' + statusValue);
	console.log('For date:' + searchDate);
	console.log('Searching all airlines of:' + airlineCode);
	if(doubleCatered) {
		console.log('toggling both flights if they exist');
	}
	else {
		console.log('Only toggling first flight');
	}
	console.log('And parsing for these flights');
	console.log(flightsList);
}


function startNightmare() {
	scafoldNightmare();
}

function searchController() {
	flightsList.push(statusValue);
	flightsList.push(doubleCatered);
	nightmare
		.goto(Url.flightUrl)
		.wait('#for_resultsBoxContents')
		.wait(1000)
		.type('input#salesPlantCode', '')
		.type('input#flightDate', '')
		.type('input#carrierCode', '')
		.type('input#salesPlantCode', salesPlant)
		.type('input#flightDate', searchDate)
		.type('input#carrierCode', airlineCode)
		.click('input#subButton')
		.wait(8000)
		.evaluate(function(iterateList) {
			var checked = [];
			for(var i = 0; i < (iterateList.length - 2); i++) {
				for(var j = 0; document.getElementById('resultRow_' + j); j++) {
					if(document.getElementById('resultRow_' + j).getElementsByTagName('a')[0].innerText == iterateList[i]) {	
						if(document.getElementById('resultRow_' + j).getElementsByTagName('input')[29].checked == false) {
							document.getElementById('resultRow_' + j).getElementsByTagName('input')[29].click();
							if(document.getElementById('resultRow_' + j).classList.contains('even')) {
								document.getElementById('resultRow_' + j).style.backgroundColor = "#3368FF";
							}
							else {
								document.getElementById('resultRow_' + j).style.backgroundColor = "#FF5733";
							}
							if(iterateList[iterateList.length - 1] == true) {
								var evenodd;
								if(document.getElementById('resultRow_' + j).classList.contains('even')) {
									evenodd = 'even';
								}
								else if(document.getElementById('resultRow_' + j).classList.contains('odd')) {
									evenodd = 'odd';
								}
								if(document.getElementById('resultRow_' + (j + 1)).classList.contains(evenodd)){
									document.getElementById('resultRow_' + (j + 1)).getElementsByTagName('input')[29].click();
									document.getElementById('resultRow_' + (j + 1)).getElementsByTagName('select')[0].value = iterateList[iterateList.length - 2];
									if(document.getElementById('resultRow_' + (j + 1)).classList.contains('even')) {
										document.getElementById('resultRow_' + (j + 1)).style.backgroundColor = "#3368FF";
									}
									else {
										document.getElementById('resultRow_' + (j + 1)).style.backgroundColor = "#FF5733";
									}
									checked.push(document.getElementById('resultRow_' + (j + 1)).getElementsByTagName('a')[0].innerText)
								}
								else if(j != 0) {
									if(document.getElementById('resultRow_' + (j - 1)).classList.contains(evenodd)){
										document.getElementById('resultRow_' + (j - 1)).getElementsByTagName('input')[29].click();
										document.getElementById('resultRow_' + (j - 1)).getElementsByTagName('select')[0].value = iterateList[iterateList.length - 2];
										if(document.getElementById('resultRow_' + (j - 1)).classList.contains('even')) {
											document.getElementById('resultRow_' + (j - 1)).style.backgroundColor = "#3368FF";
										}
										else {
											document.getElementById('resultRow_' + (j - 1)).style.backgroundColor = "#FF5733";
										}
										checked.push(document.getElementById('resultRow_' + (j + 1)).getElementsByTagName('a')[0].innerText)
									}
								}
							}
						}
						document.getElementById('resultRow_' + j).getElementsByTagName('select')[0].value = iterateList[iterateList.length - 2];
						checked.push(iterateList[i])
					}
				}
			}
			/*
			var checked = [];
			for(var i = 1; i < iterateList.length; i++) {
				for(var j = 0; document.getElementById('resultRow_' + j); j++) {
					if(document.getElementById('resultRow_' + j).getElementsByTagName('a')[0].innerText == iterateList[i]) {	
						if(document.getElementById('resultRow_' + j).getElementsByTagName('input')[29].checked == false) {
							document.getElementById('resultRow_' + j).getElementsByTagName('input')[29].click();
						}
						document.getElementById('resultRow_' + j).getElementsByTagName('select')[0].value = iterateList[0]
						checked.push(iterateList[i])
					}
				}
			}
			return checked;
			*/
		}, flightsList
		)
		.then(function(checked) {
			console.log('Flights Flagged');
			//findFlightInList(flight);
		})
		.catch(function (error) {
			console.error('loopController.searchForFlight failed due to: ', error);
		});
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
		.wait(3000)
		.then(function() {
			console.log("successfully entered flight overview");
			//cb();
		})
		.catch(function (error) {
			console.error('firstLogin failed due to: ', error);
		})
}


var next = function() {
	searchController();
}

exports.startNightmare = startNightmare;

exports.init = init;

exports.next = next;
