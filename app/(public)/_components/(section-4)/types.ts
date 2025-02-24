import lightsaaslandingpage from "@/public/lightsaas-landing-page.png";
import darksaaslandingpage from "@/public/darksaas-landing-page.png";
import aistartuplandingpage1 from "@/public/ai-startup-landing-page1.png";
import aistartuplandingpage2 from "@/public/ai-startup-landing-page2.png";

export const portfolioProjects = [
  {
    company: "Captivity",
    year: "2024",
    title: "E-commerce Frontend Developer",
    results: [
      "Increased conversion rates by 38% through improved UI/UX design",
      "Reduced page load time by 45% with optimized asset delivery",
      "Implemented responsive design increasing mobile sales by 27%",
      "Built custom React components with micro-animations boosting engagement metrics",
    ],
    backend: [
      "Integrated headless CMS for content management",
      "Implemented AWS S3 for media storage and delivery",
      "Set up Stripe payment processing with custom checkout flow",
    ],
    link: "https://captivity.co.za",
    image: lightsaaslandingpage,
  },
  {
    company: "Seven Plus Adult Matric",
    year: "2024",
    title: "Educational Role-Based Student System",
    results: [
      "Designed multi-role system with student, teacher, and admin portals",
      "Created interactive learning modules with 92% student satisfaction rate",
      "Developed automated grading system reducing assessment time by 65%",
      "Implemented real-time progress tracking for students and educators",
    ],
    backend: [
      "Built Node.js API with role-based authentication system",
      "Designed MongoDB database with specialized document schemas for educational data",
      "Implemented secure file storage for assignments and course materials",
      "Created automated student performance analytics engine",
    ],
    link: "https://sevenplusadultmatric.co.za",
    image: darksaaslandingpage,
  },
  {
    company: "FFWRD",
    year: "2024",
    title: "E-commerce Frontend Developer",
    results: [
      "Developed product visualization tools increasing conversion by 42%",
      "Created custom shopping cart with 30% reduction in abandonment rate",
      "Implemented AI-driven product recommendation system",
      "Developed SEO-optimized frontend structure improving organic traffic by 55%",
    ],
    backend: [
      "Integrated multi-vendor marketplace API",
      "Implemented inventory management system with real-time updates",
      "Created recommendation engine using machine learning algorithms",
      "Built custom analytics dashboard for business metrics tracking",
    ],
    link: "https://ffwrd.co.za",
    image: aistartuplandingpage1,
  },
  {
    company: "Codeeza Bootcamp",
    year: "2024",
    title: "Learning Management System Developer",
    results: [
      "Built interactive coding environment with real-time evaluation",
      "Designed gamified learning system increasing student engagement by 78%",
      "Created collaborative project management tools for group assignments",
      "Developed peer review system improving student skill development",
    ],
    backend: [
      "Created sandbox environment for secure code execution",
      "Implemented WebSocket for real-time collaboration features",
      "Built automated testing framework for student code submissions",
      "Developed progress tracking API with custom metrics for learning paths",
      "Integrated OAuth2 for simplified login with GitHub and GitLab",
    ],
    link: "https://codeezabootcamp.com",
    image: aistartuplandingpage2,
  },
];
