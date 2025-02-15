// Theme persistence
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.remove('dark');
    } else {
        document.body.classList.add('dark');
    }
    updateThemeIcon();
}

let isAnimating = false;
let currentPage = window.location.pathname;

// Client-side routing
function handleNavigation(e) {
    const link = e.target.closest('a');
    if (!link || link.getAttribute('target') === '_blank') return;
    
    const href = link.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('//')) return;
    
    e.preventDefault();
    navigateTo(href);
}

async function navigateTo(url) {
    try {
        // Save current animation state
        const animationState = {
            leaves: document.querySelector('#leaves').style.transform,
            perspective: document.querySelector('.perspective').style.transform,
            shutters: document.querySelector('.shutters').style.gap,
            glow: document.querySelector('#glow').style.background,
            glowBounce: document.querySelector('#glow-bounce').style.background
        };
        localStorage.setItem('animationState', JSON.stringify(animationState));
        
        // Update URL first
        window.history.pushState({}, '', url);
        currentPage = url;

        // For blog posts, we need to handle the content loading differently
        if (url.includes('post.html')) {
            // Ensure required libraries are loaded
            if (!window.marked || !window.hljs) {
                // Load marked.js if not already loaded
                if (!window.marked) {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                }
                
                // Load highlight.js if not already loaded
                if (!window.hljs) {
                    await Promise.all([
                        new Promise((resolve, reject) => {
                            const script = document.createElement('script');
                            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js';
                            script.onload = resolve;
                            script.onerror = reject;
                            document.head.appendChild(script);
                        }),
                        new Promise((resolve, reject) => {
                            const link = document.createElement('link');
                            link.rel = 'stylesheet';
                            link.href = 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/github-dark.min.css';
                            link.onload = resolve;
                            link.onerror = reject;
                            document.head.appendChild(link);
                        })
                    ]);
                }

                // Configure marked for code highlighting
                marked.setOptions({
                    highlight: function(code, lang) {
                        if (lang && hljs.getLanguage(lang)) {
                            return hljs.highlight(code, { language: lang }).value;
                        }
                        return code;
                    }
                });
            }

            const urlParams = new URLSearchParams(new URL(url, window.location.origin).search);
            const postId = urlParams.get('id');
            
            if (!postId) {
                navigateTo('/blog.html');
                return;
            }

            try {
                // Fetch the blog post data first
                const response = await fetch(`/api/blog/${postId}`);
                if (!response.ok) throw new Error('Post not found');
                const post = await response.json();

                // Update the page structure with the post content
                document.querySelector('#scroll-container').innerHTML = `
                    <header class="header">
                        <div class="header-content">
                            <a href="/" class="logo">Sajay</a>
                            <nav class="nav">
                                <a href="/" class="nav-item">Home</a>
                                <a href="/blog.html" class="nav-item">Blogs</a>
                                <a href="/projects" class="nav-item">Cool stuff</a>
                                <button class="theme-toggle">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="5"/>
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2
                                                 M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </header>
                    <main class="blog-post">
                        <article class="post-content">
                            <header class="post-header">
                                <div class="metadata">
                                    <span class="date">${post.date}</span>
                                    <span class="reading-time">${post.readingTime}</span>
                                </div>
                                <div class="tags">
                                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                                </div>
                                <h1 class="post-title">${post.title}</h1>
                                <p class="post-subtitle">${post.subtitle}</p>
                            </header>
                            <div class="post-body">
                                ${marked.parse(post.content.split('\n').slice(8).join('\n'))}
                            </div>
                        </article>
                    </main>
                `;

                // Re-run syntax highlighting after content is loaded
                hljs.highlightAll();
            } catch (error) {
                console.error('Error loading blog post:', error);
                document.querySelector('#scroll-container').innerHTML = `
                    <header class="header">
                        <div class="header-content">
                            <a href="/" class="logo">Sajay</a>
                            <nav class="nav">
                                <a href="/" class="nav-item">Home</a>
                                <a href="/blog.html" class="nav-item">Blogs</a>
                                <a href="/projects" class="nav-item">Cool stuff</a>
                                <button class="theme-toggle">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                                         stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="5"/>
                                        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2
                                                 M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                                    </svg>
                                </button>
                            </nav>
                        </div>
                    </header>
                    <main class="blog-post">
                        <article class="post-content">
                            <div class="error">
                                <h2>Post not found</h2>
                                <p>The requested blog post could not be found.</p>
                                <a href="#" onclick="event.preventDefault(); navigateTo('/blog.html');">Return to blog list</a>
                            </div>
                        </article>
                    </main>
                `;
            }
        } else {
            // For other pages, fetch the full content
            const response = await fetch(url);
            const html = await response.text();
            
            // Extract main content
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const newContent = doc.querySelector('#scroll-container').innerHTML;
            
            // Update the content
            document.querySelector('#scroll-container').innerHTML = newContent;
        }
        
        // Restore animation state
        restoreAnimationState();
        
        // Reinitialize page-specific functionality
        await initializePage();
        
    } catch (error) {
        console.error('Navigation failed:', error);
    }
}

