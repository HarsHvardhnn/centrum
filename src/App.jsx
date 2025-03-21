import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-light to-blue-50">
      {/* Navigation */}
      <nav className="px-6 py-4 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img src={viteLogo} className="h-8 w-8" alt="Vite logo" />
            <span className="text-xl font-bold text-dark">ViteReact</span>
          </div>
          <div className="hidden md:flex space-x-8">
            <a href="#features" className="text-gray-600 hover:text-primary transition">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-primary transition">Testimonials</a>
            <a href="#pricing" className="text-gray-600 hover:text-primary transition">Pricing</a>
          </div>
          <button className="bg-primary text-white px-5 py-2 rounded-lg hover:bg-blue-600 transition">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold text-dark mb-6">Build Faster with Vite + React</h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            The lightning-fast frontend tooling that makes development a breeze. 
            Experience HMR that's so fast it feels instant.
          </p>
          <div className="flex justify-center space-x-4">
            <button className="bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-blue-600 transition">
              Get Started
            </button>
            <button className="bg-white text-primary border border-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-50 transition">
              Learn More
            </button>
          </div>
          <div className="mt-16 flex justify-center">
            <div className="bg-white p-8 rounded-xl shadow-lg flex items-center space-x-8">
              <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
              <span className="text-3xl font-bold text-gray-400">+</span>
              <img src={reactLogo} className="h-16 w-16 animate-spin-slow" alt="React logo" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-dark mb-16">Powerful Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-light p-8 rounded-xl shadow-sm">
              <div className="bg-primary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">Lightning Fast HMR</h3>
              <p className="text-gray-600">
                Hot Module Replacement that's so fast it feels instant, providing immediate feedback as you develop.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-light p-8 rounded-xl shadow-sm">
              <div className="bg-secondary/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">Optimized Build</h3>
              <p className="text-gray-600">
                Pre-configured build optimizations with support for dynamic imports and aggressive code splitting.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-light p-8 rounded-xl shadow-sm">
              <div className="bg-purple-500/10 w-14 h-14 rounded-lg flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-dark mb-3">TypeScript Support</h3>
              <p className="text-gray-600">
                First-class TypeScript support with no additional configuration needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center text-dark mb-16">What Developers Say</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <p className="text-gray-600 mb-6">
                "Each and every time I use Vite, I feel a true sense of pure and unbridled joy. It's also a great platform to build a framework on since it provides a pluggable dev environment."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-primary font-bold">JD</span>
                </div>
                <div>
                  <h4 className="font-bold text-dark">John Developer</h4>
                  <p className="text-gray-500 text-sm">Senior Frontend Engineer</p>
                </div>
              </div>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-sm">
              <p className="text-gray-600 mb-6">
                "Vite has been a game changer for the industry. Every time I suspect I've hit the bounds of what Vite can do, I end up being wrong."
              </p>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-secondary/20 rounded-full flex items-center justify-center mr-4">
                  <span className="text-secondary font-bold">SD</span>
                </div>
                <div>
                  <h4 className="font-bold text-dark">Sarah Developer</h4>
                  <p className="text-gray-500 text-sm">Tech Lead</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Build Something Amazing?</h2>
          <p className="text-blue-100 mb-10 max-w-2xl mx-auto">
            Join thousands of developers who are already using Vite + React to build faster, more efficient web applications.
          </p>
          <button className="bg-white text-primary px-8 py-3 rounded-lg text-lg font-medium hover:bg-gray-100 transition">
            Get Started Now
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark text-white py-12">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-6 md:mb-0">
              <img src={viteLogo} className="h-8 w-8" alt="Vite logo" />
              <span className="text-xl font-bold">ViteReact</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-gray-400 hover:text-white transition">About</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Features</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Docs</a>
              <a href="#" className="text-gray-400 hover:text-white transition">Contact</a>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>© {new Date().getFullYear()} ViteReact. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
