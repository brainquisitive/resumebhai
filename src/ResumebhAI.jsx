import { useState, useRef, useCallback, useEffect } from "react";
import { SEED_BLOG_POSTS } from "./blogSeedPosts";
import logoFull from "./assets/logo-full.png";
import logoIcon from "./assets/logo-icon.png";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
const RAZORPAY_KEY  = import.meta.env.VITE_RAZORPAY_KEY || "rzp_test_XXXXXXXXXXXXXXXX";
const TEST_MODE     = !import.meta.env.VITE_RAZORPAY_KEY;
const ADMIN_EMAILS  = ["brainquisitive@gmail.com"];
const FB_CONFIG = {
  apiKey:             import.meta.env.VITE_FB_API_KEY            || "YOUR_API_KEY",
  authDomain:         import.meta.env.VITE_FB_AUTH_DOMAIN        || "YOUR_PROJECT.firebaseapp.com",
  projectId:          import.meta.env.VITE_FB_PROJECT_ID         || "YOUR_PROJECT_ID",
  storageBucket:      import.meta.env.VITE_FB_STORAGE_BUCKET     || "YOUR_PROJECT.appspot.com",
  messagingSenderId:  import.meta.env.VITE_FB_MESSAGING_SENDER_ID|| "YOUR_SENDER_ID",
  appId:              import.meta.env.VITE_FB_APP_ID             || "YOUR_APP_ID",
};
const FB_READY = FB_CONFIG.apiKey !== "YOUR_API_KEY";
const FONT = "Arial, sans-serif";

// ─── DESIGN TOKENS ────────────────────────────────────────────────────────────
const C = {
  primary:"#4361EE", purple:"#7B2FBE", accent:"#F76B35",
  teal:"#06D6A0", gold:"#F59E0B", bg:"#F3F6FF", surface:"#FFFFFF",
  text:"#0A1128", muted:"#6678A8", border:"#DEE4F5",
  warn:"#FFAB35", danger:"#FF4D6D", good:"#06D6A0",
};
const sc = s => s>=4?C.teal:s>=3?C.primary:s>=2?C.warn:C.danger;
const sl = s => s>=4.5?"Exceptional":s>=4?"Strong":s>=3?"Good":s>=2?"Needs Work":"Poor";
const isAdmin = u => ADMIN_EMAILS.includes(u?.email?.toLowerCase());

const globalCSS = `
* { box-sizing:border-box; margin:0; padding:0; }
body { margin:0; background:${C.bg}; font-family:Arial,sans-serif; }
::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-thumb{background:#c4cceb;border-radius:10px}
@keyframes spin{to{transform:rotate(360deg)}}
@keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
@keyframes shimLoad{0%{transform:translateX(-120%)}100%{transform:translateX(280%)}}
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
@keyframes modalIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}
.fade-up{animation:fadeUp .4s ease both}
.btn-primary{background:linear-gradient(135deg,${C.primary},${C.purple});color:#fff;border:none;cursor:pointer;font-family:Arial,sans-serif;font-weight:700;border-radius:12px;transition:transform .15s,box-shadow .15s}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(67,97,238,.35)}
.btn-google{background:#fff;color:#3c4043;border:1.5px solid #dadce0;cursor:pointer;font-family:Arial,sans-serif;font-weight:700;border-radius:12px;transition:all .15s;display:flex;align-items:center;justify-content:center;gap:10px}
.btn-google:hover{background:#f8f9fa;box-shadow:0 2px 8px rgba(0,0,0,.1)}
.btn-gold{background:linear-gradient(135deg,#F59E0B,#D97706);color:#fff;border:none;cursor:pointer;font-family:Arial,sans-serif;font-weight:700;border-radius:12px;transition:transform .15s,box-shadow .15s}
.btn-gold:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(245,158,11,.4)}
.btn-secondary{background:${C.surface};color:${C.primary};border:1.5px solid ${C.border};cursor:pointer;font-family:Arial,sans-serif;font-weight:700;border-radius:12px;transition:all .15s}
.btn-secondary:hover{border-color:${C.primary};background:#f0f3ff}
.card{background:${C.surface};border-radius:18px;border:1px solid ${C.border};box-shadow:0 2px 20px rgba(67,97,238,.06);transition:box-shadow .2s,transform .2s}
.card:hover{box-shadow:0 6px 32px rgba(67,97,238,.1)}
input,textarea,select{font-family:Arial,sans-serif;font-size:14px;color:${C.text};background:#FAFBFF;border:1.5px solid ${C.border};border-radius:10px;outline:none;transition:border-color .2s;width:100%}
input:focus,textarea:focus,select:focus{border-color:${C.primary};background:#fff}
.drop-zone{border:2px dashed ${C.border};border-radius:14px;cursor:pointer;transition:all .2s}
.drop-zone:hover,.drop-zone.dragover{border-color:${C.primary};background:#f0f3ff}
.tag{display:inline-flex;align-items:center;padding:4px 12px;border-radius:999px;font-size:12px;font-weight:700;font-family:Arial,sans-serif}
.blur-lock{filter:blur(5px);user-select:none;pointer-events:none}
.skel{background:linear-gradient(90deg,#eef1fa 25%,#e0e5f7 50%,#eef1fa 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;border-radius:8px}
.check-row{display:flex;align-items:flex-start;gap:14px;padding:16px 0;border-bottom:1px solid ${C.border}}
.check-row:last-child{border-bottom:none}
.blog-body h3{font-family:Arial,sans-serif;font-weight:800;font-size:21px;color:${C.text};margin:28px 0 12px;line-height:1.3}
.blog-body h4{font-family:Arial,sans-serif;font-weight:700;font-size:16px;color:${C.text};margin:20px 0 8px;line-height:1.3}
.blog-body p{margin:0 0 16px}
.blog-body ul,.blog-body ol{margin:0 0 16px;padding-left:24px}
.blog-body li{margin-bottom:8px;line-height:1.7}
.blog-body blockquote{border-left:4px solid ${C.primary};padding-left:18px;margin:20px 0;font-style:italic;color:${C.muted}}
.blog-body img{max-width:100%;border-radius:12px;margin:16px 0;display:block}
.blog-body a{color:${C.primary};font-weight:700}
.blog-body code{background:#F0F3FF;padding:2px 6px;border-radius:4px;font-family:'Courier New',monospace;font-size:13px}
.blog-body strong{font-weight:800}
`;

// ─── ALGORITHMIC ANALYSIS ─────────────────────────────────────────────────────
const FILLER_WORDS = ['responsible for','helped with','assisted in','worked on','involved in','participated in','contributed to','tasked with','duties included','duties include','was involved','in charge of','supporting'];
const BUZZWORDS = ['passionate','hardworking','hard-working','team player','go-getter','thought leader','synergy','results-driven','results oriented','self-motivated','detail-oriented','dynamic','proactive','innovative','motivated','dedicated','enthusiastic','seasoned professional'];
const STRONG_VERBS = ['achieved','accelerated','architected','automated','built','championed','collaborated','conducted','coordinated','created','delivered','deployed','designed','developed','directed','drove','engineered','established','exceeded','executed','expanded','generated','grew','implemented','improved','increased','initiated','launched','led','managed','mentored','negotiated','optimized','orchestrated','oversaw','pioneered','planned','produced','reduced','resolved','revamped','saved','scaled','secured','spearheaded','streamlined','strengthened','supervised','transformed','delivered','formulated','identified','restructured'];

const runAlgorithmicAnalysis = (text) => {
  if (!text || text.trim().length < 50) return null;
  const lines = text.split('\n').filter(l => l.trim());
  const lower = text.toLowerCase();
  const bullets = lines.filter(l => { const t=l.trim(); return t.startsWith('-')||t.startsWith('•')||t.startsWith('*'); });
  const allBullets = bullets.length > 0 ? bullets : lines.filter(l => l.trim().length > 20 && l.trim().length < 200);

  // 1. Quantify impact
  const withNums = allBullets.filter(b => /\d/.test(b));
  const qPct = allBullets.length > 0 ? withNums.length / allBullets.length : 0;
  const qScore = qPct>=.6?5:qPct>=.4?4:qPct>=.25?3:qPct>=.1?2:1;

  // 2. Filler words
  const foundFillers = FILLER_WORDS.filter(w => lower.includes(w));
  const fScore = foundFillers.length===0?5:foundFillers.length<=1?4:foundFillers.length<=2?3:foundFillers.length<=4?2:1;

  // 3. Buzzwords
  const foundBuzz = BUZZWORDS.filter(w => lower.includes(w));
  const bScore = foundBuzz.length===0?5:foundBuzz.length<=1?4:foundBuzz.length<=3?3:foundBuzz.length<=5?2:1;

  // 4. Action verbs
  const withVerbs = allBullets.filter(b => { const fw=b.trim().replace(/^[-•*]\s*/,'').split(/\s/)[0].toLowerCase(); return STRONG_VERBS.includes(fw); });
  const vPct = allBullets.length > 0 ? withVerbs.length / allBullets.length : 0;
  const vScore = vPct>=.7?5:vPct>=.5?4:vPct>=.35?3:vPct>=.2?2:1;

  // 5. Bullet length
  const longB = allBullets.filter(b => b.split(/\s+/).length > 35);
  const shortB = allBullets.filter(b => { const wc=b.split(/\s+/).length; return wc<5&&wc>0; });
  const blScore = (longB.length+shortB.length)===0?5:(longB.length+shortB.length)<=2?4:(longB.length+shortB.length)<=4?3:2;

  // 6. Section completeness
  const hasSummary = /\b(summary|objective|profile|about me|professional summary)\b/i.test(text);
  const hasExp = /\b(experience|employment|work history|work experience)\b/i.test(text);
  const hasEdu = /\b(education|qualification|degree|academic)\b/i.test(text);
  const hasSkills = /\b(skills|technologies|competencies|expertise)\b/i.test(text);
  const secCount = [hasSummary,hasExp,hasEdu,hasSkills].filter(Boolean).length;
  const secScore = secCount===4?5:secCount===3?4:secCount===2?3:2;

  // 7. Contact info
  const hasEmail = /[\w.+-]+@[\w-]+\.\w+/.test(text);
  const hasPhone = /[\+\d][\d\s\-\(\)]{9,}/.test(text);
  const hasLI = /linkedin\.com\//i.test(text);
  const ctScore = [hasEmail,hasPhone,hasLI].filter(Boolean).length===3?5:[hasEmail,hasPhone,hasLI].filter(Boolean).length===2?4:[hasEmail,hasPhone,hasLI].filter(Boolean).length===1?2:1;

  // 8. Length
  const wc = text.split(/\s+/).filter(w=>w.length>0).length;
  const lenScore = wc>=400&&wc<=900?5:wc>=300&&wc<=1100?4:wc>=200?3:2;

  // 9. Repetition
  const words = lower.match(/\b[a-z]{5,}\b/g)||[];
  const freq = {}; words.forEach(w=>{freq[w]=(freq[w]||0)+1;});
  const stopWords = new Set(['which','their','there','where','these','those','would','could','should','about','after','before','being','having','project','management','construction','experience','within','across','during','through','using','based','ensure','various','including','ensuring','multiple','stakeholders']);
  const repeated = Object.entries(freq).filter(([w,c])=>c>5&&!stopWords.has(w)).sort((a,b)=>b[1]-a[1]).slice(0,5);
  const repScore = repeated.length===0?5:repeated.length<=2?4:repeated.length<=3?3:2;

  const scores = [qScore,fScore,bScore,vScore,blScore,secScore,ctScore,lenScore,repScore];
  const overall = Math.round((scores.reduce((a,b)=>a+b,0)/scores.length)*10)/10;

  return {
    overallScore: overall,
    wordCount: wc,
    bulletCount: allBullets.length,
    checks: [
      { id:'quantify', name:'Quantify Impact', score:qScore, status:qScore>=4?'good':qScore>=3?'warn':'bad',
        headline: qScore>=4?`${withNums.length} of ${allBullets.length} bullets have numbers ✓`:`Only ${withNums.length} of ${allBullets.length} bullets have numbers`,
        detail:`Aim for 60%+ of bullet points to contain a specific number, %, ₹ amount, team size, or timeline.`,
        fix:qScore<4?`Add metrics to your bullets. E.g. "Managed project" → "Managed ₹4Cr project delivering 3 weeks ahead of schedule".`:null },
      { id:'fillers', name:'Filler Words', score:fScore, status:fScore>=4?'good':fScore>=3?'warn':'bad',
        headline: foundFillers.length===0?'No filler phrases found ✓':`${foundFillers.length} filler phrase${foundFillers.length>1?'s':''} found`,
        detail: foundFillers.length>0?`Found: "${foundFillers.slice(0,3).join('", "')}"  — these weaken your impact.`:'Good — resume uses active, direct language.',
        fix:foundFillers.length>0?`Replace weak phrases with action verbs. "Responsible for managing" → "Managed". "Helped with" → "Delivered".`:null },
      { id:'buzzwords', name:'Buzzwords', score:bScore, status:bScore>=4?'good':bScore>=3?'warn':'bad',
        headline: foundBuzz.length===0?'No buzzwords ✓':`${foundBuzz.length} buzzword${foundBuzz.length>1?'s':''} detected`,
        detail: foundBuzz.length>0?`Found: "${foundBuzz.slice(0,3).join('", "')}"  — recruiters skip these.`:'Good — resume is specific and concrete.',
        fix:foundBuzz.length>0?`Remove vague buzzwords. Replace with specific achievements: instead of "passionate", show what you did because of that passion.`:null },
      { id:'verbs', name:'Action Verbs', score:vScore, status:vScore>=4?'good':vScore>=3?'warn':'bad',
        headline: vScore>=4?`${withVerbs.length} of ${allBullets.length} bullets use strong verbs ✓`:`${withVerbs.length} of ${allBullets.length} bullets start with strong verbs`,
        detail:`Start bullets with impactful verbs: Orchestrated, Delivered, Engineered, Spearheaded, Reduced, Scaled.`,
        fix:vScore<4?`Rewrite bullet openings. "Was responsible for drawings" → "Coordinated GFC drawing submissions across 12 vendors".`:null },
      { id:'length', name:'Bullet Conciseness', score:blScore, status:blScore>=4?'good':'warn',
        headline: (longB.length+shortB.length)===0?'Bullet lengths look good ✓':`${longB.length} too long, ${shortB.length} too short`,
        detail:`Ideal: 15–25 words per bullet. Long bullets lose the reader. Short ones lack impact.`,
        fix:longB.length>0?`Break long bullets into two, keeping one key achievement each.`:null },
      { id:'sections', name:'Key Sections', score:secScore, status:secScore>=4?'good':secScore>=3?'warn':'bad',
        headline: secScore===5?'All key sections present ✓':`Missing: ${[!hasSummary&&'Summary',!hasExp&&'Experience',!hasEdu&&'Education',!hasSkills&&'Skills'].filter(Boolean).join(', ')}`,
        detail:`Sections found: ${[hasSummary&&'Summary',hasExp&&'Experience',hasEdu&&'Education',hasSkills&&'Skills'].filter(Boolean).join(', ')}.`,
        fix:secScore<5?`Add the missing section(s) with a clearly labelled heading.`:null },
      { id:'contact', name:'Contact Information', score:ctScore, status:ctScore>=4?'good':'bad',
        headline: ctScore===5?'Email, phone & LinkedIn present ✓':`Missing: ${[!hasEmail&&'Email',!hasPhone&&'Phone',!hasLI&&'LinkedIn URL'].filter(Boolean).join(', ')}`,
        detail:`${[hasEmail&&'✓ Email',hasPhone&&'✓ Phone',hasLI&&'✓ LinkedIn'].filter(Boolean).join('   ')}`,
        fix:ctScore<5?`Add your LinkedIn profile URL — most recruiters click it. Format: linkedin.com/in/yourname`:null },
      { id:'wordcount', name:'Resume Length', score:lenScore, status:lenScore>=4?'good':'warn',
        headline: wc<300?`Too short (${wc} words)`:wc>1000?`May be too long (${wc} words)`:`Good length (${wc} words) ✓`,
        detail:`Ideal: 400–900 words. ${wc<400?'Add more detail to experience bullets.':wc>900?'Trim older/less relevant roles.':'You are in the right range.'}`,
        fix:null },
      { id:'repetition', name:'Word Repetition', score:repScore, status:repScore>=4?'good':'warn',
        headline: repeated.length===0?'Good word variety ✓':`${repeated.length} overused word${repeated.length>1?'s':''}`,
        detail: repeated.length>0?`Overused: ${repeated.slice(0,3).map(([w,c])=>`"${w}" (${c}×)`).join(', ')}`:'Good variety of language used throughout.',
        fix:repeated.length>0?`Vary your vocabulary — use synonyms and restructure repeated phrases.`:null },
    ],
  };
};

