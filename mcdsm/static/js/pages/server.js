(() => {

	const networkId = 'example';
	const serverId = 'survival'

	// Start/Stop Buttons

	const startStopButton = document.getElementById('startStopButton');
	const restartButton = document.getElementById('restartButton');
	const forceStopButton = document.getElementById('forceStopButton');

	startStopButton.addEventListener('click', (event) => {
		fetch(`/api/networks/${networkId}/servers/${serverId}/start`);
	});

	// Server Console
	let consoleSocket;
	const consoleForm = document.getElementById('consoleForm');
	const consoleLog = document.getElementById('consoleLog');

	consoleForm.addEventListener('submit', (event) => {
		event.preventDefault();

		const consoleFormData = new FormData(consoleForm);
		const command = consoleFormData.get('command');
		consoleForm.reset();

		console.log(command);
		consoleSocket.send(command + '\n');
	});

	function connectSocket() {
		consoleSocket = new WebSocket(`ws://${window.location.host}/api/networks/${networkId}/servers/${serverId}/console`);
		consoleSocket.addEventListener('message', (event) => {
			console.log(event.data);
			consoleLog.innerText += event.data;
		});
	}

	connectSocket();

})();
