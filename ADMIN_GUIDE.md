# Admin Page - Create Post Guide

## Overview

The Admin page (`/admin`) allows you to create new blog posts that are automatically saved to the backend database via API.

## Accessing the Admin Page

1. Start both backend and frontend servers
2. Navigate to: `http://localhost:5173/admin`

## Creating a New Post

### Required Fields

All fields marked with a red asterisk (*) are required:

1. **Tiêu đề (Title)** *
   - The main title of your blog post
   - Example: "Khám phá kiến trúc Nhật Bản"

2. **URL Hình ảnh bìa (Cover Image URL)** *
   - Full URL to the cover image
   - Example: `https://images.unsplash.com/photo-...`
   - Image preview will show below the input
   - Recommended: Use Unsplash or similar image services

3. **Mô tả ngắn (Excerpt)** *
   - Short description shown on the blog card
   - Keep it concise (1-2 sentences)
   - Example: "Hành trình tìm hiểu về sự giao thoa giữa truyền thống và hiện đại..."

4. **Nội dung (Content)** *
   - Full blog post content
   - Supports HTML markup
   - Use the font-mono textarea for better HTML editing

5. **Tags** *
   - Comma-separated list of tags
   - Example: "Kiến trúc, Du lịch, Nhật Bản"
   - Tags help categorize your posts

### Optional Fields

6. **Thời gian đọc (Read Time)**
   - Estimated reading time
   - Default: "5 phút đọc"
   - Example: "10 phút đọc"

## HTML Content Guide

The content field supports HTML. Here are some common tags:

```html
<!-- Paragraphs -->
<p>Your paragraph text here...</p>

<!-- Headings -->
<h2>Main Section Title</h2>
<h3>Subsection Title</h3>

<!-- Bold and Italic -->
<strong>Bold text</strong>
<em>Italic text</em>

<!-- Lists -->
<ul>
  <li>List item 1</li>
  <li>List item 2</li>
</ul>

<!-- Blockquote -->
<blockquote>
  "An inspirational quote here"
</blockquote>

<!-- Links -->
<a href="https://example.com">Link text</a>
```

## Example Post

```
Title: Học React cho người mới bắt đầu

Cover Image: https://images.unsplash.com/photo-1633356122544-f134324a6cee

Excerpt: React là thư viện JavaScript phổ biến nhất hiện nay. Hãy cùng tìm hiểu cách bắt đầu với React từ con số 0.

Content:
<p>React đã trở thành một trong những công nghệ phổ biến nhất trong phát triển web hiện đại.</p>

<h2>Tại sao nên học React?</h2>
<p>React giúp bạn xây dựng giao diện người dùng tương tác một cách dễ dàng và hiệu quả.</p>

<h3>Lợi ích của React</h3>
<ul>
  <li>Component-based architecture</li>
  <li>Virtual DOM for better performance</li>
  <li>Huge ecosystem and community</li>
  <li>Easy to learn and use</li>
</ul>

<blockquote>
  "Learn once, write anywhere" - React Team
</blockquote>

<h2>Kết luận</h2>
<p>React là một lựa chọn tuyệt vời cho bất kỳ ai muốn phát triển ứng dụng web hiện đại.</p>

Tags: React, JavaScript, Web Development, Tutorial

Read Time: 8 phút đọc
```

## Workflow

1. **Fill in the form**
   - Enter all required information
   - Preview your cover image to ensure it loads correctly

2. **Submit**
   - Click "Đăng bài" button
   - Button changes to "Đang đăng..." while submitting
   - Wait for success notification

3. **Success**
   - Green notification appears: "Bài viết đã được tạo thành công!"
   - Form automatically resets
   - Post is immediately available on the blog page

4. **View your post**
   - Navigate to `/blog`
   - Your new post appears at the top of the list
   - Click to view the full post

## Backend Integration

When you create a post, the following happens:

1. **Frontend validation**
   - Checks all required fields
   - Shows error messages if validation fails

2. **API call**
   - Sends POST request to `/api/posts`
   - Includes: title, content, slug (auto-generated), userId (hardcoded to 1)

3. **Backend processing**
   - Validates data with Zod schemas
   - Checks if slug is unique
   - Verifies userId exists
   - Saves to PostgreSQL database

4. **Response**
   - Returns created post with ID and timestamps
   - Frontend adds post to state
   - Shows success notification

## Auto-generated Fields

These fields are automatically handled:

- **Slug** - Generated from title (lowercase, hyphens, no special chars)
- **User ID** - Currently hardcoded to 1 (TODO: implement auth)
- **Excerpt** - If not provided, extracted from content
- **Created At** - Set by database
- **Updated At** - Set by database
- **Author Info** - Retrieved from user record

## Troubleshooting

### Error: "Vui lòng điền đầy đủ các trường bắt buộc"
- One or more required fields are empty
- Check for red error messages below each field

### Error: "Không thể tạo bài viết"
- Backend server may not be running
- Check console for detailed error
- Verify DATABASE_URL is configured

### Error: "Slug already exists"
- A post with the same title already exists
- Change the title slightly to generate a unique slug

### Image not loading in preview
- Check if the URL is correct and publicly accessible
- Try using a different image URL
- Common sources: Unsplash, Pexels, Pixabay

### Post created but not showing on blog page
- Refresh the blog page
- Check browser console for errors
- Verify backend returned success response

## Tips

1. **Use markdown to HTML converters**
   - Write in Markdown, then convert to HTML
   - Tools: https://markdowntohtml.com/

2. **Test image URLs first**
   - Paste URL in browser to verify it loads
   - Use direct image links, not page links

3. **Keep excerpts short**
   - 1-2 sentences maximum
   - Focus on the main value proposition

4. **Use descriptive tags**
   - Help users find related content
   - 3-5 tags per post is ideal

5. **Preview before publishing**
   - The cover image preview shows how it will look
   - Check for any broken formatting

## Future Enhancements

- [ ] Rich text editor (WYSIWYG)
- [ ] Image upload (instead of URLs)
- [ ] Draft/Publish workflow
- [ ] Post editing
- [ ] Post deletion
- [ ] Authentication & authorization
- [ ] Author selection
- [ ] Category management
- [ ] SEO metadata fields
- [ ] Markdown support

## Related Documentation

- [INTEGRATION_GUIDE.md](../INTEGRATION_GUIDE.md) - Frontend-backend integration
- [POSTS_API_REFERENCE.md](../server/POSTS_API_REFERENCE.md) - API documentation
- [Blog Store](../client/src/stores/blog-store.tsx) - State management

---

**Last Updated:** 2025-12-08

The Admin page is fully functional and connected to the backend API!