// ─── Resume detection ─────────────────────────────────────────────────────────
const isLikelyResume = (text) => {
  if (!text || text.trim().length < 50) return { ok: false, reason: 'This document is too short to be a resume.' };
  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  if (wordCount < 80) return { ok: false, reason: 'This document is too short to be a resume (under 80 words).' };
  const hasSection = /\b(experience|education|skills|employment|work history|qualification|objective|summary|profile|projects|certifications|achievements|internship)\b/i.test(text);
  const hasContact = /[\w.+-]+@[\w-]+\.\w+/.test(text) || /[\+\d][\d\s\-\(\)]{9,}/.test(text);
  if (!hasSection && !hasContact) return { ok: false, reason: 'This does not appear to be a resume. Please upload a resume with your experience, education, and contact details.' };
  if (!hasSection) return { ok: false, reason: 'No resume sections found (Experience, Education, Skills). Please upload a proper resume document.' };
  return { ok: true };
};

// ─── PDF text extraction ──────────────────────────────────────────────────────
const extractPDFText = async (base64) => {
  await _loadScript('https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js');
  const lib = window.pdfjsLib;
  lib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i=0;i<binary.length;i++) bytes[i]=binary.charCodeAt(i);
  const pdf = await lib.getDocument({data:bytes}).promise;
  let text = '';
  for (let i=1;i<=pdf.numPages;i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(it=>it.str).join(' ') + '\n';
  }
  return text;
};

// ─── Firebase / DB ────────────────────────────────────────────────────────────
let _fbDb = null;
const _loadScript = src => new Promise((res,rej)=>{
  const existing = document.querySelector(`script[src="${src}"]`);
  if(existing){
    // A previous call may have added the tag but it might still be loading —
    // wait for it instead of resolving immediately (which left window.firebase
    // partially initialized and caused intermittent storeUser/auth failures).
    if(existing.dataset.loaded==='1'){res();return;}
    existing.addEventListener('load',res);
    existing.addEventListener('error',rej);
    return;
  }
  const s=document.createElement('script');s.src=src;
  s.onload=()=>{s.dataset.loaded='1';res();};
  s.onerror=rej;
  document.head.appendChild(s);
});
const loadFirebase = async () => {
  if(_fbDb)return _fbDb;
  if(!FB_READY)return null;
  try {
    await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
    await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore-compat.js');
    if(!window.firebase.apps.length) window.firebase.initializeApp(FB_CONFIG);
    _fbDb=window.firebase.firestore(); return _fbDb;
  } catch{return null;}
};
const signInWithGoogle = async () => {
  if(!FB_READY) throw new Error('Configure Firebase to enable Google Sign-In.');
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
  if(!window.firebase.apps.length) window.firebase.initializeApp(FB_CONFIG);
  const auth = window.firebase.auth();
  const provider = new window.firebase.auth.GoogleAuthProvider();
  const result = await auth.signInWithPopup(provider);
  return {id:result.user.uid,name:result.user.displayName,email:result.user.email,photo:result.user.photoURL,emailVerified:result.user.emailVerified};
};
// Action emails (verification/reset) must point back at the live site so the
// link works — otherwise Firebase falls back to its default *.firebaseapp.com
// action handler, which still sends the email but can look broken/untrusted.
const ACTION_CODE_SETTINGS = { url: typeof window!=='undefined' ? window.location.origin : 'https://resumebhai.com' };

// Firebase v9's compat SDK collapses "wrong password" / "no such user" into a
// single auth/invalid-login-credentials (or auth/invalid-credential) error for
// security reasons. With email enumeration protection enabled (default on
// newer projects), fetchSignInMethodsForEmail also always returns [] whether
// or not the account exists, so it cannot be used to disambiguate further.
const friendlyAuthError = (e) => {
  const code = e.code || '';
  if(code==='auth/invalid-login-credentials' || code==='auth/invalid-credential' || code==='auth/wrong-password' || code==='auth/user-not-found'){
    return 'Incorrect email or password, or no account exists with this email. If you have an account, use "Forgot password" to reset it.';
  }
  if(code==='auth/email-already-in-use') return 'An account already exists with this email. Try signing in instead, or use "Forgot password" to set a new password.';
  if(code==='auth/too-many-requests') return 'Too many attempts. Please wait a few minutes and try again.';
  if(code==='auth/weak-password') return 'Password is too weak. Use at least 6 characters.';
  if(code==='auth/network-request-failed') return 'Network error. Check your connection and try again.';
  return (e.message||'Something went wrong.').replace('Firebase: ','');
};
const firebaseRegister = async (name,email,password) => {
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
  if(!window.firebase.apps.length) window.firebase.initializeApp(FB_CONFIG);
  const auth = window.firebase.auth();
  const result = await auth.createUserWithEmailAndPassword(email,password);
  await result.user.updateProfile({displayName:name});
  await result.user.sendEmailVerification(ACTION_CODE_SETTINGS);
  return {id:result.user.uid,name,email:result.user.email,emailVerified:false,photo:null};
};
const firebaseLogin = async (email,password) => {
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
  if(!window.firebase.apps.length) window.firebase.initializeApp(FB_CONFIG);
  const auth = window.firebase.auth();
  const result = await auth.signInWithEmailAndPassword(email,password);
  return {id:result.user.uid,name:result.user.displayName||email.split('@')[0],email:result.user.email,emailVerified:result.user.emailVerified,photo:null};
};
const firebaseSendVerification = async () => {
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
  if(!window.firebase.apps.length) window.firebase.initializeApp(FB_CONFIG);
  const auth = window.firebase.auth();
  if(auth.currentUser) await auth.currentUser.sendEmailVerification(ACTION_CODE_SETTINGS);
};
const firebaseCheckVerified = async () => {
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
  if(!window.firebase.apps.length) window.firebase.initializeApp(FB_CONFIG);
  const auth = window.firebase.auth();
  if(auth.currentUser){await auth.currentUser.reload();return auth.currentUser.emailVerified;}
  return false;
};
const DB = {
  async saveAnalysis(userId,entry){
    const db=await loadFirebase();
    if(db) await db.collection('analyses').doc(`${userId}_${entry.id}`).set({...entry,userId});
    else { const k=`rbhai_an_${userId}`;const list=JSON.parse(localStorage.getItem(k)||'[]');localStorage.setItem(k,JSON.stringify([entry,...list.filter(x=>x.id!==entry.id)].slice(0,10)));  }
  },
  async loadAnalyses(userId){
    const db=await loadFirebase();
    if(db){const snap=await db.collection('analyses').where('userId','==',userId).orderBy('date','desc').limit(10).get();return snap.docs.map(d=>d.data());}
    return JSON.parse(localStorage.getItem(`rbhai_an_${userId}`)||'[]');
  },
  async savePost(post){ const db=await loadFirebase(); if(db) await db.collection('blogs').doc(post.id).set(post); else { const l=JSON.parse(localStorage.getItem('rbhai_blogs')||'[]');localStorage.setItem('rbhai_blogs',JSON.stringify([post,...l.filter(x=>x.id!==post.id)])); } },
  async deletePost(id){ const db=await loadFirebase(); if(db) await db.collection('blogs').doc(id).delete(); else { const l=JSON.parse(localStorage.getItem('rbhai_blogs')||'[]');localStorage.setItem('rbhai_blogs',JSON.stringify(l.filter(x=>x.id!==id))); } },
  async loadPosts(){ const db=await loadFirebase(); if(db){const snap=await db.collection('blogs').orderBy('date','desc').get();return snap.docs.map(d=>d.data());} return JSON.parse(localStorage.getItem('rbhai_blogs')||'[]'); },
  async storeUser(user){ const db=await loadFirebase(); if(db) await db.collection('users').doc(String(user.id)).set({email:user.email,name:user.name||'',provider:user.photo?'google':'email',emailVerified:user.emailVerified||false,createdAt:new Date().toISOString()},{merge:true}); },
  async saveVault(userId,entry){
    const db=await loadFirebase();
    if(db) await db.collection('vaults').doc(`${userId}_${entry.id}`).set({...entry,userId});
    else { const k=`rbhai_vault_${userId}`;const list=JSON.parse(localStorage.getItem(k)||'[]');localStorage.setItem(k,JSON.stringify([entry,...list.filter(x=>x.id!==entry.id)])); }
  },
  async loadVaults(userId){
    const db=await loadFirebase();
    let list;
    if(db){const snap=await db.collection('vaults').where('userId','==',userId).get();list=snap.docs.map(d=>d.data());}
    else list=JSON.parse(localStorage.getItem(`rbhai_vault_${userId}`)||'[]');
    const now=Date.now();
    const valid=list.filter(v=>now-v.createdAt<7*24*60*60*1000);
    if(valid.length!==list.length){
      if(db){for(const v of list){if(now-v.createdAt>=7*24*60*60*1000) await db.collection('vaults').doc(`${userId}_${v.id}`).delete();}}
      else localStorage.setItem(`rbhai_vault_${userId}`,JSON.stringify(valid));
    }
    return valid.sort((a,b)=>b.createdAt-a.createdAt);
  },
  async renameVault(userId,id,name){
    const db=await loadFirebase();
    if(db) await db.collection('vaults').doc(`${userId}_${id}`).update({name});
    else { const k=`rbhai_vault_${userId}`;const list=JSON.parse(localStorage.getItem(k)||'[]');const i=list.findIndex(x=>x.id===id);if(i>=0){list[i].name=name;localStorage.setItem(k,JSON.stringify(list));} }
  },
  async deleteVault(userId,id){
    const db=await loadFirebase();
    if(db) await db.collection('vaults').doc(`${userId}_${id}`).delete();
    else { const k=`rbhai_vault_${userId}`;const list=JSON.parse(localStorage.getItem(k)||'[]');localStorage.setItem(k,JSON.stringify(list.filter(x=>x.id!==id))); }
  },
};

// ─── Auth storage ─────────────────────────────────────────────────────────────
const getUsers   = () => { try{return JSON.parse(localStorage.getItem('rbhai_users')||'[]')}catch{return[]} };
const saveUsers  = u => localStorage.setItem('rbhai_users',JSON.stringify(u));
const getSession = () => { try{const s=localStorage.getItem('rbhai_session');return s?JSON.parse(s):null}catch{return null} };
const setSession = u => localStorage.setItem('rbhai_session',JSON.stringify(u));
const clearSession = () => localStorage.removeItem('rbhai_session');
const isPaidCheck = (uid,aid) => !!localStorage.getItem(`rbhai_paid_${uid}_${aid}`);
const markPaid   = (uid,aid) => localStorage.setItem(`rbhai_paid_${uid}_${aid}`,'1');

// ─── Razorpay ─────────────────────────────────────────────────────────────────
const openRazorpay = async ({user,onSuccess,onFail}) => {
  if(TEST_MODE){ await new Promise(r=>setTimeout(r,800)); onSuccess({test:true}); return; }
  const ok = await _loadScript('https://checkout.razorpay.com/v1/checkout.js').then(()=>true).catch(()=>false);
  if(!ok){onFail('Payment gateway could not load.');return;}
  const rzp = new window.Razorpay({key:RAZORPAY_KEY,amount:19900,currency:'INR',name:'ResumebhAI',description:'Full Career Pack',handler:r=>onSuccess(r),prefill:{name:user?.name||'',email:user?.email||''},theme:{color:'#4361EE'},modal:{ondismiss:()=>{}}});
  rzp.on('payment.failed',e=>onFail(e.error?.description||'Payment failed'));
  rzp.open();
};

// ─── PDF print helpers ────────────────────────────────────────────────────────
const printAsPDF = html => {
  const w=window.open('','_blank');
  if(!w){alert('Allow popups to download PDF.');return;}
  w.document.write(html);w.document.close();w.focus();setTimeout(()=>w.print(),600);
};
const dlAtsPDF = text => {
  const esc=text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const body=esc.split('\n').map(l=>{const t=l.trim();const isH=t.length>1&&t===t.toUpperCase()&&!t.startsWith('-')&&t.replace(/[^A-Z]/g,'').length>2;return isH?`<div class="sh">${l}</div>`:t.startsWith('-')?`<div class="bl">${l}</div>`:t===''?`<div class="sp"></div>`:`<div class="ln">${l}</div>`;}).join('');
  printAsPDF(`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>@media print{@page{margin:18mm 20mm;size:A4}.np{display:none}}body{font-family:Arial,sans-serif;font-size:11pt;color:#1a1a1a;padding:24px 32px;max-width:740px;margin:0 auto;line-height:1.55}.sh{font-weight:bold;font-size:12pt;text-transform:uppercase;letter-spacing:1.5px;border-bottom:1.5px solid #333;padding-bottom:3px;margin:16px 0 6px}.bl{padding-left:14px;margin:2px 0}.ln{margin:2px 0}.sp{height:6px}.np{text-align:center;padding:14px;background:#4361EE;color:#fff;font-family:Arial;font-size:14px;border-radius:8px;cursor:pointer;margin-bottom:20px}</style></head><body><div class="np" onclick="window.print()">🖨️ Click to Save as PDF</div>${body}</body></html>`);
};
const dlVisualPDF = html => {
  const banner=`<div style="position:fixed;top:0;left:0;right:0;background:#4361EE;color:#fff;text-align:center;padding:12px;font-family:Arial;font-size:14px;cursor:pointer;z-index:9999;" onclick="window.print()">🖨️ Click to Save as PDF</div><div style="height:48px"></div>`;
  const css=`<style>@media print{div[onclick]{display:none!important}div[style*="height:48px"]{display:none!important}@page{margin:0;size:A4}}</style>`;
  printAsPDF(html.replace(/<body[^>]*>/,m=>m+banner).replace('</head>',css+'</head>'));
};

