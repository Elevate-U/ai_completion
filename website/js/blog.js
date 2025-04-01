// website/js/blog.js

document.addEventListener('DOMContentLoaded', () => {
  const blogPostList = document.querySelector('.blog-post-list');

  if (!blogPostList) {
    console.error('Blog post list container not found!');
    return;
  }

  // Clear any static placeholder content (if any were left)
  // blogPostList.innerHTML = ''; // We will remove static content from HTML instead

  fetch('data/blog_posts.json') // Corrected path relative to blog.html
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((posts) => {
      if (!Array.isArray(posts)) {
        throw new Error('Fetched data is not an array');
      }

      if (posts.length === 0) {
        blogPostList.innerHTML = '<li>No blog posts found.</li>';
        return;
      }

      posts.forEach((post) => {
        const listItem = document.createElement('li');
        listItem.classList.add('blog-post-item');

        // Format the date (optional, but nice)
        let formattedDate = post.date;
        try {
          const dateObj = new Date(post.date + 'T00:00:00'); // Assume date is YYYY-MM-DD, add time to avoid timezone issues
          if (!isNaN(dateObj)) {
            formattedDate = dateObj.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          }
        } catch (e) {
          console.warn(`Could not format date ${post.date}: ${e}`);
        }

        listItem.innerHTML = `
          <h3>
            <a href="blog-post.html?slug=${encodeURIComponent(post.slug)}">${post.title}</a>
          </h3>
          <p class="post-meta">
            Published on ${formattedDate} by ${post.author}
          </p>
          <p class="post-excerpt">
            ${post.excerpt}
          </p>
          <a href="blog-post.html?slug=${encodeURIComponent(post.slug)}" class="read-more-link">Read More &rarr;</a>
        `;
        blogPostList.appendChild(listItem);
      });
    })
    .catch((error) => {
      console.error('Error fetching or processing blog posts:', error);
      blogPostList.innerHTML =
        '<li>Error loading blog posts. Please try again later.</li>';
    });
});
