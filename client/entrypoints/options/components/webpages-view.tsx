import { Button } from "@/lib/ui/button";
import { WebpageWithTags } from "shared/webpage";
import { PanelsTopLeft, SquareArrowOutUpRight } from "lucide-react";
// import { CollectWebpageDialog } from "@/lib/components/collect-webpage-dialog";
import { AddWebpageFormDialog } from "@/lib/components/add-webpage-form-dialog";
import { useStore } from "@/lib/hooks/store.hook";
import { WebpageCard } from "./webpage-card";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/lib/ui/scroll-area";
import { TagType, TagWithChildrenAndParentAndLevel } from "shared/tag";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { f } from "@/lib/f";
import { cn, debounce, flattenChildrenKey } from "@/lib/utils";
import { Skeleton } from "@/lib/ui/skeleton";
import { WebpageFormDialog } from "@/lib/components/webpage-form-dialog";

interface Query {
  page: number
  pageSize: number
}

export const WebpagesView = ({ activeTag }: { activeTag: TagWithChildrenAndParentAndLevel }) => {
  const { setDefaultCollectForm, webpages, setWebpages, insertWebpages } = useStore();

  const [query, setQuery] = useState<Query>({ page: 1, pageSize: 50 });
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false)
  const scrollFooterElement = useRef<HTMLDivElement>(null);
  const observed = useRef(false)
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  });

  const sensors = useSensors(pointerSensor)

  const observerLoadMore = () => {
    if (observed.current) return
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setQuery(prev => ({ ...prev, page: prev.page++ }));
          }
        });
      },
      {
        rootMargin: '0px 0px 0px 0px',
        threshold: 0,
      }
    );

    if (scrollFooterElement.current) {
      observer.observe(scrollFooterElement.current);
      observed.current = true
    }

    return () => {
      if (scrollFooterElement.current) {
        observer.unobserve(scrollFooterElement.current);
      }
    };
  }

  useEffect(() => {
    setWebpages([])
    setHasMore(true)
    setQuery(prev => ({ ...prev, page: 1 }));
  }, [activeTag])

  useEffect(() => {
    const abortController = new AbortController();
    fetchWebpages(abortController).then(() => {
      observerLoadMore()
    })
    return () => {
      abortController.abort()
    }
  }, [query])

  const fetchWebpages = async (abortController: AbortController) => {
    if (!hasMore) return;
    setLoading(true)
    const tagsId = flattenChildrenKey([activeTag], "id");
    const res = await f<WebpageWithTags[]>('/api/webpage', {
      query: {
        tagsId: tagsId.join(","),
        ...query
      },
      signal: abortController.signal
    });
    if (res) {
      setHasMore(res.length === query.pageSize);
      // setQuery(prev => ({ ...prev, page: prev.page + 1 }));
      insertWebpages(res);
    }

    setLoading(false);
  };

  const handleOpenAllTabs = (webpages: WebpageWithTags[]) => {
    webpages.forEach((webpage) => {
      chrome.tabs.create({ url: webpage.url, active: false });
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    let oldIndex
    let newIndex
    for (let i = 0, l = webpages.length; i < l; i++) {
      if (active.id === webpages[i].id) oldIndex = i
      if (over?.id === webpages[i].id) newIndex = i
    }
    if (oldIndex !== undefined && newIndex !== undefined) {
      const result = arrayMove(webpages, oldIndex, newIndex)
      f('/api/webpage/sort-order', {
        method: "POST",
        body: result.map((item, index) => ({ id: item.id, sortOrder: index }))
      })
      setWebpages(result)
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 h-[52px] flex justify-between items-center px-2 border-b border-gray-300">
        <AddWebpageFormDialog>
          <Button size="sm">
            <PanelsTopLeft size={16} className="mr-1" />
            Collect Webpage
          </Button>
        </AddWebpageFormDialog>
        {webpages.length > 0 && (
          <Button
            variant="outline"
            onClick={() => handleOpenAllTabs(webpages)}
            size="sm"
          >
            Open All <SquareArrowOutUpRight size={16} className="ml-1" />
          </Button>
        )}
      </div>
      <ScrollArea className="flex-1 w-full">
        <div className="
        grid 
        auto-cols-auto gap-2 p-2 content-start
        @xs:grid-cols-1 
        @md:grid-cols-1 
        @lg:grid-cols-2 
        @xl:grid-cols-2 
        @2xl:grid-cols-3 
        @3xl:grid-cols-3 
        @4xl:grid-cols-4 
        @5xl:grid-cols-4
        @6xl:grid-cols-5
        @7xl:grid-cols-7
        ">
          <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCenter}>
            <SortableContext items={webpages}>
              {webpages.map((webpage) => (
                <WebpageCard key={webpage.id} webpage={webpage} showTags={activeTag?.type === TagType.CUSTOM} />
              ))}
              {
                hasMore && (
                  <Skeleton ref={scrollFooterElement} className={cn(activeTag?.type === TagType.CUSTOM ? 'h-[98.5px]' : 'h-[68.5px]', 'rounded-lg p-2')} />
                )
              }
            </SortableContext>
          </DndContext>
        </div>
      </ScrollArea>
    </div>
  );
};
