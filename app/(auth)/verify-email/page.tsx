'use client'
import React , {useState} from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, ArrowLeft , RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const [isResending, setIsResending] = useState(false);
  const email = searchParams.get('email');

  const handleResendEmail = async () => {
    if (!email) {
      toast.error("Email address not found. Please try again.");
      return;
    }

    setIsResending(true);
    const toastId = toast.loading("Sending verification email...");

    try {
      const res = await fetch("/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success("Verification email sent! Check your inbox.", { id: toastId });
      } else {
        toast.error(result.error || "Failed to resend email", { id: toastId });
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.", { id: toastId });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex">
    
        <div className="w-full h-full flex items-center justify-center p-6">
          <Card className="w-full max-w-md border-none shadow-none bg-white">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold">Check your email</CardTitle>
              <CardDescription className="text-base">
                We&apos;ve sent a verification link to your email address. Please check your inbox and click the link to activate your account.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="text-sm font-medium text-gray-700">What to do next:</p>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  <li>Check your email inbox</li>
                  <li>Click the verification link in the email</li>
                  <li>Return here to log in</li>
                </ul>
              </div>

              <p className="text-sm text-gray-500 text-center">
                Didn&apos;t receive the email? Check your spam folder or{" "}
                <Link 
                    href="/contact" 
                    className="text-blue-600 hover:underline"
                >
                    contact support
                </Link>.
              </p>

              {/* Resend Button - only show if we have email */}
              {email && (
                <Button 
                  onClick={handleResendEmail}
                  disabled={isResending}
                  variant="secondary"
                  className="w-full bg-gray-200"
                >
                  {isResending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Verification Email
                    </>
                  )}
                </Button>
              )}

              <div className="pt-4">
                <Link href="/login">
                  <Button className="w-full bg-blue-600" variant="default">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
    </div>
  );
}
