const EVENT_DATE = new Date('2026-05-27T18:00:00');

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

function handleRSVP(e) {
    e.preventDefault();
    const name = document.getElementById('rsvp-name').value;
    const attending = document.getElementById('rsvp-attending').value;
    const guests = document.getElementById('rsvp-guests').value;
    const message = document.getElementById('rsvp-message').value;

    console.log('RSVP:', { name, attending, guests, message });

    document.getElementById('rsvp-success').classList.add('show');
    document.getElementById('rsvp-name').value = '';
    document.getElementById('rsvp-message').value = '';
    document.getElementById('rsvp-guests').value = '0';

    setTimeout(() => {
        document.getElementById('rsvp-success').classList.remove('show');
    }, 3000);
}

function handleSongSubmit(e) {
    e.preventDefault();
    const songName = document.getElementById('song-name').value;
    const artist = document.getElementById('song-artist').value;

    console.log('Song Suggestion:', { songName, artist });

    alert(`¡Gracias por sugerir "${songName}" de ${artist}!`);
    document.getElementById('song-name').value = '';
    document.getElementById('song-artist').value = '';
    closeModal('song');
}

function scrollToSection(id) {
    document.getElementById(id).scrollIntoView({ behavior: 'smooth' });
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
    'images/IMG-20260423-WA0004.jpg',
    'images/IMG-20260423-WA0005.jpg',
    'images/IMG-20260423-WA0006.jpg',
    'images/IMG-20260423-WA0007.jpg',
    'images/IMG-20260423-WA0008.jpg',
    'images/IMG-20260423-WA0009.jpg',
    'images/IMG-20260423-WA0010.jpg',
    'images/IMG-20260423-WA0011.jpg',
    'images/IMG-20260423-WA0012.jpg',
    'images/IMG-20260423-WA0013.jpg',
    'images/IMG-20260423-WA0014.jpg',
    'images/IMG-20260423-WA0015.jpg',
    'images/IMG-20260423-WA0016.jpg',
    'images/IMG-20260423-WA0017.jpg'
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