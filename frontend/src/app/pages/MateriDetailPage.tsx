import React, { useState } from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  ArrowLeft, PlayCircle, FileText, CheckCircle, Lock, 
  Target, HelpCircle, Download, BookOpen
} from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { mockSubTests, ContentItem } from '../data/mockData';

export default function MateriDetailPage() {
  const { subtestId, chapterId } = useParams();
  const subTest = mockSubTests.find(st => st.id === subtestId);
  const chapter = subTest?.subChapters.find(ch => ch.id === chapterId);
  const [selectedContent, setSelectedContent] = useState<ContentItem | null>(
    chapter?.contents.find(c => !c.locked) || null
  );

  if (!subTest || !chapter) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Materi Tidak Ditemukan</h2>
        <Link to="/materi">
          <Button variant="primary">Kembali ke Materi</Button>
        </Link>
      </div>
    );
  }

  const getContentIcon = (type: ContentItem['type']) => {
    switch (type) {
      case 'video':
        return PlayCircle;
      case 'pdf':
        return FileText;
      case 'example':
        return Target;
    }
  };

  const getContentLabel = (type: ContentItem['type']) => {
    switch (type) {
      case 'video':
        return 'Video';
      case 'pdf':
        return 'Materi PDF';
      case 'example':
        return 'Contoh Soal';
    }
  };

  // Calculate progress
  const completedCount = chapter.contents.filter(c => c.completed).length;
  const totalCount = chapter.contents.length;
  const progress = Math.round((completedCount / totalCount) * 100);

  // Determine content type based on chapter title
  const isRangkumanMateri = chapter.title.toLowerCase().includes('rangkuman');
  const isBankSoal = chapter.title.toLowerCase().includes('bank soal') || chapter.title.toLowerCase().includes('pembahasan');
  const isPengenalanOrTeknik = chapter.title.toLowerCase().includes('pengenalan') || chapter.title.toLowerCase().includes('teknik');

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to={`/materi/${subtestId}`}>
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Kembali</span>
        </button>
      </Link>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center space-x-2 mb-2">
          <span className="px-3 py-1 rounded-lg bg-gray-900 text-white text-sm font-bold">
            {subTest.code}
          </span>
          <Badge variant={subTest.track === 'PTN' ? 'blue' : 'purple'}>
            {subTest.track}
          </Badge>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{subTest.title}</h1>
        <h2 className="text-xl text-gray-700 mb-2">{chapter.title}</h2>
        <p className="text-gray-600">{chapter.description}</p>
      </motion.div>

      {/* Main Content */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Video/Content Player */}
        <div className="lg:col-span-2 space-y-6">
          {/* Content Player - for all types */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card>
              <CardContent className="p-0">
                {/* Video/Content Placeholder */}
                <div className="relative aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-t-2xl flex flex-col items-center justify-center">
                  {selectedContent ? (
                    <>
                      {selectedContent.completed && (
                        <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-green-600 text-white text-sm font-medium flex items-center space-x-1">
                          <CheckCircle className="w-4 h-4" />
                          <span>Selesai</span>
                        </div>
                      )}
                      <button className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all">
                        {selectedContent.type === 'video' ? (
                          <PlayCircle className="w-12 h-12 text-white" />
                        ) : selectedContent.type === 'pdf' ? (
                          <FileText className="w-12 h-12 text-white" />
                        ) : (
                          <Target className="w-12 h-12 text-white" />
                        )}
                      </button>
                      <div className="mt-4 text-center">
                        <h3 className="text-white font-semibold text-lg">{selectedContent.title}</h3>
                        <p className="text-white/70 text-sm mt-1">{selectedContent.duration}</p>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-white/70">
                      <Lock className="w-12 h-12 mx-auto mb-2" />
                      <p>Pilih materi untuk mulai belajar</p>
                    </div>
                  )}
                </div>

                {selectedContent && (
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {selectedContent.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-4">
                      <Badge variant="blue">{getContentLabel(selectedContent.type)}</Badge>
                      <span className="text-sm text-gray-600">• {selectedContent.duration}</span>
                    </div>
                    {selectedContent.description && (
                      <p className="text-gray-700 mb-6">
                        {selectedContent.description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4">
                      <Button variant="primary" size="md">
                        {selectedContent.completed ? 'Tonton Lagi' : 'Mulai Belajar'}
                      </Button>
                      {!selectedContent.completed && (
                        <Button variant="outline" size="md">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Tandai Selesai
                        </Button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Chapter Description - Only for Pengenalan & Teknik */}
          {isPengenalanOrTeknik && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <BookOpen className="w-5 h-5 text-[#2563EB]" />
                    <h3 className="text-lg font-bold text-gray-900">Tentang Materi Ini</h3>
                  </div>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {chapter.description}
                    </p>
                    <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                      <h4 className="font-semibold text-gray-900 mb-2">Yang akan kamu pelajari:</h4>
                      <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Konsep dasar dan fundamental dari materi {subTest.title}</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Teknik dan strategi pengerjaan soal yang efektif</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Tips dan trik untuk memaksimalkan skor dalam ujian</span>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                          <span>Contoh soal dan pembahasan lengkap</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Practice Questions Card - Only for Bank Soal & Pembahasan */}
          {isBankSoal && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-6">
                    <Target className="w-5 h-5 text-[#2563EB]" />
                    <h3 className="text-lg font-bold text-gray-900">Latihan Soal dan Pembahasan</h3>
                  </div>

                  <div className="space-y-3">
                    {/* Bank Soal PDF */}
                    <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer group">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-all">
                          <Target className="w-6 h-6 text-[#2563EB]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">Bank Soal - {subTest.code}</h4>
                          <p className="text-xs text-gray-600">50 Soal • PDF • 1.8 MB</p>
                        </div>
                        <button className="w-10 h-10 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all">
                          <Download className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>

                    {/* Pembahasan Lengkap */}
                    <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer group">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-all">
                          <FileText className="w-6 h-6 text-[#2563EB]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">Pembahasan Lengkap</h4>
                          <p className="text-xs text-gray-600">PDF • 3.2 MB</p>
                        </div>
                        <button className="w-10 h-10 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all">
                          <Download className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>

                    {/* Kunci Jawaban */}
                    <div className="p-4 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all cursor-pointer group">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-200 transition-all">
                          <CheckCircle className="w-6 h-6 text-[#2563EB]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm">Kunci Jawaban</h4>
                          <p className="text-xs text-gray-600">PDF • 450 KB</p>
                        </div>
                        <button className="w-10 h-10 rounded-lg bg-white hover:bg-gray-50 border border-gray-200 flex items-center justify-center transition-all">
                          <Download className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Right - Progress & Content List */}
        <div className="space-y-6">
          {/* Progress Card */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Progress Belajar</h3>
              <div className="mb-4">
                <div className="flex items-baseline space-x-2 mb-2">
                  <span className="text-3xl font-bold text-[#2563EB]">{progress}%</span>
                  <span className="text-sm text-gray-600">Selesai</span>
                </div>
                <ProgressBar value={progress} />
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p>{completedCount} dari {totalCount} materi</p>
                <p className="text-xs">Estimasi Selesai: {
                  completedCount === totalCount ? '✓ Sudah selesai!' : '5 hari lagi'
                }</p>
              </div>
            </CardContent>
          </Card>

          {/* Content List - Only show if not Rangkuman Materi */}
          {!isRangkumanMateri && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Daftar Materi</h3>
                <div className="space-y-2">
                  {chapter.contents.map((content) => {
                    const Icon = getContentIcon(content.type);
                    const isSelected = selectedContent?.id === content.id;
                    
                    return (
                      <button
                        key={content.id}
                        onClick={() => !content.locked && setSelectedContent(content)}
                        disabled={content.locked}
                        className={`w-full p-3 rounded-xl transition-all text-left ${
                          isSelected
                            ? 'bg-[#2563EB] text-white ring-2 ring-[#2563EB] ring-offset-2'
                            : content.locked
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : content.completed
                            ? 'bg-green-50 hover:bg-green-100'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            isSelected
                              ? 'bg-white/20'
                              : content.locked
                              ? 'bg-gray-200'
                              : content.completed
                              ? 'bg-green-600'
                              : 'bg-gray-200'
                          }`}>
                            {content.locked ? (
                              <Lock className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-400'}`} />
                            ) : content.completed ? (
                              <CheckCircle className="w-5 h-5 text-white" />
                            ) : (
                              <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-semibold text-sm ${
                              isSelected ? 'text-white' : content.locked ? 'text-gray-400' : 'text-gray-900'
                            }`}>
                              {content.title}
                            </p>
                            <p className={`text-xs ${
                              isSelected ? 'text-white/80' : 'text-gray-500'
                            }`}>
                              {content.duration}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help Card */}
          <Card className="bg-gradient-to-br from-blue-50 to-sky-50 border-2 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                  <HelpCircle className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-bold text-gray-900 mb-2">Butuh Bantuan?</h4>
                <p className="text-sm text-gray-700 mb-4">
                  Hubungi mentor jika ada materi yang sulit dipahami
                </p>
                <Button variant="outline" size="sm" className="w-full">
                  Hubungi Mentor
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}