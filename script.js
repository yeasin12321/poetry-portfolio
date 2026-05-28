// ============================================
// CONFIGURATION
// ============================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxKwPIBZOxrsrvdI5WCCDxfppV2PHJTMJ_rd-G1C9bU1VV8jJVt1PA4f7dgddlFxAyT/exec";

const POEMS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8H2Fr0k4C4L1T6aBDTFp6Qm-OBdA61wCexL5jiEIt2XXeXwcUn-rIzMlPNtRhntUcONR93HwZmraR/pub?gid=0&single=true&output=csv";
const NOVELS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTdMtQUXDld48piMW2uGrGev030agZacHpEVcpIIO7C-fyIMSWF1oh_0PQiRGRZ1S6pQVqMK7rGP9L/pub?gid=0&single=true&output=csv";
const STORIES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT2xEwpsYvHyd7gLuSJ8J5cC4WJcjBNv1cPajVumCn-Kt5Eqk_S37g7P7bOJijbl1LJgaCoDC8bl3bw/pub?gid=0&single=true&output=csv";
// আপনার মোনোলগ শিটের CSV লিঙ্ক এখানে বসান
const MONOLOGUE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTh4aqebFj9oWpmlhmQ4kNAK0rcwM4-aMUrRSt2MsbiOtju9Z-6qaclSkQUL1TYSH4ox_hw_UWqKnI-/pub?gid=0&single=true&output=csv";
const SAYERI_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQHoOD1vOrCyaVCuY_WJaVUkLL70iwKTmZ2OGNuyzTTNg2PPxDDY12p08e6Eu75wZcGSUiRouIFVOmZ/pub?gid=0&single=true&output=csv";
const GALLERY_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSYIZNe_bFTDcs7beh1VPZtWbnxkMgbVtGwhqlyF4BSZA-m9xe3oh_LmbaTWkCpWK9Gom9wzeidrtej/pub?gid=0&single=true&output=csv";
const VIDEO_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQtCKVcATsEMBVJTO20bNxD7wZ1qCRN_UEwPrOedcBf8k8nIbWTkeZ6GnMFitJzT3VqZFQvpOKO3giR/pub?gid=0&single=true&output=csv";

const EMAILJS_PUBLIC_KEY = "nrzZqd-KWp06iFnYt"; 
const EMAILJS_SERVICE_ID = "service_8e409wl"; 
const EMAILJS_TEMPLATE_ID = "template_uk80jev"; 

// Initialize EmailJS
(function() { emailjs.init(EMAILJS_PUBLIC_KEY); })();

// Global State
let allPoems = [];
let allGalleryImages = [];
let allVideos = [];
let novelsDB = [];
let allStories = []; 
let allSayeri = [];
let allMonologues = []; // New
let currentFilter = 'all';
let currentBookIndex = 0;
let currentChapterIndex = 0;
let currentVaultPage = 1;
const totalVaultPages = 14;

window.onload = () => {
    loadAllData();
    setTimeout(() => {
        document.getElementById('preloader').style.display = 'none';
        checkUrlHash();
    }, 4500);
    AOS.init({ duration: 800, once: true });
    
    let visitors = localStorage.getItem('tv') || 14200;
    document.getElementById('total-visitors').innerText = parseInt(visitors).toLocaleString();
    
    createFireflies();
    setupMusic();
    type();
    initParticles();
    animateParticles();
};

// --- DATA LOADING ---
function loadAllData() {
    // Load Poems[cite: 3]
    Papa.parse(POEMS_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allPoems = results.data.filter(item => item.title && item.text);
            document.getElementById('loading-poems').style.display = 'none';
            renderPoems();
        }
    });
    // Load Gallery Images from Google Sheet
    Papa.parse(GALLERY_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allGalleryImages = results.data.filter(item => item.img_src);
            renderGallery();
        }
    });
    // Load Video Gallery from Google Sheet
    Papa.parse(VIDEO_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allVideos = results.data.filter(item => item.video_url);
            renderVideos();
        }
    });
    // Load Novels[cite: 3]
    Papa.parse(NOVELS_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            processNovelsData(results.data);
            document.getElementById('loading-novels').style.display = 'none';
            renderNovelLibrary();
        }
    });
    // Load Short Stories[cite: 3]
    Papa.parse(STORIES_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allStories = results.data.filter(item => item.story_title && item.story_text);
            renderStoryLibrary();
        }
    });
    // Load Sayeri
    Papa.parse(SAYERI_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allSayeri = results.data.filter(item => item.text);
            const loader = document.getElementById('loading-sayeri');
            if(loader) loader.style.display = 'none';
            renderSayeri();
        }
    });
    // Load Monologues (New)
    Papa.parse(MONOLOGUE_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allMonologues = results.data.filter(item => item.title && item.text);
            const loader = document.getElementById('loading-monologues');
            if(loader) loader.style.display = 'none';
            renderMonologues();
        }
    });
}

