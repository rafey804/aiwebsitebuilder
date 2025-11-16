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

    // Generate website using AI
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are an expert web designer and developer. Generate a complete, beautiful, professional website based on user requirements.

IMPORTANT: Return ONLY valid JSON with this exact structure:
{
  "businessName": "Extracted business name",
  "tagline": "Short catchy tagline",
  "description": "Brief description",
  "theme": {
    "primaryColor": "#hexcolor",
    "secondaryColor": "#hexcolor",
    "accentColor": "#hexcolor"
  },
  "sections": [
    {
      "type": "hero|features|about|testimonials|contact|cta",
      "title": "Section title",
      "subtitle": "Section subtitle",
      "content": "Main content",
      "items": [...] // for features, testimonials, etc.
    }
  ],
  "seo": {
    "title": "SEO title",
    "description": "Meta description"
  }
}

Generate 5-7 diverse sections with professional content. Use Unsplash image URLs for visuals.`,
        },
        {
          role: "user",
          content: `Create a complete professional website for: ${prompt}

Include:
- Hero section with compelling headline
- About/Features section (3-4 items with icons)
- Testimonials (2-3)
- Call-to-action section
- Contact section

Make it visually stunning with modern design trends.`,
        },
      ],
      model: MODELS.LLAMA_70B,
      temperature: 0.8,
      max_tokens: 8000,
      response_format: { type: "json_object" },
    });

    const aiResponse = completion.choices[0]?.message?.content;
    if (!aiResponse) {
      throw new Error("No response from AI");
    }

    const websiteData = JSON.parse(aiResponse);

    // Generate HTML preview
    const previewHTML = generatePreviewHTML(websiteData);

    // Generate Next.js files
    const files = generateNextJsFiles(websiteData);
    files["preview.html"] = previewHTML;

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

function generatePreviewHTML(data: any): string {
  const { businessName, tagline, theme, sections } = data;

  const sectionsHTML = sections
    .map((section: any) => {
      switch (section.type) {
        case "hero":
          return `
<section class="hero">
  <div class="container">
    <h1 class="hero-title">${section.title}</h1>
    <p class="hero-subtitle">${section.subtitle || tagline}</p>
    <button class="cta-button">Get Started</button>
  </div>
</section>`;

        case "features":
          return `
