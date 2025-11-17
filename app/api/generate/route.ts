import { NextRequest, NextResponse } from "next/server";
import groq, { MODELS } from "@/lib/groq";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Prompt is required" },
        { status: 400 }
      );
    }

    // Generate website structure using AI
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert web designer. Generate a COMPLETE multi-page website with DETAILED, SPECIFIC content.

Return ONLY valid JSON:
{
  "businessName": "Extract from prompt",
  "tagline": "Short catchy tagline",
  "description": "2-3 sentences about the business",
  "theme": {
    "primaryColor": "#hexcolor",
    "secondaryColor": "#hexcolor",
    "accentColor": "#hexcolor"
  },
  "pages": {
    "home": {
      "hero": {
        "title": "Compelling headline",
        "subtitle": "Detailed subtitle",
        "cta": "Button text",
        "image": "relevant keyword for image (1-2 words)"
      },
      "features": [
        {
          "title": "Feature name",
          "description": "Detailed description (2-3 sentences)",
          "icon": "emoji",
          "image": "keyword"
        }
      ],
      "testimonials": [
        {
          "name": "Person name",
          "role": "Their position",
          "content": "Testimonial text",
          "rating": 5
        }
      ]
    },
    "about": {
      "hero": {
        "title": "About page title",
        "subtitle": "Subtitle",
        "image": "keyword"
      },
      "story": "Detailed company story (3-4 paragraphs)",
      "mission": "Mission statement",
      "values": [
        {
          "title": "Value name",
          "description": "Description",
          "icon": "emoji"
        }
      ],
      "team": [
        {
          "name": "Team member",
          "role": "Position",
          "bio": "Short bio"
        }
      ]
    },
    "services": {
      "hero": {
        "title": "Services title",
        "subtitle": "Subtitle",
        "image": "keyword"
      },
      "services": [
        {
          "title": "Service name",
          "description": "Detailed description",
          "features": ["feature1", "feature2", "feature3"],
          "price": "Optional price",
          "image": "keyword"
        }
      ]
    },
    "contact": {
      "hero": {
        "title": "Contact title",
        "subtitle": "Subtitle"
      },
      "email": "suggested@email.com",
      "phone": "+1 (555) 000-0000",
      "address": "Full address",
      "hours": "Business hours"
    }
  },
  "seo": {
    "title": "SEO title",
    "description": "Meta description"
  }
}

Generate SPECIFIC content based on the business type. Use appropriate image keywords.`,
        },
        {
          role: "user",
          content: `Create a professional multi-page website for: ${prompt}

Include:
- Home: Hero, 4-6 features, testimonials, CTA
- About: Story, mission, 3-4 values, team members
- Services: 4-6 detailed services with features
- Contact: Form, contact info, hours