function processNovelsData(flatData) {
    let novelMap = {};
    flatData.forEach(row => {
        if(!row.id || !row.novel_title) return;
        if (!novelMap[row.id]) {
            novelMap[row.id] = { id: row.id, title: row.novel_title, author: row.author, summary: row.summary, chapters: [] };
        }
        novelMap[row.id].chapters.push({ title: row.chapter_title, text: row.chapter_text });
    });
    novelsDB = Object.values(novelMap);
}

// --- RENDERING ---
function renderPoems() {
    const listDiv = document.getElementById('buttons-list');
    listDiv.innerHTML = '';
    const searchVal = document.getElementById('search-bar').value.toLowerCase();
    
    allPoems.forEach((poem, index) => {
        if((currentFilter === 'all' || poem.tag === currentFilter) && poem.title.toLowerCase().includes(searchVal)) {
            const btn = document.createElement('div');
            btn.className = 'poem-btn'; btn.setAttribute('data-aos', 'fade-up');
            btn.innerHTML = `<span>${poem.title}</span> <i class="fas fa-chevron-right"></i>`;
            btn.onclick = () => openPoem(index);
            listDiv.appendChild(btn);
        }
    });
}

function renderSayeri() {
    const container = document.getElementById('sayeri-list-container');
    if(!container) return;
    container.innerHTML = '';
    
    allSayeri.forEach((sayeri) => {
        const card = document.createElement('div');
        card.className = 'sayeri-card';
        card.setAttribute('data-aos', 'fade-up');
        card.innerHTML = `
            <div class="sayeri-text">${sayeri.text}</div>
            <div style="text-align:right; margin-top:10px; font-size:0.8rem; color:#888; font-style:italic;">- ${sayeri.author || 'Yeasin Kabir'}</div>
        `;
        container.appendChild(card);
    });
}
function renderMonologues() {
    const container = document.getElementById('monologue-list-container');
    if(!container) return;
    container.innerHTML = '';
    
    allMonologues.forEach((mono) => {
        const card = document.createElement('div');
        card.className = 'monologue-card';
        card.setAttribute('data-aos', 'fade-up');
        card.innerHTML = `
            <div class="monologue-title">${mono.title}</div>
            <div class="monologue-text">${mono.text}</div>
            <div style="text-align:right; margin-top:10px; font-size:0.8rem; color:#666;">- ${mono.author || 'Yeasin Kabir'}</div>
        `;
        container.appendChild(card);
    });
}

function openPoem(index) {
    window.location.hash = "poem=" + index;
    document.getElementById('poem-title-display').innerText = allPoems[index].title;
    document.getElementById('poem-content-display').innerHTML = allPoems[index].text;
    switchView('reader-view');
    loadComments();
}

function renderNovelLibrary() {
    const container = document.getElementById('novel-list-container'); container.innerHTML = '';
    novelsDB.forEach((novel, index) => {
        const card = document.createElement('div'); card.className = 'novel-card';
        card.innerHTML = `<h3>${novel.title}</h3><div class="novel-meta"><span>${novel.author}</span></div><div class="novel-summary">${novel.summary}</div><button class="read-btn" onclick="startReading(${index})">পড়া শুরু করুন</button>`;
        container.appendChild(card);
    });
}

function renderStoryLibrary() {
    const container = document.getElementById('story-list-container');
    if(!container) return;
    container.innerHTML = '';
    allStories.forEach((story, index) => {
        const card = document.createElement('div'); card.className = 'novel-card';
        card.innerHTML = `<h3>${story.story_title}</h3><div class="novel-meta"><span>${story.author || 'Yeasin Kabir'}</span></div><div class="novel-summary">${story.summary || ''}</div><button class="read-btn" onclick="openStory(${index})">গল্পটি পড়ুন</button>`;
        container.appendChild(card);
    });
}

