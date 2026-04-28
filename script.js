// ============================================
// CONFIGURATION
// ============================================
const POEMS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8H2Fr0k4C4L1T6aBDTFp6Qm-OBdA61wCexL5jiEIt2XXeXwcUn-rIzMlPNtRhntUcONR93HwZmraR/pub?gid=0&single=true&output=csv";
const NOVELS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQTdMtQUXDld48piMW2uGrGev030agZacHpEVcpIIO7C-fyIMSWF1oh_0PQiRGRZ1S6pQVqMK7rGP9L/pub?gid=0&single=true&output=csv";
// Replace the URL below with your actual Short Stories Sheet CSV URL
const STORIES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT2xEwpsYvHyd7gLuSJ8J5cC4WJcjBNv1cPajVumCn-Kt5Eqk_S37g7P7bOJijbl1LJgaCoDC8bl3bw/pub?gid=0&single=true&output=csv"
const EMAILJS_PUBLIC_KEY = "nrzZqd-KWp06iFnYt"; 
const EMAILJS_SERVICE_ID = "service_8e409wl"; 
const EMAILJS_TEMPLATE_ID = "template_uk80jev"; 
const DISQUS_SHORTNAME = "yeasin-poetry"; 

// Initialize EmailJS
(function() { emailjs.init(EMAILJS_PUBLIC_KEY); })();

// Global State
let allPoems = [];
let novelsDB = [];
let allStories = []; // Added for Short Stories
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
    // Load Poems
    Papa.parse(POEMS_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allPoems = results.data.filter(item => item.title && item.text);
            document.getElementById('loading-poems').style.display = 'none';
            renderPoems();
        }
    });
    // Load Novels
    Papa.parse(NOVELS_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            processNovelsData(results.data);
            document.getElementById('loading-novels').style.display = 'none';
            renderNovelLibrary();
        }
    });
    // Load Short Stories
    Papa.parse(STORIES_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allStories = results.data.filter(item => item.story_title && item.story_text);
            renderStoryLibrary();
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

function openPoem(index) {
    window.location.hash = "poem=" + index;
    document.getElementById('poem-title-display').innerText = allPoems[index].title;
    document.getElementById('poem-content-display').innerHTML = allPoems[index].text;
    switchView('reader-view');
    loadDisqus(index, allPoems[index].title);
}

function renderNovelLibrary() {
    const container = document.getElementById('novel-list-container'); container.innerHTML = '';
    novelsDB.forEach((novel, index) => {
        const card = document.createElement('div'); card.className = 'novel-card';
        card.innerHTML = `<h3>${novel.title}</h3><div class="novel-meta"><span>${novel.author}</span></div><div class="novel-summary">${novel.summary}</div><button class="read-btn" onclick="startReading(${index})">পড়া শুরু করুন</button>`;
        container.appendChild(card);
    });
}

// --- SHORT STORY RENDERING ---
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
    const display = document.getElementById('poem-content-display');
    document.getElementById('poem-title-display').innerText = story.story_title;
    // Replace newlines with <br> and style for justification
    display.innerHTML = `<div style="text-align:justify; font-size:1.1rem; line-height:1.8;">${story.story_text.replace(/\n/g, '<br>')}</div>`;
    switchView('reader-view');
    document.getElementById('reader-view').scrollTop = 0;
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

// --- SECRET VAULT LOGIC ---
function openSecretVaultInput() { 
    if(prompt("ENTER ACCESS CODE:") === "3460") { 
        switchView('secret-vault'); 
        document.getElementById('vault-audio').play(); 
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
    event.target.classList.add('active'); 
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
function setupMusic() { 
    window.music = document.getElementById('bg-music'); 
    const playOnce = () => { if(window.music.paused) window.music.play(); document.removeEventListener('click', playOnce); };
    document.addEventListener('click', playOnce); 
}
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
    container.innerHTML = ''; 
    for (let i = 0; i < 10; i++) { 
        const fly = document.createElement('div'); fly.classList.add('firefly'); 
        fly.style.left = Math.random() * 100 + 'vw'; fly.style.top = Math.random() * 100 + 'vh'; 
        container.appendChild(fly); 
    } 
}
function triggerConfetti() { 
    const c = document.getElementById('confetti-canvas'); 
    c.style.display = 'block'; setTimeout(() => c.style.display = 'none', 3000); 
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
const canvas = document.getElementById('particles'); const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth; canvas.height = window.innerHeight;
let particlesArray = [];
class Particle { 
    constructor() { this.x = Math.random() * canvas.width; this.y = Math.random() * canvas.height; this.size = Math.random() * 2; this.opacity = Math.random(); } 
    update() { this.y += 0.2; if(this.y > canvas.height) this.y=0; } 
    draw() { ctx.fillStyle = `rgba(255, 215, 0, ${this.opacity})`; ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill(); } 
}
function initParticles() { for(let i=0; i<40; i++) particlesArray.push(new Particle()); } 
function animateParticles() { ctx.clearRect(0,0,canvas.width,canvas.height); particlesArray.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animateParticles); }

// External Services
function loadDisqus(id, title) {
    if(typeof DISQUS !== 'undefined') { DISQUS.reset({ reload: true, config: function () { this.page.identifier = 'poem-' + id; this.page.title = title; }}); } 
    else { var d = document, s = d.createElement('script'); s.src = 'https://' + DISQUS_SHORTNAME + '.disqus.com/embed.js'; s.setAttribute('data-timestamp', +new Date()); (d.head || d.body).appendChild(s); }
}
function sendRealEmail() { /* EmailJS logic... */ emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { from_name: document.getElementById('contact-name').value, message: document.getElementById('contact-msg').value }).then(() => alert("Sent!")); }
function sendDiaryToEmail() { /* EmailJS logic... */ emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { from_name: document.getElementById('story-author-name').value, message: document.getElementById('story-content-input').value }).then(() => alert("Sent!")); }
function handleRealSubscribe() { const email = document.getElementById('sub-email').value; if(email) emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { from_email: email, type: "Subscription" }).then(() => alert("Subscribed!")); }
function toggleSettings() { const panel = document.getElementById('settings-panel'); panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; }
function changeFont(dir) { const root = document.documentElement; let current = parseFloat(getComputedStyle(root).getPropertyValue('--text-size')); root.style.setProperty('--text-size', (current + (dir * 0.1)) + 'rem'); }
function backToLibrary() { switchView('novel-library'); }
function openNovelLibrary() { switchView('novel-library'); }

let petalInterval;
function startPetals() {
    const container = document.getElementById('petals-container');
    petalInterval = setInterval(() => {
        const petal = document.createElement('div');
        petal.classList.add('petal');
        petal.style.left = Math.random() * 100 + "vw";
        petal.style.animationDuration = Math.random() * 3 + 3 + "s";
        container.appendChild(petal);
        setTimeout(() => petal.remove(), 5000);
    }, 300);
}
function stopPetals() { clearInterval(petalInterval); }