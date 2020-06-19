import React ,{ useEffect,useState } from 'react';
import '../css/Menu.css';

function Menu(menuHandler) {
    return (
        <ul className="menu">
            <li className="menu__item">
                <i class="fas fa-check menu__icon"></i>
                <a href="#" onClick={()=>menuHandler.menuHandler("WAIT")} className="menu__link">Wait accept</a>
            </li>
            <li className="menu__item">
                <i class="fas fa-check menu__icon"></i>
                <a href="#" onClick={()=>menuHandler.menuHandler("ACCEPT")} className="menu__link">Accepted</a>
            </li>
            <li className="menu__item">
                <i class="fas fa-check menu__icon"></i>
                <a href="#" onClick={()=>menuHandler.menuHandler("DENY")} className="menu__link">Deny</a>
            </li>            
            <li className="menu__item">
                <i class="fas fa-check menu__icon"></i>
                <a href="#" onClick={()=>menuHandler.menuHandler("ERROR")} className="menu__link">Errors</a>
            </li>
            <li className="menu__item">
                <i class="fas fa-check menu__icon"></i>
                <a href="#"  onClick={()=>menuHandler.menuHandler("DONE")} className="menu__link">Uploaded</a>
            </li>
        </ul>
    );
}

export default Menu;