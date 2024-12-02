import { create } from "zustand";
import { WebpageWithTags } from "shared/webpage";
import { Tag, TagWithChildrenAndParentAndLevel } from "shared/tag";
import { ScrapedWebpage } from "shared/spider";

type Store = {
  webpages: WebpageWithTags[];
  setWebpages: (webpages: WebpageWithTags[]) => void;
  insertWebpages: (webpages: WebpageWithTags[]) => void;

  activeTag: TagWithChildrenAndParentAndLevel | null;
  setActiveTag: (tag: TagWithChildrenAndParentAndLevel | null) => void;

  tags: TagWithChildrenAndParentAndLevel[];
  setTags: (tags: TagWithChildrenAndParentAndLevel[]) => void;

  signDialogOpen: boolean;
  setSignDialogOpen: (open: boolean) => void;

  collectDialogOpen: boolean;
  setCollectDialogOpen: (open: boolean) => void;
  defaultCollectForm: Partial<ScrapedWebpage>;
  setDefaultCollectForm: (form: Partial<ScrapedWebpage>) => void;

  createTagDialogOpen: boolean;
  setCreateTagDialogOpen: (open: boolean) => void;
  defaultTagForm: Partial<Tag>;
  setDefaultTagForm: (form: Partial<Tag>) => void;
};

export const useStore = create<Store>((set) => ({
  webpages: [],
  setWebpages: (webpages) => set({ webpages }),
  insertWebpages: (webpages) => set((state) => ({ webpages: [...state.webpages, ...webpages] })),
  activeTag: null,
  setActiveTag: (tag) => set({ activeTag: tag }),

  tags: [],
  setTags: (tags) => set({ tags }),

  signDialogOpen: false,
  setSignDialogOpen: (open) => set({ signDialogOpen: open }),

  collectDialogOpen: false,
  setCollectDialogOpen: (open) => set({ collectDialogOpen: open }),
  defaultCollectForm: {},
  setDefaultCollectForm: (form) => set({ defaultCollectForm: form }),

  createTagDialogOpen: false,
  setCreateTagDialogOpen: (open) => {
    if (!open) {
      set({ defaultTagForm: {} });
    }
    set({ createTagDialogOpen: open });
  },
  defaultTagForm: {},
  setDefaultTagForm: (form) => set({ defaultTagForm: form }),
}));
