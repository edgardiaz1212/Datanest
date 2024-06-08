import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { Context } from "../store/appContext";
import logo from '../../img/CDHLogo.jpg';

export const Navbar = () => {
  const { store, actions } = useContext(Context)
  return (
    <>
      <header id="header" className="header">
        <nav className="main-nav navbar-expand-md" role="navigation"    >
          <div className="container-fluid position-relative">

            <Link to="/" className="logo navbar-brand text-white" >
              <span className="logo-icon-wrapper">
                <img className="logo-icon" src={logo} alt="icon" />
              </span>
              <span className="text ">Planilla<span className="highlight">FOR-BA7D</span> </span>
            </Link>

            
            <div className="collapse navbar-collapse" id="navbarNav">
              <ul className="navbar-nav">


              </ul>
            </div>
          </div>
        </nav>
      </header>
    </>

  );
};
