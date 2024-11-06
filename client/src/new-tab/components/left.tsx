import { Settings } from "lucide-react"
import { CreateTagDialog } from "./create-tag-dialog"
import { ScrollArea } from "@/lib/ui/scroll-area"
import { Button } from "@/lib/ui/button"
import { SettingDialog } from "./setting/dialog"
import { BookmarkPlus } from "lucide-react"
import { TagsNav } from "./tags-nav"
import { useStore } from "@/lib/hooks/store.hook"

export const Left = () => {
  const { tags } = useStore();
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
          <TagsNav tags={tags}></TagsNav>
        </div>
      </ScrollArea>

      <div className="shrink-0 flex items-center justify-center h-[52px] border-t border-gray-300">
        <SettingDialog>
          <Button variant="ghost" className="w-full h-full">
            <Settings className="w-4 h-4 mr-1" />
            Settings
          </Button>
        </SettingDialog>
      </div>
    </div>
  )
} 