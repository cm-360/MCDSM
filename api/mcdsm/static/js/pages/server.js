(() => {

    const networkId = document.body.dataset.networkId;
    const serverId = document.body.dataset.serverId;

    let serverInfo;

    // Start/Stop Buttons

    const startStopButton = document.getElementById('start-stop-button');
    const restartButton = document.getElementById('restart-button');
    const forceStopButton = document.getElementById('force-stop-button');

    startStopButton.addEventListener('click', (event) => {
        fetch(`/api/networks/${networkId}/servers/${serverId}/start`);
    });

    // Server Console

    let consoleSocket;
    const consoleForm = document.getElementById('console-form');
    const consoleLog = document.getElementById('console-log');

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

    // Server Info

    const serverName = document.getElementById('server-name');
    const serverStatus = document.getElementById('server-status');
    const updateTimestamp = document.getElementById('update-timestamp');

    async function fetchServerInfo() {
        try {
            const response = await fetch(`/api/networks/${networkId}/servers/${serverId}`);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            serverInfo = await response.json();
        } catch (error) {
            console.error(error.message);
        }
    }

    async function updateServerInfo() {
        await fetchServerInfo();

        serverName.innerText = serverInfo.display_name;
        serverStatus.innerText = serverInfo.running ? 'Running' : 'Stopped';
        updateTimestamp.innerText = `Last updated: ${new Date().toLocaleString()}`;
    }

    updateServerInfo();
    setInterval(updateServerInfo, 5000);

})();
