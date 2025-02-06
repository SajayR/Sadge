let isAnimating = false;

function toggle() {
    if (isAnimating) return;

    isAnimating = true;
    document.body.classList.add('animation-ready');
    
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
            lineColor: options.lineColor || 'currentColor',
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

// Initialize patterns for blog entries
document.addEventListener('DOMContentLoaded', () => {
    // Initialize featured post pattern
    const featuredPattern = document.querySelector('.blog-entry.featured .pattern-container');
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
});
