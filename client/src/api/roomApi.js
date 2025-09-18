// Room details
export const getRoomDetails = async (roomId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/rooms/roomDetails`,
      {
        method: "GET",
        headers: {
          roomid: roomId,
        },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Featured rooms
export const getFeaturedRooms = async (offset = 0, limit = 10) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/rooms/featuredRooms?offset=${offset}&limit=${limit}`,
      {
        method: "GET",
        headers: {
          token: localStorage.getItem("auth_token"),
        },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Search rooms
export const searchRooms = async (searchQuery, offset = 0, limit = 10) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/rooms/searchRooms?offset=${offset}&limit=${limit}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ searchQuery: searchQuery.trim() }),
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create room
export const createRoom = async (data) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/rooms/createRoom`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Edit room
export const editRoom = async (data) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/rooms/editRoom`,
      {
        method: "POST",
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

// Delete room
export const deleteRoom = async (roomId) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/rooms/deleteRoom`,
      {
        method: "DELETE",
        headers: {
          token: localStorage.getItem("auth_token"),
          roomid: roomId,
        },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
