"use client";

import Link from "next/link";
import React, { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import SignInWithGoogleButton from "@/components/auth/SignInWithGoogleButton";
import { useRouter } from "next/navigation";
import { useAuthLoading } from "@/context/AuthLoadingContext";
import { Eye, EyeOff } from "lucide-react";
export function SignUpForm() {
  const SignupContent = {
    title: "Create your account",
    description: "Enter your email and password to create an account.",
    success: "Signed up successfully!",
    error: "Unable to sign up.",
    button: "Create Account",
    linkText: "Already have an account?",
    linkButton: "Log in",
    linkHref: "/login",
    endpoint: "signup",
  };

  const { loadingType, setLoadingType } = useAuthLoading();
  const isDisabled = loadingType !== null;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const isFormLoading = loadingType === "form";

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingType("form");
    const toastId = toast.loading("Signing you up...");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirm_password = formData.get("confirm_password") as string;
    if (password !== confirm_password) {
      toast.error("Passwords do not match", { id: toastId });
      setLoadingType(null);
      return;
    }
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        toast.error(result.error || "Signup failed", { id: toastId });
      } else {
        toast.success(SignupContent.success, { id: toastId });

        router.push(`/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch {
      toast.error(SignupContent.error, { id: toastId });
    } finally {
      setLoadingType(null);
    }
  };

  return (
    <div className="w-full max-w-md">
      <section className="space-y-1 px-0 mb-6">
        <CardTitle className="text-3xl font-bold text-white">
          {SignupContent.title}
        </CardTitle>
        <CardDescription className="text-gray-400">
          {SignupContent.description}
        </CardDescription>
      </section>

      <Card className=" bg-form border-0 backdrop-blur-lg p-6">
        <div className="">
          <SignInWithGoogleButton />
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-gray-500">OR</span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4 px-0">
            <div className="grid gap-1.5">
              <Label className="text-xs text-gray-400 uppercase tracking-wider">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="name@company.com"
                required
                disabled={isDisabled}
                className="bg-[#262626] border-white/10 text-white placeholder:text-gray-400 focus:bg-[#3f3e3e]"
              />
            </div>

            <div className="grid gap-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-gray-400 uppercase tracking-wider">
                  Password
                </Label>
                <Label className="text-xs text-gray-400 uppercase tracking-wider">
                  Confirm Password
                </Label>
              </div>

              <div className="flex gap-6 mb-4">
                <div className="relative">
                  <Input
                    id="password"
                    type={showConfirm ? "text" : "password"}
                    name="password"
                    required
                    disabled={isDisabled}
                    className="bg-[#262626] border-white/10 text-white pr-10 focus:bg-[#3f3e3e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showConfirm ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <Input
                    id="confirm_passsword"
                    type={showPassword ? "text" : "password"}
                    name="confirm_password"
                    required
                    disabled={isDisabled}
                    className="bg-[#262626] border-white/10 text-white pr-10 focus:bg-[#3f3e3e]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="w-4 h-4 rounded-sm bg-form border border-white/20 accent-primary cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-gray-400">
                  I agree to the{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 px-0 mt-6">
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-black font-bold rounded-full h-12 "
              disabled={isDisabled}
            >
              {isFormLoading ? "Signing in..." : SignupContent.button}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="text-sm text-gray-500 text-center mt-4">
        {SignupContent.linkText}{" "}
        <Link
          href={SignupContent.linkHref}
          className="text-[#FF9062] font-semibold hover:underline"
        >
          {SignupContent.linkButton}
        </Link>
      </p>
    </div>
  );
}
