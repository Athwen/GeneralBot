import React from "react";
import logo from './logo.svg';
import './App.css';

function App() {

	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);
	const code = urlParams.get('code');

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href={`app://general_bot/joinRoom?code=${code}`}
          target="_blank"
          rel="noopener noreferrer"
		  onClick="window.close(); return false"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
