import Worker from 'worker-loader?name=xlsx.worker.js!../node_modules/xlsx/xlsxworker'

export default {
	createColumn(name) {
		return {
			name: name,
			tempSlot: '',
			filter: {
				find: '',
				replace: '',
				case: false,
				regex: false,
				range: false,
			}
		}
	},
	readFileAsync(file) {
		return new Promise((resolve, reject) => {
			let reader = new FileReader();

			reader.onload = () => {
			resolve(reader.result);
			};

			reader.onerror = reject;

			reader.readAsArrayBuffer(file);
		})
	},
	readWorkbook(fileResult) {

		return new Promise((resolve, reject) => {
			var worker = new Worker();
			worker.onmessage = function(e) {
				switch(e.data.t) {
					case 'ready': break;
					case 'e': reject(e.data.d); break;
					case 'xlsx': resolve(JSON.parse(e.data.d)); break;
				}
			};
			worker.postMessage({d:fileResult,b:'buffer'});
        });
	}
}