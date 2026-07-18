// ============================================
// CONFIGURATION & LIVE API CHANNELS
// ============================================
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5JmhcT7np70iTpNgP04ZOvnKLdagnDwmci5uN3QsG2t6aAUPpjk_qV5U9B1bhJuSs/exec";

const POEMS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRlpPAxUAUJ72vJCc4KPLj5hIWWDin37qTHhBKNdYAHsd3N_HpEw5lH0kXE0LbqCjQby8lUDNS6BM0q/pub?gid=763267853&single=true&output=csv";
const NOVELS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRkgCGhiJDREGrOos0Tea29m73pRCPacWMZQE3pSRSnV5mYhbgjSn8pWvXP1zGdjXR68VEIuCiL2W4U/pub?gid=1311656493&single=true&output=csv";
const STORIES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTzfIaDfNtq2rOqIvAuCOkAr0jFP30M7PmdGeEvplZeAGsN9cANbgQOW46CeiwUQeB67IJPPY_Q-JSe/pub?gid=1617707442&single=true&output=csv";
const MONOLOGUE_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSNcm6SVXNnP_DIMGcxGF9QvZ66geNFaZmt4xI-Yxl0Wbzb1bT6GQCX5-GQ4F3NC9Qi33wfzb5QMwLa/pub?gid=661967226&single=true&output=csv";
const SAYERI_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS9333MyiMbNlAHqkBnzHP0_G-B_tikgiKB3Hq1Clkhn8xbQIn0YSjAcDXZSpPzIo9J44iATMNM04Bc/pub?gid=1755852887&single=true&output=csv";
const GALLERY_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTI94hqOgRnLaeyOG-VKW1LoRUmCKWpxzhbFzw9AJB-f0T0X_bMn-Gx4XEJz_1QxuKC4XvjS0DbgR5F/pub?gid=1972328520&single=true&output=csv";
const VIDEO_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vS6PvpAlo7qba5TzP1XA6weZla_3RQ2FPSoKMyc5IUCjhwfUSwaFiE7zdL4BBAK9mjykBnDCbQWSmg8/pub?gid=1072689663&single=true&output=csv";
const MEMORIES_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQlrBbCJ7fsTrj5LByJWZRgmbOuSJHdhCzmnkVRPzJv8GXEVVpR-MS1kv3RYyN7mNMfSZDRivc-jan-/pub?gid=1726230306&single=true&output=csv";

// আপনার 'শেষ চিঠি' গুগল শিটের CSV লিংকটি নিচে বসান
const LETTERS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR576ug8K6He3n45XG424ZErBt9OJOxWrIGsZNbGKt9LZR3z8oto5F8b_KuCex6574mWKkqxXUomNZg/pub?gid=1296346762&single=true&output=csv"; 
const PDFS_SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRnDJ7yjAkNiijjDLP-3jykU8GV3_4-lEvkEAoBaXuoCmNE3Tr0Wtc7tfUgY_xngXwxbJo2Fio2JzJP/pub?gid=0&single=true&output=csv";

const EMAILJS_PUBLIC_KEY = "nrzZqd-KWp06iFnYt"; 
const EMAILJS_SERVICE_ID = "service_8e409wl"; 
const EMAILJS_TEMPLATE_ID = "template_uk80jev"; 

// Initialize EmailJS
(function() { emailjs.init(EMAILJS_PUBLIC_KEY); })();

// Global App State
let allPoems = [];
let allGalleryImages = [];
let allVideos = [];
let novelsDB = [];
let lettersDB = []; // New letters DB
let pdfCatalog = [];
let allStories = []; 
let allSayeri = [];
let allMonologues = [];
let allMemories = []; 
let currentFilter = 'all';
let currentBookIndex = 0;
let currentChapterIndex = 0;
let currentLetterBookIndex = 0;
let currentLetterPartIndex = 0;
let currentVaultPage = 1;
const totalVaultPages = 16;
let isMusicPlaying = false;
let scanTimer;
let auraTimer = null;
let auraScanned = false;

window.onload = () => {
    loadAllData();
    createPoeticLeaves();
    
    setTimeout(() => {
        document.getElementById('preloader').style.display = 'none';
        checkUrlHash();
    }, 1500);
    
    AOS.init({ duration: 900, once: true });
    
    let visitors = localStorage.getItem('tv') || 14200;
    document.getElementById('total-visitors').innerText = parseInt(visitors).toLocaleString();
    
    setupMusic();
    type();
};

window.addEventListener('hashchange', checkUrlHash);

// --- DATA FETCH MATRIX (OPTIMIZED FOR FAST LOAD) ---
function loadAllData() {
    Papa.parse(SAYERI_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allSayeri = results.data.filter(item => item.text);
            const loader = document.getElementById('loading-sayeri');
            if(loader) loader.style.display = 'none';
            renderSayeri();
        }
    });
    Papa.parse(MONOLOGUE_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allMonologues = results.data.filter(item => item.title && item.text);
            const loader = document.getElementById('loading-monologues');
            if(loader) loader.style.display = 'none';
            renderMonologues();
        }
    });
    Papa.parse(MEMORIES_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allMemories = results.data.filter(item => item.img_src && item.memory_text);
            renderMemories();
        }
    });

    Papa.parse(POEMS_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allPoems = results.data.filter(item => item.title && item.text);
            document.getElementById('loading-poems').style.display = 'none';
            renderPoems();
            checkUrlHash();
        }
    });
    Papa.parse(GALLERY_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allGalleryImages = results.data.filter(item => item.img_src);
            renderGallery();
        }
    });
    Papa.parse(VIDEO_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allVideos = results.data.filter(item => item.video_url);
            renderVideos();
        }
    });
    Papa.parse(NOVELS_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            processNovelsData(results.data);
            document.getElementById('loading-novels').style.display = 'none';
            renderNovelLibrary();
            checkUrlHash();
        }
    });
    Papa.parse(STORIES_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            allStories = results.data.filter(item => item.story_title && item.story_text);
            renderStoryLibrary();
            checkUrlHash();
        }
    });
    
    Papa.parse(PDFS_SHEET_URL, {
        download: true, header: true,
        complete: function(results) {
            pdfCatalog = results.data.filter(item => item.title && item.pdf_url);
            const loader = document.getElementById('pdf-loading-message');
            if(loader) loader.style.display = 'none';
            renderPdfLibrary();
        },
        error: function() {
            const loader = document.getElementById('pdf-loading-message');
            if(loader) loader.innerHTML = '<span style="color:#e74c3c">পিডিএফ লোড করতে সমস্যা হয়েছে।</span>';
        }
    });

    // Letters Data Parsing
    if(LETTERS_SHEET_URL !== "YOUR_LETTERS_SHEET_URL_HERE") {
        Papa.parse(LETTERS_SHEET_URL, {
            download: true, header: true,
            complete: function(results) {
                processLettersData(results.data);
                const loader = document.getElementById('loading-letters');
                if(loader) loader.style.display = 'none';
                renderLettersLibrary();
                checkUrlHash();
            }
        });
    } else {
        const loader = document.getElementById('loading-letters');
        if(loader) loader.innerHTML = "<span style='font-size:0.9rem'>শিট লিংক যুক্ত করা হয়নি।</span>";
    }
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

