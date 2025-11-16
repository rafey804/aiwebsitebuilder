"use client";

import { useState } from "react";
import { Sparkles, Loader2, Code, Eye, Download, Copy, Check } from "lucide-react";
import JSZip from "jszip";
import type { AIGenerationResult } from "@/types";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedWebsite, setGeneratedWebsite] = useState<AIGenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "code">("preview");
  const [selectedFile, setSelectedFile] = useState<string>("app/page.tsx");
  const [copied, setCopied] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedWebsite(null);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const result: AIGenerationResult = await response.json();
      setGeneratedWebsite(result);

      if (result.success) {
        setActiveTab("preview");
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

    Object.entries(files).forEach(([path, content]) => {
      zip.file(path, content);
    });

    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "my-website.zip";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const copyCode = async () => {
    if (!generatedWebsite?.data?.code?.files?.[selectedFile]) return;

    await navigator.clipboard.writeText(generatedWebsite.data.code.files[selectedFile]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">AI Website Builder</h1>
              <p className="text-xs text-purple-300">Powered by Groq AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!generatedWebsite && (
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold text-white mb-4">
                Build Your Dream Website
                <br />
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  With AI in Seconds
                </span>
              </h2>
              <p className="text-xl text-gray-300">
                Just describe your vision, and watch AI create a complete, professional website
              </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                <label className="block text-sm font-semibold text-white mb-3">
                  Describe your website
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={6}
                  placeholder="Example: Create a modern tech startup website for an AI company. Include hero section with gradient background, features section with 3 services, testimonials, and contact form. Use purple and blue color scheme."
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition resize-none"
                  disabled={isGenerating}
                />
                <p className="mt-2 text-sm text-gray-400">
                  Be specific about design, colors, sections, and features you want
                </p>
              </div>

              <button
                type="submit"
                disabled={isGenerating || !prompt.trim()}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-5 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-2xl shadow-purple-500/50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Creating Your Website...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-6 h-6" />
                    Generate Website
                  </>
                )}
              </button>
            </form>

            {isGenerating && (
              <div className="mt-12 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-8">
                <div className="text-center">
                  <Loader2 className="w-16 h-16 text-purple-400 animate-spin mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">
                    AI is working its magic...
                  </h3>
                  <div className="space-y-2 text-sm text-gray-400">
                    <p>✨ Analyzing your requirements...</p>
                    <p>🎨 Designing beautiful layouts...</p>
                    <p>💻 Writing clean code...</p>
                    <p>🚀 Almost there...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Features */}
            <div className="mt-20 grid md:grid-cols-3 gap-6">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered</h3>
                <p className="text-gray-400 text-sm">
                  Advanced AI generates professional websites tailored to your needs
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="w-12 h-12 bg-pink-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Code className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Production Ready</h3>
                <p className="text-gray-400 text-sm">
                  Clean, optimized Next.js code ready to deploy anywhere
                </p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-6">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-4">
                  <Eye className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Live Preview</h3>
                <p className="text-gray-400 text-sm">
                  Instantly preview and customize your generated website
                </p>
              </div>
            </div>
          </div>
        )}

        {generatedWebsite?.success && generatedWebsite.data && (
          <div className="space-y-6">
            {/* Success Header */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">
                    ✨ Website Created Successfully!
                  </h3>
                  <p className="text-green-300">
                    Your website is ready. Preview it below or download the code.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={downloadWebsite}
                    className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 border border-white/20"
                  >
                    <Download className="w-5 h-5" />
                    Download ZIP
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedWebsite(null);
                      setPrompt("");
                    }}
                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    New Website
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-1">
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  activeTab === "preview"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Eye className="w-5 h-5" />
                Live Preview
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex-1 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  activeTab === "code"
                    ? "bg-purple-600 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                <Code className="w-5 h-5" />
                View Code
              </button>
            </div>

            {/* Preview Tab */}
            {activeTab === "preview" && (
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
                <div className="bg-white rounded-xl overflow-hidden" style={{ height: "800px" }}>
                  <iframe
                    srcDoc={generatedWebsite.data.code.files["preview.html"] || ""}
                    className="w-full h-full"
                    title="Website Preview"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            )}

            {/* Code Tab */}
            {activeTab === "code" && (
              <div className="grid grid-cols-4 gap-6">
                {/* File List */}
                <div className="col-span-1 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-4 max-h-[800px] overflow-y-auto">
                  <h4 className="text-sm font-semibold text-white mb-3">Files</h4>
                  <div className="space-y-1">
                    {Object.keys(generatedWebsite.data.code.files).map((file) => (
                      <button
                        key={file}
                        onClick={() => setSelectedFile(file)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition ${
                          selectedFile === file
                            ? "bg-purple-600 text-white"
                            : "text-gray-400 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {file}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Code Viewer */}
                <div className="col-span-3 bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                    <span className="text-sm font-mono text-gray-300">{selectedFile}</span>
                    <button
                      onClick={copyCode}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-sm text-white transition"
                    >
                      {copied ? (
                        <>
                          <Check className="w-4 h-4" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4" />
                          Copy
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 text-sm text-gray-300 font-mono overflow-x-auto max-h-[750px] overflow-y-auto">
                    <code>{generatedWebsite.data.code.files[selectedFile]}</code>
                  </pre>
                </div>
              </div>
            )}
          </div>
        )}

        {generatedWebsite?.error && (
          <div className="max-w-3xl mx-auto bg-red-500/20 backdrop-blur-xl rounded-2xl border border-red-500/30 p-6">
            <h3 className="text-xl font-bold text-red-300 mb-2">❌ Generation Failed</h3>
            <p className="text-red-200">{generatedWebsite.error}</p>
          </div>
        )}
      </main>
    </div>
  );
}