<section class="features">
  <div class="container">
    <h2 class="section-title">${section.title}</h2>
    <p class="section-subtitle">${section.subtitle || ""}</p>
    <div class="features-grid">
      ${(section.items || [])
        .map(
          (item: any) => `
        <div class="feature-card">
          <div class="feature-icon">${item.icon || "✨"}</div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
</section>`;

        case "about":
          return `
<section class="about">
  <div class="container">
    <div class="about-content">
      <div class="about-text">
        <h2 class="section-title">${section.title}</h2>
        <p>${section.content}</p>
      </div>
      <div class="about-image">
        <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop" alt="About" />
      </div>
    </div>
  </div>
</section>`;

        case "testimonials":
          return `
<section class="testimonials">
  <div class="container">
    <h2 class="section-title">${section.title}</h2>
    <div class="testimonials-grid">
      ${(section.items || [])
        .map(
          (item: any) => `
        <div class="testimonial-card">
          <p class="testimonial-text">"${item.content}"</p>
          <div class="testimonial-author">
            <strong>${item.name}</strong>
            <span>${item.role}</span>
          </div>
        </div>
      `
        )
        .join("")}
    </div>
  </div>
</section>`;

        case "cta":
          return `
<section class="cta">
  <div class="container">
    <h2>${section.title}</h2>
    <p>${section.subtitle || ""}</p>
    <button class="cta-button">${section.buttonText || "Get Started"}</button>
  </div>
</section>`;

        case "contact":
          return `
<section class="contact">
  <div class="container">
    <h2 class="section-title">${section.title}</h2>
    <div class="contact-grid">
      <div class="contact-form">
        <input type="text" placeholder="Your Name" />
        <input type="email" placeholder="Your Email" />
        <textarea placeholder="Your Message" rows="5"></textarea>
        <button class="cta-button">Send Message</button>
      </div>
      <div class="contact-info">
        ${(section.items || [])
          .map(
            (item: any) => `
          <div class="contact-item">
            <strong>${item.label}</strong>
            <p>${item.value}</p>
          </div>
        `
          )
          .join("")}
      </div>
    </div>
  </div>
</section>`;

        default:
          return "";
      }
    })
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${businessName}</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 20px;
    }

    section {
      padding: 80px 0;
    }

    .hero {
      background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor});
      color: white;
      text-align: center;
      padding: 120px 0;
    }

    .hero-title {
      font-size: 3.5rem;
      font-weight: 800;
      margin-bottom: 20px;
    }

    .hero-subtitle {
      font-size: 1.5rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }

    .cta-button {
      background: white;
      color: ${theme.primaryColor};
      padding: 15px 40px;
      border: none;
      border-radius: 50px;
      font-size: 1.1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s;
    }

    .cta-button:hover {
      transform: translateY(-2px);
    }

    .section-title {
      font-size: 2.5rem;
      font-weight: 700;
      text-align: center;
      margin-bottom: 15px;
      color: #1a1a1a;
    }

    .section-subtitle {
      text-align: center;
      font-size: 1.2rem;
      color: #666;
      margin-bottom: 50px;
    }

    .features {
      background: #f9fafb;
    }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 50px;
    }

    .feature-card {
      background: white;
      padding: 40px;
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
      text-align: center;
      transition: transform 0.3s;
    }

    .feature-card:hover {
      transform: translateY(-5px);
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 20px;
    }

    .feature-card h3 {
      font-size: 1.5rem;
      margin-bottom: 15px;
      color: ${theme.primaryColor};
    }

    .about {
      background: white;
    }

    .about-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      align-items: center;
    }

    .about-text p {
      font-size: 1.1rem;
      line-height: 1.8;
      color: #555;
      margin-top: 20px;
    }

    .about-image img {
      width: 100%;
      border-radius: 15px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    .testimonials {
      background: linear-gradient(135deg, ${theme.primaryColor}15, ${theme.secondaryColor}15);
    }

    .testimonials-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 30px;
      margin-top: 50px;
    }

    .testimonial-card {
      background: white;
      padding: 30px;
      border-radius: 15px;
      box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }

    .testimonial-text {
      font-size: 1.1rem;
      font-style: italic;
      margin-bottom: 20px;
      color: #555;
    }

    .testimonial-author {
      display: flex;
      flex-direction: column;
    }

    .testimonial-author strong {
      color: ${theme.primaryColor};
      font-size: 1.1rem;
    }

    .testimonial-author span {
      color: #888;
      font-size: 0.9rem;
    }

    .cta {
      background: linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor});
      color: white;
      text-align: center;
    }

    .cta h2 {
      font-size: 2.5rem;
      margin-bottom: 15px;
    }

    .cta p {
      font-size: 1.2rem;
      margin-bottom: 30px;
      opacity: 0.9;
    }

    .contact {
      background: white;
    }

    .contact-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 60px;
      margin-top: 50px;
    }

    .contact-form input,
    .contact-form textarea {
      width: 100%;
      padding: 15px;
      margin-bottom: 20px;
      border: 2px solid #e5e7eb;
      border-radius: 10px;
      font-size: 1rem;
    }

    .contact-form input:focus,
    .contact-form textarea:focus {
      outline: none;
      border-color: ${theme.primaryColor};
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 25px;
    }

    .contact-item strong {
      display: block;
      color: ${theme.primaryColor};
      font-size: 1.1rem;
      margin-bottom: 5px;
    }

    .contact-item p {
      color: #666;
    }

    @media (max-width: 768px) {
      .hero-title {
        font-size: 2.5rem;
      }

      .about-content,
      .contact-grid {
        grid-template-columns: 1fr;
      }

      .section-title {
        font-size: 2rem;
      }
    }
  </style>
</head>
<body>
  ${sectionsHTML}
</body>
</html>`;
}

function generateNextJsFiles(data: any): Record<string, string> {
  const files: Record<string, string> = {};

  // package.json
  files["package.json"] = JSON.stringify(
    {
      name: data.businessName.toLowerCase().replace(/\s+/g, "-"),
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
      devDependencies: {
        "@types/node": "^20",
        "@types/react": "^19",
        "@tailwindcss/postcss": "^4",
        tailwindcss: "^4",
        typescript: "^5",
      },
    },
    null,
    2
  );

  // Add other necessary files
  files["README.md"] = `# ${data.businessName}\n\n${data.description}\n\n## Getting Started\n\n\`\`\`bash\nnpm install\nnpm run dev\n\`\`\``;

  return files;
}
