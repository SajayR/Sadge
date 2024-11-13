function toggle() {
    document.body.classList.add('animation-ready');
    document.body.classList.toggle('dark');
}

// Toggle on spacebar press
document.addEventListener('keydown', function(event) {
    if (event.keyCode === 32) {
        event.preventDefault(); // Prevent page scroll on spacebar
        toggle();
    }
});

// Toggle on click
document.addEventListener('click', function(event) {
    // Only toggle if clicking on the background, not on interactive elements
    if (event.target.closest('a, button, input, .sidebar, .project-card') === null) {
        toggle();
    }
});