function processLettersData(flatData) {
    let letterMap = {};
    flatData.forEach(row => {
        if(!row.id || !row.letter_title) return;
        if (!letterMap[row.id]) {
            letterMap[row.id] = { id: row.id, title: row.letter_title, author: row.author, summary: row.summary, parts: [] };
        }
        letterMap[row.id].parts.push({ title: row.part_title, text: row.part_text });
    });
    lettersDB = Object.values(letterMap);
}

window.onpopstate = function(event) {
    if (event.state && event.state.view) {
        document.getElementById('home-view').style.display = 'none';
        document.querySelectorAll('.full-view').forEach(el => el.style.display = 'none');
        document.getElementById(event.state.view).style.display = 'block';
    } else {
        document.querySelectorAll('.full-view').forEach(el => el.style.display = 'none');
        document.getElementById('home-view').style.display = 'grid';
    }
};

// --- SHARE ROUTER SYSTEM ---
function checkUrlHash() { 
    const hash = window.location.hash; 
    if (!hash) {
        document.querySelectorAll('.full-view').forEach(el => el.style.display = 'none');
        document.getElementById('home-view').style.display = 'grid';
        return;
    }

    if (hash.includes('#poem=') && allPoems.length > 0) { 
        const index = parseInt(hash.split('=')[1]); 
        if (allPoems[index]) openPoemDirectly(index); 
    } else if (hash.includes('#story=') && allStories.length > 0) {
        const index = parseInt(hash.split('=')[1]);
        if (allStories[index]) openStoryDirectly(index);
    } else if (hash.includes('#novel=')) { 
        const mainParams = hash.split('#novel=')[1];
        if(mainParams && novelsDB.length > 0) {
            const segments = mainParams.split('&');
            const bookIdx = parseInt(segments[0]);
            let chapIdx = 0;
            if(segments[1] && segments[1].includes('chap=')) {
                chapIdx = parseInt(segments[1].split('chap=')[1]);
            }
            if (novelsDB[bookIdx]) {
                currentBookIndex = bookIdx;
                currentChapterIndex = chapIdx;
                updateChapSelect();
                document.getElementById('home-view').style.display='none'; 
                document.querySelectorAll('.full-view').forEach(el => el.style.display='none'); 
                document.getElementById('novel-reader').style.display = 'block';
                loadChapter();
            }
        }
    } else if (hash.includes('#letter=')) {
        const mainParams = hash.split('#letter=')[1];
        if(mainParams && lettersDB.length > 0) {
            const segments = mainParams.split('&');
            const bookIdx = parseInt(segments[0]);
            let partIdx = 0;
            if(segments[1] && segments[1].includes('part=')) {
                partIdx = parseInt(segments[1].split('part=')[1]);
            }
            if (lettersDB[bookIdx]) {
                currentLetterBookIndex = bookIdx;
                currentLetterPartIndex = partIdx;
                updateLetterPartSelect();
                document.getElementById('home-view').style.display='none';
                document.querySelectorAll('.full-view').forEach(el => el.style.display='none');
                document.getElementById('letter-reader').style.display = 'block';
                loadLetterPart();
            }
        }
    } else if (hash === '#secret-vault') {
        goBack();
    } else {
        const viewId = hash.substring(1);
        const targetView = document.getElementById(viewId);
        if (targetView && targetView.classList.contains('full-view')) {
            document.getElementById('home-view').style.display = 'none';
            document.querySelectorAll('.full-view').forEach(el => el.style.display = 'none');
            targetView.style.display = 'block';
        }
    }
}

function switchView(viewId) { 
    window.location.hash = viewId;
    document.getElementById('home-view').style.display='none'; 
    document.querySelectorAll('.full-view').forEach(el => el.style.display='none'); 
    const targetView = document.getElementById(viewId);
    if (targetView) {
        targetView.style.display = 'block'; 
        targetView.scrollTop = 0; // Force scroll to top
    }
    window.scrollTo(0,0); 
}

function goBack() { 
    window.location.hash = ''; 
    document.querySelectorAll('.full-view').forEach(el => el.style.display='none'); 
    document.getElementById('home-view').style.display='grid'; 
}

// --- CORE RENDERING ENGINES ---
function renderPoems() {
    const listDiv = document.getElementById('buttons-list');
    listDiv.innerHTML = '';
    const searchVal = document.getElementById('search-bar').value.toLowerCase();
    
    allPoems.forEach((poem, index) => {
        if((currentFilter === 'all' || poem.tag === currentFilter) && poem.title.toLowerCase().includes(searchVal)) {
            const btn = document.createElement('div');
            btn.className = 'poem-btn vintage-item-node'; btn.setAttribute('data-aos', 'fade-up');
            btn.innerHTML = `<span>${poem.title}</span> <i class="fas fa-chevron-right"></i>`;
            btn.onclick = () => { window.location.hash = `poem=${index}`; };
            listDiv.appendChild(btn);
        }
    });
}

function openPoemDirectly(index) {
    document.getElementById('poem-title-display').innerText = allPoems[index].title;
    document.getElementById('poem-content-display').innerHTML = allPoems[index].text.replace(/\n/g, '<br>');
    document.getElementById('home-view').style.display='none'; 
    document.querySelectorAll('.full-view').forEach(el => el.style.display='none'); 
    const readerView = document.getElementById('reader-view');
    readerView.style.display = 'block';
    readerView.scrollTop = 0; // Force scroll to top
    loadComments();
}

