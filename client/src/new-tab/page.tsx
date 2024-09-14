import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "@/global.css";
import { f } from "@/lib/f";
import { TagWithWebpagesAndTags } from "shared/tag";
import { AuthProvider, useAuth } from "./components/auth-provider";
import { TagsNav } from "./components/tags-nav";
import { WebpagesView } from "./components/webpages-view";
import { useStore } from "@/lib/hooks/store.hook";

const Options = () => {
  // const [tags, setTags] = useState<TagWithWebpagesAndTags[]>([]);
  // const [activeTag, setActiveTag] = useState<TagWithWebpagesAndTags | null>(
  //   null
  // );
  const { session } = useAuth();
  const { tags, setTags, activeTag, setActiveTag, webpages, setWebpages } = useStore();
  
  const fetchTags = async () => {
    const res = await f("/api/tag?includeWebPagesAndTags=true");
    setTags(res);
    if (res.length > 0) {
      setActiveTag({ ...res[0] });
    }
  };

  const fetchWebpages = async () => {
    const res = await f(`/api/webpage?tagId=${activeTag?.id}`);
    setWebpages(res);
  };

  useEffect(() => {
    if (session) {
      fetchTags();
    }
  }, [session]);

  useEffect(() => {
    if (activeTag) {
      fetchWebpages();
    }
  }, [activeTag]);

  return (
    <main className="flex h-screen">
      <div className="h-full w-1/6 border-r border-b border-gray-300 space-y-1">
        <TagsNav
          tags={tags}
          activeTag={activeTag}
          setActiveTag={setActiveTag}
        />
      </div>
      <div className="h-full w-5/6 border-b border-gray-300 ">
        <WebpagesView webpages={webpages} />
      </div>
    </main>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Options />
    </AuthProvider>
  </React.StrictMode>
);

