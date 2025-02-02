import React from "react";
import { BookingSection } from "./BookingForm";

export default function BookingPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto">
        <div className="py-8 md:py-12">
          <BookingSection />
        </div>
      </div>
    </main>
  );
}