function renderSayeri() {
    const container = document.getElementById('sayeri-list-container');
    if(!container) return; container.innerHTML = '';
    
    if (allSayeri.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#888; font-style:italic;'>শায়রি লোড হচ্ছে...</p>";
        return;
    }

    allSayeri.forEach((sayeri, index) => {
        const card = document.createElement('div');
        card.className = 'sayeri-card vintage-paper-node';
        card.id = `sayeri-card-${index}`;
        card.setAttribute('data-aos', 'fade-up'); 
        
        const processedText = sayeri.text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
        card.innerHTML = `
            <div class="sayeri-text">${processedText}</div>
            <div style="text-align:right; margin-top:15px; font-size:0.8rem; color:#888; font-style:italic;">- ${sayeri.author || 'Yeasin Kabir'}</div>
            <div class="action-buttons-group hide-during-capture">
                <button class="sub-btn copy-btn" onclick="copyToClipboard('sayeri-card-${index}', 'sayeri')"><i class="fas fa-copy"></i> কপি করুন</button>
                <button class="sub-btn image-btn" onclick="downloadAsImage('sayeri-card-${index}', 'Sayeri_By_Yeasin')"><i class="fas fa-image"></i> ইমেজ ডাউনলোড</button>
                <button class="sub-btn pdf-btn" onclick="downloadItemPDF('sayeri-card-${index}', 'Sayeri_By_Yeasin')"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="sub-btn share-btn" onclick="nativeShare('sayeri-view', 'Sayeri by Yeasin Kabir')"><i class="fas fa-share-alt"></i> Share</button>
            </div>
        `;
        container.appendChild(card);
    });
    
    if(window.AOS) AOS.refresh();
}

// --- NOVEL CONTROL LOGIC ---
function startReading(bookIndex) { 
    window.location.hash = `novel=${bookIndex}&chap=0`; 
}

function loadChapter() {
    if (!novelsDB[currentBookIndex] || !novelsDB[currentBookIndex].chapters[currentChapterIndex]) return;
    const ch = novelsDB[currentBookIndex].chapters[currentChapterIndex];
    document.getElementById('current-chapter-title').innerText = ch.title;
    document.getElementById('story-content').innerHTML = ch.text.replace(/\n/g, '<br>');
    document.getElementById('chapter-dropdown').value = currentChapterIndex;
    document.getElementById('novel-reader').scrollTop = 0;
}

function changeChapter(d) { 
    const len = novelsDB[currentBookIndex].chapters.length;
    if(currentChapterIndex + d >= 0 && currentChapterIndex + d < len) { 
        currentChapterIndex += d; 
        window.location.hash = `novel=${currentBookIndex}&chap=${currentChapterIndex}`;
    }
}

function jumpToChapter(v) { 
    currentChapterIndex = parseInt(v); 
    window.location.hash = `novel=${currentBookIndex}&chap=${currentChapterIndex}`;
}

function updateChapSelect() {
    const select = document.getElementById('chapter-dropdown'); 
    if(!select) return;
    select.innerHTML = '';
    novelsDB[currentBookIndex].chapters.forEach((chap, i) => {
        let opt = document.createElement('option'); opt.value = i; opt.text = chap.title; select.appendChild(opt);
    });
}

function renderNovelLibrary() {
    const container = document.getElementById('novel-list-container'); container.innerHTML = '';
    novelsDB.forEach((novel, index) => {
        const card = document.createElement('div'); card.className = 'novel-card vintage-paper-node';
        card.innerHTML = `<h3>${novel.title}</h3><div class="novel-meta"><span>${novel.author}</span></div><div class="novel-summary">${novel.summary}</div><button class="read-btn" onclick="startReading(${index})">পড়া শুরু করুন</button>`;
        container.appendChild(card);
    });
}

// --- LETTERS CONTROL LOGIC ---
function renderLettersLibrary() {
    const container = document.getElementById('letters-list-container');
    if(!container) return; container.innerHTML = '';
    lettersDB.forEach((letter, index) => {
        const card = document.createElement('div'); card.className = 'novel-card vintage-paper-node';
        card.innerHTML = `<h3>${letter.title}</h3><div class="novel-meta"><span>${letter.author || 'Yeasin Kabir'}</span></div><div class="novel-summary">${letter.summary || ''}</div><button class="read-btn" style="border-color:#e74c3c; color:#ff9a9e;" onclick="startReadingLetter(${index})">চিঠি পড়ুন</button>`;
        container.appendChild(card);
    });
}

function openLettersLibrary() { switchView('letters-library'); }
function backToLettersLibrary() { switchView('letters-library'); }

function startReadingLetter(bookIndex) {
    window.location.hash = `letter=${bookIndex}&part=0`;
}

function loadLetterPart() {
    if (!lettersDB[currentLetterBookIndex] || !lettersDB[currentLetterBookIndex].parts[currentLetterPartIndex]) return;
    const pt = lettersDB[currentLetterBookIndex].parts[currentLetterPartIndex];
    document.getElementById('current-letter-title').innerText = pt.title;
    document.getElementById('letter-content').innerHTML = pt.text.replace(/\n/g, '<br>');
    document.getElementById('letter-part-dropdown').value = currentLetterPartIndex;
    document.getElementById('letter-reader').scrollTop = 0;
}

function changeLetterPart(d) {
    const len = lettersDB[currentLetterBookIndex].parts.length;
    if(currentLetterPartIndex + d >= 0 && currentLetterPartIndex + d < len) {
        currentLetterPartIndex += d;
        window.location.hash = `letter=${currentLetterBookIndex}&part=${currentLetterPartIndex}`;
    }
}

function jumpToLetterPart(v) {
    currentLetterPartIndex = parseInt(v);
    window.location.hash = `letter=${currentLetterBookIndex}&part=${currentLetterPartIndex}`;
}

function updateLetterPartSelect() {
    const select = document.getElementById('letter-part-dropdown');
    if(!select) return; select.innerHTML = '';
    lettersDB[currentLetterBookIndex].parts.forEach((pt, i) => {
        let opt = document.createElement('option'); opt.value = i; opt.text = pt.title; select.appendChild(opt);
    });
}

