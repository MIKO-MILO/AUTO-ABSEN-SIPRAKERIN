const { createClient } = require('@supabase/supabase-js');
const config = require('./config');

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_ANON_KEY);

async function login() {
    // Jika ada SUPABASE_ACCESS_TOKEN di .env, langsung pakai (diambil dari cookie browser)
    if (config.SUPABASE_ACCESS_TOKEN) {
        console.log('[auth] Using SUPABASE_ACCESS_TOKEN from .env (cookie-based token)');
        const { data: { user }, error } = await supabase.auth.getUser(config.SUPABASE_ACCESS_TOKEN);
        if (error) {
            console.warn('[auth] Cookie token invalid or expired, falling back to email/password login...');
        } else {
            await supabase.auth.setSession({
                access_token: config.SUPABASE_ACCESS_TOKEN,
                refresh_token: config.SUPABASE_REFRESH_TOKEN || ''
            });
            return {
                token: config.SUPABASE_ACCESS_TOKEN,
                user
            };
        }
    }

    try {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: config.EMAIL,
            password: config.PASSWORD,
        });

        if (error) throw error;

        return {
            token: data.session.access_token,
            user: data.user
        };
    } catch (error) {
        console.error('Login failed:', error.message);
        throw error;
    }
}

module.exports = { login, supabase };
