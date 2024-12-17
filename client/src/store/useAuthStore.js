import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';
import { io } from "socket.io-client";

const BASE_URL = 'http://localhost:5001';

export const useAuthStore = create((set, get) => ({
    authUser : null,
    isSignningUp : false,
    isLoggingIn : false,
    isUpdatingProfile : false,
    isCheckingAuth : true,
    onlineUsers: [],
    socket : null,
    version : {
        frontend : "0.0.01",
        backend : "0.0.01",
    },


    checkAuth : async() => {
        try {
            const { data } = await axiosInstance.get('/auth/auth-check')
            set({ authUser: data });
            get().connectSocket()
        } catch (error) {
            set({ authUser : null });
            console.error(error);
        } finally {
            set({ isCheckingAuth : false });
        }
    },

    signup : async( credentials ) => {
        set({ isSignningUp : true });
        try {
            const { data } = await axiosInstance.post("/auth/signup", credentials);
            set({ authUser : data });
            toast.success("Account is created successfully.")
            get().connectSocket()
        } catch (error) {
            toast.error(error.response.data.message || 'Fail to create account')
            console.error(error);
        } finally {
            set({ isSignningUp : false });
        }
    },

    logout : async () => {
        try {
            await axiosInstance.post("/auth/logout");
            set({ authUser : null });
            toast.success("Logged Out Successfully.")
            get().disconnectSocket()
        } catch (error) {
            console.error(error)
            toast(error.response.data.message || 'something went wrong');
        }
    },

    login : async( credentials ) => {
        set({ isLoggingIn : true });
        try {
            const { data } = await axiosInstance.post("/auth/login", credentials);
            set({ authUser : data.user });
            toast.success("Logged In Successfully.")
            get().connectSocket()
        } catch (error) {
            console.error(error);
            toast.error(error.response.data.message || 'Something went wrong');
        } finally {
            set({ isLoggingIn : false });
        }
    },

    updateProfile : async( credentials ) => {
        set({ isUpdatingProfile : true });
        try {
            const res = await axiosInstance.put("/auth/update-profile", credentials, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            set({ authUser : res.data.user });
            toast.success("Profile updated successfully.")
        } catch (error) {
            console.error(error)
            toast.error(error.response.data.message || 'something went wrong');
        } finally {
            set({ isUpdatingProfile : false });
        }
    },

    connectSocket : () => {
        const { authUser } = get();
        if(!authUser || get().socket?.connected ) return;

        const socket = io(BASE_URL, {
            query : {
                userId : authUser._id,
            }
        })
        socket.connect()
        set({ socket });

        socket.on("getOnlineUsers", (userIds) => {
            set({ onlineUsers : userIds });
        })
    },

    disconnectSocket : () => {
        if(get().socket?.connected) get().socket.disconnect();
    },
}))