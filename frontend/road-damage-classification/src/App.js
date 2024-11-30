import React from 'react';
import UploadForm from './components/UploadForm';
import './App.css';
import logo from './assets/egrid-logo.svg';

function App() {
    return (
        <div className="App">
            <header className="app-header">
                <img src={logo} alt="E-Grid Logo" className="logo" />
                <h1>Road Damage Analysis</h1>
            </header>
            <main>
                <UploadForm />
            </main>
        </div>
    );
}

export default App;