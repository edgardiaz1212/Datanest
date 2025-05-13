const getState = ({ getStore, getActions, setStore }) => {
  // Helper para obtener el token del store o localStorage
  const getToken = () => {
    const store = getStore();
    return store.token || localStorage.getItem("token");
  };

  // Helper para crear las cabeceras de autenticación
  const getAuthHeaders = (includeContentType = true) => {
    const headers = {};
    if (includeContentType) {
      headers["Content-Type"] = "application/json";
    }
    // Usa getToken() que ya está definido
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  return {
    store: {
      currentUser: JSON.parse(localStorage.getItem("currentUser")) || [],
      descriptions: [],
      // --- Auth State ---
      token: localStorage.getItem("token") || null, // <--- Almacena el token
      trackerUser: JSON.parse(localStorage.getItem("trackerUser")) || null,
      isAuthenticated: !!localStorage.getItem("token"), // <--- Basado en el token
      loading: false,
      error: null,
      // --- Tracker Users ---
      trackerUsers: [],
      // --- Aires ---
      aires: [],
      airesLoading: false,
      airesError: null,
      // --- Umbrales ---
      umbrales: [],
      umbralesLoading: false,
      umbralesError: null,
      // --- Otros Equipos ---
      otrosEquiposList: [],
      otrosEquiposLoading: false,
      otrosEquiposError: null,
      // --- Mantenimientos ---
      mantenimientos: [],
      mantenimientosLoading: false,
      mantenimientosPaginationInfo: {
        total_items: 0,
        total_pages: 0,
        current_page: 1,
        per_page: 20,
        has_next: false,
        has_prev: false,
      },
      mantenimientosError: null,
      // --- Lecturas ---
      lecturas: [],
      lecturasLoading: false,
      lecturasError: null,
      lecturasUbicacion: [],
      lecturasUbicacionLoading: false,
      lecturasUbicacionError: null,
      lecturasPaginationInfo: {
        total_items: 0,
        total_pages: 0,
        current_page: 1,
        per_page: 20, // Debe coincidir con el default del backend o el que se use
        has_next: false,
        has_prev: false,
      },
      // --- Estadisticas ---
      estadisticasGenerales: null,
      estadisticasAire: null,
      estadisticasUbicacion: [],
      ubicaciones: [],
      _rawLecturasGenerales: [], // For general charts
      _rawLecturasAire: [], // For specific AC charts
      statsLoadingGeneral: false,
      statsLoadingAire: false,
      statsLoadingUbicacion: false,
      statsLoadingChartsGeneral: false,
      statsLoadingChartsAire: false,
      statsLoadingUmbrales: false,
      statsError: null,
      // --- Dashboard ---
      dashboardResumen: null, // <--- Añadido para el dashboard
      dashboardLoading: false,
      dashboardError: null,
      // --- Proveedores State ---
      proveedores: [],
      proveedoresLoading: false,
      proveedoresError: null,

      // --- Contactos State ---
      contactos: [], // Almacenará los contactos del proveedor seleccionado
      contactosLoading: false,
      contactosError: null,
      // --- Actividades Proveedor State ---
      actividadesProveedor: [], // Almacenará las actividades del proveedor seleccionado o todas
      actividadesLoading: false,
      actividadesError: null,
      // --- Documentos Externos State ---
      documentos: [],
      documentosLoading: false,
      documentosError: null,
      uploadingDocumento: false, // Estado específico para la carga
      uploadDocumentoError: null,
      uploadDocumentoSuccess: null,
      deletingDocumentoId: null, // Para saber qué doc se está borrando (opcional)
      deleteDocumentoError: null,
      // --- Detailed Alerts State ---
      detailedAlertsList: [],
      detailedAlertsLoading: false,
      detailedAlertsError: null,
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
            // 1. Actualiza el store
            setStore({ currentUser: responseData });
            // 2. GUARDA en localStorage
            try {
              localStorage.setItem("currentUser", JSON.stringify(responseData));
            } catch (localError) {
              console.error(
                "Failed to save currentUser to localStorage:",
                localError
              );
              // Opcional: manejar este error, aunque es raro
            }
            console.log(
              "User added successfully and saved to localStorage: ",
              responseData
            );
            return responseData;
          } else {
            console.log("Error adding user:", response.statusText);
            // Limpia localStorage si falla el guardado? Podría ser una opción.
            // localStorage.removeItem("currentUser");
          }
        } catch (error) {
          console.log("Error adding user:", error.message);
          // Limpia localStorage si falla la petición
          // localStorage.removeItem("currentUser");
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

          let response = await fetch(
            `${process.env.BACKEND_URL}/delete_user_data/${store.currentUser.user_id}`,
            {
              method: "DELETE",
            }
          );

          if (response.ok) {
            // Limpiar el estado
            setStore({
              ...store,
              currentUser: null,
              descriptions: [],
            });
          } else {
            console.log(
              "Error en la solicitud de eliminación",
              response.statusText
            );
          }

          return response;
        } catch (error) {
          console.log("Error borrando datos de usuario", error);
        }
      },
      addDescription: async (descriptionData) => {
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/addDescription`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(descriptionData),
            }
          );

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
            console.log(
              "Error adding equipment:",
              response.statusText,
              errorData
            );
            throw new Error(
              `Error adding equipment: ${
                errorData.msg || "Unexpected response from server"
              }`
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
          const response = await fetch(
            `${process.env.BACKEND_URL}/description/${user_id || ""}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok || user_id === undefined) {
            console.log(
              `Failed to fetch descriptions: ${response.status} - ${response.statusText}`
            );
            return {
              error: true,
              message: "User ID is undefined or fetch failed.",
            };

            return {
              error: true,
              message: `Failed to fetch descriptions: ${response.statusText}`,
            };
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
          return {
            error: true,
            message: "Error fetching descriptions",
            details: error.message,
          };
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
        }));
        console.log("descrip flux", descriptions);
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
        setStore({ loading: true, error: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/tracker/login`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ identifier, password }),
            }
          );
          const responseData = await response.json();

          if (response.ok) {
            // --- Store Token ---
            setStore({
              trackerUser: responseData.user,
              token: responseData.token, // <--- Guarda el token en el store
              isAuthenticated: true,
              loading: false,
              error: null,
            });
            localStorage.setItem(
              "trackerUser",
              JSON.stringify(responseData.user)
            );
            localStorage.setItem("token", responseData.token); // <--- Guarda el token en localStorage
            console.log("Tracker login successful:", responseData.user);
            return true;
          } else {
            setStore({
              error: responseData.msg || "Error desconocido en el login",
              isAuthenticated: false,
              loading: false,
              trackerUser: null,
              token: null, // <--- Limpia token en error
            });
            localStorage.removeItem("trackerUser");
            localStorage.removeItem("token"); // <--- Limpia token en error
            console.error("Tracker login failed:", responseData.msg);
            return false;
          }
        } catch (error) {
          console.error("Network or other error during tracker login:", error);
          setStore({
            error:
              "Error de conexión o del servidor al intentar iniciar sesión.",
            isAuthenticated: false,
            token: null, // <--- Limpia token en error
            loading: false,
            trackerUser: null,
            
          });
          localStorage.removeItem("trackerUser");
          localStorage.removeItem("token"); // <--- Limpia token en error
          return false;
        }
      },

      logoutTrackerUser: () => {
        setStore({
          trackerUser: null,
          token: null, // <--- Limpia token
          isAuthenticated: false,
           // Limpiar también otros estados que podrían depender del usuario
          aires: [],
          lecturas: [],
          umbrales: [],
          otrosEquiposList: [],
          mantenimientos: [],
          lecturasUbicacion: [],
          estadisticasUbicacion: [],
          ubicaciones: [],
          _rawLecturasGenerales: [], // For general charts
      _rawLecturasAire: [],
      proveedores: [],
      contactos: [],
      actividadesProveedor: [],
      detailedAlertsList: [],
      documentos: [],
          error: null,
        });
        localStorage.removeItem("trackerUser");
        localStorage.removeItem("token"); // <--- Limpia token
        console.log("Tracker user logged out");
      },

      clearAuthError: () => {
        setStore({ error: null });
      },

      // --- Tracker User Management (Admin) ---
      registerTrackerUser: async (userData) => {
        // Esta acción probablemente no necesita token si es pública
        // Si solo un admin puede registrar, necesitaría getAuthHeaders()
        setStore({ loading: true, error: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/tracker/register`,
            {
              method: "POST",
              // headers: getAuthHeaders(), // Descomentar si es ruta protegida
              headers: { "Content-Type": "application/json" }, // Asumiendo pública por ahora
              body: JSON.stringify(userData),
            }
          );
          const responseData = await response.json();
          if (response.ok) {
            setStore({ loading: false, error: null });
            console.log("Tracker registration successful:", responseData);
            return true;
          } else {
            setStore({
              error:
                responseData.msg || "Error desconocido durante el registro",
              loading: false,
            });
            console.error("Tracker registration failed:", responseData.msg);
            return false;
          }
        } catch (error) {
          console.error(
            "Network or other error during tracker registration:",
            error
          );
          setStore({
            error: "Error de conexión o del servidor al intentar registrar.",
            loading: false,
          });
          return false;
        }
      },

      fetchTrackerUsers: async () => {
        // Ruta protegida, necesita token
        setStore({ loading: true, error: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/tracker/users?activos=false`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          );
          const data = await response.json();
          if (response.ok) {
            console.log("Tracker users fetched successfully:", data);
            setStore({ trackerUsers: data, loading: false });
          } else {
            // Manejar error 401 (Unauthorized) - podría desloguear
            if (response.status === 401) getActions().logoutTrackerUser();
            setStore({
              error: data.msg || "Error al cargar usuarios",
              loading: false,
              trackerUsers: [],
            });
            console.error("Error fetching tracker users:", data.msg);
          }
        } catch (error) {
          console.error("Network error fetching tracker users:", error);
          setStore({
            error: "Error de red al cargar usuarios.",
            loading: false,
            trackerUsers: [],
          });
        }
      },

      updateTrackerUser: async (userId, updatedData) => {
        // Ruta protegida, necesita token
        setStore({ loading: true, error: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/tracker/user/${userId}`,
            {
              method: "PUT",
              headers: getAuthHeaders(), // <--- Usa cabeceras con token
              body: JSON.stringify(updatedData),
            }
          );
          const responseData = await response.json();
          if (response.ok) {
            setStore({ loading: false, error: null });
            const updatedList = getStore().trackerUsers.map((user) =>
              user.id === userId ? { ...user, ...responseData } : user
            );
            setStore({ trackerUsers: updatedList });
            console.log("Tracker user updated successfully:", responseData);
            return true;
          } else {
            if (response.status === 401) getActions().logoutTrackerUser();
            setStore({
              error: responseData.msg || "Error al actualizar usuario",
              loading: false,
            });
            console.error("Error updating tracker user:", responseData.msg);
            return false;
          }
        } catch (error) {
          console.error("Network error updating tracker user:", error);
          setStore({
            error: "Error de red al actualizar usuario.",
            loading: false,
          });
          return false;
        }
      },

      addTrackerUserByAdmin: async (newUserData) => {
        // Asume que registerTrackerUser ya maneja la autenticación si es necesario
        const success = await getActions().registerTrackerUser(newUserData);
        if (success) {
          await getActions().fetchTrackerUsers(); // Refresca la lista si tuvo éxito
        }
        return success;
      },
      updateCurrentUserProfile: async (updatedData) => {
        const store = getStore();
        const actions = getActions(); // Para llamar a logout si es necesario

        if (!store.trackerUser || !store.trackerUser.id) {
          console.error("No hay usuario logueado para actualizar.");
          setStore({
            error: "No hay usuario logueado para actualizar.",
            loading: false,
          });
          return false;
        }

        const userId = store.trackerUser.id;
        setStore({ loading: true, error: null }); // Inicia carga, limpia error

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/tracker/user/${userId}`,
            {
              method: "PUT",
              headers: getAuthHeaders(), // Usa cabeceras con token y Content-Type
              body: JSON.stringify({
                nombre: updatedData.nombre,
                apellido: updatedData.apellido,
                email: updatedData.email,
                // No enviar rol, activo, username, password desde aquí
              }),
            }
          );

          const responseData = await response.json();

          if (response.ok) {
            // Actualizar store y localStorage con los datos devueltos por el backend
            setStore({
              trackerUser: responseData, // Usa la respuesta del backend
              loading: false,
              error: null,
            });
            localStorage.setItem("trackerUser", JSON.stringify(responseData));
            console.log("Perfil actualizado correctamente:", responseData);
            return true; // Indica éxito
          } else {
            // Manejar error 401 (Unauthorized) - podría desloguear
            if (response.status === 401) {
              actions.logoutTrackerUser();
              setStore({
                error:
                  "Sesión expirada o inválida. Por favor, inicia sesión de nuevo.",
                loading: false,
              });
            } else {
              setStore({
                error: responseData.msg || "Error al actualizar el perfil.",
                loading: false,
              });
            }
            console.error("Error actualizando perfil:", responseData.msg);
            return false; // Indica fallo
          }
        } catch (error) {
          console.error("Error de red actualizando perfil:", error);
          setStore({
            error: "Error de conexión o del servidor al actualizar el perfil.",
            loading: false,
          });
          return false; // Indica fallo
        }
      },
      changeCurrentUserPassword: async (passwordInfo) => {
        const store = getStore();
        const actions = getActions();

        if (!store.trackerUser || !store.trackerUser.id) {
          console.error("No hay usuario logueado para cambiar contraseña.");
          setStore({ error: "No hay usuario logueado.", loading: false }); // loading podría ser passwordLoading
          return false;
        }

        setStore({ loading: true, error: null }); // O usar un estado 'passwordLoading' dedicado

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/tracker/user/password`,
            {
              // Nueva ruta
              method: "PUT",
              headers: getAuthHeaders(), // Necesita token y Content-Type
              body: JSON.stringify({
                current_password: passwordInfo.current_password,
                new_password: passwordInfo.new_password,
              }),
            }
          );

          const responseData = await response.json();

          if (response.ok) {
            setStore({ loading: false, error: null });
            console.log("Contraseña actualizada correctamente.");
            // No es necesario actualizar el trackerUser en el store aquí
            return true; // Indica éxito
          } else {
            // Manejar error 401 (Unauthorized) - podría desloguear
            if (response.status === 401) {
              actions.logoutTrackerUser();
              setStore({
                error:
                  "Sesión expirada o inválida. Por favor, inicia sesión de nuevo.",
                loading: false,
              });
            } else {
              // El mensaje de error específico (ej: "Contraseña actual incorrecta") vendrá del backend
              setStore({
                error: responseData.msg || "Error al cambiar la contraseña.",
                loading: false,
              });
            }
            console.error("Error cambiando contraseña:", responseData.msg);
            return false; // Indica fallo
          }
        } catch (error) {
          console.error("Error de red cambiando contraseña:", error);
          setStore({
            error: "Error de conexión o del servidor al cambiar la contraseña.",
            loading: false,
          });
          return false; // Indica fallo
        }
      },

      // --- Aires Actions ---
      fetchAires: async () => {
        // Ruta protegida, necesita token
        setStore({ airesLoading: true, airesError: null });
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/aires`, {
            method: "GET",
            headers: getAuthHeaders(), // <--- Usa cabeceras con token
          });
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
             // Si es un error de token expirado, es importante que logoutTrackerUser se ejecute
            // y el error no se propague de forma que impida la redirección o el re-login.
            // Podríamos no lanzar el error aquí si logoutTrackerUser ya maneja la redirección.
            setStore({ airesError: responseData.msg || `Error fetching aires: ${response.status}`, airesLoading: false });
            return null; // Indicar fallo sin lanzar error si el logout ya se encargó.
            /* throw new Error(
            
              errorData.msg || `Error fetching aires: ${response.status}`
            );*/
          }
          const data = await response.json();
          if (Array.isArray(data)) {
            setStore({ aires: data, airesLoading: false });
            return data;
          } else {
            throw new Error(
              "Formato de respuesta inesperado del servidor al listar aires." // Esto es un error diferente a 401
            );
          } 
          
        } catch (error) {
          console.error("Error in fetchAires:", error);
          setStore({
            airesError: error.message || "Error cargando la lista de aires.",
            airesLoading: false,
            aires: [],
          });
          return null;
        }
      },

      fetchAireDetails: async (aireId) => {
        // Ruta protegida, necesita token
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/aires/${aireId}`,
            {
              method: "GET",
              headers: getAuthHeaders(), // <--- Usa cabeceras con token
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg ||
                `Error fetching details for aire ${aireId}: ${response.status}`
            );
          }
          return await response.json();
        } catch (error) {
          console.error("Error in fetchAireDetails:", error);
          throw error;
        }
      },

      addAire: async (aireData) => {
        // Ruta protegida, necesita token
        setStore({ airesLoading: true, airesError: null });
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/aires`, {
            method: "POST",
            headers: getAuthHeaders(), // <--- Usa cabeceras con token
            body: JSON.stringify(aireData),
          });
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg || `Error adding aire: ${response.status}`
            );
          }
          await getActions().fetchAires();
          return true;
        } catch (error) {
          console.error("Error in addAire:", error);
          setStore({
            airesError:
              error.message || "Error al agregar el aire acondicionado.",
            airesLoading: false,
          });
          return false;
        }
      },

      updateAire: async (aireId, aireData) => {
        // Ruta protegida, necesita token
        setStore({ airesLoading: true, airesError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/aires/${aireId}`,
            {
              method: "PUT",
              headers: getAuthHeaders(), // <--- Usa cabeceras con token
              body: JSON.stringify(aireData),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg || `Error updating aire: ${response.status}`
            );
          }
          await getActions().fetchAires();
          return true;
        } catch (error) {
          console.error("Error in updateAire:", error);
          setStore({
            airesError:
              error.message || "Error al actualizar el aire acondicionado.",
            airesLoading: false,
          });
          return false;
        }
      },

      deleteAire: async (aireId) => {
        // Ruta protegida, necesita token
        const store = getStore();
        const originalList = [...store.aires];
        const updatedList = originalList.filter((a) => a.id !== aireId);
        setStore({ aires: updatedList, airesError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/aires/${aireId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // <--- Usa cabeceras con token (sin Content-Type)
            }
          );
          if (!response.ok) {
            setStore({ aires: originalList });
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg || `Error deleting aire: ${response.status}`
            );
          }
          console.log(`Aire ${aireId} deleted successfully.`);
          return true;
        } catch (error) {
          console.error("Error in deleteAire:", error);
          setStore({
            aires: originalList,
            airesError:
              error.message || "Error al eliminar el aire acondicionado.",
          });
          return false;
        }
      },

      clearAiresError: () => {
        setStore({ airesError: null });
      },

      // --- Umbrales Actions ---
      fetchUmbrales: async () => {
        // Ruta protegida, necesita token
        setStore({ umbralesLoading: true, umbralesError: null });
        try {
          // Asegura que los aires estén cargados (fetchAires ya maneja auth)
          await getActions().fetchAires();

          const umbralesResponse = await fetch(
            `${process.env.BACKEND_URL}/umbrales`,
            {
              method: "GET",
              headers: getAuthHeaders(), // <--- Usa cabeceras con token
            }
          );
          if (!umbralesResponse.ok) {
            const errorData = await umbralesResponse.json();
            if (umbralesResponse.status === 401)
              getActions().logoutTrackerUser(); // Esto debería limpiar el token y redirigir
            // Similar a fetchAires, si es 401, el logout ya se encarga.
            setStore({ umbralesError: errorData.msg || `Error fetching umbrales: ${umbralesResponse.status}`, umbralesLoading: false });
            return; // No continuar si hay error
            /* throw new Error(
              errorData.msg ||
                `Error fetching umbrales: ${umbralesResponse.status}`
            );*/
          }
          const umbralesData = await umbralesResponse.json();
          setStore({ umbrales: umbralesData || [], umbralesLoading: false });
        } catch (error) {
          console.error("Error in fetchUmbrales:", error);
          setStore({
            umbralesError: error.message || "Error cargando datos de umbrales.",
            umbralesLoading: false,
          });
        }
      },

      addUmbral: async (formData) => {
        // Ruta protegida, necesita token
        setStore({ umbralesLoading: true, umbralesError: null });
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/umbrales`, {
            method: "POST",
            headers: getAuthHeaders(), // <--- Usa cabeceras con token
            body: JSON.stringify(formData),
          });
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg || `Error adding umbral: ${response.status}`
            );
          }
          await getActions().fetchUmbrales();
          return true;
        } catch (error) {
          console.error("Error in addUmbral:", error);
          setStore({
            umbralesError: error.message || "Error al agregar el umbral.",
            umbralesLoading: false,
          });
          return false;
        }
      },

      updateUmbral: async (umbralId, formData) => {
        // Ruta protegida, necesita token
        setStore({ umbralesLoading: true, umbralesError: null });
        try {
          const updatePayload = {
            nombre: formData.nombre,
            // Note: Backend might not allow changing es_global or aire_id on PUT
            es_global: formData.es_global,
            aire_id: formData.es_global ? null : formData.aire_id,
            temp_min: parseFloat(formData.temp_min),
            temp_max: parseFloat(formData.temp_max),
            hum_min: parseFloat(formData.hum_min),
            hum_max: parseFloat(formData.hum_max),
            notificar_activo: formData.notificar_activo,
          };
          const response = await fetch(
            `${process.env.BACKEND_URL}/umbrales/${umbralId}`,
            {
              method: "PUT",
              headers: getAuthHeaders(),
              body: JSON.stringify(updatePayload),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg || `Error updating umbral: ${response.status}`
            );
          }
          await getActions().fetchUmbrales();
          return true;
        } catch (error) {
          console.error("Error in updateUmbral:", error);
          setStore({
            umbralesError: error.message || "Error al actualizar el umbral.",
            umbralesLoading: false,
          });
          return false;
        }
      },

      deleteUmbral: async (umbralId) => {
        // Ruta protegida, necesita token
        const store = getStore();
        const originalUmbrales = [...store.umbrales];
        const updatedUmbrales = originalUmbrales.filter(
          (u) => u.id !== umbralId
        );
        setStore({ umbrales: updatedUmbrales, umbralesError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/umbrales/${umbralId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // <--- Usa cabeceras con token (sin Content-Type)
            }
          );
          if (!response.ok) {
            setStore({ umbrales: originalUmbrales });
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg || `Error deleting umbral: ${response.status}`
            );
          }
          console.log(`Umbral ${umbralId} deleted successfully.`);
          return true;
        } catch (error) {
          console.error("Error in deleteUmbral:", error);
          setStore({
            umbrales: originalUmbrales,
            umbralesError: error.message || "Error al eliminar el umbral.",
          });
          return false;
        }
      },

      clearUmbralesError: () => {
        setStore({ umbralesError: null });
      },

      // --- Otros Equipos Actions ---
      fetchOtrosEquipos: async () => {
        // Ruta protegida, necesita token
        setStore({ otrosEquiposLoading: true, otrosEquiposError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/otros_equipos`,
            {
              method: "GET",
              headers: getAuthHeaders(), // <--- Usa cabeceras con token
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg ||
                `Error fetching otros equipos: ${response.status}`
            );
          }
          const data = await response.json();
          setStore({
            otrosEquiposList: data || [],
            otrosEquiposLoading: false,
          });
        } catch (error) {
          console.error("Error in fetchOtrosEquipos:", error);
          setStore({
            otrosEquiposError:
              error.message || "Error cargando la lista de equipos.",
            otrosEquiposLoading: false,
          });
        }
      },

      fetchOtroEquipoDetails: async (equipoId) => {
        // Ruta protegida, necesita token
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/otros_equipos/${equipoId}`,
            {
              method: "GET",
              headers: getAuthHeaders(), // <--- Usa cabeceras con token
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg ||
                `Error fetching details for equipo ${equipoId}: ${response.status}`
            );
          }
          return await response.json();
        } catch (error) {
          console.error("Error in fetchOtroEquipoDetails:", error);
          throw error;
        }
      },

      addOtroEquipo: async (formData) => {
        // Ruta protegida, necesita token
        setStore({ otrosEquiposLoading: true, otrosEquiposError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/otros_equipos`,
            {
              method: "POST",
              headers: getAuthHeaders(), // <--- Usa cabeceras con token
              body: JSON.stringify(formData),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg || `Error adding otro equipo: ${response.status}`
            );
          }
          await getActions().fetchOtrosEquipos();
          return true;
        } catch (error) {
          console.error("Error in addOtroEquipo:", error);
          setStore({
            otrosEquiposError: error.message || "Error al agregar el equipo.",
            otrosEquiposLoading: false,
          });
          return false;
        }
      },

      updateOtroEquipo: async (equipoId, formData) => {
        // Ruta protegida, necesita token
        setStore({ otrosEquiposLoading: true, otrosEquiposError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/otros_equipos/${equipoId}`,
            {
              method: "PUT",
              headers: getAuthHeaders(), // <--- Usa cabeceras con token
              body: JSON.stringify(formData),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg ||
                `Error updating otro equipo: ${response.status}`
            );
          }
          await getActions().fetchOtrosEquipos();
          return true;
        } catch (error) {
          console.error("Error in updateOtroEquipo:", error);
          setStore({
            otrosEquiposError:
              error.message || "Error al actualizar el equipo.",
            otrosEquiposLoading: false,
          });
          return false;
        }
      },

      deleteOtroEquipo: async (equipoId) => {
        // Ruta protegida, necesita token
        const store = getStore();
        const originalList = [...store.otrosEquiposList];
        const updatedList = originalList.filter((eq) => eq.id !== equipoId);
        setStore({ otrosEquiposList: updatedList, otrosEquiposError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/otros_equipos/${equipoId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // <--- Usa cabeceras con token (sin Content-Type)
            }
          );
          if (!response.ok) {
            setStore({ otrosEquiposList: originalList });
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg || `Error deleting otro equipo: ${response.status}`
            );
          }
          console.log(`Otro Equipo ${equipoId} deleted successfully.`);
          return true;
        } catch (error) {
          console.error("Error in deleteOtroEquipo:", error);
          setStore({
            otrosEquiposList: originalList,
            otrosEquiposError: error.message || "Error al eliminar el equipo.",
          });
          return false;
        }
      },

      clearOtrosEquiposError: () => {
        setStore({ otrosEquiposError: null });
      },

      // --- Mantenimientos Actions ---
      fetchMantenimientos: async (filters = {}, page = 1, perPage = 20) => {
        // Ruta protegida, necesita token
        setStore({ mantenimientosLoading: true, mantenimientosError: null });
        try {
          // Estas llamadas son para asegurar que los nombres de los equipos estén disponibles
          // para el filtro y el modal de agregar. No afectan directamente la lista de mantenimientos.
          await getActions().fetchAires();
          await getActions().fetchOtrosEquipos();

          let url = `${process.env.BACKEND_URL}/mantenimientos`;
          const queryParams = new URLSearchParams();
          queryParams.append('page', page);
          queryParams.append('per_page', perPage);

          if (filters.aire_id) queryParams.append("aire_id", filters.aire_id);
          if (filters.otro_equipo_id)
            queryParams.append("otro_equipo_id", filters.otro_equipo_id);
          const queryString = queryParams.toString();
          if (queryString) url += `?${queryString}`;

          const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(), // <--- Usa cabeceras con token
          });
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg ||
                `Error fetching mantenimientos: ${response.status}`
            );
          }
          const responseData = await response.json();
          // Asumimos que el backend ahora devuelve una estructura paginada
          setStore({
            mantenimientos: responseData.items || [],
            mantenimientosPaginationInfo: {
              total_items: responseData.total_items,
              total_pages: responseData.total_pages,
              current_page: responseData.current_page,
              per_page: responseData.per_page,
              has_next: responseData.has_next,
              has_prev: responseData.has_prev,
            },
            mantenimientosLoading: false,
            mantenimientosError: null, // Limpiar error en éxito
          });
        } catch (error) {
          console.error("Error in fetchMantenimientos:", error);
          setStore({
            mantenimientosError:
              error.message || "Error cargando los registros de mantenimiento.",
            mantenimientosLoading: false,
            mantenimientos: [],
            mantenimientosPaginationInfo: { total_items: 0, total_pages: 0, current_page: 1, per_page: perPage, has_next: false, has_prev: false },
          });
        }
      },

      addMantenimiento: async (formData) => {
        // Ruta protegida, necesita token
        setStore({ mantenimientosLoading: true, mantenimientosError: null });
        try {
          let url;
          if (formData.get("aire_id")) {
            url = `${process.env.BACKEND_URL}/aires/${formData.get(
              "aire_id"
            )}/mantenimientos`;
            formData.delete("otro_equipo_id");
          } else if (formData.get("otro_equipo_id")) {
            url = `${process.env.BACKEND_URL}/otros_equipos/${formData.get(
              "otro_equipo_id"
            )}/mantenimientos`;
            formData.delete("aire_id");
          } else {
            throw new Error("No equipment ID provided.");
          }

          const response = await fetch(url, {
            method: "POST",
            headers: getAuthHeaders(false), // <--- Usa cabeceras con token (sin Content-Type para FormData)
            body: formData,
          });
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg ||
                `Error adding mantenimiento: ${response.status}`
            );
          }
          // La recarga de datos se manejará en el componente después de una adición exitosa.
          setStore({ mantenimientosLoading: false }); // Indicar que la operación de 'add' ha terminado.
          return true;
        } catch (error) {
          console.error("Error in addMantenimiento:", error);
          setStore({
            mantenimientosError:
              error.message || "Error al guardar el mantenimiento.",
            mantenimientosLoading: false, // Asegurarse de resetear el loading en caso de error.
          });
          return false;
        }
      },

      deleteMantenimiento: async (mantenimientoId) => {
        // Ruta protegida, necesita token
        const store = getStore();
        // La actualización optimista se elimina; el componente se encargará de recargar.
        setStore({ mantenimientosError: null }); // Limpiar error previo
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/mantenimientos/${mantenimientoId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // <--- Usa cabeceras con token (sin Content-Type)
            }
          );
          if (!response.ok) {
            // No es necesario revertir la actualización optimista si se eliminó.
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            setStore({ // Establecer el error global
              mantenimientosError: errorData.msg || `Error deleting mantenimiento: ${response.status}`
            });
            throw new Error(
              errorData.msg ||
                `Error deleting mantenimiento: ${response.status}`
            );
          }
          console.log(`Mantenimiento ${mantenimientoId} deleted successfully.`);
          setStore({ mantenimientosError: null }); // Limpiar error en caso de éxito
          return true;
        } catch (error) {
          console.error("Error in deleteMantenimiento:", error);
          // El error ya debería estar establecido si fue un error HTTP.
          // Esto es para errores de red u otros.
          if (!store.mantenimientosError) {
            setStore({
              mantenimientosError: error.message || "Error al eliminar el mantenimiento.",
            });
          }
          return false;
        }
      },
      fetchMantenimientoImagenBase64: async (mantenimientoId) => {
        // Ruta protegida, necesita token
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/mantenimientos/${mantenimientoId}/imagen_base64`,
            {
              method: "GET",
              headers: getAuthHeaders(), // <--- Usa cabeceras con token
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            if (response.status === 404) return null;
            throw new Error(
              errorData.msg || `Error fetching image: ${response.status}`
            );
          }
          const data = await response.json();
          return data.imagen_base64 || null;
        } catch (error) {
          console.error("Error in fetchMantenimientoImagenBase64:", error);
          return null;
        }
      },

      clearMantenimientosError: () => {
        setStore({ mantenimientosError: null });
      },

      // --- Lecturas Actions ---
      fetchLecturas: async (filters = {}, page = 1, perPage = 20) => {
        // Ruta protegida, necesita token
        setStore({ lecturasLoading: true, lecturasError: null });
        try {
          const fetchedAiresList = await getActions().fetchAires();
          await getActions().fetchUmbrales();
          const currentAiresForMap = fetchedAiresList || getStore().aires;

          if (!fetchedAiresList && !getStore().airesError) { 
            console.warn("fetchAires pudo haber fallado en devolver datos para airesMap en fetchLecturas, o un error en fetchAires no se propagó como airesError.");
          }

          let url;
          const queryParams = new URLSearchParams();
          
          if (filters.aire_id) {
            url = `${process.env.BACKEND_URL}/aires/${filters.aire_id}/lecturas`;
            // Añadir parámetros de paginación para la ruta de un aire específico
            queryParams.append('page', page);
            queryParams.append('per_page', perPage);
            url = `${url}?${queryParams.toString()}`;
          } else {
            // Decide how to handle no filter - fetch all? Fetch first? Error?
            // Fetching last N readings globally might be better:
            url = `${process.env.BACKEND_URL}/lecturas/ultimas?limite=100`; // Fetch last 100 global readings
            console.warn("No filter, fetching last 100 global readings.");
            // If using /lecturas/ultimas, the response structure might differ
          }

          // Si no hay aire_id, usamos la ruta global que actualmente no está paginada en el backend
          // de la misma manera. Para este ejemplo, la paginación completa se enfoca en la vista de un aire específico.
          const finalUrl = filters.aire_id ? url : `${process.env.BACKEND_URL}/lecturas/ultimas?limite=${perPage}`;
          const response = await fetch(finalUrl, {
            method: "GET",
            headers: getAuthHeaders(), // <--- Usa cabeceras con token
          });
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg || `Error fetching lecturas: ${response.status}`
            );
          }
          const data = await response.json();

          const airesMap = (Array.isArray(currentAiresForMap) ? currentAiresForMap : []).reduce((acc, aire) => {
            if (aire && typeof aire.id !== 'undefined') { // Comprobación defensiva
                acc[aire.id] = aire;
            }
            return acc;
          }, {});

          if (filters.aire_id && data.items) { // Respuesta paginada para un aire específico
            const processedLecturas = (data.items || []).map((lectura) => {
              const aire = airesMap[lectura.aire_id];
              return {
                ...lectura,
                aire_nombre: lectura.nombre_aire || aire?.nombre || "Desconocido",
                ubicacion: lectura.ubicacion_aire || aire?.ubicacion || "Desconocida",
              };
            });
            // El backend ya ordena por fecha desc.
            setStore({
              lecturas: processedLecturas,
              lecturasPaginationInfo: {
                total_items: data.total_items,
                total_pages: data.total_pages,
                current_page: data.current_page,
                per_page: data.per_page,
                has_next: data.has_next,
                has_prev: data.has_prev,
              },
              lecturasLoading: false
            });
          } else if (!filters.aire_id && Array.isArray(data)) { // Respuesta no paginada (lista) para lecturas globales
            const processedLecturas = (data || []).map((lectura) => {
                const aire = airesMap[lectura.aire_id];
                return {
                    ...lectura,
                    aire_nombre: lectura.nombre_aire || aire?.nombre || "Desconocido",
                    ubicacion: lectura.ubicacion_aire || aire?.ubicacion || "Desconocida",
                };
            }).sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

            setStore({
                lecturas: processedLecturas,
                lecturasPaginationInfo: { // Info de paginación simulada para la vista global limitada
                    total_items: processedLecturas.length,
                    total_pages: 1,
                    current_page: 1,
                    per_page: perPage,
                    has_next: false,
                    has_prev: false,
                },
                lecturasLoading: false
            });
          } else {
            console.error("Unexpected data structure from fetchLecturas:", data);
            throw new Error("Formato de datos de lecturas inesperado.");
          }
        } catch (error) {
          console.error("Error in fetchLecturas:", error);
          setStore({
            lecturasError: error.message || "Error cargando las lecturas.",
            lecturasLoading: false,
            lecturas: [],
            lecturasPaginationInfo: { total_items: 0, total_pages: 0, current_page: 1, per_page: perPage, has_next: false, has_prev: false },
          });
          return false;
        }
      },
 addLectura: async (aireId, lecturaData) => {
        // Ruta protegida, necesita token
        // No se establece lecturasLoading aquí para no afectar la tabla principal
        // El modal manejará su propio estado de 'isSubmitting'
        // setStore({ lecturasError: null }); // Limpiar error previo
        try {
          const url = `${process.env.BACKEND_URL}/aires/${aireId}/lecturas`;
          const response = await fetch(url, {
            method: "POST",
            headers: getAuthHeaders(), // Usa cabeceras con token
            body: JSON.stringify({ // Asegúrate que el backend espera estos nombres
              fecha_hora: lecturaData.fecha_hora, // 'YYYY-MM-DDTHH:MM:SS'
              temperatura: lecturaData.temperatura,
              humedad: lecturaData.humedad, // Puede ser null
            }),
          });
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            // Propagar el mensaje de error del backend
            throw new Error(responseData.msg || `Error agregando lectura: ${response.status}`);
          }
          // No es necesario refetch aquí, Lecturas.jsx lo hará después de un add exitoso.
          return true; // Indica éxito
        } catch (error) {
          console.error("Error in addLectura:", error);
          // El error se manejará en el componente que llama a esta acción
          // setStore({ lecturasError: error.message || "Error al guardar la lectura." });
          throw error; // Re-lanzar el error para que el componente lo capture
        }
      },


      deleteLectura: async (lecturaId) => {
        // Ruta protegida, necesita token
        const store = getStore();
        const originalList = [...store.lecturas];
        const updatedList = originalList.filter((l) => l.id !== lecturaId);
        setStore({ lecturas: updatedList, lecturasError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/lecturas/${lecturaId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // <--- Usa cabeceras con token (sin Content-Type)
            }
          );
          if (!response.ok) {
            setStore({ lecturas: originalList });
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg || `Error deleting lectura: ${response.status}`
            );
          }
          console.log(`Lectura ${lecturaId} deleted successfully.`);
          return true;
        } catch (error) {
          console.error("Error in deleteLectura:", error);
          setStore({
            lecturas: originalList,
            lecturasError: error.message || "Error al eliminar la lectura.",
          });
          return false;
        }
      },

      clearLecturasError: () => {
        setStore({ lecturasError: null });
       },

      setLecturasError: (errorMessage) => { // Nueva acción
        setStore({ lecturasError: errorMessage });
 },

      uploadLecturasExcel: async (file, onProgress) => {
        // onProgress no se usa activamente aquí, pero se deja por si se implementa con Axios
        const actions = getActions();
        try {
          const formData = new FormData();
          formData.append('file', file);

          const response = await fetch(`${process.env.BACKEND_URL}/api/lecturas/upload_excel`, { // Asegúrate que la ruta sea /api/...
            method: 'POST',
            headers: getAuthHeaders(false), // No 'Content-Type', FormData lo maneja
            body: formData,
            // onUploadProgress: onProgress, // Esto es más para Axios, fetch no lo soporta directamente
          });

          const responseData = await response.json();

          if (!response.ok) {
            if (response.status === 401) actions.logoutTrackerUser();
            // Devuelve el objeto de error del backend
            return { success: false, message: responseData.msg || `Error ${response.status}`, errors: responseData.errors || [] };
          }
          // Devuelve el objeto de éxito del backend
          return { success: true, message: responseData.msg || "Archivo procesado.", details: responseData };

        } catch (error) {
          console.error("Error in uploadLecturasExcel:", error);
          return { 
            success: false, 
            message: error.message || "Error de red o del servidor al subir el archivo.",
            errors: []
          };
        }
      },

      fetchLecturasPorUbicacion: async (ubicacion) => {
        // Limpiar si no hay ubicación
        if (!ubicacion) {
          setStore({
            lecturasUbicacion: [],
            lecturasUbicacionLoading: false,
            lecturasUbicacionError: null,
          });
          return;
        }

        setStore({
          lecturasUbicacionLoading: true,
          lecturasUbicacionError: null,
        });
        try {
          // Usar encodeURIComponent por si la ubicación tiene caracteres especiales
          const url = `${
            process.env.BACKEND_URL
          }/lecturas/ubicacion/${encodeURIComponent(ubicacion)}?limite=100`; // Pide últimas 100

          const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorData.msg || `Error ${response.status}`);
          }

          const data = await response.json();
          setStore({
            lecturasUbicacion: data || [],
            lecturasUbicacionLoading: false,
          });
        } catch (error) {
          console.error(
            `Error fetching lecturas for ubicacion ${ubicacion}:`,
            error
          );
          setStore({
            lecturasUbicacionError:
              error.message || "Error cargando datos para el gráfico.",
            lecturasUbicacionLoading: false,
            lecturasUbicacion: [],
          });
        }
      },

      fetchEstadisticasIniciales: async () => {
        // Rutas protegidas, necesitan token
        setStore({ /* ... loading states ... */ statsError: null });
        try {
          const [
            umbralResponse, // Fetches aires internally
            estGenResponse,
            estUbicResponse,
            lecturasGenResponse,
            contadoresResponse,
            alertasCountResponse,
            // --- AÑADIR LLAMADA PARA UBICACIONES ---
            ubicacionesResponse,
          ] = await Promise.all([
            getActions().fetchUmbrales(), // Handles auth internally
            fetch(`${process.env.BACKEND_URL}/estadisticas/generales`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${process.env.BACKEND_URL}/estadisticas/ubicacion`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${process.env.BACKEND_URL}/lecturas/ultimas?limite=50`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${process.env.BACKEND_URL}/contadores`, {
              headers: getAuthHeaders(),
            }),
            fetch(`${process.env.BACKEND_URL}/alertas/activas/count`, {
              headers: getAuthHeaders(),
            }),
            // --- LLAMADA A LA RUTA DE UBICACIONES ---
            fetch(`${process.env.BACKEND_URL}/aires/ubicaciones`, {
              headers: getAuthHeaders(),
            }),
          ]);

          // Check all responses for errors (including 401)
          const checkResp = async (resp, name) => {
            if (!resp)
              throw new Error(`Error en la acción interna para ${name}.`);
            if (!resp.ok) {
              const errorData = await resp.json().catch(() => ({}));
              if (resp.status === 401) getActions().logoutTrackerUser();
              // Si es 401, logoutTrackerUser se encarga. No necesitamos propagar este error específico
              // para que el Promise.all falle de forma que impida el login.
              // Devolvemos un objeto que indique el error para que el Promise.all no falle catastróficamente.
              return { _error: true, status: resp.status, msg: errorData.msg || `Error ${resp.status}` };
              /* throw new Error(
                `Error cargando ${name}: ${errorData.msg || resp.status}`
              );*/
            }
            // Manejar respuesta vacía o no JSON
            const text = await resp.text();
            try {
              return text ? JSON.parse(text) : []; // Devuelve array vacío si no hay contenido
            } catch (e) {
              console.warn(`Respuesta no JSON para ${name}:`, text);
              return []; // Devuelve array vacío si no es JSON
            }
          };
          // Helper para verificar si una respuesta de checkResp fue un error
          const isErrorResponse = (data) => data && data._error === true;


          // Parse JSON data safely
          const estGenData = await checkResp(
            estGenResponse,
            "estadísticas generales"
          );
          const estUbicData = await checkResp(
            estUbicResponse,
            "estadísticas por ubicación"
          );
          const lecturasGenData = await checkResp(
            lecturasGenResponse,
            "lecturas generales"
          );
          const contadoresData = await checkResp(
            contadoresResponse,
            "contadores"
          );
          const alertasCountData = await checkResp(
            alertasCountResponse,
            "contador de alertas"
          );
          // --- OBTENER DATOS DE UBICACIONES ---
          const ubicacionesData = await checkResp(
            ubicacionesResponse,
            "ubicaciones"
          );
  // Verificar si alguna de las llamadas falló (especialmente por 401 que no queremos que rompa el login)
          if (isErrorResponse(estGenData) || isErrorResponse(estUbicData) || isErrorResponse(lecturasGenData) || 
              isErrorResponse(contadoresData) || isErrorResponse(alertasCountData) || isErrorResponse(ubicacionesData)) {
            console.warn("Una o más llamadas iniciales fallaron después del login, posiblemente por token. El logout ya debería haberse activado.");
            // No actualizamos el store con datos parciales o erróneos. El logout se encargará.
            return; 
          }
          
          setStore({
            // --- USAR DATOS DIRECTOS DE LA API ---
            ubicaciones: Array.isArray(ubicacionesData) ? ubicacionesData : [], // Asegura que sea un array
            // --- Resto de actualizaciones ---
            estadisticasGenerales: estGenData || null,
            estadisticasUbicacion: Array.isArray(estUbicData)
              ? estUbicData
              : [],
            _rawLecturasGenerales: Array.isArray(lecturasGenData)
              ? lecturasGenData
              : [],
            dashboardResumen: {
              totalAires: contadoresData?.aires ?? 0,
              totalLecturas: contadoresData?.lecturas ?? 0,
              totalMantenimientos: contadoresData?.mantenimientos ?? 0,
              totalOtrosEquipos: contadoresData?.otros_equipos ?? 0,
              alertas_activas_count:
                alertasCountData?.alertas_activas_count ?? 0,
              ultimasLecturas: Array.isArray(lecturasGenData)
                ? lecturasGenData
                : [],
            },
            // Reset loading states
            statsLoadingGeneral: false,
            statsLoadingUbicacion: false,
            statsLoadingChartsGeneral: false,
            statsLoadingUmbrales: false,
            dashboardLoading: false,
          });
        } catch (error) {
          console.error("Error in fetchEstadisticasIniciales:", error);
          setStore({
            statsError:
              error.message ||
              "Error cargando datos iniciales de estadísticas.",
            // Reset loading states
            statsLoadingGeneral: false,
            statsLoadingUbicacion: false,
            statsLoadingChartsGeneral: false,
            statsLoadingUmbrales: false,
            dashboardLoading: false,
            ubicaciones: [], // Limpia ubicaciones en caso de error
          });
        }
      },

      fetchEstadisticasAire: async (aireId) => {
        // Clear state and exit if no aireId is provided
        if (aireId === null || aireId === undefined) {
          setStore({
            estadisticasAire: null,
            _rawLecturasAire: [],
            statsLoadingAire: false,
            statsLoadingChartsAire: false, // Also reset chart loading
            statsError: null,
          });
          return;
        }

        // Set loading states
        setStore({
          statsLoadingAire: true,
          statsLoadingChartsAire: true,
          statsError: null,
        });

        try {
          // --- Helper to check responses ---
          // (Assuming this helper exists elsewhere or is defined here)
          // It should handle response.ok, parse JSON, and manage 401 errors by calling logoutTrackerUser
          const checkResp = async (resp, name) => {
            if (!resp.ok) {
              const errorData = await resp
                .json()
                .catch(() => ({ msg: "Failed to parse error response" }));
              if (resp.status === 401) getActions().logoutTrackerUser(); // Logout on 401
              throw new Error(
                `Error cargando ${name}: ${errorData.msg || resp.status}`
              );
            }
            // Handle cases where the response might be empty (e.g., 204 No Content)
            const text = await resp.text();
            try {
              return text ? JSON.parse(text) : null; // Return null for empty responses
            } catch (e) {
              console.error(`Failed to parse JSON for ${name}:`, text);
              throw new Error(`Respuesta inválida del servidor para ${name}.`);
            }
          };
          // --- End Helper ---

          // Fetch stats and readings concurrently
          const [statsResponse, lecturasResponse] = await Promise.all([
            fetch(`${process.env.BACKEND_URL}/aires/${aireId}/estadisticas`, {
              headers: getAuthHeaders(),
            }),
            fetch(
              `${process.env.BACKEND_URL}/aires/${aireId}/lecturas?limit=50`,
              { headers: getAuthHeaders() }
            ), // Fetch last 50 readings
          ]);

          // Process responses using the helper
          const statsData = await checkResp(
            statsResponse,
            `estadísticas aire ${aireId}`
          );
          const lecturasData = await checkResp(
            lecturasResponse,
            `lecturas aire ${aireId}`
          );

          // Ensure lecturasData is an array, default to empty if not
          const validLecturas = Array.isArray(lecturasData) ? lecturasData : [];

          // --- Calculate Variations ---
          let variacionTemp = 0;
          let variacionHum = 0;
          if (validLecturas.length > 1) {
            // Need at least 2 readings for variation
            const temps = validLecturas.map((l) => l.temperatura);
            const hums = validLecturas.map((l) => l.humedad);
            const tempMax = Math.max(...temps);
            const tempMin = Math.min(...temps);
            const humMax = Math.max(...hums);
            const humMin = Math.min(...hums);
            variacionTemp = tempMax - tempMin;
            variacionHum = humMax - humMin;
          }
          // --- End Variation Calculation ---

          // Get AC info from store
          const store = getStore();
          const aireInfo = store.aires.find((a) => a.id === aireId);

          // --- Combine data into processedStatsAire ---
          const processedStatsAire = {
            // Spread the fetched stats (handle if statsData is null)
            ...(statsData || {}),
            // Add calculated variations
            variacion_temperatura: variacionTemp,
            variacion_humedad: variacionHum,
            // Add AC name and location for convenience
            aire_id: aireId, // Ensure aire_id is present
            nombre: aireInfo?.nombre || "Desconocido",
            ubicacion: aireInfo?.ubicacion || "Desconocida",
          };
          // --- End Combine Data ---

          // Update the store
          setStore({
            estadisticasAire: processedStatsAire,
            _rawLecturasAire: validLecturas, // Store the validated/defaulted array
            statsLoadingAire: false,
            // Note: statsLoadingChartsAire might be set to false later,
            // after the component processes _rawLecturasAire in its useEffect
          });
        } catch (error) {
          console.error(`Error in fetchEstadisticasAire for ${aireId}:`, error);
          // Update store with error and reset loading/data states
          setStore({
            statsError:
              error.message || `Error cargando datos para el aire ${aireId}.`,
            statsLoadingAire: false,
            statsLoadingChartsAire: false,
            estadisticasAire: null,
            _rawLecturasAire: [],
          });
        }
      },

      clearStatsError: () => {
        setStore({ statsError: null });
      },

      clearStatsError: () => {
        setStore({ statsError: null });
      },



      // --- Dashboard Action ---
      fetchDashboardResumen: async () => {
        // Esta acción combina llamadas a endpoints que ya tienen JWT
        // Llama a la acción que ya obtiene contadores, alertas y últimas lecturas
        setStore({ dashboardLoading: true, dashboardError: null });
        try {
          // Reutiliza la lógica de fetchEstadisticasIniciales que ya obtiene estos datos
          await getActions().fetchEstadisticasIniciales();

          // Verifica si hubo un error en la carga de estadísticas
          const store = getStore();
          if (store.statsError) {
            throw new Error(store.statsError); // Propaga el error
          }

          // Los datos ya están en store.dashboardResumen gracias a fetchEstadisticasIniciales
          // Solo necesitamos devolverlos (o el componente puede leerlos directamente del store)
          setStore({ dashboardLoading: false }); // Finaliza la carga específica del dashboard
          return store.dashboardResumen; // Devuelve los datos cargados
        } catch (error) {
          console.error("Error fetching dashboard resumen:", error);
          setStore({
            dashboardError:
              error.message || "Error al cargar el resumen del dashboard.",
            dashboardLoading: false,
            dashboardResumen: null, // Limpia datos en error
          });
          // Opcional: desloguear si el error es 401 (ya manejado en las sub-llamadas)
          // throw error; // Propaga el error si el componente necesita manejarlo
          return null; // O devuelve null para indicar fallo
        }
      },

      //-- Proveedores Actions ---
      fetchProveedores: async () => {
        setStore({ proveedoresLoading: true, proveedoresError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/proveedores`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorData.msg || `Error ${response.status}`);
          }
          const data = await response.json();
          setStore({ proveedores: data || [], proveedoresLoading: false });
          return true;
        } catch (error) {
          console.error("Error fetching proveedores:", error);
          setStore({
            proveedoresError: error.message || "Error cargando proveedores.",
            proveedoresLoading: false,
            proveedores: [],
          });
          return false;
        }
      },

      addProveedor: async (proveedorData) => {
        setStore({ proveedoresLoading: true, proveedoresError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/proveedores`,
            {
              method: "POST",
              headers: getAuthHeaders(), // Incluye Content-Type por defecto
              body: JSON.stringify(proveedorData),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(responseData.msg || `Error ${response.status}`);
          }
          await getActions().fetchProveedores(); // Recarga la lista
          return true;
        } catch (error) {
          console.error("Error adding proveedor:", error);
          setStore({
            proveedoresError: error.message || "Error al agregar proveedor.",
            proveedoresLoading: false,
          });
          return false;
        }
      },

      updateProveedor: async (proveedorId, proveedorData) => {
        setStore({ proveedoresLoading: true, proveedoresError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/proveedores/${proveedorId}`,
            {
              method: "PUT",
              headers: getAuthHeaders(),
              body: JSON.stringify(proveedorData),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(responseData.msg || `Error ${response.status}`);
          }
          await getActions().fetchProveedores(); // Recarga la lista
          return true;
        } catch (error) {
          console.error("Error updating proveedor:", error);
          setStore({
            proveedoresError: error.message || "Error al actualizar proveedor.",
            proveedoresLoading: false,
          });
          return false;
        }
      },

      deleteProveedor: async (proveedorId) => {
        const store = getStore();
        const originalList = [...store.proveedores];
        const updatedList = originalList.filter((p) => p.id !== proveedorId);
        setStore({ proveedores: updatedList, proveedoresError: null }); // Optimistic update

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/proveedores/${proveedorId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // Sin Content-Type
            }
          );
          if (!response.ok) {
            setStore({ proveedores: originalList }); // Revert on error
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorData.msg || `Error ${response.status}`);
          }
          console.log(`Proveedor ${proveedorId} deleted.`);
          // No es necesario refetch si la actualización optimista es suficiente
          return true;
        } catch (error) {
          console.error("Error deleting proveedor:", error);
          setStore({
            proveedores: originalList,
            proveedoresError: error.message || "Error al eliminar proveedor.",
          });
          return false;
        }
      },

      clearProveedoresError: () => {
        setStore({ proveedoresError: null });
      },

      // --- Contactos Actions ---
      fetchContactosPorProveedor: async (proveedorId) => {
        // Limpia contactos si no hay proveedor seleccionado
        if (!proveedorId) {
          setStore({
            contactos: [],
            contactosLoading: false,
            contactosError: null,
          });
          return;
        }
        setStore({ contactosLoading: true, contactosError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/proveedores/${proveedorId}/contactos`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            // Si el proveedor no existe (404), limpia los contactos
            if (response.status === 404) {
              setStore({
                contactos: [],
                contactosLoading: false,
                contactosError: null,
              });
              return true; // No es un error fatal, solo no hay datos
            }
            throw new Error(errorData.msg || `Error ${response.status}`);
          }
          const data = await response.json();
          setStore({ contactos: data || [], contactosLoading: false });
          return true;
        } catch (error) {
          console.error(
            `Error fetching contactos for proveedor ${proveedorId}:`,
            error
          );
          setStore({
            contactosError: error.message || "Error cargando contactos.",
            contactosLoading: false,
            contactos: [],
          });
          return false;
        }
      },

      addContacto: async (proveedorId, contactoData) => {
        setStore({ contactosLoading: true, contactosError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/proveedores/${proveedorId}/contactos`,
            {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify(contactoData),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(responseData.msg || `Error ${response.status}`);
          }
          await getActions().fetchContactosPorProveedor(proveedorId); // Recarga contactos del proveedor actual
          return true;
        } catch (error) {
          console.error("Error adding contacto:", error);
          setStore({
            contactosError: error.message || "Error al agregar contacto.",
            contactosLoading: false,
          });
          return false;
        }
      },

      updateContacto: async (contactoId, contactoData, currentProveedorId) => {
        setStore({ contactosLoading: true, contactosError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/contactos_proveedor/${contactoId}`,
            {
              method: "PUT",
              headers: getAuthHeaders(),
              body: JSON.stringify(contactoData),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(responseData.msg || `Error ${response.status}`);
          }
          // Recarga los contactos del proveedor que se estaba viendo
          if (currentProveedorId) {
            await getActions().fetchContactosPorProveedor(currentProveedorId);
          }
          return true;
        } catch (error) {
          console.error("Error updating contacto:", error);
          setStore({
            contactosError: error.message || "Error al actualizar contacto.",
            contactosLoading: false,
          });
          return false;
        }
      },

      deleteContacto: async (contactoId, currentProveedorId) => {
        const store = getStore();
        const originalList = [...store.contactos];
        const updatedList = originalList.filter((c) => c.id !== contactoId);
        setStore({ contactos: updatedList, contactosError: null }); // Optimistic update

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/contactos_proveedor/${contactoId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false),
            }
          );
          if (!response.ok) {
            setStore({ contactos: originalList }); // Revert
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorData.msg || `Error ${response.status}`);
          }
          console.log(`Contacto ${contactoId} deleted.`);
          // No es necesario refetch si la actualización optimista es suficiente
          // Si prefieres refetch:
          // if (currentProveedorId) {
          //   await getActions().fetchContactosPorProveedor(currentProveedorId);
          // }
          return true;
        } catch (error) {
          console.error("Error deleting contacto:", error);
          setStore({
            contactos: originalList,
            contactosError: error.message || "Error al eliminar contacto.",
          });
          return false;
        }
      },

      clearContactosError: () => {
        setStore({ contactosError: null });
      },
      // --- Actividades Proveedor Actions ---
      fetchActividadesPorProveedor: async (proveedorId) => {
        // Limpia actividades si no hay proveedor seleccionado
        if (!proveedorId) {
          setStore({
            actividadesProveedor: [],
            actividadesLoading: false,
            actividadesError: null,
          });
          return;
        }
        setStore({ actividadesLoading: true, actividadesError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/proveedores/${proveedorId}/actividades`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            if (response.status === 404) {
              // Proveedor no encontrado
              setStore({
                actividadesProveedor: [],
                actividadesLoading: false,
                actividadesError: null,
              });
              return true; // No es error fatal
            }
            throw new Error(errorData.msg || `Error ${response.status}`);
          }
          const data = await response.json();
          setStore({
            actividadesProveedor: data || [],
            actividadesLoading: false,
          });
          return true;
        } catch (error) {
          console.error(
            `Error fetching actividades for proveedor ${proveedorId}:`,
            error
          );
          setStore({
            actividadesError: error.message || "Error cargando actividades.",
            actividadesLoading: false,
            actividadesProveedor: [],
          });
          return false;
        }
      },

      fetchAllActividades: async (estatus = null) => {
        setStore({ actividadesLoading: true, actividadesError: null });
        let url = `${process.env.BACKEND_URL}/actividades_proveedor`;
        if (estatus) {
          url += `?estatus=${encodeURIComponent(estatus)}`;
        }
        try {
          const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(),
          });
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorData.msg || `Error ${response.status}`);
          }
          const data = await response.json();
          setStore({
            actividadesProveedor: data || [],
            actividadesLoading: false,
          }); // Reutiliza el mismo estado
          return true;
        } catch (error) {
          console.error(
            `Error fetching all actividades (status: ${estatus}):`,
            error
          );
          setStore({
            actividadesError:
              error.message || "Error cargando todas las actividades.",
            actividadesLoading: false,
            actividadesProveedor: [],
          });
          return false;
        }
      },

      addActividadProveedor: async (proveedorId, actividadData) => {
        setStore({ actividadesLoading: true, actividadesError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/proveedores/${proveedorId}/actividades`,
            {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify(actividadData), // Asegúrate que las fechas estén en formato ISO
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(responseData.msg || `Error ${response.status}`);
          }
          // Recarga las actividades del proveedor actual
          await getActions().fetchActividadesPorProveedor(proveedorId);
          return true;
        } catch (error) {
          console.error("Error adding actividad:", error);
          setStore({
            actividadesError: error.message || "Error al agregar actividad.",
            actividadesLoading: false,
          });
          return false;
        }
      },

      updateActividadProveedor: async (
        actividadId,
        actividadData,
        currentProveedorId
      ) => {
        setStore({ actividadesLoading: true, actividadesError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/actividades_proveedor/${actividadId}`,
            {
              method: "PUT",
              headers: getAuthHeaders(),
              body: JSON.stringify(actividadData), // Asegúrate que las fechas estén en formato ISO
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(responseData.msg || `Error ${response.status}`);
          }
          // Recarga las actividades del proveedor que se estaba viendo (si aplica)
          if (currentProveedorId) {
            await getActions().fetchActividadesPorProveedor(currentProveedorId);
          } else {
            // Si no hay proveedor seleccionado, quizás recargar todas
            await getActions().fetchAllActividades();
          }
          return true;
        } catch (error) {
          console.error("Error updating actividad:", error);
          setStore({
            actividadesError: error.message || "Error al actualizar actividad.",
            actividadesLoading: false,
          });
          return false;
        }
      },

      deleteActividadProveedor: async (actividadId, currentProveedorId) => {
        const store = getStore();
        const originalList = [...store.actividadesProveedor];
        const updatedList = originalList.filter((a) => a.id !== actividadId);
        setStore({ actividadesProveedor: updatedList, actividadesError: null }); // Optimistic update

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/actividades_proveedor/${actividadId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false),
            }
          );
          if (!response.ok) {
            setStore({ actividadesProveedor: originalList }); // Revert
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorData.msg || `Error ${response.status}`);
          }
          console.log(`Actividad ${actividadId} deleted.`);
          // No es necesario refetch si la actualización optimista es suficiente
          // Si prefieres refetch:
          // if (currentProveedorId) {
          //   await getActions().fetchActividadesPorProveedor(currentProveedorId);
          // } else {
          //   await getActions().fetchAllActividades();
          // }
          return true;
        } catch (error) {
          console.error("Error deleting actividad:", error);
          setStore({
            actividadesProveedor: originalList,
            actividadesError: error.message || "Error al eliminar actividad.",
          });
          return false;
        }
      },

      clearActividadesError: () => {
        setStore({ actividadesError: null });
      },
      // --- Documentos Externos Actions ---
      fetchDocumentos: async () => {
        setStore({ documentosLoading: true, documentosError: null });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/documentos`,
            {
              method: "GET",
              headers: getAuthHeaders(), // <--- Ahora debería encontrar la función auxiliar
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorData.msg || `Error ${response.status}`);
          }
          const data = await response.json();
          setStore({ documentos: data || [], documentosLoading: false });
          return true;
        } catch (error) {
          console.error("Error fetching documentos:", error);
          setStore({
            documentosError: error.message || "Error cargando documentos.",
            documentosLoading: false,
            documentos: [],
          });
          return false;
        }
      },

      uploadDocumento: async (formData) => {
        setStore({
          uploadingDocumento: true,
          uploadDocumentoError: null,
          uploadDocumentoSuccess: null,
        });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/documentos`,
            {
              method: "POST",
              headers: getAuthHeaders(false), // <--- Ahora debería encontrar la función auxiliar
              body: formData,
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(responseData.msg || `Error ${response.status}`);
          }
          setStore({
            uploadingDocumento: false,
            uploadDocumentoSuccess: `Documento "${
              responseData.nombre || "nuevo"
            }" cargado con éxito.`,
          });
          await getActions().fetchDocumentos();
          return true;
        } catch (error) {
          console.error("Error uploading documento:", error);
          setStore({
            uploadingDocumento: false,
            uploadDocumentoError:
              error.message || "Error al subir el documento.",
          });
          return false;
        }
      },

      deleteDocumento: async (documentoId) => {
        const store = getStore();
        const originalDocumentos = [...store.documentos];
        const updatedDocumentos = originalDocumentos.filter(
          (doc) => doc.id !== documentoId
        );
        setStore({
          documentos: updatedDocumentos,
          deletingDocumentoId: documentoId,
          deleteDocumentoError: null,
        });

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/documentos/${documentoId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // <--- Ahora debería encontrar la función auxiliar
            }
          );

          if (!response.ok) {
            setStore({ documentos: originalDocumentos });
            let errorMsg = `Error ${response.status}`;
            try {
              const errorData = await response.json();
              errorMsg = errorData.msg || errorMsg;
            } catch (e) {
              /* Ignorar */
            }

            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorMsg);
          }

          console.log(`Documento ${documentoId} eliminado con éxito.`);
          setStore({ deletingDocumentoId: null });
          return true;
        } catch (error) {
          console.error("Error deleting documento:", error);
          if (store.documentos !== originalDocumentos) {
            setStore({ documentos: originalDocumentos });
          }
          setStore({
            deleteDocumentoError:
              error.message || "Error al eliminar el documento.",
            deletingDocumentoId: null,
          });
          return false;
        }
      },

      clearDocumentosError: () => {
        setStore({ documentosError: null });
      },
      clearUploadDocumentoStatus: () => {
        setStore({ uploadDocumentoError: null, uploadDocumentoSuccess: null });
      },
      clearDeleteDocumentoError: () => {
        setStore({ deleteDocumentoError: null });
      },

      // --- Detailed Alerts Actions ---
      fetchDetailedAlerts: async () => {
        setStore({ detailedAlertsLoading: true, detailedAlertsError: null });
        try {
            const response = await fetch(`${process.env.BACKEND_URL}/alertas_activas_detalladas`, {
                method: "GET",
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 401) getActions().logoutTrackerUser();
                throw new Error(errorData.msg || `Error fetching detailed alerts: ${response.status}`);
            }
            const data = await response.json();
            setStore({ detailedAlertsList: data || [], detailedAlertsLoading: false }); // Ensure data is an array
            return data;
        } catch (error) {
            console.error("Error in fetchDetailedAlerts:", error);
            setStore({
                detailedAlertsError: error.message || "Error cargando la lista de alertas detalladas.",
                detailedAlertsLoading: false,
                detailedAlertsList: [],
            });
            return null;
        }
      },
      clearDetailedAlertsError: () => {
          setStore({ detailedAlertsError: null });
      },
    },
  };
};

export default getState;
