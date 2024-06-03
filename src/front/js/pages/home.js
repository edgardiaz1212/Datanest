import React, { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { Context } from '../store/appContext'
import heroback from '../../img/hero-1.jpg'
import logorack from '../../img/OIG2.jpeg'
import RegisterUser from "../component/RegisterUser.jsx";

export const Home = () => {

	return (
		<>
			<div  id="hero" className="hero-section pt-5 bg " style={{ backgroundImage: `url(${heroback})` }} >
				<div id="hero-main" className="hero-main ">
					<div className="figure-holder-wrapper ">
						<div className="container ">
							<div className="row align-items-center ">
								<div className="col-md-6  ">
									<div className="main-item item-1 active">
										<div className="item-content container">
											<div className="item-content-inner">
												<h2 className="heading">
													Bienvenido al Sistema de Gestion de Solicitudes de Colocacion DCCE
												</h2>
												<p className="intro">
													Aca podras registrar de manera sencilla las solicitudes respecto a colocacion de los clientes del Centro de Datos el Hatillo!
												</p>
											</div>
										</div>
									</div>
								</div>
								<div className="col-md-6 figure-holder">
									{/* <img className="figure-image img-fluid" src={logorack} alt="Hero Image" /> */}
									<RegisterUser/> 
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			<div className="container text-center mt-5">
				<h2>Dudas mas comunes  </h2>
				<div className="accordion accordion-flush" id="accordionFlushHome">
					<div className="accordion-item">
						<h2 className="accordion-header">
							<button
								className="accordion-button collapsed"
								type="button" data-bs-toggle="collapse"
								data-bs-target="#collapseOne"
								aria-expanded="false"
								aria-controls="collapseOne">
								Cual es la diferencia entre Desincorporacion y Retiro
							</button>
						</h2>
						<div id="collapseOne" className="accordion-collapse collapse" data-bs-parent="#accordionFlushHome">
							<div className="accordion-body">
								<p>La desincorporacion implica resguardo en depositos del Data Center, solo para elementos en hosting</p>
								<p>El retiro, el equipamiento sale de las instalaciones del Data Center</p>
							</div>
						</div>
					</div>
					<div className="accordion-item">
						<h2 className="accordion-header">
							<button
								className="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#collapseTwo"
								aria-expanded="false"
								aria-controls="collapseTwo">
								Que es la mudanza?
							</button>
						</h2>
						<div id="collapseTwo" className="accordion-collapse collapse" data-bs-parent="#accordionFlushHome">
							<div className="accordion-body">
								<p>Esta actividad es cuando ya se tiene equipamiento instalado en el Data Center y requiere moverse dentro del Data Center a otra ubicacion</p>
							</div>
						</div>
					</div>
					<div className="accordion-item">
						<h2 className="accordion-header">
							<button
								className="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#collapseThree"
								aria-expanded="false"
								aria-controls="collapseThree">
								Quien debe llenar la planilla?
							</button>
						</h2>
						<div id="collapseThree" className="accordion-collapse collapse" data-bs-parent="#accordionFlushHome">
							<div className="accordion-body">
								<p>EL solicitante debe ser de CANTV, ya que es el cliente directo</p>
							</div>
						</div>
					</div>

					<div className="accordion-item">
						<h2 className="accordion-header">
							<button
								className="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#collapseFour"
								aria-expanded="false"
								aria-controls="collapseFour">
								Mas dudas acerca del llenado?
							</button>
						</h2>
						<div id="collapseFour" className="accordion-collapse collapse" data-bs-parent="#accordionFlushHome">
							<div className="accordion-body">
								<p>Escribir a los correos infraestructura@dch.cantv.com.ve y coinfra_cdh@cantv.com.ve</p>
							</div>
						</div>
					</div>
					<div className="accordion-item">
						<h2 className="accordion-header">
							<button
								className="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#collapseFive"
								aria-expanded="false"
								aria-controls="collapseFive">
								¿Por qué es crucial completar todos los campos del formato de Solicitud de Adecuación de Espacio?
							</button>
						</h2>
						<div id="collapseFive" className="accordion-collapse collapse" data-bs-parent="#accordionFlushHome">
							<div className="accordion-body">
								Es fundamental completar todos los campos del formato para garantizar que se cuente con la información necesaria
								para evaluar y aprobar la conexión de los equipos solicitados.
								Además, el llenado completo del formulario facilita el estudio de rentabilidad de cada caso</div>
						</div>
					</div>
					<div className="accordion-item">
						<h2 className="accordion-header">
							<button
								className="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#collapseSix"
								aria-expanded="false"
								aria-controls="collapseSix">
								¿Por qué se recomienda adjuntar la hoja técnica o Datasheet de cada equipo en la solicitud?
							</button>
						</h2>
						<div id="collapseSix" className="accordion-collapse collapse" data-bs-parent="#accordionFlushHome">
							<div className="accordion-body">
								Adjuntar la hoja técnica de cada equipo es fundamental para proporcionar detalles técnicos precisos sobre los equipos a instalar o trasladar.
								Esto facilita la evaluación de los requerimientos de energía, espacio y otros aspectos necesarios para la adecuación del espacio.
							</div>
						</div>
					</div>
					<div className="accordion-item">
						<h2 className="accordion-header">
							<button
								className="accordion-button collapsed"
								type="button"
								data-bs-toggle="collapse"
								data-bs-target="#collapseSeven"
								aria-expanded="false"
								aria-controls="collapseSeven">
								¿Qué precauciones se deben tomar al instalar equipos con una sola fuente de energía según las notas del formato?
							</button>
						</h2>
						<div id="collapseSeven" className="accordion-collapse collapse" data-bs-parent="#accordionFlushHome">
							<div className="accordion-body">
								Se recomienda tomar previsiones adicionales al instalar equipos con una sola fuente de energía,
								ya que carecen de redundancia y representan un riesgo para el solicitante.
								Es importante considerar medidas de seguridad y continuidad en caso de fallos en la fuente de energía principal.
							</div>
						</div>
					</div>
				</div>


			</div>
		</>
	);
}