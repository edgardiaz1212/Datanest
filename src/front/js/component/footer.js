import React from "react";
import logo from '../../img/mad_data.png';

export const Footer = () => (
	<>
		<footer className="footer text-center">
			<div className="container d-flex align-items-center justify-content-between">
				<div className="logo-container">
					<img className="logo-icon" src={logo} alt="icon" width="70" />
				</div>
				<div className="copyright-container">
					<small className="copyright">
						Centro de Datos El Hatillo
					</small>
				</div>
			</div>
		</footer>
	</>
);
