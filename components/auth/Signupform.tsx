"use client"

import Link from "next/link";
import React, { FormEvent } from 'react';
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner"; 
import { Separator } from "@/components/ui/separator";
import SignInWithGoogleButton from "@/components/auth/SignInWithGoogleButton";
import SignInWithGithubButton from "@/components/auth/Signinwithgithub";
import { useRouter } from "next/navigation";
import { useAuthLoading } from "@/context/AuthLoadingContext";
export function SignUpForm() {
  
  const SignupContent = {
    title: "Create your account",
    description: "Enter your email and password to create an account.",
    success: "Signed up successfully!",
    error: "Unable to sign up.",
    button: "Sign Up",
    forgot_link: "Forgot Password?",
    linkText: "Already have an account?",
    linkButton: "Login",
    linkHref: "/admin/login",
    endpoint: "signup",
  };

     const { loadingType, setLoadingType } = useAuthLoading();
    const isLoading = loadingType === 'form';
    const isDisabled = loadingType !== null;

  const router = useRouter();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadingType('form');
    const toastId = toast.loading("Signing you up...");
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const res = await fetch("/api/admin/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        toast.error(result.error || "Signup failed", { id: toastId });
      } else {
        toast.success(SignupContent.success,{ id: toastId });
         // Redirect to email verification page instead of login
        router.push(`/admin/verify-email?email=${encodeURIComponent(email)}`);
      }
    } catch {
      toast.error(SignupContent.error,{ id: toastId });
    } finally {
      setLoadingType(null); 
    }
  };

  return (
    <>      
        {/* Card Header */}
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-center">{SignupContent.title}</CardTitle>
          <CardDescription className="text-center">{SignupContent.description}</CardDescription>
        </CardHeader>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                name="email"
                placeholder="m@example.com"
                required
                disabled={isDisabled}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                name="password"
                required
                disabled={isDisabled}
              />
            </div>

            <div className="text-sm flex justify-end">
              <Link 
                href={`/admin/${SignupContent.forgot_link.toLowerCase().replace(/\s+/g, "-")}`} 
                className="text-gray-500 mt-2 hover:underline hover:text-blue-300"
              >
                {SignupContent.forgot_link}
              </Link>
            </div>
          </CardContent>

          {/* Buttons */}
          <CardFooter className="flex flex-col gap-3 mt-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-600" 
              disabled={isDisabled}
            >
              {isLoading ?( <Image  src="/logos/Spinner.svg"  alt="Loading animation"   width={100} height={100} priority /> ) : SignupContent.button}
            </Button>

            <Separator className="my-2 bg-gray-200" />

            <div className="mt-1 space-y-3">
              <SignInWithGoogleButton/> 
              <SignInWithGithubButton />
            </div>

            {/* Bottom Link */}
            <p className="text-sm text-gray-500 mt-2 text-center">
              {SignupContent.linkText}{" "}
              <Link href={SignupContent.linkHref}>
                <Button variant="link" type="button" className="p-0 h-auto text-blue-600">
                  {SignupContent.linkButton}
                </Button>
              </Link>
            </p>
          </CardFooter>
        </form>
      
    </>
  )
}
