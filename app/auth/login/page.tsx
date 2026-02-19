"use client";

import LoginForm from "@/components/auth/login-form";
import ThemeLogo from "@/components/shared/theme-logo";
import AuthImage from "@/public/assets/images/EliteLogo.png";
import { StaticImg } from "@/types/static-image";
import type { Metadata } from "next";
import Image from "next/image";

const metadata: Metadata = {
  title: "Register & Create Account | WowDash Admin Dashboard",
  description:
    "Create a new user account and get started with the WowDash Admin Dashboard built with Next.js and Tailwind CSS.",
};

const forgotPassImage: StaticImg = {
  image: AuthImage,
};

const Login = () => {
  return (
    <section className="bg-white dark:bg-slate-900 flex flex-wrap min-h-screen">
      {/* Left Image */}
      <div className="hidden lg:flex lg:w-1/2 h-screen items-center justify-center bg-white">
        <Image
          src={forgotPassImage.image}
          alt="Auth Illustration"
          width={500}
          height={500}
          className="max-w-[500px] w-full h-auto object-contain"
          priority
        />
      </div>


      {/* Right Form */}
      <div className="lg:w-1/2 w-full py-8 px-6 flex flex-col justify-center">
        <div className="lg:max-w-[464px] w-full mx-auto">
          {/* Logo and heading */}
          <div>

            <h4 className="font-semibold mb-3 text-center">Sign In to your Account</h4>
            <p className="mb-8 text-neutral-500 dark:text-neutral-300 text-lg text-center">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Login Form */}
          <LoginForm />
        </div>
      </div>
    </section>
  );
};

export default Login;
