var fs = require('fs');
var util = require('util');

var filePath;

function init(filepath) {
	filePath = filepath;
}

function initBasic(filepath) {
	var date = new Date;
	var formattedTodayDateFile = date.toDateString() + ' ' +  date.getHours() + 'h' + date.getMinutes() + 'm';
	filePath = filepath + formattedTodayDateFile + '.txt';
}

function initOverride(filepath) {
	filePath = filepath;
	fs.writeFileSync(filePath, '', 'utf-8');
	//fs.writeFile(filePath, '', 'utf-8');
}

function statement(input, spacing) {
	SocketsManager.consolelog(input)
	fs.appendFileSync(filePath, input , 'utf-8');
	fs.appendFileSync(filePath, '\n' , 'utf-8');
	if(spacing) {
		fs.appendFileSync(filePath, '\n' , 'utf-8');
	}
}

function print(input) {
	//SocketsManager.consolelog(input);
	fs.appendFileSync(filePath, input , 'utf-8');
}

function dataObject(title, input, spacing) {
	SocketsManager.boldlog(title);
	SocketsManager.consolelog(util.inspect(input));
	fs.appendFileSync(filePath, title , 'utf-8');
	fs.appendFileSync(filePath, '\n' , 'utf-8');
	fs.appendFileSync(filePath, util.inspect(input) , 'utf-8');
	fs.appendFileSync(filePath, '\n' , 'utf-8');
	if(spacing) {
		fs.appendFileSync(filePath, '\n' , 'utf-8');
	}
}


exports.init = init;
exports.statement = statement;
exports.initOverride = initOverride;
exports.print = print;
exports.data = dataObject;
exports.initBasic = initBasic;



