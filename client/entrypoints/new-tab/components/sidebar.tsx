import { ChevronsUpDown, Hash, LogIn, LogOut, Plus, Settings } from "lucide-react"
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
import { useAuth } from "@/lib/components/auth-provider"
import { Popover, PopoverContent, PopoverTrigger } from "@/lib/ui/popover"
import { SignDialog } from "./sign-dialog"
import { UserType } from "shared/user"
import { arrayMove } from "@dnd-kit/sortable"
import { f } from "@/lib/f"

export const Sidebar = () => {
  const { session, signOut } = useAuth();

  const { tags, setTags, setSignDialogOpen } = useStore();

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
    const { active, over } = event
    let oldIndex
    let newIndex
    for (let i = 0, l = tags.length; i < l; i++) {
      if (active.id === tags[i].id) oldIndex = i
      if (over?.id === tags[i].id) newIndex = i
    }
    if (oldIndex !== undefined && newIndex !== undefined) {
      const result = arrayMove(tags, oldIndex, newIndex)
      f('/api/tag/sort-order', {
        method: "POST",
        body: result.map((item, index) => ({ id: item.id, sortOrder: index }))
      })
      setTags(result)
    }

  };

  return (
    <div className="flex flex-col h-full">
      <div className="shrink-0 flex items-center justify-center h-[52px] border-b border-gray-300">
        <Hash />
      </div>
      <div className="group h-[24px] mt-2 px-2 flex justify-between items-center">
        <span className="text-gray-500">Tags</span>
        <CreateTagDialog>
          <Button variant="ghost" size="icon" className="w-[24px] h-full hidden group-hover:flex">
            <Plus className="w-5 h-5" />
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

      <div className="shrink-0 h-[52px] border-t border-gray-300 p-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" className="w-full h-full flex items-center justify-between px-2">
              <div className="flex items-center">
                <div className="bg-gray-500 w-6 h-6 text-center text-white leading-6 rounded">{session ? session.email.charAt(0).toLocaleUpperCase() : '-'}</div>
                <div className="ml-2">{session ? session.email : '--'}</div>
              </div>
              <ChevronsUpDown size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent side="right" className="p-2 mb-3">
            <SettingDialog>
              <Button variant="ghost" size="sm" className="w-full h-full justify-start px-2 py-2">
                <Settings className="w-4 h-4 mr-1" />
                Settings
              </Button>
            </SettingDialog>
            {
              session && session.type === UserType.NORMAL
                ?
                <Button onClick={signOut} variant="ghost" size="sm" className="w-full h-full justify-start px-2 py-2">
                  <LogOut className="w-4 h-4 mr-1" />
                  Log out
                </Button>
                :
                <Button onClick={() => setSignDialogOpen(true)} variant="ghost" size="sm" className="w-full h-full justify-start px-2 py-2">
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