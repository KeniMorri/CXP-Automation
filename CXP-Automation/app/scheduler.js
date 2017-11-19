/*
 * This js file handles tasks done every Minute/Hour/Day
 */
var schedule = require('node-schedule');
var LocalUrl = require('../private/localUrl.js');
var fs = require('fs');
var util = require('util');

 var init = function() {
 	schedule.scheduleJob('*/10 * * * *', function() {
 		checkFiles();	
 	})
 }

 var checkFiles = function() {
 	var todaysDate = new Date;
	console.log(">----------------Scheduler.js is Logging");
	console.log((new Date).toLocaleString());
	var SPML = fs.statSync(LocalUrl.specialMealFiles + 'AC1401SP00.txt');
	var SPMLtime = new Date(util.inspect(SPML.mtime));
	console.log('SPML:' + SPMLtime);
	var PILOT = fs.statSync(LocalUrl.pilotMealFiles + 'AC1401CC.txt');
	var PILOTtime = new Date(util.inspect(PILOT.mtime));
	console.log('PILOT:' + PILOTtime);

	if(SPMLtime.toDateString() == todaysDate.toDateString()) {
		if(SPMLtime.getHours() == todaysDate.getHours() || SPMLtime.getHours() == (todaysDate.getHours() - 1) || SPMLtime.getHours() == (todaysDate.getHours() + 1)) {
			SocketsManager.consolelog('SPML File is up to date: ' + SPMLtime.getHours() + ':' + SPMLtime.getMinutes());
		}
		else {
			SocketsManager.consolelog('WARNING WARNING WARNING')
			SocketsManager.consolelog('SPML File is out to date: ' + SPMLtime.getHours() + ':' + SPMLtime.getMinutes());
		}
	}
	else {
		SocketsManager.consolelog('WARNING WARNING WARNING')
		SocketsManager.consolelog('SPML File is extremely out to date: ' + SPMLtime.getHours() + ':' + SPMLtime.getMinutes());
	}


	if(PILOTtime.toDateString() == todaysDate.toDateString()) {
		if(PILOTtime.getHours() == todaysDate.getHours() || PILOTtime.getHours() == (todaysDate.getHours() - 1) || PILOTtime.getHours() == (todaysDate.getHours() + 1)) {
			SocketsManager.consolelog('Pilot File is up to date: ' + PILOTtime.getHours() + ':' + PILOTtime.getMinutes());
		}
		else {
			SocketsManager.consolelog('WARNING WARNING WARNING')
			SocketsManager.consolelog('Pilot File is out to date: ' + PILOTtime.getHours() + ':' + PILOTtime.getMinutes());
		}
	}
	else {
		SocketsManager.consolelog('WARNING WARNING WARNING')
		SocketsManager.consolelog('Pilot File is extremely out to date: ' + PILOTtime.getHours() + ':' + PILOTtime.getMinutes());
	}
 }

 exports.init = init;
 exports.checkFiles = checkFiles;