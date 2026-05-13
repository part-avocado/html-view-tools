# HTML Vue

## Components

- [`<p-pdf>`](#p-pdf) - PDF viewer
- [`<p-img>`](#p-img) - Image with lightbox
- [`<p-video>`](#p-video) - Video player

---

## `<p-pdf>`

PDF Viewer Usage:
```html
<script type="module" src="https://cdn.jameslin.info/p-pdf.js"></script>

<p-pdf src="document.pdf"></p-pdf>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `src` | URL of the PDF file. Changing it loads the new document. Must be CORS-accessible. |

### Sizing

The component is `width: 100%; height: 600px` by default. Override with CSS:

```css
p-pdf { height: 800px; }
```

---

## `<p-img>`

Image Viewer Usage:
```html
<script type="module" src="https://cdn.jameslin.info/p-img.js"></script>

<p-img src="photo.jpg" alt="A description"></p-img>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `src` | Image URL |
| `alt` | Alt text. Also displayed as a caption in the lightbox. |

### Sizing

The component is `display: inline-block` and the image fills its width. Constrain it with CSS:

```css
p-img { width: 320px; }
```

---

## `<p-video>`

PDF Viewer Usage:
```html
<script type="module" src="https://cdn.jameslin.info/p-video.js"></script>

<p-video src="clip.mp4" poster="thumb.jpg"></p-video>
```

### Attributes

| Attribute | Description |
|-----------|-------------|
| `src` | Video URL |
| `poster` | Poster image shown before playback |

### Sizing

The video area uses `aspect-ratio: 16/9` by default. The component is `width: 100%`:

```css
p-video { max-width: 800px; }
```

---

## Using multiple components

Each file is independent therefore, you will need to import only what you need.

```html
<script type="module" src="https://cdn.jameslin.info/p-pdf.js"></script>
<script type="module" src="https://cdn.jameslin.info/p-img.js"></script>
<script type="module" src="https://cdn.jameslin.info/p-video.js"></script>

<p-pdf src="report.pdf"></p-pdf>
<p-img src="cover.jpg" alt="Report cover"></p-img>
<p-video src="walkthrough.mp4" poster="thumb.jpg"></p-video>
```
