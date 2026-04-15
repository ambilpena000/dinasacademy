import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { BookOpen } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { mockSubTests } from '../data/mockData';
import { useAuth } from '../context/AuthContext';

export default function MateriPage() {
  const { user } = useAuth();
  const [selectedTrack, setSelectedTrack] = useState<'All' | 'PTN' | 'Sekdin'>('All');

  // Filter based on purchased package
  const getTrackFromPackage = () => {
    if (!user?.packageType) return 'All';
    if (user.packageType === 'PTN Premium') return 'PTN';
    if (user.packageType === 'SKD' || user.packageType === 'STIS') return 'Sekdin';
    return 'All';
  };

  const userTrack = getTrackFromPackage();

  const filteredSubTests = mockSubTests.filter((subTest) => {
    // Filter by purchased package
    const matchesPackage = userTrack === 'All' || subTest.track === userTrack;
    // Filter by selected track
    const matchesFilter = selectedTrack === 'All' || subTest.track === selectedTrack;
    return matchesPackage && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Materi Pembelajaran</h1>
        <p className="text-gray-600">Pilih sub tes untuk memulai belajar</p>
      </motion.div>

      {/* Track Filter */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700">Jalur:</span>
            <div className="flex space-x-2">
              {(['All', 'PTN', 'Sekdin'] as const).map((track) => (
                <button
                  key={track}
                  onClick={() => setSelectedTrack(track)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedTrack === track
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {track}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sub-tests Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredSubTests.map((subTest, index) => (
          <motion.div
            key={subTest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/materi/${subTest.id}`}>
              <Card hover className="h-full">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="px-3 py-1 rounded-lg bg-gray-900 text-white text-sm font-bold">
                          {subTest.code}
                        </span>
                        <Badge variant={subTest.track === 'PTN' ? 'blue' : 'purple'}>
                          {subTest.track}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {subTest.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {subTest.description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Section */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-3xl font-bold text-[#2563EB]">{subTest.progress}%</span>
                      <span className="text-sm text-gray-600">
                        {subTest.progress === 100 ? 'Selesai' : 'Sedang Belajar'}
                      </span>
                    </div>
                    <ProgressBar value={subTest.progress} />
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm text-gray-600 py-3 border-t border-gray-200">
                    <span>{subTest.totalChapters} Bab</span>
                    <span>{subTest.completedChapters} Selesai</span>
                  </div>

                  <Button 
                    variant={subTest.progress === 100 ? 'outline' : 'primary'} 
                    size="md" 
                    className="w-full mt-4"
                  >
                    {subTest.progress === 100 ? 'Ulangi Materi' : 
                     subTest.progress > 0 ? 'Lanjutkan' : 'Mulai Belajar'}
                  </Button>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredSubTests.length === 0 && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
            <BookOpen className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Belum Ada Materi</h3>
          <p className="text-gray-600">Pilih jalur yang tersedia untuk melihat materi</p>
        </div>
      )}
    </div>
  );
}