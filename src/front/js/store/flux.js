const getState = ({ getStore, getActions, setStore }) => {
  return {
    store: {
      currentUser: JSON.parse(localStorage.getItem("currentUser")) || [],
      descriptions: "",
    },
    actions: {
      // Use getActions to call a function within a fuction

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
            localStorage.setItem("currentUser", JSON.stringify(responseData));
            console.log("User added successfully: ", responseData);
            return responseData;
          } else {
            console.log("Error adding user:", response.statusText);
          }
        } catch (error) {
          console.log("Error adding user:", error.message);
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
            // Aquí podrías actualizar el store con el nuevo rack si lo necesitas
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
            // Aquí podrías actualizar el store con el nuevo equipment si lo necesitas
            return responseData;
          } else {
            // Error en la respuesta del servidor
            console.log("Error adding equipment:", response.statusText);
            throw new Error(
              "Error adding equipment: Unexpected response from server"
            );
          }
        } catch (error) {
          // Error de conexión o error en la solicitud
          console.log("Error adding equipment:", error.message);
          throw new Error(
            "Error adding equipment: Connection error or request error"
          );
        }
      },
      getDescriptionsByUser: async () => {
        const store = getStore();
        const currentUser = store.currentUser;
      
        try {
          const response = await fetch(
            `${process.env.BACKEND_URL}/description/${currentUser.user_id}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
      
          if (response.ok) {
            const responseData = await response.json();
            setStore({ descriptions: responseData });
            return responseData; // Retornar los datos obtenidos
          } else {
            console.log("Failed to fetch descriptions:", response.statusText);
            return null; // Retornar null en caso de error
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
          return null; // Retornar null en caso de error
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
            // Aquí podrías actualizar el store con el rack editado si lo necesitas
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
            // Aquí podrías actualizar el store con el equipo editado si lo necesitas
            return responseData;
          } else {
            console.log("Error editing equipment:", response.statusText);
          }
        } catch (error) {
          console.log("Error editing equipment:", error.message);
        }
      },
      deleteAll: async () => {
        const store = getStore();
        const actions = getActions();
        
        try {
          // Eliminar currentUser y descriptions del local storage
          localStorage.removeItem('currentUser');
          
          // Realizar la solicitud DELETE al backend
          let response = await fetch(`${process.env.BACKEND_URL}/delete_all`, {
            method: 'DELETE',
          });
      
          if (response.ok) {
            // Actualizar el store eliminando currentUser y descriptions
            setStore({
              ...store,
              currentUser: null,
              descriptions: []
            });
          } else {
            console.log("Error en la solicitud de eliminación");
          }
      
          return response;
        } catch (error) {
          console.log("Error borrando todo", error);
        }
      }
      
    },
  };
};

export default getState;