function restoreAnimationState() {
    const savedState = localStorage.getItem('animationState');
    if (!savedState) return;
    
    try {
        const state = JSON.parse(savedState);
        if (state.leaves) document.querySelector('#leaves').style.transform = state.leaves;
        if (state.perspective) document.querySelector('.perspective').style.transform = state.perspective;
        if (state.shutters) document.querySelector('.shutters').style.gap = state.shutters;
        if (state.glow) document.querySelector('#glow').style.background = state.glow;
        if (state.glowBounce) document.querySelector('#glow-bounce').style.background = state.glowBounce;
    } catch (error) {
        console.error('Failed to restore animation state:', error);
    }
}

async function initializeBlogPage() {
    const blogGrid = document.querySelector('.blog-grid');
    if (!blogGrid) return;

    const posts = await loadBlogPosts();
    
    if (!posts || posts.length === 0) {
        blogGrid.innerHTML = `
            <div class="no-posts">
                <h2 style="text-align: center">Soon™</h2>
                
            </div>
        `;
        return;
    }
    
    // Clear existing content
    blogGrid.innerHTML = '';
    
    // Add featured post (newest)
    const featuredPost = createBlogEntry(posts[0], true);
    blogGrid.appendChild(featuredPost);
    
    // Create container for regular posts
    const regularPosts = document.createElement('div');
    regularPosts.className = 'regular-posts';
    
    // Add remaining posts
    posts.slice(1).forEach(post => {
        regularPosts.appendChild(createBlogEntry(post));
    });
    
    blogGrid.appendChild(regularPosts);
    
    // Initialize patterns
    const featuredPattern = featuredPost.querySelector('.pattern-container');
    if (featuredPattern) {
        new GeometricPattern(featuredPattern, {
            width: 300,
            height: 300,
            gridSize: 8,
            lineColor: 'currentColor',
            lineWidth: 1.5,
            minPaths: 12,
            maxPaths: 20,
            opacity: 1
        });
    }

    // Initialize regular post patterns
    document.querySelectorAll('.regular-posts .pattern-container').forEach(container => {
        new GeometricPattern(container, {
            width: 160,
            height: 160,
            gridSize: 6,
            lineColor: 'currentColor',
            lineWidth: 1.5,
            minPaths: 8,
            maxPaths: 15,
            opacity: 1
        });
    });
}

