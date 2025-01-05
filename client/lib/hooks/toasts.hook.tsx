import { Button } from "@/lib/ui/button-loading";

import { Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useCursorWait } from "./cursor.hook";

interface DeleteToastProps {
  onDelete: () => void
  successMessage: string,
  errorMessage: string,
  message?: string
}

// 自定义 Hook 来管理删除状态
const useDeleteToast = () => {
  const [loading, setLoading] = useState(false);
  const [toastId, setToastId] = useState<string | number | undefined>();

  useCursorWait(loading)

  const deleteToast = async ({
    onDelete,
    message = "Confirm Deletion?",
    successMessage,
    errorMessage
  }: DeleteToastProps) => {
    const handleDelete = async () => {
      if (loading) return
      try {
        setLoading(true);
        await onDelete();
        toast.success(successMessage);
      } catch (e) {
        console.error(e);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
        toast.dismiss(toastId);
      }
    };

    const id = toast(
      <div className="flex items-center justify-between gap-2 w-full">
        <p>{message}</p>
        <div>
          <Button
            onClick={handleDelete}
            variant="text"
            className="h-5"
            size="icon"
          >
            <Trash2 className="w-4 h-4 text-red-500 hover:text-red-600" />
          </Button>
        </div>
      </div>,
      {
        duration: 100000,
        closeButton: true,
      }
    );

    setToastId(id)
  };

  return { deleteToast };
};

export { useDeleteToast };