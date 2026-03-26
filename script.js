// --- General Interactions ---

// Sticky Header & Navigation Effects
const header = document.querySelector('.header');
const mobileNav = document.getElementById('mobileNav');
const overlay = document.getElementById('overlay');
const menuToggle = document.querySelector('.menu-toggle');

window.addEventListener('scroll', () => {
    if (window.scrollY > 80) {
        header.classList.add('nav-scrolled');
    } else {
        header.classList.remove('nav-scrolled');
    }
});

  // Sticky header scroll effect
  // Note: The 'header' variable is already declared globally above.
  // This listener adds a 'scrolled' class based on a 50px scroll threshold.
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

// Mobile Menu Logic
const toggleMobileMenu = () => {
    mobileNav.classList.toggle('open');
    overlay.classList.toggle('open');
    document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : 'auto';
};

menuToggle.addEventListener('click', toggleMobileMenu);
overlay.addEventListener('click', toggleMobileMenu);

// Close Mobile Menu on Link Click
document.querySelectorAll('.mobile-nav-links a').forEach(link => {
    link.addEventListener('click', toggleMobileMenu);
});

// Smooth Scrolling for Hash Links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// --- Feature Integration ---

// Package "Buy Now" Selection Logic
document.querySelectorAll('.pkg-card .btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const pkgCard = btn.closest('.pkg-card');
        const pkgName = pkgCard.querySelector('h3').innerText;
        const select = document.getElementById('pkgSelect');
        const contactSection = document.getElementById('contact');

        // Logic to pre-select dropdown
        for (let i = 0; i < select.options.length; i++) {
            if (select.options[i].text.includes(pkgName)) {
                select.selectedIndex = i;
                break;
            }
        }

        // Visual flash on select
        select.style.borderColor = 'var(--secondary)';
        setTimeout(() => select.style.borderColor = '#ddd', 1500);
    });
});

// --- FAQ Accordion ---
document.querySelectorAll('.faq-question').forEach(q => {
    q.addEventListener('click', () => {
        const item = q.parentElement;
        item.classList.toggle('active');
        
        // Close others
        document.querySelectorAll('.faq-item').forEach(other => {
            if (other !== item) other.classList.remove('active');
        });
    });
});

// --- Test Finder Logic ---
const testData = [
    { name: 'Cardiac Risk (Trop I, CRP, Lipid)', cat: 'Cardiac', price: 'Rs. 3,500' },
    { name: 'Renal Function (Electrolytes, BUN, Creatinine)', cat: 'Renal', price: 'Rs. 1,400' },
    { name: 'Extended Renal (Calcium, Phosphorus, Albumin)', cat: 'Renal', price: 'Rs. 3,000' },
    { name: 'Hepatitis Screening (SGPT, B, HCV, HIV)', cat: 'Hepatitis', price: 'Rs. 1,000' },
    { name: 'HCV & HBV, PCR', cat: 'Molecular', price: 'Rs. 2,500' },
    { name: 'Small Biopsy / Histopathology', cat: 'Biopsy', price: 'Rs. 2,000' },
    { name: 'Medium Biopsy / Histopathology', cat: 'Biopsy', price: 'Rs. 2,500' },
    { name: 'Large Biopsy / Histopathology', cat: 'Biopsy', price: 'Rs. 3,000' },
    { name: 'CBC (Complete Blood Count)', cat: 'Hematology', price: 'Rs. 800' },
    { name: 'Fasting Blood Sugar', cat: 'Biochemistry', price: 'Rs. 300' },
    { name: 'Urine C/E (Routine Examination)', cat: 'Clinical', price: 'Rs. 400' },
    { name: 'USG Guided Trucut Biopsy', cat: 'Interventional', price: 'On Call' },
    { name: 'Ultrasound Guided Diagnostic Tap', cat: 'Interventional', price: 'On Call' },
    { name: 'PICC Line (Bard) for Chemo', cat: 'Interventional', price: 'On Call' },
    { name: 'Microwave Ablation (Tumors/Fibroids)', cat: 'Interventional', price: 'On Call' },
    { name: 'CT Guided Nerve Root Block', cat: 'Interventional', price: 'On Call' }
];

const testSearchInput = document.getElementById('testSearchInput');
const testResults = document.getElementById('testResults');

if (testSearchInput) {
    testSearchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        if (query.length < 2) {
            testResults.innerHTML = '<div class="mock-result-text">Start typing to find medical tests...</div>';
            return;
        }

        const filtered = testData.filter(t => t.name.toLowerCase().includes(query) || t.cat.toLowerCase().includes(query));
        
        if (filtered.length === 0) {
            testResults.innerHTML = '<div class="mock-result-text">No matching tests found. Please contact us for custom inquiries.</div>';
        } else {
            testResults.innerHTML = filtered.map(t => `
                <div class="test-result-item">
                    <div class="test-info">
                        <h4>${t.name}</h4>
                        <p>${t.cat}</p>
                    </div>
                    <div class="test-price">${t.price}</div>
                </div>
            `).join('');
        }
    });
}

