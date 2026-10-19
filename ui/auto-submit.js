/**
 * auto-submit.js — Submit jurnal hari ini ke siprakerin secara otomatis
 * Jalankan: node auto-submit.js
 * Atau lewat Task Scheduler setiap pagi
 */

const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const { login, supabase } = require('./src/auth');
const { getStudentDetails, submitJournal, checkKemarinIzin } = require('./src/journal');
const { getRandomActivity } = require('./src/utils');

const TODAY = (() => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
})();

// Hari: 0=Minggu, 1=Senin, ..., 6=Sabtu
const DAY_OF_WEEK = new Date().getDay();
const IS_WEEKEND = DAY_OF_WEEK === 0 || DAY_OF_WEEK === 6;

async function refreshCookieToken() {
    // Coba refresh via Supabase session refresh dulu
    const { data, error } = await supabase.auth.refreshSession();
    if (!error && data.session) {
        const newToken = `base64-${Buffer.from(JSON.stringify({
            access_token: data.session.access_token,
            token_type: 'bearer',
            expires_in: 3600,
            expires_at: data.session.expires_at,
            refresh_token: data.session.refresh_token,
            user: data.session.user
        })).toString('base64')}`;
        console.log('[token] Session refreshed successfully');
        return { accessToken: data.session.access_token, cookieToken: newToken };
    }

    // Fallback: login ulang dengan email/password
    console.log('[token] Refresh failed, logging in with email/password...');
    const { createClient } = require('@supabase/supabase-js');
    const config = require('./src/config');
    const freshClient = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);
    const { data: loginData, error: loginError } = await freshClient.auth.signInWithPassword({
        email: config.EMAIL,
        password: config.PASSWORD
    });

    if (loginError || !loginData.session) {
        throw new Error(`Login failed: ${loginError?.message}`);
    }

    const newToken = `base64-${Buffer.from(JSON.stringify({
        access_token: loginData.session.access_token,
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: loginData.session.expires_at,
        refresh_token: loginData.session.refresh_token,
        user: loginData.session.user
    })).toString('base64')}`;

    console.log('[token] Fresh login successful');
    return { accessToken: loginData.session.access_token, cookieToken: newToken };
}

async function submitViaAPI(tanggal, kegiatan, keterangan, id_kelas, id_industri, cookieToken) {
    const res = await fetch('https://www.siprakerin.com/api/siswa/jurnal', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Cookie': `sb-supabase-auth-token=${cookieToken}`,
            'Origin': 'https://www.siprakerin.com',
            'Referer': 'https://www.siprakerin.com/siswa/kehadiran/jurnal/add',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        body: JSON.stringify({ tanggal, kegiatan, keterangan, id_kelas, id_industri })
    });

    const text = await res.text();
    let json;
    try { json = JSON.parse(text); } catch { json = { raw: text }; }

    return { status: res.status, body: json };
}

async function run() {
    console.log(`\n=== AUTO-SUBMIT JURNAL ===`);
    console.log(`Tanggal: ${TODAY}`);
    console.log(`Hari: ${['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'][DAY_OF_WEEK]}`);

    if (IS_WEEKEND) {
        // Weekend tetap submit dengan keterangan libur
        console.log('[skip] Hari ini weekend — submit libur');
    }

    try {
        // Login
        console.log('\n[1] Login...');
        const { user } = await login();
        console.log('[1] Login berhasil:', user.email);

        // Ambil student details
        console.log('\n[2] Ambil data siswa...');
        const details = await getStudentDetails(user);
        console.log('[2] Siswa:', details.nama, '| Kelas:', details.nama_kelas);

        const studentIds = {
            id_siswa: details.id_siswa,
            id_kelas: details.id_kelas,
            id_industri: details.id_industri
        };

        if (!studentIds.id_siswa || !studentIds.id_kelas || !studentIds.id_industri) {
            throw new Error('ID siswa/kelas/industri tidak lengkap. Cek .env');
        }

        // Refresh cookie token
        console.log('\n[3] Refresh token...');
        const tokenData = await refreshCookieToken();
        const cookieToken = tokenData?.cookieToken || process.env.SUPABASE_COOKIE_TOKEN;

        if (!cookieToken) {
            throw new Error('Cookie token tidak ada. Update SUPABASE_COOKIE_TOKEN di .env');
        }

        // Tentukan keterangan
        const keterangan = IS_WEEKEND ? 'libur' : 'hadir';
        let kegiatan = IS_WEEKEND ? 'Libur akhir pekan' : getRandomActivity();

        // Cek izin lanjutan
        if (keterangan === 'hadir') {
            const izinKemarin = await checkKemarinIzin(studentIds.id_siswa, TODAY);
            if (izinKemarin) {
                console.log('[info] Kemarin izin — skip auto-submit (mungkin perlu izin lanjutan manual)');
                process.exit(0);
            }
        }

        // Submit via siprakerin API
        console.log(`\n[4] Submit jurnal: ${TODAY} | ${keterangan} | "${kegiatan}"`);
        const result = await submitViaAPI(
            TODAY, kegiatan, keterangan,
            studentIds.id_kelas, studentIds.id_industri,
            cookieToken
        );

        console.log(`[4] API status: ${result.status}`);
        console.log(`[4] API response:`, JSON.stringify(result.body));

        if (result.status === 200 || result.status === 201) {
            console.log('\n✅ JURNAL BERHASIL DISUBMIT!');
            console.log(`   Tanggal : ${TODAY}`);
            console.log(`   Status  : ${keterangan}`);
            console.log(`   Kegiatan: ${kegiatan}`);
        } else if (result.body?.error === 'Duplicate' || result.body?.message?.toLowerCase().includes('sudah ada') || result.body?.message?.toLowerCase().includes('duplicate')) {
            console.log('\n⚠️  Jurnal hari ini sudah ada — tidak perlu submit ulang.');
        } else if (result.body?.error === 'Date Too Old' || result.body?.message?.toLowerCase().includes('hari ini')) {
            // Kemungkinan jurnal sudah ada (API siprakerin kadang return error ini untuk duplicate)
            console.log('\n⚠️  API response:', result.body?.message);
            console.log('   Kemungkinan jurnal hari ini sudah ada. Cek di web siprakerin.');
        } else {
            console.error('\n❌ Submit gagal:', result.body?.message || JSON.stringify(result.body));
            process.exit(1);
        }

    } catch (err) {
        console.error('\n❌ Error:', err.message);
        process.exit(1);
    }
}

run();
