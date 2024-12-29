import { useEffect } from "react"



export const useCursor = (cursor: string | null = null, deps: any[] = []) => {
  useEffect(() => {
    if (!cursor) return;
    
    // 保存之前的 cursor 样式
    const previousCursor = window.document.body.style.cursor;
    
    // 设置新的 cursor 样式
    window.document.body.style.cursor = cursor;

    // 清理函数：恢复之前的 cursor 样式
    return () => {
      window.document.body.style.cursor = previousCursor;
    };
  }, [cursor, ...deps]);
};

export const useCursorWait = (loading: boolean) => {
  useCursor(loading ? 'wait' : 'default', [loading]);
}