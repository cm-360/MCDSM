import { useCallback, useEffect, useRef, useState } from 'react';
import { useServerContext } from '../ServerView';
import './ServerConsole.css';
import { API_BASE_URL } from '../../../constants';
import { useNetworkContext } from '../../networks/NetworkView';

export default function ServerConsole() {
  const { networkInfo } = useNetworkContext();
  const { serverInfo, shouldUpdate } = useServerContext();

  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [consoleText, setConsoleText] = useState('');

  const socketBaseUrl = `${API_BASE_URL}/networks/${networkInfo.id}/servers/${serverInfo.id}/console`;

  const connectWebSocket = useCallback((includeLogs=false) => {
    const socketUrl = `${socketBaseUrl}?include_logs=${includeLogs}`;
    const newSocket = new WebSocket(socketUrl);

    newSocket.addEventListener('open', () => {
      console.log(`Connected WebSocket for ${serverInfo.id}`);
      setConsoleText("");
    })

    newSocket.addEventListener('message', (event) => {
      const message = event.data;
      setConsoleText((consoleText) => consoleText + message);
    });

    newSocket.addEventListener('close', () => {
      console.log(`WebSocket for ${serverInfo.id} closed`);
    });

    newSocket.addEventListener('error', (event) => {
      console.log(event);
      console.error(`Error in WebSocket for ${serverInfo.id}`);

      if (socket === newSocket) {
        console.log('Reconnecting in 3s...')
        setTimeout(() => connectWebSocket(false), 3000);
      }
    });

    setSocket((oldSocket) => {
      oldSocket?.close();
      return newSocket;
    });

    return newSocket;
  }, [serverInfo]);

  useEffect(() => {
    const socket = connectWebSocket(true);

    return () => {
      socket.close();
    }
  }, [serverInfo, shouldUpdate]);

  const sendCommand = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();

    if (!socket) {
      window.alert('Console socket is currently disconnected');
      return;
    }

    if (socket.readyState === WebSocket.CLOSED) {
      window.alert('Console socket is currently closed');
      connectWebSocket(false);
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