function openStory(index) {
    const story = allStories[index];
    window.location.hash = "story=" + index;
    const display = document.getElementById('poem-content-display');
    document.getElementById('poem-title-display').innerText = story.story_title;
    display.innerHTML = `<div style="text-align:justify; font-size:1.1rem; line-height:1.8;">${story.story_text.replace(/\n/g, '<br>')}</div>`;
    switchView('reader-view');
    document.getElementById('reader-view').scrollTop = 0;
    loadComments();
}

// --- NOVEL READER LOGIC ---
function startReading(bookIndex) { 
    currentBookIndex = bookIndex; currentChapterIndex = 0; 
    window.location.hash = "novel=" + bookIndex;
    updateChapSelect(); switchView('novel-reader'); loadChapter(); 
}
function updateChapSelect() {
    const select = document.getElementById('chapter-dropdown'); select.innerHTML = '';
    novelsDB[currentBookIndex].chapters.forEach((chap, i) => {
        let opt = document.createElement('option'); opt.value = i; opt.text = chap.title; select.appendChild(opt);
    });
}
function loadChapter() {
    const ch = novelsDB[currentBookIndex].chapters[currentChapterIndex];
    document.getElementById('current-chapter-title').innerText = ch.title;
    document.getElementById('story-content').innerHTML = ch.text;
    document.getElementById('chapter-dropdown').value = currentChapterIndex;
    window.scrollTo(0,0);
}
function changeChapter(d) { 
    const len = novelsDB[currentBookIndex].chapters.length;
    if(currentChapterIndex + d >= 0 && currentChapterIndex + d < len) { currentChapterIndex += d; loadChapter(); }
}
function jumpToChapter(v) { currentChapterIndex = parseInt(v); loadChapter(); }

// --- COMMENT SYSTEM LOGIC ---
async function submitComment() {
    const poemId = window.location.hash;
    const name = document.getElementById('user-name').value;
    const comment = document.getElementById('user-comment').value;

    if(!name || !comment) return alert("দয়া করে নাম এবং মন্তব্য লিখুন।");

    const payload = { type: "comment", poemId: poemId, name: name, comment: comment };

    try {
        await fetch(SCRIPT_URL, { method: "POST", mode: "no-cors", body: JSON.stringify(payload) });
        alert("আপনার মন্তব্যটি জমা হয়েছে!");
        document.getElementById('user-comment').value = "";
        loadComments();
    } catch(e) { alert("দুঃখিত, মন্তব্যটি পাঠানো যায়নি।"); }
}

async function loadComments() {
    const display = document.getElementById('display-comments');
    const currentId = window.location.hash;
    try {
        const response = await fetch(SCRIPT_URL);
        const data = await response.json();
        display.innerHTML = "";
        const filtered = data.filter(row => row[0] === currentId);
        if(filtered.length === 0) {
            display.innerHTML = "<p style='color:#666; font-style:italic;'>এখনও কোনো মন্তব্য নেই। প্রথম মন্তব্যটি আপনার হোক!</p>";
        } else {
            filtered.forEach(row => {
                display.innerHTML += `<div style="background:rgba(255,255,255,0.05); padding:12px; border-radius:10px; margin-bottom:10px; border-left:3px solid var(--secondary);"><b style="color:var(--primary); font-size:0.9rem;">${row[1]}</b><p style="margin:5px 0 0; font-size:1rem; color:#eee;">${row[2]}</p></div>`;
            });
        }
    } catch(e) { display.innerHTML = "<p style='color:#e74c3c;'>মন্তব্য লোড করা সম্ভব হয়নি।</p>"; }
}

// --- SECRET VAULT LOGIC ---
function openSecretVaultInput() { 
    if(prompt("ENTER ACCESS CODE:") === "3460") { 
        switchView('secret-vault'); 
        createFireflies(); 
        startPetals();
    } else { alert("ACCESS DENIED!"); } 
}
function closeVault() { goBack(); document.getElementById('vault-audio').pause(); stopPetals(); }

