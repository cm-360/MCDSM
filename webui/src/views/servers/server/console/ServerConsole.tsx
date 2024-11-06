import { useCallback, useEffect, useRef, useState } from 'react';
import { useServerContext } from '../ServerView';
import './ServerConsole.css';
import { API_BASE_URL } from '../../../../constants';

const networkId = 'example';

function ServerConsole() {
  const { serverInfo, shouldUpdate } = useServerContext();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [consoleText, setConsoleText] = useState('');

  const connectWebSocket = useCallback(() => {
    socket?.close();

    const newSocket = new WebSocket(`${API_BASE_URL}/networks/${networkId}/servers/${serverInfo.id}/console`);
    console.log(`Connected WebSocket for ${serverInfo.id}`);

    newSocket.addEventListener('message', (event) => {
      const message = event.data;
      setConsoleText((consoleText) => consoleText + message);
    });

    newSocket.addEventListener('close', () => {
      console.log(`WebSocket for ${serverInfo.id} closed`);
    });

    newSocket.addEventListener('error', (event) => {
      console.log(event);
      console.error(`Error in WebSocket for ${serverInfo.id}, reconnecting in 3s...`);
      setTimeout(connectWebSocket, 3000);
    });

    setSocket((oldSocket) => {
      oldSocket?.close();
      return newSocket;
    });
  }, [serverInfo]);

  useEffect(() => {
    connectWebSocket();
  }, [serverInfo, shouldUpdate]);

  const sendCommand = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!socket) {
      window.alert('Console socket is currently disconnected');
      return;
    }

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const command = formData.get('command');
    if (!command)
      return;

    socket.send(command.toString().trim() + '\n');
    form.reset();
  }, [socket]);

  const outputRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    const outputElem = outputRef.current;
    if (!outputElem)
      return;
    outputElem.scrollTop = outputElem.scrollHeight;
  });

  return (
    <div className='server-console'>
      <pre ref={outputRef} className='server-console-output container-md'>{consoleText}</pre>
      <form className='server-console-form container-md' onSubmit={sendCommand}>
        <input className='server-console-input' type='text' name='command' placeholder='Enter a command. Use the arrow keys to navigate the command history.'/>
      </form>
    </div>
  );
}

export default ServerConsole;
