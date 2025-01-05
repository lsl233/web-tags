import { ZodOptional } from "zod";
import { create } from "zustand"

export type SettingsStore = {
    webpageActive: boolean;
    setSettings: (settings: Partial<Omit<SettingsStore, "setSettings">>) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
    webpageActive: true,
    setSettings: (setting) => set(setting),
}));