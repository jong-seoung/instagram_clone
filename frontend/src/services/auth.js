import api from "./api";

export const authService = {
    async register(userData) {
        const response = await api.post("/api/auth/register", userData);
        
        console.log("Registration response:", response); // Debugging line
        
        return response.data;
    }
};