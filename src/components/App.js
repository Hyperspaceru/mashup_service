import React from 'react';
import Menu from './Menu'
import Approve from './Approve'
import '../css/App.css';

function App() {
  return (
    <div className="App">
      <header className="header">
        <i class="fas fa-bars"></i><span class="header__text">Mashup admin panel</span>      
      </header>
      <div className="container">
        <div className="main_menu"><Menu></Menu></div>
        <main className="content">
          <Approve></Approve>
        </main>
      </div>
    </div>
  );
}

export default App;
