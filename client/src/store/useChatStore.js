import toast from "react-hot-toast";
import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "../store/useAuthStore";

export const useChatStore = create((set, get)=> ({
    messages : [],
    users : [],
    selectedUser : null,
    isUsersLoading : false,
    isMessagesLoading : false,

    getUsers : async () => {
        set({ isUsersLoading : true });
        try {
            const { data } = await axiosInstance.get("/message/users");
            set({ users : data});
        } catch (error) {
            console.error(error);
            toast.error(error.response.data.message || "Something went wrong");
        } finally {
            set({ isUsersLoading : false });
        }
    },

    getMessages : async (userId) => {
        set({ isMessagesLoading : true});
        try {
            const { data } = await axiosInstance.get(`/message/${userId}`);
            set({ messages : data});
        } catch (error) {
            console.error(error);
            toast.error(error.response.data.message || "Something went wrong");
        } finally {
            set({ isMessagesLoading : false });
        }
    },

    sendMessages : async (messageData) => {
        const { selectedUser, messages } = get()
        try {
            const { data } = await axiosInstance.post(`/message/send/${selectedUser._id}`, messageData);
            set({ messages : [...messages, data]})
        } catch (error) {
            console.error(error);
            toast.error( error.response.data.message || "Fail to send Message" );
        }

    },

    subscribeToMessages: () => {
        const { selectedUser } = get();
        if (!selectedUser) return;
    
        const socket = useAuthStore.getState().socket;
    
        socket.off("messageDelivery");
        socket.on("messageDelivery", (newMessage) => {
            const isMessageSentFromSelectedUser = newMessage.senderId === selectedUser._id;
            if (!isMessageSentFromSelectedUser) return;
    
            set({
                messages: [...get().messages, newMessage],
            });
        });
    },
    
    
    unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },
    
    setSelectedUser: (selectedUser) => set({ selectedUser }),
}))