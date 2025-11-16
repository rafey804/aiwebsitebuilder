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
          content: `You are an expert web designer and developer. Generate a COMPLETE, DETAILED, PROFESSIONAL multi-page website based on user requirements.

CRITICAL REQUIREMENTS:
1. Generate DETAILED content (not generic - specific to the user's business/topic)
2. Include 4 pages: Home, About, Services, Contact
3. Each page should have 3-5 sections with rich content
4. Use real, specific details based on the prompt
5. Generate appropriate Unsplash image search terms

Return ONLY valid JSON with this EXACT structure:
{
  "businessName": "Extracted business name from prompt",
  "tagline": "Catchy tagline (10-15 words)",
  "description": "Detailed 2-3 sentence description",
  "theme": {
    "primaryColor": "#hexcolor",
    "secondaryColor": "#hexcolor",
    "accentColor": "#hexcolor",
    "style": "modern|minimal|elegant|bold"
  },
  "pages": {
    "home": {
      "hero": {
        "title": "Compelling headline",
        "subtitle": "Detailed subtitle (2 sentences)",
        "cta": "Button text",
        "imageKeyword": "Unsplash search term"
      },
      "sections": [
        {
          "type": "features|stats|benefits|showcase",
          "title": "Section title",
          "subtitle": "Section description",
          "items": [
            {
              "title": "Item title",
              "description": "Detailed description (2-3 sentences)",
              "icon": "emoji",
              "imageKeyword": "Unsplash term"
            }
          ]
        }
      ]
    },
    "about": {
      "hero": {...},
      "sections": [
        {
          "type": "story|team|values|mission",
          "title": "...",
          "content": "Detailed multi-paragraph content",
          "items": [...],
          "imageKeyword": "..."
        }
      ]
    },
    "services": {
      "hero": {...},
      "sections": [
        {
          "type": "services|pricing|process",
          "items": [
            {
              "title": "Service name",
              "description": "Detailed description (3-4 sentences)",
              "features": ["feature1", "feature2", "feature3"],
              "price": "Optional price",
              "imageKeyword": "..."
            }
          ]
        }
      ]
    },
    "contact": {
      "hero": {...},
      "contactInfo": {
        "email": "suggested@email.com",
        "phone": "+1 (555) 123-4567",
        "address": "123 Street, City, Country",
        "social": {
          "twitter": "username",
          "linkedin": "username",
          "instagram": "username"
        }
      },
      "locations": [
        {
          "city": "City Name",
          "address": "Full address",
          "phone": "Phone"
        }
      ]
    }
  },
  "navigation": ["Home", "About", "Services", "Contact"],
  "footer": {
    "description": "Footer about text",
    "links": [
      {"title": "Link text", "url": "#"}
    ]
  },
  "seo": {
    "title": "SEO title (50-60 chars)",
    "description": "Meta description (150-160 chars)",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  }
}

IMPORTANT:
- Make content SPECIFIC to the user's industry/topic
- Include REAL details, not placeholders
- Each section should have MEANINGFUL content
- Use appropriate emojis as icons
- Generate diverse, relevant Unsplash keywords`,
        },
        {
          role: "user",
          content: `Create a COMPLETE professional multi-page website for: ${prompt}

Generate:
1. HOME PAGE: Hero, Features/Benefits (4 items), Stats/Highlights, Testimonials, CTA
2. ABOUT PAGE: Company Story, Mission/Vision, Team/Values (3-4 items), Why Choose Us
3. SERVICES PAGE: Service List (4-6 services with details), Process/How It Works, Pricing (optional)
4. CONTACT PAGE: Contact Form, Multiple Contact Methods, Location(s), Map Section

Make it:
- Industry-specific with real details
- Professional and comprehensive
- Rich with content
- Visually appealing with appropriate images`,
        },
      ],
      model: MODELS.LLAMA_70B,
      temperature: 0.7,
      max_tokens: 16000,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    const websiteData = JSON.parse(aiResponse);

    // Generate multi-page HTML files
    const files = generateMultiPageWebsite(websiteData);

    return NextResponse.json({
      success: true,
      data: {
        content: websiteData,
        seo: websiteData.seo,
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

function generateMultiPageWebsite(data: any): Record<string, string> {
  const files: Record<string, string> = {};
  const { businessName, theme, pages, navigation, footer } = data;

  // Generate base CSS
  const baseCSS = generateBaseCSS(theme);

  // Generate each page
  files["preview.html"] = generateHomePage(data, baseCSS);
  files["about.html"] = generateAboutPage(data, baseCSS);
  files["services.html"] = generateServicesPage(data, baseCSS);
  files["contact.html"] = generateContactPage(data, baseCSS);

  // Generate package.json
  files["package.json"] = JSON.stringify(
    {
      name: businessName.toLowerCase().replace(/\s+/g, "-"),
      version: "1.0.0",
      scripts: {
        dev: "next dev",
        build: "next build",
        start: "next start",
      },
      dependencies: {
        next: "16.0.3",
        react: "^19",
        "react-dom": "^19",
      },
    },
    null,
    2
  );

  files["README.md"] = `# ${businessName}\n\n${data.description}\n\n## Pages\n- Home\n- About\n- Services\n- Contact\n\n## Setup\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``;

  return files;
}

function generateBaseCSS(theme: any): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --primary: ${theme.primaryColor};
      --secondary: ${theme.secondaryColor};
      --accent: ${theme.accentColor};
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      overflow-x: hidden;
    }

    html {
      scroll-behavior: smooth;
    }

    /* Navigation */
    nav {
      position: fixed;
      top: 0;
      width: 100%;
      background: rgba(255, 255, 255, 0.95);
      backdrop-filter: blur(10px);
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      z-index: 1000;
      padding: 0;
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
      color: var(--primary);
      text-decoration: none;
    }

    .nav-links {
      display: flex;
      gap: 2rem;
      list-style: none;
      align-items: center;
    }

    .nav-links a {
      text-decoration: none;
      color: #333;
      font-weight: 500;
      transition: color 0.3s;
    }

    .nav-links a:hover {
      color: var(--primary);
    }

    .mobile-menu {
      display: none;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
    }

    .mobile-menu span {
      width: 25px;
      height: 3px;
      background: var(--primary);
      border-radius: 3px;
    }

    /* Container */
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
    }

    /* Sections */
    section {
      padding: 5rem 0;
    }

    .hero {
      min-height: 100vh;
      display: flex;
      align-items: center;
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      position: relative;
      overflow: hidden;
      padding-top: 80px;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40" fill="rgba(255,255,255,0.1)"/></svg>');
      opacity: 0.3;
    }

    .hero-content {
      position: relative;
      z-index: 1;
      max-width: 800px;
    }

    .hero h1 {
      font-size: clamp(2.5rem, 5vw, 4rem);
      font-weight: 900;
      margin-bottom: 1.5rem;
      line-height: 1.2;
    }

    .hero p {
      font-size: clamp(1.1rem, 2vw, 1.5rem);
      margin-bottom: 2rem;
      opacity: 0.95;
    }

    .hero-image {
      position: absolute;
      right: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 45%;
      height: 70%;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }

    .hero-image img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .btn {
      display: inline-block;
      padding: 1rem 2.5rem;
      background: white;
      color: var(--primary);
      text-decoration: none;
      border-radius: 50px;
      font-weight: 700;
      font-size: 1.1rem;
      transition: all 0.3s;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
    }

    .btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.3);
    }

    .btn-outline {
      background: transparent;
      color: white;
      border: 2px solid white;
    }

    .btn-outline:hover {
      background: white;
      color: var(--primary);
    }

    /* Section Headers */
    .section-header {
      text-align: center;
      margin-bottom: 4rem;
    }

    .section-header h2 {
      font-size: clamp(2rem, 4vw, 3rem);
      font-weight: 800;
      color: #1a1a1a;
      margin-bottom: 1rem;
    }

    .section-header p {
      font-size: 1.2rem;
      color: #666;
      max-width: 600px;
      margin: 0 auto;
    }

    /* Grid Layouts */
    .grid {
      display: grid;
      gap: 2rem;
    }

    .grid-2 {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    }

    .grid-3 {
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    }

    .grid-4 {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    }

    /* Cards */
    .card {
      background: white;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      transition: all 0.3s;
      height: 100%;
    }

    .card:hover {
      transform: translateY(-10px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }

    .card-icon {
      font-size: 3rem;
      margin-bottom: 1.5rem;
    }

    .card h3 {
      font-size: 1.5rem;
      margin-bottom: 1rem;
      color: var(--primary);
    }

    .card p {
      color: #666;
      line-height: 1.8;
    }

    .card img {
      width: 100%;
      height: 200px;
      object-fit: cover;
      border-radius: 10px;
      margin-bottom: 1.5rem;
    }

    /* Image Sections */
    .image-text-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 4rem;
      align-items: center;
      margin: 4rem 0;
    }

    .image-text-section img {
      width: 100%;
      border-radius: 20px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    }

    /* Stats */
    .stats {
      background: linear-gradient(135deg, var(--primary), var(--secondary));
      color: white;
      text-align: center;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 3rem;
    }

    .stat-item h3 {
      font-size: 3rem;
      font-weight: 900;
      margin-bottom: 0.5rem;
    }

    .stat-item p {
      font-size: 1.2rem;
      opacity: 0.9;
    }

    /* Testimonials */
    .testimonial-card {
      background: white;
      padding: 2.5rem;
      border-radius: 20px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .testimonial-text {
      font-size: 1.1rem;
      font-style: italic;
      color: #555;
      margin-bottom: 2rem;
      line-height: 1.8;
    }

    .testimonial-author {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .testimonial-author img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      object-fit: cover;
    }

    .author-info h4 {
      color: var(--primary);
      margin-bottom: 0.25rem;
    }

    .author-info p {
      color: #888;
      font-size: 0.9rem;
    }

    /* Contact Form */
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
      color: #333;
    }

    .form-group input,
    .form-group textarea {
      width: 100%;
      padding: 1rem;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
      transition: border-color 0.3s;
      font-family: inherit;
    }

    .form-group input:focus,
    .form-group textarea:focus {
      outline: none;
      border-color: var(--primary);
    }

    .contact-info-item {
      display: flex;
      align-items: start;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .contact-info-item .icon {
      font-size: 1.5rem;
      color: var(--primary);
    }

    /* Footer */
    footer {
      background: #1a1a1a;
      color: white;
      padding: 4rem 0 2rem;
    }

    .footer-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
      margin-bottom: 3rem;
    }

    .footer-about p {
      color: #999;
      margin: 1rem 0;
    }

    .footer-links h4 {
      margin-bottom: 1.5rem;
      color: white;
    }

    .footer-links ul {
      list-style: none;
    }

    .footer-links a {
      color: #999;
      text-decoration: none;
      display: block;
      margin-bottom: 0.75rem;
      transition: color 0.3s;
    }

    .footer-links a:hover {
      color: var(--primary);
    }

    .footer-bottom {
      border-top: 1px solid #333;
      padding-top: 2rem;
      text-align: center;
      color: #666;
    }

    /* Responsive */
    @media (max-width: 968px) {
      .nav-links {
        display: none;
      }

      .mobile-menu {
        display: flex;
      }

      .hero {
        min-height: auto;
        padding: 6rem 0;
      }

      .hero-image {
        position: relative;
        width: 100%;
        height: 300px;
        margin-top: 3rem;
        transform: none;
      }

      .image-text-section {
        grid-template-columns: 1fr;
      }

      .contact-grid {
        grid-template-columns: 1fr;
      }

      .footer-grid {
        grid-template-columns: 1fr;
      }

      section {
        padding: 3rem 0;
      }

      .container {
        padding: 0 1rem;
      }
    }

    @media (max-width: 640px) {
      .grid-2,
      .grid-3,
      .grid-4 {
        grid-template-columns: 1fr;
      }

      .hero h1 {
        font-size: 2rem;
      }

      .section-header h2 {
        font-size: 1.75rem;
      }
    }

    /* Animations */
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

    .fade-in {
      animation: fadeInUp 0.6s ease-out;
    }
  `;
}

function generateNavigation(data: any, currentPage: string): string {
  return `
  <nav>
    <div class="nav-container">
      <a href="preview.html" class="logo">${data.businessName}</a>
      <ul class="nav-links">
        ${data.navigation.map((item: string) => {
          const page = item.toLowerCase();
          const href = page === 'home' ? 'preview.html' : `${page}.html`;
          return `<li><a href="${href}" ${currentPage === page ? 'style="color: var(--primary)"' : ''}>${item}</a></li>`;
        }).join('')}
        <li><a href="#contact" class="btn" style="padding: 0.75rem 1.5rem; font-size: 0.95rem;">Get Started</a></li>
      </ul>
      <div class="mobile-menu">
        <span></span>
        <span></span>
        <span></span>
      </div>
    </div>
  </nav>
  `;
}

function generateFooter(data: any): string {
  return `
  <footer>
    <div class="container">
      <div class="footer-grid">
        <div class="footer-about">
          <h3 class="logo">${data.businessName}</h3>
          <p>${data.footer.description || data.description}</p>
        </div>
        <div class="footer-links">
          <h4>Quick Links</h4>
          <ul>
            ${data.navigation.map((item: string) => {
              const page = item.toLowerCase();
              const href = page === 'home' ? 'preview.html' : `${page}.html`;
              return `<li><a href="${href}">${item}</a></li>`;
            }).join('')}
          </ul>
        </div>
        <div class="footer-links">
          <h4>Services</h4>
          <ul>
            ${(data.pages.services?.sections[0]?.items || []).slice(0, 4).map((item: any) =>
              `<li><a href="services.html">${item.title}</a></li>`
            ).join('')}
          </ul>
        </div>
        <div class="footer-links">
          <h4>Contact</h4>
          <ul>
            <li><a href="mailto:${data.pages.contact.contactInfo.email}">${data.pages.contact.contactInfo.email}</a></li>
            <li><a href="tel:${data.pages.contact.contactInfo.phone}">${data.pages.contact.contactInfo.phone}</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; ${new Date().getFullYear()} ${data.businessName}. All rights reserved.</p>
      </div>
    </div>
  </footer>
  `;
}

function getUnsplashUrl(keyword: string, width = 800, height = 600): string {
  return `https://source.unsplash.com/${width}x${height}/?${encodeURIComponent(keyword)}`;
}

function generateHomePage(data: any, css: string): string {
  const { businessName, pages } = data;
  const home = pages.home;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} - Home</title>
  <meta name="description" content="${data.seo.description}">
  <style>${css}</style>
</head>
<body>
  ${generateNavigation(data, 'home')}

  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <div class="hero-content fade-in">
        <h1>${home.hero.title}</h1>
        <p>${home.hero.subtitle}</p>
        <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
          <a href="#features" class="btn">${home.hero.cta}</a>
          <a href="about.html" class="btn btn-outline">Learn More</a>
        </div>
      </div>
      <div class="hero-image">
        <img src="${getUnsplashUrl(home.hero.imageKeyword, 1200, 800)}" alt="${businessName}" loading="lazy">
      </div>
    </div>
  </section>

  ${home.sections.map((section: any, index: number) => {
    if (section.type === 'features' || section.type === 'benefits') {
      return `
  <!-- Features Section -->
  <section id="features" style="background: ${index % 2 === 0 ? '#f9fafb' : 'white'};">
    <div class="container">
      <div class="section-header fade-in">
        <h2>${section.title}</h2>
        <p>${section.subtitle || ''}</p>
      </div>
      <div class="grid grid-3">
        ${section.items.map((item: any) => `
        <div class="card fade-in">
          ${item.imageKeyword ? `<img src="${getUnsplashUrl(item.imageKeyword, 600, 400)}" alt="${item.title}" loading="lazy">` : ''}
          <div class="card-icon">${item.icon || '✨'}</div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
      `;
    } else if (section.type === 'stats') {
      return `
  <!-- Stats Section -->
  <section class="stats">
    <div class="container">
      <div class="stats-grid">
        ${section.items.map((item: any) => `
        <div class="stat-item fade-in">
          <h3>${item.value}</h3>
          <p>${item.label}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
      `;
    } else if (section.type === 'testimonials') {
      return `
  <!-- Testimonials Section -->
  <section style="background: #f9fafb;">
    <div class="container">
      <div class="section-header">
        <h2>${section.title}</h2>
        <p>${section.subtitle || ''}</p>
      </div>
      <div class="grid grid-2">
        ${section.items.map((item: any) => `
        <div class="testimonial-card fade-in">
          <p class="testimonial-text">"${item.content}"</p>
          <div class="testimonial-author">
            <img src="${getUnsplashUrl('portrait person', 120, 120)}" alt="${item.name}" loading="lazy">
            <div class="author-info">
              <h4>${item.name}</h4>
              <p>${item.role}</p>
            </div>
          </div>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
      `;
    }
    return '';
  }).join('')}

  <!-- CTA Section -->
  <section class="hero" style="min-height: auto; padding: 5rem 0;">
    <div class="container" style="text-align: center;">
      <h2 style="font-size: 2.5rem; margin-bottom: 1rem;">Ready to Get Started?</h2>
      <p style="font-size: 1.2rem; margin-bottom: 2rem; opacity: 0.9;">Join thousands of satisfied customers today</p>
      <a href="contact.html" class="btn">Contact Us Now</a>
    </div>
  </section>

  ${generateFooter(data)}
</body>
</html>`;
}

function generateAboutPage(data: any, css: string): string {
  const { businessName, pages } = data;
  const about = pages.about;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} - About Us</title>
  <style>${css}</style>
</head>
<body>
  ${generateNavigation(data, 'about')}

  <!-- Hero Section -->
  <section class="hero" style="min-height: 60vh;">
    <div class="container">
      <div class="hero-content">
        <h1>${about.hero.title}</h1>
        <p>${about.hero.subtitle}</p>
      </div>
    </div>
  </section>

  ${about.sections.map((section: any, index: number) => {
    if (section.type === 'story' || section.type === 'mission') {
      return `
  <!-- ${section.title} Section -->
  <section style="background: ${index % 2 === 0 ? 'white' : '#f9fafb'};">
    <div class="container">
      <div class="image-text-section" style="${index % 2 === 1 ? 'direction: rtl;' : ''}">
        <div style="direction: ltr;">
          <h2 style="font-size: 2.5rem; margin-bottom: 1.5rem; color: var(--primary);">${section.title}</h2>
          <p style="font-size: 1.1rem; line-height: 1.8; color: #555;">${section.content}</p>
        </div>
        <img src="${getUnsplashUrl(section.imageKeyword || 'office team', 800, 600)}" alt="${section.title}" loading="lazy">
      </div>
    </div>
  </section>
      `;
    } else if (section.type === 'values' || section.type === 'team') {
      return `
  <!-- ${section.title} Section -->
  <section style="background: ${index % 2 === 0 ? 'white' : '#f9fafb'};">
    <div class="container">
      <div class="section-header">
        <h2>${section.title}</h2>
        <p>${section.subtitle || ''}</p>
      </div>
      <div class="grid grid-3">
        ${section.items.map((item: any) => `
        <div class="card">
          ${item.imageKeyword ? `<img src="${getUnsplashUrl(item.imageKeyword, 600, 400)}" alt="${item.title}" loading="lazy">` : ''}
          <div class="card-icon">${item.icon || '⭐'}</div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
      `;
    }
    return '';
  }).join('')}

  ${generateFooter(data)}
</body>
</html>`;
}

function generateServicesPage(data: any, css: string): string {
  const { businessName, pages } = data;
  const services = pages.services;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} - Services</title>
  <style>${css}</style>
</head>
<body>
  ${generateNavigation(data, 'services')}

  <!-- Hero Section -->
  <section class="hero" style="min-height: 60vh;">
    <div class="container">
      <div class="hero-content">
        <h1>${services.hero.title}</h1>
        <p>${services.hero.subtitle}</p>
      </div>
    </div>
  </section>

  ${services.sections.map((section: any, index: number) => {
    if (section.type === 'services') {
      return `
  <!-- Services Grid -->
  <section style="background: ${index % 2 === 0 ? '#f9fafb' : 'white'};">
    <div class="container">
      <div class="section-header">
        <h2>${section.title || 'Our Services'}</h2>
        <p>${section.subtitle || ''}</p>
      </div>
      <div class="grid grid-2">
        ${section.items.map((item: any) => `
        <div class="card">
          ${item.imageKeyword ? `<img src="${getUnsplashUrl(item.imageKeyword, 800, 500)}" alt="${item.title}" loading="lazy">` : ''}
          <h3>${item.title}</h3>
          <p style="margin-bottom: 1.5rem;">${item.description}</p>
          ${item.features ? `
          <ul style="list-style: none; padding: 0;">
            ${item.features.map((feature: string) => `
            <li style="padding: 0.5rem 0; color: #666;">✓ ${feature}</li>
            `).join('')}
          </ul>
          ` : ''}
          ${item.price ? `<p style="font-size: 1.5rem; font-weight: 700; color: var(--primary); margin-top: 1rem;">${item.price}</p>` : ''}
        </div>
        `).join('')}
      </div>
    </div>
  </section>
      `;
    } else if (section.type === 'process') {
      return `
  <!-- Process Section -->
  <section style="background: var(--primary); color: white;">
    <div class="container">
      <div class="section-header" style="color: white;">
        <h2 style="color: white;">${section.title}</h2>
        <p style="color: rgba(255,255,255,0.9);">${section.subtitle || ''}</p>
      </div>
      <div class="grid grid-4">
        ${section.items.map((item: any, idx: number) => `
        <div style="text-align: center;">
          <div style="width: 60px; height: 60px; background: white; color: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; font-weight: 800; margin: 0 auto 1.5rem;">${idx + 1}</div>
          <h3 style="margin-bottom: 1rem;">${item.title}</h3>
          <p style="opacity: 0.9;">${item.description}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
      `;
    }
    return '';
  }).join('')}

  ${generateFooter(data)}
</body>
</html>`;
}

function generateContactPage(data: any, css: string): string {
  const { businessName, pages } = data;
  const contact = pages.contact;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName} - Contact Us</title>
  <style>${css}</style>
</head>
<body>
  ${generateNavigation(data, 'contact')}

  <!-- Hero Section -->
  <section class="hero" style="min-height: 50vh;">
    <div class="container">
      <div class="hero-content" style="text-align: center; max-width: 100%;">
        <h1>${contact.hero.title}</h1>
        <p>${contact.hero.subtitle}</p>
      </div>
    </div>
  </section>

  <!-- Contact Section -->
  <section>
    <div class="container">
      <div class="contact-grid">
        <!-- Contact Form -->
        <div>
          <h2 style="margin-bottom: 2rem; color: var(--primary);">Send us a message</h2>
          <form>
            <div class="form-group">
              <label>Your Name</label>
              <input type="text" placeholder="John Doe" required>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" placeholder="john@example.com" required>
            </div>
            <div class="form-group">
              <label>Phone Number</label>
              <input type="tel" placeholder="+1 (555) 123-4567">
            </div>
            <div class="form-group">
              <label>Message</label>
              <textarea rows="6" placeholder="Tell us about your project..." required></textarea>
            </div>
            <button type="submit" class="btn" style="width: 100%;">Send Message</button>
          </form>
        </div>

        <!-- Contact Info -->
        <div>
          <h2 style="margin-bottom: 2rem; color: var(--primary);">Get in touch</h2>

          <div class="contact-info-item">
            <div class="icon">📧</div>
            <div>
              <h4 style="margin-bottom: 0.5rem;">Email</h4>
              <p style="color: #666;">${contact.contactInfo.email}</p>
            </div>
          </div>

          <div class="contact-info-item">
            <div class="icon">📱</div>
            <div>
              <h4 style="margin-bottom: 0.5rem;">Phone</h4>
              <p style="color: #666;">${contact.contactInfo.phone}</p>
            </div>
          </div>

          <div class="contact-info-item">
            <div class="icon">📍</div>
            <div>
              <h4 style="margin-bottom: 0.5rem;">Address</h4>
              <p style="color: #666;">${contact.contactInfo.address}</p>
            </div>
          </div>

          ${contact.contactInfo.social ? `
          <div style="margin-top: 3rem;">
            <h4 style="margin-bottom: 1rem;">Follow Us</h4>
            <div style="display: flex; gap: 1rem;">
              ${contact.contactInfo.social.twitter ? `<a href="https://twitter.com/${contact.contactInfo.social.twitter}" style="width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;">𝕏</a>` : ''}
              ${contact.contactInfo.social.linkedin ? `<a href="https://linkedin.com/company/${contact.contactInfo.social.linkedin}" style="width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;">in</a>` : ''}
              ${contact.contactInfo.social.instagram ? `<a href="https://instagram.com/${contact.contactInfo.social.instagram}" style="width: 40px; height: 40px; background: var(--primary); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none;">📷</a>` : ''}
            </div>
          </div>
          ` : ''}
        </div>
      </div>
    </div>
  </section>

  ${contact.locations && contact.locations.length > 0 ? `
  <!-- Locations Section -->
  <section style="background: #f9fafb;">
    <div class="container">
      <div class="section-header">
        <h2>Our Locations</h2>
      </div>
      <div class="grid grid-3">
        ${contact.locations.map((location: any) => `
        <div class="card">
          <h3 style="color: var(--primary); margin-bottom: 1rem;">${location.city}</h3>
          <p style="color: #666; margin-bottom: 0.5rem;">${location.address}</p>
          <p style="color: var(--primary); font-weight: 600;">${location.phone}</p>
        </div>
        `).join('')}
      </div>
    </div>
  </section>
  ` : ''}

  ${generateFooter(data)}
</body>
</html>`;
}