Make content SPECIFIC to this business.`,
        },
      ],
      model: MODELS.LLAMA_70B,
      temperature: 0.7,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    const websiteData = JSON.parse(aiResponse);
    const validatedData = validateData(websiteData);

    // Generate complete Next.js project
    const files = generateNextJsProject(validatedData);

    return NextResponse.json({
      success: true,
      data: {
        content: validatedData,
        seo: validatedData.seo,
        code: { files },
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate website",
      },
      { status: 500 }
    );
  }
}

function validateData(data: any): any {
  return {
    businessName: data.businessName || "My Business",
    tagline: data.tagline || "Professional Services",
    description: data.description || "We provide excellent services.",
    theme: {
      primaryColor: data.theme?.primaryColor || "#3B82F6",
      secondaryColor: data.theme?.secondaryColor || "#8B5CF6",
      accentColor: data.theme?.accentColor || "#EC4899",
    },
    pages: {
      home: {
        hero: {
          title: data.pages?.home?.hero?.title || "Welcome to " + (data.businessName || "Our Business"),
          subtitle: data.pages?.home?.hero?.subtitle || "Your trusted partner for excellence",
          cta: data.pages?.home?.hero?.cta || "Get Started",
          image: data.pages?.home?.hero?.image || "business",
        },
        features: data.pages?.home?.features || [
          { title: "Quality", description: "Top quality service", icon: "⭐", image: "quality" },
          { title: "Fast", description: "Quick delivery", icon: "⚡", image: "speed" },
          { title: "Reliable", description: "Always dependable", icon: "🛡️", image: "trust" },
        ],
        testimonials: data.pages?.home?.testimonials || [
          { name: "John Doe", role: "CEO", content: "Excellent service!", rating: 5 },
        ],
      },
      about: {
        hero: {
          title: data.pages?.about?.hero?.title || "About Us",
          subtitle: data.pages?.about?.hero?.subtitle || "Learn our story",
          image: data.pages?.about?.hero?.image || "team",
        },
        story: data.pages?.about?.story || "We are dedicated to excellence.",
        mission: data.pages?.about?.mission || "To provide the best service.",
        values: data.pages?.about?.values || [
          { title: "Integrity", description: "We value honesty", icon: "✓" },
        ],
        team: data.pages?.about?.team || [
          { name: "Jane Smith", role: "Founder", bio: "Passionate leader" },
        ],
      },
      services: {
        hero: {
          title: data.pages?.services?.hero?.title || "Our Services",
          subtitle: data.pages?.services?.hero?.subtitle || "What we offer",
          image: data.pages?.services?.hero?.image || "services",
        },
        services: data.pages?.services?.services || [
          { title: "Service 1", description: "Great service", features: ["Feature 1"], image: "service" },
        ],
      },
      contact: {
        hero: {
          title: data.pages?.contact?.hero?.title || "Contact Us",
          subtitle: data.pages?.contact?.hero?.subtitle || "Get in touch",
        },
        email: data.pages?.contact?.email || "info@example.com",
        phone: data.pages?.contact?.phone || "+1 (555) 000-0000",
        address: data.pages?.contact?.address || "123 Main St",
        hours: data.pages?.contact?.hours || "Mon-Fri: 9am-5pm",
      },
    },
    seo: data.seo || { title: data.businessName, description: data.description },
  };
}

function getImageUrl(keyword: string): string {
  return `https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=1200&h=800&fit=crop&q=80`;
}

function generateNextJsProject(data: any): Record<string, string> {
  const files: Record<string, string> = {};

  // Main preview HTML with all pages in one file (for iframe preview)
  files["preview.html"] = generateFullWebsiteHTML(data);

  // Next.js project files
  files["package.json"] = generatePackageJson(data);
  files["next.config.ts"] = `export default {};`;
  files["tsconfig.json"] = generateTsConfig();
  files["tailwind.config.ts"] = generateTailwindConfig(data);
  files["postcss.config.mjs"] = `export default { plugins: { '@tailwindcss/postcss': {} } };`;

  // App files
  files["app/layout.tsx"] = generateLayout(data);
  files["app/page.tsx"] = generateHomePage(data);
  files["app/about/page.tsx"] = generateAboutPage(data);
  files["app/services/page.tsx"] = generateServicesPage(data);
  files["app/contact/page.tsx"] = generateContactPage(data);
  files["app/globals.css"] = generateGlobalCSS();

  // Components
  files["components/Navbar.tsx"] = generateNavbar(data);
  files["components/Footer.tsx"] = generateFooter(data);

  files["README.md"] = generateReadme(data);

  return files;
}

function generateFullWebsiteHTML(data: any): string {
  const { businessName, theme, pages } = data;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    nav {
      position: fixed;
      top: 0;
      width: 100%;
      background: white;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
    }

    .nav-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 1rem 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .logo {
      font-size: 1.5rem;
      font-weight: 800;
      color: ${theme.primaryColor};
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
    }

    .nav-links a {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      transition: color 0.3s;
    }

    .nav-links a:hover { color: ${theme.primaryColor}; }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    section {
      padding: 5rem 0;
      scroll-margin-top: 80px;
    }

    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor});
      color: white;
      position: relative;
      padding-top: 80px;
    }

    .hero-content {
      flex: 1;
      z-index: 1;
    }

    .hero h1 {
      font-size: 4rem;
      font-weight: 900;
      margin-bottom: 1.5rem;
      animation: fadeInUp 0.8s ease-out;
    }

    .hero p {
      font-size: 1.5rem;
      margin-bottom: 2rem;
      opacity: 0.95;
      animation: fadeInUp 1s ease-out;
    }

    .hero-image {
      position: absolute;
      right: 0;
      top: 0;
      width: 50%;
      height: 100%;
    }

    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.3;
    }

    .btn {
      display: inline-block;
      padding: 1rem 2.5rem;
      background: white;
      color: ${theme.primaryColor};
      text-decoration: none;
      border-radius: 50px;
      font-weight: 700;
      font-size: 1.1rem;
      transition: all 0.3s;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: fadeInUp 1.2s ease-out;
    }

    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    .section-title {
      font-size: 3rem;
      font-weight: 800;
      text-align: center;
      margin-bottom: 1rem;
      color: #1a1a1a;
    }

    .section-subtitle {
      text-align: center;
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 4rem;
    }

    .grid {
      display: grid;
      gap: 2rem;
    }

    .grid-3 { grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); }
    .grid-2 { grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); }

    .card {
      background: white;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s;
      animation: fadeInUp 0.6s ease-out;
    }

    .card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 10px;
      margin-bottom: 1.5rem;
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: ${theme.primaryColor};
    }

    .testimonial {
      background: #f9fafb;
      padding: 2rem;
      border-radius: 15px;
      border-left: 4px solid ${theme.primaryColor};
    }

    .testimonial-text {
      font-style: italic;
      margin-bottom: 1rem;
      font-size: 1.1rem;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .rating {
      color: #FFC107;
      font-size: 1.2rem;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: ${theme.primaryColor};
    }

    footer {
      background: #1a1a1a;
      color: white;
      padding: 3rem 0 1rem;
      text-align: center;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .hero h1 { font-size: 2.5rem; }
      .hero-image { display: none; }
      .contact-grid { grid-template-columns: 1fr; }
      .grid-2, .grid-3 { grid-template-columns: 1fr; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>
  <nav>
    <div class="nav-container">
      <div class="logo">${businessName}</div>
      <ul class="nav-links">
        <li><a href="#home">Home</a></li>
        <li><a href="#features">Features</a></li>
        <li><a href="#testimonials">Testimonials</a></li>
        <li><a href="#contact">Contact</a></li>
      </ul>
    </div>
  </nav>

  <!-- HOME -->
  <section id="home" class="hero">
    <div class="container">
      <div class="hero-content">
        <h1>${pages.home.hero.title}</h1>
        <p>${pages.home.hero.subtitle}</p>
        <a href="#contact" class="btn">${pages.home.hero.cta}</a>
      </div>
    </div>
    <div class="hero-image">
      <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&h=800" alt="Hero">
    </div>
  </section>

  <!-- FEATURES -->
  <section id="features">
    <div class="container">
      <h2 class="section-title">Our Features</h2>
      <p class="section-subtitle">What makes us special</p>
      <div class="grid grid-3">
        ${(pages.home.features || []).map((feature: any) => `
        <div class="card">
          <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400" alt="${feature.title}">
          <div class="card-icon">${feature.icon}</div>
          <h3>${feature.title}</h3>
          <p>${feature.description}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section id="testimonials" style="background: #f9fafb;">
    <div class="container">
      <h2 class="section-title">Client Testimonials</h2>
      <p class="section-subtitle">What our clients say</p>
      <div class="grid grid-2">
        ${(pages.home.testimonials || []).map((test: any) => `
        <div class="testimonial">
          <div class="rating">${'★'.repeat(test.rating || 5)}</div>
          <p class="testimonial-text">"${test.content}"</p>
          <div class="testimonial-author">
            <div>
              <strong>${test.name}</strong>
              <p style="color: #666; font-size: 0.9rem;">${test.role}</p>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section id="contact">
    <div class="container">
      <h2 class="section-title">${pages.contact.hero.title}</h2>
      <p class="section-subtitle">${pages.contact.hero.subtitle}</p>
      <div class="contact-grid">
        <form>
          <div class="form-group">
            <label>Name</label>
            <input type="text" required>
          </div>
          <div class="form-group">
            <label>Email</label>
            <input type="email" required>
          </div>
          <div class="form-group">
            <label>Message</label>
            <textarea rows="5" required></textarea>
          </div>
          <button type="submit" class="btn" style="width: 100%;">Send Message</button>
        </form>
        <div>
          <h3>Contact Information</h3>
          <p style="margin: 1rem 0;"><strong>Email:</strong> ${pages.contact.email}</p>
          <p style="margin: 1rem 0;"><strong>Phone:</strong> ${pages.contact.phone}</p>
          <p style="margin: 1rem 0;"><strong>Address:</strong> ${pages.contact.address}</p>
          <p style="margin: 1rem 0;"><strong>Hours:</strong> ${pages.contact.hours}</p>
        </div>
      </div>
    </div>
  </section>

  <footer>
    <div class="container">
      <p>&copy; ${new Date().getFullYear()} ${businessName}. All rights reserved.</p>
    </div>
  </footer>
</body>
</html>`;
}

function generatePackageJson(data: any): string {
  return JSON.stringify({
    name: data.businessName.toLowerCase().replace(/\s+/g, '-'),
    version: "1.0.0",
    scripts: {
      dev: "next dev",
      build: "next build",
      start: "next start"
    },
    dependencies: {
      next: "16.0.3",
      react: "^19",
      "react-dom": "^19"
    },
    devDependencies: {
      "@tailwindcss/postcss": "^4",
      "@types/node": "^20",
      "@types/react": "^19",
      tailwindcss: "^4",
      typescript: "^5"
    }
  }, null, 2);
}

function generateTsConfig(): string {
  return JSON.stringify({
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
      paths: { "@/*": ["./*"] }
    },
    include: ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
    exclude: ["node_modules"]
  }, null, 2);
}

