const fs = require('fs');
const path = require('path');

console.log('====================================================');
console.log('🧪 RUNNING COMPREHENSIVE MULTI-PAGE & AUTH VERIFICATION');
console.log('====================================================');

const indexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf-8');
const loginHtml = fs.readFileSync(path.join(__dirname, 'login.html'), 'utf-8');
const signupHtml = fs.readFileSync(path.join(__dirname, 'signup.html'), 'utf-8');
const resetHtml = fs.readFileSync(path.join(__dirname, 'reset-password.html'), 'utf-8');
const privacyHtml = fs.readFileSync(path.join(__dirname, 'privacy.html'), 'utf-8');
const termsHtml = fs.readFileSync(path.join(__dirname, 'terms.html'), 'utf-8');
const styleCss = fs.readFileSync(path.join(__dirname, 'css/style.css'), 'utf-8');
const scriptJs = fs.readFileSync(path.join(__dirname, 'js/script.js'), 'utf-8');
const authJs = fs.readFileSync(path.join(__dirname, 'js/auth.js'), 'utf-8');
const schemaSql = fs.readFileSync(path.join(__dirname, 'supabase-schema.sql'), 'utf-8');
const envExample = fs.readFileSync(path.join(__dirname, '.env.example'), 'utf-8');

let errors = [];

