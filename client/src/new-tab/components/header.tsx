import { Button } from "@/lib/ui/button";
import { Hash } from "lucide-react";
import { SignDialog } from "./sign-dialog";
import { useAuth } from "./auth-provider";
import { Avatar, AvatarImage, AvatarFallback } from "@/lib/ui/avatar";

export const Header = () => {
  const { session } = useAuth();
  return (
    <div className="flex flex-row justify-between items-center py-2 px-4 border-b border-gray-300">
      <h1>
        <Hash />
      </h1>
      <div>
        {session ? (
          <Avatar>
            {/* <AvatarImage src={session.avatar} /> */}
            <AvatarFallback>
              {session.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ) : (
          <SignDialog type="in">
            <Button size="sm">Sign in</Button>
          </SignDialog>
        )}
      </div>
    </div>
  );
};
