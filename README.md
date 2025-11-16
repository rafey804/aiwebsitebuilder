# 🚀 AI Website Builder

An automated platform that generates complete, production-ready Next.js websites using AI. Simply provide your business details, and let AI create a professional website for you in minutes.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8)
![Groq AI](https://img.shields.io/badge/Groq-AI-orange)

## ✨ Features

- 🤖 **AI-Powered Generation** - Uses Groq AI (LLaMA-3 70B) to generate professional website content
- 🎨 **Customizable Design** - Choose theme styles and colors that match your brand
- 📦 **Complete Next.js Project** - Downloads as a ready-to-deploy ZIP file
- 🔍 **SEO Optimized** - Automatically generates SEO-friendly titles, descriptions, and keywords
- 📱 **Responsive Design** - Mobile-first, fully responsive layouts
- ⚡ **Fast Generation** - Complete websites in 15-30 seconds
- 🛠️ **Production Ready** - Includes all necessary configuration files

## 🎯 What Gets Generated

The AI creates a complete Next.js website with:

- **Content**
  - Hero section with compelling headlines
  - About section
  - Services/Products showcase
  - Testimonials
  - FAQ section
  - Contact information

- **Design**
  - Custom color palette
  - Professional typography
  - Modern UI components
  - Tailwind CSS styling

- **Technical**
  - Complete Next.js 16 project structure
  - TypeScript configuration
  - Tailwind CSS setup
  - SEO metadata
  - Responsive components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- Groq API key ([Get one free here](https://console.groq.com/keys))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd aiwebsitebuilder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env.local` file in the root directory:
   ```env
   GROQ_API_KEY=your_groq_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**

   Visit [http://localhost:3000](http://localhost:3000)

## 📝 How to Use

1. **Fill in your business details:**
   - Business name
   - Description
   - Services/Products
   - Target audience (optional)
   - Location (optional)

2. **Customize the design:**
   - Choose a theme style (Modern, Minimal, Corporate, Bold)
   - Pick your brand colors

3. **Generate & Download:**
   - Click "Generate Website"
   - Wait 15-30 seconds
   - Download the ZIP file

4. **Deploy your website:**
   - Extract the ZIP file
   - Run `npm install`
   - Run `npm run dev`
   - Deploy to Vercel, Netlify, or any hosting platform

## 🛠️ Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS 4
- **AI Engine:** Groq AI (LLaMA-3 70B)
- **Form Handling:** React Hook Form + Zod
- **Icons:** Lucide React
- **File Generation:** JSZip

## 📁 Project Structure

```
aiwebsitebuilder/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # AI generation API endpoint
│   ├── layout.tsx                # Root layout with metadata
│   ├── page.tsx                  # Main builder interface
│   └── globals.css               # Global styles
├── components/                   # Reusable components
├── lib/
│   ├── groq.ts                  # Groq AI client
│   └── utils.ts                 # Utility functions
├── types/
│   └── index.ts                 # TypeScript types
├── .env.local                   # Environment variables
└── package.json                 # Dependencies
```

## 🎨 Generated Website Structure

Each generated website includes:

```
generated-website/
├── app/
│   ├── layout.tsx              # SEO-optimized layout
│   ├── page.tsx                # Complete homepage
│   └── globals.css             # Custom theme styles
├── package.json                # Next.js dependencies
├── tailwind.config.ts          # Tailwind configuration
├── tsconfig.json               # TypeScript config
├── next.config.ts              # Next.js config
├── postcss.config.mjs          # PostCSS config
└── README.md                   # Setup instructions
```

## 🔑 Getting a Groq API Key

1. Visit [Groq Console](https://console.groq.com)
2. Sign up for a free account
3. Navigate to API Keys section
4. Create a new API key
5. Copy and paste it into your `.env.local` file

**Note:** Groq offers generous free tier limits perfect for this project.

## 🌐 Deployment

### Deploy to Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or use the [Vercel Deploy Button](https://vercel.com/new)

### Deploy to Netlify

```bash
npm run build
# Upload .next folder to Netlify
```

### Deploy Anywhere

The builder generates static-exportable Next.js websites that can be deployed to:
- Vercel
- Netlify
- AWS Amplify
- GitHub Pages
- Any static hosting service

## 📊 API Usage

### Generate Website API

**Endpoint:** `POST /api/generate`

**Request Body:**
```typescript
{
  businessName: string;
  businessDescription: string;
  targetAudience?: string;
  location?: string;
  services: string;
  primaryColor?: string;
  secondaryColor?: string;
  themeStyle: "modern" | "minimal" | "corporate" | "bold";
}
```

**Response:**
```typescript
{
  success: boolean;
  data?: {
    content: { ... };
    design: { ... };
    seo: { ... };
    code: {
      files: Record<string, string>;
    };
  };
  error?: string;
}
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Credits

- **Next.js** - React framework
- **Groq** - Ultra-fast AI inference
- **Tailwind CSS** - Utility-first CSS framework
- **Vercel** - Deployment platform

## 📧 Support

For questions or issues, please open a GitHub issue.

---

**Built with ❤️ using Next.js, TypeScript, Tailwind CSS, and Groq AI**