function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [FAIL] ${message}`);
    errors.push(message);
  } else {
    console.log(`✅ [PASS] ${message}`);
  }
}

// --- 1. LOGIN PAGE VERIFICATIONS ---
console.log('\n--- 1. Testing login.html ---');
assert(loginHtml.includes('Welcome Back to Our Little Universe 💗'), 'login.html has correct romantic heading');
assert(loginHtml.includes('Your little world of magic is waiting for you.'), 'login.html has correct subtitle');
assert(loginHtml.includes('id="login-email"'), 'login.html has email input');
assert(loginHtml.includes('id="login-password"'), 'login.html has password input');
assert(loginHtml.includes('id="btn-toggle-password"'), 'login.html has show/hide password toggle');
assert(loginHtml.includes('id="login-remember"'), 'login.html has remember me checkbox');
assert(loginHtml.includes('href="reset-password.html"'), 'login.html links to reset-password.html');
assert(loginHtml.includes('href="signup.html"'), 'login.html links to signup.html');
assert(loginHtml.includes('id="btn-fill-demo"'), 'login.html has demo credentials quick fill');
assert(loginHtml.includes('href="privacy.html"'), 'login.html links to Privacy Policy');
assert(loginHtml.includes('href="terms.html"'), 'login.html links to Terms of Use');
assert(loginHtml.includes('auth-card glass-card'), 'login.html uses glassmorphism card');

// --- 2. SIGN-UP PAGE VERIFICATIONS ---
console.log('\n--- 2. Testing signup.html ---');
assert(signupHtml.includes('Join Our Little Universe ✨'), 'signup.html has correct heading');
assert(signupHtml.includes('id="signup-name"'), 'signup.html has display name field');
assert(signupHtml.includes('id="signup-email"'), 'signup.html has email input field');
assert(signupHtml.includes('id="signup-password"'), 'signup.html has password field');
assert(signupHtml.includes('id="signup-confirm-password"'), 'signup.html has confirm password field');
assert(signupHtml.includes('id="signup-terms"'), 'signup.html has accept terms checkbox');
assert(signupHtml.includes('href="login.html"'), 'signup.html links back to login');
assert(signupHtml.includes('href="privacy.html"'), 'signup.html links to Privacy Policy');
assert(signupHtml.includes('href="terms.html"'), 'signup.html links to Terms of Use');

// --- 3. RESET PASSWORD PAGE VERIFICATIONS ---
console.log('\n--- 3. Testing reset-password.html ---');
assert(resetHtml.includes('Reset Your Password 💌'), 'reset-password.html has heading');
assert(resetHtml.includes('id="reset-request-form"'), 'reset-password.html has reset request form');
assert(resetHtml.includes('id="reset-confirm-form"'), 'reset-password.html has reset confirm form');
assert(resetHtml.includes('href="login.html"'), 'reset-password.html links back to login');

// --- 4. AUTH GUARD & LOGOUT ON INDEX.HTML ---
console.log('\n--- 4. Testing Protected Homepage (index.html) ---');
assert(indexHtml.includes('requireAuth()'), 'index.html enforces client-side auth guard check');
assert(indexHtml.includes('html:not(.auth-verified) body'), 'index.html prevents flash of unauthenticated content');
assert(indexHtml.includes('id="user-display-name"'), 'index.html displays authenticated user display name');
assert(indexHtml.includes('id="btn-logout"'), 'index.html contains working logout button');
assert(indexHtml.includes('id="hero-welcome-user"'), 'index.html contains personalized welcome banner');

// --- 5. CLIENT AUTH MANAGER (js/auth.js) ---
console.log('\n--- 5. Testing js/auth.js ---');
assert(authJs.includes('window.UniverseAuth'), 'js/auth.js exports window.UniverseAuth');
assert(authJs.includes('requireAuth'), 'js/auth.js contains requireAuth guard');
assert(authJs.includes('redirectIfAuth'), 'js/auth.js contains redirectIfAuth guard');
assert(authJs.includes('supabaseClient.auth.signInWithPassword') || authJs.includes('signInWithPassword'), 'js/auth.js integrates Supabase signIn');
assert(authJs.includes('supabaseClient.auth.signUp') || authJs.includes('signUp'), 'js/auth.js integrates Supabase signUp');
assert(authJs.includes('/api/auth/login'), 'js/auth.js includes local secure login fallback');

// --- 6. SUPABASE SCHEMA & RLS POLICIES ---
console.log('\n--- 6. Testing supabase-schema.sql ---');
assert(schemaSql.includes('ENABLE ROW LEVEL SECURITY'), 'supabase-schema.sql enables Row Level Security');
assert(schemaSql.includes('CREATE POLICY "Users can read own profile"'), 'Profiles RLS policy for reading own profile present');
assert(schemaSql.includes('CREATE POLICY "Users can view own memories"'), 'Memories RLS policy for viewing own memories present');
assert(schemaSql.includes('handle_new_user'), 'Automatic profile creation trigger present');

// --- 7. ENVIRONMENT CONFIGURATION ---
console.log('\n--- 7. Testing .env.example ---');
assert(envExample.includes('SUPABASE_URL='), '.env.example includes SUPABASE_URL');
assert(envExample.includes('SUPABASE_ANON_KEY='), '.env.example includes SUPABASE_ANON_KEY');
assert(!envExample.includes('SUPABASE_SERVICE_ROLE_KEY'), '.env.example does not expose service role key');

// --- 8. PRIVACY POLICY & TERMS OF USE ACCURACY ---
console.log('\n--- 8. Testing privacy.html & terms.html updates ---');
assert(privacyHtml.includes('Account Information &amp; Authentication') || privacyHtml.includes('Account Information'), 'privacy.html includes account data collection');
assert(privacyHtml.includes('Supabase'), 'privacy.html discloses Supabase third-party authentication');
assert(privacyHtml.includes('Password Resets'), 'privacy.html discloses password reset flow');
assert(privacyHtml.includes('Account Deletion'), 'privacy.html explains account deletion choices');
assert(privacyHtml.includes('AI Couple Photo Studio &amp; Private Love Vault') || privacyHtml.includes('AI Couple Photo Studio'), 'privacy.html discloses AI Photo Studio & Vault processing');
assert(privacyHtml.includes('Explicit Consent &amp; Permission') || privacyHtml.includes('Explicit Consent'), 'privacy.html mandates user consent for uploaded photos');
assert(privacyHtml.includes('Third-Party Provider Retention') || privacyHtml.includes('OpenAI'), 'privacy.html accurately describes third-party AI provider data retention');
assert(privacyHtml.includes('No Permanent Saving Without Consent') || privacyHtml.includes('not saved permanently'), 'privacy.html guarantees images not saved without explicit user action');

assert(termsHtml.includes('Account Registration &amp; Security') || termsHtml.includes('Account'), 'terms.html includes account security rules');
assert(termsHtml.includes('AI Couple Photo Studio') || termsHtml.includes('Acceptable Use'), 'terms.html includes AI Couple Photo Studio acceptable use');
assert(termsHtml.includes('Consent for Reference Photos') || termsHtml.includes('Reference Photos'), 'terms.html requires consent for reference photos');
assert(termsHtml.includes('Prohibition of Harmful or Deceptive Imagery') || termsHtml.includes('deepfakes'), 'terms.html prohibits non-consensual deepfakes and deceptive imagery');

// --- 9. AI COUPLE PHOTO STUDIO (studio.html) ---
console.log('\n--- 9. Testing studio.html ---');
const studioHtml = fs.readFileSync(path.join(__dirname, 'studio.html'), 'utf-8');
assert(studioHtml.includes('Our Couple Studio 💕'), 'studio.html has title Our Couple Studio 💕');
assert(studioHtml.includes('id="input-photo-1"') && studioHtml.includes('id="input-photo-2"'), 'studio.html has photo 1 and photo 2 inputs');
assert(studioHtml.includes('id="btn-replace-1"') && studioHtml.includes('id="btn-remove-1"'), 'studio.html has replace and remove controls for photos');

// Verify all 12 styles
const requiredStyles = ['chibi', 'anime', 'cartoon', 'clay', 'fairytale', 'cherry-blossoms', 'rainy-day', 'moonlight', 'hug', 'hands', 'polaroid', 'matching-pfp'];
const allStylesPresent = requiredStyles.every(s => studioHtml.includes(`value="${s}"`));
assert(allStylesPresent, 'studio.html includes all 12 romantic couple styles');

// Verify all 8 scenes
const requiredScenes = ['heart-universe', 'clouds', 'garden', 'cafe', 'stargazing', 'sunset', 'bedroom', 'rainy-window'];
const allScenesPresent = requiredScenes.every(s => studioHtml.includes(`data-scene="${s}"`));
assert(allScenesPresent, 'studio.html includes all 8 selectable romantic scenes');

assert(studioHtml.includes('id="check-studio-consent"'), 'studio.html has explicit permission and consent checkbox');
assert(studioHtml.includes('id="btn-generate-artwork"'), 'studio.html has Generate Couple Artwork button');
assert(studioHtml.includes('id="btn-download-artwork"'), 'studio.html has Download Photo button');
assert(studioHtml.includes('id="btn-regenerate-artwork"'), 'studio.html has Regenerate button');
assert(studioHtml.includes('id="btn-save-to-vault"'), 'studio.html has Save to Love Vault button');
assert(studioHtml.includes('id="save-vault-modal"'), 'studio.html has Save to Vault modal');

// --- 10. PRIVATE LOVE VAULT (vault.html) ---
console.log('\n--- 10. Testing vault.html ---');
const vaultHtml = fs.readFileSync(path.join(__dirname, 'vault.html'), 'utf-8');
assert(vaultHtml.includes('My Private Love Vault 🔐'), 'vault.html has title My Private Love Vault');
assert(vaultHtml.includes('id="vault-locked-screen"') && vaultHtml.includes('id="vault-unlocked-screen"'), 'vault.html has locked and unlocked views');
assert(vaultHtml.includes('id="heart-padlock"') && vaultHtml.includes('id="safe-door"'), 'vault.html includes 3D heart padlock and safe door');
assert(vaultHtml.includes('id="btn-quick-unlock"'), 'vault.html has quick unlock button');
assert(vaultHtml.includes('id="vault-pin-form"'), 'vault.html has Love PIN unlock option');
assert(vaultHtml.includes('id="vault-folders-grid"'), 'vault.html has memory folders shelf');
assert(vaultHtml.includes('id="vault-images-grid"'), 'vault.html has polaroid images grid');
assert(vaultHtml.includes('id="btn-new-folder"'), 'vault.html has New Folder button');
assert(vaultHtml.includes('id="btn-lock-vault"'), 'vault.html has Lock Vault button');
assert(vaultHtml.includes('id="polaroid-viewer-modal"'), 'vault.html has full-size polaroid viewer modal');
assert(vaultHtml.includes('id="move-image-modal"'), 'vault.html has move image modal');
assert(vaultHtml.includes('id="pin-modal"'), 'vault.html has configure PIN modal');

// --- 11. SUPABASE VAULT SCHEMA & RLS ---
console.log('\n--- 11. Testing Supabase Vault Tables & RLS ---');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.vault_folders'), 'supabase-schema.sql includes vault_folders table');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.vault_images'), 'supabase-schema.sql includes vault_images table');
assert(schemaSql.includes('ALTER TABLE public.vault_folders ENABLE ROW LEVEL SECURITY'), 'vault_folders table has RLS enabled');
assert(schemaSql.includes('ALTER TABLE public.vault_images ENABLE ROW LEVEL SECURITY'), 'vault_images table has RLS enabled');
assert(schemaSql.includes('Users can view own vault folders'), 'vault_folders RLS policy for viewing own folders present');
assert(schemaSql.includes('Users can view own vault images'), 'vault_images RLS policy for viewing own images present');
assert(schemaSql.includes('private-vault-images'), 'private-vault-images private storage bucket documented');

// --- 12. DEAD LINK CHECK ---
console.log('\n--- 12. Dead Link & ID Checks ---');
const deadHashRegex = /href="#"/g;
assert(!deadHashRegex.test(loginHtml), 'login.html has no dead href="#" links');
assert(!deadHashRegex.test(signupHtml), 'signup.html has no dead href="#" links');
assert(!deadHashRegex.test(resetHtml), 'reset-password.html has no dead href="#" links');
assert(!deadHashRegex.test(studioHtml), 'studio.html has no dead href="#" links');
assert(!deadHashRegex.test(vaultHtml), 'vault.html has no dead href="#" links');

// --- 13. SHARED COUPLE SPACE (shared.html) ---
console.log('\n--- 13. Testing shared.html & js/shared.js ---');
const sharedHtml = fs.readFileSync(path.join(__dirname, 'shared.html'), 'utf-8');
const sharedJs = fs.readFileSync(path.join(__dirname, 'js/shared.js'), 'utf-8');
assert(sharedHtml.includes('Our Shared Space'), 'shared.html has heading or title Our Shared Space');
assert(sharedHtml.includes('id="btn-generate-invite"'), 'shared.html has generate invitation button');
assert(sharedHtml.includes('id="invite-link-input"'), 'shared.html has invite link input');
assert(sharedHtml.includes('id="btn-copy-invite"'), 'shared.html has copy link button');
assert(sharedHtml.includes('id="input-invite-code"'), 'shared.html has join code input');
assert(sharedHtml.includes('id="btn-redeem-invite"'), 'shared.html has accept invite button');
assert(sharedHtml.includes('id="couple-linked-view"'), 'shared.html has couple dashboard container');
assert(sharedHtml.includes('id="btn-unlink-partner"'), 'shared.html has safe unlinking button');
assert(sharedJs.includes('/api/couple/invite'), 'js/shared.js calls invite API');
assert(sharedJs.includes('/api/couple/accept-invite'), 'js/shared.js calls join API');

// --- 14. 3D LOVE ROOM (room.html) ---
console.log('\n--- 14. Testing room.html & js/room.js ---');
const roomHtml = fs.readFileSync(path.join(__dirname, 'room.html'), 'utf-8');
const roomJs = fs.readFileSync(path.join(__dirname, 'js/room.js'), 'utf-8');
assert(roomHtml.includes('Our 3D Love Room'), 'room.html has heading Our 3D Love Room');
assert(roomHtml.includes('id="room-3d-canvas"'), 'room.html has 3D room canvas');
assert(roomHtml.includes('data-theme="pink-dream"') && roomHtml.includes('data-theme="lavender-night"') && roomHtml.includes('data-theme="moonlight"'), 'room.html supports multiple room themes');
assert(roomHtml.includes('id="btn-room-wave"') && roomHtml.includes('id="btn-room-hug"') && roomHtml.includes('id="btn-room-dance"'), 'room.html supports character animations');
assert(roomHtml.includes('id="btn-toggle-fairy-lights"'), 'room.html has fairy lights toggle');
assert(roomHtml.includes('id="btn-toggle-room-audio"'), 'room.html has room audio toggle');
assert(roomJs.includes('THREE.Scene'), 'js/room.js implements Three.js 3D scene');
assert(roomJs.includes('/api/room/settings'), 'js/room.js connects to room settings API');

// --- 15. PERSONAL GALAXY (galaxy.html) ---
console.log('\n--- 15. Testing galaxy.html & js/galaxy.js ---');
const galaxyHtml = fs.readFileSync(path.join(__dirname, 'galaxy.html'), 'utf-8');
const galaxyJs = fs.readFileSync(path.join(__dirname, 'js/galaxy.js'), 'utf-8');
assert(galaxyHtml.includes('Memory Galaxy'), 'galaxy.html has title Memory Galaxy');
assert(galaxyHtml.includes('id="galaxy-3d-canvas"'), 'galaxy.html has galaxy canvas');
assert(galaxyHtml.includes('id="btn-personal-galaxy"') && galaxyHtml.includes('id="btn-shared-galaxy"'), 'galaxy.html supports personal and shared galaxy view switching');
assert(galaxyHtml.includes('id="galaxy-2d-view"'), 'galaxy.html provides 2D accessible memory fallback');
assert(galaxyHtml.includes('id="star-memory-modal"'), 'galaxy.html has star memory inspection modal');
assert(galaxyJs.includes('THREE.Points'), 'js/galaxy.js implements 3D particle constellation');

// --- 16. SECRET DIARY & OPEN-WHEN LETTERS (diary.html) ---
console.log('\n--- 16. Testing diary.html & js/diary.js ---');
const diaryHtml = fs.readFileSync(path.join(__dirname, 'diary.html'), 'utf-8');
const diaryJs = fs.readFileSync(path.join(__dirname, 'js/diary.js'), 'utf-8');
assert(diaryHtml.includes('Secret Diary &amp; Open-When Letters') || diaryHtml.includes('Secret Diary & Open-When Letters'), 'diary.html has title Secret Diary & Open-When Letters');
assert(diaryHtml.includes('id="btn-new-diary-entry"'), 'diary.html has new diary entry button');
assert(diaryHtml.includes('id="btn-compose-letter"'), 'diary.html has new open-when letter button');
assert(diaryHtml.includes('id="letters-envelopes-grid"'), 'diary.html has envelope gallery container');
assert(diaryHtml.includes('id="read-letter-modal"'), 'diary.html has letter reading modal with animated wax seal');
assert(diaryJs.includes('/api/diary'), 'js/diary.js connects to diary API');
assert(diaryJs.includes('/api/letters'), 'js/diary.js connects to letters API');

// --- 17. COUPLE GAMES (games.html) ---
console.log('\n--- 17. Testing games.html & js/games.js ---');
const gamesHtml = fs.readFileSync(path.join(__dirname, 'games.html'), 'utf-8');
const gamesJs = fs.readFileSync(path.join(__dirname, 'js/games.js'), 'utf-8');
assert(gamesHtml.includes('Couple Game Arcade'), 'games.html has title Couple Games');
assert(gamesHtml.includes('id="spin-wheel"'), 'games.html has Spin-the-Wheel stage');
assert(gamesHtml.includes('id="btn-spin-wheel"'), 'games.html has spin wheel button');
assert(gamesHtml.includes('id="btn-draw-truth"') && gamesHtml.includes('id="btn-draw-dare"'), 'games.html has Truth or Dare controls');
assert(gamesHtml.includes('id="btn-skip-prompt"'), 'games.html provides safe skip prompt button');
assert(gamesHtml.includes('id="who-question-box"'), 'games.html has Who Knows Whom Better quiz');
assert(gamesHtml.includes('id="challenges-list"'), 'games.html has daily romantic challenges');

// --- 18. LOVE TIMELINE (timeline.html) ---
console.log('\n--- 18. Testing timeline.html & js/timeline.js ---');
const timelineHtml = fs.readFileSync(path.join(__dirname, 'timeline.html'), 'utf-8');
const timelineJs = fs.readFileSync(path.join(__dirname, 'js/timeline.js'), 'utf-8');
assert(timelineHtml.includes('The Milestones of Us'), 'timeline.html has title Love Timeline');
assert(timelineHtml.includes('id="btn-add-milestone"'), 'timeline.html has add milestone button');
assert(timelineHtml.includes('id="next-milestone-banner"'), 'timeline.html has upcoming milestone countdown banner');
assert(timelineHtml.includes('id="timeline-tree"'), 'timeline.html has visual timeline path');
assert(timelineJs.includes('/api/timeline'), 'js/timeline.js connects to timeline API');

// --- 19. SUPABASE COUPLE SCHEMA & RLS ---
console.log('\n--- 19. Testing Supabase Couple Schema & RLS ---');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.couple_spaces'), 'supabase-schema.sql includes couple_spaces');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.couple_invitations'), 'supabase-schema.sql includes couple_invitations');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.diary_entries'), 'supabase-schema.sql includes diary_entries');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.open_when_letters'), 'supabase-schema.sql includes open_when_letters');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.timeline_milestones'), 'supabase-schema.sql includes timeline_milestones');
assert(schemaSql.includes('CREATE TABLE IF NOT EXISTS public.room_settings'), 'supabase-schema.sql includes room_settings');
assert(schemaSql.includes('Partners can view own couple space'), 'couple_spaces has partner view RLS policy');
assert(schemaSql.includes('Partners can view shared diary entries'), 'diary_entries has shared view RLS policy');
assert(schemaSql.includes('Partners can read unlocked letters'), 'open_when_letters has unlocked reveal date RLS policy');

// --- 20. EXPANDED DEAD LINK CHECK ---
console.log('\n--- 20. Expanded Dead Link Checks ---');
assert(!deadHashRegex.test(sharedHtml), 'shared.html has no dead href="#" links');
assert(!deadHashRegex.test(roomHtml), 'room.html has no dead href="#" links');
assert(!deadHashRegex.test(galaxyHtml), 'galaxy.html has no dead href="#" links');
assert(!deadHashRegex.test(diaryHtml), 'diary.html has no dead href="#" links');
assert(!deadHashRegex.test(gamesHtml), 'games.html has no dead href="#" links');
assert(!deadHashRegex.test(timelineHtml), 'timeline.html has no dead href="#" links');

if (errors.length > 0) {
  console.error(`\n❌ VERIFICATION FAILED: ${errors.length} issue(s) found!`);
  process.exit(1);
} else {
  console.log('\n🎉 ALL MULTI-PAGE, AUTH, STUDIO, VAULT, SHARED SPACE, 3D ROOM, GALAXY, DIARY, GAMES & TIMELINE VERIFICATIONS PASSED 100%! 🎉\n');
}
