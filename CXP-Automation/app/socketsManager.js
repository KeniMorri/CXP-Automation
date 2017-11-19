var AdvancedMealUpdater = require('../AdvancedMealUpdater/advMealUpdater.js')
var AdvancedMaterialUpdater = require('../AdvancedMaterialUpdater/advMaterialUpdater.js')
var SpecialMealChecker = require('../SpecialMealChecker/specialMealChecker.js')
var PilotMealChecker = require('../PilotMealChecker/pilotMealChecker.js')
var StatusChanger = require('../StatusChanger/statusChanger.js')

var MealStats = require('../MealStats/mealParse.js')
var GetReports = require('../Utility/downloadReports.js')

var io;

exports.init = function(ioi) {
	io = ioi;
}

exports.start = function() {
	io.sockets.on('connection', function(socket) {
		//console.log("Client has connected on ip: " + socket.handshake.address);

		socket.on('name', function(name) {
			//console.log(name + ' connected')
		})
		
		// Advanced Meal Updater
		socket.on('ADVinit', function() {
			AdvancedMealUpdater.init();
		})
		socket.on('ADVnext', function(flags) {
			AdvancedMealUpdater.setSave(flags['autoSave']);
			AdvancedMealUpdater.setScramble(flags['scramble']);
			AdvancedMealUpdater.next();
		})
		socket.on('ADVsave', function() {
			AdvancedMealUpdater.save();
		})
		socket.on('ADVskip', function() {
			AdvancedMealUpdater.skip();
		})
		socket.on('ADVselectRow', function(val) {
			AdvancedMealUpdater.selectRow(val);
		})
		socket.on('ADVtoggle', function() {
			AdvancedMealUpdater.toggleSave();
		})


		// Advanced Material Updater
		socket.on('ADMinit', function() {
			AdvancedMaterialUpdater.init();
		})
		socket.on('ADMnext', function(flags) {
			AdvancedMaterialUpdater.setSave(flags['autoSave']);
			AdvancedMaterialUpdater.setScramble(flags['scramble']);
			AdvancedMaterialUpdater.next();
		})
		socket.on('ADMsave', function() {
			AdvancedMaterialUpdater.save();
		})
		socket.on('ADMskip', function() {
			AdvancedMaterialUpdater.skip();
		})
		socket.on('ADMselectRow', function(val) {
			AdvancedMaterialUpdater.selectRow(val);
		})
		socket.on('ADMtoggle', function() {
			AdvancedMaterialUpdater.toggleSave();
		})
		
		// Special Meal Checker
		socket.on('SMCinit', function() {
			SpecialMealChecker.init();
		})
		socket.on('SMCyyz', function(auto) {
			SpecialMealChecker.initPassengers('YYZ', '17:00', true, auto);
		})
		socket.on('SMCyyc', function(auto) {
			console.log(auto)
			SpecialMealChecker.initPassengers('YYC', '15:00', false, auto);
		})
		socket.on('SMCyvr', function(auto) {
			SpecialMealChecker.initPassengers('YVR', '15:00', false, auto);
		})
		socket.on('SMCnext', function() {
			SpecialMealChecker.next();
		})
		

		//Pilot Meal Checker
		socket.on('Pinit', function(YYZ) {
			console.log('Pinit')
			if(YYZ == 'YYZ') {
				Delay.setDelay(1500, 3000, 6000, 9000);
				PilotMealChecker.init(1401, 1401);
			}
			else {
				Delay.init();
				PilotMealChecker.init(1402, 1409);
			}
		})
		socket.on('Pnext', function(auto) {
			PilotMealChecker.next();
		})
		socket.on('Pskip', function(auto) {
			PilotMealChecker.skip();
		})


		// Flight Status Changer
		socket.on('StatusBrowser', function() {
			StatusChanger.startNightmare(); 
		})
		socket.on('StatusInit', function(result) {
			console.log(result);
			StatusChanger.init(result['salesPlant'],result['statusValue'], result['date'], result['doubleC'], result['airline'], result['flights']); 
		})
		socket.on('StatusChange', function() {
			StatusChanger.next();
		})

		//Utlity Functions
		socket.on('mealStats', function() {
			MealStats.run();
		})

		//Get Reports
		socket.on('initReport', function() {
			GetReports.init();
		})
		socket.on('getBob', function(data) {
			GetReports.getBobSummary(data['salesPlant'], data['date']);
		})
		socket.on('getDetail', function(data) {
			GetReports.getDetail(data['salesPlant'], data['date']);
		})
		socket.on('getDispatch', function(data) {
			GetReports.getDispatch(data['salesPlant'], data['date']);
		})



		socket.on('delayMod', function(add) {
			if(add) {
				Delay.modDelay(250, 500, 1000, 1500);
			}
			else {
				Delay.modDelay(-250, -500, -1000, 1500);
			}
		})
	})
}

exports.consolelog = function(msg) {
	io.sockets.emit('consolelog', msg);
}

exports.boldlog = function(msg) {
	io.sockets.emit('boldlog', msg);
}