"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

const HeroSection = () => {
  const imageRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const imageElement = imageRef.current;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const scrollThreshold = 100;

      // Disable sliding effect on mobile by forcing the final state
      if (window.innerWidth < 768) {
        imageElement.classList.add("scrolled");
        return;
      }

      if (scrollPosition > scrollThreshold) {
        imageElement.classList.add("scrolled");
      } else {
        imageElement.classList.remove("scrolled");
      }
    };

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    // Set initial state based on current screen size
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  return (
    <section className="w-full pt-36 md:pt-48 pb-10">
      <div className="space-y-6 text-center">
        <div className="space-y-6 mx-auto">
          <h1 className="text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl gradient-title animate-gradient">
            Your AI Career Coach for
            <br />
            Professional Success
          </h1>
          <p className="mx-auto max-w-[600px] px-4 md:px-0 text-muted-foreground md:text-xl">
            Advance your career with personalized guidance, interview prep, and
            AI-powered tools for job success.
          </p>
        </div>
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button size="lg" className="px-8">
              Get Started
            </Button>
          </Link>
          <Button
            size="lg"
            variant="outline"
            className="px-8"
            onClick={() => setIsModalOpen(true)}
          >
            Watch Demo
          </Button>
        </div>
        <div className="hero-image-wrapper mt-5 md:mt-0">
          <div ref={imageRef} className="hero-image">
            <Image
              src="/banner3.png"
              width={1280}
              height={720}
              alt="Dashboard Preview"
              className="rounded-lg shadow-2xl border mx-auto"
              priority
            />
          </div>
        </div>
      </div>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl p-0 bg-transparent border-0">
          <DialogTitle className="sr-only">Watch Demo Video</DialogTitle>
          <div className="aspect-video">
            <iframe
              src={
                isModalOpen
                  ? "https://www.youtube.com/embed/YeCcuJpniEc?autoplay=1"
                  : undefined
              }
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="w-full h-full rounded-lg"
            ></iframe>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default HeroSection;
