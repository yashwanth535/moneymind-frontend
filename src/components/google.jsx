export const googleSignIn = async (credential) => {
  try {
    console.log("Attempting Google sign-in with credential");

    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ credential }),
    });

    const data = await response.json();
    console.log("Google sign-in response:", data);

    if (!response.ok) throw new Error(data.message || "Google sign-in failed");

    if (!data.token) {
      throw new Error("No token received from server");
    }

    console.log("Authentication successful");
    return data; // Return full response data

  } catch (error) {
    console.error("Google sign-in error:", error);
    throw error;
  }
};
