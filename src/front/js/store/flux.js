const getState = ({ getStore, getActions, setStore }) => {
	return {
		store: {
			userData: JSON.parse(localStorage.getItem("userData")) || [],
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
			
		}
	};
};

export default getState;
