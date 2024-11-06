import { useEffect, useState } from 'react';
import { useServerContext } from '../ServerView';
import './ServerConsole.css';
import { API_BASE_URL } from '../../../../constants';

const networkId = 'example';

function ServerConsole() {
  const { serverInfo } = useServerContext();

  const [socket, setSocket] = useState<WebSocket | null>();
  const [consoleText, setConsoleText] = useState('');

  useEffect(() => {
    const newSocket = new WebSocket(`${API_BASE_URL}/networks/${networkId}/servers/${serverInfo.id}/console`);
    console.log(`Connected WebSocket for ${serverInfo.id}`);
    setSocket(newSocket);
  }, [serverInfo]);

  async function sendCommand(event: React.FormEvent) {
    event.preventDefault();

    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    console.log(formData);

    form.reset();
  }

  return (
    <>
      <pre className='server-console-output container-md'>{consoleText}</pre>
      <form className='container-md' onSubmit={sendCommand}>
        <input className='server-console-input' type='text' name='command' placeholder='Enter a command. Use the arrow keys to navigate the command history.'/>
      </form>
    </>
  );
}

export default ServerConsole;
