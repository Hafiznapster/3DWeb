// Smooth scroll functionality with improved offset calculation
function smoothScrollTo(target, duration = 800) {
    const targetElement = document.querySelector(target);
    if (!targetElement) return;
    
    const header = document.querySelector('header');
    const headerHeight = header.offsetHeight;
    const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - headerHeight;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        // Improved easing function for smoother animation
        const easeInOutQuart = progress => {
            return progress < 0.5
                ? 8 * progress * progress * progress * progress
                : 1 - Math.pow(-2 * progress + 2, 4) / 2;
        };
        
        window.scrollTo({
            top: startPosition + (distance * easeInOutQuart(progress)),
            behavior: 'auto' // Using our custom smooth scroll instead of 'smooth'
        });
        
        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }
    
    requestAnimationFrame(animation);
}

// Enhanced navigation link handling
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a[href^="#"]');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = this.getAttribute('href');
            
            // Close mobile menu if open
            if (nav.classList.contains('active')) {
                toggleMobileMenu();
            }
            
            // Remove active class from all links and add to clicked link
            navLinks.forEach(link => link.classList.remove('active'));
            this.classList.add('active');
            
            // Smooth scroll to target section
            smoothScrollTo(target);
        });
    });
    
    // Update active link based on scroll position
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.pageYOffset + (window.innerHeight / 4);
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop - document.querySelector('header').offsetHeight;
            const sectionBottom = sectionTop + section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    // Throttle scroll event for better performance
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }
        
        scrollTimeout = window.requestAnimationFrame(() => {
            updateActiveNavLink();
        });
    });
    
    // Handle arrow button scroll
    const arrowButton = document.querySelector('.arrow-button');
    if (arrowButton) {
        arrowButton.addEventListener('click', (e) => {
            e.preventDefault();
            smoothScrollTo('#services');
        });
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all service cards and other elements
document.querySelectorAll('.service-card, .contact-form, .footer-column, .section-title, .contact-title').forEach(element => {
    observer.observe(element);
});

// Add staggered animation to service cards
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
});

// Add styles for active navigation state
const navStyles = document.createElement('style');
navStyles.textContent = `
    nav ul li a {
        position: relative;
        transition: color 0.3s ease;
    }

    nav ul li a.active {
        color: var(--accent-color);
        font-weight: 600;
    }
    
    nav ul li a::after {
        content: '';
        position: absolute;
        bottom: -4px;
        left: 0;
        width: 100%;
        height: 2px;
        background: var(--accent-color);
        transform: scaleX(0);
        transition: transform 0.3s ease;
        transform-origin: right;
    }
    
    nav ul li a.active::after,
    nav ul li a:hover::after {
        transform: scaleX(1);
        transform-origin: left;
    }
`;
document.head.appendChild(navStyles);

// Mobile Menu Functionality
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const nav = document.querySelector('nav');
const menuOverlay = document.querySelector('.menu-overlay');
const body = document.body;

function toggleMobileMenu() {
    mobileMenuToggle.classList.toggle('active');
    nav.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
}

mobileMenuToggle.addEventListener('click', toggleMobileMenu);
menuOverlay.addEventListener('click', toggleMobileMenu);

// Close mobile menu when clicking on links
document.querySelectorAll('nav a').forEach(link => {
    link.addEventListener('click', () => {
        if (nav.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
});

// Handle window resize
let windowWidth = window.innerWidth;
window.addEventListener('resize', () => {
    if (window.innerWidth !== windowWidth) {
        windowWidth = window.innerWidth;
        if (windowWidth > 768) {
            mobileMenuToggle.classList.remove('active');
            nav.classList.remove('active');
            menuOverlay.classList.remove('active');
            body.style.overflow = '';
        }
    }
});

// Prevent content shift when scrollbar disappears
function setScrollbarWidth() {
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.setProperty('--scrollbar-width', `${scrollbarWidth}px`);
}

window.addEventListener('load', setScrollbarWidth);
window.addEventListener('resize', setScrollbarWidth);
