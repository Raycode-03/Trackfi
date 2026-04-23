"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const cfg = {
  title: "Set a new password",
  description: "Enter your new password to complete the reset",
  success: "Password reset successful!",
  error: "Something went wrong",
  passwordButton: "Set New Password",
  linkButton: "← Back to login",
  linkHref: "/login",
};

export default function NewPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState<string | null>(null);

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");
    
    if (!codeFromUrl) {
      toast.error("Invalid reset link. Please request a new one.");
      router.push("/forgot-password");
    } else {
      setCode(codeFromUrl);
    }
  }, [searchParams, router]);

  async function handleSetPassword(e: FormEvent) {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match" );
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!code) {
      toast.error("Invalid reset code");
      return;
    }

    setLoading(true);
    const toastId = toast.loading("Updating password...");

    try {
      const res = await fetch("/api/auth/new-password", {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || cfg.error, { id: toastId });
        return;
      }

      toast.success(data.message || cfg.success, { id: toastId });
      
      setTimeout(() => {
        router.push("/login");
      }, 1500);

    } catch (err) {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setLoading(false);
    }
  }

  if (!code) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Card className="w-full max-w-sm">
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">Validating reset link...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-2">
          <CardTitle className="text-3xl font-bold text-center">
            {cfg.title}
          </CardTitle>
          <CardDescription className="text-center">
            {cfg.description}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <form onSubmit={handleSetPassword}>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="new_password">New Password</Label>
                <Input
                  id="new_password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                  id="confirm_password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <CardFooter className="mt-6 px-0">
              <Button type="submit" className="bg-black hover:bg-gray-900 text=gray-400 w-full" disabled={loading}>
                {loading ? "Updating..." : cfg.passwordButton}
              </Button>
            </CardFooter>
          </form>
        </CardContent>

        <Separator className="my-2 bg-gray-200" />
        
        <CardFooter>
          <p className="text-sm text-gray-500 mt-2">
            <Link href={cfg.linkHref}>
              <Button variant="link" type="button" className="text-black cursor-pointer p-0 h-auto">
                {cfg.linkButton}
              </Button>
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}