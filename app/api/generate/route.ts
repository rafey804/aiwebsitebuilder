import { NextRequest, NextResponse } from "next/server";
import groq, { MODELS } from "@/lib/groq";
import type { WebsiteInput, GeneratedWebsite } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const input: WebsiteInput = await request.json();

    // Validate input
    if (!input.businessName || !input.businessDescription) {
      return NextResponse.json(
        { error: "Business name and description are required" },
        { status: 400 }
      );
    }

    // Generate website content using AI
    const prompt = createWebsiteGenerationPrompt(input);

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are an expert web developer and designer. Generate complete, professional website content and structure based on user requirements. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      model: MODELS.LLAMA_70B,
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    const generatedContent = completion.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error("No content generated from AI");
    }

    const websiteData: GeneratedWebsite = JSON.parse(generatedContent);

    // Generate Next.js code files
    const codeFiles = generateNextJsFiles(websiteData, input);
    websiteData.code = { files: codeFiles };

    return NextResponse.json({
      success: true,
      data: websiteData,
    });
  } catch (error) {
    console.error("Error generating website:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate website",
      },
      { status: 500 }
    );
  }
}

function createWebsiteGenerationPrompt(input: WebsiteInput): string {
  return `
Generate a complete, professional website for the following business:

Business Name: ${input.businessName}
Description: ${input.businessDescription}
${input.targetAudience ? `Target Audience: ${input.targetAudience}` : ""}
${input.location ? `Location: ${input.location}` : ""}
Services/Products: ${input.services}
Theme Style: ${input.themeStyle}
${input.primaryColor ? `Primary Color: ${input.primaryColor}` : ""}
${input.secondaryColor ? `Secondary Color: ${input.secondaryColor}` : ""}

Generate a JSON response with the following structure:
{
  "content": {
    "hero": {
      "heading": "Catchy, engaging headline",
      "subheading": "Supporting text that explains the value proposition",
      "ctaText": "Call to action button text"
    },
    "about": {
      "title": "About section title",
      "description": "Detailed about section (2-3 paragraphs)"
    },
    "services": [
      {
        "title": "Service name",
        "description": "Service description",
        "icon": "lucide-react icon name (e.g., Sparkles, Rocket, etc.)"
      }
    ],
    "testimonials": [
      {
        "name": "Customer name",
        "role": "Customer role/position",
        "content": "Testimonial text"
      }
    ],
    "faq": [
      {
        "question": "FAQ question",
        "answer": "FAQ answer"
      }
    ],
    "contact": {
      "email": "suggested email",
      "phone": "suggested phone format",
      "address": "${input.location || "123 Main St"}"
    }
  },
  "design": {
    "primaryColor": "${input.primaryColor || "#3B82F6"}",
    "secondaryColor": "${input.secondaryColor || "#8B5CF6"}",
    "accentColor": "Complementary accent color",
    "font": {
      "heading": "Modern font for headings",
      "body": "Readable font for body text"
    }
  },
  "seo": {
    "title": "SEO-optimized page title (50-60 chars)",
    "description": "SEO meta description (150-160 chars)",
    "keywords": ["keyword1", "keyword2", "keyword3"]
  }
}

Make it professional, engaging, and tailored to the ${input.themeStyle} style.
Include 3-5 services, 2-3 testimonials, and 4-6 FAQ items.
`;
}

