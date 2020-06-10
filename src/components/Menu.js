import React from 'react';
import '../css/Menu.css';

function Menu() {
    return (
        <ul className="menu">
            <li className="menu__item">
                <i class="fas fa-check menu__icon"></i>
                <a href="/" className="menu__link">Wait accept</a>
            </li>
            <li className="menu__item">
                <i class="fas fa-check menu__icon"></i>
                <a href="/" className="menu__link">Deny</a>
            </li>
            <li className="menu__item">
                <i class="fas fa-check menu__icon"></i>
                <a href="/" className="menu__link">Accepted</a>
            </li>
            <li className="menu__item">
                <i class="fas fa-check menu__icon"></i>
                <a href="/" className="menu__link">Errors</a>
            </li>
        </ul>
    );
}

export default Menu;