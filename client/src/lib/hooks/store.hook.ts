import { create } from "zustand";
import { WebpageWithTags } from "shared/webpage";
import { Tag } from "shared/tag";
import { ScrapedWebpage } from "shared/spider";

type Store = {
    webpages: WebpageWithTags[],
    setWebpages: (webpages: WebpageWithTags[]) => void

    activeTag: Tag | null,
    setActiveTag: (tag: Tag | null) => void

    tags: Tag[],
    setTags: (tags: Tag[]) => void

    signDialogOpen: boolean,
    setSignDialogOpen: (open: boolean) => void

    collectDialogOpen: boolean,
    setCollectDialogOpen: (open: boolean) => void
    defaultCollectForm: Partial<ScrapedWebpage>
    setDefaultCollectForm: (form: Partial<ScrapedWebpage>) => void

    editTagDialogOpen: boolean,
    setEditTagDialogOpen: (open: boolean) => void
    defaultTagForm: Partial<Tag>
    setDefaultTagForm: (form: Partial<Tag>) => void
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

    collectDialogOpen: false,
    setCollectDialogOpen: (open) => set({collectDialogOpen: open}),
    defaultCollectForm: {},
    setDefaultCollectForm: (form) => set({defaultCollectForm: form}),

    editTagDialogOpen: false,
    setEditTagDialogOpen: (open) => set({editTagDialogOpen: open}),
    defaultTagForm: {},
    setDefaultTagForm: (form) => set({defaultTagForm: form}),
}))