// ─── Shared UI ────────────────────────────────────────────────────────────────
const Tag=({text,variant='primary'})=>{
  const s={primary:{background:'#EEF1FF',color:C.primary},missing:{background:'#FFF0EC',color:'#C73800'},success:{background:'#E3FBF3',color:'#0A7D5A'},gold:{background:'#FEF9EC',color:'#92600A'},news:{background:C.primary,color:'#fff'},free:{background:'#E3FBF3',color:'#0A7D5A'},paid:{background:'#FEF9EC',color:'#92600A'}};
  return <span className="tag" style={s[variant]||s.primary}>{text}</span>;
};
const Spinner=({size=18,color='#fff'})=><span style={{width:size,height:size,borderRadius:'50%',border:`2px solid ${color}44`,borderTopColor:color,animation:'spin .8s linear infinite',display:'inline-block',flexShrink:0}}/>;
const CircleScore=({score,size=120,max=5})=>{
  const r=46,circ=2*Math.PI*r,color=sc(score),offset=circ-(score/max)*circ;
  return <svg width={size} height={size} viewBox="0 0 108 108"><circle cx={54} cy={54} r={r} fill="none" stroke="#EEF1FA" strokeWidth={9}/><circle cx={54} cy={54} r={r} fill="none" stroke={color} strokeWidth={9} strokeDasharray={`${circ} ${circ}`} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 54 54)" style={{transition:'stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)'}}/><text x={54} y={49} textAnchor="middle" fontSize={21} fontWeight="700" fill={color} fontFamily="Arial">{score.toFixed(1)}</text><text x={54} y={65} textAnchor="middle" fontSize={11} fill={C.muted} fontFamily="Arial">/ {max}.0</text></svg>;
};
const Logo=({size='md',onClick,light=false})=>{
  const fs=size==='sm'?16:size==='lg'?26:19,b=size==='sm'?28:size==='lg'?44:34,h=size==='sm'?26:size==='lg'?40:32;
  if(light) return <button onClick={onClick} style={{display:'flex',alignItems:'center',gap:9,background:'none',border:'none',cursor:onClick?'pointer':'default',padding:0}}><img src={logoIcon} alt="" style={{height:b,width:b,objectFit:'contain'}}/><span style={{fontFamily:FONT,fontWeight:800,fontSize:fs,color:'#fff'}}>Resume<span style={{color:'#7EB3FF'}}>bh</span><span style={{color:'#7EB3FF'}}>AI</span></span></button>;
  return <button onClick={onClick} style={{display:'flex',alignItems:'center',background:'none',border:'none',cursor:onClick?'pointer':'default',padding:0}}><img src={logoFull} alt="ResumebhAI" style={{height:h,width:'auto',objectFit:'contain'}}/></button>;
};

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({onAuth,onClose,reason}){
  const [view,setView]=useState('login');
  const [form,setForm]=useState({name:'',email:'',password:'',confirm:''});
  const [err,setErr]=useState('');const [msg,setMsg]=useState('');const [loading,setLoading]=useState(false);const [showPw,setShowPw]=useState(false);
  const set=(k,v)=>{setForm(p=>({...p,[k]:v}));setErr('');setMsg('');};
  const login=async()=>{
    if(!form.email||!form.password){setErr('Fill in all fields.');return;}
    setLoading(true);setErr('');
    if(FB_READY){
      try{const u=await firebaseLogin(form.email,form.password);setSession(u);onAuth(u);}
      catch(e){setErr(friendlyAuthError(e));}
      setLoading(false);return;
    }
    const u=getUsers().find(u=>u.email.toLowerCase()===form.email.toLowerCase()&&u.password===form.password);
    if(!u){setErr('Incorrect email or password.');setLoading(false);return;}
    setSession(u);onAuth(u);setLoading(false);
  };
  const register=async()=>{
    if(!form.name||!form.email||!form.password||!form.confirm){setErr('Fill in all fields.');return;}
    if(!form.email.includes('@')){setErr('Invalid email.');return;}
    if(form.password.length<6){setErr('Password must be 6+ characters.');return;}
    if(form.password!==form.confirm){setErr('Passwords do not match.');return;}
    setLoading(true);setErr('');
    if(FB_READY){
      try{const u=await firebaseRegister(form.name,form.email,form.password);setSession(u);onAuth(u);}
      catch(e){setErr(friendlyAuthError(e));}
      setLoading(false);return;
    }
    const users=getUsers();
    if(users.find(u=>u.email.toLowerCase()===form.email.toLowerCase())){setErr('Account already exists.');setLoading(false);return;}
    const u={id:Date.now(),name:form.name,email:form.email,password:form.password,emailVerified:false};
    saveUsers([...users,u]);setSession(u);onAuth(u);setLoading(false);
  };
  const googleLogin=async()=>{
    setLoading(true);setErr('');
    try{const u=await signInWithGoogle();setSession(u);onAuth(u);}
    catch(e){setErr(FB_READY?e.message:'Enable Google Sign-In by configuring Firebase in the app.');}
    setLoading(false);
  };
  const forgot=async()=>{
    if(!form.email.includes('@')){setErr('Enter a valid email.');return;}
    setLoading(true);setErr('');
    if(FB_READY){
      try{
        await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
        await _loadScript('https://www.gstatic.com/firebasejs/9.23.0/firebase-auth-compat.js');
        if(!window.firebase.apps.length)window.firebase.initializeApp(FB_CONFIG);
        const auth=window.firebase.auth();
        await auth.sendPasswordResetEmail(form.email,ACTION_CODE_SETTINGS);
        setMsg(`Password reset email sent to ${form.email}. Check your inbox (and spam/promotions folder) for an email from Firebase.`);
      }catch(e){setErr(friendlyAuthError(e));}
      setLoading(false);return;
    }
    setTimeout(()=>{setLoading(false);setMsg(`Reset link sent to ${form.email} (if account exists).`);},1500);
  };
  return(
    <div style={{position:'fixed',inset:0,background:'rgba(10,17,40,0.6)',backdropFilter:'blur(6px)',zIndex:1000,display:'flex',alignItems:'center',justifyContent:'center',padding:16}}>
      <div className="card" style={{width:'100%',maxWidth:420,padding:'32px 32px 28px',animation:'modalIn .25s ease',position:'relative'}}>
        <button onClick={onClose} style={{position:'absolute',top:16,right:16,background:'none',border:'none',cursor:'pointer',fontSize:20,color:C.muted}}>✕</button>
        <div style={{textAlign:'center',marginBottom:22}}>
          <Logo size="sm"/>
          {reason&&<div style={{marginTop:12,background:'#EEF1FF',borderRadius:8,padding:'8px 14px',fontSize:13,color:C.primary,fontFamily:FONT}}>{reason}</div>}
        </div>
        <div style={{display:'flex',gap:4,background:C.bg,borderRadius:10,padding:4,marginBottom:20}}>
          {['login','register'].map(v=><button key={v} onClick={()=>{setView(v);setErr('');setMsg('');}} style={{flex:1,padding:'9px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:13,fontFamily:FONT,background:view===v?C.surface:'transparent',color:view===v?C.primary:C.muted,boxShadow:view===v?'0 1px 6px rgba(0,0,0,.08)':'none',textTransform:'capitalize'}}>{v==='login'?'Sign In':'Create Account'}</button>)}
        </div>
        <button className="btn-google" onClick={googleLogin} disabled={loading} style={{width:'100%',padding:'12px',fontSize:14,marginBottom:16}}>
          <svg width="20" height="20" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.2-2.7-.4-4z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5L31.6 33.5C29.7 35 27 36 24 36c-5.2 0-9.6-2.9-11.3-7.1l-6.6 5.1C9.5 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20H24v8h11.3c-.9 2.4-2.5 4.4-4.7 5.8l5.9 4.5C40.5 34.8 44 29.8 44 24c0-1.3-.2-2.7-.4-4z"/></svg>
          {loading?<Spinner color={C.muted}/>:'Continue with Google'}
        </button>
        <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}><div style={{flex:1,height:1,background:C.border}}/><span style={{fontSize:12,color:C.muted,fontFamily:FONT}}>or</span><div style={{flex:1,height:1,background:C.border}}/></div>
        {view==='register'&&<div style={{marginBottom:14}}><label style={{fontWeight:700,fontSize:12,color:C.text,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.6px',fontFamily:FONT}}>Full Name</label><input style={{padding:'10px 13px'}} type="text" placeholder="Rahul Sharma" value={form.name} onChange={e=>set('name',e.target.value)}/></div>}
        <div style={{marginBottom:14}}><label style={{fontWeight:700,fontSize:12,color:C.text,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.6px',fontFamily:FONT}}>Email</label><input style={{padding:'10px 13px'}} type="email" placeholder="you@example.com" value={form.email} onChange={e=>set('email',e.target.value)} onKeyDown={e=>e.key==='Enter'&&view==='login'&&login()}/></div>
        {view!=='forgot'&&<div style={{marginBottom:view==='login'?8:14}}><label style={{fontWeight:700,fontSize:12,color:C.text,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.6px',fontFamily:FONT}}>Password</label><div style={{position:'relative'}}><input style={{padding:'10px 40px 10px 13px'}} type={showPw?'text':'password'} placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} onKeyDown={e=>e.key==='Enter'&&view==='login'&&login()}/><button onClick={()=>setShowPw(p=>!p)} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',background:'none',border:'none',cursor:'pointer',fontSize:16,color:C.muted}}>{showPw?'🙈':'👁'}</button></div></div>}
        {view==='register'&&<div style={{marginBottom:14}}><label style={{fontWeight:700,fontSize:12,color:C.text,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.6px',fontFamily:FONT}}>Confirm Password</label><input style={{padding:'10px 13px'}} type={showPw?'text':'password'} placeholder="••••••••" value={form.confirm} onChange={e=>set('confirm',e.target.value)} onKeyDown={e=>e.key==='Enter'&&register()}/></div>}
        {view==='login'&&<div style={{textAlign:'right',marginBottom:16}}><button onClick={()=>{setView('forgot');setErr('');}} style={{background:'none',border:'none',cursor:'pointer',fontSize:13,color:C.primary,fontWeight:700,fontFamily:FONT}}>Forgot password?</button></div>}
        {err&&<div style={{background:'#FFF0EC',border:'1px solid #FFCBB8',borderRadius:8,padding:'9px 13px',fontSize:13,color:'#C73800',marginBottom:12,fontFamily:FONT}}>⚠️ {err}</div>}
        {msg&&<div style={{background:'#E3FBF3',border:'1px solid #9FE1CB',borderRadius:8,padding:'9px 13px',fontSize:13,color:'#0A7D5A',marginBottom:12,fontFamily:FONT}}>✅ {msg}</div>}
        {view==='login'&&<button className="btn-primary" onClick={login} disabled={loading} style={{width:'100%',padding:'13px',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>{loading?<><Spinner color="#fff"/>Signing In…</>:'Sign In →'}</button>}
        {view==='register'&&<button className="btn-primary" onClick={register} disabled={loading} style={{width:'100%',padding:'13px',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>{loading?<><Spinner color="#fff"/>Creating Account…</>:'Create Account →'}</button>}
        {view==='forgot'&&<button className="btn-primary" onClick={forgot} disabled={loading} style={{width:'100%',padding:'13px',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>{loading?<><Spinner/>Sending…</>:'Send Reset Link →'}</button>}
        {view==='forgot'&&<div style={{textAlign:'center',marginTop:14}}><button onClick={()=>{setView('login');setErr('');setMsg('');}} style={{background:'none',border:'none',cursor:'pointer',color:C.primary,fontWeight:700,fontSize:13,fontFamily:FONT}}>← Back to sign in</button></div>}
      </div>
    </div>
  );
}

// ─── EMAIL VERIFICATION WALL ──────────────────────────────────────────────────
function EmailVerificationWall({email,onVerified,onLogout}){
  const [checking,setChecking]=useState(false);
  const [sending,setSending]=useState(false);
  const [msg,setMsg]=useState('');
  const check=async()=>{
    setChecking(true);setMsg('');
    try{
      const verified=await firebaseCheckVerified();
      if(verified) onVerified();
      else setMsg('Email not yet verified. Check your inbox and click the link, then try again.');
    }catch(e){setMsg('Error checking: '+e.message);}
    setChecking(false);
  };
  const resend=async()=>{
    setSending(true);setMsg('');
    try{await firebaseSendVerification();setMsg('Verification email resent! Check your inbox (and spam/promotions folder).');}
    catch(e){setMsg('Could not resend: '+e.message);}
    setSending(false);
  };
  return(
    <div style={{maxWidth:480,margin:'80px auto',padding:'0 24px',textAlign:'center'}}>
      <div className="card" style={{padding:'40px 32px'}}>
        <div style={{fontSize:48,marginBottom:16}}>📧</div>
        <h2 style={{fontFamily:FONT,fontWeight:800,fontSize:22,color:C.text,marginBottom:10}}>Verify Your Email</h2>
        <p style={{fontSize:14,color:C.muted,lineHeight:1.7,marginBottom:8,fontFamily:FONT}}>We sent a verification link to <b style={{color:C.text}}>{email}</b>.</p>
        <p style={{fontSize:13,color:C.muted,marginBottom:24,fontFamily:FONT}}>Click the link in the email, then come back and click the button below.</p>
        {msg&&<div style={{background:msg.includes('not yet')||msg.includes('Error')||msg.includes('not')?'#FFF0EC':'#E3FBF3',border:`1px solid ${msg.includes('not yet')||msg.includes('Error')||msg.includes('not')?'#FFCBB8':'#9FE1CB'}`,borderRadius:8,padding:'9px 13px',fontSize:13,color:msg.includes('not yet')||msg.includes('Error')||msg.includes('not')?'#C73800':'#0A7D5A',marginBottom:16,fontFamily:FONT}}>{msg}</div>}
        <div style={{display:'flex',flexDirection:'column',gap:10}}>
          <button onClick={check} disabled={checking} className="btn-primary" style={{padding:'13px',fontSize:15,display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
            {checking?<><Spinner color="#fff"/>Checking…</>:"✅ I've Verified My Email"}
          </button>
          <button onClick={resend} disabled={sending} className="btn-secondary" style={{padding:'11px',fontSize:14}}>
            {sending?'Sending…':'📨 Resend Verification Email'}
          </button>
          <button onClick={onLogout} style={{background:'none',border:'none',cursor:'pointer',color:C.muted,fontSize:13,fontFamily:FONT,marginTop:4}}>Sign out and use a different account</button>
        </div>
      </div>
    </div>
  );
}

// ─── NAVBAR ───────────────────────────────────────────────────────────────────
function Navbar({page,setPage,user,onLogout,showAuth}){
  const [menu,setMenu]=useState(false);
  const initials=user?(user.name||'U').split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2):null;
  return(
    <nav style={{position:'sticky',top:0,zIndex:100,background:'rgba(243,246,255,0.93)',backdropFilter:'blur(18px)',borderBottom:`1px solid ${C.border}`,height:62,display:'flex',alignItems:'center',padding:'0 clamp(16px,5vw,56px)',justifyContent:'space-between'}}>
      <Logo onClick={()=>setPage('home')}/>
      <div style={{display:'flex',gap:4,alignItems:'center'}}>
        {['home','analyze','blog','about'].map(l=><button key={l} onClick={()=>setPage(l)} style={{padding:'7px 14px',borderRadius:8,border:'none',cursor:'pointer',fontWeight:700,fontSize:14,transition:'all .15s',background:page===l?'#fff':'transparent',color:page===l?C.primary:C.muted,boxShadow:page===l?'0 1px 8px rgba(67,97,238,.13)':'none',textTransform:'capitalize',fontFamily:FONT}}>{l}</button>)}
        {TEST_MODE&&<span style={{fontSize:11,background:'#FEF9EC',color:'#92600A',border:'1px solid #F59E0B',borderRadius:6,padding:'2px 8px',fontWeight:700,fontFamily:FONT}}>TEST</span>}
        {user?(
          <div style={{position:'relative',marginLeft:8}}>
            <button onClick={()=>setMenu(p=>!p)} style={{width:36,height:36,borderRadius:'50%',background:user.photo?'transparent':'linear-gradient(135deg,#4361EE,#7B2FBE)',border:'none',cursor:'pointer',overflow:'hidden',padding:0}}>
              {user.photo?<img src={user.photo} style={{width:'100%',height:'100%',objectFit:'cover'}}/>:<span style={{color:'#fff',fontFamily:FONT,fontWeight:800,fontSize:13,display:'flex',alignItems:'center',justifyContent:'center',width:'100%',height:'100%'}}>{initials}</span>}
            </button>
            {menu&&<div className="card" style={{position:'absolute',right:0,top:44,width:220,padding:'8px 0',zIndex:200}} onClick={()=>setMenu(false)}>
              <div style={{padding:'10px 16px 12px',borderBottom:`1px solid ${C.border}`}}><p style={{fontWeight:700,fontSize:14,color:C.text,fontFamily:FONT}}>{user.name}</p><p style={{fontSize:12,color:C.muted,fontFamily:FONT}}>{user.email}</p></div>
              <button onClick={()=>setPage('reports')} style={{width:'100%',padding:'10px 16px',background:'none',border:'none',cursor:'pointer',textAlign:'left',fontSize:14,color:C.text,fontFamily:FONT}}>📋 My Saved Reports</button>
              {isAdmin(user)&&<button onClick={()=>setPage('blog-admin')} style={{width:'100%',padding:'10px 16px',background:'none',border:'none',cursor:'pointer',textAlign:'left',fontSize:14,color:C.primary,fontFamily:FONT,fontWeight:700}}>✍️ Manage Blog</button>}
              <button onClick={onLogout} style={{width:'100%',padding:'10px 16px',background:'none',border:'none',cursor:'pointer',textAlign:'left',fontSize:14,color:C.danger,fontFamily:FONT,fontWeight:700}}>🚪 Sign Out</button>
            </div>}
          </div>
        ):(
          <button onClick={showAuth} className="btn-primary" style={{padding:'9px 20px',fontSize:13,marginLeft:8}}>Sign In</button>
        )}
      </div>
    </nav>
  );
}

function Footer({setPage}){
  return(
    <footer style={{background:C.text,color:'rgba(255,255,255,.65)',padding:'44px clamp(16px,5vw,56px)',display:'grid',gridTemplateColumns:'2fr 1fr 1fr',gap:40}}>
      <div><div style={{marginBottom:14}}><Logo size="sm" light/></div><p style={{fontSize:13,lineHeight:1.7,maxWidth:260,color:'rgba(255,255,255,.55)',fontFamily:FONT}}>AI-powered resume analysis for the Indian job market. Free instant analysis · ₹199 career pack · No subscription.</p></div>
      <div><p style={{fontWeight:700,fontSize:13,color:'#fff',marginBottom:14,fontFamily:FONT}}>Pages</p>{['Home','Analyze','Blog','About'].map(n=><div key={n} onClick={()=>setPage(n.toLowerCase())} style={{fontSize:13,marginBottom:9,cursor:'pointer',fontFamily:FONT}} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.65)'}>{n}</div>)}</div>
      <div><p style={{fontWeight:700,fontSize:13,color:'#fff',marginBottom:14,fontFamily:FONT}}>Resources</p>{[['ATS Guide','blog'],['Resume Tips','blog'],['Career Blog','blog'],['Free Resume Check','analyze']].map(([n,p])=><div key={n} onClick={()=>setPage(p)} style={{fontSize:13,marginBottom:9,cursor:'pointer',fontFamily:FONT}} onMouseEnter={e=>e.target.style.color='#fff'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,.65)'}>{n}</div>)}</div>
    </footer>
  );
}

// ─── HOME PAGE ────────────────────────────────────────────────────────────────
function HomePage({setPage,showAuth,user}){
  const checks=[
    {icon:'🔢',label:'Quantify Impact',free:true},{icon:'🚫',label:'Filler Words',free:true},{icon:'⚡',label:'Action Verbs',free:true},{icon:'📏',label:'Resume Length',free:true},{icon:'📋',label:'Section Completeness',free:true},{icon:'📞',label:'Contact Info',free:true},{icon:'🔁',label:'Word Repetition',free:true},{icon:'🏷️',label:'Buzzwords',free:true},{icon:'🔑',label:'Missing Keywords',free:false},{icon:'✍️',label:'ATS Resume Rewrite',free:false},{icon:'🎨',label:'Visual Resume',free:false},{icon:'✉️',label:'Cover Letter',free:false},{icon:'💼',label:'LinkedIn & Naukri',free:false},{icon:'🎯',label:'12 Interview Q&As',free:false},
  ];
  return(
    <div>
      {/* Hero */}
      <div style={{background:'linear-gradient(155deg,#EBF0FF 0%,#F3F6FF 50%,#FFF0F0 100%)',padding:'80px clamp(16px,5vw,56px) 70px',textAlign:'center'}}>
        <Tag text="✦  India's AI Resume Checker · Free Instant Analysis"/>
        <h1 style={{fontFamily:FONT,fontWeight:800,fontSize:'clamp(32px,5vw,58px)',color:C.text,margin:'22px 0 18px',lineHeight:1.1,letterSpacing:'-1px'}}>Is your resume<br/><span style={{backgroundImage:'linear-gradient(135deg,#4361EE,#7B2FBE)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>strong enough to get hired?</span></h1>
        <p style={{fontSize:18,color:C.muted,maxWidth:560,margin:'0 auto 12px',lineHeight:1.7,fontFamily:FONT}}>Get an instant, detailed analysis of your resume — <b style={{color:C.text}}>completely free</b>. Find exactly what's holding you back and fix it.</p>
        <p style={{fontSize:14,color:C.muted,marginBottom:36,fontFamily:FONT}}>No sign-up required for free analysis · ₹199 for AI rewrites & career pack</p>
        <div style={{display:'flex',gap:14,justifyContent:'center',flexWrap:'wrap'}}>
          <button onClick={()=>setPage('analyze')} className="btn-primary" style={{padding:'16px 44px',fontSize:17,borderRadius:14}}>Check My Resume Free →</button>
          <button onClick={()=>setPage('blog')} className="btn-secondary" style={{padding:'16px 28px',fontSize:16}}>Read Blog</button>
        </div>
        <p style={{fontSize:13,color:C.muted,marginTop:14,fontFamily:FONT}}>PDF or Word (.docx) · No sign-up needed · Instant results</p>
        <div style={{display:'flex',gap:40,justifyContent:'center',marginTop:44,flexWrap:'wrap'}}>
          {[['Free','Full 9-point instant analysis'],['₹199','Complete AI career pack'],['Instant','Results in seconds']].map(([v,l])=><div key={l}><div style={{fontFamily:FONT,fontWeight:800,fontSize:26,color:C.primary}}>{v}</div><div style={{fontSize:13,color:C.muted,marginTop:2,fontFamily:FONT}}>{l}</div></div>)}
        </div>
      </div>

      {/* What's Checked */}
      <div style={{padding:'64px clamp(16px,5vw,56px)',background:C.surface}}>
        <div style={{maxWidth:960,margin:'0 auto'}}>
          <h2 style={{fontFamily:FONT,fontWeight:800,fontSize:30,color:C.text,textAlign:'center',marginBottom:10}}>What gets checked</h2>
          <p style={{textAlign:'center',fontSize:15,color:C.muted,marginBottom:40,fontFamily:FONT}}>8 checks are free instantly · 6 AI-powered features for ₹199</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))',gap:24}}>
            <div>
              <div style={{textAlign:'center',marginBottom:14}}><Tag text="Free — Instant" variant="free"/></div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {checks.filter(c=>c.free).map(c=><div key={c.label} style={{padding:'14px 16px',borderRadius:12,border:`1px solid ${C.teal}44`,background:'#F0FBF7',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:18}}>{c.icon}</span>
                  <p style={{fontFamily:FONT,fontWeight:700,fontSize:13,color:C.text}}>{c.label}</p>
                </div>)}
              </div>
            </div>
            <div>
              <div style={{textAlign:'center',marginBottom:14}}><Tag text="₹199 — AI Career Pack" variant="paid"/></div>
              <div style={{display:'flex',flexDirection:'column',gap:10}}>
                {checks.filter(c=>!c.free).map(c=><div key={c.label} style={{padding:'14px 16px',borderRadius:12,border:`1px solid ${C.gold}55`,background:'#FFFBF0',display:'flex',alignItems:'center',gap:10}}>
                  <span style={{fontSize:18}}>{c.icon}</span>
                  <p style={{fontFamily:FONT,fontWeight:700,fontSize:13,color:C.text}}>{c.label}</p>
                </div>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* How it works */}
      <div style={{padding:'64px clamp(16px,5vw,56px)',background:C.bg}}>
        <h2 style={{fontFamily:FONT,fontWeight:800,fontSize:30,color:C.text,textAlign:'center',marginBottom:44}}>How it works</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))',gap:28,maxWidth:860,margin:'0 auto'}}>
          {[['01','Upload Resume','PDF or Word. No sign-up needed.'],['02','Instant Analysis','9 checks run in seconds in your browser — no AI, no waiting.'],['03','See Your Score','Detailed breakdown with specific findings and fixes.'],['04','Unlock Career Pack','Pay ₹199 once for AI rewrites, cover letter, LinkedIn, interview prep.']].map(([n,t,d])=><div key={n} style={{textAlign:'center'}}><div style={{width:52,height:52,borderRadius:14,background:'linear-gradient(135deg,#4361EE,#7B2FBE)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontFamily:FONT,fontWeight:800,fontSize:16,color:'#fff'}}>{n}</div><h4 style={{fontFamily:FONT,fontWeight:700,fontSize:15,color:C.text,marginBottom:6}}>{t}</h4><p style={{fontFamily:FONT,fontSize:13,color:C.muted,lineHeight:1.65}}>{d}</p></div>)}
        </div>
      </div>

      {/* Sample analysis preview */}
      <div style={{padding:'64px clamp(16px,5vw,56px)',background:C.surface}}>
        <div style={{maxWidth:780,margin:'0 auto'}}>
          <h2 style={{fontFamily:FONT,fontWeight:800,fontSize:30,color:C.text,textAlign:'center',marginBottom:10}}>Here's what you'll see</h2>
          <p style={{textAlign:'center',fontSize:15,color:C.muted,marginBottom:36,fontFamily:FONT}}>Each check shows exactly what's wrong and how to fix it</p>
          <div className="card" style={{padding:28}}>
            <div style={{display:'flex',alignItems:'center',gap:20,marginBottom:24,flexWrap:'wrap'}}>
              <CircleScore score={3.2} size={100}/>
              <div><p style={{fontFamily:FONT,fontWeight:800,fontSize:22,color:C.text,marginBottom:4}}>Your Resume Score: 3.2 / 5.0</p><p style={{fontFamily:FONT,fontSize:14,color:C.muted}}>Good foundation — but 3 critical issues found</p></div>
            </div>
            {[{id:'x',name:'Quantify Impact',score:1,status:'bad',headline:'Only 2 of 18 bullets have numbers',detail:'Aim for 60%+ of bullet points to contain a number, %, or ₹ amount.',fix:'Add specific numbers: "Managed ₹4Cr project delivering 3 weeks ahead of schedule"'},{id:'y',name:'Filler Words',score:2,status:'bad',headline:'3 filler phrases found',detail:'Found: "responsible for", "helped with", "involved in"',fix:'Replace with action verbs. "Responsible for managing" → "Managed"'},{id:'z',name:'Action Verbs',score:4,status:'good',headline:'14 of 18 bullets use strong verbs ✓',detail:'Good use of action verbs like Coordinated, Developed, Delivered.',fix:null}].map(c=><div key={c.id} className="check-row">
              <div style={{width:36,height:36,borderRadius:10,background:c.status==='good'?'#E3FBF3':c.status==='warn'?'#FFF8EC':'#FFF0EC',display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,flexShrink:0}}>{c.status==='good'?'✅':c.status==='warn'?'⚠️':'❌'}</div>
              <div style={{flex:1}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4,flexWrap:'wrap',gap:6}}><p style={{fontFamily:FONT,fontWeight:700,fontSize:14,color:C.text}}>{c.name}</p><span style={{fontFamily:FONT,fontWeight:700,fontSize:13,color:sc(c.score)}}>{c.score}/5</span></div><p style={{fontFamily:FONT,fontSize:13,color:C.text,marginBottom:c.fix?4:0}}>{c.headline}</p>{c.fix&&<p style={{fontFamily:FONT,fontSize:12,color:C.primary,background:'#EEF1FF',borderRadius:6,padding:'5px 10px',marginTop:4}}>💡 {c.fix}</p>}</div>
            </div>)}
            <div style={{marginTop:16,textAlign:'center'}}><button onClick={()=>setPage('analyze')} className="btn-primary" style={{padding:'12px 32px',fontSize:14}}>Get My Real Score →</button></div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{background:'linear-gradient(135deg,#4361EE,#7B2FBE)',padding:'60px clamp(16px,5vw,56px)',textAlign:'center'}}>
        <h2 style={{fontFamily:FONT,fontWeight:800,fontSize:32,color:'#fff',marginBottom:12}}>Ready to find out your score?</h2>
        <p style={{fontSize:16,color:'rgba(255,255,255,.8)',marginBottom:30,fontFamily:FONT}}>Free instant analysis · No sign-up · Upload PDF or Word</p>
        <button onClick={()=>setPage('analyze')} style={{padding:'16px 44px',fontSize:16,fontWeight:700,background:'#fff',color:C.primary,border:'none',borderRadius:14,cursor:'pointer',fontFamily:FONT}}>Check My Resume Free →</button>
      </div>
    </div>
  );
}

// ─── ANALYZE PAGE ─────────────────────────────────────────────────────────────
function AnalyzePage({form,setForm,file,handleFile,loading,loadingMsg,analyzeResume,error,previewText}){
  const dropRef=useRef(null);const fileRef=useRef(null);
  const [showPreview,setShowPreview]=useState(false);
  const isWord=file&&(file.name.endsWith('.doc')||file.name.endsWith('.docx'));
  const onDrop=useCallback(e=>{e.preventDefault();dropRef.current?.classList.remove('dragover');const f=e.dataTransfer.files[0];if(f)handleFile(f);},[handleFile]);
  return(
    <div style={{maxWidth:820,margin:'0 auto',padding:'50px clamp(16px,4vw,32px)'}}>
      <div style={{textAlign:'center',marginBottom:40}}>
        <h2 style={{fontFamily:FONT,fontWeight:800,fontSize:34,color:C.text,marginBottom:10}}>Check Your Resume</h2>
        <p style={{fontSize:15,color:C.muted,fontFamily:FONT}}>Instant free analysis · No sign-up needed · PDF or Word</p>
      </div>
      {loading?(
        <div className="card" style={{padding:'70px 40px',textAlign:'center'}}>
          <div style={{width:54,height:54,borderRadius:'50%',border:`4px solid ${C.border}`,borderTopColor:C.primary,margin:'0 auto 22px',animation:'spin .9s linear infinite'}}/>
          <h3 style={{fontFamily:FONT,fontWeight:700,fontSize:22,color:C.text,marginBottom:10}}>Analysing Your Resume…</h3>
          <p style={{fontSize:15,color:C.muted,animation:'pulse 2s ease-in-out infinite',fontFamily:FONT}}>{loadingMsg}</p>
          <div style={{width:220,height:4,background:C.border,borderRadius:999,margin:'26px auto 0',overflow:'hidden'}}><div style={{height:'100%',background:`linear-gradient(90deg,${C.primary},${C.purple})`,borderRadius:999,animation:'shimLoad 1.6s ease-in-out infinite',width:'60%'}}/></div>
        </div>
      ):(
        <>
          <div className="card" style={{padding:28,marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}><span style={{fontSize:20}}>📄</span><h3 style={{fontFamily:FONT,fontWeight:700,fontSize:17,color:C.text}}>Upload Resume</h3><span style={{fontSize:12,color:C.muted,fontFamily:FONT}}>PDF or Word (.docx)</span></div>
            <div ref={dropRef} className="drop-zone" onClick={()=>fileRef.current?.click()} onDrop={onDrop} onDragOver={e=>{e.preventDefault();dropRef.current?.classList.add('dragover')}} onDragLeave={()=>dropRef.current?.classList.remove('dragover')} style={{padding:'36px 24px',textAlign:'center',background:file?'#E3FBF3':'#FAFBFF',borderColor:file?C.teal:C.border}}>
              <div style={{fontSize:36,marginBottom:10}}>{file?(isWord?'📝':'📄'):'📁'}</div>
              <p style={{fontWeight:700,fontSize:15,color:file?C.teal:C.primary,marginBottom:4,fontFamily:FONT}}>{file?file.name:'Drag & drop your resume here'}</p>
              <p style={{fontSize:13,color:C.muted,fontFamily:FONT}}>{file?'Click to change file':'PDF or Word (.doc / .docx) supported'}</p>
              <input ref={fileRef} type="file" accept=".pdf,.doc,.docx" style={{display:'none'}} onChange={e=>handleFile(e.target.files[0])}/>
            </div>
            {file&&previewText&&(
              <div style={{marginTop:12}}>
                <button onClick={()=>setShowPreview(p=>!p)} className="btn-secondary" style={{padding:'8px 16px',fontSize:13}}>{showPreview?'▲ Hide Preview':'👁 Preview Extracted Text'}</button>
                {showPreview&&<div style={{marginTop:10,background:'#FAFBFF',border:`1px solid ${C.border}`,borderRadius:10,padding:16,maxHeight:260,overflowY:'auto',fontSize:13,color:C.text,whiteSpace:'pre-wrap',lineHeight:1.6,fontFamily:"'Courier New',monospace"}}>{previewText}</div>}
              </div>
            )}
            <div style={{marginTop:12,background:'#EEF5FF',borderRadius:8,padding:'10px 14px',fontSize:13,color:C.primary,fontFamily:FONT}}>
              💼 <b>LinkedIn user?</b> Go to your profile → <b>More → Save to PDF</b> → upload that file here
            </div>
          </div>
          <div className="card" style={{padding:28,marginBottom:20}}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:18}}><span style={{fontSize:20}}>🎯</span><h3 style={{fontFamily:FONT,fontWeight:700,fontSize:17,color:C.text}}>Your Target</h3><span style={{fontSize:12,color:C.muted,fontFamily:FONT}}>Required — helps tailor your analysis and AI career pack</span></div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
              {[{key:'industry',label:'Industry *',ph:'e.g. Construction, Finance, IT'},{key:'targetRole',label:'Target Role *',ph:'e.g. Project Manager'},{key:'experience',label:'Years of Experience *',ph:'e.g. 8',type:'number'}].map(f=><div key={f.key}><label style={{fontWeight:700,fontSize:12,color:C.text,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.6px',fontFamily:FONT}}>{f.label}</label><input type={f.type||'text'} value={form[f.key]} onChange={e=>setForm(p=>({...p,[f.key]:e.target.value}))} placeholder={f.ph} style={{padding:'10px 12px'}}/></div>)}
            </div>
            <label style={{fontWeight:700,fontSize:12,color:C.text,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.6px',fontFamily:FONT}}>Job Description * (at least 50 words — improves AI career pack)</label>
            <textarea value={form.jobDescription} onChange={e=>setForm(p=>({...p,jobDescription:e.target.value}))} placeholder="Paste the job description for targeted keyword matching and cover letter… (minimum 50 words)" rows={4} style={{padding:'10px 12px',resize:'vertical'}}/>
            <p style={{fontSize:12,color:form.jobDescription.trim().split(/\s+/).filter(Boolean).length>=50?'#0A7D5A':C.muted,marginTop:5,fontFamily:FONT}}>{form.jobDescription.trim().split(/\s+/).filter(Boolean).length} / 50 words minimum</p>
          </div>
          {error&&<div style={{background:'#FFF0EC',border:'1px solid #FFCBB8',borderRadius:10,padding:'12px 16px',fontSize:14,color:'#C73800',marginBottom:16,fontFamily:FONT}}>⚠️ {error}</div>}
          <button onClick={analyzeResume} className="btn-primary" style={{width:'100%',padding:'18px',fontSize:17,borderRadius:14}}>🔍 Analyse My Resume Free</button>
          <p style={{textAlign:'center',fontSize:13,color:C.muted,marginTop:10,fontFamily:FONT}}>Instant results · No account needed · Unlock AI career pack for ₹199 after</p>
        </>
      )}
    </div>
  );
}

// ─── RESULTS PAGE ─────────────────────────────────────────────────────────────
function ResultsPage({analysis,algoResult,form,saveAnalysis,setPage,user,analysisId,showAuth}){
  const [proTab,setProTab]=useState('ats');
  const [paid,setPaid]=useState(()=>user?isPaidCheck(user?.id,analysisId):false);
  const [payLoading,setPayLoading]=useState(false);
  const [payErr,setPayErr]=useState('');
  const [proContent,setProContent]=useState(null);
  const [proLoading,setProLoading]=useState(false);
  const [proMsg,setProMsg]=useState('');
  const [copied,setCopied]=useState(false);

  const callAPI=async(system,content,tok=5000)=>{
    const r=await fetch('/api/claude',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-20250514',max_tokens:tok,system,messages:[{role:'user',content}]})});
    const d=await r.json();if(d.error)throw new Error(d.error.message);
    return(d.content||[]).map(b=>b.text||'').join('').replace(/```json\s*/g,'').replace(/```\s*/g,'').trim();
  };

  const generateProContent=async()=>{
    setProLoading(true);
    const msgs=['Writing your ATS resume…','Crafting cover letter…','Building LinkedIn & Naukri content…','Generating interview questions…'];
    let mi=0;setProMsg(msgs[0]);const iv=setInterval(()=>{mi=(mi+1)%msgs.length;setProMsg(msgs[mi]);},2500);
    try{
      const ctx=`Name:${analysis?.candidateInfo?.name||'Candidate'}\nRole:${analysis?.candidateInfo?.currentRole||''}\nTarget:${form.targetRole||'Not specified'}\nIndustry:${form.industry||'Not specified'}\nExperience:${form.experience||''} yrs${form.jobDescription?`\nJD:\n${form.jobDescription.slice(0,500)}`:''}`;
      const resumeCtx = analysis?.atsResume||'';
      const sys1=`Elite resume expert. Return ONLY JSON:\n{"missingKeywords":["10-12 role-specific keywords"],"atsResume":"<FULL plain-text ATS resume with all sections, keyword-rich, \\n for newlines, ASCII only>","coverLetter":"<4-para cover letter>","linkedinHeadline":"<120 chars>","linkedinAbout":"<3 paragraphs>","naukriHeadline":"<100 chars>","naukriSummary":"<150-200 words>"}\nCandidate:\n${ctx}\nExisting resume:\n${resumeCtx}`;
      const sys2=`Expert resume designer. Return ONLY complete <!DOCTYPE html> visual resume. Modern navy header, all sections, inline CSS, A4 width. Candidate:\n${ctx}`;
      const sys3=`Expert interview coach. Return ONLY JSON:\n{"interviewQuestions":[{"q":"question","a":"3-4 sentence answer","tip":"key tip"},...12 items]}\nCandidate:\n${ctx}`;
      const [r1,r2,r3]=await Promise.all([callAPI(sys1,[{type:'text',text:'Generate JSON.'}],5000),callAPI(sys2,[{type:'text',text:'Create visual HTML resume.'}],5000),callAPI(sys3,[{type:'text',text:'Generate interview questions JSON.'}],3000)]);
      const p1=JSON.parse(r1);const htmlStart=r2.indexOf('<!DOCTYPE');const p3=JSON.parse(r3);
      const visualResumeHTML=htmlStart>=0?r2.slice(htmlStart):r2;
      setProContent({...p1,visualResumeHTML,...p3});
      setPayErr('');
      if(user){
        const entry={id:analysisId||Date.now().toString(),createdAt:Date.now(),date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),name:form.targetRole?`${form.targetRole} Career Pack`:'Career Pack',files:{...p1,visualResumeHTML,...p3}};
        try{await DB.saveVault(user.id,entry);}catch{}
      }
    }catch(e){setPayErr('Generation failed: '+e.message);}
    finally{clearInterval(iv);setProLoading(false);}
  };

  const handlePay=async()=>{
    if(!user){showAuth('Sign in to unlock your Career Pack');return;}
    setPayLoading(true);setPayErr('');
    await openRazorpay({user,onSuccess:async()=>{markPaid(user?.id,analysisId);setPaid(true);setPayLoading(false);await generateProContent();},onFail:m=>{setPayErr(m);setPayLoading(false);}});
    setPayLoading(false);
  };

  const PRO_TABS=[{key:'ats',label:'🤖 ATS Resume'},{key:'visual',label:'🎨 Visual Resume'},{key:'cover',label:'✉️ Cover Letter'},{key:'linkedin',label:'💼 LinkedIn & Naukri'},{key:'interview',label:'🎯 Interview Prep'}];
  const algo = algoResult;

  return(
    <div style={{maxWidth:980,margin:'0 auto',padding:'40px clamp(16px,4vw,32px)'}}>
      {/* Header */}
      <div style={{background:'linear-gradient(135deg,#4361EE,#7B2FBE)',borderRadius:22,padding:'28px 36px',marginBottom:24,display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:16,color:'#fff'}}>
        <div><p style={{fontSize:12,opacity:.75,marginBottom:4,letterSpacing:'1px',textTransform:'uppercase',fontFamily:FONT}}>Analysis Complete</p><h2 style={{fontFamily:FONT,fontWeight:800,fontSize:24,marginBottom:4}}>{form.targetRole||'Your Resume'}</h2><p style={{fontSize:14,opacity:.85,fontFamily:FONT}}>{form.industry||''}{form.experience?` · ${form.experience} yrs exp`:''}</p></div>
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          {user?<button onClick={saveAnalysis} style={{padding:'9px 18px',borderRadius:10,border:'2px solid rgba(255,255,255,.45)',background:'transparent',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:FONT}}>💾 Save Report</button>:<button onClick={()=>showAuth('Sign in to save your report and access it from any device')} style={{padding:'9px 18px',borderRadius:10,border:'2px solid rgba(255,255,255,.45)',background:'transparent',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:FONT}}>💾 Save Report</button>}
          <button onClick={()=>setPage('analyze')} style={{padding:'9px 18px',borderRadius:10,border:'none',background:'rgba(255,255,255,.2)',color:'#fff',fontWeight:700,fontSize:13,cursor:'pointer',fontFamily:FONT}}>+ New Analysis</button>
        </div>
      </div>

      {/* Score + Checks */}
      {algo&&(
        <div style={{display:'grid',gridTemplateColumns:'180px 1fr',gap:20,marginBottom:20}}>
          <div className="card" style={{padding:24,display:'flex',flexDirection:'column',alignItems:'center',textAlign:'center'}}>
            <p style={{fontWeight:700,fontSize:11,color:C.muted,textTransform:'uppercase',letterSpacing:'1px',marginBottom:12,fontFamily:FONT}}>Overall Score</p>
            <CircleScore score={algo.overallScore}/>
            <div style={{marginTop:12,padding:'5px 14px',borderRadius:999,fontWeight:700,fontSize:13,background:`${sc(algo.overallScore)}22`,color:sc(algo.overallScore),fontFamily:FONT}}>{sl(algo.overallScore)}</div>
            <p style={{fontSize:12,color:C.muted,marginTop:10,fontFamily:FONT}}>{algo.bulletCount} bullets · {algo.wordCount} words</p>
          </div>
          <div className="card" style={{padding:24}}>
            <h3 style={{fontFamily:FONT,fontWeight:700,fontSize:16,color:C.text,marginBottom:4}}>📋 Detailed Checks</h3>
            <p style={{fontSize:13,color:C.muted,marginBottom:16,fontFamily:FONT}}>Analysed instantly in your browser — no AI needed</p>
            {algo.checks.map(c=>(
              <div key={c.id} className="check-row">
                <div style={{width:32,height:32,borderRadius:9,background:c.status==='good'?'#E3FBF3':c.status==='warn'?'#FFF8EC':'#FFF0EC',display:'flex',alignItems:'center',justifyContent:'center',fontSize:16,flexShrink:0}}>{c.status==='good'?'✅':c.status==='warn'?'⚠️':'❌'}</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:3,gap:8,flexWrap:'wrap'}}>
                    <span style={{fontFamily:FONT,fontWeight:700,fontSize:13,color:C.text}}>{c.name}</span>
                    <span style={{fontFamily:FONT,fontWeight:700,fontSize:12,color:sc(c.score)}}>{c.score}/5</span>
                  </div>
                  <p style={{fontSize:13,color:C.text,marginBottom:c.fix?4:0,fontFamily:FONT}}>{c.headline}</p>
                  <p style={{fontSize:12,color:C.muted,marginBottom:c.fix?4:0,fontFamily:FONT}}>{c.detail}</p>
                  {c.fix&&<p style={{fontSize:12,color:C.primary,background:'#EEF1FF',borderRadius:6,padding:'5px 10px',fontFamily:FONT}}>💡 {c.fix}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Career Pack */}
      {!paid?(
        <div className="card" style={{padding:0,overflow:'hidden',position:'relative'}}>
          <div className="blur-lock" style={{padding:28}}>
            <div style={{display:'flex',gap:6,background:C.bg,borderRadius:12,padding:5,marginBottom:20}}>{PRO_TABS.map(t=><div key={t.key} style={{flex:1,height:42,borderRadius:9}} className="skel"/>)}</div>
            {[120,80,100,60,90].map((w,i)=><div key={i} className="skel" style={{height:14,width:`${w}%`,marginBottom:12}}/>)}
          </div>
          <div style={{position:'absolute',inset:0,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',background:'rgba(243,246,255,0.78)',backdropFilter:'blur(3px)',padding:28,textAlign:'center'}}>
            <div style={{fontSize:40,marginBottom:10}}>🔒</div>
            <h3 style={{fontFamily:FONT,fontWeight:800,fontSize:21,color:C.text,marginBottom:8}}>Unlock Your AI Career Pack</h3>
            <p style={{fontSize:14,color:C.muted,maxWidth:440,marginBottom:16,lineHeight:1.7,fontFamily:FONT}}>Get AI-powered missing keywords, rewritten ATS & visual resumes, cover letter, LinkedIn & Naukri content, and 12 interview Q&As.</p>
            <div style={{display:'flex',gap:6,flexWrap:'wrap',justifyContent:'center',marginBottom:20}}>
              {['🔑 Missing Keywords','🤖 ATS Resume PDF','🎨 Visual Resume PDF','✉️ Cover Letter','💼 LinkedIn & Naukri','🎯 12 Interview Q&As'].map(f=><span key={f} className="tag" style={{background:'#fff',color:C.text,border:`1px solid ${C.border}`,fontSize:11,fontFamily:FONT}}>{f}</span>)}
            </div>
            {TEST_MODE&&<div style={{background:'#FEF9EC',border:'1px solid #F59E0B',borderRadius:8,padding:'7px 14px',fontSize:12,color:'#92600A',marginBottom:14,fontFamily:FONT}}>⚡ TEST MODE — payment bypassed. Set <code>TEST_MODE=false</code> before going live.</div>}
            <button onClick={handlePay} disabled={payLoading} className="btn-gold" style={{padding:'15px 44px',fontSize:16,borderRadius:14,display:'flex',alignItems:'center',gap:10}}>
              {payLoading?<><Spinner color="#fff"/>Processing…</>:<>⚡ {TEST_MODE?'Test Unlock':'Unlock Career Pack'} — ₹199</>}
            </button>
            <p style={{fontSize:12,color:C.muted,marginTop:8,fontFamily:FONT}}>One-time · Instant access · No subscription</p>
            {payErr&&<p style={{fontSize:13,color:C.danger,marginTop:8,fontFamily:FONT}}>⚠️ {payErr}</p>}
          </div>
        </div>
      ):proLoading?(
        <div className="card" style={{padding:'60px 40px',textAlign:'center'}}>
          <div style={{width:54,height:54,borderRadius:'50%',border:`4px solid ${C.border}`,borderTopColor:C.gold,margin:'0 auto 20px',animation:'spin .9s linear infinite'}}/>
          <h3 style={{fontFamily:FONT,fontWeight:700,fontSize:20,color:C.text,marginBottom:10}}>Generating Your Career Pack…</h3>
          <p style={{fontSize:14,color:C.muted,animation:'pulse 2s ease-in-out infinite',fontFamily:FONT}}>{proMsg}</p>
        </div>
      ):proContent?(
        <div className="card" style={{padding:28}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20,flexWrap:'wrap',gap:10}}>
            <div><h3 style={{fontFamily:FONT,fontWeight:700,fontSize:17,color:C.text,marginBottom:3}}>✨ Your Career Pack</h3><p style={{fontSize:13,color:C.muted,fontFamily:FONT}}>Unlocked · ₹199 paid</p></div>
            <Tag text="✅ Unlocked" variant="success"/>
          </div>
          {proContent.missingKeywords&&<div style={{marginBottom:20}}><h4 style={{fontFamily:FONT,fontWeight:700,fontSize:14,color:C.text,marginBottom:10}}>🔑 Missing Keywords for {form.targetRole||'Target Role'}</h4><div style={{display:'flex',flexWrap:'wrap',gap:6}}>{proContent.missingKeywords.map((k,i)=><Tag key={i} text={k} variant="missing"/>)}</div></div>}
          <div style={{display:'flex',gap:4,background:C.bg,borderRadius:12,padding:4,marginBottom:22,flexWrap:'wrap'}}>
            {PRO_TABS.map(t=><button key={t.key} onClick={()=>setProTab(t.key)} style={{flex:1,minWidth:80,padding:'10px 8px',borderRadius:9,border:'none',cursor:'pointer',fontWeight:700,fontSize:12,transition:'all .15s',background:proTab===t.key?C.surface:'transparent',color:proTab===t.key?C.primary:C.muted,boxShadow:proTab===t.key?'0 2px 10px rgba(0,0,0,.08)':'none',fontFamily:FONT}}>{t.label}</button>)}
          </div>
          {proTab==='ats'&&<div><div style={{background:'#F8F9FF',border:`1px solid ${C.border}`,borderRadius:12,padding:20,fontFamily:"'Courier New',monospace",fontSize:12.5,lineHeight:1.75,color:C.text,whiteSpace:'pre-wrap',maxHeight:460,overflowY:'auto'}}>{proContent.atsResume}</div><div style={{display:'flex',gap:10,marginTop:14,flexWrap:'wrap'}}><button onClick={()=>dlAtsPDF(proContent.atsResume)} className="btn-primary" style={{padding:'11px 22px',fontSize:13}}>⬇ Download ATS (PDF)</button><button onClick={()=>{navigator.clipboard.writeText(proContent.atsResume);setCopied(true);setTimeout(()=>setCopied(false),2000);}} className="btn-secondary" style={{padding:'11px 18px',fontSize:13}}>{copied?'✓ Copied!':'📋 Copy'}</button></div></div>}
          {proTab==='visual'&&<div><div style={{border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}><iframe srcDoc={proContent.visualResumeHTML} style={{width:'100%',height:500,border:'none',display:'block'}} title="Visual Resume" sandbox="allow-same-origin allow-scripts"/></div><div style={{display:'flex',gap:10,marginTop:14}}><button onClick={()=>dlVisualPDF(proContent.visualResumeHTML)} className="btn-primary" style={{background:'linear-gradient(135deg,#F76B35,#FF4D6D)',padding:'11px 22px',fontSize:13}}>⬇ Download Visual (PDF)</button></div><p style={{fontSize:12,color:C.muted,marginTop:8,fontFamily:FONT}}>💡 New tab opens → click blue bar or Ctrl+P → Save as PDF</p></div>}
          {proTab==='cover'&&<div><div style={{background:'#F8F9FF',border:`1px solid ${C.border}`,borderRadius:12,padding:24,fontSize:14,lineHeight:1.85,color:C.text,whiteSpace:'pre-wrap',maxHeight:480,overflowY:'auto',fontFamily:FONT}}>{proContent.coverLetter}</div><div style={{display:'flex',gap:10,marginTop:14,flexWrap:'wrap'}}><button onClick={()=>{const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:12pt;max-width:700px;margin:0 auto;padding:40px;line-height:1.85}@media print{@page{margin:20mm;size:A4}}</style></head><body>${proContent.coverLetter.split('\n').map(l=>`<p>${l||'&nbsp;'}</p>`).join('')}</body></html>`;printAsPDF(html);}} className="btn-primary" style={{padding:'11px 22px',fontSize:13}}>⬇ Download (PDF)</button><button onClick={()=>{navigator.clipboard.writeText(proContent.coverLetter);setCopied(true);setTimeout(()=>setCopied(false),2000);}} className="btn-secondary" style={{padding:'11px 18px',fontSize:13}}>{copied?'✓ Copied!':'📋 Copy'}</button></div></div>}
          {proTab==='linkedin'&&<div style={{display:'flex',flexDirection:'column',gap:14}}>
            {[{t:'LinkedIn Headline',c:proContent.linkedinHeadline,i:'🔵'},{t:'LinkedIn About',c:proContent.linkedinAbout,i:'🔵'},{t:'Naukri Headline',c:proContent.naukriHeadline,i:'🟠'},{t:'Naukri Summary',c:proContent.naukriSummary,i:'🟠'}].map(s=><div key={s.t} style={{background:'#F8F9FF',border:`1px solid ${C.border}`,borderRadius:12,padding:18}}><div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}><h4 style={{fontFamily:FONT,fontWeight:700,fontSize:14,color:C.text}}>{s.i} {s.t}</h4><button onClick={()=>navigator.clipboard.writeText(s.c)} className="btn-secondary" style={{padding:'5px 12px',fontSize:12}}>📋 Copy</button></div><p style={{fontSize:13,color:C.text,lineHeight:1.75,whiteSpace:'pre-wrap',fontFamily:FONT}}>{s.c}</p></div>)}
          </div>}
          {proTab==='interview'&&<div style={{display:'flex',flexDirection:'column',gap:12}}>
            {proContent.interviewQuestions?.map((q,i)=><div key={i} style={{border:`1px solid ${C.border}`,borderRadius:12,overflow:'hidden'}}>
              <div style={{background:'#EEF1FF',padding:'12px 18px',display:'flex',alignItems:'flex-start',gap:10}}><span style={{fontFamily:FONT,fontWeight:800,fontSize:13,color:C.primary,minWidth:28}}>Q{i+1}</span><span style={{fontWeight:700,fontSize:14,color:C.text,lineHeight:1.5,fontFamily:FONT}}>{q.q}</span></div>
              <div style={{padding:'14px 18px'}}><p style={{fontSize:13,color:C.text,lineHeight:1.7,marginBottom:8,fontFamily:FONT}}><b>Answer:</b> {q.a}</p><p style={{fontSize:12,color:C.teal,background:'#E3FBF3',borderRadius:8,padding:'6px 12px',lineHeight:1.5,fontFamily:FONT}}>💡 <b>Tip:</b> {q.tip}</p></div>
            </div>)}
          </div>}
        </div>
      ):(
        <div className="card" style={{padding:28,textAlign:'center'}}>
          <p style={{color:C.muted,marginBottom:14,fontFamily:FONT}}>Your pack is paid. Click to generate.</p>
          {payErr&&<p style={{fontSize:13,color:C.danger,marginBottom:14,fontFamily:FONT}}>⚠️ {payErr}</p>}
          <button onClick={generateProContent} className="btn-gold" style={{padding:'12px 28px',fontSize:14}}>Generate My Career Pack →</button>
        </div>
      )}
      {paid&&proContent&&(
        <div style={{marginTop:16,background:'#EEF5FF',border:`1px solid ${C.border}`,borderRadius:10,padding:'12px 16px',fontSize:13,color:C.primary,fontFamily:FONT,display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:10}}>
          <span>📁 {user?'Your files are saved to':'Sign in to save these to'} <b>My Saved Reports</b> for <b>7 days</b>{user?' — rename or download anytime.':'.'}</span>
          {user&&<button onClick={()=>setPage('reports')} className="btn-secondary" style={{padding:'7px 16px',fontSize:12,whiteSpace:'nowrap'}}>View My Reports →</button>}
        </div>
      )}
    </div>
  );
}

// ─── MY REPORTS ───────────────────────────────────────────────────────────────
function VaultFolder({entry,userId,onRename,onDelete}){
  const [editing,setEditing]=useState(false);
  const [name,setName]=useState(entry.name||'Career Pack');
  const msLeft=entry.createdAt+7*24*60*60*1000-Date.now();
  const daysLeft=Math.max(0,Math.ceil(msLeft/(24*60*60*1000)));
  const f=entry.files||{};
  const save=()=>{setEditing(false);if(name.trim()&&name!==entry.name){onRename(entry.id,name.trim());}};
  const downloadCover=()=>{
    const html=`<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;font-size:12pt;max-width:700px;margin:0 auto;padding:40px;line-height:1.85}@media print{@page{margin:20mm;size:A4}}</style></head><body>${(f.coverLetter||'').split('\n').map(l=>`<p>${l||'&nbsp;'}</p>`).join('')}</body></html>`;
    printAsPDF(html);
  };
  return(
    <div className="card" style={{padding:'20px 24px'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap',marginBottom:14}}>
        <div style={{display:'flex',alignItems:'center',gap:10,flex:1,minWidth:200}}>
          <span style={{fontSize:22}}>📁</span>
          {editing?(
            <input autoFocus value={name} onChange={e=>setName(e.target.value)} onBlur={save} onKeyDown={e=>e.key==='Enter'&&save()} style={{padding:'6px 10px',fontSize:15,fontWeight:700,maxWidth:280}}/>
          ):(
            <div>
              <p style={{fontFamily:FONT,fontWeight:700,fontSize:15,color:C.text,display:'flex',alignItems:'center',gap:8}}>{name}<button onClick={()=>setEditing(true)} style={{background:'none',border:'none',cursor:'pointer',fontSize:13,color:C.muted}}>✏️ Rename</button></p>
              <p style={{fontFamily:FONT,fontSize:12,color:C.muted}}>{entry.date}</p>
            </div>
          )}
        </div>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span className="tag" style={{background:daysLeft<=2?'#FFF0EC':'#FEF9EC',color:daysLeft<=2?'#C73800':'#92600A'}}>{daysLeft<=0?'Expires today':`Expires in ${daysLeft} day${daysLeft===1?'':'s'}`}</span>
          <button onClick={()=>onDelete(entry.id)} style={{padding:'6px 12px',fontSize:12,borderRadius:9,border:'none',background:'#FFF0EC',color:C.danger,cursor:'pointer',fontFamily:FONT,fontWeight:700}}>Delete</button>
        </div>
      </div>
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
        {f.atsResume&&<button onClick={()=>dlAtsPDF(f.atsResume)} className="btn-secondary" style={{padding:'8px 14px',fontSize:12}}>🤖 ATS Resume</button>}
        {f.visualResumeHTML&&<button onClick={()=>dlVisualPDF(f.visualResumeHTML)} className="btn-secondary" style={{padding:'8px 14px',fontSize:12}}>🎨 Visual Resume</button>}
        {f.coverLetter&&<button onClick={downloadCover} className="btn-secondary" style={{padding:'8px 14px',fontSize:12}}>✉️ Cover Letter</button>}
        {f.linkedinAbout&&<button onClick={()=>navigator.clipboard.writeText(`Headline: ${f.linkedinHeadline}\n\nAbout:\n${f.linkedinAbout}\n\nNaukri Headline: ${f.naukriHeadline}\n\nNaukri Summary:\n${f.naukriSummary}`)} className="btn-secondary" style={{padding:'8px 14px',fontSize:12}}>💼 Copy LinkedIn & Naukri</button>}
        {f.interviewQuestions&&<button onClick={()=>navigator.clipboard.writeText(f.interviewQuestions.map((q,i)=>`Q${i+1}: ${q.q}\nA: ${q.a}\nTip: ${q.tip}`).join('\n\n'))} className="btn-secondary" style={{padding:'8px 14px',fontSize:12}}>🎯 Copy Interview Prep</button>}
      </div>
    </div>
  );
}

function ReportsPage({userId,setPage,setViewReport}){
  const [reports,setReports]=useState([]);const [loading,setLoading]=useState(true);
  const [vaults,setVaults]=useState([]);
  useEffect(()=>{
    DB.loadAnalyses(userId).then(r=>{setReports(r);setLoading(false);});
    DB.loadVaults(userId).then(setVaults);
  },[userId]);
  const renameVault=async(id,name)=>{await DB.renameVault(userId,id,name);setVaults(v=>v.map(x=>x.id===id?{...x,name}:x));};
  const deleteVault=async(id)=>{await DB.deleteVault(userId,id);setVaults(v=>v.filter(x=>x.id!==id));};
  return(
    <div style={{maxWidth:820,margin:'0 auto',padding:'50px clamp(16px,4vw,32px)'}}>
      <button onClick={()=>setPage('home')} className="btn-secondary" style={{padding:'8px 16px',fontSize:13,marginBottom:26}}>← Back</button>
      <h2 style={{fontFamily:FONT,fontWeight:800,fontSize:30,color:C.text,marginBottom:8}}>My Saved Reports</h2>
      <p style={{fontSize:14,color:C.muted,marginBottom:28,fontFamily:FONT}}>{FB_READY?'Synced across all your devices':'Saved on this device · Add Firebase config for cross-device sync'}</p>

      <h3 style={{fontFamily:FONT,fontWeight:700,fontSize:18,color:C.text,marginBottom:6}}>📁 Career Pack Files</h3>
      <p style={{fontSize:13,color:C.muted,marginBottom:14,fontFamily:FONT}}>Each unlocked Career Pack is saved here for 7 days. Rename or download anytime before it expires.</p>
      {vaults.length===0?<div className="card" style={{padding:'24px',textAlign:'center',marginBottom:32}}><p style={{fontFamily:FONT,fontSize:14,color:C.muted}}>No Career Pack files yet. Unlock a Career Pack from your results to see them here.</p></div>:
      <div style={{display:'flex',flexDirection:'column',gap:14,marginBottom:32}}>
        {vaults.map(v=><VaultFolder key={v.id} entry={v} userId={userId} onRename={renameVault} onDelete={deleteVault}/>)}
      </div>}

      <h3 style={{fontFamily:FONT,fontWeight:700,fontSize:18,color:C.text,marginBottom:14}}>📋 Analysis Reports</h3>
      {loading?<div style={{textAlign:'center',padding:60}}><Spinner size={32} color={C.primary}/></div>:
      reports.length===0?<div className="card" style={{padding:44,textAlign:'center'}}><div style={{fontSize:44,marginBottom:14}}>📋</div><p style={{fontFamily:FONT,fontSize:15,color:C.muted}}>No saved reports yet. Analyse a resume and click "Save Report".</p></div>:
      <div style={{display:'flex',flexDirection:'column',gap:14}}>
        {reports.map(r=><div key={r.id} className="card" style={{padding:'20px 24px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,flexWrap:'wrap'}}>
          <div><p style={{fontFamily:FONT,fontWeight:700,fontSize:15,color:C.text,marginBottom:3}}>{r.name||'Candidate'}</p><p style={{fontFamily:FONT,fontSize:13,color:C.muted}}>{r.targetRole} · {r.industry} · {r.date}</p></div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{textAlign:'center'}}><div style={{fontFamily:FONT,fontWeight:800,fontSize:22,color:sc(r.score||3)}}>{(r.score||3).toFixed(1)}</div><div style={{fontSize:11,color:C.muted,fontFamily:FONT}}>/ 5.0</div></div>
            <button onClick={()=>{setViewReport(r);setPage('results');}} className="btn-primary" style={{padding:'9px 18px',fontSize:13}}>View →</button>
          </div>
        </div>)}
      </div>}
    </div>
  );
}

// ─── BLOG PAGE ────────────────────────────────────────────────────────────────
const DEFAULT_POSTS=[
  ...SEED_BLOG_POSTS,
  {id:'d1',tag:'ATS Strategy',title:'How to Beat ATS Systems in 2025',subheading:'ATS filters reject up to 75% of resumes before a human sees them.',imageUrl:'https://picsum.photos/seed/ats2025/800/420',quote:'An ATS doesn\'t appreciate creativity — it rewards precision.',author:'ResumebhAI Team',date:'March 10, 2025',read:'8 min',body:`ATS systems scan for specific keywords, formatting patterns, and structural elements. The single biggest mistake candidates make is submitting beautifully designed resumes with columns, tables, and graphics — all of which ATS systems cannot read correctly.\n\nThe most critical ATS optimisation rules:\n\n1. Use a single-column layout with clear section headings\n2. Mirror the exact language from the job description\n3. Spell out abbreviations the first time: "Search Engine Optimisation (SEO)"\n4. Use standard fonts like Arial or Calibri\n5. Save as .docx or plain PDF — not a scanned image\n6. Include a dedicated Skills section with your core competencies listed clearly\n\nOnce you pass the ATS, your resume reaches a recruiter who has roughly 7 seconds to decide whether to read further. Make those 7 seconds count with a strong summary and quantified achievements in every bullet point.`},
  {id:'d2',tag:'Writing Tips',title:'5 Resume Summary Formulas That Get Callbacks',subheading:'Your summary is the first — and sometimes only — thing recruiters read.',imageUrl:'https://picsum.photos/seed/summaryformula/800/420',quote:'Replace every generic word with a specific one. Include at least one number.',author:'ResumebhAI Team',date:'February 22, 2025',read:'6 min',body:`Formula 1 — The Specialist:\n"[X]-year [Title] specialising in [niche], with a track record of [achievement]."\n\nFormula 2 — The Problem Solver:\n"[Title] who has helped [company type] achieve [result] by [method]."\n\nFormula 3 — The Career Changer:\n"Former [role] transitioning to [new role], bringing [transferable skills]."\n\nFormula 4 — The Leader:\n"Senior [Title] with [X] years leading [team type] to deliver [outcome]."\n\nFormula 5 — The Numbers Person:\n"[Title] with proven ROI: [achievement 1], [achievement 2], [achievement 3]."\n\nThe key: specificity. Include at least one number in every summary.`},
  {id:'d3',tag:'Indian Job Market',title:'Naukri vs LinkedIn: Which Matters More in India?',subheading:'Most Indian professionals use both but optimise for neither.',imageUrl:'https://picsum.photos/seed/naukrivlinkedin/800/420',quote:'Your Naukri headline is the most keyword-indexed field on the platform.',author:'ResumebhAI Team',date:'January 20, 2025',read:'6 min',body:`Naukri.com has over 75 million registered profiles and is where the majority of Indian mid-market hiring happens. Recruiters at TCS, Infosys, L&T, and HDFC run active searches on Naukri daily.\n\nNaukri's ranking algorithm is keyword-driven. Your headline and summary are the most heavily indexed fields.\n\nLinkedIn matters more for senior roles (VP+), startup hiring, and international companies.\n\nPractical strategy:\n- 0–8 years, Indian companies: Naukri first, LinkedIn second\n- 8+ years or MNCs: LinkedIn first, Naukri maintained\n\nThe worst mistake: an outdated Naukri profile. Recruiters filter by "last updated" date.`},
  {id:'d4',tag:'Keywords',title:'Power Words That Make Recruiters Notice You',subheading:'"Managed" and "led" are invisible. These verbs land with real impact.',imageUrl:'https://picsum.photos/seed/powerwords/800/420',quote:'The formula: [Strong Verb] + [What You Did] + [How] + [Quantified Result]',author:'ResumebhAI Team',date:'January 2, 2025',read:'7 min',body:`Leadership: Orchestrated, Championed, Spearheaded, Galvanised\nBuilding: Engineered, Architected, Launched, Pioneered\nImprovement: Streamlined, Overhauled, Revamped, Optimised\nGrowth: Scaled, Accelerated, Amplified, Drove\nAnalysis: Synthesised, Diagnosed, Evaluated, Forecasted\n\nWeak: "Managed social media and increased engagement"\nStrong: "Orchestrated a 4-platform strategy driving 340% organic growth and ₹85L in attributed pipeline within 6 months"`},
];

function PostImage({src,alt,height}){
  if(!src) return <div style={{width:'100%',height,background:`linear-gradient(135deg,${C.primary}22,${C.purple}22)`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:13,color:C.muted,fontFamily:FONT}}>📷 Image coming soon</div>;
  return <img src={src} alt={alt} style={{width:'100%',height,objectFit:'cover'}} onError={e=>{e.target.style.display='none';}}/>;
}

function BlogPage({user,setPage}){
  const [posts,setPosts]=useState(DEFAULT_POSTS);const [post,setPost]=useState(null);
  useEffect(()=>{DB.loadPosts().then(db=>{if(db.length>0){const ids=new Set(db.map(p=>p.id));setPosts([...db,...DEFAULT_POSTS.filter(p=>!ids.has(p.id))]);}});},[]);
  const featured=posts[0];const rest=posts.slice(1);
  return(
    <div style={{maxWidth:1060,margin:'0 auto',padding:'50px clamp(16px,4vw,32px)'}}>
      {post?(
        <div className="fade-up">
          <button onClick={()=>setPost(null)} className="btn-secondary" style={{padding:'8px 16px',fontSize:13,marginBottom:26}}>← Back to Blog</button>
          <div style={{borderRadius:16,overflow:'hidden',marginBottom:24}}><PostImage src={post.imageUrl} alt={post.title} height={340}/></div>
          <Tag text={post.tag} variant="news"/>
          <h1 style={{fontFamily:FONT,fontWeight:800,fontSize:'clamp(22px,3.5vw,36px)',color:C.text,margin:'14px 0 8px',lineHeight:1.15}}>{post.title}</h1>
          <p style={{fontFamily:FONT,fontSize:15,color:C.muted,marginBottom:8,fontStyle:'italic'}}>{post.subheading}</p>
          <p style={{fontFamily:FONT,fontSize:13,color:C.muted,marginBottom:24}}>{post.author} · {post.date} · {post.read} read</p>
          {post.quote&&<blockquote style={{borderLeft:`4px solid ${C.primary}`,paddingLeft:18,margin:'0 0 24px',fontStyle:'italic',fontSize:16,color:C.text,lineHeight:1.7,fontFamily:FONT}}>"{post.quote}"</blockquote>}
          {post.html
            ?<div className="blog-body" style={{fontFamily:FONT,fontSize:15,color:C.text,lineHeight:1.85}} dangerouslySetInnerHTML={{__html:post.body}}/>
            :<div style={{fontFamily:FONT,fontSize:15,color:C.text,lineHeight:1.85,whiteSpace:'pre-wrap'}}>{post.body}</div>}
          <div className="card" style={{marginTop:32,padding:'24px 28px',textAlign:'center',background:'linear-gradient(135deg,#EEF5FF,#FFF5F0)'}}>
            <p style={{fontFamily:FONT,fontWeight:700,fontSize:16,color:C.text,marginBottom:14}}>Want to know how your resume scores?</p>
            <button onClick={()=>setPage('analyze')} className="btn-primary" style={{padding:'12px 28px',fontSize:14}}>Analyse My Resume Free →</button>
          </div>
        </div>
      ):(
        <>
          <div style={{textAlign:'center',marginBottom:40}}>
            <h2 style={{fontFamily:FONT,fontWeight:800,fontSize:34,color:C.text,marginBottom:10}}>Resume & Career Blog</h2>
            <p style={{fontSize:15,color:C.muted,fontFamily:FONT}}>Expert advice on resumes, job search, and the Indian job market</p>
          </div>
          <div className="card" onClick={()=>setPost(featured)} style={{marginBottom:28,cursor:'pointer',overflow:'hidden'}}>
            <PostImage src={featured.imageUrl} alt={featured.title} height={300}/>
            <div style={{padding:'22px 26px'}}><Tag text={featured.tag} variant="news"/><h2 style={{fontFamily:FONT,fontWeight:800,fontSize:24,color:C.text,margin:'10px 0 8px',lineHeight:1.2}}>{featured.title}</h2><p style={{fontFamily:FONT,fontSize:14,color:C.muted,marginBottom:12,lineHeight:1.6}}>{featured.subheading}</p>{featured.quote&&<blockquote style={{borderLeft:`3px solid ${C.primary}`,paddingLeft:12,fontStyle:'italic',fontSize:13,color:C.muted,marginBottom:12,fontFamily:FONT}}>"{featured.quote}"</blockquote>}<p style={{fontFamily:FONT,fontSize:12,color:C.muted}}>{featured.author} · {featured.date} · {featured.read} read</p></div>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(290px,1fr))',gap:20}}>
            {rest.map(p=><div key={p.id} className="card" onClick={()=>setPost(p)} style={{cursor:'pointer',overflow:'hidden'}} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
              <PostImage src={p.imageUrl} alt={p.title} height={170}/>
              <div style={{padding:'16px 18px'}}><Tag text={p.tag} variant="news"/><h3 style={{fontFamily:FONT,fontWeight:800,fontSize:16,color:C.text,margin:'10px 0 7px',lineHeight:1.25}}>{p.title}</h3><p style={{fontFamily:FONT,fontSize:13,color:C.muted,lineHeight:1.6,marginBottom:12}}>{p.subheading}</p><div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><span style={{fontFamily:FONT,fontSize:12,color:C.muted}}>{p.date} · {p.read}</span><span style={{fontFamily:FONT,fontSize:13,fontWeight:700,color:C.primary}}>Read →</span></div></div>
            </div>)}
          </div>
        </>
      )}
    </div>
  );
}

// ─── BLOG ADMIN ───────────────────────────────────────────────────────────────
const HTML_SNIPPETS=[
  ['🖼️ Image','\n<img src="PASTE_IMAGE_URL_HERE" alt="" />\n'],
  ['❝ Quote','\n<blockquote>Your quote here</blockquote>\n'],
  ['H3','\n<h3>Heading</h3>\n'],
  ['H4','\n<h4>Sub-heading</h4>\n'],
  ['B','<strong>bold text</strong>'],
  ['I','<em>italic text</em>'],
  ['🔗 Link','<a href="https://" target="_blank" rel="noopener">link text</a>'],
  ['• List','\n<ul><li>Item one</li><li>Item two</li></ul>\n'],
  ['1. List','\n<ol><li>Item one</li><li>Item two</li></ol>\n'],
  ['¶','\n<p>New paragraph</p>\n'],
];

function BlogAdmin(){
  const blank={id:'',title:'',subheading:'',tag:'',imageUrl:'',quote:'',body:'',author:'ResumebhAI Team',date:'',read:'5 min',html:true};
  const [posts,setPosts]=useState([]);const [form,setForm]=useState(blank);const [saving,setSaving]=useState(false);const [msg,setMsg]=useState('');const [preview,setPreview]=useState(false);
  const bodyRef=useRef(null);
  const set=(k,v)=>setForm(p=>({...p,[k]:v}));
  useEffect(()=>{DB.loadPosts().then(db=>{const ids=new Set(db.map(p=>p.id));setPosts([...db,...DEFAULT_POSTS.filter(p=>!ids.has(p.id))]);});},[]);
  const insertSnippet=(snippet)=>{
    const ta=bodyRef.current;
    if(!ta){set('body',form.body+snippet);return;}
    const start=ta.selectionStart,end=ta.selectionEnd;
    const next=form.body.slice(0,start)+snippet+form.body.slice(end);
    set('body',next);
    requestAnimationFrame(()=>{ta.focus();ta.selectionStart=ta.selectionEnd=start+snippet.length;});
  };
  const save=async()=>{
    if(!form.title||!form.body){setMsg('Title and body are required.');return;}
    setSaving(true);
    const entry={...form,id:form.id||Date.now().toString(),date:form.date||new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})};
    await DB.savePost(entry);setPosts(p=>[entry,...p.filter(x=>x.id!==entry.id)]);setForm(blank);setMsg('✅ Post saved!');setSaving(false);setTimeout(()=>setMsg(''),3000);
  };
  const del=async id=>{if(!window.confirm('Delete this post?'))return;await DB.deletePost(id);setPosts(p=>p.filter(x=>x.id!==id));};
  return(
    <div style={{maxWidth:820,margin:'0 auto',padding:'50px clamp(16px,4vw,32px)'}}>
      <h2 style={{fontFamily:FONT,fontWeight:800,fontSize:30,color:C.text,marginBottom:8}}>✍️ Manage Blog</h2>
      <p style={{fontSize:14,color:C.muted,marginBottom:28,fontFamily:FONT}}>Admin only · {FB_READY?'Saved to Firebase':'Saved locally (configure Firebase for live blog)'}.</p>
      <div className="card" style={{padding:28,marginBottom:28}}>
        <h3 style={{fontFamily:FONT,fontWeight:700,fontSize:17,color:C.text,marginBottom:18}}>{form.id?'Edit Post':'Add New Post'}</h3>
        {form.imageUrl&&<img src={form.imageUrl} alt="" style={{width:'100%',height:160,objectFit:'cover',borderRadius:10,marginBottom:16}} onError={e=>e.target.style.display='none'}/>}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14,marginBottom:14}}>
          {[['title','Title *','Post title'],['subheading','Subheading','One-line shown in cards'],['tag','Tag','ATS Strategy, Writing Tips...'],['imageUrl','Image URL','https://...'],['quote','Pull Quote (optional)','Short memorable line'],['author','Author','ResumebhAI Team'],['date','Date (blank = today)','15 June 2025']].map(([k,l,p])=><div key={k}><label style={{fontWeight:700,fontSize:12,color:C.text,display:'block',marginBottom:5,textTransform:'uppercase',letterSpacing:'.6px',fontFamily:FONT}}>{l}</label><input value={form[k]} onChange={e=>set(k,e.target.value)} placeholder={p} style={{padding:'9px 12px'}}/></div>)}
        </div>
        <div style={{marginBottom:14}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:5,flexWrap:'wrap',gap:8}}>
            <label style={{fontWeight:700,fontSize:12,color:C.text,textTransform:'uppercase',letterSpacing:'.6px',fontFamily:FONT}}>Article Body *</label>
            <div style={{display:'flex',gap:14,alignItems:'center'}}>
              <label style={{display:'flex',alignItems:'center',gap:6,fontSize:12,fontFamily:FONT,color:C.muted,cursor:'pointer'}}><input type="checkbox" checked={!!form.html} onChange={e=>set('html',e.target.checked)} style={{width:'auto'}}/>HTML formatting</label>
              {form.html&&<button type="button" onClick={()=>setPreview(p=>!p)} className="btn-secondary" style={{padding:'5px 12px',fontSize:12}}>{preview?'✏️ Edit':'👁 Preview'}</button>}
            </div>
          </div>
          {form.html&&!preview&&<div style={{display:'flex',flexWrap:'wrap',gap:6,marginBottom:8}}>
            {HTML_SNIPPETS.map(([label,snippet])=><button key={label} type="button" onClick={()=>insertSnippet(snippet)} className="btn-secondary" style={{padding:'5px 10px',fontSize:12}}>{label}</button>)}
          </div>}
          {preview
            ?<div className="blog-body" style={{border:`1px solid ${C.border}`,borderRadius:10,padding:'14px 16px',minHeight:180,maxHeight:400,overflowY:'auto',fontFamily:FONT,fontSize:14,color:C.text}} dangerouslySetInnerHTML={{__html:form.body}}/>
            :<textarea ref={bodyRef} value={form.body} onChange={e=>set('body',e.target.value)} placeholder={form.html?'Write HTML directly, or use the buttons above to insert images, quotes, headings etc.':'Full article text. Blank lines = paragraphs.'} rows={12} style={{padding:'10px 12px',resize:'vertical',fontFamily:form.html?"'Courier New',monospace":'inherit',fontSize:13}}/>}
        </div>
        {msg&&<div style={{background:msg.startsWith('✅')?'#E3FBF3':'#FFF0EC',border:`1px solid ${msg.startsWith('✅')?'#9FE1CB':'#FFCBB8'}`,borderRadius:8,padding:'9px 13px',fontSize:13,color:msg.startsWith('✅')?'#0A7D5A':'#C73800',marginBottom:12,fontFamily:FONT}}>{msg}</div>}
        <div style={{display:'flex',gap:10}}><button onClick={save} disabled={saving} className="btn-primary" style={{padding:'12px 26px',fontSize:14,display:'flex',alignItems:'center',gap:8}}>{saving?<><Spinner/>Saving…</>:form.id?'Update Post':'Publish Post'}</button>{form.id&&<button onClick={()=>setForm(blank)} className="btn-secondary" style={{padding:'12px 18px',fontSize:14}}>Cancel</button>}</div>
      </div>
      {posts.length>0&&<div><h3 style={{fontFamily:FONT,fontWeight:700,fontSize:17,color:C.text,marginBottom:14}}>Published Posts ({posts.length})</h3>
        <div style={{display:'flex',flexDirection:'column',gap:10}}>{posts.map(p=><div key={p.id} className="card" style={{padding:'14px 18px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:12,flexWrap:'wrap'}}>
          <div style={{display:'flex',gap:12,alignItems:'center'}}>{p.imageUrl&&<img src={p.imageUrl} alt="" style={{width:56,height:40,objectFit:'cover',borderRadius:7}} onError={e=>e.target.style.display='none'}/>}<div><p style={{fontFamily:FONT,fontWeight:700,fontSize:13,color:C.text}}>{p.title}</p><p style={{fontFamily:FONT,fontSize:12,color:C.muted}}>{p.tag} · {p.date}</p></div></div>
          <div style={{display:'flex',gap:8}}><button onClick={()=>{setForm({...blank,...p});window.scrollTo(0,0);}} className="btn-secondary" style={{padding:'6px 14px',fontSize:12}}>Edit</button><button onClick={()=>del(p.id)} style={{padding:'6px 14px',fontSize:12,borderRadius:9,border:'none',background:'#FFF0EC',color:C.danger,cursor:'pointer',fontFamily:FONT,fontWeight:700}}>Delete</button></div>
        </div>)}</div>
      </div>}
    </div>
  );
}

// ─── ABOUT PAGE ───────────────────────────────────────────────────────────────
function AboutPage({setPage}){
  return(
    <div>
      <div style={{background:'linear-gradient(155deg,#EBF0FF 0%,#F3F6FF 50%,#FFF5F0 100%)',padding:'80px clamp(16px,5vw,56px) 60px',textAlign:'center'}}>
        <h1 style={{fontFamily:FONT,fontWeight:800,fontSize:'clamp(26px,4.5vw,48px)',color:C.text,marginBottom:16}}>About ResumebhAI</h1>
        <p style={{fontSize:17,color:C.muted,maxWidth:560,margin:'0 auto',lineHeight:1.75,fontFamily:FONT}}>We built the resume tool we wished existed — honest analysis, Indian market savvy, and zero subscription traps.</p>
      </div>
      <div style={{maxWidth:980,margin:'0 auto',padding:'60px clamp(16px,4vw,32px)'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:56,alignItems:'center',marginBottom:60}}>
          <div><Tag text="Our Story"/><h2 style={{fontFamily:FONT,fontWeight:800,fontSize:26,color:C.text,margin:'14px 0 14px'}}>Built for the Indian job seeker</h2><p style={{fontSize:15,color:C.muted,lineHeight:1.8,marginBottom:12,fontFamily:FONT}}>Global resume tools don't understand Naukri, Indian ATS, or the conventions at L&T, TCS, or Shapoorji. We do.</p><p style={{fontSize:15,color:C.muted,lineHeight:1.8,fontFamily:FONT}}>Free analysis, always. Pay ₹199 once for the AI career pack — no subscriptions, no monthly charges.</p></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>{[['🎯','Mission-Driven','Help every professional land their next role'],['🤖','AI-Powered','Recruiter-grade analysis + instant algorithmic checks'],['🔒','Privacy First','Résumé processed in your browser — never stored'],['🇮🇳','India-First','Built for Naukri, Indian ATS, and Indian hiring']].map(([i,t,d])=><div key={t} className="card" style={{padding:18}}><div style={{fontSize:20,marginBottom:8}}>{i}</div><h4 style={{fontFamily:FONT,fontWeight:700,fontSize:13,color:C.text,marginBottom:5}}>{t}</h4><p style={{fontSize:12,color:C.muted,lineHeight:1.6,fontFamily:FONT}}>{d}</p></div>)}</div>
        </div>
        <div style={{background:'linear-gradient(135deg,#4361EE,#7B2FBE)',borderRadius:20,padding:'44px 36px',display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:20,textAlign:'center',marginBottom:60}}>
          {[['Free','Full analysis, always'],['₹199','One-time career pack'],['9','Algorithmic checks'],['0','Monthly charges']].map(([v,l])=><div key={l}><div style={{fontFamily:FONT,fontWeight:800,fontSize:28,color:'#fff',marginBottom:5}}>{v}</div><div style={{fontSize:13,color:'rgba(255,255,255,.72)',fontFamily:FONT}}>{l}</div></div>)}
        </div>
        <div style={{textAlign:'center'}}><h2 style={{fontFamily:FONT,fontWeight:700,fontSize:24,color:C.text,marginBottom:14}}>Ready to check your resume?</h2><button onClick={()=>setPage('analyze')} className="btn-primary" style={{padding:'14px 40px',fontSize:16,borderRadius:14}}>Start Free Analysis →</button></div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [user,setUser]=useState(null);
  const [page,setPage]=useState('home');
  const [showAuthModal,setShowAuthModal]=useState(false);
  const [authReason,setAuthReason]=useState('');
  const [file,setFile]=useState(null);
  const [b64,setB64]=useState(null);
  const [fileText,setFileText]=useState(null);
  const [previewText,setPreviewText]=useState('');
  const [form,setForm]=useState({industry:'',targetRole:'',experience:'',jobDescription:''});
  const [loading,setLoading]=useState(false);
  const [loadingMsg,setLoadingMsg]=useState('');
  const [algoResult,setAlgoResult]=useState(null);
  const [analysis,setAnalysis]=useState(null);
  const [analysisId,setAnalysisId]=useState(null);
  const [viewReport,setViewReport]=useState(null);
  const [error,setError]=useState('');
  const [pendingAnalysis,setPendingAnalysis]=useState(false);
  const [showVerifyWall,setShowVerifyWall]=useState(false);

  useEffect(()=>{const s=getSession();if(s)setUser(s);},[]);

  const showAuth=(reason='')=>{setAuthReason(reason);setShowAuthModal(true);};

  const handleFile=useCallback(async f=>{
    if(!f)return; setFile(f); setError(''); setAlgoResult(null); setPreviewText('');
    const isPDF=f.type==='application/pdf'||f.name.endsWith('.pdf');
    if(isPDF){
      const r=new FileReader();
      r.onload=async e=>{
        const b=e.target.result.split(',')[1];
        try{
          const t=await extractPDFText(b);
          const chk=isLikelyResume(t);
          if(!chk.ok){setError('🚫 '+chk.reason);setFile(null);setB64(null);return;}
          setB64(b);setFileText(null);setAlgoResult(runAlgorithmicAnalysis(t));setPreviewText(t);
        }catch{setError('Could not read PDF. Try a different file.');setFile(null);}
      };
      r.readAsDataURL(f);
    } else {
      try{
        const ab=await f.arrayBuffer();
        const mammothLib=await import('mammoth');
        const res=await mammothLib.extractRawText({arrayBuffer:ab});
        const chk=isLikelyResume(res.value);
        if(!chk.ok){setError('🚫 '+chk.reason);setFile(null);return;}
        setFileText(res.value);setB64(null);setAlgoResult(runAlgorithmicAnalysis(res.value));setPreviewText(res.value);
      }
      catch{setError('Could not read Word file. Try saving as PDF.');setFile(null);}
    }
  },[]);

  const analyzeResume=async()=>{
    if(!b64&&!fileText){setError('Please upload a resume file.');return;}
    if(!algoResult){setError('Could not extract text from this file. Try a different file.');return;}
    if(!form.industry.trim()||!form.targetRole.trim()||!String(form.experience).trim()){setError('Please fill in Industry, Target Role, and Years of Experience.');return;}
    if(form.jobDescription.trim().split(/\s+/).filter(Boolean).length<50){setError('Please paste a Job Description of at least 50 words.');return;}
    if(!user){
      setPendingAnalysis(true);
      showAuth('Create a free account to see your resume analysis');
      return;
    }
    if(FB_READY&&!user.emailVerified){setShowVerifyWall(true);return;}
    setAnalysisId(Date.now().toString());setAnalysis(null);setPage('results');
  };

  const saveAnalysis=async()=>{
    if(!user){showAuth('Sign in to save your report and view it from any device');return;}
    const entry={id:analysisId||Date.now().toString(),date:new Date().toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),name:form.targetRole||'Resume',targetRole:form.targetRole,industry:form.industry,score:algoResult?.overallScore||3,analysis,form,algoResult};
    await DB.saveAnalysis(user.id,entry);
    alert('✅ Report saved! View from My Saved Reports.');
  };

  const activeAlgo = viewReport?viewReport.algoResult:algoResult;
  const activeAnalysis = viewReport?viewReport.analysis:analysis;
  const activeForm = viewReport?viewReport.form:form;
  const activeId = viewReport?viewReport.id:analysisId;

  const handleAuth=async(u)=>{
    setUser(u);setShowAuthModal(false);
    try{await DB.storeUser(u);}catch(e){console.error('storeUser failed:',e);}
    if(FB_READY&&!u.emailVerified){setShowVerifyWall(true);return;}
    if(pendingAnalysis&&algoResult){
      setPendingAnalysis(false);
      setAnalysisId(Date.now().toString());setAnalysis(null);setPage('results');
    }
  };
  const handleVerified=()=>{
    const updated={...user,emailVerified:true};
    setUser(updated);setSession(updated);setShowVerifyWall(false);
    if(pendingAnalysis&&algoResult){
      setPendingAnalysis(false);
      setAnalysisId(Date.now().toString());setAnalysis(null);setPage('results');
    }
  };
  const logout=()=>{clearSession();setUser(null);setShowVerifyWall(false);setPendingAnalysis(false);};

  return(
    <div style={{minHeight:'100vh',background:C.bg}}>
      <style>{globalCSS}</style>
      {showAuthModal&&<AuthModal onAuth={handleAuth} onClose={()=>{setShowAuthModal(false);setPendingAnalysis(false);}} reason={authReason}/>}
      <Navbar page={page} setPage={p=>{if(p!=='results')setViewReport(null);setPage(p);}} user={user} onLogout={logout} showAuth={()=>showAuth()}/>
      {showVerifyWall
        ?<EmailVerificationWall email={user?.email} onVerified={handleVerified} onLogout={()=>{logout();setShowVerifyWall(false);}}/>
        :<>
      {page==='home'    &&<HomePage setPage={setPage} showAuth={showAuth} user={user}/>}
      {page==='analyze' &&<AnalyzePage form={form} setForm={setForm} file={file} handleFile={handleFile} loading={loading} loadingMsg={loadingMsg} analyzeResume={analyzeResume} error={error} previewText={previewText}/>}
      {page==='results' &&<ResultsPage analysis={activeAnalysis} algoResult={activeAlgo} form={activeForm} saveAnalysis={saveAnalysis} setPage={setPage} user={user} analysisId={activeId} showAuth={showAuth}/>}
      {page==='blog'    &&<BlogPage user={user} setPage={setPage}/>}
      {page==='blog-admin'&&isAdmin(user)&&<BlogAdmin/>}
      {page==='about'   &&<AboutPage setPage={setPage}/>}
      {page==='reports' &&user&&<ReportsPage userId={user.id} setPage={setPage} setViewReport={setViewReport}/>}
      </>}
      <Footer setPage={setPage}/>
    </div>
  );
}