// --- Patient Report Portal ---
const portalModalHTML = `
<div id="portalModal" class="modal">
    <div class="modal-content" style="max-width: 500px">
        <span class="close-modal">&times;</span>
        <div class="portal-header">
            <div style="background:var(--bg-light); width:80px; height:80px; border-radius:50%; display:flex; align-items:center; justify-content:center; margin:0 auto 20px">
                <i class="fas fa-file-medical" style="font-size:2.5rem; color:var(--primary)"></i>
            </div>
            <h2 style="color:var(--primary)">Secure Report Portal</h2>
            <p style="color:var(--text-muted); margin-bottom:25px">Enter your credentials to access your official laboratory results.</p>
        </div>
        
        <form id="portalAuthForm" class="portal-form" style="text-align:left">
            <div style="margin-bottom:20px">
                <label style="display:block; font-weight:700; margin-bottom:8px">Laboratory Case ID</label>
                <input type="text" id="pCaseId" placeholder="e.g. 12345" required style="width:100%; padding:15px; border-radius:10px; border:2px solid #eee">
            </div>
            <div style="margin-bottom:25px">
                <label style="display:block; font-weight:700; margin-bottom:8px">Portal Password</label>
                <input type="password" id="pPassword" placeholder="Enter your portal password" required style="width:100%; padding:15px; border-radius:10px; border:2px solid #eee">
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; padding:18px; font-size:1.1rem">Verify Identity & Search</button>
        </form>
        
        <div id="reportDisplay" style="display:none; margin-top:30px; padding:25px; border-radius:15px; background:#f8fafc; border:1px solid #e2e8f0; text-align:center">
            <h3 id="patientNameDisplay" style="color:var(--primary); margin-bottom:10px"></h3>
            <p id="reportContext" style="font-size:1rem; margin-bottom:20px"></p>
            <div id="reportAction"></div>
        </div>

        <div class="portal-footer" style="margin-top:25px; font-size:0.9rem; color:var(--text-muted)">
            <p><i class="fas fa-lock"></i> 128-bit Encrypted Secure Access</p>
        </div>
    </div>
</div>
`;

document.body.insertAdjacentHTML('beforeend', portalModalHTML);

const modal = document.getElementById('portalModal');
const closeBtn = modal.querySelector('.close-modal');
// Global listener for all 'View Reports' buttons (Event Delegation)
document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-primary[href="#"]');
    if (btn) {
        e.preventDefault();
        modal.style.display = 'flex';
        // Close mobile nav if it's open
        if (mobileNav.classList.contains('open')) {
            toggleMobileMenu();
        }
    }
});

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
        document.getElementById('reportDisplay').style.display = 'none';
        document.getElementById('portalAuthForm').style.display = 'block';
    });
}

window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
});

// --- Scroll Animations ---

const revealOptions = {
    threshold: 0.15,
};

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            // Counter Animation if element is an impact item
            if (entry.target.classList.contains('impact-item')) {
                animateCounter(entry.target.querySelector('h3'));
            }
        }
    });
}, revealOptions);

// Final check to ensure all elements are visible if observer fails
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
document.documentElement.classList.add('reveal-ready');

// Safety: Force all visible after 2s
setTimeout(() => {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('active'));
}, 2000);

// --- Patient Portal Logic ---
const initPortal = () => {
    const authForm = document.getElementById('portalAuthForm');
    if (!authForm) return;

    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const caseId = document.getElementById('pCaseId').value;
        const password = document.getElementById('pPassword').value;
        const display = document.getElementById('reportDisplay');
        const action = document.getElementById('reportAction');
        const context = document.getElementById('reportContext');
        const nameDisplay = document.getElementById('patientNameDisplay');
        const submitBtn = authForm.querySelector('button');

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';

        try {
            const response = await fetch(`api/reports.php?action=fetch&case_id=${caseId}&password=${password}`);
            const data = await response.json();

            if (response.status === 404) {
                alert("Case ID not found. Please verify your receipt.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Verify Identity & Search';
                return;
            }
            if (response.status === 403) {
                alert("Access Denied: Incorrect Password for this Case ID.");
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Verify Identity & Search';
                return;
            }

            authForm.style.display = 'none';
            display.style.display = 'block';
            nameDisplay.textContent = "Assalam-o-Alaikum, " + data.patient_name;

            if (data.status === 'Final') {
                context.innerHTML = `<span style="color:#059669; font-weight:700"><i class="fas fa-check-circle"></i> REPORT READY</span><br>Your official laboratory results for ${data.test_name} are ready.`;
                action.innerHTML = `<a href="api/reports.php?action=download&case_id=${caseId}&password=${password}" class="btn btn-secondary" style="width:100%; display:inline-block; margin-top:10px" target="_blank"><i class="fas fa-file-pdf"></i> Download Official PDF Report</a>`;
            } else {
                context.innerHTML = `<span style="color:#f59e0b; font-weight:700"><i class="fas fa-clock"></i> UNDER PROCESSING</span><br>Your test for ${data.test_name} is currently being analyzed by our pathological experts.`;
                action.innerHTML = `<p style="color:var(--text-muted); font-size:0.9rem; margin-top:10px">Please check again in 2-4 hours.</p>`;
            }
        } catch (error) {
            alert("Digital portal is temporarily unavailable. Please call 062-2881565.");
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'Verify Identity & Search';
        }
    });
};
setTimeout(initPortal, 100);

