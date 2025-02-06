let isAnimating = false;

function toggle() {
    if (isAnimating) return;
    
    isAnimating = true;
    document.body.classList.add('animation-ready');
    
    // Instead of a fixed timeout, listen for the actual animation end event.
    const animationEndHandler = (e) => {
        // Remove listener after handling the first animation end.
        document.body.removeEventListener('animationend', animationEndHandler);
        isAnimating = false;
    };
    document.body.addEventListener('animationend', animationEndHandler);
    
    document.body.classList.toggle('dark');
}

// Theme toggle button functionality
const themeToggleBtn = document.querySelector('.theme-toggle');
themeToggleBtn.addEventListener('click', toggle);

// Update button icon based on theme
function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark');
    themeToggleBtn.innerHTML = isDark ? 
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>` :
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`;
}

// Update icon when theme changes
themeToggleBtn.addEventListener('click', updateThemeIcon);

// Set initial icon state
updateThemeIcon();