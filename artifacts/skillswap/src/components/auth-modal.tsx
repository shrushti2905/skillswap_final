import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type LoginValues = z.infer<typeof loginSchema>;
type SignupValues = z.infer<typeof signupSchema>;

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: "signin" | "signup";
}

export function AuthModal({ open, onOpenChange, defaultTab = "signin" }: AuthModalProps) {
  const { login, signup } = useAuth();
  const [tab, setTab] = useState<string>(defaultTab);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const signupForm = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onLogin = async (data: LoginValues) => {
    try {
      await login(data);
      toast.success("Welcome back!");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    }
  };

  const onSignup = async (data: SignupValues) => {
    try {
      await signup(data);
      toast.success("Account created! Welcome to SkillSwap.");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border-border p-0 overflow-hidden">
        <div className="px-6 pt-6 pb-2 text-center border-b border-border/50">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-sm mx-auto mb-3">
            SS
          </div>
          <h2 className="text-xl font-bold">Welcome to SkillSwap</h2>
          <p className="text-sm text-muted-foreground mt-1">Exchange skills, grow together</p>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-none border-b border-border/50 bg-transparent p-0 h-12">
            <TabsTrigger
              value="signin"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full text-sm font-medium"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none h-full text-sm font-medium"
            >
              Create Account
            </TabsTrigger>
          </TabsList>

          <div className="px-6 py-5">
            <TabsContent value="signin" className="mt-0">
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={loginForm.formState.isSubmitting}
                  >
                    {loginForm.formState.isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</>
                    ) : "Sign In"}
                  </Button>
                </form>
              </Form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                No account?{" "}
                <button onClick={() => setTab("signup")} className="text-primary hover:underline font-medium">
                  Create one free
                </button>
              </p>
            </TabsContent>

            <TabsContent value="signup" className="mt-0">
              <Form {...signupForm}>
                <form onSubmit={signupForm.handleSubmit(onSignup)} className="space-y-4">
                  <FormField
                    control={signupForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Ada Lovelace" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="you@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={signupForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="••••••••" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={signupForm.formState.isSubmitting}
                  >
                    {signupForm.formState.isSubmitting ? (
                      <><Loader2 className="h-4 w-4 animate-spin" /> Creating account...</>
                    ) : "Create Free Account"}
                  </Button>
                </form>
              </Form>
              <p className="text-center text-sm text-muted-foreground mt-4">
                Already have an account?{" "}
                <button onClick={() => setTab("signin")} className="text-primary hover:underline font-medium">
                  Sign in
                </button>
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
