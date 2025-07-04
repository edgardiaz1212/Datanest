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
      selectedAireDetails: null, // To store details when editing
      // --- Diagnostico Componentes ---
      diagnosticoComponentes: [],
      diagnosticoComponentesLoading: false,
      // --- Registro Diagnostico Aire ---
      selectedAireDiagnosticRecords: [], // New state for diagnostic records of a specific air
      selectedAireDiagnosticRecordsLoading: false, // New loading state
      selectedAireDiagnosticRecordsError: null, // New error state
      diagnosticoComponentesError: null,
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
      // --- Diagnostico Componentes ---
      diagnosticoComponentes: [],
      diagnosticoComponentesLoading: false,
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
        
        // --- Defensive reset of relevant states before attempting login ---
        // Esto asegura que, incluso si el store quedó en un estado inconsistente
        // por un cierre inesperado o un error previo, el login empiece limpio.
        setStore({
          trackerUser: null,
          token: null,
          isAuthenticated: false,
          // Reset other states that might hold stale data from a previous session
          // Puedes añadir más estados aquí si sospechas que alguno está causando conflicto
          aires: [],
          lecturas: [],
          umbrales: [],
          otrosEquiposList: [],
          mantenimientos: [],
          lecturasUbicacion: [],
          estadisticasUbicacion: [],
          ubicaciones: [],
          _rawLecturasGenerales: [],
          _rawLecturasAire: [],
          // No limpiamos proveedores/contactos/actividades/documentos aquí, ya que son menos críticos para el login principal
        });
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
        const store = getStore();
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
        const store = getStore();
        const actions = getActions();
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
            // En lugar de actualizar localmente, refetch la lista completa para asegurar consistencia
            await actions.fetchTrackerUsers();
            setStore({ loading: false, error: null });
            console.log("Tracker user updated successfully:", responseData);
            return true;
          } else {
             // Si la respuesta no es OK, maneja el error
             if (response.status === 401) actions.logoutTrackerUser(); // Ejemplo de manejo de 401
             setStore({ error: responseData.msg || "Error al actualizar usuario", loading: false });
   
            console.error("Error updating tracker user:", responseData.msg);
            return false;
          }
        } catch (error) {
          console.error("Network error updating tracker user:", error);
          setStore({ error: "Error de red al actualizar usuario.", loading: false });

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
                const actions = getActions(); // For logoutTrackerUser

        // Ruta protegida, necesita token
        setStore({ airesLoading: true, airesError: null });
        try {
          const response = await fetch(`${process.env.BACKEND_URL}/aires`, {
            method: "GET",
            headers: getAuthHeaders(), // <--- Usa cabeceras con token
          });
          if (!response.ok) {
            // Intenta parsear el errorData, pero maneja el caso de que no sea JSON
            let errorData = { msg: `Error fetching aires: ${response.status}` }; // Default error
            try {
               const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                  errorData = await response.json();
              } else {
                  errorData.msg = await response.text() || errorData.msg; // Get text if not JSON
              }
            } catch (e) {
              console.warn(
                "Could not parse error response as JSON in fetchAires"
              );
            }
            console.error(`fetchAires: Backend responded with status ${response.status}`, errorData);

            if (response.status === 401) actions.logoutTrackerUser();
            setStore({
              airesError:
                errorData?.msg || `Error fetching aires: ${response.status}`, // Defensive access to msg
              airesLoading: false,
              // NO establecer aires: [] aquí. Mantener datos obsoletos en caso de error.
            }); 
            return null; // Indicar fallo
          }
          const data = await response.json();
          if (Array.isArray(data)) {
            const currentAires = getStore().aires;
            // Only update store if the data has actually changed to prevent unnecessary re-renders
            // A simple JSON.stringify comparison can work for moderately sized arrays of simple objects.
            // For very large/complex data, consider a more sophisticated deep-equal check or versioning.
            if (JSON.stringify(currentAires) !== JSON.stringify(data)) {
              console.log("fetchAires: New aires data detected, updating store.");
              setStore({ aires: data, airesLoading: false, airesError: null });
            } else {
              console.log("fetchAires: Aires data is the same, not updating store reference.");
              // Still update loading/error state even if data is the same
              setStore({ airesLoading: false, airesError: null });
            }
            return data; // Devolver datos para posible encadenamiento
 
          } else {
            // Este caso debería ser idealmente capturado por response.ok o ser un código de error específico del servidor
            setStore({
                airesError: "Formato de respuesta inesperado del servidor al listar aires.",                
                airesLoading: false
                // NO establecer aires: [] aquí.
            });
            return null; // Indicar fallo
          }
        } catch (error) {
          console.error("Error in fetchAires:", error);
          setStore({
            airesError: error.message || "Error cargando la lista de aires.",
            airesLoading: false,
            // No limpiar store.aires aquí para no perder datos si ya existían y esto fue un error de red temporal.
          });
          return null;
        }
      },

      fetchAireDetails: async (aireId) => {
        // Ruta protegida, necesita token
        try {
          setStore({ selectedAireDetails: null }); // Clear previous details
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
          const details = await response.json();
          setStore({ selectedAireDetails: details }); // Store details in Flux
          return details;
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
        setStore({ selectedAireDetails: null, selectedAireDiagnosticRecords: [] });

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
            if (response.status === 401) {
              getActions().logoutTrackerUser();
              // No continuar si es 401, el logout se encargará de limpiar
              return false; // Opcional: podrías lanzar un error específico para 401
            }
            throw new Error(
              responseData.msg || `Error updating aire: ${response.status}`
            );
          }
          // After updating a specific aire, refetch its details AND the main list
          await getActions().fetchAireDetails(aireId); // Actualiza detalles para la vista de detalle
          await getActions().fetchAires(); // <--- AÑADIDO: Refresca la lista principal y maneja airesLoading
          return true;
        } catch (error) {
          console.error("Error in updateAire:", error);
          setStore({
            airesError:
              error.message || "Error al actualizar el aire acondicionado.",
            airesLoading: false, // Asegúrate de que loading se ponga en false aquí también
          });
          return false;
        }
      },

      deleteAire: async (aireId) => {
        // Ruta protegida, necesita token
        const store = getStore();
        const actions = getActions();
        if (store.selectedAireDetails?.id === aireId) setStore({ selectedAireDetails: null, selectedAireDiagnosticRecords: [] });
        
        setStore({ airesError: null, airesLoading: true }); 
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/aires/${aireId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // <--- Usa cabeceras con token (sin Content-Type)
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ msg: `Error ${response.status}` }));
            if (response.status === 401) actions.logoutTrackerUser();
            const errorMessage = errorData.msg || `Error deleting aire: ${response.status}`;
            setStore({ airesError: errorMessage, airesLoading: false }); // Set loading false
            throw new Error(errorMessage); // Propagate error
          }
          console.log(`Aire ${aireId} deleted successfully.`);
           // After successful deletion, refetch the aires list.
          // fetchAires will handle its own loading states and update the aires list.
          await actions.fetchAires(); 
          // fetchAires should set airesLoading to false upon completion.
          return true;
        } catch (error) {
          console.error("Error in deleteAire:", error);
           // This catch handles network errors for the DELETE request,
          // or errors propagated from the !response.ok block,
          // or errors from fetchAires if it throws.
          setStore({ 
            airesError:
              error.message || "Error al eliminar el aire acondicionado.",
           airesLoading: false, // Crucial: ensure loading is false
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
            setStore({
              umbralesError:
                errorData.msg ||
                `Error fetching umbrales: ${umbralesResponse.status}`,
              umbralesLoading: false,
            });
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
            temp_min: formData.temp_min, // Keep as string, backend will parse
            temp_max: formData.temp_max,
            hum_min: formData.hum_min,
            hum_max: formData.hum_max,
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
          queryParams.append("page", page);
          queryParams.append("per_page", perPage);

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
            mantenimientosPaginationInfo: {
              total_items: 0,
              total_pages: 0,
              current_page: 1,
              per_page: perPage,
              has_next: false,
              has_prev: false,
            },
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

          // formData ya es un objeto FormData y debería contener 'resolucion_alertas_data'
          // si fue añadido por Mantenimientos.jsx
          // console.log("Enviando a addMantenimiento (Flux):", Object.fromEntries(formData.entries()));

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
          // Es importante que el backend actualice los estados de los aires y los diagnósticos.
          // Podríamos necesitar refetch de aires y alertas aquí si el backend no lo hace implícitamente.
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
            setStore({
              // Establecer el error global
              mantenimientosError:
                errorData.msg ||
                `Error deleting mantenimiento: ${response.status}`,
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
              mantenimientosError:
                error.message || "Error al eliminar el mantenimiento.",
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
          // Cargar otros equipos si no están ya en el store, para el dispositivosMap
          const otrosEquiposListStore = getStore().otrosEquiposList;
          const currentOtrosEquiposList = otrosEquiposListStore.length > 0 ? otrosEquiposListStore : await getActions().fetchOtrosEquipos() || [];

          await getActions().fetchUmbrales();
          const currentAiresForMap = fetchedAiresList || getStore().aires;          
          if (!fetchedAiresList && !getStore().airesError) {
            console.warn(
              "fetchAires pudo haber fallado en devolver datos para airesMap en fetchLecturas, o un error en fetchAires no se propagó como airesError."
            );
          }

          let url;
          const queryParams = new URLSearchParams();

          if (filters.dispositivo_id && filters.tipo_dispositivo) {
            if (filters.tipo_dispositivo === 'aire') {
                url = `${process.env.BACKEND_URL}/aires/${filters.dispositivo_id}/lecturas`;
            } else if (filters.tipo_dispositivo === 'otro_equipo') {
                url = `${process.env.BACKEND_URL}/otros_equipos/${filters.dispositivo_id}/lecturas`;
            } else {
                console.warn(`Tipo de dispositivo no reconocido en filtro: ${filters.tipo_dispositivo}. Mostrando últimas globales.`);
                url = `${process.env.BACKEND_URL}/lecturas/ultimas`;
                queryParams.append("limite", perPage); // la ruta /ultimas no suele estar paginada así
            }
            queryParams.append("page", page);
            queryParams.append("per_page", perPage);
            url = `${url}?${queryParams.toString()}`;
          } else {
            console.warn("No hay filtro de dispositivo, mostrando últimas lecturas globales.");
            url = `${process.env.BACKEND_URL}/lecturas/ultimas`;
            queryParams.append("limite", perPage);
          }

          // Si no hay aire_id, usamos la ruta global que actualmente no está paginada en el backend
          // de la misma manera. Para este ejemplo, la paginación completa se enfoca en la vista de un aire específico.
          const finalUrl = `${url}?${queryParams.toString()}`;

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

          // El backend ahora serializa con nombre_dispositivo y ubicacion_dispositivo
          if (filters.dispositivo_id && data.items) {
            // Respuesta paginada para un aire específico
            
            // El backend ya ordena por fecha desc.
            setStore({
              lecturas: data.items || [], 
              lecturasPaginationInfo: {
                total_items: data.total_items,
                total_pages: data.total_pages,
                current_page: data.current_page || 1, // Ensure current_page has a fallback
                per_page: data.per_page,
                has_next: data.has_next,
                has_prev: data.has_prev,
              },
              lecturasLoading: false,
            });          } else if (!filters.dispositivo_id && Array.isArray(data)) { // Changed condition and fixed processedLecturas
            
            // Respuesta no paginada (lista) para lecturas globales (/lecturas/ultimas)
            setStore({
              lecturas: data || [], // Use data directly
              lecturasPaginationInfo: {
                // Info de paginación simulada para la vista global limitada
                total_items: (data || []).length,
                total_pages: 1,
                current_page: 1,
                per_page: perPage,
                has_next: false,
                has_prev: false,
              },
              lecturasLoading: false,
            });
          } else {
            console.error(
              "Unexpected data structure from fetchLecturas:",
              data
            );
            throw new Error("Formato de datos de lecturas inesperado.");
          }
        } catch (error) {
          console.error("Error in fetchLecturas:", error);
          setStore({
            lecturasError: error.message || "Error cargando las lecturas.",
            lecturasLoading: false,
            lecturas: [],
            lecturasPaginationInfo: {
              total_items: 0,
              total_pages: 0,
              current_page: 1,
              per_page: perPage,
              has_next: false,
              has_prev: false,
            },
          });
          return false;
        }
      },
      addLectura: async (dispositivoId, lecturaData, tipoDispositivo = 'aire') => {
        // tipoDispositivo puede ser 'aire' o 'otro_equipo'
 
        // Ruta protegida, necesita token
        // No se establece lecturasLoading aquí para no afectar la tabla principal
        // El modal manejará su propio estado de 'isSubmitting'
        // setStore({ lecturasError: null }); // Limpiar error previo
        try {
          let url;
          if (tipoDispositivo === 'aire') {
              url = `${process.env.BACKEND_URL}/aires/${dispositivoId}/lecturas`;
          } else if (tipoDispositivo === 'otro_equipo') { // Asumiendo que 'otro_equipo' es el identificador para termohigrómetros
              url = `${process.env.BACKEND_URL}/otros_equipos/${dispositivoId}/lecturas`;
          } else {
              throw new Error("Tipo de dispositivo no válido para agregar lectura.");
          }
          const response = await fetch(url, {
            method: "POST",
            headers: getAuthHeaders(), // Usa cabeceras con token
            body: JSON.stringify({
              // Asegúrate que el backend espera estos nombres
              fecha_hora: lecturaData.fecha_hora, // 'YYYY-MM-DDTHH:MM:SS'
              temperatura: lecturaData.temperatura,
              humedad: lecturaData.humedad, // Puede ser null
            }),
          });
          // Validar que la humedad esté presente si es un termohigrómetro (otro_equipo)
          if (tipoDispositivo === 'otro_equipo' && (lecturaData.humedad === null || lecturaData.humedad === undefined || String(lecturaData.humedad).trim() === '')) {
            // El backend ya debería manejar esto, pero una validación temprana en frontend es buena.
            // throw new Error("Humedad es requerida para termohigrómetros.");
          }
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            // Propagar el mensaje de error del backend
            throw new Error(
              responseData.msg || `Error agregando lectura: ${response.status}`
            );
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

      updateLectura: async (lecturaId, lecturaData) => {
        // Ruta protegida, necesita token
        // No se establece lecturasLoading aquí para no afectar la tabla principal
        // El modal manejará su propio estado de 'isSubmitting'
        // setStore({ lecturasError: null }); // Limpiar error previo
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/lecturas/${lecturaId}`,
            {
              method: "PUT",
              headers: getAuthHeaders(), // Usa cabeceras con token y Content-Type
              body: JSON.stringify({
                fecha_hora: lecturaData.fecha_hora, // 'YYYY-MM-DDTHH:MM:SS'
                temperatura: lecturaData.temperatura,
                humedad: lecturaData.humedad, // Puede ser null
              }),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg || `Error actualizando lectura: ${response.status}`
            );
          }
          return true; // Indica éxito
        } catch (error) {
          console.error("Error in updateLectura:", error);
          // El error se manejará en el componente que llama a esta acción
          throw error; // Re-lanzar el error para que el componente lo capture
        }
      },

      deleteLectura: async (lecturaId) => {
        // Ruta protegida, necesita token
        const store = getStore();
        // Eliminamos la actualización optimista. El componente se encargará de recargar.
        setStore({ lecturasError: null }); // Limpiar error previo
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/lecturas/${lecturaId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // <--- Usa cabeceras con token (sin Content-Type)
            }
          );
          if (!response.ok) {
            // No es necesario revertir la actualización optimista si se eliminó.
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg || `Error deleting lectura: ${response.status}`
            );
          }
          console.log(`Lectura ${lecturaId} deleted successfully.`);
          // No es necesario actualizar el store.lecturas aquí.
          return true;
        } catch (error) {
          console.error("Error in deleteLectura:", error);
          // El error ya debería estar establecido si fue un error HTTP.
          // Esto es para errores de red u otros.
          if (!store.lecturasError) {
            // Solo establece si no hay un error HTTP previo
            setStore({
              lecturasError: error.message || "Error al eliminar la lectura.",
            });
          }
          return false;
        }
      },

      clearLecturasError: () => {
        setStore({ lecturasError: null });
      },

      setLecturasError: (errorMessage) => {
        // Nueva acción
        setStore({ lecturasError: errorMessage });
      },

      uploadLecturasExcel: async (file, onProgress) => {
        // onProgress no se usa activamente aquí, pero se deja por si se implementa con Axios
        const actions = getActions();
        try {
          const formData = new FormData();
          formData.append("file", file);

if (!file || !(file instanceof File)) {
  return { success: false, message: "Archivo inválido." };
}

const allowedExtensions = [".xlsx", ".xls"];
const fileExtension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

if (!allowedExtensions.includes(fileExtension)) {
  return { success: false, message: "Formato no soportado. Usa .xlsx o .xls" };
}
          const response = await fetch(
            `${process.env.BACKEND_URL}/lecturas/upload_excel`,
            {
              method: "POST",
              headers: getAuthHeaders(false), // No 'Content-Type', FormData lo maneja
              body: formData,
              // onUploadProgress: onProgress, // Esto es más para Axios, fetch no lo soporta directamente
            }
          );

          const responseData = await response.json();

          if (!response.ok) {
            if (response.status === 401) actions.logoutTrackerUser();
            // Devuelve el objeto de error del backend
            return {
              success: false,
              message: responseData.msg || `Error ${response.status}`,
              errors: responseData.errors || [],
            };
          }
          // Devuelve el objeto de éxito del backend
          return {
            success: true,
            message: responseData.msg || "Archivo procesado.",
            details: responseData,
          };
        } catch (error) {
          console.error("Error in uploadLecturasExcel:", error);
          return {
            success: false,
            message:
              error.message ||
              "Error de red o del servidor al subir el archivo.",
            errors: [],
          };
        }
      },

      fetchLecturasPorUbicacion: async (ubicacion, fechaDesde = null, fechaHasta = null) => {
        // Limpiar datos y detener si no hay ubicación seleccionada
        if (!ubicacion) {
          setStore({
            lecturasUbicacion: [],
            lecturasUbicacionLoading: false,
            lecturasUbicacionError: null,
          });
          return;
        }

        // Indicar que la carga de datos para la ubicación ha comenzado
        setStore({
          lecturasUbicacionLoading: true,
          lecturasUbicacionError: null,
        });

        try {
          // Construir la URL base. Se pide un límite de 100 lecturas por defecto.
          let url = `${process.env.BACKEND_URL}/lecturas/ubicacion/${encodeURIComponent(ubicacion)}`;
          const params = new URLSearchParams(); // Usar URLSearchParams para construir la query string

          // Añadir parámetros de fecha si están definidos
          if (fechaDesde) {
            params.append('fecha_desde', fechaDesde);
            params.append('fecha_hasta', fechaHasta);
            params.append('limite', '2000'); // Límite más alto si hay fechas
          } else {
            params.append('limite', '100'); // Límite si no hay fechas
          }
          if (params.toString()) {
            url += `?${params.toString()}`;
          }

          // Realizar la petición al backend
          const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(),
          });

          if (!response.ok) {
            // Si la respuesta no es exitosa, procesar el error
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorData.msg || `Error ${response.status}`);
          }

          const data = await response.json();
          setStore({
            lecturasUbicacion: Array.isArray(data) ? data : [], // Asegurar que siempre sea un array
            lecturasUbicacionLoading: false,
          });
        } catch (error) {
          // Capturar errores de red o errores lanzados
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
              return {
                _error: true,
                status: resp.status,
                msg: errorData.msg || `Error ${resp.status}`,
              };
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
          if (
            isErrorResponse(estGenData) ||
            isErrorResponse(estUbicData) ||
            isErrorResponse(lecturasGenData) ||
            isErrorResponse(contadoresData) ||
            isErrorResponse(alertasCountData) ||
            isErrorResponse(ubicacionesData)
          ) {
            console.warn(
              "Una o más llamadas iniciales fallaron después del login, posiblemente por token. El logout ya debería haberse activado."
            );
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

      fetchEstadisticasAire: async (aireId, fechaDesde = null, fechaHasta = null) => { // Aceptar fechas
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
             const checkResp = async (resp, name) => {
             console.log(`DEBUG: checkResp for ${name}, status: ${resp.status}`);
            if (!resp.ok) {
              const errorData = await resp
                .json()
                .catch(() => ({ msg: "Failed to parse error response" }));
              if (resp.status === 401) getActions().logoutTrackerUser(); // Logout on 401
              console.error(`Error cargando ${name}: ${errorData.msg || resp.status}`, errorData);
              throw new Error(
                `Error cargando ${name}: ${errorData.msg || resp.status}`
              );
            }
            // Handle cases where the response might be empty (e.g., 204 No Content)
            const text = await resp.text();
            // console.log(`DEBUG: checkResp for ${name}, text response:`, text.substring(0,100)); // Log first 100 chars
            try {
              return text ? JSON.parse(text) : null; // Return null for empty responses
            } catch (e) {
              console.error(`Failed to parse JSON for ${name}:`, text);
              throw new Error(`Respuesta inválida del servidor para ${name}.`);
            }
          };
          // Fetch stats and readings concurrently
          const paramsLecturas = new URLSearchParams();
          // Ajustar per_page según sea necesario, o quitarlo si el backend devuelve todo para el rango
          paramsLecturas.append('per_page', '500'); // Traer más puntos si se filtra por fecha
          if (fechaDesde) paramsLecturas.append('fecha_desde', fechaDesde);
          if (fechaHasta) paramsLecturas.append('fecha_hasta', fechaHasta);

          const [statsResponse, lecturasResponse] = await Promise.all([
            fetch(`${process.env.BACKEND_URL}/aires/${aireId}/estadisticas`, {
              headers: getAuthHeaders(),
            }),
            fetch(
              `${process.env.BACKEND_URL}/aires/${aireId}/lecturas?${paramsLecturas.toString()}`,
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

// --- CORRECCIÓN AQUÍ ---
          // lecturasData es el objeto de paginación { items: [...], ... }
          // Necesitamos el array de lecturasData.items
          let validLecturas = [];
          if (lecturasData && Array.isArray(lecturasData.items)) {
            validLecturas = lecturasData.items;
          } else if (Array.isArray(lecturasData)) { // Fallback por si la API cambia y devuelve un array directamente
            validLecturas = lecturasData;
          }

          if (!Array.isArray(lecturasData)) {
            console.warn(`fetchEstadisticasAire: lecturasData for aire ${aireId} was not an array. Received:`, lecturasData);
          }

          // --- Calculate Variations ---
          let variacionTemp = 0;
          let variacionHum = 0;
          if (validLecturas.length > 1) {
            // Need at least 2 readings for variation
            // Filter out non-numeric or null values before Math.max/min
            const temps = validLecturas.map((l) => l.temperatura).filter(t => typeof t === 'number' && !isNaN(t));
            const hums = validLecturas.map((l) => l.humedad).filter(h => typeof h === 'number' && !isNaN(h));
            const tempMax = temps.length > 0 ? Math.max(...temps) : 0;
            const tempMin = temps.length > 0 ? Math.min(...temps) : 0;
            const humMax = hums.length > 0 ? Math.max(...hums) : 0;
            const humMin = hums.length > 0 ? Math.min(...hums) : 0;
            variacionTemp = tempMax - tempMin;
            variacionHum = humMax - humMin;
          }
          // --- End Variation Calculation ---

          // Get AC info from store
          
          const store = getStore();
          let currentAiresList = store.aires; // Renombrar para claridad
          // console.log("DEBUG: Initial airesList from store:", currentAiresList);

          // Check if airesList is empty or not an array
          if (!Array.isArray(currentAiresList) || currentAiresList.length === 0) {
            console.warn("fetchEstadisticasAire: store.aires está vacío o no es un array. Intentando cargar...");
            const fetchedAiresData = await getActions().fetchAires(); // fetchAires devuelve los datos o null
            
            if (fetchedAiresData && Array.isArray(fetchedAiresData) && fetchedAiresData.length > 0) {
                 currentAiresList = fetchedAiresData; // Usar los datos devueltos directamente
                 console.log("fetchEstadisticasAire: airesList poblada desde el retorno de fetchAires, items:", currentAiresList.length);
                 // Nota: fetchAires ya debería haber actualizado el store también.
                 // Si quisieras forzar una actualización del store aquí (aunque debería ser redundante):
                 // if (getStore().aires.length === 0) setStore({ aires: currentAiresList });
            } else {
                // Si fetchAires falló o no devolvió datos, currentAiresList podría seguir vacío.
                // Intentar leer del store como último recurso, aunque probablemente también esté vacío.
                currentAiresList = getStore().aires;
                console.error("fetchEstadisticasAire: fetchAires no devolvió datos válidos. Usando store.aires (puede estar vacío). Items en store:", currentAiresList.length);
            }
          }
          const validAiresList = Array.isArray(currentAiresList) ? currentAiresList : [];
          const aireInfo = validAiresList.find((a) => a.id === parseInt(aireId)); // parseInt es importante
          // --- Combine data into processedStatsAire ---
          const processedStatsAire = {
            // Spread the fetched stats (handle if statsData is null)
            ...(statsData || {}),
            // Add calculated variations
            variacion_temperatura: variacionTemp,
            variacion_humedad: variacionHum,
            // Add AC name and location for convenience, ensure aireId is number
            aire_id: parseInt(aireId), 
            nombre: aireInfo?.nombre || "Desconocido",
            ubicacion: aireInfo?.ubicacion || "Desconocida",
          };
          // Log the final processed data
          console.log("fetchEstadisticasAire: Final processedStatsAire:", processedStatsAire);
          console.log("fetchEstadisticasAire: Raw readings for charts (_rawLecturasAire):", validLecturas.length, "items");
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
            // No limpiar proveedores aquí si ya hay datos; el error se mostrará.
            // Si es la carga inicial y falla, la lista permanecerá vacía como se inicializó.
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

          // Optimistic update:
          const newProvider = responseData; // El backend devuelve el proveedor creado
          const currentProveedores = getStore().proveedores;
          // Añadir el nuevo proveedor y re-ordenar la lista (asumiendo que se muestra ordenada por nombre)
          const updatedProveedores = [...currentProveedores, newProvider].sort(
            (a, b) => a.nombre.localeCompare(b.nombre)
          );

          setStore({
            proveedores: updatedProveedores,
            proveedoresError: null, // Limpiar error previo si el POST fue exitoso
            proveedoresLoading: false, // Terminar el loading del 'add' aquí
          });

          // Intentar una sincronización completa con el backend en segundo plano.
          // fetchProveedores manejará sus propios estados de carga/error.
          getActions()
            .fetchProveedores()
            .catch((fetchErr) => {
              console.warn(
                "AddProveedor: Background refresh via fetchProveedores failed after optimistic update.",
                fetchErr
              );
              // El error de fetchProveedores ya se maneja en esa acción (no limpia la lista)
              // y el store.proveedoresError se establecerá allí si es necesario.
            });

          return true;
        } catch (error) {
          console.error("Error adding proveedor:", error);
          setStore({
            proveedoresError: error.message || "Error al agregar proveedor.",
            proveedoresLoading: false, // Asegurar que loading se resetea en error del POST
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
        // Quitar actualización optimista para forzar el refetch y asegurar consistencia.
        setStore({ proveedoresLoading: true, proveedoresError: null }); // Indicar que estamos procesando

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/proveedores/${proveedorId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // Sin Content-Type
            }
          );
          if (!response.ok) {
            // setStore({ proveedores: originalList }); // No es necesario revertir si no hay optimistic update
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            setStore({ // Establecer error y detener la carga
                proveedoresError: errorData.msg || `Error ${response.status}`,
                proveedoresLoading: false
            });
            throw new Error(errorData.msg || `Error ${response.status}`); // Propagar el error
          }
          console.log(`Proveedor ${proveedorId} deleted.`);
          // Refetch la lista de proveedores para actualizar el store
          await getActions().fetchProveedores();
          // fetchProveedores ya maneja el estado de carga y error.
          return true;
        } catch (error) {
          console.error("Error deleting proveedor:", error);
          // Si el error no fue establecido por el bloque !response.ok
          if (!store.proveedoresError) { // Solo establece si no hay un error HTTP previo
            setStore({
                // proveedores: originalList, // No es necesario si no hay optimistic update
                proveedoresError: error.message || "Error al eliminar proveedor.",
                proveedoresLoading: false // Asegurar que loading se resetea
            });
          }
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

      deleteActividadProveedor: async (actividadId, currentProveedorId, currentStatusFilter) => { // Añadido currentStatusFilter
        const store = getStore();
         // No haremos actualización optimista aquí, vamos a refetch para asegurar consistencia.
        setStore({ actividadesLoading: true, actividadesError: null }); // Indicar que estamos procesando

        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/actividades_proveedor/${actividadId}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false),
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
 setStore({ // Establecer error y detener la carga
                actividadesError: errorData.msg || `Error ${response.status}`,
                actividadesLoading: false
            });
            throw new Error(errorData.msg || `Error ${response.status}`); // Propagar el error
           }
          console.log(`Actividad ${actividadId} deleted.`);
         // Refetch la lista apropiada para actualizar el store
          if (currentProveedorId) {
            await getActions().fetchActividadesPorProveedor(currentProveedorId);
          } else {
            // Si no hay proveedor específico, es la vista "Otros" sin filtro de proveedor,
            // o la pestaña "Energía" (aunque para energía no se debería poder borrar desde aquí).
            // Usamos el filtro de estado actual si existe.
            await getActions().fetchAllActividades(currentStatusFilter || null);
          }
          // Las acciones fetch... ya manejan el estado de carga y error.

          return true;
        } catch (error) {
          console.error("Error deleting actividad:", error);
           // Si el error no fue establecido por el bloque !response.ok
          if (!store.actividadesError) {
            setStore({
                actividadesError: error.message || "Error al eliminar actividad.",
                actividadesLoading: false // Asegurar que loading se resetea
            });
          }
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
        // Clear previous alerts list while loading
        setStore({ detailedAlertsList: [] });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/alertas_activas_detalladas`,
            {
              method: "GET",
              headers: getAuthHeaders(),
            }
          );
          if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg ||
                `Error fetching detailed alerts: ${response.status}`
            );
          }
          const data = await response.json();
          setStore({
            detailedAlertsList: data || [],
            detailedAlertsLoading: false,
          }); // Ensure data is an array
          return data;
        } catch (error) {
          console.error("Error in fetchDetailedAlerts:", error);
          setStore({
            detailedAlertsError:
              error.message || "Error cargando la lista de alertas detalladas.",
            detailedAlertsLoading: false,
            detailedAlertsList: [],
          });
          return null;
        }
      },
      clearDetailedAlertsError: () => {
        setStore({ detailedAlertsError: null });
      },
      // --- DiagnosticoComponente Actions ---
      fetchDiagnosticoComponentes: async (filters = {}) => {
        setStore({
          diagnosticoComponentesLoading: true,
          diagnosticoComponentesError: null,
        });
        try {
          const queryParams = new URLSearchParams(filters);
          const url = `${
            process.env.BACKEND_URL
          }/diagnostico_componentes?${queryParams.toString()}`;

          const response = await fetch(url, {
            method: "GET",
            headers: getAuthHeaders(),
          });
          if (!response.ok) {
            let errorMsg = `Error fetching diagnostico componentes: ${response.status} ${response.statusText}`;
            try {
              // Check content type before trying to parse as JSON
              const contentType = response.headers.get("content-type");
              if (contentType && contentType.includes("application/json")) {
                const errorData = await response.json();
                errorMsg = errorData.msg || errorMsg;
              } else {
                // If not JSON, it might be HTML. You could read response.text() here for debugging
                // but for the error message, a generic one might be better.
                // console.error("Non-JSON error response from server, status:", response.status);
              }
            } catch (e) {
              console.error(
                "Failed to parse error response or get content-type:",
                e
              );
            }

            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorMsg);
          }
          const data = await response.json();
          setStore({
            diagnosticoComponentes: data || [],
            diagnosticoComponentesLoading: false,
          });
          return data;
        } catch (error) {
          console.error("Error in fetchDiagnosticoComponentes:", error);
          setStore({
            diagnosticoComponentesError:
              error.message || "Error cargando lista de diagnósticos.",
            diagnosticoComponentesLoading: false,
            diagnosticoComponentes: [],
          });
          return null;
        }
      },

      addDiagnosticoComponente: async (diagnosticoData) => {
        setStore({
          diagnosticoComponentesLoading: true,
          diagnosticoComponentesError: null,
        });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/diagnostico_componentes`,
            {
              method: "POST",
              headers: getAuthHeaders(),
              body: JSON.stringify(diagnosticoData),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg || `Error adding diagnostico: ${response.status}`
            );
          }
          await getActions().fetchDiagnosticoComponentes(); // Refrescar lista
          return true;
        } catch (error) {
          console.error("Error in addDiagnosticoComponente:", error);
          setStore({
            diagnosticoComponentesError:
              error.message || "Error al agregar diagnóstico.",
            diagnosticoComponentesLoading: false,
          });
          return false;
        }
      },

      updateDiagnosticoComponente: async (id, diagnosticoData) => {
        setStore({
          diagnosticoComponentesLoading: true,
          diagnosticoComponentesError: null,
        });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/diagnostico_componentes/${id}`,
            {
              method: "PUT",
              headers: getAuthHeaders(),
              body: JSON.stringify(diagnosticoData),
            }
          );
          const responseData = await response.json();
          if (!response.ok) {
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              responseData.msg ||
                `Error updating diagnostico: ${response.status}`
            );
          }
          await getActions().fetchDiagnosticoComponentes(); // Refrescar lista
          return true;
        } catch (error) {
          console.error("Error in updateDiagnosticoComponente:", error);
          setStore({
            diagnosticoComponentesError:
              error.message || "Error al actualizar diagnóstico.",
            diagnosticoComponentesLoading: false,
          });
          return false;
        }
      },

      deleteDiagnosticoComponente: async (id) => {
        // Optimistic update or refetch after delete
        setStore({
          diagnosticoComponentesLoading: true,
          diagnosticoComponentesError: null,
        });
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/diagnostico_componentes/${id}`,
            {
              method: "DELETE",
              headers: getAuthHeaders(false), // No content-type for DELETE
            }
          );
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(
              errorData.msg || `Error deleting diagnostico: ${response.status}`
            );
          }
          await getActions().fetchDiagnosticoComponentes(); // Refrescar lista
          return true;
        } catch (error) {
          console.error("Error in deleteDiagnosticoComponente:", error);
          setStore({
            diagnosticoComponentesError:
              error.message || "Error al eliminar diagnóstico.",
            diagnosticoComponentesLoading: false,
          });
          return false;
        }
      },

      clearDiagnosticoComponentesError: () => {
        setStore({ diagnosticoComponentesError: null });
      },

// --- RegistroDiagnosticoAire Actions ---
fetchDiagnosticRecordsByAire: async (aireId) => {
  if (!aireId) {
    setStore({ selectedAireDiagnosticRecords: [], selectedAireDiagnosticRecordsLoading: false, selectedAireDiagnosticRecordsError: null });
    return;
  }
  setStore({ selectedAireDiagnosticRecordsLoading: true, selectedAireDiagnosticRecordsError: null });
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/aires/${aireId}/registros_diagnostico`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      let errorMsg = `Error fetching diagnostic records for aire ${aireId}: ${response.status} ${response.statusText}`;
      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMsg = errorData.msg || errorMsg;
        } else {
          // console.error("Non-JSON error response from server (fetchDiagnosticRecordsByAire), status:", response.status);
        }
      } catch (e) {
        console.error("Failed to parse error response or get content-type (fetchDiagnosticRecordsByAire):", e);
      }
      if (response.status === 401) getActions().logoutTrackerUser();
      throw new Error(errorMsg);
    }
    const data = await response.json();
    setStore({ selectedAireDiagnosticRecords: data || [], selectedAireDiagnosticRecordsLoading: false });
    return data;
  } catch (error) {
    console.error(`Error in fetchDiagnosticRecordsByAire for aire ${aireId}:`, error);
    setStore({
      selectedAireDiagnosticRecordsError: error.message || "Error cargando registros de diagnóstico.",
      selectedAireDiagnosticRecordsLoading: false,
      selectedAireDiagnosticRecords: [],
    });
    return null;
  }
},