function renderMonologues() {
    const container = document.getElementById('monologue-list-container');
    if(!container) return; container.innerHTML = '';
    
    allMonologues.forEach((mono, index) => {
        const card = document.createElement('div');
        card.className = 'monologue-card vintage-paper-node';
        card.id = `monologue-card-${index}`;
        card.setAttribute('data-aos', 'fade-up');
        const processedText = mono.text.replace(/\\n/g, '<br>').replace(/\n/g, '<br>');
        card.innerHTML = `
            <div class="monologue-title">${mono.title}</div>
            <div class="monologue-text">${processedText}</div>
            <div style="text-align:right; margin-top:15px; font-size:0.8rem; color:#666;">- ${mono.author || 'Yeasin Kabir'}</div>
            <div class="action-buttons-group hide-during-capture">
                <button class="sub-btn copy-btn" onclick="copyToClipboard('monologue-card-${index}', 'monologue')"><i class="fas fa-copy"></i> কপি করুন</button>
                <button class="sub-btn image-btn" onclick="downloadAsImage('monologue-card-${index}', '${mono.title}')"><i class="fas fa-image"></i> ইমেজ ডাউনলোড</button>
                <button class="sub-btn pdf-btn" onclick="downloadItemPDF('monologue-card-${index}', '${mono.title}')"><i class="fas fa-file-pdf"></i> PDF</button>
                <button class="sub-btn share-btn" onclick="nativeShare('monologue-view', '${mono.title}')"><i class="fas fa-share-alt"></i> Share</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function renderMemories() {
    const container = document.getElementById('memory-collection-container');
    if (!container) return; container.innerHTML = '';
    if (allMemories.length === 0) {
        container.innerHTML = "<p style='color:#888; text-align:center;'>এখনো কোনো স্মৃতি যোগ করা হয়নি।</p>";
        return;
    }
    allMemories.forEach((memo) => {
        const card = document.createElement('div');
        card.className = 'memory-item-card vintage-paper-node';
        card.setAttribute('data-aos', 'fade-up');
        
        const cleanText = memo.memory_text ? memo.memory_text.replace(/"/g, '"').replace(/\n/g, '<br>') : '';
        const rawTextForJs = memo.memory_text ? memo.memory_text.replace(/"/g, '\\"').replace(/\n/g, ' ') : '';
        
        card.innerHTML = `
            <div class="memory-flex-box">
                <div class="memory-img-wrap">
                    <img src="${memo.img_src}" alt="Memory Image" onclick="openImageModal('${memo.img_src}', '${rawTextForJs}')">
                </div>
                <div class="memory-text-wrap">
                    <p class="memory-desc-text">${cleanText}</p>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

// --- STORY MODULES ---
function renderStoryLibrary() {
    const container = document.getElementById('story-list-container');
    if(!container) return; container.innerHTML = '';
    allStories.forEach((story, index) => {
        const card = document.createElement('div'); card.className = 'novel-card vintage-paper-node';
        card.innerHTML = `<h3>${story.story_title}</h3><div class="novel-meta"><span>${story.author || 'Yeasin Kabir'}</span></div><div class="novel-summary">${story.summary || ''}</div><button class="read-btn" onclick="openStory(${index})">গল্পটি পড়ুন</button>`;
        container.appendChild(card);
    });
}

function openStory(index) { window.location.hash = `story=${index}`; }

function openPdfLibrary() {
    switchView('pdf-library');
}

function renderPdfLibrary() {
    const container = document.getElementById('pdf-list-container');
    if(!container) return;
    container.innerHTML = '';

    if (pdfCatalog.length === 0) {
        container.innerHTML = '<p style="color:#888; text-align:center; width:100%;">কোনো পিডিএফ পাওয়া যায়নি।</p>';
        return;
    }

    pdfCatalog.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'pdf-card';
        const thumbnail = item.thumbnail_url && item.thumbnail_url.trim() ? item.thumbnail_url.trim() : 'https://via.placeholder.com/240x320.png?text=PDF+Cover';
        const author = item.author ? item.author : 'Yeasin Kabir';
        const description = item.description ? item.description : 'এই পিডিএফটি আপনার কাছে এক নিকট আত্মীয় গল্প ও কবিতার আকারে।';
        const pdfUrl = item.pdf_url.trim();
        const displayTitle = item.title;

        card.innerHTML = `
            <div class="pdf-card-thumb"><img src="${thumbnail}" alt="${displayTitle}"></div>
            <div class="pdf-card-info">
                <div>
                    <h3 class="pdf-card-title">${displayTitle}</h3>
                    <p class="pdf-card-author">লেখক: ${author}</p>
                    <p class="pdf-card-meta">${item.genre || 'Poetry / Novel'}</p>
                </div>
                <p class="pdf-card-desc">${description}</p>
                <div class="pdf-card-action">
                    <a class="sub-btn" href="${pdfUrl}" target="_blank" rel="noopener noreferrer"><i class="fas fa-download"></i> ডাউনলোড / পড়ুন</a>
                </div>
            </div>
        `;

        container.appendChild(card);
    });
}

function openStoryDirectly(index) {
    const story = allStories[index];
    const display = document.getElementById('poem-content-display');
    document.getElementById('poem-title-display').innerText = story.story_title;
    display.innerHTML = `<div style="text-align:justify; font-size:1.1rem; line-height:1.8;">${story.story_text.replace(/\n/g, '<br>')}</div>`;
    document.getElementById('home-view').style.display='none'; 
    document.querySelectorAll('.full-view').forEach(el => el.style.display='none'); 
    document.getElementById('reader-view').style.display = 'block';
    document.getElementById('reader-view').scrollTop = 0;
    loadComments();
}

// --- LIGHTBOX IMAGE POP-UP CONTROLLER ---
function openImageModal(imgSrc, captionText) {
    const modal = document.getElementById('image-lightbox-modal');
    const modalImg = document.getElementById('expanded-lightbox-image');
    const captionContainer = document.getElementById('lightbox-image-caption');
    
    if(modal && modalImg) {
        modal.style.display = "flex";
        modalImg.src = imgSrc;
        if(captionContainer) {
            captionContainer.innerHTML = captionText ? captionText : '';
        }
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-lightbox-modal');
    if(modal) {
        modal.style.display = "none";
    }
}

// --- SEARCH FILTER SYSTEM ---
function filterPoems() { renderPoems(); }

function filterByTag(tag) {
    currentFilter = tag;
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    if(event && event.target) {
        event.target.classList.add('active');
    }
    renderPoems();
}

// --- COMMENT MATRIX ---
// Toggle Comment Bottom Sheet Modal
function toggleCommentModal() {
    const overlay = document.getElementById('comment-modal-overlay');
    const modal = document.getElementById('comment-section');
    if (overlay && modal) {
        overlay.classList.toggle('active');
        modal.classList.toggle('active');
        if (modal.classList.contains('active')) {
            loadComments();
        }
    }
}

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
                display.innerHTML += `<div class="vintage-comment-box"><b style="color:var(--primary); font-size:0.9rem;">${row[1]}</b><p style="margin:5px 0 0; font-size:1rem; color:#eee;">${row[2]}</p></div>`;
            });
        }
    } catch(e) { display.innerHTML = "<p style='color:#e74c3c;'>মন্তব্য লোড করা সম্ভব হয়নি।</p>"; }
}

