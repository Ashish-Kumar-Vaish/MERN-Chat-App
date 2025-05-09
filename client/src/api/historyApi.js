// Fetch room history
export const getRoomHistory = async (roomId) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/history/getRoomHistory?roomid=${roomId}`,
      { method: "GET" }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Fetch direct message history
export const getDMHistory = async (sender, receiver) => {
  try {
    const response = await fetch(
      `${
        import.meta.env.VITE_BACKEND_URL
      }/api/history/getDMHistory?sender=${sender}&receiver=${receiver}`,
      { method: "GET" }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
