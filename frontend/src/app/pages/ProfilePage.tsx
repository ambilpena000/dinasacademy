import React, { useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { 
  User, Mail, Calendar, Package, Award, 
  Bell, Lock, Edit2, Save, Target, Trophy,
  Phone, School, GraduationCap, Heart, AlertCircle, CheckCircle2, X,
  Eye, EyeOff
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Badge } from '../components/Badge';
import { useAuth } from '../context/AuthContext';
import { universities, getPrograms, searchUniversities } from '../data/universities';

export default function ProfilePage() {
  const { user, updateProfile, changePassword, refreshUser } = useAuth();

  // Auto-refresh user dari backend saat ProfilePage dibuka
  // agar status paket langsung terupdate setelah admin aktifkan
  React.useEffect(() => {
    refreshUser();
  }, []);
  const [isEditing, setIsEditing] = useState(false);
  const [univSearch, setUnivSearch] = useState('');
  const [showUnivDropdown, setShowUnivDropdown] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(() => {
    return localStorage.getItem(`profile_photo_${user?.id}`) || null;
  });
  const photoInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Ukuran foto maksimal 2MB'); return; }
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoUrl(dataUrl);
      localStorage.setItem(`profile_photo_${user?.id}`, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const [showAssessment, setShowAssessment] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    school: user?.school || '',
    targetUniversity: user?.targetUniversity || '',
    targetMajor: user?.targetMajor || '',
    targetType: user?.targetType || 'PTN' as 'PTN' | 'Sekdin',
    goals: user?.goals || ''
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  // FIX: handleSave tidak menyertakan email (tidak bisa diubah)
  const handleSave = () => {
    updateProfile({
      name: formData.name,
      phone: formData.phone,
      school: formData.school,
      targetUniversity: formData.targetUniversity,
      targetMajor: formData.targetMajor,
      targetType: formData.targetType,
      goals: formData.goals
    });
    setIsEditing(false);
  };

  const handlePasswordChange = async () => {
    setPasswordError('');
    setPasswordSuccess(false);

    if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Semua field password harus diisi!');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Password baru tidak cocok!');
      return;
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password minimal 8 karakter!');
      return;
    }

    try {
      await changePassword(passwordData.oldPassword, passwordData.newPassword);
      setPasswordSuccess(true);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        setPasswordSuccess(false);
        setShowPasswordModal(false);
      }, 2000);
    } catch (error: any) {
      setPasswordError(error.message || 'Password lama tidak sesuai!');
    }
  };

  // FIX: handleAssessmentSave sekarang menyertakan school
  const handleAssessmentSave = () => {
    updateProfile({
      phone: formData.phone,
      school: formData.school,
      targetUniversity: formData.targetUniversity,
      targetMajor: formData.targetMajor,
      targetType: formData.targetType,
      goals: formData.goals
    });
    setShowAssessment(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const joinDate = React.useMemo(() => {
    const raw = localStorage.getItem('all_users');
    if (raw) {
      const users = JSON.parse(raw);
      const found = users.find((u: any) => u.email === user?.email);
      if (found?.joinDate) return found.joinDate;
    }
    return user?.joinDate || new Date().toISOString().split('T')[0];
  }, [user?.email]);

  const streakData = React.useMemo(() => {
    const raw = localStorage.getItem('streak_data');
    return raw ? JSON.parse(raw) : { streak: 0 };
  }, []);
  const streak = streakData.streak;

  const tryOutsDone = React.useMemo(() => {
    const raw = localStorage.getItem('completed_tryouts');
    return raw ? JSON.parse(raw).length : 0;
  }, []);

  if (!user) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile & Pengaturan</h1>
        <p className="text-gray-600">Kelola informasi akun dan preferensi kamu</p>
      </motion.div>

      {/* Alert - Profile Not Completed */}
      {!user.profileCompleted && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300">
            <CardContent className="pt-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 flex-shrink-0 rounded-full bg-yellow-500 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-gray-900 mb-2">Lengkapi Profil Kamu</h4>
                  <p className="text-sm text-gray-700 mb-4">
                    Data profil yang lengkap membantu kami memberikan rekomendasi pembelajaran yang lebih personal!
                  </p>
                  <Button variant="primary" size="sm" onClick={() => setShowAssessment(true)}>
                    Lengkapi Sekarang
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left - Profile Card */}
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <div
                    className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center text-white text-4xl font-bold mx-auto cursor-pointer"
                    onClick={() => photoInputRef.current?.click()}
                  >
                    {photoUrl
                      ? <img src={photoUrl} alt="Foto Profil" className="w-full h-full object-cover" />
                      : user.name.charAt(0).toUpperCase()
                    }
                  </div>
                  <button
                    onClick={() => photoInputRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-[#2563EB] rounded-full flex items-center justify-center text-white hover:bg-[#1d4ed8] transition-all shadow-md"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                </div>
                <p className="text-xs text-gray-400 mb-2">Klik foto untuk mengganti</p>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{user.name}</h2>
                <p className="text-sm text-gray-600 mb-4">{user.email}</p>
                {user.hasPurchasedPackage && user.packageType ? (
                  <Badge variant={user.packageType === 'PTN Premium' ? 'blue' : user.packageType === 'SKD' ? 'purple' : 'yellow'}>
                    {user.packageType}
                  </Badge>
                ) : (
                  <Badge variant="gray">Belum Berlangganan</Badge>
                )}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">Bergabung</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900">
                    {new Date(joinDate).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="text-sm">Profil Lengkap</span>
                  </div>
                  {user.profileCompleted ? (
                    <span className="text-sm font-semibold text-green-600">✓ Selesai</span>
                  ) : (
                    <span className="text-sm font-semibold text-yellow-600">Belum</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-gray-600">
                    <Package className="w-5 h-5" />
                    <span className="text-sm">Status Paket</span>
                  </div>
                  {user.hasPurchasedPackage ? (
                    <span className="text-sm font-semibold text-green-600">Aktif</span>
                  ) : (
                    <span className="text-sm font-semibold text-gray-400">Tidak Aktif</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {user.hasPurchasedPackage && user.packageType && (
            <Card className="bg-gradient-to-br from-blue-500 to-sky-600 text-white border-0">
              <CardContent className="pt-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center">
                    <Package className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="font-bold text-lg">Paket Aktif</h3>
                </div>
                <div className="mb-4">
                  <p className="text-2xl font-bold mb-1">{user.packageType}</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <p className="text-blue-100 text-sm">Status: Aktif</p>
                  </div>
                </div>
                <Link to="/paket">
                  <Button className="w-full bg-white text-blue-600 hover:bg-blue-50 font-semibold">Kelola Paket</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Informasi Lengkap</CardTitle>
                {!isEditing ? (
                  <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                    <Edit2 className="w-4 h-4 mr-2" />Edit
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        phone: user?.phone || '',
                        school: user?.school || '',
                        targetUniversity: user?.targetUniversity || '',
                        targetMajor: user?.targetMajor || '',
                        targetType: user?.targetType || 'PTN',
                        goals: user?.goals || ''
                      });
                    }}>Batal</Button>
                    <Button variant="primary" size="sm" onClick={handleSave}>
                      <Save className="w-4 h-4 mr-2" />Simpan
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Nama Lengkap - bisa diedit */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <User className="w-4 h-4" /><span>Nama Lengkap</span>
                    </label>
                    <Input name="name" value={formData.name} onChange={handleChange} disabled={!isEditing} />
                  </div>

                  {/* FIX: Email selalu disabled, tidak bisa diubah */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4" /><span>Email</span>
                      <span className="text-xs text-gray-400">(tidak dapat diubah)</span>
                    </label>
                    <Input name="email" type="email" value={user.email} disabled={true} className="bg-gray-50 text-gray-500" />
                  </div>

                  {/* Password */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Lock className="w-4 h-4" /><span>Password</span>
                    </label>
                    <div className="flex space-x-2">
                      <Input type="password" value="••••••••" disabled className="flex-1" />
                      {isEditing && (
                        <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)} className="whitespace-nowrap">
                          Ubah
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Asal Sekolah */}
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <School className="w-4 h-4" /><span>Asal Sekolah</span>
                    </label>
                    <Input name="school" placeholder="SMAN 1 Jakarta" value={formData.school} onChange={handleChange} disabled={!isEditing} />
                  </div>

                  {/* Nomor Telepon */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Phone className="w-4 h-4" /><span>Nomor Telepon</span>
                    </label>
                    <Input name="phone" type="tel" placeholder="08123456789" value={formData.phone} onChange={handleChange} disabled={!isEditing} />
                  </div>

                  {/* Jalur Tujuan */}
                  <div className="md:col-span-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                      <Target className="w-4 h-4" /><span>Jalur Tujuan</span>
                    </label>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-3">
                        <button type="button" onClick={() => setFormData({ ...formData, targetType: 'PTN' })}
                          className={`p-3 rounded-xl border-2 transition-all ${formData.targetType === 'PTN' ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <GraduationCap className={`w-5 h-5 mx-auto mb-1 ${formData.targetType === 'PTN' ? 'text-[#2563EB]' : 'text-gray-600'}`} />
                          <p className="font-semibold text-sm text-gray-900">PTN</p>
                        </button>
                        <button type="button" onClick={() => setFormData({ ...formData, targetType: 'Sekdin', targetMajor: '' })}
                          className={`p-3 rounded-xl border-2 transition-all ${formData.targetType === 'Sekdin' ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                          <Trophy className={`w-5 h-5 mx-auto mb-1 ${formData.targetType === 'Sekdin' ? 'text-[#2563EB]' : 'text-gray-600'}`} />
                          <p className="font-semibold text-sm text-gray-900">Sekolah Kedinasan</p>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        {formData.targetType === 'PTN' ? (
                          <div className="flex items-center space-x-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                            <GraduationCap className="w-5 h-5 text-[#2563EB]" />
                            <span className="font-semibold text-gray-900">PTN</span>
                          </div>
                        ) : formData.targetType === 'Sekdin' ? (
                          <div className="flex items-center space-x-2 px-4 py-3 bg-blue-50 rounded-xl border border-blue-200">
                            <Trophy className="w-5 h-5 text-[#2563EB]" />
                            <span className="font-semibold text-gray-900">Sekolah Kedinasan</span>
                          </div>
                        ) : (
                          <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-gray-500">Belum dipilih</div>
                        )}
                      </div>
                    )}
                  </div>

                  {(formData.targetType || (!isEditing && user.targetUniversity)) && (
                    <>
                      <div className={formData.targetType === 'PTN' ? '' : 'md:col-span-2'}>
                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                          <GraduationCap className="w-4 h-4" />
                          <span>{formData.targetType === 'PTN' ? 'Universitas Tujuan' : 'Sekolah Kedinasan Tujuan'}</span>
                        </label>
                        {isEditing && formData.targetType === 'PTN' ? (
                          <div className="relative">
                            <input type="text" placeholder="Cari universitas..."
                              value={univSearch || formData.targetUniversity}
                              onChange={e => { setUnivSearch(e.target.value); setShowUnivDropdown(true); setFormData({...formData, targetUniversity: e.target.value, targetMajor: ''}); }}
                              onFocus={() => setShowUnivDropdown(true)}
                              className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent outline-none" />
                            {showUnivDropdown && (
                              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
                                {searchUniversities(univSearch || formData.targetUniversity).slice(0, 8).map(u => (
                                  <button key={u.id} type="button"
                                    onClick={() => { setFormData({...formData, targetUniversity: u.name, targetMajor: ''}); setUnivSearch(''); setShowUnivDropdown(false); }}
                                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                                    <span className="font-semibold text-gray-900">{u.short}</span>
                                    <span className="text-gray-500 ml-2 text-xs">{u.name}</span>
                                  </button>
                                ))}
                                {searchUniversities(univSearch || formData.targetUniversity).length === 0 && (
                                  <p className="px-4 py-3 text-sm text-gray-400">Universitas tidak ditemukan</p>
                                )}
                              </div>
                            )}
                          </div>
                        ) : (
                          <Input name="targetUniversity" placeholder={formData.targetType === 'PTN' ? 'Universitas Indonesia' : 'STAN'}
                            value={formData.targetUniversity} onChange={handleChange} disabled={!isEditing} />
                        )}
                      </div>

                      {formData.targetType === 'PTN' && (
                        <div>
                          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                            <Target className="w-4 h-4" /><span>Program Studi Tujuan</span>
                          </label>
                          {isEditing ? (() => {
                            const selectedUni = universities.find(u => u.name === formData.targetUniversity || u.short === formData.targetUniversity);
                            const programs = selectedUni ? getPrograms(selectedUni.id) : [];
                            return programs.length > 0 ? (
                              <select value={formData.targetMajor} onChange={e => setFormData({...formData, targetMajor: e.target.value})}
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white">
                                <option value="">-- Pilih Program Studi --</option>
                                {['Saintek', 'Soshum', 'Campuran'].map(cat => {
                                  const filtered = programs.filter(p => p.category === cat);
                                  return filtered.length > 0 ? (
                                    <optgroup key={cat} label={cat}>
                                      {filtered.map(p => <option key={p.id} value={p.name}>{p.name} — {p.faculty}</option>)}
                                    </optgroup>
                                  ) : null;
                                })}
                              </select>
                            ) : (
                              <input type="text" placeholder="Ketik program studi tujuan" value={formData.targetMajor}
                                onChange={e => setFormData({...formData, targetMajor: e.target.value})}
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] outline-none" />
                            );
                          })() : (
                            <Input name="targetMajor" placeholder="Teknik Informatika" value={formData.targetMajor} onChange={handleChange} disabled={!isEditing} />
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                <div>
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-700 mb-2">
                    <Heart className="w-4 h-4" /><span>Harapan & Motivasi</span>
                  </label>
                  <textarea name="goals" rows={3} placeholder="Ceritakan apa motivasi dan harapanmu..."
                    value={formData.goals} onChange={handleChange} disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none disabled:bg-gray-50 disabled:text-gray-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal - Change Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Ubah Password</h3>
                <p className="text-sm text-gray-600 mt-1">Pastikan password baru aman dan mudah diingat</p>
              </div>
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(false); setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-2">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700">{passwordError}</p>
                </div>
              )}
              {passwordSuccess && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-start space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-green-700">Password berhasil diubah! 🎉</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Lama <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input type={showCurrentPassword ? "text" : "password"} placeholder="Masukkan password lama"
                    value={passwordData.oldPassword} onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password Baru <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input type={showNewPassword ? "text" : "password"} placeholder="Minimal 8 karakter"
                    value={passwordData.newPassword} onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Konfirmasi Password Baru <span className="text-red-500">*</span></label>
                <div className="relative">
                  <Input type={showConfirmPassword ? "text" : "password"} placeholder="Ulangi password baru"
                    value={passwordData.confirmPassword} onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })} />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700">
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <p className="text-xs text-blue-700">
                  💡 <strong>Tips:</strong> Gunakan kombinasi huruf besar, huruf kecil, angka, dan simbol untuk password yang lebih aman.
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(false); setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' }); }}>
                Batal
              </Button>
              <Button variant="primary" onClick={handlePasswordChange}
                disabled={!passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}>
                <Lock className="w-4 h-4 mr-2" />Ubah Password
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal - Lengkapi Profil */}
      {showAssessment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Lengkapi Profil Kamu</h3>
                <p className="text-sm text-gray-600 mt-1">Data ini membantu kami memberikan pengalaman terbaik</p>
              </div>
              <button onClick={() => setShowAssessment(false)}
                className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-all">
                <X className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* FIX: Tambah field Asal Sekolah */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <School className="w-4 h-4" /><span>Asal Sekolah</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input name="school" placeholder="SMAN 1 Jakarta" value={formData.school} onChange={handleChange} />
              </div>

              {/* Nomor Telepon */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Phone className="w-4 h-4" /><span>Nomor Telepon</span>
                  <span className="text-red-500">*</span>
                </label>
                <Input name="phone" type="tel" placeholder="08123456789" value={formData.phone} onChange={handleChange} />
              </div>

              {/* Jalur Tujuan */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Target className="w-4 h-4" /><span>Jalur Tujuan</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setFormData({ ...formData, targetType: 'PTN' })}
                    className={`p-4 rounded-xl border-2 transition-all ${formData.targetType === 'PTN' ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <GraduationCap className={`w-6 h-6 mx-auto mb-2 ${formData.targetType === 'PTN' ? 'text-[#2563EB]' : 'text-gray-600'}`} />
                    <p className="font-semibold text-gray-900">PTN</p>
                    <p className="text-xs text-gray-600 mt-1">SNBP, SNBT, Mandiri</p>
                  </button>
                  <button type="button" onClick={() => setFormData({ ...formData, targetType: 'Sekdin', targetMajor: '' })}
                    className={`p-4 rounded-xl border-2 transition-all ${formData.targetType === 'Sekdin' ? 'border-[#2563EB] bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <Trophy className={`w-6 h-6 mx-auto mb-2 ${formData.targetType === 'Sekdin' ? 'text-[#2563EB]' : 'text-gray-600'}`} />
                    <p className="font-semibold text-gray-900">Sekolah Kedinasan</p>
                    <p className="text-xs text-gray-600 mt-1">STAN, STIS, IPDN, dll</p>
                  </button>
                </div>
              </div>

              {formData.targetType && (
                <div className={formData.targetType === 'PTN' ? 'grid grid-cols-2 gap-4' : 'space-y-4'}>
                  <div>
                    <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                      <GraduationCap className="w-4 h-4" />
                      <span>{formData.targetType === 'PTN' ? 'Universitas Tujuan' : 'Sekolah Kedinasan'}</span>
                      <span className="text-red-500">*</span>
                    </label>
                    {formData.targetType === 'PTN' ? (
                      <div className="relative">
                        <input type="text" placeholder="Cari universitas..."
                          value={univSearch || formData.targetUniversity}
                          onChange={e => { setUnivSearch(e.target.value); setShowUnivDropdown(true); setFormData({...formData, targetUniversity: e.target.value, targetMajor: ''}); }}
                          onFocus={() => setShowUnivDropdown(true)}
                          className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] outline-none" />
                        {showUnivDropdown && (
                          <div className="absolute z-30 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                            {searchUniversities(univSearch || formData.targetUniversity).slice(0, 8).map(u => (
                              <button key={u.id} type="button"
                                onClick={() => { setFormData({...formData, targetUniversity: u.name, targetMajor: ''}); setUnivSearch(''); setShowUnivDropdown(false); }}
                                className="w-full text-left px-4 py-2.5 text-sm hover:bg-blue-50 transition-colors border-b border-gray-50 last:border-0">
                                <span className="font-semibold text-gray-900">{u.short}</span>
                                <span className="text-gray-500 ml-2 text-xs">{u.name}</span>
                              </button>
                            ))}
                            {searchUniversities(univSearch || formData.targetUniversity).length === 0 && (
                              <p className="px-4 py-3 text-sm text-gray-400">Tidak ditemukan</p>
                            )}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Input name="targetUniversity" placeholder="STAN / STIS / IPDN / STIN"
                        value={formData.targetUniversity} onChange={handleChange} />
                    )}
                  </div>

                  {formData.targetType === 'PTN' && (
                    <div>
                      <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                        <Target className="w-4 h-4" /><span>Program Studi</span>
                        <span className="text-red-500">*</span>
                      </label>
                      {(() => {
                        const selectedUni = universities.find(u => u.name === formData.targetUniversity || u.short === formData.targetUniversity);
                        const programs = selectedUni ? getPrograms(selectedUni.id) : [];
                        return programs.length > 0 ? (
                          <select value={formData.targetMajor} onChange={e => setFormData({...formData, targetMajor: e.target.value})}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] outline-none bg-white">
                            <option value="">-- Pilih Program Studi --</option>
                            {['Saintek', 'Soshum', 'Campuran'].map(cat => {
                              const filtered = programs.filter(p => p.category === cat);
                              return filtered.length > 0 ? (
                                <optgroup key={cat} label={cat}>
                                  {filtered.map(p => <option key={p.id} value={p.name}>{p.name} — {p.faculty}</option>)}
                                </optgroup>
                              ) : null;
                            })}
                          </select>
                        ) : (
                          <input type="text" placeholder="Ketik program studi" value={formData.targetMajor}
                            onChange={e => setFormData({...formData, targetMajor: e.target.value})}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] outline-none" />
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* Goals */}
              <div>
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 mb-2">
                  <Heart className="w-4 h-4" /><span>Harapan & Motivasi</span>
                  <span className="text-red-500">*</span>
                </label>
                <textarea name="goals" rows={4}
                  placeholder="Ceritakan apa motivasi dan harapanmu dalam mengikuti program ini..."
                  value={formData.goals} onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all resize-none" />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex justify-end space-x-3">
              <Button variant="ghost" onClick={() => setShowAssessment(false)}>Nanti Saja</Button>
              <Button variant="primary" onClick={handleAssessmentSave}
                disabled={!formData.school || !formData.phone || !formData.targetType || !formData.targetUniversity || !formData.goals}>
                <Save className="w-4 h-4 mr-2" />Simpan Data
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}