// --- ROMANTIC SECRET VAULT SYSTEM CONTROLS ---
function openSecretVaultInput() { 
    if(prompt("ENTER ACCESS CODE:") === "3460") { 
        document.getElementById('home-view').style.display='none'; 
        document.querySelectorAll('.full-view').forEach(el => el.style.display='none'); 
        document.getElementById('secret-vault').style.display='block';
        window.scrollTo(0,0);
        startPetals();
        currentVaultPage = 1;
        populateVaultDropdown(); // Add this line
        currentQuiz = 0;
        auraScanned = false;
        document.getElementById('promise-msg').style.display = 'none';
        document.getElementById('love-reason').innerText = '';
        document.getElementById('love-result').style.display = 'none';
        document.getElementById('love-msg').innerText = '';
        document.getElementById('aura-result').innerText = '';
        const auraFieldReset = document.getElementById('aura-field');
        if(auraFieldReset) auraFieldReset.classList.remove('scanning');
        document.querySelectorAll('.open-when-msg').forEach(el => el.style.display = 'none');
        showPage(1);
    } else { alert("ACCESS DENIED!"); } 
}
function closeVault() { goBack(); document.getElementById('vault-audio').pause(); stopPetals(); }

function populateVaultDropdown() {
    const select = document.getElementById('vault-page-select');
    if(!select) return;
    select.innerHTML = '';
    
    const pageNames = [
        "১. এক সন্ধ্যেবেলায়", "২. Happy New Year", "৩. তোমার চোখ", "৪. প্রথম দেখা...",
        "৫. Love Letter", "৬. Open When...", "৭. Our Bucket List", "৮. Why I Love You",
        "৯. Forever Promise", "১০. Do You Know Me?", "১১. Today's Mood", "১২. Relationship Contract",
        "১৩. Write to Me", "১৪. Love Calculator", "১৫. Our Memories", "১৬. Aura Scanner"
    ];
    
    for(let i = 1; i <= 16; i++) {
        let opt = document.createElement('option');
        opt.value = i;
        opt.text = pageNames[i-1];
        select.appendChild(opt);
    }
}

function jumpToVaultPage(n) {
    currentVaultPage = parseInt(n);
    showPage(currentVaultPage);
}

function showPage(n) { 
    document.querySelectorAll('.diary-page').forEach(p=>p.classList.remove('active')); 
    const targetPage = document.getElementById(`page-${n}`);
    if(targetPage) {
        targetPage.classList.add('active');
        targetPage.style.animation = 'none';
        targetPage.offsetHeight; 
        targetPage.style.animation = 'pageTurnEffect 0.6s ease-out forwards';
    }
    document.getElementById('page-num').innerText = `${n} / ${totalVaultPages}`; 
    const select = document.getElementById('vault-page-select');
    if(select) select.value = n;
    if(n === 10) {
        currentQuiz = currentQuiz || 0;
        loadQuiz();
    }
}
function nextPage() { if(currentVaultPage < totalVaultPages) { currentVaultPage++; showPage(currentVaultPage); } }
function prevPage() { if(currentVaultPage > 1) { currentVaultPage--; showPage(currentVaultPage); } }

function toggleMsg(id) { let el = document.getElementById(id); el.style.display = (el.style.display === 'block') ? 'none' : 'block'; }
function generateReason() { 
    const r = ["তোমার ওই মায়াবী চোখ","আমার রাগ ভাঙাতে পারো","তোমার হাসিতে দিন ভালো হয়","আমাকে ভালো বোঝো", "তুমি আমার পৃথিবীর রোশনাই", "তোমার কাছে সব ভয় হারিয়ে যায়"];
    const reasonBox = document.getElementById('love-reason');
    reasonBox.innerText = r[Math.floor(Math.random()*r.length)]; 
}

function startAuraScan(e) {
    if(auraScanned) return;
    if(e.preventDefault) e.preventDefault();
    const auraField = document.getElementById('aura-field');
    const auraResult = document.getElementById('aura-result');
    if(auraField) auraField.classList.add('scanning');
    if(auraResult) auraResult.innerText = 'Scanning your love residue...';
    clearTimeout(auraTimer);
    auraTimer = setTimeout(() => {
        auraScanned = true;
        if(auraField) auraField.classList.remove('scanning');
        const auraScore = ['99.9%', 'Infinite', 'Glowing Gold'][Math.floor(Math.random() * 3)];
        const auraPhrases = [
            `Aura: ${auraScore} - Your heart beats in perfect sync with mine. I am entirely yours.`,
            `Aura: ${auraScore} - The depth of your love defies calculation. My poet soul is trapped in your eyes forever.`,
            `Aura: ${auraScore} - Safe and pure. You are my peace, Rumi.`
        ];
        const resultText = auraPhrases[Math.floor(Math.random() * auraPhrases.length)];
        if(auraResult) auraResult.innerHTML = `<strong>${resultText}</strong>`;
        try { navigator.vibrate(100); } catch(err) {}
    }, 1500);
}

