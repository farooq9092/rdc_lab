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

    // Sticky Header
    const header = document.querySelector('.header');
    window.addEventListener('scroll', () => {
        if (!header) return;
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
        if (!mobileNav || !overlay) return;
        mobileNav.classList.toggle('open');
        overlay.classList.toggle('open');
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : 'auto';
    };

    if(menuToggle && mobileNav) {
        menuToggle.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        document.querySelectorAll('.mobile-nav-links a').forEach(link => {
            link.addEventListener('click', toggleMenu);
        });
    }

    // Star Rating Interactivity
    const stars = document.querySelectorAll('#starRating i');
    const ratingInput = document.getElementById('ratingInput');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const rating = star.getAttribute('data-rating');
            ratingInput.value = rating;
            stars.forEach(s => {
                const sPos = s.getAttribute('data-rating');
                if (parseInt(sPos) <= parseInt(rating)) {
                    s.classList.remove('far');
                    s.classList.add('fas', 'active');
                } else {
                    s.classList.remove('fas', 'active');
                    s.classList.add('far');
                }
            });
        });
    });

    // Feedback Submission
    const feedbackForm = document.getElementById('feedbackForm');
    if (feedbackForm && ratingInput) {
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = feedbackForm.querySelector('button');
            const name = feedbackForm.querySelector('input[type="text"]').value;
            const comment = feedbackForm.querySelector('textarea').value;
            const rating = ratingInput.value;

            if (rating === "0" || !rating) {
                alert("Please select a star rating!");
                return;
            }

            btn.disabled = true;
            const originalText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

            try {
                const res = await fetch('api/feedback.php?action=submit', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ name, comment, rating })
                });
                if (res.ok) {
                    feedbackForm.innerHTML = `
                        <div style="text-align:center; padding:40px; color:var(--primary);">
                            <i class="fas fa-check-circle" style="font-size:3rem; margin-bottom:15px;"></i>
                            <h3>Thank You!</h3>
                            <p>Your feedback has been submitted for review.</p>
                        </div>`;
                } else {
                    alert("Error submitting feedback. Please try again.");
                }
            } catch (err) { 
                alert("Submission failed. Check your connection."); 
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    // Portal Modal Logic
    const portalModal = document.getElementById('patientPortal');
    
    // Auto-identify triggers by text as fallback
    document.querySelectorAll('.btn').forEach(btn => {
        if (btn.innerText.includes('Download') || btn.innerText.includes('Report')) {
            btn.classList.add('portal-trigger');
        }
    });

    const portalTriggers = document.querySelectorAll('.portal-trigger');
    portalTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (portalModal) portalModal.classList.add('active');
        });
    });

    if(portalModal) {
        const closeBtn = portalModal.querySelector('.close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                portalModal.classList.remove('active');
            });
        }
    }

    // Portal Form Submission
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
                const res = await fetch('api/reports.php?action=fetch', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ case_id: caseId, cnic: password })
                });

                const data = await res.json().catch(() => ({ error: "Invalid response from server" }));

                if (!res.ok) {
                    throw new Error(data.error || "Incorrect ID/Password. Check the credentials sent to you.");
                }

                // SUCCESS: Hide form, show result
                portalForm.style.display = 'none';
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = `
                    <div style="border-bottom:1px solid #eee; padding-bottom:12px; margin-bottom:15px; text-align:left;">
                        <h3 style="margin:0; color:var(--primary)">Patient: ${data.patient_name}</h3>
                        <p style="margin:4px 0 0; color:#666; font-size:0.9rem">Case ID: #${data.case_id}</p>
                    </div>
                    <p style="margin-bottom:15px; font-weight:600">Status: <span style="background:${data.status === 'Final' ? '#d4edda' : '#fff3cd'}; padding:4px 10px; border-radius:12px; font-size:0.8rem">${data.status}</span></p>
                    
                    ${data.status === 'Final' ? 
                      `<a href="api/reports.php?action=download&case_id=${encodeURIComponent(caseId)}&cnic=${encodeURIComponent(password)}" class="btn btn-primary" style="display:block; text-align:center; padding:15px;"><i class="fas fa-download"></i> DOWNLOAD OFFICIAL REPORT</a>` :
                      `<div style="background:#f8f9fa; padding:15px; border-radius:8px; border-left:4px solid #f1c40f; color:#856404; font-size:0.85rem;"><strong>Processing:</strong> Your results are not finalized yet. Please check back later.</div>`}

                    <button class="btn" onclick="location.reload()" style="margin-top:20px; width:100%; height:45px; background:#f0f0f0; color:#333; border:none; border-radius:8px; cursor:pointer; font-weight:600;">NEW SEARCH</button>
                `;
            } catch (err) {
                alert(err.message);
            } finally {
                btn.innerHTML = originalText;
                btn.disabled = false;
            }
        });
    }

    // Booking Form Submission
    const bookingForm = document.getElementById('bookingForm');
    if (bookingForm) {
        bookingForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const btn = bookingForm.querySelector('button');
            const name = bookingForm.querySelector('input[type="text"]').value;
            const phone = bookingForm.querySelector('input[type="tel"]').value;
            const packageValue = document.getElementById('pkgSelect').value;
            const address = bookingForm.querySelector('textarea').value;

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';

            try {
                const res = await fetch('api/bookings.php?action=submit', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ name, phone, package: packageValue, address })
                });
                if (res.ok) {
                    bookingForm.innerHTML = `
                        <div style="text-align:center; padding:30px; background:#f0f7ff; border-radius:15px; border:2px dashed var(--primary);">
                            <i class="fas fa-check-circle" style="font-size:3rem; color:var(--primary); margin-bottom:15px;"></i>
                            <h3>Request Received!</h3>
                            <p>Our team will contact you within 15 minutes to confirm your home sampling.</p>
                        </div>`;
                } else {
                    alert("Error submitting booking. Please try again.");
                }
            } catch (err) { alert("Network error. Please call us directly."); }
            finally { 
                btn.disabled = false; 
                btn.innerHTML = 'Request Sample Collection';
            }
        });
    }

    // Initial Load
    loadPublicGallery();
    loadPublicFeedback();
});

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
            const container = document.querySelector('.testimonial-slider-container');
            if (container) container.style.display = 'none';
            return;
        }
        grid.innerHTML = approved.map(f => `
            <div class="testimonial-card">
                <div class="stars">${'★'.repeat(f.rating)}${'☆'.repeat(5-f.rating)}</div>
                <p>"${f.comment}"</p>
                <div class="client-info">
                    <span class="client-name">${f.name}</span>
                    <span class="verified-tag"><i class="fas fa-check-circle"></i> Verified Patient</span>
                </div>
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

    if (!track || slides.length <= 1) return;

    let currentIndex = 0;
    if (dotsNav) {
        dotsNav.innerHTML = '';
        slides.forEach((_, i) => {
            const dot = document.createElement('div');
            dot.classList.add('dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => moveToSlide(i));
            dotsNav.appendChild(dot);
        });
    }

    const moveToSlide = (index) => {
        track.style.transform = `translateX(-${index * 100}%)`;
        if (dotsNav) {
            const dots = Array.from(dotsNav.children);
            dots.forEach(d => d.classList.remove('active'));
            dots[index].classList.add('active');
        }
        currentIndex = index;
    };

    if (nextBtn) nextBtn.addEventListener('click', () => moveToSlide((currentIndex + 1) % slides.length));
    if (prevBtn) prevBtn.addEventListener('click', () => moveToSlide((currentIndex - 1 + slides.length) % slides.length));
    setInterval(() => moveToSlide((currentIndex + 1) % slides.length), 5000);
}

// Lightbox
function openLightbox(url) {
    const lb = document.getElementById('lightbox');
    const img = document.getElementById('lightboxImg');
    if (img && lb) {
        img.src = url;
        lb.classList.add('active');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const closeLightbox = document.querySelector('.close-lightbox');
    if(closeLightbox) {
        closeLightbox.addEventListener('click', () => {
            const lb = document.getElementById('lightbox');
            if (lb) lb.classList.remove('active');
        });
    }
});
