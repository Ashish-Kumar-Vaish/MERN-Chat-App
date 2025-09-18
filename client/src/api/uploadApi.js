export const uploadMedia = async (mediaFiles) => {
  try {
    const formData = new FormData();
    mediaFiles.forEach((file) => formData.append("files", file));

    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