async function loadBlogPost() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    
    if (!postId) {
        navigateTo('/blog.html');
        return;
    }

    try {
        // Use absolute path for API request
        const apiUrl = window.location.origin + `/api/blog/${postId}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Post not found');
        
        const post = await response.json();
        document.title = `${post.title} - Sajay`;
        
        const content = document.querySelector('.post-content');
        if (!content) {
            console.error('Post content container not found');
            return;
        }

        content.innerHTML = `
            <header class="post-header">
                <div class="metadata">
                    <span class="date">${post.date}</span>
                    <span class="reading-time">${post.readingTime}</span>
                </div>
                <div class="tags">
                    ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                <h1 class="post-title">${post.title}</h1>
                <p class="post-subtitle">${post.subtitle}</p>
            </header>
            <div class="post-body">
                ${marked.parse(post.content.split('\n').slice(8).join('\n'))}
            </div>
        `;

        // Re-run syntax highlighting after content is loaded
        hljs.highlightAll();
    } catch (error) {
        console.error('Error loading blog post:', error);
        const content = document.querySelector('.post-content');
        if (content) {
            content.innerHTML = `
                <div class="error">
                    <h2>Post not found</h2>
                    <p>The requested blog post could not be found.</p>
                    <a href="#" onclick="event.preventDefault(); navigateTo('/blog.html');">Return to blog list</a>
                </div>
            `;
        }
    }
}

async function initializePage() {
    // Re-attach event listeners and initialize page-specific features
    const themeToggleBtn = document.querySelector('.theme-toggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggle);
        themeToggleBtn.addEventListener('click', updateThemeIcon);
        updateThemeIcon();
    }
    
    // Initialize blog-specific features if on blog page
    if (currentPage.includes('blog.html') && !currentPage.includes('post.html')) {
        await initializeBlogPage();
    }
    
    // Initialize post-specific features if on post page
    if (currentPage.includes('post.html')) {
        await loadBlogPost();
    }
    
    // Highlight active nav item
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === currentPage) {
            item.classList.add('active');
        }
    });
}

function toggle() {
    if (isAnimating) return;

    isAnimating = true;
    document.body.classList.add('animation-ready');
    
    // Save theme preference to localStorage
    const isDark = document.body.classList.contains('dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    
    // Instead of a fixed timeout, listen for the actual animation end event.
    const animationEndHandler = (e) => {
        document.body.removeEventListener('animationend', animationEndHandler);
        isAnimating = false;
    };
    document.body.addEventListener('animationend', animationEndHandler);
    
    document.body.classList.toggle('dark');
}

// Theme toggle button functionality
const themeToggleBtn = document.querySelector('.theme-toggle');
themeToggleBtn.addEventListener('click', toggle);

// Load saved theme when page loads
document.addEventListener('DOMContentLoaded', loadTheme);

// Update button icon based on theme
function updateThemeIcon() {
    const isDark = document.body.classList.contains('dark');
    themeToggleBtn.innerHTML = isDark ?
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" 
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 
                     7 7 0 0 0 21 12.79z"/>
        </svg>` :
        `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42
                     M18.36 18.36l1.42 1.42M1 12h2M21 12h2
                     M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>`;
}

// Update icon when theme changes
themeToggleBtn.addEventListener('click', updateThemeIcon);

// Set initial icon state
updateThemeIcon();

