// src/components/footer.tsx
import { Linkedin, Github, Link as LinkIcon } from "lucide-react";

export default function FooterBar() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-app">
      <div className="w-full max-w-9xl mx-auto px-3 sm:px-3 py-3">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          <p>© 2025 Rev9</p>
          <div className="flex items-center gap-4 sm:ml-auto">
            <a
              href="https://www.linkedin.com/in/archit-react/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-blue-600 dark:hover:text-blue-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400/40 rounded"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="https://github.com/archit-react"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#7c3aed] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400/30 rounded"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-gray-400 hover:text-black dark:hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400/30 rounded"
            >
              <LinkIcon className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
