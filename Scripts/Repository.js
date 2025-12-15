const appList = document.getElementById('app-list');
const pagination = document.getElementById('pagination');
const searchInput = document.getElementById('search');

let apps = [];
let currentPage = 1;
let itemsPerPage = 20;
let displayMode = 'full';
let selectedCategory = '';
const maxVisiblePages = 5;

fetch('Repo.json')
    .then(response => response.json())
    .then(data => {
        apps = data;
        displayApps();
        updateStatsCounters(apps.length);
    })
    .catch(err => {
        console.error('Error loading apps:', err);
        appList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">Не удалось загрузить приложения</p>
                <p style="font-size: 0.875rem;">Проверьте подключение к интернету</p>
            </div>
        `;
    });

function animateCounter(element, target, duration = 2000, suffix = '') {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(start + (target - start) * easeOut);
        element.textContent = formatNumber(current) + suffix;
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    requestAnimationFrame(update);
}

function formatNumber(num) {
    if (num >= 1000) {
        return (num / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return num.toString();
}

function updateStatsCounters(appsCount) {
    const badgeCount = document.getElementById('badgeCount');
    if (badgeCount) {
        animateCounter(badgeCount, appsCount, 1500);
    }
    
    const statApps = document.getElementById('statApps');
    if (statApps) {
        statApps.dataset.target = appsCount;
        animateCounter(statApps, appsCount, 2000, '+');
    }
    
    const statUsers = document.getElementById('statUsers');
    if (statUsers) {
        const usersTarget = parseInt(statUsers.dataset.target) || 5000;
        animateCounter(statUsers, usersTarget, 2500, '+');
    }
}

const fullListBtn = document.getElementById('full-list-btn');
const timeListBtn = document.getElementById('time-list-btn');

if (fullListBtn && timeListBtn) {
    fullListBtn.addEventListener('click', () => {
        displayMode = 'full';
        currentPage = 1;
        fullListBtn.classList.add('active');
        timeListBtn.classList.remove('active');
        displayApps();
    });

    timeListBtn.addEventListener('click', () => {
        displayMode = 'time';
        currentPage = 1;
        timeListBtn.classList.add('active');
        fullListBtn.classList.remove('active');
        displayApps();
    });
}

document.querySelectorAll('input[name="itemsPerPage"]').forEach(radio => {
    radio.addEventListener('change', function() {
        itemsPerPage = parseInt(this.value, 10);
        currentPage = 1;
        displayApps();
    });
});

document.querySelectorAll('input[name="categoryApps"]').forEach(radio => {
    radio.addEventListener('change', function() {
        selectedCategory = this.value;
        currentPage = 1;
        displayApps();
    });
});

const resetFiltersBtn = document.getElementById('resetFilters');
if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
        selectedCategory = '';
        const allCategoryRadio = document.querySelector('input[name="categoryApps"][value=""]');
        if (allCategoryRadio) allCategoryRadio.checked = true;
        
        itemsPerPage = 20;
        const defaultItemsRadio = document.querySelector('input[name="itemsPerPage"][value="20"]');
        if (defaultItemsRadio) defaultItemsRadio.checked = true;
        
        displayMode = 'full';
        if (fullListBtn && timeListBtn) {
            fullListBtn.classList.add('active');
            timeListBtn.classList.remove('active');
        }
        
        if (searchInput) searchInput.value = '';
        
        currentPage = 1;
        displayApps();
        
        document.getElementById('settingsModal').classList.remove('active');
        document.body.style.overflow = '';
    });
}

let searchTimeout;
searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        currentPage = 1;
        displayApps();
    }, 300);
});

function displayApps() {
    appList.innerHTML = '';
    
    let filteredApps = apps.filter(app => 
        app.appName.toLowerCase().includes(searchInput.value.toLowerCase())
    );

    if (selectedCategory) {
        filteredApps = filteredApps.filter(app => 
            app.appName.toLowerCase().includes(`#${selectedCategory.toLowerCase()}`)
        );
    }

    if (displayMode === 'time') {
        filteredApps.sort((a, b) => new Date(b.appUpdateTime) - new Date(a.appUpdateTime));
    }

    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedApps = filteredApps.slice(start, end);

    if (paginatedApps.length === 0) {
        appList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 4rem 2rem; color: var(--text-muted);">
                <p style="font-size: 3rem; margin-bottom: 1rem;">🔍</p>
                <p style="font-size: 1.25rem; margin-bottom: 0.5rem;">Ничего не найдено</p>
                <p style="font-size: 0.875rem;">Попробуйте изменить параметры поиска</p>
            </div>
        `;
        pagination.innerHTML = '';
        return;
    }

    paginatedApps.forEach((app, index) => {
        const cleanedAppName = app.appName.split('\n')[0];
        const formattedDescription = app.appDescription.replace(/\n/g, '<br>');
        const delay = index * 0.05;

        const appItem = document.createElement('div');
        appItem.className = 'app-item';
        appItem.style.animationDelay = `${delay}s`;
        appItem.innerHTML = `
            <div class="app-header">
                <img src="${app.appImage}" alt="${cleanedAppName}" loading="lazy" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%236366f1%22 width=%22100%22 height=%22100%22 rx=%2220%22/><text x=%2250%22 y=%2255%22 font-size=%2240%22 text-anchor=%22middle%22 fill=%22white%22>📱</text></svg>'">
                <div class="app-header__info">
                    <h3>${cleanedAppName}</h3>
                    <p>${app.appVersion}</p>
                </div>
            </div>
            <hr>
            <p class="app-description">${formattedDescription}</p>
        `;
        appList.appendChild(appItem);
    });

    setupPagination(filteredApps);
}

function setupPagination(filteredApps) {
    pagination.innerHTML = '';
    const totalPages = Math.ceil(filteredApps.length / itemsPerPage);
    
    if (totalPages <= 1) return;

    const scrollToApps = () => {
        document.getElementById('apps').scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    if (currentPage > 2) {
        createPaginationBtn('«', () => { currentPage = 1; displayApps(); scrollToApps(); });
    }

    if (currentPage > 1) {
        createPaginationBtn('‹', () => { currentPage--; displayApps(); scrollToApps(); });
    }

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = createPaginationBtn(i, () => {
            currentPage = i;
            displayApps();
            scrollToApps();
        });
        if (currentPage === i) btn.disabled = true;
    }

    if (currentPage < totalPages) {
        createPaginationBtn('›', () => { currentPage++; displayApps(); scrollToApps(); });
    }

    if (currentPage < totalPages - 1) {
        createPaginationBtn('»', () => { currentPage = totalPages; displayApps(); scrollToApps(); });
    }
}

function createPaginationBtn(text, onClick) {
    const btn = document.createElement('button');
    btn.innerText = text;
    btn.addEventListener('click', onClick);
    pagination.appendChild(btn);
    return btn;
}