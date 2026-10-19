const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const requiredEnv = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'EMAIL',
    'PASSWORD'
];

const config = {};

requiredEnv.forEach((key) => {
    if (!process.env[key]) {
        console.error(`Dibutuhkan variabel key: ${key}`);
        process.exit(1);
    }
    config[key] = process.env[key];
});

config.ID_SISWA = process.env.ID_SISWA;
config.ID_KELAS = process.env.ID_KELAS;
config.ID_INDUSTRI = process.env.ID_INDUSTRI;
config.SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN || null;
config.SUPABASE_REFRESH_TOKEN = process.env.SUPABASE_REFRESH_TOKEN || null;
config.SUPABASE_COOKIE_TOKEN = process.env.SUPABASE_COOKIE_TOKEN || null;

module.exports = config;
