// production-check.ts — Validasi konfigurasi sensitif.
// Di production backend MENOLAK start jika secret masih bawaan/lemah,
// supaya server tidak pernah berjalan dengan kredensial yang diketahui publik.

const KNOWN_WEAK_SECRETS = new Set([
  'dinasacademy_secret',
  'ganti_secret_ini_di_production',
  'super_secret_jwt_key_dinas_academy_2026',
  'secret', 'changeme', 'jwt_secret',
]);
const KNOWN_WEAK_DB_PASSWORDS = new Set(['', 'changeme', 'postgres', 'password', 'admin', '123456']);
const DEV_JWT_SECRET = 'dev_only_dinasacademy_secret_tidak_untuk_production';

export const isProduction = () => (process.env.NODE_ENV || 'development') === 'production';

/** JWT secret yang dipakai auth. Development boleh fallback; production wajib kuat. */
export function getJwtSecret(value: string | undefined = process.env.JWT_SECRET): string {
  if (value && value.trim()) return value;
  if (isProduction()) throw new Error('JWT_SECRET wajib diisi di production');
  return DEV_JWT_SECRET;
}

/** Daftar masalah konfigurasi production (kosong = aman). */
export function productionConfigProblems(env: NodeJS.ProcessEnv = process.env): string[] {
  const problems: string[] = [];
  const jwt = env.JWT_SECRET || '';
  if (!jwt) problems.push('JWT_SECRET belum diisi');
  else if (KNOWN_WEAK_SECRETS.has(jwt) || jwt.length < 32) {
    problems.push('JWT_SECRET terlalu lemah/bawaan — gunakan minimal 32 karakter acak');
  }
  if (KNOWN_WEAK_DB_PASSWORDS.has(env.DB_PASSWORD || '')) {
    problems.push('DB_PASSWORD kosong atau bawaan — gunakan password yang kuat');
  }
  if (!env.FRONTEND_URL || /localhost|127\.0\.0\.1/.test(env.FRONTEND_URL)) {
    problems.push('FRONTEND_URL harus berisi domain website (mis. https://dinasacademy.com)');
  }
  return problems;
}

export function assertProductionConfig() {
  if (!isProduction()) return;
  const problems = productionConfigProblems();
  if (problems.length) {
    throw new Error(
      'Konfigurasi production tidak aman:\n  - ' + problems.join('\n  - ') +
      '\nBuat secret acak dengan: node -e "console.log(require(\'crypto\').randomBytes(48).toString(\'hex\'))"',
    );
  }
}