function showPage(n) { 
    document.querySelectorAll('.diary-page').forEach(p=>p.classList.remove('active')); 
    document.getElementById(`page-${n}`).classList.add('active'); 
    document.getElementById('page-num').innerText = `${n} / ${totalVaultPages}`; 
    if(n === 10) loadQuiz();
}
function nextPage() { if(currentVaultPage < totalVaultPages) { currentVaultPage++; showPage(currentVaultPage); } }
function prevPage() { if(currentVaultPage > 1) { currentVaultPage--; showPage(currentVaultPage); } }

function toggleMsg(id) { let el = document.getElementById(id); el.style.display = (el.style.display === 'block') ? 'none' : 'block'; }
function generateReason() { 
    const r = ["তোমার ওই মায়াবী চোখ","আমার রাগ ভাঙাতে পারো","তোমার হাসিতে দিন ভালো হয়","আমাকে ভালো বোঝো"]; 
    document.getElementById('love-reason').innerText = r[Math.floor(Math.random()*r.length)]; 
}

// Fingerprint Scan
let scanTimer; 
function startScan(e) { 
    if(e.preventDefault) e.preventDefault(); 
    document.getElementById('scanLine').style.display='block'; 
    scanTimer=setTimeout(()=>{
        document.getElementById('promise-msg').style.display='block'; 
        document.getElementById('scanLine').style.display='none'; 
        try{navigator.vibrate(200)}catch(e){}
    },1500); 
} 
function stopScan() { clearTimeout(scanTimer); document.getElementById('scanLine').style.display='none'; }

// Quiz
const quizData = [ 
    { q: "আমার রাগ ভাঙানোর সেরা উপায় কী?", options: ["সরি বলা", "কান ধরে ওঠবস", "মিষ্টি করে একটা হাসি", "চকলেট দেওয়া"], a: 2 }, 
    { q: "আমি তোমার কোন জিনিসটা সবচেয়ে বেশি ভালোবাসি?", options: ["তোমার চোখ", "তোমার হাসি", "তোমার বোকামি", "সবগুলোই"], a: 3 }, 
    { q: "আমাদের প্রথম দেখা করার তারিখ কবে?", options: ["১২ নভেম্বর", "১৪ ফেব্রুয়ারি", "৫ নভেম্বর", "১ জানুয়ারি"], a: 0 } 
];
let currentQuiz = 0;
function loadQuiz() { 
    if(currentQuiz >= quizData.length) { 
        document.getElementById('quiz-box').innerHTML = "<h2 style='color:var(--secondary)'>অভিনন্দন জানপাখি! 🎉</h2><p style='color:#fff'>তুমি আমাকে ১০০% চেনো!</p>"; 
        return; 
    }
    const q = quizData[currentQuiz]; document.getElementById('quiz-question').innerText = q.q; 
    const optsDiv = document.getElementById('quiz-options'); optsDiv.innerHTML = ''; 
    q.options.forEach((opt, index) => { 
        const btn = document.createElement('button'); btn.className = 'quiz-btn'; btn.innerText = opt; 
        btn.onclick = () => checkAnswer(index, btn); optsDiv.appendChild(btn); 
    }); 
}
function checkAnswer(selected, btnElement) { 
    const correct = quizData[currentQuiz].a; 
    if(selected === correct) { 
        btnElement.style.background = "#2ecc71"; 
        triggerConfetti(); 
        setTimeout(() => { currentQuiz++; loadQuiz(); }, 2000); 
    } else { 
        btnElement.style.background = "#e74c3c"; 
        try{navigator.vibrate(200);}catch(e){} 
    } 
}