function stopAuraScan() {
    const auraField = document.getElementById('aura-field');
    const auraResult = document.getElementById('aura-result');
    if(auraField) auraField.classList.remove('scanning');
    clearTimeout(auraTimer);
    if(!auraScanned && auraResult) auraResult.innerText = 'Hold a little longer for the aura to reveal your love energy...';
}

function startScan(e) { 
    if(e.preventDefault) e.preventDefault(); 
    document.getElementById('scanLine').style.display='block'; 
    scanTimer=setTimeout(()=>{
        document.getElementById('promise-msg').style.display='block'; 
        document.getElementById('scanLine').style.display='none'; 
        try{navigator.vibrate(200)}catch(err){}
    },1500); 
} 
function stopScan() { clearTimeout(scanTimer); document.getElementById('scanLine').style.display='none'; }

const quizData = [ 
    { q: "আমার রাগ ভাঙানোর সেরা উপায় কী?", options: ["সরি বলা", "কান ধরে ওঠবস", "মিষ্টি করে একটা হাসি", "চকলেট দেওয়া"], a: 2 }, 
    { q: "আমি তোমার কোন জিনিসটা সবচেয়ে বেশি ভালোবাসি?", options: ["তোমার চোখ", "তোমার হাসি", "তোমার বোকামি", "সবগুলোই"], a: 3 }, 
    { q: "আমাদের প্রথম দেখা করার তারিখ কবে?", options: ["১২ নভেম্বর", "১৪ ফেব্রুয়ারি", "৫ নভেম্বর", "১ জানুয়ারি"], a: 0 } 
];
let currentQuiz = 0;
function loadQuiz() { 
    const questionEl = document.getElementById('quiz-question');
    const optsDiv = document.getElementById('quiz-options');
    if(!questionEl || !optsDiv) return;
    if(currentQuiz >= quizData.length) { 
        document.getElementById('quiz-box').innerHTML = "<h2 style='color:var(--secondary); font-family:Great Vibes; font-size:2.5rem;'>অভিনন্দন জানপাখি! 🎉</h2><p style='color:#ffe6ea; font-style:italic;'>তুমি আমাকে ১০০% চেনো!</p>"; 
        return; 
    }
    const q = quizData[currentQuiz]; questionEl.innerText = q.q; 
    optsDiv.innerHTML = ''; 
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
        setTimeout(() => { currentQuiz++; loadQuiz(); }, 1200); 
    } else { 
        btnElement.style.background = "#e74c3c"; 
        try{navigator.vibrate(200);}catch(e){} 
    } 
}

function handleMood(type) { 
    const msg = document.getElementById('mood-msg'); 
    if(type === 'happy') { triggerConfetti(); msg.innerText = "তোমার হাসি দেখলেই আমার দিন ভালো হয়ে যায়! 😊"; } 
    else if(type === 'sad') { msg.innerText = "কান্না করো না প্লিজ বাবু! সব ঠিক হয়ে যাবে। আমি আছি তো। ❤️"; } 
    else { msg.innerText = "আমিও তোমাকে ভীষণ মিস করছি... খুব জলদি দেখা হবে! 🤗"; } 
}
function signContract() { 
    document.getElementById('contract-stamp').style.opacity = '0.9'; 
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

const startDate = new Date("2024-09-14T00:00:00").getTime();
setInterval(() => { 
    const now = new Date().getTime(); 
    const d = now - startDate; 
    const display = document.getElementById("love-clock");
    if(display) display.innerHTML = `${Math.floor(d/(1000*60*60*24))} Days : ${Math.floor((d%(1000*60*60*24))/(1000*60*60))} Hr : ${Math.floor((d%(1000*60*60))/(1000*60))} Min : ${Math.floor((d%(1000*60))/1000)} Sec`; 
}, 1000);

// --- AUXILIARY AMBIENT UNITS ---
function createPoeticLeaves() {
    const container = document.getElementById('leaf-container'); if(!container) return;
    setInterval(() => {
        const leaf = document.createElement('div'); leaf.className = 'ambient-leaf';
        leaf.style.left = Math.random() * 100 + "vw";
        leaf.style.animationDuration = Math.random() * 5 + 5 + "s";
        leaf.style.opacity = Math.random() * 0.25 + 0.05;
        container.appendChild(leaf);
        setTimeout(() => leaf.remove(), 9000);
    }, 1500);
}

function renderGallery() {
    const container = document.querySelector('.gallery-grid'); if (!container) return;
    container.innerHTML = ''; 
    allGalleryImages.forEach(img => {
        const item = document.createElement('div'); item.className = 'gallery-item vintage-gallery-card';
        const imgSrc = img.img_src; 
        const rawCaptionText = img.caption ? img.caption.replace(/"/g, '\\"') : '';
        const escapedCaptionHtml = img.caption ? img.caption.replace(/"/g, '"') : '';
        
        item.onclick = () => openImageModal(imgSrc, rawCaptionText);
        const captionText = img.caption ? `<div class="gallery-caption">${escapedCaptionHtml}</div>` : '';
        item.innerHTML = `<img src="${imgSrc}" class="gallery-img" alt="Gallery Image" style="cursor: pointer;">${captionText}`;
        container.appendChild(item);
    });
}

function renderVideos() {
    const container = document.querySelector('#video-view'); if (!container) return;
    container.innerHTML = `<button class="back-btn" onclick="goBack()"><i class="fas fa-arrow-left"></i> BACK</button><h2 class="section-title">Video Gallery</h2><div class="video-grid" style="display:grid; grid-template-columns:1fr; gap:20px; padding:10px;"></div>`;
    const grid = container.querySelector('.video-grid');
    if (allVideos.length === 0) {
        grid.innerHTML = "<p style='color:#888; text-align:center;'>কোনো ভিডিও পাওয়া যায়নি।</p>";
        return;
    }
    allVideos.forEach(vid => {
        const url = vid.video_url.trim();
        const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/) || url.match(/id=([a-zA-Z0-9-_]+)/);
        if (match && match[1]) {
            const embedUrl = `https://drive.google.com/file/d/${match[1]}/preview`;
            const card = document.createElement('div'); card.className = 'video-card-item vintage-paper-node';
            card.style.cssText = "background:rgba(25,18,19,0.5); border:1px solid #332426; border-radius:4px; overflow:hidden; padding:10px;";
            const titleText = vid.title ? `<h3 style="font-size:1rem; margin-top:10px; color:var(--primary); font-family:'Hind Siliguri';">${vid.title}</h3>` : '';
            card.innerHTML = `<div style="position:relative; width:100%; height:0; padding-bottom:56.25%; border-radius:4px; overflow:hidden;"><iframe src="${embedUrl}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:none;" allow="autoplay"></iframe></div>${titleText}`;
            grid.appendChild(card);
        }
    });
}

// --- EMAILJS FUNCTIONALITY LOGICS ---
function handleRealSubscribe() { 
    const emailField = document.getElementById('sub-email');
    const email = emailField.value.trim(); 
    
    if (!email) {
        alert("দয়া করে একটি সঠিক ইমেইল আইডি লিখুন।");
        return;
    }

    const templateParams = {
        from_name: "New Website Subscriber",
        from_email: email,
        message: `আপনার কবিতা পোর্টালে নতুন কবিতা ও উপন্যাস আপডেটের জন্য সাবস্ক্রাইব করেছেন। ইউজারের ইমেইল: ${email}`
    };

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
    .then(() => { 
        alert("সফলভাবে সাবস্ক্রাইব করা হয়েছে! আপনাকে ধন্যবাদ।"); 
        emailField.value = ""; 
    })
    .catch((error) => {
        console.error("EmailJS Error:", error);
        alert("দুঃখিত, এই মুহূর্তে সাবস্ক্রিপশন নেওয়া সম্ভব হচ্ছে না।");
    }); 
}

function sendRealEmail() { 
    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const msg = document.getElementById('contact-msg').value.trim();

    if(!name || !msg) return alert("দয়া করে নাম এবং বার্তা ফিল্ড পূরণ করুন।");

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { 
        from_name: name,
        from_email: email || "No Email Given",
        message: `কন্টাক্ট ফর্ম থেকে মেসেজ এসেছে:\nনাম: ${name}\nইমেইল: ${email}\nবার্তা: ${msg}` 
    }).then(() => {
        alert("আপনার বার্তাটি সফলভাবে পাঠানো হয়েছে!");
        document.getElementById('contact-name').value = "";
        document.getElementById('contact-email').value = "";
        document.getElementById('contact-msg').value = "";
    }); 
}

function sendDiaryToEmail() { 
    const authorName = document.getElementById('story-author-name').value.trim();
    const storyTitle = document.getElementById('story-title-input').value.trim();
    const storyContent = document.getElementById('story-content-input').value.trim();

    if(!authorName || !storyTitle || !storyContent) {
        alert("দয়া করে পাঠকের ডায়েরির সবকটি ফিল্ড (নাম, শিরোনাম ও গল্প) সম্পূর্ণ পূরণ করুন।");
        return;
    }

    const formattedMessage = `পাঠকের ডায়েরি থেকে নতুন গল্প জমা পড়েছে:\n\nলেখকের নাম: ${authorName}\nগল্পের শিরোনাম: ${storyTitle}\n\nগল্পের মূল অংশ:\n${storyContent}`;

    emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, { 
        from_name: authorName, 
        message: formattedMessage 
    }).then(() => {
        alert("আপনার লেখা গল্পটি সফলভাবে ইয়াছিনের নিকট পাঠানো হয়েছে!");
        document.getElementById('story-author-name').value = "";
        document.getElementById('story-title-input').value = "";
        document.getElementById('story-content-input').value = "";
    }).catch(err => {
        console.error("EmailJS Error:", err);
        alert("দুঃখিত, লেখাটি মেইল করা যায়নি।");
    });
}