function generateNextJsFiles(
  website: GeneratedWebsite,
  input: WebsiteInput
): Record<string, string> {
  const files: Record<string, string> = {};

  // package.json
  files["package.json"] = JSON.stringify(
    {
      name: input.businessName.toLowerCase().replace(/\s+/g, "-"),
      version: "0.1.0",
      private: true,
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
        lint: "next lint",
      },
      dependencies: {
        next: "16.0.3",
        react: "^19",
        "react-dom": "^19",
        "lucide-react": "^0.553.0",
      },
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^19",
        "@types/react-dom": "^19",
        "@tailwindcss/postcss": "^4",
        tailwindcss: "^4",
        typescript: "^5",
      },
    },
    null,
    2
  );

  // tailwind.config.ts
  files["tailwind.config.ts"] = `import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "${website.design.primaryColor}",
        secondary: "${website.design.secondaryColor}",
        accent: "${website.design.accentColor}",
      },
    },
  },
  plugins: [],
};
export default config;
`;

  // postcss.config.mjs
  files["postcss.config.mjs"] = `/** @type {import('postcss').Postcss} */
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
`;

  // tsconfig.json
  files["tsconfig.json"] = JSON.stringify(
    {
      compilerOptions: {
        target: "ES2017",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "bundler",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        plugins: [{ name: "next" }],
        paths: { "@/*": ["./*"] },
      },
      include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
      exclude: ["node_modules"],
    },
    null,
    2
  );

  // next.config.ts
  files["next.config.ts"] = `import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
`;

  // app/globals.css
  files["app/globals.css"] = `@import "tailwindcss";

:root {
  --primary: ${website.design.primaryColor};
  --secondary: ${website.design.secondaryColor};
  --accent: ${website.design.accentColor};
}

body {
  font-family: system-ui, -apple-system, sans-serif;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 700;
}
`;

  // app/layout.tsx
  files["app/layout.tsx"] = `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${website.seo.title}",
  description: "${website.seo.description}",
  keywords: ${JSON.stringify(website.seo.keywords)},
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
`;

  // app/page.tsx - Main website page
  files["app/page.tsx"] = generateMainPage(website, input);

  // README.md
  files["README.md"] = `# ${input.businessName}

${input.businessDescription}

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deploy

Deploy easily on [Vercel](https://vercel.com):

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

Generated with AI Website Builder
`;

  return files;
}

function generateMainPage(website: GeneratedWebsite, input: WebsiteInput): string {
  const { content } = website;
  const icons = content.services.map((s) => s.icon).join(", ");

  return `"use client";

import { ${icons} } from "lucide-react";
import { useState } from "react";

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="text-2xl font-bold text-primary">
              ${input.businessName}
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="#home" className="text-gray-700 hover:text-primary transition">Home</a>
              <a href="#about" className="text-gray-700 hover:text-primary transition">About</a>
              <a href="#services" className="text-gray-700 hover:text-primary transition">Services</a>
              <a href="#testimonials" className="text-gray-700 hover:text-primary transition">Testimonials</a>
              <a href="#contact" className="text-gray-700 hover:text-primary transition">Contact</a>
            </div>
            <button className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
            ${content.hero.heading}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            ${content.hero.subheading}
          </p>
          <button className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary/90 transition transform hover:scale-105">
            ${content.hero.ctaText}
          </button>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            ${content.about.title}
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed">
            ${content.about.description}
          </p>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Our Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${content.services
              .map((service, idx) => {
                const IconComponent = service.icon;
                return `<div key={${idx}} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition border border-gray-100">
              <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <${IconComponent} className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                ${service.title}
              </h3>
              <p className="text-gray-600">
                ${service.description}
              </p>
            </div>`;
              })
              .join("\n            ")}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            What Our Clients Say
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            ${
              content.testimonials
                ?.map(
                  (testimonial, idx) => `<div key={${idx}} className="bg-white p-8 rounded-xl shadow-lg">
              <p className="text-gray-700 mb-6 italic">
                "${testimonial.content}"
              </p>
              <div className="border-t pt-4">
                <p className="font-bold text-gray-900">${testimonial.name}</p>
                <p className="text-sm text-gray-500">${testimonial.role}</p>
              </div>
            </div>`
                )
                .join("\n            ") || ""
            }
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            ${
              content.faq
                ?.map(
                  (faq, idx) => `<div key={${idx}} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => setOpenFaq(openFaq === ${idx} ? null : ${idx})}
                className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-gray-50"
              >
                <span className="font-semibold text-gray-900">${faq.question}</span>
                <span className="text-primary">{openFaq === ${idx} ? "−" : "+"}</span>
              </button>
              {openFaq === ${idx} && (
                <div className="px-6 pb-4 text-gray-600">
                  ${faq.answer}
                </div>
              )}
            </div>`
                )
                .join("\n            ") || ""
            }
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-8">Get In Touch</h2>
          <p className="text-xl mb-12">
            Ready to get started? Contact us today!
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            ${
              content.contact.email
                ? `<div>
              <p className="font-semibold mb-2">Email</p>
              <p>${content.contact.email}</p>
            </div>`
                : ""
            }
            ${
              content.contact.phone
                ? `<div>
              <p className="font-semibold mb-2">Phone</p>
              <p>${content.contact.phone}</p>
            </div>`
                : ""
            }
            ${
              content.contact.address
                ? `<div>
              <p className="font-semibold mb-2">Address</p>
              <p>${content.contact.address}</p>
            </div>`
                : ""
            }
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-2xl font-bold mb-4">${input.businessName}</p>
          <p className="text-gray-400 mb-8">${input.businessDescription}</p>
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} ${input.businessName}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
`;
}
