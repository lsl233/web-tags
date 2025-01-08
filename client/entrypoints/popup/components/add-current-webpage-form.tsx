import { WebpageForm } from "@/lib/components/webpage-form";
import { f } from "@/lib/f";
import { useEffect, useRef, useState } from "react";
import { Tag, TagType, TagWithLevel } from "shared/tag";
import { WebpageFormData, WebpageWithTags } from "shared/webpage";
import { isInternalPage } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/lib/ui/skeleton";
import { useStore } from "@/lib/hooks/store.hook";

export const AddCurrentWebpageForm = () => {
  const mounted = useRef(false);
  const flattenedTags = useStore(state => state.flattenedTags)
  const [formData, setFormData] = useState<Partial<WebpageFormData>>({});
  const [webpageId, setWebpageId] = useState<string | undefined>();
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    if (mounted.current) return;
    mounted.current = true;
    initFormData()
  }, [])

  const initFormData = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]
    if (!currentTab.url) return;
    let _formData: WebpageFormData
    if (isInternalPage(currentTab.url)) {
      _formData = {
        url: currentTab.url,
        title: currentTab.title || "",
        description: currentTab.title || "",
        icon: currentTab.favIconUrl || "",
        tags: [],
      }
      mergeRemoteFormData(_formData)
    } else {
      chrome.runtime.sendMessage({ type: "get-page-content" }, (response) => {
        if (response) {
          _formData = {
            url: response.url,
            title: response.title,
            description: response.description,
            icon: response.icon,
            tags: [],
          }
          mergeRemoteFormData(_formData)

        }
      });
    }
  }

  const mergeRemoteFormData = async (data: WebpageFormData) => {
    const foundWebpage = await f("/api/webpage/exist", { query: { url: encodeURIComponent(data.url) } })
    if (foundWebpage) {
      setWebpageId(foundWebpage.id)
      const tags = foundWebpage.tags.length > 0 ? foundWebpage.tags.filter((tag: Tag) => tag.type === TagType.CUSTOM).map((tag: Tag) => tag.id) : data.tags
      setFormData({
        url: foundWebpage.url,
        title: foundWebpage.title || data.title,
        description: foundWebpage.description || data.description,
        icon: foundWebpage.icon || data.icon,
        tags,
      })
    } else {
      setFormData(data)
    }
    setInitializing(false)
  }

  const handleSubmit = async (data: WebpageFormData) => {
    const result = await f<WebpageWithTags>("/api/webpage", {
      method: "POST",
      body: {
        ...data,
        id: webpageId,
      },
    });
    if (result) {
      toast.success(`Webpage ${webpageId ? "updated" : "added"} successfully`);
      setWebpageId(result.id)
    } else {
      toast.error(`Failed to ${webpageId ? "update" : "add"} webpage`);
    }
  }

  if (initializing) return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-[62px] w-full" />
      <Skeleton className="h-[62px] w-full" />
      <Skeleton className="h-[106px] w-full" />
      <Skeleton className="h-[62px] w-full" />
      <Skeleton className="h-[36px] w-full" />
    </div>
  )

  return <WebpageForm formData={formData} onSubmit={handleSubmit} submitButtonText={webpageId ? "Update" : "Add"} />

}
