import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

const SkeletonList = () => {
  return (
    <div className="flex flex-col space-y-3 ">
      <Skeleton className="h-4 w-[250px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[200px]" />
      <Skeleton className="h-4 w-[200px]" />
    </div>
  )
}
export { Skeleton, SkeletonList }
