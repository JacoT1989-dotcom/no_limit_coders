import Image from "next/image";
import { CheckCircle, ArrowUpRight } from "lucide-react";
import { Card } from "./Card";
import { portfolioProjects } from "./types";

export const ProjectsSection = () => {
  return (
    <section id="projects" className="py-24 min-h-screen flex items-center">
      <div className="container mx-auto px-4">
        <div className="flex justify-center flex-col items-center mb-10">
          <h2 className="text-5xl font-bold mb-4 text-foreground text-center">
            Featured Projects
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
                  <ul className="flex flex-col gap-4 mt-4 md:mt-5">
                    {project.results.map((result, index) => (
                      <li
                        key={index}
                        className="flex gap-2 text-sm md:text-base text-white/50"
                      >
                        <CheckCircle className="size-5 md:size-6" />
                        <span>{result}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={project.link}>
                    <button className="bg-red-700 hover:bg-black text-white py-2 md:py-3 h-12 w-full md:w-auto px-6 rounded-xl font-semibold inline-flex items-center justify-center gap-2 mt-8">
                      <span>View Live Site</span>
                      <ArrowUpRight className="size-4" />
                    </button>
                  </a>
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