addDiagnosticRecord: async (aireId, recordData) => {
  setStore({ selectedAireDiagnosticRecordsLoading: true, selectedAireDiagnosticRecordsError: null }); // Use specific loading state
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/aires/${aireId}/registros_diagnostico`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(recordData),
    });
    const responseData = await response.json();
    if (!response.ok) {
      if (response.status === 401) getActions().logoutTrackerUser();
      let errorMsg = responseData.msg || `Error adding diagnostic record: ${response.status}`;
      if (response.status === 405) {
        errorMsg = `Método no permitido (405) para la URL. Verifique la configuración de la ruta en el backend. (${errorMsg})`;
      }
      throw new Error(errorMsg);
    }
    // Refetch the list for the current aire after adding
    await getActions().fetchDiagnosticRecordsByAire(aireId);
    return true;
  } catch (error) {
    console.error("Error in addDiagnosticRecord:", error);
    setStore({ selectedAireDiagnosticRecordsError: error.message || "Error al agregar registro de diagnóstico.", selectedAireDiagnosticRecordsLoading: false });
    throw error; // Re-throw for component handling
  }
},

deleteDiagnosticRecord: async (recordId, aireId) => {
  // Optimistic update or refetch after delete
  setStore({ selectedAireDiagnosticRecordsLoading: true, selectedAireDiagnosticRecordsError: null }); // Use specific loading state
  try {
    const response = await fetch(`${process.env.BACKEND_URL}/registros_diagnostico/${recordId}`, {
      method: "DELETE",
      headers: getAuthHeaders(false), // No content-type for DELETE
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      if (response.status === 401) getActions().logoutTrackerUser();
      throw new Error(errorData.msg || `Error deleting diagnostic record: ${response.status}`);
    }
    // Refetch the list for the current aire after deleting
    await getActions().fetchDiagnosticRecordsByAire(aireId);
    return true;
  } catch (error) {
    console.error("Error in deleteDiagnosticRecord:", error);
    setStore({ selectedAireDiagnosticRecordsError: error.message || "Error al eliminar registro de diagnóstico.", selectedAireDiagnosticRecordsLoading: false });
    throw error; // Re-throw for component handling
  }
},

clearSelectedAireDiagnosticRecordsError: () => {
  setStore({ selectedAireDiagnosticRecordsError: null });
},

// --- Acción para obtener TODOS los registros de diagnóstico (o idealmente, filtrados por no solucionados en backend) ---
fetchAllDiagnosticRecords: async (filters = {}) => {
    // Ejemplo: filters = { solucionado: false }
    // Esta acción es un placeholder, necesitarás una ruta de backend para esto.
    // Por ahora, vamos a simular que obtenemos todos y filtramos en el frontend,
    // pero lo ideal es que el backend haga el filtrado.
    setStore({ loading: true, error: null }); // Usar un estado de carga/error genérico o crear uno nuevo
    try {
        // ASUME QUE TIENES UNA RUTA /api/registros_diagnostico_todos O SIMILAR
        // O que /api/aires/X/registros_diagnostico puede devolver todos si no se especifica aire_id
        // Por ahora, vamos a hacer un fetch a una ruta hipotética /api/registros_diagnostico/todos
        // Deberías crear esta ruta en tu backend.
        const queryParams = new URLSearchParams();
        if (filters.solucionado !== undefined) {
            queryParams.append("solucionado", filters.solucionado.toString());
        }
        const response = await fetch(`${process.env.BACKEND_URL}/registros_diagnostico/todos?${queryParams.toString()}`, { // RUTA HIPOTÉTICA
            method: "GET",
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            const errorData = await response.json();
            if (response.status === 401) getActions().logoutTrackerUser();
            throw new Error(errorData.msg || `Error fetching all diagnostic records: ${response.status}`);
        }
        const data = await response.json();
        setStore({ loading: false }); // O el estado de carga específico
        return data || []; // Devuelve los datos para ser usados en el componente
    } catch (error) {
        console.error("Error in fetchAllDiagnosticRecords:", error);
        setStore({ loading: false, error: error.message || "Error cargando todos los registros de diagnóstico." });
        return null;
    }
},
    },
  };
};

export default getState;
