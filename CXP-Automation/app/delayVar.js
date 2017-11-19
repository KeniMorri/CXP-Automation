var short;
var medium;
var long;
var extraLong;

exports.init = function() {
	short = 1000;
	medium = 2500;
	long = 5000;
	extraLong = 8000;
	SocketsManager.consolelog('Delays are now :' + short + ' , ' + medium + ' , ' + long + ' , ' + extraLong);
	console.log('Delays are now :' + short + ' , ' + medium + ' , ' + long + ' , ' + extraLong);
}

exports.setDelay = function(sd, md, ld, ed) {
	short = sd;
	medium = md;
	long = ld;
	extraLong = ed;
	SocketsManager.consolelog('Delays are now :' + short + ' , ' + medium + ' , ' + long + ' , ' + extraLong);
	console.log('Delays are now :' + short + ' , ' + medium + ' , ' + long + ' , ' + extraLong);
}

exports.modDelay = function(sd, md, ld, ed) {
	short = short + sd;
	medium = medium + md;
	long = long + ld;
	extraLong = extraLong + ed;
	SocketsManager.consolelog('Delays are now :' + short + ' , ' + medium + ' , ' + long + ' , ' + extraLong);
	console.log('Delays are now :' + short + ' , ' + medium + ' , ' + long + ' , ' + extraLong);
}



exports.short = function() {
	return short;
}
exports.medium = function() {
	return medium;
}
exports.long = function() {
	return long;
}
exports.extraLong = function() {
	return extraLong;
}