"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Logo } from "@/components/logo";
import { useAuth } from "@/hooks/use-auth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const loginFormSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export function LoginForm3({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuth();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data);
      toast.success("Login successful!");
      navigate("/pos-dashboard");
    } catch (error) {
      const err = error as { data?: { message?: string } };
      toast.error(
        err?.data?.message || "Login failed. Please check your credentials."
      );
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col gap-6">
                  <div className="flex justify-center mb-2">
                    <div className="flex items-center gap-2 font-medium">
                      <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
                        <Logo size={24} />
                      </div>
                      <span className="text-xl">TechNova POS</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <h1 className="text-2xl font-bold">Welcome back</h1>
                    <p className="text-muted-foreground text-balance">
                      Login to your TechNova POS account
                    </p>
                  </div>
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input type="text" placeholder="admin" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center">
                          <FormLabel>Password</FormLabel>
                          <a
                            href="#"
                            className="ml-auto text-sm underline-offset-2 hover:underline"
                            onClick={(e) => {
                              e.preventDefault();
                              toast.info("Password reset feature coming soon");
                            }}
                          >
                            Forgot your password?
                          </a>
                        </div>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full cursor-pointer"
                    disabled={isLoggingIn}
                  >
                    {isLoggingIn ? "Logging in..." : "Login"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          <div className="bg-muted relative hidden md:block">
            <img
              src="https://ui.shadcn.com/placeholder.svg"
              alt="TechNova POS"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.95] dark:invert"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground text-center text-xs text-balance">
        By clicking continue, you agree to our{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline underline-offset-4 hover:text-primary">
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
}
