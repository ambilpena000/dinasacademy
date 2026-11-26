import { dbConnectionOptions, describeDb, sslEnabled } from './db-connection';

describe('db-connection', () => {
  it('DATABASE_URL dengan sslmode=require → SSL aktif', () => {
    const env = { DATABASE_URL: 'postgresql://u:rahasia@ep-a.ap-southeast-1.aws.neon.tech/neondb?sslmode=require' };
    const o: any = dbConnectionOptions(env);
    expect(o.url).toBe(env.DATABASE_URL);
    expect(o.ssl).toEqual({ rejectUnauthorized: false });
    expect(describeDb(env)).toBe('ep-a.ap-southeast-1.aws.neon.tech/neondb'); // tanpa password
  });

  it('DB_HOST lokal → tanpa SSL kecuali DB_SSL=true', () => {
    const o: any = dbConnectionOptions({ DB_HOST: 'localhost', DB_NAME: 'x' });
    expect(o.host).toBe('localhost');
    expect(o.ssl).toBe(false);
    expect(sslEnabled({ DB_SSL: 'true' })).toBe(true);
    expect(sslEnabled({ DATABASE_URL: 'postgresql://a@b/c?sslmode=require', DB_SSL: 'false' })).toBe(false);
  });
});
