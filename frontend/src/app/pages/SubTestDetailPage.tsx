import React from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, PlayCircle, Lock } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { ProgressBar } from '../components/ProgressBar';
import { mockSubTests } from '../data/mockData';

export default function SubTestDetailPage() {
  const { subtestId } = useParams();
  const subTest = mockSubTests.find(st => st.id === subtestId);

  if (!subTest) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Sub Test Tidak Ditemukan</h2>
        <Link to="/materi">
          <Button variant="primary">Kembali ke Materi</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link to="/materi">
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
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 rounded-lg bg-gray-900 text-white text-sm font-bold">
                {subTest.code}
              </span>
              <Badge variant={subTest.track === 'PTN' ? 'blue' : 'purple'}>
                {subTest.track}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{subTest.title}</h1>
            <p className="text-gray-600">{subTest.description}</p>
          </div>
        </div>
      </motion.div>

      {/* Progress Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-1">Progress Kamu</h3>
              <div className="flex items-baseline space-x-2">
                <span className="text-3xl font-bold text-[#2563EB]">{subTest.progress}%</span>
                <span className="text-sm text-gray-600">
                  dari materi selesai
                </span>
              </div>
            </div>
            <div className="text-right">
              <h3 className="text-sm font-medium text-gray-600 mb-1">Bab Selesai</h3>
              <p className="text-2xl font-bold text-gray-900">
                {subTest.completedChapters}/{subTest.totalChapters}
              </p>
            </div>
          </div>
          <ProgressBar value={subTest.progress} />
        </CardContent>
      </Card>

      {/* Sub-chapters List */}
      <div className="space-y-4">
        {subTest.subChapters.map((chapter, index) => (
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Link to={`/materi/${subtestId}/${chapter.id}`}>
              <Card hover>
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-4">
                    {/* Icon */}
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      chapter.completed 
                        ? 'bg-green-100' 
                        : 'bg-gradient-to-br from-[#2563EB] to-[#3B82F6]'
                    }`}>
                      {chapter.completed ? (
                        <CheckCircle className="w-7 h-7 text-green-600" />
                      ) : (
                        <PlayCircle className="w-7 h-7 text-white" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-900 mb-1">
                            {chapter.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            {chapter.description}
                          </p>
                        </div>
                        {chapter.completed && (
                          <Badge variant="green" className="ml-2">Selesai</Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{chapter.totalVideos} video</span>
                        <span>•</span>
                        <span>{chapter.totalDuration}</span>
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button 
                      variant={chapter.completed ? 'ghost' : 'primary'} 
                      size="sm"
                    >
                      {chapter.completed ? 'Ulangi' : 'Mulai'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
