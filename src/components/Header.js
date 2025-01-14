// src/components/Header.js
import React from "react";
import "./Header.scss"; // Import a SCSS file for header-specific styles

const Header = ({ appname, user, role }) => {
    return (
        <header className="header">
            <div className="header__app-name">{appname}</div>
            <div className="header__user-info">
                <span className="header__user-name">{user}</span>
                <span className="header__user-role">{role}</span>
            </div>
        </header>
    );
};

export default Header;
