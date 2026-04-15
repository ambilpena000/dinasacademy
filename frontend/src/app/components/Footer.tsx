import React from 'react';
import { Sparkles } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-black">DINAS ACADEMY</span>
            </div>
            <p className="text-gray-400 text-sm">Platform e-learning #1 di Indonesia untuk persiapan PTN & Sekolah Kedinasan.</p>
          </div>
          <div>
            <h4 className="font-bold mb-3">Platform</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['Tentang Kami', 'Fitur', 'Harga', 'Blog'].map(link => (
                <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-3">Bantuan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              {['FAQ', 'Kontak', 'Syarat & Ketentuan', 'Privacy'].map(link => (
                <li key={link}><a href="#" className="hover:text-white transition-colors">{link}</a></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-6 text-center text-sm text-gray-500">
          <p>© 2026 DINAS ACADEMY. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
