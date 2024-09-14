import { create } from "zustand";
import { WebpageWithTags } from "shared/webpage";
import { Tag } from "shared/tag";

type Store = {
    webpages: WebpageWithTags[],
    setWebpages: (webpages: WebpageWithTags[]) => void

    activeTag: Tag | null,
    setActiveTag: (tag: Tag | null) => void

    tags: Tag[],
    setTags: (tags: Tag[]) => void

    signDialogOpen: boolean,
    setSignDialogOpen: (open: boolean) => void
}

export const useStore = create<Store>(set => ({

    webpages: [],
    setWebpages: (webpages) => set({webpages}),

    activeTag: null,
    setActiveTag: (tag) => set({activeTag: tag}),

    tags: [],
    setTags: (tags) => set({tags}),

    signDialogOpen: false,
    setSignDialogOpen: (open) => set({signDialogOpen: open}),
}))
