/**
Decodes Data into values, for a given signature.

@module ABI
*/
const electron = require('electron');
const ipc = electron.ipcMain;
const abi = require('elementremjs-abi');

function isHexType(type) {
	return _.includes(['address', 'bytes'], type) || type.match(/bytes\d+/g);
}

ipc.on('backendAction_decodeFunctionSignature', function(event, signature, data){
	var dataBuffer, paramTypes;
	dataBuffer = new Buffer(data.slice(10, data.length), 'hex');
	signature = signature.match(/\((.+)\)/i);

	if (!signature) return;

	paramTypes = signature[1].split(',');

	try	{
		var paramsResponse = abi.rawDecode(paramTypes, dataBuffer);
		var paramsDictArr = [];

		// Turns addresses into proper hex string
		// Turns numbers into their decimal string version
		paramTypes.forEach((type, index) => {
			var conversionFlag = isHexType(type) ? 'hex' : null,
				prefix = isHexType(type) ? '0x' : '';

			paramsResponse[index] = paramsResponse[index].toString(conversionFlag);

			paramsDictArr.push({type: type, value: prefix + paramsResponse[index]});
		});

		event.sender.send('uiAction_decodedFunctionSignatures', paramsDictArr);
	}
	catch(e){
		console.warn('ABI.js Warning:', e.message);
	}
});
