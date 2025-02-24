// AuthDialog.tsx
import { User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "../login/LoginForm";
import RegisterForm from "../register/RegisterForm";

export function AuthDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleClose = () => {
    if (!isRedirecting) {
      setIsOpen(false);
    }
  };

  const handleLoginSuccess = async (redirectPath: string) => {
    setIsRedirecting(true);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsOpen(false);
    setIsRedirecting(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="hover:bg-accent/10 dark:hover:bg-white/10 transition-colors"
      >
        <User className="h-5 w-5 text-accent dark:text-white" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent
          className="max-w-lg max-h-[90vh] overflow-y-auto p-0 
                  bg-background dark:bg-black
                  border-border dark:border-white/10 shadow-xl"
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-accent/10 dark:hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 text-accent dark:text-white" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList
                className="grid w-full grid-cols-2 
                       bg-background/80 dark:bg-black/80
                       p-1 gap-2"
              >
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-accent 
                         data-[state=active]:text-white 
                         dark:data-[state=active]:bg-white
                         dark:data-[state=active]:text-black
                         py-3 
                         text-accent dark:text-white
                         transition-colors
                         hover:bg-accent/10 dark:hover:bg-white/10"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-accent 
                         data-[state=active]:text-white 
                         dark:data-[state=active]:bg-white
                         dark:data-[state=active]:text-black
                         py-3 
                         text-accent dark:text-white
                         transition-colors
                         hover:bg-accent/10 dark:hover:bg-white/10"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="p-8 pt-6 bg-transparent">
                <div className="[&>div]:p-0 [&>div]:shadow-none [&>div]:border-0">
                  <LoginForm
                    onClose={handleClose}
                    onLoginSuccess={handleLoginSuccess}
                  />
                </div>
              </TabsContent>

              <TabsContent value="register" className="p-8 pt-6 bg-transparent">
                <div className="[&>div]:p-0 [&>div]:shadow-none [&>div]:border-0">
                  <RegisterForm />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
