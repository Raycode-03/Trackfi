"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useAuthLoading } from "../../context/AuthLoadingContext";

const SignInWithGoogleButton = () => { 
   const { loadingType, setLoadingType } = useAuthLoading();
  const isLoading = loadingType === 'google';
  const isDisabled = loadingType !== null;


  const handleGoogleSignIn = async () => {
    setLoadingType('google');
    window.location.href = '/api/auth/google';  
  };

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full h-12 p-4 flex items-center justify-center  bg-[#1A1919] border-white/10 text-white hover:bg-[#3f3e3e] disabled:cursor-not-allowed disabled:opacity-50"
      onClick={handleGoogleSignIn}
      disabled={isDisabled}
    >
      <Image 
        src="/logos/google.svg" 
        alt="Google logo" 
        width={20} 
        height={20} 
        className="mr-2 inline-block"
      />
      {isLoading ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
};

export default SignInWithGoogleButton;