// Other vault functions
function handleMood(type) { 
    const msg = document.getElementById('mood-msg'); 
    if(type === 'happy') { triggerConfetti(); msg.innerText = "তোমার হাসি দেখলেই আমার দিন ভালো হয়ে যায়! 😊"; } 
    else if(type === 'sad') { msg.innerText = "কান্না করো না প্লিজ বাবু! সব ঠিক হয়ে যাবে। আমি আছি তো। ❤️"; } 
    else { msg.innerText = "আমিও তোমাকে ভীষণ মিস করছি... খুব জলদি দেখা হবে! 🤗"; } 
}
function signContract() { 
    document.getElementById('contract-stamp').style.opacity = '0.8'; 
    document.getElementById('contract-stamp').style.transform = 'rotate(-15deg) scale(1)'; 
    alert("চুক্তি স্বাক্ষরিত! ❤️"); 
}
function sendToWhatsApp() { 
    const txt = document.getElementById('wa-msg-input').value; 
    if(txt) window.open(`https://wa.me/8801851715713?text=${encodeURIComponent(txt)}`, '_blank'); 
}
function calculateLove() {
    const name1 = document.getElementById('calc-name-1').value; 
    const name2 = document.getElementById('calc-name-2').value;
    if(!name1 || !name2) return;
    const percentage = Math.floor(Math.random() * 30) + 70;
    const resultDiv = document.getElementById('love-result');
    resultDiv.style.display = 'block'; resultDiv.innerText = percentage + "% ❤️";
    triggerConfetti();
}

// Love Clock
const startDate = new Date("2024-09-14T00:00:00").getTime();
setInterval(() => { 
    const now = new Date().getTime(); 
    const d = now - startDate; 
    const display = document.getElementById("love-clock");
    if(display) display.innerHTML = `${Math.floor(d/(1000*60*60*24))} Days : ${Math.floor((d%(1000*60*60*24))/(1000*60*60))} Hr : ${Math.floor((d%(1000*60*60))/(1000*60))} Min : ${Math.floor((d%(1000*60))/1000)} Sec`; 
}, 1000);

// --- UTILS & CORE ---
function switchView(viewId) { 
    history.pushState({view:viewId}, null, ''); 
    document.getElementById('home-view').style.display='none'; 
    document.querySelectorAll('.full-view').forEach(el => el.style.display='none'); 
    document.getElementById(viewId).style.display='block'; 
    window.scrollTo(0,0); 
}
function goBack() { 
    history.pushState("", document.title, window.location.pathname + window.location.search); 
    document.querySelectorAll('.full-view').forEach(el => el.style.display='none'); 
    document.getElementById('home-view').style.display='grid'; 
}
function filterPoems() { renderPoems(); }
function filterByTag(tag) { 
    currentFilter = tag; 
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active')); 
    if(event.target) event.target.classList.add('active'); 
    renderPoems(); 
}
function checkUrlHash() { 
    const hash = window.location.hash; 
    if (hash.includes('poem=') && allPoems.length > 0) { 
        const index = parseInt(hash.split('=')[1]); 
        if (allPoems[index]) openPoem(index); 
    } else if (hash.includes('novel=') && novelsDB.length > 0) { 
        const index = parseInt(hash.split('=')[1]); 
        if (novelsDB[index]) startReading(index); 
    } 
}

// Music Logic
function setupMusic() { window.music = document.getElementById('bg-music'); }
function toggleMusic() { 
    const icon = document.getElementById('music-icon'); 
    if (window.music.paused) { 
        window.music.play(); 
        document.querySelector('.music-btn').classList.add('playing'); 
        icon.className = 'fas fa-pause'; 
    } else { 
        window.music.pause(); 
        document.querySelector('.music-btn').classList.remove('playing'); 
        icon.className = 'fas fa-play'; 
    } 
}

// Effects (Particles & Fireflies)
function createFireflies() { 
    const container = document.getElementById('firefly-container'); 
    if(!container) return;
    container.innerHTML = ''; 
    for (let i = 0; i < 10; i++) { 
        const fly = document.createElement('div'); fly.classList.add('firefly'); 
        fly.style.left = Math.random() * 100 + 'vw'; fly.style.top = Math.random() * 100 + 'vh'; 
        container.appendChild(fly); 
    } 
}
function triggerConfetti() { 
    const c = document.getElementById('confetti-canvas'); 
    if(c) { c.style.display = 'block'; setTimeout(() => c.style.display = 'none', 3000); }
}

// Typewriter
const words = ["< POET />", "< WRITER />", "< DREAMER />"]; 
let wordIdx=0, charIdx=0, isDeleting=false;
function type() { 
    const current = words[wordIdx]; 
    const target = document.getElementById('typewriter');
    if(!target) return;
    target.textContent = isDeleting ? current.substring(0, charIdx--) : current.substring(0, charIdx++); 
    if (!isDeleting && charIdx === current.length + 1) { isDeleting = true; setTimeout(type, 2000); } 
    else if (isDeleting && charIdx === 0) { isDeleting = false; wordIdx = (wordIdx + 1) % words.length; setTimeout(type, 500); } 
    else { setTimeout(type, isDeleting ? 50 : 100); } 
}

