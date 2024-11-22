import { ChevronsUpDown, LogIn, LogOut, Settings } from "lucide-react"
import { CreateTagDialog } from "./create-tag-dialog"
import { ScrollArea } from "@/lib/ui/scroll-area"
import { Button } from "@/lib/ui/button"
import { SettingDialog } from "./setting/dialog"
import { BookmarkPlus } from "lucide-react"
import { TagsNav } from "./tags-nav"
import { useStore } from "@/lib/hooks/store.hook"
import { DndContext, DragEndEvent, useSensor, closestCenter } from "@dnd-kit/core"
import { useSensors } from "@dnd-kit/core"
import { PointerSensor } from "@dnd-kit/core"
import { TagWithChildrenAndParentAndLevel } from "shared/tag"
import { useAuth } from "./auth-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/ui/popover"
import { SignDialog } from "./sign-dialog"
import { useEffect } from "react"

export const Sidebar = () => {
  const { session, signOut } = useAuth();

  const { tags, setTags, setSignDialogOpen } = useStore();

  useEffect(() => {
    console.log(session)
    if (!session) {
      setSignDialogOpen(true);
    }
  }, [])

  const pointerSensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 5
    }
  });
  const sensors = useSensors(pointerSensor)

  const findItemAndParentPath = (items: TagWithChildrenAndParentAndLevel[], id: string, path: number[] = []): { item: TagWithChildrenAndParentAndLevel, parentPath: number[], index: number } | null => {
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const currentPath = [...path, i];

      if (item.id === id) return { item, parentPath: path, index: i };

      if (item.children) {
        const found = findItemAndParentPath(item.children, id, currentPath);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeData = findItemAndParentPath(tags, active.id as string);
    const overData = findItemAndParentPath(tags, over.id as string);

    if (!activeData || !overData) return;

    const activeItem = activeData.item;
    const newData = [...tags];

    if (activeItem.parentId === overData.item.parentId) {
      // 移除拖拽项
      const activeParent = activeData.parentPath.reduce((acc, idx) => acc[idx].children, newData);
      activeParent.splice(activeData.index, 1);

      // 插入到目标位置
      const overParent = overData.parentPath.reduce((acc, idx) => acc[idx].children, newData);
      overParent.splice(overData.index, 0, activeItem);

      setTags(newData);
    }

  };

  const handleLogout = () => {

  }

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-center h-[52px] border-b border-gray-300">
        <CreateTagDialog>
          <Button variant="ghost" className="w-full h-full">
            <BookmarkPlus className="w-6 h-6 mr-1" />
            Create
          </Button>
        </CreateTagDialog>
      </div>
      <ScrollArea className="flex-1 w-full">
        <div className="p-2">
          <DndContext onDragEnd={handleDragEnd} sensors={sensors} collisionDetection={closestCenter}>
            <TagsNav tags={tags}></TagsNav>
          </DndContext>
        </div>
      </ScrollArea>

      <div className="shrink-0  h-[52px] border-t border-gray-300 p-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-full h-full flex items-center justify-between px-2 py-4">
              <div className="flex items-center">
                <div className="bg-gray-500 w-6 h-6 text-center text-white leading-6 rounded">{session ? session.email.charAt(0).toLocaleUpperCase() : '-'}</div>
                <div className="ml-2">{session ? session.email : '--'}</div>
              </div>
              <ChevronsUpDown size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="p-2">
            <SettingDialog>
              <Button variant="ghost" size="sm" className="w-full h-full justify-start py-2">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </SettingDialog>
            {
              session
                ?
                <Button onClick={signOut} variant="ghost" size="sm" className="w-full h-full justify-start py-2">
                  <LogOut className="w-4 h-4 mr-1" />
                  Log out
                </Button>
                :
                <Button onClick={() => setSignDialogOpen(true)} variant="ghost" size="sm" className="w-full h-full justify-start py-2">
                  <LogIn className="w-4 h-4 mr-1" />
                  Log in
                </Button>
            }

          </PopoverContent>
        </Popover>

        <SignDialog type={"in"}></SignDialog>
      </div>
    </div>
  )
} 