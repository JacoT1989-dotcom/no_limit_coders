import Image from "next/image";
import { CheckCircle, Server } from "lucide-react";
import { Card } from "./Card";
import { portfolioProjects } from "./types";

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-center flex-col items-center mb-10">
          <h2 className="text-5xl font-bold mb-4 text-foreground text-center">
            Featured Projects of 2024
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-center text-black">
            CRMs, Blogs, Admin Panels, Marketing Sites, E-commerce, AI, and more
          </p>
        </div>
        <div className="mt-10 md:mt-20 flex flex-col gap-20">
          {portfolioProjects.map((project, projectIndex) => (
            <Card
              key={project.title}
              className="px-8 pt-8 pb-0 md:pt-12 md:px-10 lg:pt-16 lg:px-20 sticky hover:bg-black/60 transition-colors duration-300"
              style={{ top: `calc(104px + ${projectIndex * 45}px)` }}
            >
              <div className="lg:grid lg:grid-cols-2 lg:gap-16">
                <div className="lg:pb-16">
                  <div className="bg-gradient-to-r from-white to-red-200 inline-flex gap-2 font-bold uppercase tracking-widest text-sm text-transparent bg-clip-text">
                    <span>{project.company}</span>
                    <span>&bull;</span>
                    <span>{project.year}</span>
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl mt-3 tracking-tight text-white">
                    {project.title}
                  </h3>
                  <hr className="border-t border-white/10 my-6" />

                  {/* Frontend Results */}
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="size-4 text-white/70" />
                      <span className="text-sm font-medium text-white/70">
                        Frontend
                      </span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {project.results.slice(0, 3).map((result, index) => (
                        <li key={index} className="text-sm text-white/50 pl-6">
                          {result}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Backend Systems */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Server className="size-4 text-white/70" />
                      <span className="text-sm font-medium text-white/70">
                        Backend
                      </span>
                    </div>
                    <ul className="flex flex-col gap-2">
                      {project.backend.slice(0, 2).map((system, index) => (
                        <li key={index} className="text-sm text-white/50 pl-6">
                          {system}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="relative">
                  <Image
                    src={project.image}
                    alt={project.title}
                    className="mt-8 -mb-4 md:-mb-0 lg:mt-0 lg:absolute lg:h-full lg:w-auto lg:max-w-none"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