// Background Particles
const canvas = document.getElementById('particles'); 
if(canvas) {
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    let particlesArray = [];
    class Particle { 
        constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 2; this.opacity = Math.random(); } 
        update() { this.y += 0.2; if(this.y > canvas.height) this.y=0; } 
        draw() { ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } 
    }
    function initParticles() { for(let i=0; i<40; i++) particlesArray.push(new Particle()); } 
    function animateParticles() { ctx.clearRect(0,0,canvas.width,canvas.height); particlesArray.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animateParticles); }
}

// External Services
function sendRealEmail() { emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { from_name: document.getElementById('contact-name').value, message: document.getElementById('contact-msg').value }).then(() => alert("Sent!")); }
function sendDiaryToEmail() { emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { from_name: document.getElementById('story-author-name').value, message: document.getElementById('story-content-input').value }).then(() => alert("Sent!")); }
function handleRealSubscribe() { const email = document.getElementById('sub-email').value; if(email) emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { from_email: email, type: "Subscription" }).then(() => alert("Subscribed!")); }
function toggleSettings() { const panel = document.getElementById('settings-panel'); if(panel) panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; }
function changeFont(dir) { const root = document.documentElement; let current = parseFloat(getComputedStyle(root).getPropertyValue('--text-size')); root.style.setProperty('--text-size', (current + (dir * 0.1)) + 'rem'); }
function backToLibrary() { switchView('novel-library'); }
function openNovelLibrary() { switchView('novel-library'); }

let petalInterval;
function startPetals() {
    const container = document.getElementById('petals-container');
    if(!container) return;
    petalInterval = setInterval(() => {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        petal.style.left = Math.random() * 100 + "vw";
        petal.style.animationDuration = Math.random() * 3 + 3 + "s";
        container.appendChild(petal);
        setTimeout(() => petal.remove(), 5000);
    }, 300);
}
function stopPetals() { if(petalInterval) clearInterval(petalInterval); }
function renderGallery() {
    const container = document.querySelector('.gallery-grid');
    if (!container) return;
    
    container.innerHTML = ''; 
    
    if (allGalleryImages.length === 0) {
        container.innerHTML = "<p style='color:#888; text-align:center; grid-column: 1/-1;'>কোনো ছবি পাওয়া যায়নি।</p>";
        return;
    }
    
    allGalleryImages.forEach(img => {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        // ছবি ও ক্যাপশন ইভেন্ট হ্যান্ডেল করার জন্য সুরক্ষিতভাবে ভ্যারিয়েবল সেট করা
        const imgSrc = img.img_src;
        const imgCaption = img.caption ? img.caption.replace(/"/g, '&quot;') : '';
        
        // এখানে onclick ইভেন্ট যোগ করা হয়েছে যাতে ক্লিক করলে ছবি বড় হয়
        item.onclick = () => openImageModal(imgSrc, imgCaption);
        
        const captionText = img.caption ? `<div class="gallery-caption">${img.caption}</div>` : '';
        
        item.innerHTML = `
            <img src="${imgSrc}" class="gallery-img" alt="Gallery Image" style="cursor: pointer;">
            ${captionText}
        `;
        container.appendChild(item);
    });
}

// ছবি বড় করে দেখানোর ফাংশন
function openImageModal(src, caption) {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    const modalCaption = document.getElementById('modal-caption');
    
    modalImg.src = src;
    modalCaption.innerText = caption;
    
    modal.style.display = 'flex';
    // স্মুথ অ্যানিমেশনের জন্য সামান্য ডিলে দিয়ে অপাসিটি এবং স্কেল পরিবর্তন
    setTimeout(() => {
        modal.style.opacity = '1';
        modalImg.style.transform = 'scale(1)';
    }, 10);
}

// মোডাল বন্ধ করার ফাংশন
function closeImageModal() {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-img');
    
    modal.style.opacity = '0';
    modalImg.style.transform = 'scale(0.9)';
    
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300); // সিএসএস ট্রানজিশন টাইমের সাথে মিলিয়ে ৩০০ মিলি-সেকেন্ড পর হাইড হবে
}
function renderVideos() {
    const container = document.querySelector('#video-view');
    if (!container) return;
    
    // ব্যাক বাটন এবং টাইটেল ঠিক রেখে আগের ভিডিও কন্টেইনার মুছে ফেলার জন্য
    container.innerHTML = `
        <button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i> BACK</button>
        <h2 class="section-title">Video Gallery</h2>
        <div class="video-grid" style="display:grid; grid-template-columns:1fr; gap:20px; padding:10px;"></div>
    `;
    
    const grid = container.querySelector('.video-grid');
    
    if (allVideos.length === 0) {
        grid.innerHTML = "<p style='color:#888; text-align:center;'>কোনো ভিডিও পাওয়া যায়নি।</p>";
        return;
    }
    
    allVideos.forEach(vid => {
        const url = vid.video_url.trim();
        // লিঙ্ক থেকে ভিডিও আইডি বের করার রেগুলার এক্সপ্রেশন
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
        
        if (match && match[1]) {
            const videoId = match[1];
            // গুগল ড্রাইভের এম্বেড প্লেয়ার লিঙ্ক
            const embedUrl = `https://drive.google.com/file/d/${videoId}/preview`;
            
            const card = document.createElement('div');
            card.className = 'video-card-item';
            card.style.cssText = "background:rgba(255,255,255,0.02); border:1px solid #333; border-radius:12px; overflow:hidden; padding:10px;";
            
            const titleText = vid.title ? `<h3 style="font-size:1rem; margin-top:10px; color:var(--primary); font-family:'Hind Siliguri';">${vid.title}</h3>` : '';
            
            card.innerHTML = `
                <div style="position:relative; width:100%; height:0; padding-bottom:56.25%; border-radius:8px; overflow:hidden;">
                    <iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="autoplay"></iframe>
                </div>
                ${titleText}
            `;
            grid.appendChild(card);
        }
    });
}
// ============================================
// ADMIN PANEL & LINK CONVERTER LOGIC
// ============================================
const SECRET_PASSCODE = "1234"; // <--- Apnar pochondo moto passcode bosan

