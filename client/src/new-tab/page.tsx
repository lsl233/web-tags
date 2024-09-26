import React, { useEffect } from "react";
import { createRoot } from "react-dom/client";
import "@/global.css";
import { f } from "@/lib/f";
import { AuthProvider, useAuth } from "./components/auth-provider";
import { TagsNav } from "./components/tags-nav";
import { WebpagesView } from "./components/webpages-view";
import { useStore } from "@/lib/hooks/store.hook";
import { SignDialog } from "./components/sign-dialog";
import { Toaster } from "@/lib/ui/sonner";

const NewTab = () => {
  const { session } = useAuth();
  const { tags, setTags, activeTag, setActiveTag, webpages, setWebpages } =
    useStore();

  const fetchTags = async () => {
    const res = await f("/api/tag?includeWebPagesAndTags=true");
    setTags(res);
    return res;
  };

  const fetchWebpages = async () => {
    try {
      const res = await f(`/api/webpage?tagId=${activeTag?.id}`);
      setWebpages(res);
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  useEffect(() => {
    if (session) {
      fetchTags().then((res) => {
        if (res.length > 0) {
          setActiveTag({ ...res[0] });
        }
      });
    }
  }, [session]);

  useEffect(() => {
    if (activeTag) {
      fetchWebpages();
    }
  }, [activeTag]);

  useEffect(() => {
    const messageListener = (request: any) => {
      if (request.type === "active-new-tab") {
        fetchTags();
        fetchWebpages();
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, [activeTag]);

  return (
    <main className="flex flex-col sm:flex-row h-screen max-w-[1920px] mx-auto bg-white">
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
      <SignDialog children={undefined} type={"in"} />
    </main>
  );
};

const root = createRoot(document.getElementById("root")!);

root.render(
  <React.StrictMode>
    <AuthProvider>
      <Toaster closeButton toastOptions={{ cancelButtonStyle: { right: 0, left: "auto" } }} position="top-center" />
      <NewTab />
    </AuthProvider>
  </React.StrictMode>
);
