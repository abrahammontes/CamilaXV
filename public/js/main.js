const EVENT_DATE = new Date('2026-07-04T17:00:00');
const API_URL = '';

const xvcamilaImages = [
    'images/xvcamila-photosv2_(1).jpeg',
    'images/xvcamila-photosv2_(2).jpeg',
    'images/xvcamila-photosv2_(3).jpeg',
    'images/xvcamila-photosv2_(4).jpeg',
    'images/xvcamila-photosv2_(5).jpeg',
    'images/xvcamila-photosv2_(6).jpeg',
    'images/xvcamila-photosv2_(7).jpeg',
    'images/xvcamila-photosv2_(8).jpeg',
    'images/xvcamila-photosv2_(9).jpeg',
    'images/xvcamila-photosv2_(10).jpeg'
];

// Background scroll effect with fade-in/fade-out
function initBackgroundScroll() {
    const container = document.getElementById('scroll-background-container');
    if (!container) return;

    const bg1 = document.getElementById('scroll-bg-1');
    const bg2 = document.getElementById('scroll-bg-2');
    if (!bg1 || !bg2) return;

    // Preload images
    const preloadedImages = xvcamilaImages.map(src => {
        const img = new Image();
        img.src = src;
        return img;
    });

    let currentIndex = 0;
    let nextIndex = 1;
    let isTransitioning = false;

    // Set initial backgrounds
    bg1.style.backgroundImage = `url('${xvcamilaImages[0]}')`;
    bg2.style.backgroundImage = `url('${xvcamilaImages[1]}')`;
    bg1.classList.add('active');

    function updateBackgrounds() {
        const scrollPosition = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        
        // Calculate progress (0 to 1)
        const progress = scrollPosition / (documentHeight - windowHeight);
        
        // Map progress to image index (0 to images.length-1)
        const targetIndex = Math.floor(progress * (xvcamilaImages.length - 1));
        
        // Only update if target index changed and we're not already transitioning
        if (targetIndex !== currentIndex && !isTransitioning) {
            isTransitioning = true;
            
            // Set the next background
            const nextBg = currentIndex === 0 ? bg2 : bg1;
            nextBg.style.backgroundImage = `url('${xvcamilaImages[targetIndex]}')`;
            nextBg.classList.add('active');
            
            // After transition duration, switch active class
            setTimeout(() => {
                const currentBg = currentIndex === 0 ? bg1 : bg2;
                currentBg.classList.remove('active');
                currentIndex = targetIndex;
                nextIndex = (targetIndex + 1) % xvcamilaImages.length;
                
                // Set the next upcoming background
                const upcomingBg = currentIndex === 0 ? bg2 : bg1;
                upcomingBg.style.backgroundImage = `url('${xvcamilaImages[nextIndex]}')`;
                
                isTransitioning = false;
            }, 1500); // Match CSS transition duration
        }
    }
    
    // Initial call
    updateBackgrounds();
    
    // Update on scroll and resize
    window.addEventListener('scroll', updateBackgrounds);
    window.addEventListener('resize', updateBackgrounds);
}

