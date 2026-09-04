import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Logo } from "@/components/logo";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-6 py-12">
        <Logo showTagline />

        <Card className="mt-8 w-full max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">
            Welcome to CampusMate
          </h1>

          <p className="mt-4 text-gray-600">
            Your smart student companion for academics, productivity,
            campus life, and more.
          </p>

          <div className="mt-6">
            <Button>Get Started</Button>
          </div>
        </Card>
      </div>
    </main>
  );
}