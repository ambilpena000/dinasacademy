import React from 'react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import { ArrowLeft, CheckCircle, XCircle, Lightbulb, PlayCircle } from 'lucide-react';
import { Card, CardContent } from '../components/Card';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { mockQuestions, mockTryOuts } from '../data/mockData';

export default function PembahasanPage() {
  const { id } = useParams();
  const tryOut = mockTryOuts.find(t => t.id === id);

  // Mock user answers
  const userAnswers: { [key: string]: string } = {
    '1': 'b',
    '2': 'a'
  };

  // Extended questions for demo
  const questions = mockQuestions.map((q, i) => ({
    ...q,
    id: String(i + 1),
    questionNumber: i + 1
  }));

  const calculateScore = () => {
    const correct = questions.filter(q => userAnswers[q.id] === q.correctAnswer).length;
    const total = questions.length;
    return { correct, total, percentage: (correct / total) * 100 };
  };

  const score = calculateScore();

  if (!tryOut) {
    return <div>Try out not found</div>;
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link to="/tryout">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-all">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Kembali</span>
          </button>
        </Link>
      </div>

      {/* Score Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="pt-6">
            <h2 className="text-2xl font-bold mb-4">{tryOut.title}</h2>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-100 text-sm mb-1">Benar</p>
                <p className="text-3xl font-bold">{score.correct}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-100 text-sm mb-1">Salah</p>
                <p className="text-3xl font-bold">{score.total - score.correct}</p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <p className="text-blue-100 text-sm mb-1">Nilai</p>
                <p className="text-3xl font-bold">{score.percentage.toFixed(0)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Questions with Explanation */}
      <div className="space-y-6">
        {questions.map((question, index) => {
          const userAnswer = userAnswers[question.id];
          const isCorrect = userAnswer === question.correctAnswer;

          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card>
                <CardContent className="pt-6">
                  {/* Question Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${
                        isCorrect ? 'bg-green-500' : 'bg-red-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <Badge variant={isCorrect ? 'green' : 'red'}>
                          {isCorrect ? 'Benar' : 'Salah'}
                        </Badge>
                      </div>
                    </div>
                    <Badge variant="blue">{question.subject}</Badge>
                  </div>

                  {/* Question Text */}
                  <div className="mb-6">
                    <p className="text-lg text-gray-900 leading-relaxed">
                      {question.questionText}
                    </p>
                  </div>

                  {/* Options */}
                  <div className="space-y-3 mb-6">
                    {question.options.map((option) => {
                      const isUserAnswer = userAnswer === option.id;
                      const isCorrectAnswer = question.correctAnswer === option.id;

                      return (
                        <div
                          key={option.id}
                          className={`p-4 rounded-xl border-2 ${
                            isCorrectAnswer
                              ? 'border-green-500 bg-green-50'
                              : isUserAnswer && !isCorrect
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200'
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 mt-0.5">
                              {isCorrectAnswer ? (
                                <CheckCircle className="w-6 h-6 text-green-600" />
                              ) : isUserAnswer && !isCorrect ? (
                                <XCircle className="w-6 h-6 text-red-600" />
                              ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-gray-300" />
                              )}
                            </div>
                            <div className="flex-1">
                              <span className="font-medium text-gray-700 mr-2">
                                {option.id.toUpperCase()}.
                              </span>
                              <span className={`${
                                isCorrectAnswer ? 'text-green-900 font-semibold' : 
                                isUserAnswer && !isCorrect ? 'text-red-900' : 
                                'text-gray-900'
                              }`}>
                                {option.text}
                              </span>
                              {isUserAnswer && !isCorrect && (
                                <span className="ml-2 text-sm text-red-600">(Jawaban kamu)</span>
                              )}
                              {isCorrectAnswer && (
                                <span className="ml-2 text-sm text-green-600">(Jawaban benar)</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="bg-blue-50 border-l-4 border-[#2563EB] rounded-r-xl p-4 mb-4">
                    <div className="flex items-start space-x-3">
                      <Lightbulb className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-bold text-gray-900 mb-2">Pembahasan:</h4>
                        <p className="text-gray-700 leading-relaxed">
                          {question.explanation}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tips */}
                  {question.tips && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-4 mb-4">
                      <div className="flex items-start space-x-3">
                        <span className="text-xl flex-shrink-0">💡</span>
                        <div>
                          <h4 className="font-bold text-gray-900 mb-1">Tips:</h4>
                          <p className="text-gray-700 text-sm">{question.tips}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Video Explanation */}
                  {question.videoUrl && (
                    <Button variant="ghost" size="sm">
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Tonton Video Pembahasan
                    </Button>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-64 bg-white border-t border-gray-200 p-4 z-20">
        <div className="max-w-4xl mx-auto flex space-x-3">
          <Link to="/tryout" className="flex-1">
            <Button variant="ghost" className="w-full">
              Kembali ke Try Out
            </Button>
          </Link>
          <Link to="/hasil" className="flex-1">
            <Button variant="primary" className="w-full">
              Lihat Analisis Lengkap
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
