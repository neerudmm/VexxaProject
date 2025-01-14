import React, { useState } from "react";
import Icon from "../Images/Icon.svg";
import VexaIcon from "../Images/VexaIcon.png";
import Profile from "../Images/profile.png";
import Dashboard from "../Images/dashboard.svg";
import Transactions from "../Images/transactions.svg";
import Performance from "../Images/performance.svg";
import News from "../Images/news.svg";
import Settings from "../Images/settings.svg";
import Support from "../Images/support.svg";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
    const location = useLocation();

    const [closeMenu, setCloseMenu] = useState(false);

    const handleCloseMenu = () => {
        setCloseMenu(!closeMenu);
    };

    return (
        <div className={closeMenu === false ? "sidebar" : "sidebar active"}>
            <div
                className={
                    closeMenu === false
                        ? "logoContainer"
                        : "logoContainer active"
                }
            >
                <img src={VexaIcon} alt="icon" className="logo" style={{ width: '50px', height: '50px' }} />
                <h2 className="title">Vexxa AB Job Portal. </h2>
            </div>
            <div
                className={
                    closeMenu === false
                        ? "burgerContainer"
                        : "burgerContainer active"
                }
            >
                <div
                    className="burgerTrigger"
                    onClick={() => {
                        handleCloseMenu();
                    }}
                ></div>
                <div className="burgerMenu"></div>
            </div>
           
            <div
                className={
                    closeMenu === false
                        ? "contentsContainer"
                        : "contentsContainer active"
                }
            >
                <ul>
                <li
                        className={
                            location.pathname === "/transactions"
                                ? "active"
                                : ""
                        }
                    >
                        <img src={Transactions} alt="transactions" />
                        <a href="/transactions">Job Search</a>
                    </li>
                    
                    <li className={location.pathname === "/" ? "active" : ""}>
                        <img src={Dashboard} alt="dashboard" />
                        <a href="/dashboard">dashboard</a>
                    </li>
                   
                    <li
                        className={
                            location.pathname === "/settings" ? "active" : ""
                        }
                    >
                        <img src={Settings} alt="Settings" />
                        <a href="/settings">settings</a>
                    </li>
                    <li
                        className={
                            location.pathname === "/support" ? "active" : ""
                        }
                    >
                        <img src={Support} alt="Support" />
                        <a href="/support">support</a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default Sidebar;
