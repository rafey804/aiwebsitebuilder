export interface WebsiteInput {
  businessName: string;
  businessDescription: string;
  targetAudience?: string;
  location?: string;
  services: string;
  primaryColor?: string;
  secondaryColor?: string;
  themeStyle: "modern" | "minimal" | "corporate" | "bold";
  includeLogo?: boolean;
  logoPrompt?: string;
}

export interface GeneratedWebsite {
  content: {
    hero: {
      heading: string;
      subheading: string;
      ctaText: string;
    };
    about: {
      title: string;
      description: string;
    };
    services: Array<{
      title: string;
      description: string;
      icon: string;
    }>;
    testimonials?: Array<{
      name: string;
      role: string;
      content: string;
    }>;
    faq?: Array<{
      question: string;
      answer: string;
    }>;
    contact: {
      email?: string;
      phone?: string;
      address?: string;
    };
  };
  design: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    font: {
      heading: string;
      body: string;
    };
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  code: {
    files: Record<string, string>;
  };
}

export interface AIGenerationResult {
  success: boolean;
  data?: GeneratedWebsite;
  error?: string;
}
