"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Sparkles, Download, Loader2, Eye } from "lucide-react";
import JSZip from "jszip";
import type { WebsiteInput, AIGenerationResult } from "@/types";

const formSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessDescription: z.string().min(10, "Description must be at least 10 characters"),
  targetAudience: z.string().optional(),
  location: z.string().optional(),
  services: z.string().min(5, "Please describe your services"),
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  themeStyle: z.enum(["modern", "minimal", "corporate", "bold"]),
});

type FormData = z.infer<typeof formSchema>;

export default function Home() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWebsite, setGeneratedWebsite] = useState<AIGenerationResult | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      themeStyle: "modern",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsGenerating(true);
    setGeneratedWebsite(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result: AIGenerationResult = await response.json();
      setGeneratedWebsite(result);

      if (result.success) {
        setShowPreview(true);
      }
    } catch (error) {
      console.error("Error generating website:", error);
      setGeneratedWebsite({
        success: false,
        error: "Failed to generate website. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadWebsite = async () => {
    if (!generatedWebsite?.data?.code?.files) return;

    const zip = new JSZip();
    const files = generatedWebsite.data.code.files;

    // Add all files to ZIP
    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });

    // Generate and download ZIP
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${watch("businessName")?.toLowerCase().replace(/\s+/g, "-") || "website"}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Website Builder</h1>
                <p className="text-sm text-gray-500">Build your website in minutes</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Form Section */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Create Your Website
                </h2>
                <p className="text-gray-600">
                  Fill in the details below and let AI generate your professional website
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Business Name */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Name *
                  </label>
                  <input
                    {...register("businessName")}
                    type="text"
                    placeholder="e.g., Tech Solutions Inc."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                  {errors.businessName && (
                    <p className="mt-1 text-sm text-red-600">{errors.businessName.message}</p>
                  )}
                </div>

                {/* Business Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Business Description *
                  </label>
                  <textarea
                    {...register("businessDescription")}
                    rows={4}
                    placeholder="Describe your business, what you do, and what makes you unique..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  />
                  {errors.businessDescription && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.businessDescription.message}
                    </p>
                  )}
                </div>

                {/* Services */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Services / Products *
                  </label>
                  <textarea
                    {...register("services")}
                    rows={3}
                    placeholder="List your main services or products (separate with commas)"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition resize-none"
                  />
                  {errors.services && (
                    <p className="mt-1 text-sm text-red-600">{errors.services.message}</p>
                  )}
                </div>

                {/* Target Audience */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Audience
                  </label>
                  <input
                    {...register("targetAudience")}
                    type="text"
                    placeholder="e.g., Small businesses, Entrepreneurs"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Location
                  </label>
                  <input
                    {...register("location")}
                    type="text"
                    placeholder="e.g., New York, USA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Theme Style */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Theme Style *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["modern", "minimal", "corporate", "bold"].map((style) => (
                      <label
                        key={style}
                        className="relative flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition"
                      >
                        <input
                          {...register("themeStyle")}
                          type="radio"
                          value={style}
                          className="sr-only peer"
                        />
                        <span className="text-sm font-medium text-gray-700 peer-checked:text-blue-600 capitalize">
                          {style}
                        </span>
                        <div className="absolute inset-0 border-2 border-blue-600 rounded-lg opacity-0 peer-checked:opacity-100 transition" />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Primary Color
                    </label>
                    <input
                      {...register("primaryColor")}
                      type="color"
                      className="w-full h-12 rounded-lg cursor-pointer border border-gray-300"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Secondary Color
                    </label>
                    <input
                      {...register("secondaryColor")}
                      type="color"
                      className="w-full h-12 rounded-lg cursor-pointer border border-gray-300"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Generating Your Website...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Website
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Preview Section */}
          <div>
            <div className="bg-white rounded-2xl shadow-xl p-8 sticky top-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Preview & Download</h3>

              {!generatedWebsite && !isGenerating && (
                <div className="text-center py-16">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-10 h-10 text-gray-400" />
                  </div>
                  <p className="text-gray-500">
                    Your generated website will appear here
                  </p>
                </div>
              )}

              {isGenerating && (
                <div className="text-center py-16">
                  <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Generating your website...</p>
                  <p className="text-sm text-gray-500 mt-2">This may take 15-30 seconds</p>
                </div>
              )}

              {generatedWebsite?.success && generatedWebsite.data && (
                <div className="space-y-6">
                  {/* Success Message */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-green-800 font-medium">
                      ✅ Website generated successfully!
                    </p>
                  </div>

                  {/* Website Details */}
                  <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">SEO Title:</p>
                      <p className="text-gray-900">{generatedWebsite.data.seo.title}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Description:</p>
                      <p className="text-gray-600 text-sm">
                        {generatedWebsite.data.seo.description}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Files Generated:</p>
                      <p className="text-gray-900">
                        {Object.keys(generatedWebsite.data.code.files).length} files
                      </p>
                    </div>
                  </div>

                  {/* Download Button */}
                  <button
                    onClick={downloadWebsite}
                    className="w-full bg-green-600 text-white px-6 py-4 rounded-lg font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download Website (ZIP)
                  </button>

                  {/* Instructions */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="font-semibold text-blue-900 mb-2">Next Steps:</p>
                    <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                      <li>Extract the ZIP file</li>
                      <li>Run: npm install</li>
                      <li>Run: npm run dev</li>
                      <li>Open http://localhost:3000</li>
                    </ol>
                  </div>
                </div>
              )}

              {generatedWebsite?.error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-800 font-medium">❌ Error:</p>
                  <p className="text-red-700 text-sm mt-1">{generatedWebsite.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-20">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Enter Details</h3>
              <p className="text-gray-600">
                Provide your business information, services, and preferences
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">AI Generation</h3>
              <p className="text-gray-600">
                Our AI creates a professional Next.js website tailored to your needs
              </p>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Download & Deploy</h3>
              <p className="text-gray-600">
                Download your website and deploy it anywhere in minutes
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold mb-2">AI Website Builder</p>
          <p className="text-gray-400 text-sm">
            Built with Next.js, TypeScript, Tailwind CSS, and Groq AI
          </p>
        </div>
      </footer>
    </div>
  );
}