// --- Form Handling ---
const bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = bookingForm.querySelector('button');
        const originalText = btn.innerHTML;
        
        const formData = {
            name: e.target.querySelector('input[type="text"]').value,
            phone: e.target.querySelector('input[type="tel"]').value,
            package: document.getElementById('pkgSelect').value,
            address: e.target.querySelector('textarea').value
        };

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            const response = await fetch('api/bookings.php?action=create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            if (response.ok) {
                btn.innerHTML = '<i class="fas fa-check"></i> Requested! ✅';
                btn.style.background = '#059669';
                bookingForm.reset();
                setTimeout(() => {
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                    btn.style.background = ''; // Revert to CSS default
                }, 3000);
            } else {
                throw new Error('Server error');
            }
        } catch (error) {
            alert("Connection error. Please call us directly at 062 2881565.");
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });
}
// --- Gallery Lightbox Logic ---
const lightboxHTML = `
<div id="lightbox" class="lightbox">
    <span class="close-lightbox">&times;</span>
    <img class="lightbox-content" id="lightboxImg">
</div>
`;
document.body.insertAdjacentHTML('beforeend', lightboxHTML);

const lightbox = document.getElementById('lightbox');
const lightboxImg = document.getElementById('lightboxImg');

function openLightbox(src) {
    lightboxImg.src = src;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

lightbox.addEventListener('click', (e) => {
    if (e.target !== lightboxImg) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// --- Feedback & Star Rating Logic ---
const starRating = document.getElementById('starRating');
const stars = starRating ? starRating.querySelectorAll('i') : [];
const ratingInput = document.getElementById('ratingInput');

stars.forEach(star => {
    star.addEventListener('mouseover', () => {
        const r = star.getAttribute('data-rating');
        stars.forEach(s => s.classList.toggle('hover', s.getAttribute('data-rating') <= r));
    });

    star.addEventListener('mouseout', () => {
        stars.forEach(s => s.classList.remove('hover'));
    });

    star.addEventListener('click', () => {
        const r = star.getAttribute('data-rating');
        ratingInput.value = r;
        stars.forEach(s => {
            s.classList.toggle('active', s.getAttribute('data-rating') <= r);
            s.classList.toggle('far', s.getAttribute('data-rating') > r);
            s.classList.toggle('fas', s.getAttribute('data-rating') <= r);
        });
    });
});

const feedbackForm = document.getElementById('feedbackForm');
if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = feedbackForm.querySelector('button');
        const originalText = btn.innerHTML;
        const rating = ratingInput.value;

        if (rating == "0") return alert("Please select a star rating!");

        const formData = {
            name: e.target.querySelector('input[type="text"]').value,
            rating: rating,
            comment: e.target.querySelector('textarea').value
        };

        btn.disabled = true;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

        try {
            const res = await fetch('api/feedback.php?action=create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                alert("Thank you for your valuable feedback! It will be visible after moderation.");
                feedbackForm.reset();
                stars.forEach(s => {
                    s.classList.remove('active', 'fas');
                    s.classList.add('far');
                });
                ratingInput.value = "0";
            } else {
                throw new Error();
            }
        } catch (err) {
            alert("Feedback could not be sent. Please try again later.");
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
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
    const nextBtn = document.querySelector('.next-btn');
    const prevBtn = document.querySelector('.prev-btn');
    const dotsNav = document.getElementById('sliderDots');
    
    if (slides.length <= 1) {
        if(nextBtn) nextBtn.style.display = 'none';
        if(prevBtn) prevBtn.style.display = 'none';
        return;
    }

    let currentIndex = 0;
    
    // Create dots
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

    nextBtn.addEventListener('click', () => {
        let index = (currentIndex + 1) % slides.length;
        moveToSlide(index);
    });

    prevBtn.addEventListener('click', () => {
        let index = (currentIndex - 1 + slides.length) % slides.length;
        moveToSlide(index);
    });

    // Auto slide
    setInterval(() => {
        let index = (currentIndex + 1) % slides.length;
        moveToSlide(index);
    }, 5000);
}

// Initialize dynamic content
document.addEventListener('DOMContentLoaded', () => {
    loadPublicGallery();
    loadPublicFeedback();
});
