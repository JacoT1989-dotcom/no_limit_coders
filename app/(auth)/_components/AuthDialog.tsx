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

  const handleClose = () => {
    setIsOpen(false);
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        className="hover:bg-red-50"
      >
        <User className="h-5 w-5 text-red-600" />
      </Button>

      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto p-0 bg-gradient-to-br from-red-50 to-white">
          <div className="flex flex-col h-full">
            <div className="flex justify-end p-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-8 w-8 p-0 hover:bg-red-50"
              >
                <X className="h-4 w-4 text-red-600" />
                <span className="sr-only">Close</span>
              </Button>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-white/50 p-1 gap-2">
                <TabsTrigger
                  value="login"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white py-3 text-red-600"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  value="register"
                  className="data-[state=active]:bg-red-600 data-[state=active]:text-white py-3 text-red-600"
                >
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="p-8 pt-6">
                <div className="[&>div]:p-0 [&>div]:shadow-none [&>div]:border-0">
                  <LoginForm onClose={handleClose} />
                </div>
              </TabsContent>

              <TabsContent value="register" className="p-8 pt-6">
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
