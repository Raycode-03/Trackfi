"use client";
import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
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
  description: "Step by step reset with email verification",
  success: "Password reset successful!",
  error: "Something went wrong",
  emailButton: "Verify Email",
  codeButton: "Verify Reset Code",
  passwordButton: "Set New Password",
  linkButton: "← Back to login",
  linkHref: "/login",
};

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  
  const [emailVerified, setEmailVerified] = useState(false);

  async function handleVerifyEmail(e: FormEvent) {
  e.preventDefault();
  setLoading(true);

  const toastId = toast.loading("Verifying email...");

  try {

    const res = await fetch('/api/auth/forgot-password',
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ email }),
      }
    );

    const data = await res.json();

    if (!res.ok) {
      toast.error(data.error || cfg.error, { id: toastId });
      return;
    }

    setEmailVerified(true);
    toast.success(
      data.message || "Email verified. Enter your reset code.",
      { id: toastId }
    );
  } catch (err) {
    toast.error("Network error. Please try again.", { id: toastId });
  } finally {
    setLoading(false);
  }
}



  return (
    <div className="w-full h-full flex items-center justify-center">
      <Card className="w-full max-w-sm ">
            <CardHeader className="space-y-2">
        <CardTitle className="text-3xl font-bold text-center">{cfg.title}</CardTitle>
        <CardDescription className="text-center">{cfg.description}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Email */}
        <form onSubmit={handleVerifyEmail} className={emailVerified ? "hidden" : ""}>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
              value={email}
              disabled={emailVerified}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <CardFooter className="mt-4">
            <Button type="submit" className="w-full bg-black hover:bg-gray-900" disabled={loading}>
              {loading ? "Verifying..." : cfg.emailButton}
            </Button>
          </CardFooter>
        </form>

      </CardContent>

      <Separator className="my-2 bg-gray-200" />
      <CardFooter>
        <p className="text-sm text-gray-500 mt-2">
          <Link href={cfg.linkHref}>
            <Button variant="secondary" type="button" className="p-0 h-auto">
              {cfg.linkButton}
            </Button>
          </Link>
        </p>
      </CardFooter>
      </Card>
    </div>
  );
}
