"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/firebase/auth-context";
import { Car, MapPin, Clock, CreditCard } from "lucide-react";
import LogoHeader from "components/LogoHeader";

export function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Car className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Space4Wheels</span>
          </div>
          <nav className="hidden md:flex space-x-4">
            <Link href="#features" className="text-sm font-medium hover:text-primary">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:text-primary">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:text-primary">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login">
              <Button variant="outline">Log In</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Find and Book Parking Spots with Ease</h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
              Discover nearby parking spots, book in advance, and never worry about parking again.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/signup">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/signup?role=owner">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Register as Plot Owner
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <section id="features" className="py-16 bg-muted/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">Key Features</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <MapPin className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Find Nearby Spots</h3>
                <p className="text-muted-foreground">
                  Discover available parking spots near your destination with our interactive map.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <Clock className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Book in Advance</h3>
                <p className="text-muted-foreground">
                  Reserve your parking spot ahead of time to ensure availability when you arrive.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg shadow-sm">
                <CreditCard className="h-10 w-10 text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Easy Payment</h3>
                <p className="text-muted-foreground">
                  Pay securely through our platform with multiple payment options.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-2">Search</h3>
                <p className="text-muted-foreground">
                  Find parking spots near your destination using our map or list view.
                </p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-2">Book</h3>
                <p className="text-muted-foreground">Select your preferred time slot and confirm your booking.</p>
              </div>
              <div className="text-center">
                <div className="bg-primary/10 text-primary rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-2">Park</h3>
                <p className="text-muted-foreground">
                  Use the app to navigate to your spot and enjoy hassle-free parking.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Space4Wheels</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Space4Wheels. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
