// Check if Firebase is loaded
if (typeof firebase === 'undefined') {
    console.error('Firebase SDK not loaded. Please check the script tags in index.html.');
    alert('Firebase SDK failed to load. Please check your internet connection or the script tags in index.html.');
}

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyBE7i-0AsE99wCq7dKcB8cvJGd5d5EMVdg",
    authDomain: "ummah-connect-og03l.firebaseapp.com",
    databaseURL: "https://ummah-connect-og03l-default-rtdb.firebaseio.com", // Replace with your Realtime Database URL
    projectId: "ummah-connect-og03l",
    storageBucket: "ummah-connect-og03l.firebasestorage.app",
    messagingSenderId: "383284226747",
    appId: "1:383284226747:web:YOUR_WEB_APP_ID" // Replace with your web app ID
};

// Initialize Firebase
let db;
try {
    if (firebase) {
        firebase.initializeApp(firebaseConfig);
        console.log('Firebase initialized successfully');
        db = firebase.database();
    } else {
        throw new Error('Firebase SDK is not available');
    }
} catch (error) {
    console.error('Firebase initialization failed:', error);
    alert('Firebase initialization failed. Please check your configuration and internet connection.');
}

// Test Realtime Database Connection
function testRealtimeDatabase() {
    if (!db) {
        console.error('Database not initialized. Cannot test connection.');
        showMessage('Database not initialized. Please check Firebase setup.', 'error', formMessage);
        return;
    }
    const testRef = db.ref('test/connection');
    testRef.set({ timestamp: new Date().toISOString() })
        .then(() => {
            console.log('Realtime Database write test successful');
        })
        .catch(error => {
            console.error('Realtime Database connection test failed:', error);
            showMessage('Cannot connect to Realtime Database. Please check your internet or Firebase setup.', 'error', formMessage);
        });
}

// DOM Elements
const fabContainer = document.getElementById('fabContainer');
const fab = document.getElementById('fab');
const fabIcon = document.getElementById('fabIcon');
const darkModeToggle = document.getElementById('darkModeToggle');
const navTabs = document.querySelectorAll('.nav-tab');
const hadithSection = document.getElementById('hadithSection');
const youtubeSection = document.getElementById('youtubeSection');
const addHadithSection = document.getElementById('addHadithSection');
const bookmarksSection = document.getElementById('bookmarksSection');
const aboutUsSection = document.getElementById('aboutUsSection');
const contactUsSection = document.getElementById('contactUsSection');
const disclaimerSection = document.getElementById('disclaimerSection');
const privacyPolicySection = document.getElementById('privacyPolicySection');
const hadithList = document.getElementById('hadithList');
const youtubeVideosList = document.getElementById('youtubeVideosList');
const addHadithForm = document.getElementById('addHadithForm');
const submitVideoForm = document.getElementById('submitVideoForm');
const uploadImageBtn = document.getElementById('uploadImageBtn');
const uploadAudioBtn = document.getElementById('uploadAudioBtn');
const imageUrlInput = document.getElementById('imageUrl');
const audioUrlInput = document.getElementById('audioUrl');
const formMessage = document.getElementById('formMessage');
const videoFormMessage = document.getElementById('videoFormMessage');
const contentModal = document.getElementById('contentModal');
const contentModalCloseButton = document.getElementById('contentModalCloseButton');
const contentModalContent = document.getElementById('contentModalContent');
const videoSubmissionModal = document.getElementById('videoSubmissionModal');
const videoModalCloseButton = document.getElementById('videoModalCloseButton');
const menuModal = document.getElementById('menuModal');
const menuCloseButton = document.getElementById('menuCloseButton');
const menuBtn = document.getElementById('menuBtn');
const menuItems = document.querySelectorAll('.menu-item');

// State
let isDarkMode = false;
let isFabExpanded = false;
let hadithListener = null; // To manage real-time listener for Hadiths
let videoListener = null; // To manage real-time listener for Videos

// Cloudinary Configuration
const cloudName = 'dhw1xn7ko';
const uploadPreset = 'Raazbhai';

