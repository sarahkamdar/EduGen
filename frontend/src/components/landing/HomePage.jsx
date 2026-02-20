import React from 'react'
import Navbar from './Navbar'

const dotGridLight = {
  backgroundImage: 'radial-gradient(circle, #C7D2FE 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

const dotGridDark = {
  backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px)',
  backgroundSize: '22px 22px',
}

const HomePage = ({ onNavigateToAuth, onGetStarted }) => {
  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#EEF2FF' }}>
      <Navbar onSignIn={onNavigateToAuth} onGetStarted={onGetStarted} />

      {/* Hero Section */}
      <section
        className="relative pt-32 pb-0 px-6 lg:px-8 overflow-hidden"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(135deg, #1E3A8A 0%, #0F1F5C 100%)',
          backgroundSize: '22px 22px, cover',
          minHeight: '72vh',
        }}
      >
        {/* Top-right decorative arcs */}
        <svg
          className="absolute top-0 right-0 opacity-20 pointer-events-none"
          width="520" height="480"
          viewBox="0 0 520 480"
          fill="none"
        >
          <circle cx="480" cy="0" r="200" stroke="white" strokeWidth="1.5" fill="none" />
          <circle cx="480" cy="0" r="300" stroke="white" strokeWidth="1" fill="none" />
          <circle cx="480" cy="0" r="420" stroke="white" strokeWidth="0.6" fill="none" />
        </svg>

        <div className="relative max-w-[1200px] mx-auto pb-24">
          <div className="max-w-2xl text-left">
            <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight mb-5">
              Understand Your<br />Learning Material Better.
            </h1>
            <p className="text-lg text-blue-200 mb-10 leading-relaxed max-w-xl">
              Upload a video, document, or topic. Generate structured notes, flashcards, quizzes, and presentations in seconds.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onGetStarted}
                className="px-6 py-3 text-sm font-semibold text-[#1E3A8A] bg-white rounded-[8px] hover:bg-blue-50 transition-colors shadow-lg"
              >
                Get Started
              </button>
              <button
                onClick={() => scrollToSection('features')}
                className="px-6 py-3 text-sm font-medium text-white border border-white/40 rounded-[8px] hover:bg-white/10 transition-colors"
              >
                See Features
              </button>
            </div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none" style={{ lineHeight: 0 }}>
          <svg viewBox="0 0 1440 64" preserveAspectRatio="none" style={{ display: 'block', width: '100%', height: '64px' }}>
            <path d="M0,32 C360,64 1080,0 1440,32 L1440,64 L0,64 Z" fill="#EEF2FF" />
          </svg>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 lg:px-8" style={{ backgroundColor: '#EEF2FF', ...dotGridLight, paddingTop: '5rem' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-[#111827] mb-2">
              What you can do
            </h2>
            <p className="text-sm text-[#6B7280]">
              Each tool works from the same uploaded content. Upload once, use everything.
            </p>
            <div className="mt-4 h-0.5 w-12 bg-[#1E3A8A] rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Feature 1 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE] shadow-sm">
              <div className="w-9 h-9 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Multiple Input Formats</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Upload PDF, Word, MP4, or paste a YouTube link. You can also type a topic directly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE] shadow-sm">
              <div className="w-9 h-9 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Structured Summaries</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Get a short overview, detailed notes, exam-focused points, or quick revision bullets.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE] shadow-sm">
              <div className="w-9 h-9 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Flashcards</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Generate concept cards in formats like term-definition, question-answer, or step-by-step.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE] shadow-sm">
              <div className="w-9 h-9 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Quizzes</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Practice with immediate feedback or simulate a test with results at the end.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE] shadow-sm">
              <div className="w-9 h-9 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Presentations</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Turn content into a slide outline with titles and bullet points.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE] shadow-sm">
              <div className="w-9 h-9 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-[#1E3A8A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Chatbot</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Ask questions about your uploaded content and get answers grounded in the material.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 px-6 lg:px-8" style={{ backgroundColor: '#ffffff', backgroundImage: 'radial-gradient(circle, #E0E7FF 1px, transparent 1px)', backgroundSize: '22px 22px' }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-12">
            <h2 className="text-2xl font-semibold text-[#111827] mb-2">
              How it works
            </h2>
            <p className="text-sm text-[#6B7280]">
              The process is straightforward.
            </p>
            <div className="mt-4 h-0.5 w-12 bg-[#1E3A8A] rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE]">
              <div className="w-8 h-8 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <span className="text-sm font-semibold text-[#1E3A8A]">1</span>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Upload</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Add a video, document, URL, or type a topic.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE]">
              <div className="w-8 h-8 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <span className="text-sm font-semibold text-[#1E3A8A]">2</span>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Extract</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                The content is transcribed or parsed into clean text.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE]">
              <div className="w-8 h-8 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <span className="text-sm font-semibold text-[#1E3A8A]">3</span>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Generate</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Choose what to create: summary, flashcards, quiz, or slides.
              </p>
            </div>

            {/* Step 4 */}
            <div className="p-6 bg-white rounded-[8px] border border-[#C7D2FE]">
              <div className="w-8 h-8 bg-[#EEF2FF] rounded-[8px] flex items-center justify-center mb-4">
                <span className="text-sm font-semibold text-[#1E3A8A]">4</span>
              </div>
              <h3 className="text-sm font-semibold text-[#111827] mb-1">Review</h3>
              <p className="text-sm text-[#6B7280] leading-relaxed">
                Study with the materials or go back and regenerate with different settings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8" style={{ backgroundColor: '#EEF2FF', ...dotGridLight }}>
        <div className="max-w-[1200px] mx-auto">
          <div className="max-w-lg">
            <h2 className="text-2xl font-semibold text-[#111827] mb-3">
              Ready to get started?
            </h2>
            <p className="text-sm text-[#6B7280] mb-6">
              Create a free account and begin uploading your study material.
            </p>
            <button
              onClick={onNavigateToAuth}
              className="px-5 py-2.5 text-sm font-medium text-white bg-[#1E3A8A] rounded-[8px] hover:bg-[#1C337A] transition-colors"
            >
              Create Free Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        className="py-10 px-6 lg:px-8 relative overflow-hidden"
        style={{ backgroundColor: '#0F1F5C', ...dotGridDark }}
      >
        <div className="relative max-w-[1200px] mx-auto flex items-center justify-between">
          <p className="text-sm text-blue-200 font-medium">
            EduGen
          </p>
          <p className="text-sm text-blue-400">
            © 2026 EduGen
          </p>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
