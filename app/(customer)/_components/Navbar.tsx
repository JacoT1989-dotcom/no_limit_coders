"use client";
import Link from "next/link";
import Image from "next/image";
import UserButton from "./UserButton";

const Navbar = () => {
  return (
    <>
      {/* Fixed top navbar */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <nav className=" text-white shadow-lg">
          <div className="flex items-center justify-between text-xs mx-auto w-full py-6 px-8">
            <Link href="/" className="flex items-center">
              <Image
                src="/logo_gh.png"
                alt="Genius Humans Logo"
                width={250}
                height={45}
                className="object-contain"
              />
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <UserButton className="text-lg" />
            </div>

            <div className="md:hidden flex items-center">
              <UserButton className="text-lg" />
            </div>
          </div>
        </nav>
      </div>

      {/* Spacer to prevent content from going under fixed navbar */}
      <div className="h-[120px] md:h-[88px]"></div>
    </>
  );
};

export default Navbar;
