const html = document.documentElement;
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');

const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon();

function toggleTheme() {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon();
}

function updateThemeIcon() {
    const theme = html.getAttribute('data-theme');
    const mobileIcon = document.querySelector('.mobile-menu__theme-icon');
    if (mobileIcon) {
        mobileIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

themeToggle.addEventListener('click', toggleTheme);
mobileThemeToggle.addEventListener('click', () => {
    toggleTheme();
    closeMobileMenu();
});

const avatarBtn = document.getElementById('avatarBtn');
const closeMenuBtn = document.getElementById('closeMenu');
const mobileMenu = document.getElementById('mobileMenu');
const overlay = document.getElementById('overlay');

let menuScrollPosition = 0;

function openMobileMenu() {
    mobileMenu.classList.add('active');
    overlay.classList.add('active');
    menuScrollPosition = window.pageYOffset;
    document.body.classList.add('modal-open');
    document.body.style.top = `-${menuScrollPosition}px`;
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.body.style.top = '';
    window.scrollTo(0, menuScrollPosition);
}

avatarBtn.addEventListener('click', openMobileMenu);
closeMenuBtn.addEventListener('click', closeMobileMenu);
overlay.addEventListener('click', () => {
    closeMobileMenu();
    closeSettingsModal();
});

document.querySelectorAll('.mobile-menu__link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
});

const settingsBtn = document.getElementById('settingsBtn');
const settingsModal = document.getElementById('settingsModal');
const closeSettingsBtn = document.getElementById('closeSettings');
const modalBackdrop = document.getElementById('modalBackdrop');

let settingsScrollPosition = 0;

function openSettingsModal() {
    if (!document.body.classList.contains('modal-open')) {
        settingsScrollPosition = window.pageYOffset;
        document.body.classList.add('modal-open');
        document.body.style.top = `-${settingsScrollPosition}px`;
    }
    settingsModal.classList.add('active');
}

function closeSettingsModal() {
    settingsModal.classList.remove('active');
    if (!document.querySelector('.modal.active')) {
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window.scrollTo(0, settingsScrollPosition);
    }
}

settingsBtn.addEventListener('click', openSettingsModal);
closeSettingsBtn.addEventListener('click', closeSettingsModal);
modalBackdrop.addEventListener('click', closeSettingsModal);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeMobileMenu();
        closeSettingsModal();
    }
});

const animatedElements = document.querySelectorAll('.animate-on-scroll');

const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, index * 100);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

animatedElements.forEach(el => observer.observe(el));

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

const header = document.querySelector('.header');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 100) {
        header.style.background = 'var(--bg-secondary)';
        header.style.boxShadow = 'var(--shadow-md)';
    } else {
        header.style.background = 'var(--bg-glass)';
        header.style.boxShadow = 'none';
    }
});

const searchClear = document.getElementById('searchClear');
const searchField = document.getElementById('search');

if (searchClear && searchField) {
    searchClear.addEventListener('click', () => {
        searchField.value = '';
        searchField.dispatchEvent(new Event('input'));
        searchField.focus();
    });
}

const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

if (isSafari || isIOS) {
    document.querySelectorAll('input, textarea, select').forEach(input => {
        input.addEventListener('focus', (e) => {
            e.target.style.fontSize = '16px';
            setTimeout(() => {
                window.scrollTo(0, window.pageYOffset);
            }, 50);
        });
        
        input.addEventListener('touchstart', (e) => {
            e.target.style.fontSize = '16px';
        });
    });
    
    let touchStartY = 0;
    
    document.addEventListener('touchstart', (e) => {
        touchStartY = e.touches[0].clientY;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        if (settingsModal.classList.contains('active') || mobileMenu.classList.contains('active')) {
            const modalContent = document.querySelector('.modal__content');
            const mobileMenuEl = document.querySelector('.mobile-menu');
            const target = e.target;
            
            const isInsideModal = modalContent && modalContent.contains(target);
            const isInsideMobileMenu = mobileMenuEl && mobileMenuEl.contains(target);
            
            if (!isInsideModal && !isInsideMobileMenu) {
                e.preventDefault();
            } else {
                const scrollableEl = isInsideModal ? modalContent : mobileMenuEl;
                const touchY = e.touches[0].clientY;
                const scrollTop = scrollableEl.scrollTop;
                const scrollHeight = scrollableEl.scrollHeight;
                const clientHeight = scrollableEl.clientHeight;
                
                const isAtTop = scrollTop <= 0 && touchY > touchStartY;
                const isAtBottom = scrollTop + clientHeight >= scrollHeight && touchY < touchStartY;
                
                if (isAtTop || isAtBottom) {
                    e.preventDefault();
                }
            }
        }
    }, { passive: false });
}
