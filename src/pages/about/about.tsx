import { Navbar } from "@/components/layout/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Mail, MapPin } from "lucide-react";

export function AboutPage() {
  return (
    <div className="dark min-h-screen bg-background text-foreground">
      <Navbar className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/50 backdrop-blur-md" />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Hero Section */}
          <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
            <Avatar className="w-48 h-48 border-4 border-white/10 shadow-2xl">
              <AvatarImage src="/images/avatar.jpg" alt="Trinh Minh Son" />
              <AvatarFallback className="text-4xl bg-zinc-800 text-zinc-400">TS</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left space-y-4">
              <h1 className="text-4xl font-bold tracking-tight text-white">Trinh Minh Son</h1>
              <p className="text-xl text-zinc-400">
                Full Stack Developer & UI/UX Enthusiast
              </p>
              <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500">
                <MapPin className="w-4 h-4" />
                <span>Ho Chi Minh City, Vietnam</span>
              </div>
              <div className="flex gap-4 justify-center md:justify-start pt-2">
                <Button variant="outline" size="icon" className="border-white/10 hover:bg-white/10 hover:text-white text-zinc-400">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">About Me</CardTitle>
              </CardHeader>
              <CardContent className="text-zinc-400 leading-relaxed">
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

            <Card className="bg-zinc-900/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {["React", "TypeScript", "Node.js", "Tailwind CSS", "Next.js", "PostgreSQL", "Docker", "AWS"].map((skill) => (
                    <span 
                      key={skill} 
                      className="px-3 py-1 bg-white/5 border border-white/10 text-zinc-300 hover:bg-white/10 hover:text-white transition-colors rounded-full text-sm font-medium cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-zinc-900/50 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Experience</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex gap-4 group">
                  <div className="w-1 bg-zinc-800 rounded-full group-hover:bg-white/50 transition-colors" />
                  <div className="space-y-1">
                    <h3 className="font-semibold text-zinc-200">Senior Frontend Developer</h3>
                    <p className="text-sm text-zinc-500">Tech Company Inc. • 2022 - Present</p>
                    <p className="text-zinc-400 text-sm">
                      Leading the frontend team, architecting scalable applications, and mentoring junior developers.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 group">
                  <div className="w-1 bg-zinc-800 rounded-full group-hover:bg-white/50 transition-colors" />
                  <div className="space-y-1">
                    <h3 className="font-semibold text-zinc-200">Full Stack Developer</h3>
                    <p className="text-sm text-zinc-500">Startup Hub • 2020 - 2022</p>
                    <p className="text-zinc-400 text-sm">
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
