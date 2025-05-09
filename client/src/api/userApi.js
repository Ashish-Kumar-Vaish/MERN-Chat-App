// Rooms Joined
export const getRoomsJoined = async (username) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/roomsJoined`,
      {
        method: "GET",
        headers: { token: localStorage.getItem("auth_token") },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Edit user
export const editUser = async (data) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/editUser`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          token: localStorage.getItem("auth_token"),
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete user
export const deleteUser = async (username) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/deleteUser`,
      {
        method: "DELETE",
        headers: { token: localStorage.getItem("auth_token") },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Fetch user details
export const getUserDetails = async (username) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/user/getUserDetails?username=${username}`,
      {
        method: "GET",
        headers: { token: localStorage.getItem("auth_token") },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Fetch multiple user details at once
export const getMultipleUserDetails = async (usernames) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/getMultipleUserDetails`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ usernames: usernames }),
      }
    );

    return await response.json();
  } catch (error) {
    console.error("Error fetching multiple user details:", error);
    return { success: false, error: error.message };
  }
};

// Add friend
export const addFriend = async (username) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/user/addFriend?friendRequestTo=${username}`,
      {
        method: "POST",
        headers: { token: localStorage.getItem("auth_token") },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Remove friend
export const removeFriend = async (username) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/user/removeFriend?friendToRemove=${username}`,
      { method: "POST", headers: { token: localStorage.getItem("auth_token") } }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Accept friend request
export const acceptFriendRequest = async (username) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/user/acceptFriendRequest?friendRequestToAccept=${username}`,
      {
        method: "POST",
        headers: { token: localStorage.getItem("auth_token") },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Reject friend request
export const rejectFriendRequest = async (username) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/user/rejectFriendRequest?friendRequestToReject=${username}`,
      {
        method: "POST",
        headers: { token: localStorage.getItem("auth_token") },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Search users
export const searchUsers = async (data) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/searchUsers`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchUser: data.searchUser.trim(),
          limit: data.limit,
        }),
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