// Initialize Cloudinary Widgets
function initCloudinary() {
    if (typeof cloudinary === 'undefined') {
        console.warn('Cloudinary script not loaded yet. Retrying in 500ms...');
        setTimeout(initCloudinary, 500);
        return;
    }

    try {
        const imageWidget = cloudinary.createUploadWidget(
            {
                cloudName: cloudName,
                uploadPreset: uploadPreset,
                sources: ['local', 'camera', 'url'],
                multiple: false,
                resourceType: 'image',
                folder: 'hadith_images',
                clientAllowedFormats: ['jpg', 'png', 'jpeg'],
                maxFileSize: 5000000 // 5MB
            },
            (error, result) => {
                if (!error && result && result.event === 'success') {
                    imageUrlInput.value = result.info.secure_url;
                    showMessage('Image uploaded successfully!', 'success', formMessage);
                    console.log('Cloudinary image uploaded:', result.info.secure_url);
                } else if (error) {
                    showMessage('Image upload failed: ' + (error.message || 'Unknown error'), 'error', formMessage);
                    console.error('Cloudinary image upload failed:', error);
                }
            }
        );

        const audioWidget = cloudinary.createUploadWidget(
            {
                cloudName: cloudName,
                uploadPreset: uploadPreset,
                sources: ['local', 'url'],
                multiple: false,
                resourceType: 'video',
                folder: 'hadith_audio',
                clientAllowedFormats: ['mp3', 'wav', 'm4a'],
                maxFileSize: 10000000 // 10MB
            },
            (error, result) => {
                if (!error && result && result.event === 'success') {
                    audioUrlInput.value = result.info.secure_url;
                    showMessage('Audio uploaded successfully!', 'success', formMessage);
                    console.log('Cloudinary audio uploaded:', result.info.secure_url);
                } else if (error) {
                    showMessage('Audio upload failed: ' + (error.message || 'Unknown error'), 'error', formMessage);
                    console.error('Cloudinary audio upload failed:', error);
                }
            }
        );

        uploadImageBtn.addEventListener('click', () => {
            console.log('Upload Image button clicked');
            if (imageWidget) imageWidget.open();
            else showMessage('Cloudinary widget not initialized', 'error', formMessage);
        });

        uploadAudioBtn.addEventListener('click', () => {
            console.log('Upload Audio button clicked');
            if (audioWidget) audioWidget.open();
            else showMessage('Cloudinary widget not initialized', 'error', formMessage);
        });
    } catch (error) {
        console.error('Error initializing Cloudinary:', error);
        showMessage('Failed to initialize Cloudinary. Please try again later.', 'error', formMessage);
    }
}

// Show Message
function showMessage(message, type, element = formMessage) {
    console.log('showMessage called:', message, type);
    if (element) {
        element.textContent = message;
        element.className = `message ${type}`;
        element.setAttribute('aria-live', 'assertive');
        setTimeout(() => {
            element.textContent = '';
            element.className = 'message';
            element.setAttribute('aria-live', 'polite');
        }, 5000);
    } else {
        console.error('Message element not found');
        alert(message);
    }
}

// Toggle Dark Mode
function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    document.body.classList.toggle('dark-mode');
    const icon = darkModeToggle.querySelector('i');
    icon.classList.toggle('fa-moon', !isDarkMode);
    icon.classList.toggle('fa-sun', isDarkMode);
    localStorage.setItem('darkMode', isDarkMode);
}

// Toggle FAB Actions
function toggleFabActions() {
    console.log('Toggling FAB actions');
    isFabExpanded = !isFabExpanded;
    fabContainer.classList.toggle('expanded', isFabExpanded);
    fabIcon.classList.toggle('fa-plus', !isFabExpanded);
    fabIcon.classList.toggle('fa-times', isFabExpanded);
}

// Open Video Submission Modal
function openVideoModal() {
    console.log('Opening video submission modal');
    videoSubmissionModal.classList.add('visible');
    submitVideoForm.reset();
    videoFormMessage.textContent = '';
    videoFormMessage.className = 'message';
}

