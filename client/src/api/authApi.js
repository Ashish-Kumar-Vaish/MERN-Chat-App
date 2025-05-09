// Signup user
export const signupUser = async (data) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/signup`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Login user
export const loginUser = async (data) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Get user details
export const getVerifiedUserDetails = async (token) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACKEND_URL}/api/auth/me`,
      {
        method: "GET",
        headers: { token: token },
      }
    );

    return await response.json();
  } catch (error) {
    return { success: false, error: error.message };
  }
};
