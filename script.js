// --- Global Interactions ---
document.addEventListener('DOMContentLoaded', () => {
    // Reveal Observer
    const revealOptions = { threshold: 0.15 };
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, revealOptions);
    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // Initial Load
    loadPublicGallery();
    loadPublicFeedback();
});

// Sticky Header
const header = document.querySelector('.header');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Mobile Menu
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.getElementById('mobileNav');
const overlay = document.getElementById('overlay');

const toggleMenu = () => {
    mobileNav.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : 'auto';
};

if(menuToggle) {
    menuToggle.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);
    document.querySelectorAll('.mobile-nav-links a').forEach(link => {
        link.addEventListener('click', toggleMenu);
    });
}

// Patient Portal Modal
const portalModal = document.getElementById('patientPortal');
const openPortalBtns = document.querySelectorAll('a[href="#"], .btn-primary'); // Targets Download Report buttons

openPortalBtns.forEach(btn => {
    if (btn.innerText.includes('Download') || btn.innerText.includes('Report')) {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            portalModal.classList.add('active');
        });
    }
});

if(portalModal) {
    portalModal.querySelector('.close').addEventListener('click', () => {
        portalModal.classList.remove('active');
    });
}

// --- Dynamic Content Loading ---
async function loadPublicGallery() {
    const grid = document.getElementById('galleryGrid');
    if (!grid) return;
    try {
        const res = await fetch('api/gallery.php?action=list');
        const data = await res.json();
        if (data.length === 0) {
            grid.innerHTML = '<div class="mock-result-text">Our events gallery will be updated soon!</div>';
            return;
        }
        grid.innerHTML = data.map(item => `
            <div class="gallery-item" onclick="openLightbox('${item.url}')">
                <img src="${item.url}" alt="${item.title}">
                <div class="gallery-overlay"><i class="fas fa-search-plus"></i></div>
            </div>
        `).join('');
    } catch (err) {
        grid.innerHTML = '<div class="mock-result-text">Gallery coming soon.</div>';
    }
}

async function loadPublicFeedback() {
    const grid = document.getElementById('feedbackGrid');
    if (!grid) return;
    try {
        const res = await fetch('api/feedback.php?action=list');
        const data = await res.json();
        const approved = data.filter(f => f.status === 'Approved');
        if (approved.length === 0) {
            document.querySelector('.testimonial-slider-container').style.display = 'none';
            return;
        }
        grid.innerHTML = approved.map(f => `
            <div class="testimonial-card">
                <div class="stars">${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</div>
                <p>${f.comment}</p>
                <span class="client-name">- ${f.name}</span>
            </div>
        `).join('');
        
        initTestimonialSlider();
    } catch (err) {
        console.error("Feedback load failed");
    }
}

function initTestimonialSlider() {
    const track = document.getElementById('feedbackGrid');
    const slides = Array.from(track.children);
    const dotsNav = document.getElementById('sliderDots');
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');

    if (slides.length <= 1) return;

    let currentIndex = 0;
    dotsNav.innerHTML = '';
    slides.forEach((_, i) => {
        const dot = document.createElement('div');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => moveToSlide(i));
        dotsNav.appendChild(dot);
    });

    const dots = Array.from(dotsNav.children);
    const moveToSlide = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach(d => d.classList.remove('active'));
        dots[index].classList.add('active');
        currentIndex = index;
    };

    nextBtn.addEventListener('click', () => moveToSlide((currentIndex + 1) % slides.length));
    prevBtn.addEventListener('click', () => moveToSlide((currentIndex - 1 + slides.length) % slides.length));
    setInterval(() => moveToSlide((currentIndex + 1) % slides.length), 5000);
}

// --- Star Rating ---
const stars = document.querySelectorAll('#starRating i');
const ratingInput = document.getElementById('ratingInput');

stars.forEach(star => {
    star.addEventListener('click', () => {
        const rating = star.getAttribute('data-rating');
        ratingInput.value = rating;
        stars.forEach(s => {
            s.classList.toggle('active', s.getAttribute('data-rating') <= rating);
            s.classList.toggle('fas', s.getAttribute('data-rating') <= rating);
            s.classList.toggle('far', s.getAttribute('data-rating') > rating);
        });
    });
});

// --- Portal Form ---
const portalForm = document.getElementById('portalForm');
if (portalForm) {
    portalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const caseId = document.getElementById('caseId').value;
        const password = document.getElementById('password').value;
        const resultDiv = document.getElementById('reportResult');
        const btn = portalForm.querySelector('button');

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';

        try {
            const res = await fetch(`api/reports.php?action=fetch&case_id=${caseId}&cnic=${password}`); // Mapping password to 'cnic' param for backend compatibility
            const data = await res.json();

            if (!res.ok) throw new Error(data.error);

            portalForm.style.display = 'none';
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <h3>Welcome, ${data.patient_name}</h3>
                <p>Status: <strong>${data.status}</strong></p>
                <p>Test: ${data.test_name}</p>
                ${data.status === 'Final' ? 
                  `<a href="api/reports.php?action=download&case_id=${caseId}&cnic=${password}" class="btn btn-primary" style="width:100%; margin-top:20px"><i class="fas fa-download"></i> Download Report</a>` : 
                  `<p style="color:var(--secondary-dark); margin-top:10px">Your report is being processed. Typical wait time is 4-6 hours.</p>`}
            `;
        } catch (err) {
            alert(err.message || "Could not retrieve report. Check Case ID/Password.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = 'Fetch My Report';
        }
    });
}

// --- Lightbox ---
function openLightbox(url) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    img.src = url;
    lb.classList.add('active');
}

const closeLightbox = document.querySelector('.close-lightbox');
if(closeLightbox) {
    closeLightbox.addEventListener('click', () => {
        document.getElementById('lightbox').classList.remove('active');
    });
}
}