// Close Video Submission Modal
function closeVideoModal() {
    console.log('Closing video submission modal');
    videoSubmissionModal.classList.remove('visible');
    submitVideoForm.reset();
    videoFormMessage.textContent = '';
    videoFormMessage.className = 'message';
}

// Open Menu Modal
function openMenuModal() {
    console.log('Opening menu modal');
    menuModal.classList.add('visible');
}

// Close Menu Modal
function closeMenuModal() {
    console.log('Closing menu modal');
    menuModal.classList.remove('visible');
}

// Sanitize HTML to prevent XSS (basic sanitization)
function sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html; // Strips HTML tags
    return div.innerHTML; // Returns safe text
    // Note: For production, use a proper sanitization library like DOMPurify
}

// Open Content Modal (Hadith/Video)
function openContentModal(type, data) {
    console.log('Opening content modal for type:', type, 'Data:', data);
    if (type === 'hadith') {
        // Sanitize fields to prevent XSS (basic sanitization)
        const safeTitle = sanitizeHTML(data.title);
        const safeArabic = data.arabic ? sanitizeHTML(data.arabic) : '';
        const safeSource = sanitizeHTML(data.source);
        const safeNarrator = sanitizeHTML(data.narrator);
        // Translation contains HTML, so we allow it but ensure it's safe
        // In production, use DOMPurify to sanitize HTML in translation
        const translation = data.translation || '';

        contentModalContent.innerHTML = `
            <h3 class="hadith-title">${safeTitle}</h3>
            ${safeArabic ? `<p class="hadith-arabic">${safeArabic}</p>` : ''}
            <div class="hadith-translation">${translation}</div>
            <div class="hadith-meta">
                <div class="meta-item"><span class="meta-label">Source:</span> ${safeSource}</div>
                <div class="meta-item"><span class="meta-label">Narrator:</span> ${safeNarrator}</div>
                <div class="meta-item"><span class="meta-label">Date:</span> ${new Date(data.date).toLocaleDateString()}</div>
            </div>
            ${data.imageUrl ? `<img src="${data.imageUrl}" alt="${safeTitle}" loading="lazy" style="width: 100%; border-radius: 12px; margin-top: 16px;" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Not+Found';">` : ''}
            ${data.audioUrl ? `<audio controls src="${data.audioUrl}" style="width: 100%; margin-top: 16px;"></audio>` : ''}
        `;
    } else if (type === 'video') {
        const safeTitle = sanitizeHTML(data.title);
        contentModalContent.innerHTML = `
            <div class="video-modal-content">
                <iframe 
                    class="video-iframe" 
                    src="https://www.youtube.com/embed/${data.videoId}?enablejsapi=1&autoplay=0&rel=0" 
                    title="${safeTitle}" 
                    frameborder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowfullscreen>
                </iframe>
            </div>
            <h3 class="video-title" style="margin-top: 16px;">${safeTitle}</h3>
        `;
    }
    contentModal.classList.add('visible');
}

// Close Content Modal
function closeContentModal() {
    console.log('Closing content modal');
    contentModal.classList.remove('visible');
    contentModalContent.innerHTML = '';
}

// Handle Add Hadith Form Submission
function handleAddHadithSubmit(e) {
    e.preventDefault();
    console.log('handleAddHadithSubmit triggered');

    if (!db) {
        console.error('Database not initialized. Cannot submit Hadith.');
        showMessage('Database not initialized. Please check Firebase setup.', 'error', formMessage);
        return;
    }

    const title = document.getElementById('hadithTitle')?.value.trim();
    const arabic = document.getElementById('hadithArabic')?.value.trim();
    const translation = document.getElementById('hadithTranslation')?.value.trim();
    const source = document.getElementById('hadithSource')?.value.trim();
    const narrator = document.getElementById('hadithNarrator')?.value.trim();
    const imageUrl = document.getElementById('imageUrl')?.value.trim();
    const audioUrl = document.getElementById('audioUrl')?.value.trim();

    console.log('Add Hadith Form Data:', { title, arabic, translation, source, narrator, imageUrl, audioUrl });

    // Validate required fields
    if (!title || !translation || !source || !narrator) {
        console.log('Validation failed: Missing required fields');
        showMessage('Please fill in all required fields (Title, Translation, Source, Narrator)', 'error', formMessage);
        return;
    }

    // Basic input validation to prevent empty or overly long inputs
    if (title.length > 200 || source.length > 100 || narrator.length > 100) {
        console.log('Validation failed: Input too long');
        showMessage('Title, Source, or Narrator is too long. Please keep them under 200, 100, and 100 characters respectively.', 'error', formMessage);
        return;
    }

    const hadithData = {
        title,
        arabic: arabic || null,
        translation, // Store raw HTML (sanitize on display)
        source,
        narrator,
        imageUrl: imageUrl || null,
        audioUrl: audioUrl || null,
        date: Date.now()
    };

    console.log('Hadith data prepared:', hadithData);

    const hadithsRef = db.ref('hadiths');
    hadithsRef.push(hadithData)
        .then(() => {
            console.log('Hadith submitted successfully');
            showMessage('Hadith submitted successfully!', 'success', formMessage);
            addHadithForm.reset();
            // No need to call loadHadiths here since real-time listener will update
        })
        .catch(error => {
            console.error('Error submitting Hadith:', error);
            showMessage('Error submitting Hadith: ' + error.message, 'error', formMessage);
        });
}

// Handle Video Submission
function handleVideoSubmit(e) {
    e.preventDefault();
    console.log('handleVideoSubmit triggered');

    if (!db) {
        console.error('Database not initialized. Cannot submit video.');
        showMessage('Database not initialized. Please check Firebase setup.', 'error', videoFormMessage);
        return;
    }

    const title = document.getElementById('videoTitle')?.value.trim();
    const youtubeUrl = document.getElementById('youtubeUrl')?.value.trim();

    console.log('Video Form Data:', { title, youtubeUrl });

    if (!title || !youtubeUrl) {
        console.log('Validation failed: Missing title or YouTube URL');
        showMessage('Please provide both a video title and a YouTube URL', 'error', videoFormMessage);
        return;
    }

    if (title.length > 200) {
        console.log('Validation failed: Video title too long');
        showMessage('Video title is too long. Please keep it under 200 characters.', 'error', videoFormMessage);
        return;
    }

    const videoIdMatch = youtubeUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
    const videoId = videoIdMatch ? videoIdMatch[1] : null;

    console.log('Extracted videoId:', videoId);

    if (!videoId) {
        console.log('Validation failed: Invalid YouTube URL');
        showMessage('Invalid YouTube URL. Please provide a valid URL (e.g., https://www.youtube.com/watch?v=VIDEO_ID)', 'error', videoFormMessage);
        return;
    }

    const videoData = {
        title,
        videoId,
        date: Date.now()
    };

    const videosRef = db.ref('videos');
    videosRef.push(videoData)
        .then(() => {
            console.log('Video submitted successfully');
            showMessage('Video submitted successfully!', 'success', videoFormMessage);
            submitVideoForm.reset();
            closeVideoModal();
            // No need to call loadVideos here since real-time listener will update
        })
        .catch(error => {
            console.error('Error submitting Video:', error);
            showMessage('Error submitting video: ' + error.message, 'error', videoFormMessage);
        });
}

// Load Hadiths with Real-Time Updates
function loadHadiths() {
    console.log('Loading Hadiths...');
    hadithList.innerHTML = '<p class="loading-message">Loading Hadiths...</p>';

    if (!db) {
        console.error('Database not initialized. Cannot load Hadiths.');
        hadithList.innerHTML = '<p class="error-message">Database not initialized. Please check Firebase setup.</p>';
        return;
    }

    // Remove existing listener to prevent duplicates
    if (hadithListener) {
        console.log('Removing existing Hadith listener');
        hadithListener.off();
    }

    const hadithsRef = db.ref('hadiths');
    hadithListener = hadithsRef.orderByChild('date').limitToLast(50);
    hadithListener.on('value', snapshot => {
        hadithList.innerHTML = '';
        if (!snapshot.exists()) {
            console.log('No Hadiths found');
            hadithList.innerHTML = '<p class="error-message">No Hadiths found.</p>';
            return;
        }
        const hadiths = [];
        snapshot.forEach(child => {
            hadiths.push({ id: child.key, ...child.val() });
        });
        hadiths.reverse().forEach(hadith => {
            // Sanitize fields for display (except translation which contains HTML)
            const safeTitle = sanitizeHTML(hadith.title);
            const safeArabic = hadith.arabic ? sanitizeHTML(hadith.arabic) : '';
            const safeSource = sanitizeHTML(hadith.source);
            const safeNarrator = sanitizeHTML(hadith.narrator);
            const translation = hadith.translation || '';

            const card = document.createElement('div');
            card.className = 'hadith-card';
            card.setAttribute('tabindex', '0');
            card.innerHTML = `
                <h3 class="hadith-title">${safeTitle}</h3>
                ${safeArabic ? `<p class="hadith-arabic">${safeArabic}</p>` : ''}
                <div class="hadith-translation">${translation}</div>
                <div class="hadith-meta">
                    <div class="meta-item"><span class="meta-label">Source:</span> ${safeSource}</div>
                    <div class="meta-item"><span class="meta-label">Narrator:</span> ${safeNarrator}</div>
                    <div class="meta-item"><span class="meta-label">Date:</span> ${new Date(hadith.date).toLocaleDateString()}</div>
                </div>
                ${hadith.imageUrl ? `<img src="${hadith.imageUrl}" alt="${safeTitle}" loading="lazy" style="width: 100%; border-radius: 12px; margin-top: 16px;" onerror="this.onerror=null; this.src='https://via.placeholder.com/300x200?text=Image+Not+Found';">` : ''}
            `;
            card.addEventListener('click', () => openContentModal('hadith', hadith));
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') openContentModal('hadith', hadith);
            });
            hadithList.appendChild(card);
        });
    }, error => {
        console.error('Error loading Hadiths:', error);
        hadithList.innerHTML = `<p class="error-message">Error loading Hadiths: ${error.message}</p>`;
    });
}

// Load Videos with Real-Time Updates
function loadVideos() {
    console.log('Loading Videos...');
    youtubeVideosList.innerHTML = '<p class="loading-message">Loading videos...</p>';

    if (!db) {
        console.error('Database not initialized. Cannot load videos.');
        youtubeVideosList.innerHTML = '<p class="error-message">Database not initialized. Please check Firebase setup.</p>';
        return;
    }

    // Remove existing listener to prevent duplicates
    if (videoListener) {
        console.log('Removing existing Video listener');
        videoListener.off();
    }

    const videosRef = db.ref('videos');
    videoListener = videosRef.orderByChild('date').limitToLast(50);
    videoListener.on('value', snapshot => {
        youtubeVideosList.innerHTML = '';
        if (!snapshot.exists()) {
            console.log('No videos found');
            youtubeVideosList.innerHTML = '<p class="error-message">No videos found.</p>';
            return;
        }
        const videos = [];
        snapshot.forEach(child => {
            videos.push({ id: child.key, ...child.val() });
        });
        videos.reverse().forEach(video => {
            const safeTitle = sanitizeHTML(video.title);
            const card = document.createElement('div');
            card.className = 'video-card';
            card.setAttribute('tabindex', '0');
            card.innerHTML = `
                <img class="video-thumbnail" src="https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg" alt="${safeTitle}" loading="lazy" onerror="this.onerror=null; this.src='https://via.placeholder.com/120x90?text=Thumbnail+Not+Found';">
                <h3 class="video-title">${safeTitle}</h3>
            `;
            card.addEventListener('click', () => openContentModal('video', video));
            card.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') openContentModal('video', video);
            });
            youtubeVideosList.appendChild(card);
        });
    }, error => {
        console.error('Error loading videos:', error);
        youtubeVideosList.innerHTML = `<p class="error-message">Error loading videos: ${error.message}</p>`;
    });
}

// Switch Sections
function switchSection(targetId) {
    console.log('Switching to section:', targetId);
    document.querySelectorAll('.app-section').forEach(section => section.classList.add('hidden'));
    document.getElementById(targetId).classList.remove('hidden');
    navTabs.forEach(tab => tab.classList.remove('active'));
    const navTab = document.querySelector(`.nav-tab[data-target="${targetId}"]`);
    if (navTab) navTab.classList.add('active');
    closeMenuModal();

    // Load data only for the active section and remove listeners for others
    if (hadithListener) {
        console.log('Removing Hadith listener during section switch');
        hadithListener.off();
    }
    if (videoListener) {
        console.log('Removing Video listener during section switch');
        videoListener.off();
    }

    if (targetId === 'hadithSection') {
        loadHadiths();
    } else if (targetId === 'youtubeSection') {
        loadVideos();
    }
}

// Event Listeners
fab.addEventListener('click', toggleFabActions);

document.getElementById('submitVideoAction').addEventListener('click', () => {
    openVideoModal();
});

document.getElementById('shareAction').addEventListener('click', () => {
    console.log('Share action triggered');
    if (navigator.share) {
        navigator.share({
            title: 'Ummah Connect',
            text: 'Explore authentic Hadiths and Islamic videos on Ummah Connect!',
            url: window.location.href
        }).catch(error => console.error('Error sharing:', error));
    } else {
        alert('Share functionality not supported on this device.');
    }
});

contentModalCloseButton.addEventListener('click', closeContentModal);
videoModalCloseButton.addEventListener('click', closeVideoModal);
menuBtn.addEventListener('click', openMenuModal);
menuCloseButton.addEventListener('click', closeMenuModal);

if (addHadithForm) {
    console.log('Attaching submit event listener to addHadithForm');
    addHadithForm.addEventListener('submit', handleAddHadithSubmit);
} else {
    console.error('addHadithForm element not found in DOM');
    alert('Add Hadith form not found. Please check the HTML.');
}

if (submitVideoForm) {
    console.log('Attaching submit event listener to submitVideoForm');
    submitVideoForm.addEventListener('submit', handleVideoSubmit);
} else {
    console.error('submitVideoForm element not found in DOM');
    alert('Submit Video form not found. Please check the HTML.');
}

darkModeToggle.addEventListener('click', toggleDarkMode);

navTabs.forEach(tab => {
    tab.addEventListener('click', function () {
        const target = this.dataset.target;
        if (target) switchSection(target);
    });
});

menuItems.forEach(item => {
    item.addEventListener('click', function () {
        const target = this.dataset.target;
        if (target) switchSection(target);
    });
});

window.addEventListener('click', (e) => {
    if (e.target === contentModal) closeContentModal();
    if (e.target === videoSubmissionModal) closeVideoModal();
    if (e.target === menuModal) closeMenuModal();
});

// Initialize App
function initApp() {
    console.log('Initializing app...');
    if (localStorage.getItem('darkMode') === 'true') toggleDarkMode();
    initCloudinary();
    testRealtimeDatabase();
    loadHadiths(); // Load Hadiths by default since it's the default section

    document.addEventListener('click', (e) => {
        if (isFabExpanded && !fabContainer.contains(e.target)) toggleFabActions();
    });

    console.log('Testing showMessage...');
    showMessage('App initialized successfully', 'success', formMessage);
}

// Clean up listeners on page unload
window.addEventListener('beforeunload', () => {
    if (hadithListener) hadithListener.off();
    if (videoListener) videoListener.off();
});

window.addEventListener('load', () => {
    console.log('Window loaded, running initApp');
    initApp();
});

window.onerror = function (message, source, lineno, colno, error) {
    console.error('Global error:', message, 'at', source, 'line', lineno, 'column', colno, 'Error object:', error);
    showMessage('An unexpected error occurred. Please check the console for details.', 'error', formMessage);
};