import { create } from "zustand";

interface LocationState {
    currentLocation: string;
    navigate: (to: string) => void;
}

export const useLocationStore = create<LocationState>((set) => ({
    currentLocation: "",
    navigate: (to: string) => {
        set({ currentLocation: to });
    },
}));
