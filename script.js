// ============================================
// BETALEADS - Main JavaScript
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    initParticles();
    initRangeSlider();
    initForm();
    initScrollAnimations();
});

// ============================================
// PARTICLE SYSTEM
// ============================================
function initParticles() {
    const container = document.getElementById('particles');
    if (!container) return;

    const particleCount = 50;
    const colors = ['#00f0ff', '#7b2fff', '#ff00e5'];

    for (let i = 0; i < particleCount; i++) {
        createParticle(container, colors);
    }
}

function createParticle(container, colors) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random properties
    const size = Math.random() * 4 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = Math.random() * 10 + 10;

    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${left}%;
        animation-delay: ${delay}s;
        animation-duration: ${duration}s;
        box-shadow: 0 0 ${size * 2}px ${color};
    `;

    container.appendChild(particle);
}

// ============================================
// RANGE SLIDER
// ============================================
function initRangeSlider() {
    const slider = document.getElementById('calls');
    const valueDisplay = document.getElementById('callsValue');

    if (!slider || !valueDisplay) return;

    // Update display on input
    slider.addEventListener('input', () => {
        valueDisplay.textContent = slider.value;

        // Add pulse animation
        valueDisplay.style.transform = 'scale(1.1)';
        setTimeout(() => {
            valueDisplay.style.transform = 'scale(1)';
        }, 150);
    });
}

// ============================================
// FORM HANDLING
// ============================================
function initForm() {
    const form = document.getElementById('leadForm');
    if (!form) return;

    form.addEventListener('submit', handleFormSubmit);
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('.submit-btn');

    // Get form data
    const formData = {
        website: form.website.value.trim(),
        industry: form.industry.value.trim(),
        country: form.country.value.trim(),
        region: form.region.value.trim() || 'Not specified',
        calls: form.calls.value,
        email: form.email.value.trim()
    };

    // Validate
    if (!validateForm(formData)) return;

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    try {
        // Send to email service (Web3Forms)
        await sendToEmail(formData);

        // Show success modal
        showModal();

        // Open WhatsApp with form data
        openWhatsApp(formData);

        // Reset form
        form.reset();
        document.getElementById('callsValue').textContent = '1000';

    } catch (error) {
        console.error('Form submission error:', error);
        alert('Something went wrong. Please try contacting us via WhatsApp directly.');

        // Still open WhatsApp as fallback
        openWhatsApp(formData);
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }
}

function validateForm(data) {
    // Basic URL validation
    if (!data.website.includes('.')) {
        alert('Please enter a valid website URL');
        return false;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        alert('Please enter a valid email address');
        return false;
    }

    return true;
}

// Send to Email via Web3Forms (free service)
async function sendToEmail(data) {
    // Web3Forms endpoint
    const WEB3FORMS_KEY = '8b92e00d-9f8e-4dac-a130-e4699d90338b';

    // If no key configured, skip email sending
    if (WEB3FORMS_KEY === 'YOUR_ACCESS_KEY_HERE') {
        console.log('Web3Forms not configured. Form data:', data);
        return Promise.resolve();
    }

    const payload = {
        access_key: WEB3FORMS_KEY,
        subject: `New Lead Request from ${data.website}`,
        from_name: 'Betaleads Website',
        to: 'obsofficer@gmail.com',
        website: data.website,
        industry: data.industry,
        country: data.country,
        region: data.region,
        calls_requested: data.calls,
        client_email: data.email,
        message: `
New lead campaign request:

Website: ${data.website}
Target Industry: ${data.industry}
Country: ${data.country}
Region: ${data.region}
Number of Calls: ${data.calls}
Client Email: ${data.email}
        `
    };

    const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error('Email sending failed');
    }

    return response.json();
}

// Open WhatsApp with pre-filled message
function openWhatsApp(data) {
    const phoneNumber = '971504065386'; // Without + sign

    const message = `Hello! I'm interested in Betaleads AI Lead Generation.

Here are my campaign details:

*Website:* ${data.website}
*Target Industry:* ${data.industry}
*Country:* ${data.country}
*Region:* ${data.region}
*Number of Calls:* ${data.calls}
*My Email:* ${data.email}

Please contact me to discuss further!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;

    // Open in new tab
    window.open(whatsappUrl, '_blank');
}

// ============================================
// MODAL
// ============================================
function showModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on background click
document.addEventListener('click', (e) => {
    const modal = document.getElementById('successModal');
    if (e.target === modal) {
        closeModal();
    }
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeModal();
    }
});

// Make closeModal globally available
window.closeModal = closeModal;

// ============================================
// SCROLL ANIMATIONS
// ============================================
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe elements
    const animateElements = document.querySelectorAll('.robot-card, .benefit-card, .form-container');
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
}

// Add CSS class for animation
const style = document.createElement('style');
style.textContent = `
    .animate-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ============================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ============================================
// TYPING EFFECT FOR HERO (Optional)
// ============================================
function typeWriter(element, text, speed = 50) {
    let i = 0;
    element.textContent = '';

    function type() {
        if (i < text.length) {
            element.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }

    type();
}

// ============================================
// CONSOLE EASTER EGG
// ============================================
console.log('%c BETALEADS ', 'background: linear-gradient(135deg, #00f0ff, #7b2fff); color: #0a0a0f; font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 5px;');
console.log('%c AI-Powered Lead Generation ', 'color: #00f0ff; font-size: 14px;');
console.log('%c Want to work with us? Visit https://wa.me/971504065386 ', 'color: #7b2fff; font-size: 12px;');
