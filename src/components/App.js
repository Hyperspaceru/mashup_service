import React , { useEffect,useState } from 'react';
import Menu from './Menu'
import Approve from './Approve'
import '../css/App.css';

function App() {  
  const [menuState,setMenuState] = useState("WAIT")
  const changeMenu = (menuStatus) => setMenuState(menuStatus);   
  return (
    <div className="App">
      <header className="header">
        <i class="fas fa-bars"></i><span class="header__text">Mashup admin panel</span>      
      </header>
      <div className="container">
        <div className="main_menu"><Menu menuHandler = {changeMenu}></Menu></div>
        <main className="content">
          <Approve menuState = {menuState}></Approve>
        </main>
      </div>
    </div>
  );
}

export default App;
