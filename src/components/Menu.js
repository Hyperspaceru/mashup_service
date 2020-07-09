import React, { useEffect, useState } from 'react';
import '../css/Menu.css';

function Menu({menuHandler,className}) {
    // debugger
    // console.log(menuHandler)
    return (
        <ul className={"menu"+" "+className}>
            <li className="menu__item">
                <a href="#" onClick={() => menuHandler("WAIT")} className="menu__link">
                    <i class="fas fa-question menu__icon"></i>
                    <span>Wait accept</span>
                </a>
            </li>
            <li className="menu__item">
                <a href="#" onClick={() => menuHandler("ACCEPT")} className="menu__link">
                    <i class="fas fa-clock menu__icon"></i>
                    <span>Accepted</span>
                </a>
            </li>
            <li className="menu__item">
                <a href="#" onClick={() => menuHandler("DENY")} className="menu__link">
                    <i class="fas fa-ban menu__icon"></i>
                    <span>Deny</span>
                </a>
            </li>
            <li className="menu__item">
                <a href="#" onClick={() => menuHandler("ERROR")} className="menu__link">
                    <i class="fas fa-exclamation-triangle menu__icon"></i>
                    <span>Errors</span>
                </a>
            </li>
            <li className="menu__item">
                <a href="#" onClick={() => menuHandler("DONE")} className="menu__link">
                    <i class="fas fa-check menu__icon"></i>
                    <span>Uploaded</span>
                </a>
            </li>
        </ul>
    );
}

export default Menu;