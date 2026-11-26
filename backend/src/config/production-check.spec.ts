import { productionConfigProblems } from './production-check';

const good = {
  JWT_SECRET: 'a'.repeat(16) + 'b8f3c1d9e7a2f6b4c0d8e2a9f1b7c3d5',
  DB_PASSWORD: 'Kuat#Sekali-2026!',
  FRONTEND_URL: 'https://dinasacademy.com',
} as NodeJS.ProcessEnv;

describe('productionConfigProblems', () => {
  it('konfigurasi kuat: tidak ada masalah', () => {
    expect(productionConfigProblems(good)).toEqual([]);
  });

  it('menolak JWT_SECRET kosong, bawaan, atau pendek', () => {
    expect(productionConfigProblems({ ...good, JWT_SECRET: '' })).toHaveLength(1);
    expect(productionConfigProblems({ ...good, JWT_SECRET: 'dinasacademy_secret' })).toHaveLength(1);
    expect(productionConfigProblems({ ...good, JWT_SECRET: 'ganti_secret_ini_di_production' })).toHaveLength(1);
    expect(productionConfigProblems({ ...good, JWT_SECRET: 'pendek123' })).toHaveLength(1);
  });

  it('menolak password database bawaan', () => {
    expect(productionConfigProblems({ ...good, DB_PASSWORD: 'changeme' })).toHaveLength(1);
    expect(productionConfigProblems({ ...good, DB_PASSWORD: '' })).toHaveLength(1);
  });

  it('menolak FRONTEND_URL localhost', () => {
    expect(productionConfigProblems({ ...good, FRONTEND_URL: 'http://localhost:80' })).toHaveLength(1);
  });
});
