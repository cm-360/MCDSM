import './ServerConsole.css';

function ServerConsole() {
  const consoleText = `multiline console text
    indented`;

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
