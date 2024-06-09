const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			currentUser: JSON.parse(localStorage.getItem("currentUser")) || [],
		},
		actions: {
			// Use getActions to call a function within a fuction
			
			addUser: async (user) => {
				const store = getStore();
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/addUser`, {
						method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(user),
					});

					if (response.ok) {
						const responseData = await response.json();
						setStore({ currentUser: responseData });
                        localStorage.setItem("currentUser", JSON.stringify(responseData));
                        return responseData;
					} else {
                        console.log("Error adding user:", response.statusText);
                    }
                } catch (error) {
                    console.log("Error adding user:", error.message);
                }
			},
			getUserData: async () => {
				const store = getStore();
				const currentUser = store.currentUser;

				try {

					const response = await fetch(`${process.env.BACKEND_URL}/user/${currentUser.user_id}`, {
						method: "GET",
						headers: {
							"Content-Type": "application/json",
						},
					});

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

			addDescription: async (description) => {
				try {
					const response = await fetch(`${process.env.BACKEND_URL}/addDescription`, {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify(description),
					});

					if (response.ok) {
						const responseData = await response.json();
						// Aquí podrías actualizar el store con la nueva descripción si lo necesitas
						return responseData;
					} else {
						console.log("Error adding description:", response.statusText);
					}
				} catch (error) {
					console.log("Error adding description:", error.message);
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
                    const response = await fetch(`${process.env.BACKEND_URL}/addEquipment`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify(equipment),
                    });

                    if (response.ok) {
                        const responseData = await response.json();
                        // Aquí podrías actualizar el store con el nuevo equipment si lo necesitas
                        return responseData;
                    } else {
                        console.log("Error adding equipment:", response.statusText);
                    }
                } catch (error) {
                    console.log("Error adding equipment:", error.message);
                }
            },
			
		}
	};
};

export default getState;
