var eventEmitter = require('events').EventEmitter;
var emitter = new eventEmitter();

emitter.on('err', function(err){
    console.error('##### ERROR #####', err);
});

process.on('uncaughtException', function(err) {
    console.error('Uncaught error', err);
});

function checkAndHandleError(err, res) {
	if(err) {
		emitter.emit('err', new Error(err));
	}
	res.status(500).send('Internat server error: ' + err);
}

module.exports = checkAndHandleError;