function updateCountdown() {
    const now = new Date();
    const diff = EVENT_DATE - now;

    if (diff <= 0) {
        document.getElementById('days').textContent = '00';
        document.getElementById('hours').textContent = '00';
        document.getElementById('minutes').textContent = '00';
        document.getElementById('seconds').textContent = '00';
        return;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('days').textContent = String(days).padStart(2, '0');
    document.getElementById('hours').textContent = String(hours).padStart(2, '0');
    document.getElementById('minutes').textContent = String(minutes).padStart(2, '0');
    document.getElementById('seconds').textContent = String(seconds).padStart(2, '0');
}

updateCountdown();
setInterval(updateCountdown, 1000);

function openModal(id) {
    document.getElementById(`${id}-modal`).classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(id) {
    document.getElementById(`${id}-modal`).classList.remove('active');
    document.body.style.overflow = '';
}

function openGalleryModal(element) {
    const img = element.querySelector('img');
    document.getElementById('gallery-modal-img').src = img.src;
    document.getElementById('gallery-modal-img').alt = img.alt;
    openModal('gallery');
}

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
        if (e.target === this) {
            this.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
});

async function handleRSVP(e) {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value;
    const attending = document.getElementById('rsvp-attending').value;
    const guests = document.getElementById('rsvp-guests').value;
    const message = document.getElementById('rsvp-message').value;

    try {
        const res = await fetch(`${API_URL}/api/rsvp`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, attending, guests, message })
        });

        if (res.ok) {
            document.getElementById('rsvp-success').classList.add('show');
            document.getElementById('rsvp-name').value = '';
            document.getElementById('rsvp-message').value = '';
            document.getElementById('rsvp-guests').value = '0';

            setTimeout(() => {
                document.getElementById('rsvp-success').classList.remove('show');
            }, 3000);
        } else {
            const data = await res.json();
            alert(data.error || 'Error al enviar. Intenta de nuevo.');
        }
    } catch (err) {
        console.error('Error submitting RSVP:', err);
        alert('Error de conexión. Intenta de nuevo.');
    }
}

async function handleSongSubmit(e) {
    e.preventDefault();
    const songName = document.getElementById('song-name').value;
    const artist = document.getElementById('song-artist').value;

    try {
        const res = await fetch(`${API_URL}/api/song`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ songName, artist })
        });

        if (res.ok) {
            const data = await res.json();
            
            if (data.emailSent) {
                alert(`¡Gracias por sugerir "${songName}" de ${artist}!`);
                document.getElementById('song-name').value = '';
                document.getElementById('song-artist').value = '';
                closeModal('song');
            } else {
                alert('Canción guardada, pero el correo no pudo ser enviado. Intenta de nuevo más tarde.');
            }
        }
    } catch (err) {
        console.error('Error submitting song:', err);
    }
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
}

function openVideoModal() {
    const videoModal = document.getElementById('video-modal');
    const video = document.getElementById('gallery-video');
    videoModal.classList.add('active');
    video.play();
    document.body.style.overflow = 'hidden';
}

function closeVideoModal() {
    const videoModal = document.getElementById('video-modal');
    const video = document.getElementById('gallery-video');
    videoModal.classList.remove('active');
    video.pause();
    document.body.style.overflow = '';
}

const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
        document.body.style.overflow = '';
    }
});

const images = [
    'images/xvcamila-photosv2_(1).jpeg',
    'images/xvcamila-photosv2_(2).jpeg',
    'images/xvcamila-photosv2_(3).jpeg',
    'images/xvcamila-photosv2_(4).jpeg',
    'images/xvcamila-photosv2_(5).jpeg',
    'images/xvcamila-photosv2_(6).jpeg',
    'images/xvcamila-photosv2_(7).jpeg',
    'images/xvcamila-photosv2_(8).jpeg',
    'images/xvcamila-photosv2_(9).jpeg',
    'images/xvcamila-photosv2_(10).jpeg'
];

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function initBgSlider() {
    const slider = document.getElementById('bgSlider');
    if (!slider) return;
    
    const shuffledImages = shuffleArray([...images]);
    
    shuffledImages.forEach((img, index) => {
        const slide = document.createElement('div');
        slide.className = 'bg-slide' + (index === 0 ? ' active' : '');
        slide.style.backgroundImage = `url(${img})`;
        slider.appendChild(slide);
    });
    
    const slides = slider.querySelectorAll('.bg-slide');
    let currentIndex = 0;
    
    setInterval(() => {
        slides[currentIndex].classList.remove('active');
        currentIndex = (currentIndex + 1) % slides.length;
        slides[currentIndex].classList.add('active');
    }, 5000);
}

initBgSlider();
initBackgroundScroll();