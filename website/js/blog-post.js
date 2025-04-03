// website/js/blog-post.js

document.addEventListener('DOMContentLoaded', () => {
  const postTitleElement = document.getElementById('post-title');
  const postDateElement = document.getElementById('post-date');
  const postAuthorElement = document.getElementById('post-author');
  const postBodyElement = document.getElementById('post-body');
  const articleElement = document.getElementById('blog-post-content'); // Container for error messages

  if (
    !postTitleElement ||
    !postDateElement ||
    !postAuthorElement ||
    !postBodyElement ||
    !articleElement
  ) {
    if (articleElement) {
      articleElement.innerHTML =
        '<p>Error: Could not load post content due to a page structure issue.</p>';
    }
    return;
  }

  // Get the slug from the URL query parameter
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  if (!slug) {
    articleElement.innerHTML =
      '<h1>Post Not Found</h1><p>No specific post was requested. Please return to the <a href="blog.html">blog list</a>.</p>';
    document.title = 'Post Not Found - ThinkStack';
    return;
  }

  fetch('data/blog_posts.json') // Corrected path relative to blog-post.html
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

      const post = posts.find((p) => p.slug === slug);

      if (post) {
        // Format the date
        let formattedDate = post.date;
        try {
          const dateObj = new Date(post.date + 'T00:00:00');
          if (!isNaN(dateObj)) {
            formattedDate = dateObj.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            });
          }
        } catch (_e) {
          /* No action needed on date format error */
        }

        // Populate the template
        document.title = `${post.title} - ThinkStack`; // Set page title
        postTitleElement.textContent = post.title;
        postDateElement.textContent = formattedDate;
        postAuthorElement.textContent = post.author;
        postBodyElement.innerHTML = post.content; // Use innerHTML to render HTML tags in content
      } else {
        articleElement.innerHTML = `<h1>Post Not Found</h1><p>Sorry, the post you are looking for (slug: ${slug}) could not be found. Please return to the <a href="blog.html">blog list</a>.</p>`;
        document.title = 'Post Not Found - ThinkStack';
      }
    })
    .catch((_error) => {
      articleElement.innerHTML =
        '<h1>Error Loading Post</h1><p>There was an error loading the blog post content. Please try again later or return to the <a href="blog.html">blog list</a>.</p>';
      document.title = 'Error Loading Post - ThinkStack';
    });
});
