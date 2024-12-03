import { Button } from "@/lib/ui/button";
import { WebpageWithTags } from "shared/webpage";
import { PanelsTopLeft, SquareArrowOutUpRight } from "lucide-react";
import { CollectWebpageDialog } from "@/lib/components/collect-webpage-dialog";
import { useStore } from "@/lib/hooks/store.hook";
import { WebpageCard } from "./webpage-card";
import { useEffect, useRef, useState } from "react";
import { ScrollArea } from "@/lib/ui/scroll-area";
import { TagType, TagWithChildrenAndParentAndLevel } from "shared/tag";
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { arrayMove, SortableContext } from "@dnd-kit/sortable";
import { f } from "@/lib/f";
import { debounce, flattenChildrenKey } from "@/lib/utils";

export const WebpagesView = ({ activeTag }: { activeTag: TagWithChildrenAndParentAndLevel }) => {
  const { setDefaultCollectForm, webpages, setWebpages, insertWebpages } = useStore();
  
  const [query, setQuery] = useState({ page: 1, pageSize: 10 });
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false)
  const scrollFooterElement = useRef<HTMLDivElement>(null);
  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  });

  const sensors = useSensors(pointerSensor)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            console.log('滚动到底部，加载更多内容');
            setQuery(prev => ({ ...prev, page: prev.page + 1 }));
          }
        });
      },
      {
        rootMargin: '0px',
        threshold: 1.0,
      }
    );

    if (scrollFooterElement.current) {
      observer.observe(scrollFooterElement.current);
    }

    return () => {
      if (scrollFooterElement.current) {
        observer.unobserve(scrollFooterElement.current);
      }
    };
  }, []);

  useEffect(() => {
    // 设置默认表单值
    setDefaultCollectForm({ tags: [activeTag.id] });
    setWebpages([]);
    if (query.page !== 1) {
      setQuery(prev => ({ ...prev, page: 1 }));
    }
  }, [activeTag])

  useEffect(() => {
    console.log(query)
    fetchWebpages()
  }, [query])

  const fetchWebpages = async () => {
    if (!hasMore) return;
    setLoading(true)
    const tagsId = flattenChildrenKey([activeTag], "id");
    const res = await f<WebpageWithTags[]>(`/api/webpage?tagsId=${tagsId.join(",")}&page=${query.page}`);
    if (res) {
      setHasMore(res.length > 0);
      insertWebpages(res);
    }
    
    setLoading(false);
    return res || [];
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
        <CollectWebpageDialog>
          <Button size="sm">
            <PanelsTopLeft size={16} className="mr-1" />
            Collect Webpage
          </Button>
        </CollectWebpageDialog>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 auto-cols-auto gap-2 p-2 content-start">
          <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCenter}>
            <SortableContext items={webpages}>
              {webpages.map((webpage) => (
                <WebpageCard key={webpage.id} webpage={webpage} showTags={activeTag?.type === TagType.CUSTOM} />
              ))}
            </SortableContext>
          </DndContext>
        </div>
        <div ref={scrollFooterElement}></div>
      </ScrollArea>
    </div>
  );
};
