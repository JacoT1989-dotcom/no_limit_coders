"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Check } from "lucide-react";

interface PricingCardProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  isPopular?: boolean;
}

export function PricingCard({
  title,
  price,
  description,
  features,
  isPopular,
}: PricingCardProps) {
  return (
    <Card
      className={`flex flex-col h-full relative 
        dark:bg-black/40 dark:backdrop-blur-sm
        ${isPopular ? "border-accent dark:border-white border-2" : "dark:border-white/10"}`}
    >
      {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent dark:bg-white dark:text-black text-white px-4 py-1 rounded-full text-sm font-medium">
          Popular
        </div>
      )}
      <CardHeader>
        <CardTitle className="dark:text-white">{title}</CardTitle>
        <CardDescription className="dark:text-white/60">
          {description}
        </CardDescription>
        <div className="mt-4">
          <span className="text-4xl font-bold dark:text-white">${price}</span>
          <span className="text-muted-foreground dark:text-white/60">
            /month
          </span>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2">
              <Check className="h-4 w-4 text-accent dark:text-white" />
              <span className="text-sm dark:text-white/80">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter></CardFooter>
    </Card>
  );
}