function generateTailwindConfig(data: any): string {
  return `import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "${data.theme.primaryColor}",
        secondary: "${data.theme.secondaryColor}",
        accent: "${data.theme.accentColor}",
      },
    },
  },
};
export default config;`;
}

function generateGlobalCSS(): string {
  return `@import "tailwindcss";

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out;
}

html {
  scroll-behavior: smooth;
}`;
}

function generateLayout(data: any): string {
  return `import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "${data.seo.title}",
  description: "${data.seo.description}",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}`;
}

function generateNavbar(data: any): string {
  return `import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="text-2xl font-bold text-primary">
            ${data.businessName}
          </Link>
          <div className="flex gap-8">
            <Link href="/" className="text-gray-700 hover:text-primary transition">Home</Link>
            <Link href="/about" className="text-gray-700 hover:text-primary transition">About</Link>
            <Link href="/services" className="text-gray-700 hover:text-primary transition">Services</Link>
            <Link href="/contact" className="text-gray-700 hover:text-primary transition">Contact</Link>
          </div>
        </div>
      </div>
    </nav>
  );
}`;
}

function generateFooter(data: any): string {
  return `export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-lg font-semibold mb-2">${data.businessName}</p>
        <p className="text-gray-400">&copy; {new Date().getFullYear()} All rights reserved.</p>
      </div>
    </footer>
  );
}`;
}