function toggleAdminPanel() {
    document.getElementById('admin-panel-overlay').classList.add('active');
}

function closeAdminPanel(force = false) {
    // Fixed: 'event' pass na korle kichu browser-e error dita pare, tai explicit handle kora bhalo
    if (force || (window.event && window.event.target === document.getElementById('admin-panel-overlay'))) {
        document.getElementById('admin-panel-overlay').classList.remove('active');
        // Reset inputs on close
        document.getElementById('admin-passcode').value = "";
    }
}

function verifyAdminPasscode() {
    const codeInput = document.getElementById('admin-passcode').value;
    if (codeInput === SECRET_PASSCODE) {
        document.getElementById('admin-auth-box').style.display = 'none';
        document.getElementById('admin-content-box').style.display = 'block';
    } else {
        alert("Wrong Passcode! Access Denied.");
    }
}

function convertDriveLink() {
    const inputUrl = document.getElementById('drive-input').value.trim();
    const resultDiv = document.getElementById('converter-result');
    const resultTextArea = document.getElementById('result-link');
    
    if (!inputUrl) {
        alert("Doya kore akta Google Drive share link din.");
        return;
    }
    
    // Robust Regex to match both types of Google Drive links perfectly
    const regex = /\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/;
    const match = inputUrl.match(regex);
    
    if (match) {
        // Jodi prothom group empty hoy, tobe ditio group theke id nibe
        const fileId = match[1] || match[2];
        
        // Corrected modern web view endpoint for Google Drive images
        const directLink = `https://lh3.googleusercontent.com/u/0/d/${fileId}`;
        
        resultTextArea.value = directLink;
        resultDiv.style.display = 'block';
    } else {
        alert("Oops! Linkti shothik noy. Proper share link use korun.");
        resultDiv.style.display = 'none';
    }
}

async function copyConvertedLink() {
    const copyText = document.getElementById('result-link');
    if (!copyText.value) return;
    
    try {
        await navigator.clipboard.writeText(copyText.value);
        alert("Link successfully copied to clipboard!");
    } catch (err) {
        copyText.select();
        document.execCommand('copy');
        alert("Link successfully copied!");
    }
}
