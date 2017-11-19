var fs = require('fs');
var util = require('util');
var Nightmare = require('nightmare');
var Login = require('../private/login.js');
var Url = require('../private/url.js');

var filePath;
var parsedData;

var euroFlights;
var euroDataIndex;
var euroData;
var sortedList;
var datu;
var nightmare;



var getBobSummary = function(salesplant, date) {
	console.log('getBobSummary attempting:' + salesplant + ' ' + date)
	nightmare
		.goto(Url.flightUrl)
		.wait('#for_resultsBoxContents')
		.type('input#salesPlantCode', '')
		.type('input#carrierCode', '')
		.type('input#flightDate' , '')
		.type('input#salesPlantCode', salesplant)
		.type('input#carrierCode', 'AC')
		.type('input#flightDate' , date)
		.click('input#subbutton')
		.wait('#resultRow_0 td img')
		.wait(Delay.extraLong())
		.click('table#for_resultsTable_header > tbody:nth-child(1) > tr:nth-child(1) > td.th:nth-child(3) > input.checkbox:nth-child(1)')
		.evaluate(function() {
			document.queryResultsForm.action = "/cxp/serviceorder/print/ViewSummary.do";
			document.queryResultsForm.removeAttribute('target')
			document.queryResultsForm.submit();
		})
		.then(function() {
			console.log("?");
		})
		.catch(function (error) {
			console.error('getBob failed due to: ', error);
		})
		/*

		

		*/
}

var getDetail = function(salesplant, date) {
	console.log('getDetail attempting:' + salesplant + ' ' + date)
	nightmare
		.goto(Url.flightUrl)
		.wait('#for_resultsBoxContents')
		.type('input#salesPlantCode', '')
		.type('input#carrierCode', '')
		.type('input#flightDate' , '')
		.type('input#salesPlantCode', salesplant)
		.type('input#carrierCode', 'AC')
		.type('input#flightDate' , date)
		.click('input#subbutton')
		.wait('#resultRow_0 td img')
		.wait(Delay.extraLong())
		.click('table#for_resultsTable_header > tbody:nth-child(1) > tr:nth-child(1) > td.th:nth-child(3) > input.checkbox:nth-child(1)')
		.evaluate(function() {
			document.queryResultsForm.action = "/cxp/serviceorder/print/ViewDetail.do";
			document.queryResultsForm.removeAttribute('target')
			document.queryResultsForm.submit();
		})
		.then(function() {
			console.log("?");
		})
		.catch(function (error) {
			console.error('getBob failed due to: ', error);
		})
}

var getDispatch = function(salesplant, date) {
	console.log('getDispatch attempting:' + salesplant + ' ' + date)
	nightmare
		.goto(Url.dispatchUrl)
		.wait('#salesPlantField')
		.type('#salesPlantField', '')
		.type('#departureFromDate', '')
		.type('#departureToDate', '')
		.type('#custCode', '')
		.type('#salesPlantField', salesplant)
		.type('#departureFromDate', date)
		.type('#departureToDate', date)
		.type('#custCode', '0000100021')
		.click('input.button')
		.then(function() {
			console.log("?");
		})
		.catch(function (error) {
			console.error('getDispatch failed due to: ', error);
		})

		/*

	document.getElementById('salesPlantField').onchange;
	var event = new Event('change');
	document.getElementById('salesPlantField').dispatchEvent(event);

	*/

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
		.then(function() {
			console.log("successfully entered flight overview");
			//cb();
		})
		.catch(function (error) {
			console.error('firstLogin failed due to: ', error);
		})
}

exports.init = scafoldNightmare;
exports.getBobSummary = getBobSummary;
exports.getDetail = getDetail;
exports.getDispatch = getDispatch;