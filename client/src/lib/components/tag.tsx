import { TagWithChildrenAndParentAndLevel } from "shared/tag";
import { Badge } from "../ui/badge";
import { useMemo } from "react";
import { flattenParentKey } from "../utils";

interface TagBadgeProps {
  tag: TagWithChildrenAndParentAndLevel;
}

export const TagBadge = ({ tag }: TagBadgeProps) => {
  const levelName = useMemo(
    () => flattenParentKey(tag, "name").join("/"),
    [tag]
  );

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
