var fs = require('fs');
var util = require('util');

var Log = require('../log.js');


var LogBothIntTrans;
var LogInternational;
var LogIntMain;
var LogIntPY;
var LogTransBorderOB;
var LogTransOBMain;
var LogTransOBRouge;
var LogTransBorderIB;
var LogTransIBMain;
var LogTransIBRouge;

function run() {
		filePath = "./TextParser/outputData.json";
		Log.initOverride('../Archive/MealStats/Debug.json')
		LogBothIntTrans = '';
		LogInternational = '';
		LogIntMain = '';
		LogIntPY = '';
		LogTransBorderOB = '';
		LogTransOBMain = '';
		LogTransOBRouge = '';
		LogTransBorderIB = '';
		LogTransIBMain = '';
		LogTransIBRouge = '';
		parseInput();
}


function parseInput() {
	var path = process.cwd();
	var buffer = fs.readFileSync('./MealStats/mealData.json');
	var longList = buffer.toString();
	console.log('buffer');
	console.log(longList);
	longList = longList.split(/\n/);
	for(var i = 0; i < (longList.length - 1) && longList[i] != undefined; i++) {
		var flight = longList[i].split('\t')[2];
		var flight = parseInt(flight.substring(2));
		console.log('>' + flight + '<');
		var Origin = longList[i].split('\t')[4];



		if( ((flight > 0 && flight < 100) || (flight >= 800 && flight < 900) || (flight >= 1900 && flight < 2000)) &&  !(flight >= 1980 && flight < 1990) ) {
			LogBothIntTrans += longList[i] + '\n';
			//Pushing Data to full list
			LogInternational += longList[i] + '\n';
			if(flight > 0 && flight < 100 || flight >= 800 && flight < 900) {
				//Filter International and Int Mainline
				LogIntMain += longList[i] + '\n';
			}
			else {
				//Filter International and PY international
				LogIntPY += longList[i] + '\n';
			}
		}
		else {
			//Zero out rows for Final Both int / trans
			var row = '';
			var tmp = longList[i].split('\t');
			Log.statement('Check')
			Log.statement(longList[i]);
			Log.statement(tmp);
			tmp[31] = 0;
			tmp[34] = 0;
			Log.statement(tmp);
			for(var j = 0; j < tmp.length; j++) {
				if(row != '') {
					row = row + '\t';
				}
				row = row + tmp[j];
			}
			Log.statement(row);
			LogBothIntTrans += row + '\n';
			//31 && 34
			if(Origin.substring(0,1) == 'Y') {
				if( (flight >= 1700 && flight < 1900) || (flight >= 1980 && flight < 1990)) {
					//Filter Transborder OB Rouge
					LogTransBorderOB += row + '\n';
					LogTransOBRouge += row + '\n';
				}
				else {
					//Filter Transborder OB Mainline
					LogTransBorderOB += row + '\n';
					LogTransOBMain += row + '\n';
				}
			}
			else {
				if( (flight >= 1700 && flight < 1900) || (flight >= 1980 && flight < 1990)) {
					//Filter Transborder OB Rouge
					LogTransBorderIB += row + '\n';
					LogTransIBRouge += row + '\n';
				}
				else {
					//Filter Transborder OB Mainline
					LogTransBorderIB += row + '\n';
					LogTransIBMain += row + '\n';
				}
			}
		}
		//parsedData.push(tmp);
	}
	Log.initOverride('../Archive/MealStats/BothIntTrans.json')
	Log.print(LogBothIntTrans);
	Log.initOverride('../Archive/MealStats/Int.json')
	Log.print(LogInternational);
	Log.initOverride('../Archive/MealStats/IntMain.json')
	Log.print(LogIntMain);
	Log.initOverride('../Archive/MealStats/IntPy.json')
	Log.print(LogIntPY);
	Log.initOverride('../Archive/MealStats/TransOB.json')
	Log.print(LogTransBorderOB);
	Log.initOverride('../Archive/MealStats/TransOBMain.json')
	Log.print(LogTransOBMain);
	Log.initOverride('../Archive/MealStats/TransOBRouge.json')
	Log.print(LogTransOBRouge);
	Log.initOverride('../Archive/MealStats/TransIB.json')
	Log.print(LogTransBorderIB);
	Log.initOverride('../Archive/MealStats/TransIBMain.json')
	Log.print(LogTransIBMain);
	Log.initOverride('../Archive/MealStats/TransIBRouge.json')
	Log.print(LogTransIBRouge);
	console.log('Complete');
}

exports.run = run;



