import { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function AboutPage() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <Navbar className="fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/5" />
      
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-accent/5 pointer-events-none" />

      <main className="relative pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div 
            className={cn(
              "mb-12 transition-all duration-700 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
                <User className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h1 
                  className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  About
                </h1>
                <p className="text-muted-foreground text-sm">
                  Get to know me better
                </p>
              </div>
            </div>
          </div>

          {/* Hero Section */}
          <div 
            className={cn(
              "flex flex-col md:flex-row items-center gap-8 mb-12",
              "transition-all duration-700 delay-100 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <Avatar className="w-48 h-48 border-4 border-border shadow-xl">
              <AvatarImage src="/images/avatar.jpg" alt="Trinh Minh Son" />
              <AvatarFallback className="text-4xl bg-secondary text-muted-foreground">TS</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left space-y-4">
              <h2 
                className="text-3xl font-bold tracking-tight text-foreground"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Trinh Minh Son
              </h2>
              <p className="text-xl text-muted-foreground">
                Full Stack Developer & UI/UX Enthusiast
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
              <div className="flex gap-4 justify-center md:justify-start pt-2">
                <Button variant="outline" size="icon" className="border-border hover:bg-accent/10 hover:text-accent hover:border-accent/30 text-muted-foreground cursor-pointer">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div 
            className={cn(
              "grid gap-6 md:grid-cols-2",
              "transition-all duration-700 delay-200 ease-out",
              isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            )}
          >
            <Card className="bg-card/80 backdrop-blur-sm border-border hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground">About Me</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground leading-relaxed">
                <p>
                  Hi! I'm a passionate developer who loves building beautiful and functional web applications. 
                  I specialize in React, Node.js, and modern web technologies.
                </p>
                <br />
                <p>
                  When I'm not coding, you can find me exploring new technologies, reading books, 
                  or capturing moments through my camera lens.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm border-border hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "Tailwind CSS", "Next.js", "PostgreSQL", "Docker", "AWS"].map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1 bg-secondary border border-border text-foreground hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors rounded-full text-sm font-medium cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-card/80 backdrop-blur-sm border-border hover:shadow-lg hover:shadow-accent/5 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-foreground">Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4 group">
                  <div className="w-1 bg-border rounded-full group-hover:bg-accent transition-colors" />
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">Senior Frontend Developer</h3>
                    <p className="text-sm text-muted-foreground">Tech Company Inc. • 2022 - Present</p>
                    <p className="text-muted-foreground text-sm">
                      Leading the frontend team, architecting scalable applications, and mentoring junior developers.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 group">
                  <div className="w-1 bg-border rounded-full group-hover:bg-accent transition-colors" />
                  <div className="space-y-1">
                    <h3 className="font-semibold text-foreground">Full Stack Developer</h3>
                    <p className="text-sm text-muted-foreground">Startup Hub • 2020 - 2022</p>
                    <p className="text-muted-foreground text-sm">
                      Built and maintained multiple client projects using MERN stack.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