function toggleSettings() { const panel = document.getElementById('settings-panel'); if(panel) panel.style.display = panel.style.display === 'block' ? 'none' : 'block'; }
function changeFont(dir) { const root = document.documentElement; let current = parseFloat(getComputedStyle(root).getPropertyValue('--text-size')); root.style.setProperty('--text-size', (current + (dir * 0.1)) + 'rem'); }
function backToLibrary() { switchView('novel-library'); }
function openNovelLibrary() { switchView('novel-library'); }

// --- MUSIC CONTROL PLATFORM ---
function setupMusic() {
    const music = document.getElementById('bg-music');
    document.body.addEventListener('click', () => {
        if(!isMusicPlaying && music && music.paused) {
            // Safe initializer
        }
    }, { once: true });
}

function toggleMusic() {
    const music = document.getElementById('bg-music');
    const icon = document.getElementById('music-icon');
    const btn = document.querySelector('.ctrl-float-btn.music-btn');

    if (!music) return;

    if (music.paused) {
        music.play().then(() => {
            isMusicPlaying = true;
            icon.className = "fas fa-pause";
            btn.classList.add('playing');
        }).catch(err => {
            console.log("Audio block active:", err);
        });
    } else {
        music.pause();
        isMusicPlaying = false;
        icon.className = "fas fa-play";
        btn.classList.remove('playing');
    }
}

let petalInterval;
function startPetals() {
    const container = document.getElementById('petals-container'); if(!container) return;
    petalInterval = setInterval(() => {
        const petal = document.createElement('div'); petal.className = 'petal';
        petal.style.left = Math.random() * 100 + "vw"; petal.style.animationDuration = Math.random() * 3 + 3 + "s";
        container.appendChild(petal);
        setTimeout(() => petal.remove(), 5000);
    }, 300);
}
function stopPetals() { if(petalInterval) clearInterval(petalInterval); }

function convertDriveLink() {
    const inputUrl = document.getElementById('drive-input').value.trim();
    const match = inputUrl.match(/\/d\/([a-zA-Z0-9_-]+)|id=([a-zA-Z0-9_-]+)/);
    if (match) {
        document.getElementById('result-link').value = `https://lh3.googleusercontent.com/u/0/d/${match[1] || match[2]}`;
        document.getElementById('converter-result').style.display = 'block';
    } else { alert("Oops! Linkti shothik noy."); }
}
async function copyConvertedLink() {
    await navigator.clipboard.writeText(document.getElementById('result-link').value); alert("Link successfully copied!");
}

