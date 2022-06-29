import { useState } from 'react'
import logo from './logo.svg'
import './App.css'
import { invoke } from '@tauri-apps/api';


const greet = (name: string): Promise<string> =>
   invoke('greet', { name });


function App() {
  const [count, setCount] = useState(0);
  const [prompt, setPrompt] = useState('');

  const cb = () => {
      setCount(count => count + 1);
      greet('World').then(response => setPrompt(response));
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>Hello Vite + React!</p>
        <p>
          <button type="button" onClick={cb}>
            count is: {count}
          </button>
        </p>
        <p>
           {prompt} Edit <code>App.tsx</code> and save to test HMR updates.
        </p>
        <p>
          <a
            className="App-link"
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </a>
          {' | '}
          <a
            className="App-link"
            href="https://vitejs.dev/guide/features.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            Vite Docs
          </a>
        </p>
      </header>
    </div>
  )
}

export default App
