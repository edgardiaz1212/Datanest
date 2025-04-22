const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      currentUser: JSON.parse(localStorage.getItem("currentUser")) || [],
      descriptions: [], 
      trackerUser: JSON.parse(localStorage.getItem("trackerUser")) || null, // Específico para TrackerUsuario
      isAuthenticated: !!localStorage.getItem("trackerUser"), // O basado en un token si usas
      loading: false,
      error: null,
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

    
  },
     
    
  };
};

export default getState;