let timer;
function type() {
    const tw = document.getElementById('typewriter');
    if(!tw) return;
    const txt = "WEB DEVELOPER | POET | NOVELIST";
    let i = 0;
    clearInterval(timer);
    timer = setInterval(() => {
        if(i < txt.length) {
            tw.innerHTML += txt.charAt(i);
            i++;
        } else {
            clearInterval(timer);
        }
    }, 100);
}

let confettiParticles = [];
let confettiAnimationId = null;

function triggerConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if(!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = window.innerWidth;
    const height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    canvas.style.display = 'block';

    for (let i = 0; i < 40; i++) {
        confettiParticles.push({
            x: Math.random() * width,
            y: Math.random() * height - height,
            size: Math.random() * 10 + 6,
            gravity: Math.random() * 0.12 + 0.04,
            velocityX: Math.random() * 2 - 1,
            velocityY: Math.random() * 2 + 2,
            rotation: Math.random() * 360,
            rotationSpeed: Math.random() * 10 - 5,
            color: `hsl(${Math.random() * 30 + 330}, 90%, ${Math.random() * 10 + 65}%)`
        });
    }

    if (confettiAnimationId) cancelAnimationFrame(confettiAnimationId);
    function animateConfetti() {
        ctx.clearRect(0, 0, width, height);
        confettiParticles = confettiParticles.filter(p => p.y < height + p.size);
        confettiParticles.forEach(p => {
            p.x += p.velocityX;
            p.y += p.velocityY;
            p.velocityY += p.gravity;
            p.rotation += p.rotationSpeed;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rotation * Math.PI / 180);
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
            ctx.restore();
        });
        if (confettiParticles.length > 0) {
            confettiAnimationId = requestAnimationFrame(animateConfetti);
        } else {
            canvas.style.display = 'none';
        }
    }
    animateConfetti();
}

// ============================================
// UNIVERSAL PDF DOWNLOAD CONTROLLER
// ============================================
function downloadItemPDF(elementId, fileNameTitle) {
    const element = document.getElementById(elementId);
    if (!element) {
        alert("কন্টেন্ট পাওয়া যায়নি!");
        return;
    }

    const hiddenEls = [...element.querySelectorAll('.hide-during-capture, .pdf-btn')];
    hiddenEls.forEach(el => el.style.display = 'none');

    const opt = {
        margin:       0.5,
        filename:     fileNameTitle + '.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, 
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
        hiddenEls.forEach(el => el.style.display = '');
    }).catch(() => {
        hiddenEls.forEach(el => el.style.display = '');
    });
}

// ============================================
// NATIVE WEB SHARE API CONTROLLER
// ============================================
function copyToClipboard(elementId, type) {
    const element = document.getElementById(elementId);
    if (!element) {
        alert('কন্টেন্ট পাওয়া যায়নি!');
        return;
    }

    const clone = element.cloneNode(true);
    clone.querySelectorAll('button, .action-buttons-group, .hide-during-capture').forEach(node => node.remove());
    const text = clone.innerText.trim();
    if (!text) {
        alert('কোনো টেক্সট পাওয়া যায়নি।');
        return;
    }

    const successMessage = type === 'novel' ? 'উপন্যাস কন্টেন্ট ক্লিপবোর্ডে কপি করা হলো!' : type === 'letter' ? 'চিঠির লেখা কপি করা হলো!' : 'কন্টেন্ট ক্লিপবোর্ডে কপি করা হলো!';

    const fallbackCopy = () => {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        document.body.appendChild(textarea);
        textarea.select();
        try {
            document.execCommand('copy');
            alert(successMessage);
        } catch (error) {
            alert('ক্লিপবোর্ডে কপি করা যায়নি।');
        }
        document.body.removeChild(textarea);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
            alert(successMessage);
        }).catch(() => {
            fallbackCopy();
        });
    } else {
        fallbackCopy();
    }
}

async function downloadAsImage(elementId, fileName) {
    const element = document.getElementById(elementId);
    if (!element) {
        alert('কন্টেন্ট পাওয়া যায়নি!');
        return;
    }

    const hiddenEls = [...element.querySelectorAll('.hide-during-capture')];
    hiddenEls.forEach(el => el.style.display = 'none');

    try {
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: null
        });

        await new Promise((resolve, reject) => {
            canvas.toBlob(blob => {
                if (!blob) {
                    reject(new Error('Image blob তৈরি করা যায়নি'));
                    return;
                }
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = fileName ? `${fileName}.png` : 'download.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(link.href);
                resolve();
            }, 'image/png');
        });
    } catch (err) {
        console.error(err);
        alert('ইমেজ ডাউনলোডে সমস্যা হয়েছে। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
        hiddenEls.forEach(el => el.style.display = '');
    }
}

async function nativeShare(hashPath, title) {
    const baseUrl = window.location.href.split('#')[0];
    const shareUrl = baseUrl + '#' + hashPath;
    
    if (navigator.share) {
        try {
            await navigator.share({
                title: title,
                text: 'এই চমৎকার লেখাটি পড়ুন: ' + title,
                url: shareUrl
            });
        } catch (error) {
            console.log('শেয়ার করা বাতিল করা হয়েছে বা ত্রুটি হয়েছে:', error);
        }
    } else {
        try {
            await navigator.clipboard.writeText(shareUrl);
            alert("আপনার ব্রাউজারে সরাসরি শেয়ার সাপোর্ট করছে না। লিংকটি কপি করা হয়েছে! ❤️");
        } catch (err) {
            alert("লিংক কপি করা যায়নি।");
        }
    }
}

// ============================================
// SCROLL TO TOP FUNCTIONALITY
// ============================================

function handleScrollVisibility(e) {
    const topBtn = document.getElementById("backToTopBtn");
    if (!topBtn) return;
    
    let scrollTopPos = 0;
    if (e && e.target && e.target.scrollTop !== undefined) {
        scrollTopPos = e.target.scrollTop;
    } else {
        scrollTopPos = window.scrollY || document.documentElement.scrollTop;
    }

    if (scrollTopPos > 250) {
        topBtn.classList.add("show");
    } else {
        topBtn.classList.remove("show");
    }
}

window.addEventListener('scroll', handleScrollVisibility);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.full-view').forEach(el => {
        el.addEventListener('scroll', handleScrollVisibility);
    });
});

function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    document.querySelectorAll('.full-view').forEach(el => {
        if (el.style.display === 'block') {
            el.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });
}