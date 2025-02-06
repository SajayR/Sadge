const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('.'));

// Endpoint to get list of blog posts
app.get('/api/blogs', async (req, res) => {
    try {
        const files = await fs.readdir(path.join(__dirname, 'blogs'));
        const posts = [];

        for (const file of files) {
            if (file.endsWith('.md')) {
                const content = await fs.readFile(path.join(__dirname, 'blogs', file), 'utf-8');
                const post = {
                    date: extractTag(content, 'date'),
                    readingTime: extractTag(content, 'readingTime'),
                    tags: extractTag(content, 'tags').split(',').map(tag => tag.trim()),
                    title: extractTag(content, 'title'),
                    subtitle: extractTag(content, 'subtitle'),
                    preview: extractTag(content, 'preview'),
                    filename: file.replace('.md', '')
                };
                posts.push(post);
            }
        }

        // Sort posts by date, newest first
        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        res.json(posts);
    } catch (error) {
        console.error('Error reading blog posts:', error);
        res.status(500).json({ error: 'Failed to load blog posts' });
    }
});

// Endpoint to get a specific blog post
app.get('/api/blog/:id', async (req, res) => {
    try {
        const filename = `${req.params.id}.md`;
        const content = await fs.readFile(path.join(__dirname, 'blogs', filename), 'utf-8');
        
        const post = {
            date: extractTag(content, 'date'),
            readingTime: extractTag(content, 'readingTime'),
            tags: extractTag(content, 'tags').split(',').map(tag => tag.trim()),
            title: extractTag(content, 'title'),
            subtitle: extractTag(content, 'subtitle'),
            preview: extractTag(content, 'preview'),
            content: content
        };
        
        res.json(post);
    } catch (error) {
        console.error('Error reading blog post:', error);
        res.status(404).json({ error: 'Blog post not found' });
    }
});

function extractTag(content, tagName) {
    const regex = new RegExp(`<${tagName}>(.*?)</${tagName}>`, 's');
    const match = content.match(regex);
    return match ? match[1].trim() : '';
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 