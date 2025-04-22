const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      currentUser: JSON.parse(localStorage.getItem("currentUser")) || [],
      descriptions: [], 
      trackerUser: JSON.parse(localStorage.getItem("trackerUser")) || null, 
      isAuthenticated: !!localStorage.getItem("trackerUser"), // 
      loading: false,
      error: null,
      trackerUsers: [],
      aires: [], 
      umbrales: [], 
      umbralesLoading: false,
      umbralesError: null, 
      otrosEquiposList: [],          // List of other equipment items
      otrosEquiposLoading: false,    // Loading state for this section
      otrosEquiposError: null,       // Error state for this section
      // selectedOtroEquipoDetails: null, // Optional: Could store details here too
      mantenimientos: [],          // List of maintenance records
      mantenimientosLoading: false,// Loading state for this section
      mantenimientosError: null,
      lecturas: [],           // List of readings
      lecturasLoading: false, // Loading state for this section
      lecturasError: null,
      
    },
    actions: {
      // Use getActions to call a function within a function

      addUser: async (userData) => {
        const store = getStore();
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/addUser`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(userData),
          });

          if (response.ok) {
            const responseData = await response.json();
            setStore({ currentUser: responseData });
            console.log("User added successfully: ", responseData);
            return responseData;
          } else {
            console.log("Error adding user:", response.statusText);
          }
        } catch (error) {
          console.log("Error adding user:", error.message);
        }
      },
      checkemails: async (email) => {
        const store = getStore();
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/user/email/${email}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const responseData = await response.json();
            console.log(responseData.message); // Si el correo está disponible, lo muestra
            return true; // Correo disponible
          } else {
            const responseData = await response.json();
            console.log(responseData.message); // Si ya está registrado
            return false; // Correo no disponible
          }
        } catch (error) {
          console.log("Error checking email:", error.message);
        }
      },
      getCurrentUser: () => {
        return store.currentUser;
      },
      getUserData: async () => {
        const store = getStore();
        const currentUser = store.currentUser;

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/user/${currentUser.user_id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const responseData = await response.json();
            setStore({ userData: responseData });
            localStorage.setItem("userData", JSON.stringify(responseData));
          } else {
            console.log("Error fetching user data:", response.status);
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      },
      deleteUserData: async () => {
        const store = getStore();
        const actions = getActions();
        
        try {
          if (!store.currentUser || !store.currentUser.user_id) {
            console.error("No hay usuario activo");
            return { ok: false, message: "No hay usuario activo" };
        }
          
          let response = await fetch(`${process.env.BACKEND_URL}/delete_user_data/${store.currentUser.user_id}`, {
            method: 'DELETE',
          });
      
          if (response.ok) {
             // Limpiar el estado
            setStore({
              ...store,
              currentUser: null,
              descriptions: []
            });
          } else {
            console.log("Error en la solicitud de eliminación",response.statusText);
          }
      
          return response;
        } catch (error) {
          console.log("Error borrando datos de usuario", error);
        }
      },
      addDescription: async (descriptionData) => {
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/addDescription`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(descriptionData),
          });
      
          if (!response.ok) throw new Error("Error creating description");
      
          const newDescription = await response.json();
          await getActions().getDescriptionsByUser(); // Obtener descripciones actualizadas
          return newDescription;
        } catch (error) {
          console.error("Error in addDescription action:", error);
          throw error;
        }
      },
      addRack: async (rack) => {
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/addRack`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(rack),
          });

          if (response.ok) {
            const responseData = await response.json();
            return responseData;
          } else {
            console.log("Error adding rack:", response.statusText);
          }
        } catch (error) {
          console.log("Error adding rack:", error.message);
        }
      },
      addEquipment: async (equipment) => {
        try {
          console.log("Sending equipment data:", equipment);
          const response = await fetch(
            `${process.env.BACKEND_URL}/addEquipment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(equipment),
            }
          );

          if (response.ok) {
            const responseData = await response.json();
            return responseData;
          } else {
            const errorData = await response.json();
            console.log("Error adding equipment:", response.statusText, errorData);
            throw new Error(
              `Error adding equipment: ${errorData.msg || "Unexpected response from server"}`
            );
          }
        } catch (error) {
          console.log("Error adding equipment:", error.message);
          throw new Error(
            "Error adding equipment: Connection error or request error"
          );
        }
      },
      getDescriptionsByUser: async (user_id) => {
        const store = getStore();
    
        if (!process.env.BACKEND_URL) {
            console.error("BACKEND_URL is not defined");
            return { error: true, message: "Backend URL is not defined" };
        }
    
        try {
           
            const response = await fetch(`${process.env.BACKEND_URL}/description/${user_id || ''}`, {

                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            });
    
        if (!response.ok || user_id === undefined) {
            console.log(`Failed to fetch descriptions: ${response.status} - ${response.statusText}`);
            return { error: true, message: "User ID is undefined or fetch failed." };

                return { error: true, message: `Failed to fetch descriptions: ${response.statusText}` };
            }
    
            const responseData = await response.json();
    
            if (responseData.message) {
                console.log("Message from backend:", responseData.message);
                setStore({ descriptions: [] }); // Limpiar estado global
                return []; // Retornar lista vacía si no hay descripciones
            }
    
            setStore({ descriptions: responseData });
            console.log("Flux description data:", responseData);
            return responseData;
    
        } catch (error) {
            console.log("Error fetching descriptions:", error);
            return { error: true, message: "Error fetching descriptions", details: error.message };
        }
    },
      getRackByDescriptionId: async (descriptionId) => {
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/rack/${descriptionId}`
          );
          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.error("Error fetching rack data:", error);
        }
        return {};
      },
      getEquipmentByDescriptionId: async (descriptionId) => {
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/equipment/${descriptionId}`
          );
          if (response.ok) {
            return await response.json();
          }
        } catch (error) {
          console.error("Error fetching equipment data:", error);
        }
        return {};
      },
      deleteDescription: async (id) => {
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/descriptions/${id}`,
            {
              method: "DELETE",
            }
          );
          if (response.ok) {
            const updatedDescriptions = getStore().descriptions.filter(
              (desc) => desc.id !== id
            );
            setStore({ descriptions: updatedDescriptions });
          } else {
            console.error("Failed to delete description");
          }
        } catch (error) {
          console.error("Error deleting description:", error);
        }
      },
      setDescriptions: (descriptions) => {
        setStore((prevState) => ({
          ...prevState,
          descriptions: descriptions,
        }))
        console.log("descrip flux",descriptions);
      },
      editDescription: async (descriptionId, updatedDescription) => {
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/editDescription/${descriptionId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedDescription),
            }
          );
          if (response.ok) {
            const responseData = await response.json();
            const updatedDescriptions = getStore().descriptions.map((desc) =>
              desc.id === descriptionId ? responseData : desc
            );
            setStore({ descriptions: updatedDescriptions });
            return responseData;
          } else {
            console.log("Error editing description:", response.statusText);
          }
        } catch (error) {
          console.log("Error editing description:", error.message);
        }
      },
      editRack: async (rackId, updatedRack) => {
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/editRack/${rackId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedRack),
            }
          );

          if (response.ok) {
            const responseData = await response.json();
            return responseData;
          } else {
            console.log("Error editing rack:", response.statusText);
          }
        } catch (error) {
          console.log("Error editing rack:", error.message);
        }
      },
      editEquipment: async (equipmentId, updatedEquipment) => {
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/editEquipment/${equipmentId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(updatedEquipment),
            }
          );

          if (response.ok) {
            const responseData = await response.json();
            return responseData;
          } else {
            console.log("Error editing equipment:", response.statusText);
          }
        } catch (error) {
          console.log("Error editing equipment:", error.message);
        }
      },
     //Datos para aircontrol
     loginTrackerUser: async (identifier, password) => {
      const store = getStore();
      setStore({ loading: true, error: null }); // Inicia estado de carga y limpia errores previos

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/tracker/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          // El backend espera 'identifier' y 'password'
          body: JSON.stringify({ identifier, password }), 
        });

        const responseData = await response.json();

        if (response.ok) { // Login exitoso (status 200 OK)
          // Guarda el usuario logueado en el store y localStorage
          setStore({ 
            trackerUser: responseData.user, 
            isAuthenticated: true, 
            loading: false,
            error: null 
          });
          localStorage.setItem("trackerUser", JSON.stringify(responseData.user));
          // Opcional: guardar token si el backend lo devuelve
          // if (responseData.token) {
          //   localStorage.setItem("token", responseData.token);
          // }
          console.log("Tracker login successful:", responseData.user);
          return true; // Indica éxito
        } else { // Error en el login (401, 400, 500, etc.)
          setStore({ 
            error: responseData.msg || "Error desconocido en el login", 
            isAuthenticated: false, 
            loading: false,
            trackerUser: null // Limpia cualquier usuario previo
          });
          localStorage.removeItem("trackerUser"); // Limpia localStorage
          // localStorage.removeItem("token"); // Limpia token si lo usas
          console.error("Tracker login failed:", responseData.msg);
          return false; // Indica fallo
        }
      } catch (error) {
        console.error("Network or other error during tracker login:", error);
        setStore({ 
          error: "Error de conexión o del servidor al intentar iniciar sesión.", 
          isAuthenticated: false, 
          loading: false,
          trackerUser: null 
        });
        localStorage.removeItem("trackerUser");
        // localStorage.removeItem("token");
        return false; // Indica fallo
      }
    },
    /**
     * Limpia el mensaje de error del estado.
     */
    clearAuthError: () => {
      setStore({ error: null });
    },

    /**
     * Cierra la sesión del TrackerUsuario.
     */
    logoutTrackerUser: () => {
      setStore({ 
        trackerUser: null, 
        isAuthenticated: false, 
        error: null 
      });
      localStorage.removeItem("trackerUser");
      // localStorage.removeItem("token"); // No olvides limpiar el token
      console.log("Tracker user logged out");
      // Podrías añadir lógica para redirigir al login aquí si es necesario
    },
    //para pagina principal
    registerTrackerUser: async (userData) => {
      const store = getStore();
      setStore({ loading: true, error: null }); // Inicia carga y limpia errores

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/tracker/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(userData), // Envía todos los datos requeridos
        });

        const responseData = await response.json();

        if (response.ok) { // Registro exitoso (status 201 Created)
          setStore({
            loading: false,
            error: null
            // No actualizamos trackerUser ni isAuthenticated aquí, el usuario debe hacer login después
          });
          console.log("Tracker registration successful:", responseData);
          return true; // Indica éxito
        } else { // Error en el registro (400, 409, 500, etc.)
          setStore({
            error: responseData.msg || "Error desconocido durante el registro",
            loading: false,
          });
          console.error("Tracker registration failed:", responseData.msg);
          return false; // Indica fallo
        }
      } catch (error) {
        console.error("Network or other error during tracker registration:", error);
        setStore({
          error: "Error de conexión o del servidor al intentar registrar.",
          loading: false,
        });
        return false; // Indica fallo
      }
    },
    fetchTrackerUsers: async () => {
      const store = getStore();
      // Solo admin puede ver la lista completa (podrías añadir esta lógica aquí o en el componente)
      if (store.trackerUser?.rol !== 'admin') {
        setStore({ error: "Acceso denegado.", loading: false, trackerUsers: [] });
        return;
      }
      setStore({ loading: true, error: null });
      try {
        // Llama al endpoint GET /tracker/users (que ya existe en tu backend)
        // Pasa 'activos=false' si quieres ver todos, incluyendo inactivos
        const response = await fetch(`${process.env.BACKEND_URL}/tracker/users?activos=false`);
        const data = await response.json();

        if (response.ok) {
          setStore({ trackerUsers: data, loading: false });
        } else {
          setStore({ error: data.msg || "Error al cargar usuarios", loading: false, trackerUsers: [] });
          console.error("Error fetching tracker users:", data.msg);
        }
      } catch (error) {
        console.error("Network error fetching tracker users:", error);
        setStore({ error: "Error de red al cargar usuarios.", loading: false, trackerUsers: [] });
      }
    },

    //Actualiza los datos de un TrackerUsuario específico (para Admin).
    updateTrackerUser: async (userId, updatedData) => {
      const store = getStore();
      const actions = getActions();
      setStore({ loading: true, error: null }); // Puedes usar un loading específico si prefieres

      try {
        // Llama al endpoint PUT /tracker/user/<id> (que ya existe en tu backend)
        const response = await fetch(`${process.env.BACKEND_URL}/tracker/user/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Aquí podrías añadir un token de autenticación si es necesario
            // "Authorization": `Bearer ${store.token}`
          },
          body: JSON.stringify(updatedData),
        });

        const responseData = await response.json();

        if (response.ok) {
          setStore({ loading: false, error: null });
          // Actualiza la lista local de usuarios en el store
          const updatedList = store.trackerUsers.map(user =>
            user.id === userId ? { ...user, ...responseData } : user // Asume que responseData es el usuario actualizado
          );
          setStore({ trackerUsers: updatedList });
          console.log("Tracker user updated successfully:", responseData);
          return true; // Indica éxito
        } else {
          setStore({ error: responseData.msg || "Error al actualizar usuario", loading: false });
          console.error("Error updating tracker user:", responseData.msg);
          return false; // Indica fallo
        }
      } catch (error) {
        console.error("Network error updating tracker user:", error);
        setStore({ error: "Error de red al actualizar usuario.", loading: false });
        return false; // Indica fallo
      }
    },
    //   Agrega un nuevo TrackerUsuario (realizado por un Admin/Supervisor).

    addTrackerUserByAdmin: async (newUserData) => {
      const store = getStore();
      const actions = getActions();
      // Llama a la acción de registro existente
      const success = await actions.registerTrackerUser(newUserData);
      if (success) {
        // Si el registro fue exitoso, refresca la lista de usuarios
        await actions.fetchTrackerUsers();
      }
      // El manejo de loading/error ya está en registerTrackerUser
      return success;
    },
    fetchAires: async () => {
      const store = getStore();
      // Avoid refetching if already loaded, unless forced
      // if (store.aires.length > 0) return true;

      // Set loading specific to aires if needed, or rely on umbralesLoading
      // setStore({ airesLoading: true });
      try {
        // --- IMPORTANT: Ensure you have a GET /aires endpoint in routes.py ---
        // This endpoint should return a list like: [{id, nombre, ubicacion}, ...]
        const response = await fetch(`${process.env.BACKEND_URL}/aires`); // Adjust endpoint if different
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || `Error fetching aires: ${response.status}`);
        }
        const data = await response.json();
        // Assuming the backend returns the list directly or adjust as needed (e.g., data.data)
        setStore({ aires: data || [] });
        return true;
      } catch (error) {
        console.error("Error in fetchAires:", error);
        // Set specific aires error state if needed
        // setStore({ airesError: error.message, airesLoading: false });
        // Propagate error to the caller (fetchUmbrales)
        throw error;
      } finally {
        // setStore({ airesLoading: false });
      }
    },

    /**
     * Fetches threshold configurations. Also fetches aires if needed.
     */
    fetchUmbrales: async () => {
      const store = getStore();
      const actions = getActions();
      setStore({ umbralesLoading: true, umbralesError: null });

      try {
        // 1. Ensure aires are loaded first
        await actions.fetchAires(); // fetchAires will throw if it fails

        // 2. Fetch umbrales
        const umbralesResponse = await fetch(`${process.env.BACKEND_URL}/umbrales`);
        if (!umbralesResponse.ok) {
          const errorData = await umbralesResponse.json();
          throw new Error(errorData.msg || `Error fetching umbrales: ${umbralesResponse.status}`);
        }
        const umbralesData = await umbralesResponse.json();

        // 3. Process umbrales to add aire_nombre/ubicacion (if needed, backend might do this)
        // Assuming backend's /umbrales already returns 'aire_nombre' via serialize_with_details
        // If not, you'd map here using store.aires:
        /*
        const airesMap = store.aires.reduce((acc, aire) => {
          acc[aire.id] = aire;
          return acc;
        }, {});
        const processedUmbrales = (umbralesData || []).map(umbral => {
          if (!umbral.es_global && umbral.aire_id && airesMap[umbral.aire_id]) {
            return {
              ...umbral,
              aire_nombre: airesMap[umbral.aire_id].nombre,
              ubicacion: airesMap[umbral.aire_id].ubicacion,
            };
          }
          return umbral;
        });
        setStore({ umbrales: processedUmbrales, umbralesLoading: false });
        */

        // Assuming backend provides details via serialize_with_details
        setStore({ umbrales: umbralesData || [], umbralesLoading: false });

      } catch (error) {
        console.error("Error in fetchUmbrales:", error);
        setStore({ umbralesError: error.message || "Error cargando datos de umbrales.", umbralesLoading: false });
      }
    },

    /**
     * Adds a new threshold configuration.
     * @param {object} formData - The data for the new threshold.
     * @returns {boolean} - True on success, false on failure.
     */
    addUmbral: async (formData) => {
      const actions = getActions();
      setStore({ umbralesLoading: true, umbralesError: null }); // Use loading state

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/umbrales`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.msg || `Error adding umbral: ${response.status}`);
        }

        // Refresh the list to get the newly added item with potential details
        await actions.fetchUmbrales(); // fetchUmbrales handles loading state reset
        return true; // Indicate success

      } catch (error) {
        console.error("Error in addUmbral:", error);
        setStore({ umbralesError: error.message || "Error al agregar el umbral.", umbralesLoading: false });
        return false; // Indicate failure
      }
    },

    /**
     * Updates an existing threshold configuration.
     * @param {number} umbralId - The ID of the threshold to update.
     * @param {object} formData - The updated data.
     * @returns {boolean} - True on success, false on failure.
     */
    updateUmbral: async (umbralId, formData) => {
      const actions = getActions();
      setStore({ umbralesLoading: true, umbralesError: null }); // Use loading state

      try {
        // Backend route doesn't allow changing es_global or aire_id,
        // so we only send allowed fields.
        const updatePayload = {
          nombre: formData.nombre,
          temp_min: formData.temp_min,
          temp_max: formData.temp_max,
          hum_min: formData.hum_min,
          hum_max: formData.hum_max,
          notificar_activo: formData.notificar_activo,
        };

        const response = await fetch(`${process.env.BACKEND_URL}/umbrales/${umbralId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatePayload),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.msg || `Error updating umbral: ${response.status}`);
        }

        // Refresh the list to reflect changes
        await actions.fetchUmbrales(); // fetchUmbrales handles loading state reset
        return true; // Indicate success

      } catch (error) {
        console.error("Error in updateUmbral:", error);
        setStore({ umbralesError: error.message || "Error al actualizar el umbral.", umbralesLoading: false });
        return false; // Indicate failure
      }
    },

    /**
     * Deletes a threshold configuration.
     * @param {number} umbralId - The ID of the threshold to delete.
     * @returns {boolean} - True on success, false on failure.
     */
    deleteUmbral: async (umbralId) => {
      const store = getStore();
      // Optimistic UI update: Remove immediately, then handle error if needed
      const originalUmbrales = [...store.umbrales];
      const updatedUmbrales = originalUmbrales.filter(u => u.id !== umbralId);
      setStore({ umbrales: updatedUmbrales, umbralesError: null });

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/umbrales/${umbralId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          // Rollback UI update on error
          setStore({ umbrales: originalUmbrales });
          const errorData = await response.json().catch(() => ({})); // Try to get error msg
          throw new Error(errorData.msg || `Error deleting umbral: ${response.status}`);
        }

        // If response is 204 No Content, it's successful
        console.log(`Umbral ${umbralId} deleted successfully.`);
        return true; // Indicate success

      } catch (error) {
        console.error("Error in deleteUmbral:", error);
        // Rollback UI update if not already done (e.g., network error)
        setStore({ umbrales: originalUmbrales, umbralesError: error.message || "Error al eliminar el umbral." });
        return false; // Indicate failure
      }
    },

    /**
     * Clears the specific error message for umbrales.
     */
    clearUmbralesError: () => {
      setStore({ umbralesError: null });
    },
    fetchOtrosEquipos: async () => {
      setStore({ otrosEquiposLoading: true, otrosEquiposError: null });
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/otros_equipos`); // Uses the existing endpoint
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || `Error fetching otros equipos: ${response.status}`);
        }
        const data = await response.json();
        // Assuming the backend returns the list directly
        setStore({ otrosEquiposList: data || [], otrosEquiposLoading: false });
      } catch (error) {
        console.error("Error in fetchOtrosEquipos:", error);
        setStore({ otrosEquiposError: error.message || "Error cargando la lista de equipos.", otrosEquiposLoading: false });
      }
    },

    /**
     * Fetches the full details of a single "Otro Equipo".
     * Note: This might be handled locally in the component if preferred,
     * especially if details are only needed temporarily for modals.
     * If kept here, add 'selectedOtroEquipoDetails' to the store.
     * @param {number} equipoId
     * @returns {object | null} - The detailed equipment object or null on error.
     */
    fetchOtroEquipoDetails: async (equipoId) => {
      // setStore({ /* detailsLoading: true, detailsError: null */ }); // Optional specific loading/error
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/otros_equipos/${equipoId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || `Error fetching details for equipo ${equipoId}: ${response.status}`);
        }
        const data = await response.json();
        // setStore({ selectedOtroEquipoDetails: data, /* detailsLoading: false */ });
        return data; // Return data for the component to use
      } catch (error) {
        console.error("Error in fetchOtroEquipoDetails:", error);
        // setStore({ /* detailsError: error.message, detailsLoading: false */ });
        // Propagate error or handle globally
        throw error; // Let the caller handle the error display
      }
    },

    /**
     * Adds a new "Otro Equipo".
     * @param {object} formData - Data for the new equipment.
     * @returns {boolean} - True on success, false on failure.
     */
    addOtroEquipo: async (formData) => {
      const actions = getActions();
      setStore({ otrosEquiposLoading: true, otrosEquiposError: null }); // Indicate loading

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/otros_equipos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.msg || `Error adding otro equipo: ${response.status}`);
        }

        // Refresh the list after adding
        await actions.fetchOtrosEquipos(); // This resets loading/error states
        return true; // Success

      } catch (error) {
        console.error("Error in addOtroEquipo:", error);
        setStore({ otrosEquiposError: error.message || "Error al agregar el equipo.", otrosEquiposLoading: false });
        return false; // Failure
      }
    },

    /**
     * Updates an existing "Otro Equipo".
     * @param {number} equipoId - ID of the equipment to update.
     * @param {object} formData - Updated data.
     * @returns {boolean} - True on success, false on failure.
     */
    updateOtroEquipo: async (equipoId, formData) => {
      const actions = getActions();
      setStore({ otrosEquiposLoading: true, otrosEquiposError: null }); // Indicate loading

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/otros_equipos/${equipoId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData), // Send the whole form data, backend handles allowed fields
        });
        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.msg || `Error updating otro equipo: ${response.status}`);
        }

        // Refresh the list after updating
        await actions.fetchOtrosEquipos(); // This resets loading/error states
        return true; // Success

      } catch (error) {
        console.error("Error in updateOtroEquipo:", error);
        setStore({ otrosEquiposError: error.message || "Error al actualizar el equipo.", otrosEquiposLoading: false });
        return false; // Failure
      }
    },

    /**
     * Deletes an "Otro Equipo".
     * @param {number} equipoId - ID of the equipment to delete.
     * @returns {boolean} - True on success, false on failure.
     */
    deleteOtroEquipo: async (equipoId) => {
      const store = getStore();
      // Optimistic UI update
      const originalList = [...store.otrosEquiposList];
      const updatedList = originalList.filter(eq => eq.id !== equipoId);
      setStore({ otrosEquiposList: updatedList, otrosEquiposError: null });

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/otros_equipos/${equipoId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          setStore({ otrosEquiposList: originalList }); // Rollback on error
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.msg || `Error deleting otro equipo: ${response.status}`);
        }

        // Success (204 No Content) - UI already updated
        console.log(`Otro Equipo ${equipoId} deleted successfully.`);
        return true;

      } catch (error) {
        console.error("Error in deleteOtroEquipo:", error);
        setStore({ otrosEquiposList: originalList, otrosEquiposError: error.message || "Error al eliminar el equipo." });
        return false; // Failure
      }
    },

    /**
     * Clears the specific error message for "Otros Equipos".
     */
    clearOtrosEquiposError: () => {
      setStore({ otrosEquiposError: null });
    },
    fetchMantenimientos: async (filters = {}) => {
      const actions = getActions();
      setStore({ mantenimientosLoading: true, mantenimientosError: null });

      try {
        // 1. Ensure related equipment is loaded (Aires and OtrosEquipos)
        // These actions should handle their own loading/error states or return promises
        await actions.fetchAires(); // Assuming this exists and works
        await actions.fetchOtrosEquipos(); // Assuming this exists and works

        // 2. Build URL with filters
        let url = `${process.env.BACKEND_URL}/mantenimientos`;
        const queryParams = new URLSearchParams();
        if (filters.aire_id) {
          queryParams.append('aire_id', filters.aire_id);
        }
        if (filters.otro_equipo_id) { // Add filter for other equipment if needed later
          queryParams.append('otro_equipo_id', filters.otro_equipo_id);
        }
        const queryString = queryParams.toString();
        if (queryString) {
          url += `?${queryString}`;
        }

        // 3. Fetch maintenances
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.msg || `Error fetching mantenimientos: ${response.status}`);
        }
        const data = await response.json();

        // 4. Store the data (assuming backend provides details via serialize_with_details)
        setStore({ mantenimientos: data || [], mantenimientosLoading: false });

      } catch (error) {
        console.error("Error in fetchMantenimientos:", error);
        setStore({ mantenimientosError: error.message || "Error cargando los registros de mantenimiento.", mantenimientosLoading: false });
      }
    },

    /**
     * Adds a new maintenance record.
     * Handles multipart/form-data for potential image upload.
     * @param {FormData} formData - The FormData object containing maintenance data and optional image file.
     * @returns {boolean} - True on success, false on failure.
     */
    addMantenimiento: async (formData) => {
      const actions = getActions();
      // Use a specific loading state if preferred, or the general one
      setStore({ mantenimientosLoading: true, mantenimientosError: null });

      try {
        // Determine the correct endpoint based on which ID is present in formData
        let url;
        if (formData.get('aire_id')) {
          url = `${process.env.BACKEND_URL}/aires/${formData.get('aire_id')}/mantenimientos`;
          // Remove the other ID if present, backend might ignore it but cleaner not to send
          formData.delete('otro_equipo_id');
        } else if (formData.get('otro_equipo_id')) {
          url = `${process.env.BACKEND_URL}/otros_equipos/${formData.get('otro_equipo_id')}/mantenimientos`;
          formData.delete('aire_id');
        } else {
          // Should be caught by component validation, but double-check
          throw new Error("No equipment ID (aire_id or otro_equipo_id) provided.");
        }


        const response = await fetch(url, {
          method: "POST",
          // Do NOT set Content-Type header, browser does it for FormData
          body: formData,
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.msg || `Error adding mantenimiento: ${response.status}`);
        }

        // Refresh the list to include the new record
        // Pass the current filter to refetch correctly
        const store = getStore();
        const currentFilter = {};
        // Reconstruct filter based on what was submitted or current component state if available
        // This part might need refinement depending on how filters are stored/passed
        // For simplicity, just refetch all for now, or pass filter from component
        await actions.fetchMantenimientos(/* pass current filter here if needed */);
        return true; // Success

      } catch (error) {
        console.error("Error in addMantenimiento:", error);
        setStore({ mantenimientosError: error.message || "Error al guardar el mantenimiento.", mantenimientosLoading: false });
        return false; // Failure
      }
    },

    /**
     * Deletes a maintenance record.
     * @param {number} mantenimientoId - ID of the record to delete.
     * @returns {boolean} - True on success, false on failure.
     */
    deleteMantenimiento: async (mantenimientoId) => {
      const store = getStore();
      const actions = getActions();
      // Optimistic UI update
      const originalList = [...store.mantenimientos];
      const updatedList = originalList.filter(m => m.id !== mantenimientoId);
      setStore({ mantenimientos: updatedList, mantenimientosError: null });

      try {
        const response = await fetch(`${process.env.BACKEND_URL}/mantenimientos/${mantenimientoId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          setStore({ mantenimientos: originalList }); // Rollback
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.msg || `Error deleting mantenimiento: ${response.status}`);
        }

        // Success (204 No Content) - UI already updated
        console.log(`Mantenimiento ${mantenimientoId} deleted successfully.`);
        // Optional: Refetch if optimistic update isn't sufficient
        // await actions.fetchMantenimientos(/* pass filter */);
        return true;

      } catch (error) {
        console.error("Error in deleteMantenimiento:", error);
        setStore({ mantenimientos: originalList, mantenimientosError: error.message || "Error al eliminar el mantenimiento." });
        return false; // Failure
      }
    },

    /**
     * Fetches the Base64 encoded image for a maintenance record.
     * Note: Consider if fetching the raw image URL/data via send_file is better.
     * This action returns the data URL directly.
     * @param {number} mantenimientoId
     * @returns {string | null} - Base64 data URL or null on error/no image.
     */
    fetchMantenimientoImagenBase64: async (mantenimientoId) => {
      // setStore({ /* imageLoading: true, imageError: null */ }); // Optional specific state
      try {
        const response = await fetch(`${process.env.BACKEND_URL}/mantenimientos/${mantenimientoId}/imagen_base64`);
        if (!response.ok) {
          const errorData = await response.json();
          // Handle 404 (no image) gracefully vs other errors
          if (response.status === 404) {
            console.log(`No image found for mantenimiento ${mantenimientoId}`);
            return null;
          }
          throw new Error(errorData.msg || `Error fetching image: ${response.status}`);
        }
        const data = await response.json();
        return data.imagen_base64 || null; // Return the data URL
      } catch (error) {
        console.error("Error in fetchMantenimientoImagenBase64:", error);
        // setStore({ /* imageError: error.message */ });
        return null; // Indicate error or no image
      } finally {
        // setStore({ /* imageLoading: false */ });
      }
    },

    /**
     * Clears the specific error message for "Mantenimientos".
     */
    clearMantenimientosError: () => {
      setStore({ mantenimientosError: null });
    },
    fetchLecturas: async (filters = {}) => {
      const actions = getActions();
      const store = getStore(); // Get store to access aires later
      setStore({ lecturasLoading: true, lecturasError: null });

      try {
        // 1. Ensure related data is loaded (Aires and Umbrales)
        // These actions should handle their own loading/errors
        await actions.fetchAires(); // Assuming this exists
        await actions.fetchUmbrales(); // Assuming this exists

        // 2. Determine URL based on filter
        let url;
        if (filters.aire_id) {
          // Use the endpoint specific to an aire
          url = `${process.env.BACKEND_URL}/aires/${filters.aire_id}/lecturas`;
        } else {
          // Need an endpoint to get ALL readings if no filter is applied
          // Assuming '/lecturas/all' or similar exists, or adjust logic
          // For now, let's assume we fetch all if no filter, adjust if needed
           console.warn("Fetching all readings - ensure backend supports this or implement pagination.");
           url = `${process.env.BACKEND_URL}/lecturas/all`; // *** ADJUST or REMOVE if backend doesn't support fetching all ***
           // If fetching all isn't supported/desired without filter, maybe set an error or empty list:
           // setStore({ lecturas: [], lecturasLoading: false, lecturasError: "Seleccione un aire para ver lecturas." });
           // return;
        }

         // *** TEMPORARY FIX if /lecturas/all doesn't exist: Fetch first aire's readings if no filter ***
         if (!filters.aire_id && store.aires.length > 0) {
             console.warn("No filter selected, fetching readings for the first AC:", store.aires[0].id);
             url = `${process.env.BACKEND_URL}/aires/${store.aires[0].id}/lecturas`;
         } else if (!filters.aire_id && store.aires.length === 0) {
              console.warn("No filter selected and no ACs loaded.");
              setStore({ lecturas: [], lecturasLoading: false });
              return; // Exit if no ACs to fetch from
         }
         // *** END TEMPORARY FIX ***


        // 3. Fetch readings
        const response = await fetch(url);
        if (!response.ok) {
          const errorData = await response.json();
          // Handle 404 specifically if fetching by aire_id
          if (response.status === 404 && filters.aire_id) {
               throw new Error(`Aire acondicionado con ID ${filters.aire_id} no encontrado o sin lecturas.`);
          }
          throw new Error(errorData.msg || `Error fetching lecturas: ${response.status}`);
        }
        const data = await response.json();

        // 4. Process and store readings (add aire_nombre, ubicacion)
        const airesMap = store.aires.reduce((acc, aire) => {
          acc[aire.id] = aire;
          return acc;
        }, {});

        const processedLecturas = (data || []).map(lectura => {
          const aire = airesMap[lectura.aire_id];
          return {
            ...lectura,
            aire_nombre: aire?.nombre || 'Desconocido',
            ubicacion: aire?.ubicacion || 'Desconocida',
          };
        }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()); // Sort descending

        setStore({ lecturas: processedLecturas, lecturasLoading: false });

      } catch (error) {
        console.error("Error in fetchLecturas:", error);
        setStore({ lecturasError: error.message || "Error cargando las lecturas.", lecturasLoading: false });
      }
    },

    /**
     * Adds a new reading record for a specific AC.
     * @param {number} aireId - The ID of the air conditioner.
     * @param {object} lecturaData - Object with fecha_hora, temperatura, humedad.
     * @returns {boolean} - True on success, false on failure.
     */
    addLectura: async (aireId, lecturaData) => {
      const actions = getActions();
      setStore({ lecturasLoading: true, lecturasError: null }); // Indicate activity

      try {
        // Use the correct endpoint: POST /aires/<id>/lecturas
        const url = `${process.env.BACKEND_URL}/aires/${aireId}/lecturas`;

        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Backend expects 'fecha', 'temperatura', 'humedad'
          body: JSON.stringify({
              fecha: lecturaData.fecha_hora, // Send combined datetime string
              temperatura: lecturaData.temperatura,
              humedad: lecturaData.humedad
          }),
        });

        const responseData = await response.json();

        if (!response.ok) {
          throw new Error(responseData.msg || `Error adding lectura: ${response.status}`);
        }

        // Refresh the list for the currently filtered AC (or all if no filter)
        const store = getStore();
        const currentFilter = {};
        // This assumes the component's 'filtroAire' state is the source of truth
        // We need a way to access it or pass it here.
        // For now, just refetch all or based on the added aireId if it matches filter.
        // A better approach might be to update the store directly if backend returns the new object.

        // Option 1: Refetch based on current filter (needs access to filter state)
        // const currentAireFilter = getStore().lecturasFilterAireId; // Need to store filter in store?
        // await actions.fetchLecturas({ aire_id: currentAireFilter });

        // Option 2: Add directly to store if response includes the new object
         if (responseData && responseData.id) {
             const aire = store.aires.find(a => a.id === responseData.aire_id);
             const newLecturaProcessed = {
                 ...responseData,
                 aire_nombre: aire?.nombre || 'Desconocido',
                 ubicacion: aire?.ubicacion || 'Desconocida',
             };
             const updatedLecturas = [newLecturaProcessed, ...store.lecturas]
                 .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
             setStore({ lecturas: updatedLecturas, lecturasLoading: false });
         } else {
             // Fallback: Refetch all for the currently filtered AC
             await actions.fetchLecturas({ aire_id: aireId }); // Refetch for the AC just added to
         }


        return true; // Success

      } catch (error) {
        console.error("Error in addLectura:", error);
        setStore({ lecturasError: error.message || "Error al guardar la lectura.", lecturasLoading: false });
        return false; // Failure
      }
    },

    /**
     * Deletes a reading record.
     * @param {number} lecturaId - ID of the reading to delete.
     * @returns {boolean} - True on success, false on failure.
     */
    deleteLectura: async (lecturaId) => {
      const store = getStore();
      const actions = getActions();
      // Optimistic UI update
      const originalList = [...store.lecturas];
      const updatedList = originalList.filter(l => l.id !== lecturaId);
      setStore({ lecturas: updatedList, lecturasError: null });

      try {
        // Use the correct endpoint: DELETE /lecturas/<id>
        const response = await fetch(`${process.env.BACKEND_URL}/lecturas/${lecturaId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          setStore({ lecturas: originalList }); // Rollback
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.msg || `Error deleting lectura: ${response.status}`);
        }

        // Success (204 No Content) - UI already updated
        console.log(`Lectura ${lecturaId} deleted successfully.`);
        // Optional: Refetch if needed
        // await actions.fetchLecturas({ aire_id: store.lecturasFilterAireId });
        return true;

      } catch (error) {
        console.error("Error in deleteLectura:", error);
        setStore({ lecturas: originalList, lecturasError: error.message || "Error al eliminar la lectura." });
        return false; // Failure
      }
    },
    clearLecturasError: () => {
      setStore({ lecturasError: null });
    },
  },
     
    
  };
};

export default getState;