function generateHomePage(data: any): string {
  const { pages } = data;
  return `export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="min-h-screen flex items-center bg-gradient-to-br from-primary to-secondary text-white pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="animate-fadeInUp">
            <h1 className="text-6xl font-black mb-6">${pages.home.hero.title}</h1>
            <p className="text-2xl mb-8 opacity-95">${pages.home.hero.subtitle}</p>
            <a href="/contact" className="inline-block bg-white text-primary px-8 py-4 rounded-full font-bold text-lg hover:shadow-2xl transition transform hover:-translate-y-1">
              ${pages.home.hero.cta}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-4">Our Features</h2>
          <p className="text-center text-gray-600 mb-12">What makes us special</p>
          <div className="grid md:grid-cols-3 gap-8">
            ${(pages.home.features || []).map((feature: any, i: number) => `
            <div key={${i}} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2 animate-fadeInUp">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400" alt="${feature.title}" className="w-full h-48 object-cover rounded-lg mb-4" />
              <div className="text-5xl mb-4">${feature.icon}</div>
              <h3 className="text-2xl font-bold text-primary mb-3">${feature.title}</h3>
              <p className="text-gray-600">${feature.description}</p>
            </div>
            `).join('')}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Client Testimonials</h2>
          <div className="grid md:grid-cols-2 gap-8">
            ${(pages.home.testimonials || []).map((test: any, i: number) => `
            <div key={${i}} className="bg-white p-8 rounded-2xl shadow-lg">
              <div className="text-yellow-400 text-2xl mb-4">${'★'.repeat(test.rating || 5)}</div>
              <p className="text-lg italic mb-4">"${test.content}"</p>
              <div>
                <p className="font-bold">${test.name}</p>
                <p className="text-gray-600">${test.role}</p>
              </div>
            </div>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

function generateAboutPage(data: any): string {
  const { pages } = data;
  return `export default function About() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-black mb-6 animate-fadeInUp">${pages.about.hero.title}</h1>
          <p className="text-2xl animate-fadeInUp">${pages.about.hero.subtitle}</p>
        </div>
      </section>

      {/* Story */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-8">Our Story</h2>
          <p className="text-lg leading-relaxed text-gray-700">${pages.about.story}</p>
        </div>
      </section>

      {/* Values */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            ${(pages.about.values || []).map((value: any, i: number) => `
            <div key={${i}} className="bg-white p-8 rounded-2xl shadow-lg text-center">
              <div className="text-5xl mb-4">${value.icon}</div>
              <h3 className="text-2xl font-bold mb-3">${value.title}</h3>
              <p className="text-gray-600">${value.description}</p>
            </div>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

function generateServicesPage(data: any): string {
  const { pages } = data;
  return `export default function Services() {
  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-6xl font-black mb-6">${pages.services.hero.title}</h1>
          <p className="text-2xl">${pages.services.hero.subtitle}</p>
        </div>
      </section>

      {/* Services */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            ${(pages.services.services || []).map((service: any, i: number) => `
            <div key={${i}} className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition">
              <img src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500" alt="${service.title}" className="w-full h-64 object-cover rounded-lg mb-6" />
              <h3 className="text-3xl font-bold text-primary mb-4">${service.title}</h3>
              <p className="text-gray-700 mb-4">${service.description}</p>
              ${service.features ? `
              <ul className="space-y-2">
                ${(service.features || []).map((f: string) => `<li className="flex items-center gap-2"><span className="text-green-500">✓</span>${f}</li>`).join('')}
              </ul>
              ` : ''}
              ${service.price ? `<p className="text-2xl font-bold text-primary mt-4">${service.price}</p>` : ''}
            </div>
            `).join('')}
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

function generateContactPage(data: any): string {
  const { pages } = data;
  return `"use client";
import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Message sent!");
  };

  return (
    <div className="min-h-screen pt-16">
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-secondary text-white py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-6xl font-black mb-6">${pages.contact.hero.title}</h1>
          <p className="text-2xl">${pages.contact.hero.subtitle}</p>
        </div>
      </section>

      {/* Contact */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="text-3xl font-bold mb-6">Send us a message</h2>
              <div>
                <label className="block font-semibold mb-2">Name</label>
                <input type="text" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block font-semibold mb-2">Email</label>
                <input type="email" required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary outline-none" />
              </div>
              <div>
                <label className="block font-semibold mb-2">Message</label>
                <textarea rows={5} required className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-primary outline-none resize-none"></textarea>
              </div>
              <button type="submit" className="w-full bg-primary text-white px-8 py-4 rounded-lg font-bold text-lg hover:shadow-2xl transition">
                Send Message
              </button>
            </form>

            <div>
              <h2 className="text-3xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-xl mb-2">Email</h3>
                  <p className="text-gray-700">${pages.contact.email}</p>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Phone</h3>
                  <p className="text-gray-700">${pages.contact.phone}</p>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Address</h3>
                  <p className="text-gray-700">${pages.contact.address}</p>
                </div>
                <div>
                  <h3 className="font-bold text-xl mb-2">Hours</h3>
                  <p className="text-gray-700">${pages.contact.hours}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}`;
}

function generateReadme(data: any): string {
  return `# ${data.businessName}

${data.description}

## Setup

\`\`\`bash
npm install
npm run dev
\`\`\`

Open http://localhost:3000

## Deploy

Deploy to Vercel with one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

## Pages

- Home: /
- About: /about
- Services: /services
- Contact: /contact
`;
}
