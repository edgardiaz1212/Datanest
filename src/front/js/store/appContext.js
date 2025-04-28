// src/front/js/store/appContext.js

import React, { useState, useEffect } from "react";
import getState from "./flux.js";

// Don't change, here is where we initialize our context, by default it's just going to be null.
export const Context = React.createContext(null);

// This function injects the global store to any view/component where you want to use it, we will inject the context to layout.js, you can see it here:
// https://github.com/4GeeksAcademy/react-hello-webapp/blob/master/src/js/layout.js#L35
const injectContext = PassedComponent => {
	const StoreWrapper = props => {
		// --- MODIFICACIÓN 1: Inicializar useState con una función ---
		// Esto asegura que getState solo se llame una vez al inicio.
		const [state, setState] = useState(() => {
			return getState({
				getStore: () => state.store, // Se resolverá correctamente en el closure de setStore
				getActions: () => state.actions, // Se resolverá correctamente en el closure de setStore
				// --- MODIFICACIÓN 2: setStore mantiene la referencia de actions ---
				setStore: updatedStore =>
					setState(prevState => ({
						// Combina el store anterior con las actualizaciones
						store: Object.assign({}, prevState.store, updatedStore),
						// ¡Importante! Mantiene la misma referencia al objeto actions
						actions: prevState.actions
					}))
			});
		});

		// --- MODIFICACIÓN 3: Asegurar que useEffect se ejecute solo una vez (si es la intención) ---
		useEffect(() => {
			/**
			 * EDIT THIS!
			 * This function is the equivalent to "window.onLoad", it only runs once on the entire application lifetime
			 * you should do your ajax requests or fetch api requests here. Do not use setState() to save data in the
			 * store, instead use actions, like this:
			 **/
			// Ejemplo: state.actions.fetchEstadisticasIniciales(); // Llama aquí si necesitas cargar datos al inicio
			// state.actions.fetchAires(); // O cualquier otra acción inicial
		}, []); // <-- Array de dependencias vacío para ejecutar solo al montar

		// The initial value for the context is not null anymore, but the current state of this component,
		// the context will now have a getStore, getActions and setStore functions available, because they were declared
		// on the state of this component
		return (
			<Context.Provider value={state}>
				<PassedComponent {...props} />
			</Context.Provider>
		);
	};
	return StoreWrapper;
};

export default injectContext;
