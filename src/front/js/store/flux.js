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

    
  },
     
    
  };
};

export default getState;