// Geometric Pattern Generator for Blog Posts
class GeometricPattern {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            width: options.width || 100,
            height: options.height || 100,
            gridSize: options.gridSize || 10,
            lineColor: 'currentColor',
            lineWidth: options.lineWidth || 1,
            minPaths: options.minPaths || 8,
            maxPaths: options.maxPaths || 15,
            opacity: options.opacity || 1
        };
        
        this.points = [];
        this.paths = [];
        this.svg = null;
        
        this.init();
    }
    
    init() {
        this.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        this.svg.setAttribute('width', this.options.width);
        this.svg.setAttribute('height', this.options.height);
        this.svg.style.opacity = this.options.opacity;
        this.svg.classList.add('geometric-pattern');
        
        this.generatePoints();
        this.generatePaths();
        this.render();
        
        this.container.appendChild(this.svg);
    }
    
    generatePoints() {
        const cellWidth = this.options.width / this.options.gridSize;
        const cellHeight = this.options.height / this.options.gridSize;
        
        for (let i = 0; i <= this.options.gridSize; i++) {
            for (let j = 0; j <= this.options.gridSize; j++) {
                if (Math.random() < 0.4) {
                    this.points.push({
                        x: j * cellWidth + (Math.random() - 0.5) * cellWidth * 0.5,
                        y: i * cellHeight + (Math.random() - 0.5) * cellHeight * 0.5
                    });
                }
            }
        }
    }
    
    generatePaths() {
        const numPaths = Math.floor(
            Math.random() * 
            (this.options.maxPaths - this.options.minPaths) + 
            this.options.minPaths
        );
        
        for (let i = 0; i < numPaths; i++) {
            if (this.points.length < 2) break;
            
            const pathType = Math.random();
            if (pathType < 0.4) {
                this.generateBezierCurve();
            } else if (pathType < 0.7) {
                this.generateArc();
            } else {
                this.generateSmoothLine();
            }
        }
    }

    generateBezierCurve() {
        const start = this.points[Math.floor(Math.random() * this.points.length)];
        const end = this.points[Math.floor(Math.random() * this.points.length)];
        
        const ctrl1 = {
            x: start.x + (Math.random() - 0.5) * this.options.width * 0.8,
            y: start.y + (Math.random() - 0.5) * this.options.height * 0.8
        };
        const ctrl2 = {
            x: end.x + (Math.random() - 0.5) * this.options.width * 0.8,
            y: end.y + (Math.random() - 0.5) * this.options.height * 0.8
        };
        
        this.paths.push({
            type: 'bezier',
            start,
            end,
            ctrl1,
            ctrl2
        });
    }

    generateArc() {
        const center = this.points[Math.floor(Math.random() * this.points.length)];
        const radius = Math.random() * this.options.width * 0.3;
        const startAngle = Math.random() * Math.PI * 2;
        const endAngle = startAngle + Math.random() * Math.PI;
        
        this.paths.push({
            type: 'arc',
            center,
            radius,
            startAngle,
            endAngle
        });
    }

    generateSmoothLine() {
        const start = this.points[Math.floor(Math.random() * this.points.length)];
        const end = this.points[Math.floor(Math.random() * this.points.length)];
        
        this.paths.push({
            type: 'smooth',
            start,
            end
        });
    }
    
    render() {
        this.paths.forEach(path => {
            let element;
            
            switch (path.type) {
                case 'bezier':
                    element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    element.setAttribute('d', `M ${path.start.x} ${path.start.y} C ${path.ctrl1.x} ${path.ctrl1.y}, ${path.ctrl2.x} ${path.ctrl2.y}, ${path.end.x} ${path.end.y}`);
                    break;
                    
                case 'arc':
                    const startX = path.center.x + path.radius * Math.cos(path.startAngle);
                    const startY = path.center.y + path.radius * Math.sin(path.startAngle);
                    const endX = path.center.x + path.radius * Math.cos(path.endAngle);
                    const endY = path.center.y + path.radius * Math.sin(path.endAngle);
                    
                    element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    element.setAttribute('d', `M ${startX} ${startY} A ${path.radius} ${path.radius} 0 0 1 ${endX} ${endY}`);
                    break;
                    
                case 'smooth':
                    element = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                    const midX = (path.start.x + path.end.x) / 2;
                    const midY = (path.start.y + path.end.y) / 2 + (Math.random() - 0.5) * 20;
                    element.setAttribute('d', `M ${path.start.x} ${path.start.y} Q ${midX} ${midY} ${path.end.x} ${path.end.y}`);
                    break;
            }
            
            element.setAttribute('stroke', this.options.lineColor);
            element.setAttribute('stroke-width', this.options.lineWidth);
            element.setAttribute('fill', 'none');
            this.svg.appendChild(element);
        });
    }
}

// Blog Post Loading and Parsing
async function loadBlogPosts() {
    try {
        const apiUrl = window.location.origin + '/api/blogs';
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error('Failed to load blog posts');
        }
        
        const posts = await response.json();
        return posts;
        
    } catch (error) {
        console.error('Error loading blog posts:', error);
        return null;
    }
}

function extractTag(content, tagName) {
    const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 's');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
}

function createBlogEntry(post, isFeatured = false) {
    const article = document.createElement('article');
    article.className = `blog-entry${isFeatured ? ' featured' : ''}`;
    article.style.cursor = 'pointer';
    
    article.innerHTML = `
        <div class="pattern-container"></div>
        <div class="content">
            <div class="metadata">
                <span class="date">${post.date}</span>
                <span class="reading-time">${post.readingTime}</span>
            </div>
            <div class="tags">
                ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <h2 class="blog-title">${post.title}</h2>
            <p class="blog-subtitle">${post.subtitle}</p>
            <p class="preview-text">${post.preview}</p>
        </div>
    `;
    
    // Add click handler to open the blog post using client-side navigation
    article.addEventListener('click', (e) => {
        e.preventDefault();
        navigateTo(`/post.html?id=${post.filename}`);
    });
    
    return article;
}

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    loadTheme();
    restoreAnimationState();
    await initializePage();
    
    // Add navigation event listeners
    document.addEventListener('click', handleNavigation);
    window.addEventListener('popstate', () => {
        navigateTo(window.location.pathname);
    });
});
