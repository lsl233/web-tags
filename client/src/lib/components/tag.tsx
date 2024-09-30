import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import { Badge } from "../ui/badge";
import { useMemo } from "react";
  
interface TagBadgeProps {
  tag: TagWithChildrenAndParentAndLevel
}

export const TagBadge = ({tag}: TagBadgeProps) => {

  const levelName = useMemo(() => {
    let name = ''
    const deep = (tag: TagWithChildrenAndParentAndLevel) => {
        name = tag.name + '/' + name
        if (tag.parent) {
          deep(tag.parent)
        }
    }
    deep(tag)
    return name
  }, [tag])
  
  return (
    <Badge
      key={tag.id}
      variant="outline"
      className="text-xs px-1.5 flex-shrink-0"
    >
      {levelName}
    </Badge>
  );
};
