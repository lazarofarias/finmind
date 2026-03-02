import { create } from 'zustand'

interface UIState {
    privacyMode: boolean
    togglePrivacyMode: () => void
}

export const useUIStore = create<UIState>((set) => ({
    privacyMode: false,
    togglePrivacyMode: () => set((state) => ({ privacyMode: !state.privacyMode })),
}))
