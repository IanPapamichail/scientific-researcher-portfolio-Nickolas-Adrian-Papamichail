document.addEventListener('DOMContentLoaded', () => {
    // --- Calendar Elements (Preserved) ---
    const calendarTrigger = document.getElementById('calendar-trigger');
    const calendarPopup = document.getElementById('mini-calendar');
    const calGrid = document.getElementById('cal-grid');
    const calHeader = document.querySelector('.cal-header');
    const bookBtn = document.getElementById('btn-book');
    const timeSelector = document.getElementById('time-selector');
    const prevBtn = document.getElementById('prev-month');
    const nextBtn = document.getElementById('next-month');

    // --- Cinematic Animation Elements ---
    const heroSection = document.getElementById('hero-section');
    const pillWrapper = document.getElementById('profile-pill-wrapper');
    const pill = document.getElementById('profile-pill');
    const aboutSection = document.getElementById('about-section');
    const aboutContent = document.querySelector('.about-text-body'); // Content to fade in

    // --- State ---
    let selectedDate = null;
    let selectedTime = null;

    // --- Dynamic Date Logic ---
    const today = new Date();
    let viewMonth = today.getMonth(); // 0-11
    let viewYear = today.getFullYear();

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    calendarTrigger.textContent = monthNames[today.getMonth()];

    // Time Slots
    const timeSlots = [
        "09:00", "10:00", "11:00", "12:00",
        "13:00", "14:00", "15:00", "16:00",
        "17:00", "18:00"
    ];

    function renderTimeSlots() {
        timeSelector.innerHTML = '';
        timeSlots.forEach(time => {
            const slot = document.createElement('div');
            slot.classList.add('time-slot');
            slot.textContent = time;
            slot.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
                slot.classList.add('selected');
                selectedTime = time;
            });
            timeSelector.appendChild(slot);
        });
    }

    renderTimeSlots();

    // Toggle Calendar (Click)
    calendarTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        calendarPopup.classList.toggle('active');
    });

    calendarPopup.addEventListener('click', (e) => { e.stopPropagation(); });
    document.addEventListener('click', () => { calendarPopup.classList.remove('active'); });

    function renderCalendar() {
        calGrid.innerHTML = '';
        calHeader.textContent = `${monthNames[viewMonth]} ${viewYear}`;

        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
        const startOffset = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

        for (let i = 0; i < startOffset; i++) {
            const empty = document.createElement('div');
            calGrid.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dateEl = document.createElement('div');
            dateEl.classList.add('cal-date');
            dateEl.textContent = day;

            dateEl.addEventListener('click', (e) => {
                e.stopPropagation();
                document.querySelectorAll('.cal-date').forEach(el => el.classList.remove('selected'));
                dateEl.classList.add('selected');
                selectedDate = { day, month: viewMonth, year: viewYear };
                timeSelector.classList.add('active'); // Reveal time
            });

            calGrid.appendChild(dateEl);
        }
    }

    renderCalendar();

    // Navigation
    prevBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewMonth--;
        if (viewMonth < 0) {
            viewMonth = 11;
            viewYear--;
        }
        renderCalendar();
    });

    nextBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        viewMonth++;
        if (viewMonth > 11) {
            viewMonth = 0;
            viewYear++;
        }
        renderCalendar();
    });

    bookBtn.addEventListener('click', (e) => {
        if (!selectedDate) {
            alert('Please select a date first.');
            return;
        }
        if (!selectedTime) {
            alert('Please select a time.');
            return;
        }

        const email = "papamichailnickolas@gmail.com";
        const subject = "1-1 Session Inquiry";
        const body = `The client asked if you are available on ${monthNames[selectedDate.month]} ${selectedDate.day}, ${selectedDate.year} at ${selectedTime} for a 1-1 section.`;

        window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    });

    // --- CINEMATIC SCROLL ANIMATION ---
    // Total Scroll Track is 400vh.
    // viewport H = window.innerHeight.
    // usable scroll = 200vh (2 x viewportH).

    function updateAnimation() {
        const scrollTop = window.scrollY;
        const viewH = window.innerHeight;
        // Animation spans more height now (6.5 screens)
        const maxScroll = viewH * 6.5;
        const progress = Math.min(scrollTop / maxScroll, 1); // 0.0 to 1.0

        // Helper: Remap range
        // val: current value (0-1), start/end: range to map from
        function remap(val, start, end) {
            if (val < start) return 0;
            if (val > end) return 1;
            return (val - start) / (end - start);
        }

        // Helper: Ease
        function easeInOut(t) {
            return t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        }

        // --- PHASE 1: Hero Fade Out (0.0 to 0.3) ---
        // Hero stays pinned (it is fixed). Just Opacity and Scale/Parallax.
        const heroProgress = remap(progress, 0.0, 0.3);
        const heroOpacity = 1 - easeInOut(heroProgress);
        const heroScale = 1 + (0.1 * heroProgress); // Subtle zoom out

        heroSection.style.opacity = heroOpacity;
        heroSection.style.transform = `scale(${heroScale})`; // Parallax feel
        heroSection.style.pointerEvents = heroOpacity < 0.1 ? 'none' : 'auto';

        // --- PHASE 2: Pill Flight (0.1 to 0.4) ---
        // Pill needs to move from bottom (initial CSS) to Top-Left of Card.
        // Initial Bottom: wrapper is bottom: 2rem.
        // Target Top: Wrapper essentially needs to move UP by ~70vh?
        // Let's use translate Y.
        // Start: 0px. End: -70vh (approx).
        // Scale: 1.0 -> 1.35 (Mid flight) -> 1.15 (Landing).

        const flightProgress = remap(progress, 0.1, 0.4);
        const easedFlight = easeInOut(flightProgress);

        // Vertical Move: Lift pill up to the top area of the screen
        // "bottom: 2rem" -> "top: ~15%"
        // Total distance to travel ~ 75vh
        const moveY = -1 * (viewH * 0.75) * easedFlight;

        // Scale Interp: Bell curve? 
        // 0.0 -> 1.0; 0.5 -> 1.35; 1.0 -> 1.15
        let scale = 1;
        if (flightProgress < 0.5) {
            // Growing phase
            const growP = remap(flightProgress, 0, 0.5);
            scale = 1 + (0.35 * easeInOut(growP)); // 1 -> 1.35
        } else {
            // Shrinking/Landing phase
            const shrinkP = remap(flightProgress, 0.5, 1.0);
            scale = 1.35 - (0.2 * easeInOut(shrinkP)); // 1.35 -> 1.15
        }

        // Horizontal Move: Stay centered? Or move left?
        // "morphs into identity header... portrait on left".
        // The pill is centered. The card header image is on left.
        // Actually, the valid design is pill centered -> moves to match Card Header.
        // Card is centered. Card content padding-left: 5%.
        // So Pill should stay roughly centered but maybe expand width?
        // Let's keep it centered for symmetry as per "Pill takeover... mid center".
        // Then at end "settles... top-left/center". 
        // Let's settle it Center-Top of the card.
        // Width expansion?
        // Start: min-width 300px. End: Matches card width?
        // It's a "Pill takes over".
        // Let's allow width growth.
        const widthStart = 300; // px approx or min-content
        // Actually pill wrapper is width 100%. Pill itself is auto.
        // We can just let scale handle visual size.

        pillWrapper.style.transform = `translate(-50%, ${moveY}px)`; // Wrapper moves (translateY handled)
        // Note: Wrapper left is 50%, translateX(-50%) in CSS.
        // We overwrite transform here, so must include translateX.
        pill.style.transform = `scale(${scale})`;

        // Shadow depth increase
        const shadowBlur = 20 + (30 * easedFlight);
        pill.style.boxShadow = `0 ${5 + 10 * easedFlight}px ${shadowBlur}px rgba(0,0,0,0.3)`;

        // --- PHASE 3: Reveal Black Card (0.3 to 0.5) ---
        const cardProgress = remap(progress, 0.3, 0.5);
        const cardEase = easeInOut(cardProgress);

        const cardOpacity = cardEase;
        const cardRise = 40 * (1 - cardEase); // 40px down -> 0px

        aboutSection.style.opacity = cardOpacity;
        // Fix: Ensure card stays put? 
        // Scale card slightly: 0.95 -> 1.0
        const cardScale = 0.95 + (0.05 * cardEase);
        aboutSection.style.transform = `translate(-50%, calc(-50% + ${cardRise}px)) scale(${cardScale})`;

        aboutSection.style.pointerEvents = cardOpacity > 0.9 ? 'auto' : 'none';

        // --- PHASE 4: Content Stagger (0.5 to 0.7) ---
        const contentProgress = remap(progress, 0.5, 0.7);
        const contentEase = easeInOut(contentProgress);

        aboutContent.style.opacity = contentEase;
        aboutContent.style.transform = `translateY(${20 * (1 - contentEase)}px)`;

        // --- PHASE 5: Clean Up Flying Pill (0.6 to 0.75) ---
        // Once card is visible, flyer is redundant. Fade it out.
        const cleanupProgress = remap(progress, 0.6, 0.75);
        pillWrapper.style.opacity = 1 - cleanupProgress;

        // --- PHASE 6: Transition to Skills (0.75 to 0.85) ---
        // Fade out About Section & Projects Pill (if it was visible)
        // We want strict control.
        const fadeOutAboutProgress = remap(progress, 0.75, 0.85);
        const fadeOutEase = easeInOut(fadeOutAboutProgress);

        aboutSection.style.opacity = cardOpacity * (1 - fadeOutEase);
        // Note: cardOpacity was calculated earlier (0.3-0.5). calculate compound opacity.
        // Or simpler: override opacity logic based on scroll position.
        if (progress > 0.75) {
            aboutSection.style.opacity = 1 - fadeOutEase;
            aboutSection.style.pointerEvents = 'none';
        }

        // --- SKILLS SECTION LOGIC ---
        const skillsSection = document.getElementById('skills-section');
        const projectsLeftCol = document.querySelector('.projects-left-col');
        const projectsRightCol = document.querySelector('.projects-right-col');
        const skillsPillWrapper = document.getElementById('skills-pill-wrapper');
        const projectsPillWrapper = document.getElementById('projects-pill-wrapper');

        // Skills Reveal (0.8 to 0.9)
        const skillsRevealProgress = remap(progress, 0.8, 0.9);
        const skillsAlpha = easeInOut(skillsRevealProgress);

        skillsSection.style.opacity = skillsAlpha;
        skillsSection.style.pointerEvents = skillsAlpha > 0.1 ? 'auto' : 'none';

        // Add active class for internal CSS transitions if any
        if (skillsAlpha > 0.5) {
            skillsSection.classList.add('active');
        } else {
            skillsSection.classList.remove('active');
        }

        // Parallax Effects (Active during 0.75 to 0.9)
        if (progress > 0.75 && progress < 0.92) {
            const parallaxFactor = remap(progress, 0.75, 0.9);
            const unifiedMove = 40 * (1 - 1.5 * parallaxFactor);

            if (projectsLeftCol) projectsLeftCol.style.transform = `translateY(${unifiedMove}px)`;
            if (projectsRightCol) projectsRightCol.style.transform = `translateY(${unifiedMove}px)`;

            const pillRise = 50 * (1 - easeInOut(remap(progress, 0.85, 0.9)));
            skillsPillWrapper.style.opacity = easeInOut(remap(progress, 0.85, 0.9));
            
            // At 0.9 to 0.95, pill takes over the screen
            if (progress >= 0.9) {
                const takeoverProgress = remap(progress, 0.9, 0.95);
                const takeoverEase = easeInOut(takeoverProgress);
                const massiveScale = 1 + (150 * takeoverEase);
                skillsPillWrapper.style.transform = `translate(-50%, ${pillRise}px) scale(${massiveScale})`;
                skillsPillWrapper.style.zIndex = 40;
            } else {
                skillsPillWrapper.style.transform = `translate(-50%, ${pillRise}px) scale(1)`;
                skillsPillWrapper.style.zIndex = 10;
            }
            if (projectsPillWrapper) projectsPillWrapper.style.display = 'none';
        } else if (progress < 0.75) {
            if (projectsPillWrapper) projectsPillWrapper.style.display = 'none';
        } else if (progress >= 0.92) {
            // Keep pill massive so screen stays black
            skillsPillWrapper.style.transform = `translate(-50%, 0px) scale(150)`;
        }

        // --- PHASE 7: CONTACT SECTION (0.93 to 1.0) ---
        const contactSection = document.getElementById('contact-section');
        const contactContent = document.querySelector('.contact-content');
        
        if (contactSection && contactContent) {
            const contactReveal = remap(progress, 0.93, 0.97);
            const contactEase = easeInOut(contactReveal);
            
            contactSection.style.opacity = contactEase;
            contactSection.style.pointerEvents = contactEase > 0.5 ? 'auto' : 'none';

            // 3D Parallax entry
            if (contactEase > 0.1) {
                contactContent.classList.add('active');
            } else {
                contactContent.classList.remove('active');
            }
        }

        requestAnimationFrame(updateAnimation);
    }

    // Run animation loop (or just on scroll)
    // On scroll is more efficient than always running RAF if idle.
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateAnimation);
    });
    // Initial call
    updateAnimation();

    // --- FAKE BACKEND EMAIL VERIFICATION ---
    const contactEmail = document.getElementById('contact-email');
    const emailStatus = document.getElementById('email-status');
    let emailTimeout;

    if (contactEmail && emailStatus) {
        contactEmail.addEventListener('input', (e) => {
            const email = e.target.value;
            emailStatus.textContent = '';
            emailStatus.className = 'email-status';
            
            clearTimeout(emailTimeout);
            
            if (email.length > 5 && email.includes('@')) {
                emailStatus.textContent = 'Checking...';
                emailStatus.classList.add('checking');
                contactEmail.style.borderColor = '#60a5fa'; // Blue while checking
                
                // Fake backend delay (800ms)
                emailTimeout = setTimeout(() => {
                    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (regex.test(email)) {
                        emailStatus.textContent = 'Verified';
                        emailStatus.className = 'email-status valid';
                        contactEmail.style.borderColor = '#4ade80'; // Green
                    } else {
                        emailStatus.textContent = 'Invalid format';
                        emailStatus.className = 'email-status invalid';
                        contactEmail.style.borderColor = '#f87171'; // Red
                    }
                }, 800);
            } else {
                contactEmail.style.borderColor = '#e1405f'; // Default Red
            }
        });
    }

});
