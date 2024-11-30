import React from 'react';
import UploadForm from './components/UploadForm';
import './styles/styles.css';

function App() {
    return (
        <div className="App">
            <header>
                <h1>Road Damage Analysis</h1>
            </header>
            <main>
                <UploadForm />
            </main>
        </div>
    );
}

export default App;
