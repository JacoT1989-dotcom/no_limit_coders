"use client";

import React from "react";
import { Construction, Wrench, Code2, ArrowLeft, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";

const UnderDevelopment = () => {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full py-8 fade-in">
      {/* Main Development Notice */}
      <div className="w-full max-w-5xl mx-auto section-block section-block-dark space-y-8 slide-up">
        <div className="flex flex-col items-center justify-center text-center space-y-6">
          {/* Animated Construction Icons */}
          <div className="flex items-center justify-center space-x-8 mb-4">
            <Construction className="w-14 h-14 text-accent float opacity-80" />
            <Wrench className="w-12 h-12 text-accent float-reverse delay-1 opacity-90" />
            <Code2 className="w-14 h-14 text-accent float delay-2 opacity-80" />
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gradient bg-gradient-to-r from-accent to-red-700">
            Under Development
          </h1>

          {/* Subheading */}
          <p className="text-xl text-foreground/90 max-w-2xl mx-auto">
            We are working hard to bring you something amazing! Our team is
            crafting every pixel with care.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="max-w-xl mx-auto space-y-4 bg-card/30 p-6 rounded-lg backdrop-blur-sm">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <Clock className="h-5 w-5 text-accent" />
              <span className="font-medium">Development Progress</span>
            </div>
            <span className="text-accent font-bold">70%</span>
          </div>
          <Progress value={70} className="h-3 bg-secondary/50" />
          <p className="text-muted-foreground text-sm flex justify-between mt-2">
            <span>Planning</span>
            <span>Design</span>
            <span>Development</span>
            <span>Testing</span>
          </p>
        </div>
      </div>

      {/* Features Section */}
      <div className="w-full max-w-5xl mx-auto space-y-6 slide-up delay-1 mt-10">
        <h2 className="text-2xl font-semibold text-center mb-8">
          What&apos;s Coming?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="bg-card bg-opacity-80 hover-scale fade-in delay-1">
            <CardHeader>
              <CardTitle className="flex items-center text-accent">
                <span className="mr-2">01</span> New Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90">
                We&apos;re building powerful new functionality to enhance your
                experience, including improved analytics, custom dashboards, and
                advanced reporting.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card bg-opacity-80 hover-scale fade-in delay-2">
            <CardHeader>
              <CardTitle className="flex items-center text-accent">
                <span className="mr-2">02</span> Better UI
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90">
                Our design team is crafting a seamless, modern interface that
                puts the most important information at your fingertips with
                intuitive navigation.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-card bg-opacity-80 hover-scale fade-in delay-3">
            <CardHeader>
              <CardTitle className="flex items-center text-accent">
                <span className="mr-2">03</span> Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-foreground/90">
                We&apos;re optimizing every aspect of the app to make it
                lightning fast, responsive, and reliable, even under the
                heaviest workloads.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Updates & Return Section */}
      <div className="w-full max-w-5xl mx-auto section-block section-block-dark space-y-6 slide-up delay-2 mt-10">
        <div className="text-center space-y-6">
          <h2 className="text-2xl font-semibold">Stay Updated</h2>
          <p className="text-foreground/90 max-w-xl mx-auto">
            We&apos;re working hard to bring this section online as soon as
            possible. Check back regularly for updates on our progress.
          </p>

          <div className="mt-10 space-y-6">
            <p className="text-muted-foreground">
              Expected completion: Coming Soon
            </p>
            <Link href="/customer" className="inline-block">
              <Button
                variant="outline"
                className=" hover:border-accent transition-colors duration-300"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Return to Homepage
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnderDevelopment;
