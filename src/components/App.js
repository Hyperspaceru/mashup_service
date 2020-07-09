import React, { useEffect, useState } from 'react';
import Menu from './Menu'
import Approve from './Approve'
import '../css/App.css';

function App() {
  const [menuState, setMenuState] = useState("WAIT")
  const [mashupCount,setMashupCount] = useState(0)
  const changeMenu = (menuStatus) => setMenuState(menuStatus);
  const changeMashupCount = (count) => setMashupCount(count)
  useEffect(()=>{
    console.log(mashupCount)
  })
  return (
    <div className="App">
      <header className="header">
        <div className="header__left">
          <div className="logo"><div class="logo__text"><span className="logo__sharp">#</span><span >Mashup</span></div>
            <span class="logo__subtext">admin panel</span></div>
        </div>
        <div className="header__center">
          <div className="searchbar">
            <input className="searchbar__input" type="text" />
            <button className="searchbar__button">
            <i class="fas fa-search"></i>
            </button>
          </div>
        </div>
        <div className="header__right">
        <span>{mashupCount}</span>
        </div>
      </header>
      <div className="container">
        <Menu className="main_menu" menuHandler={changeMenu}></Menu>
        <Approve className="content" menuState={menuState} countHandler={changeMashupCount}></Approve>
      </div>
    </div>
  );
}

export default App;
