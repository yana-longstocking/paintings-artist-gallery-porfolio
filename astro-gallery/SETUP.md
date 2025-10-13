# Astro Gallery Setup

## ✅ Completed Migration

All content from the root project has been successfully migrated to the Astro project:

### 📁 What's Been Copied:

1. **Styles** - All SCSS files from `src/blocks/` have been copied to `src/styles/blocks/`
   - body.scss
   - variables.scss
   - mixin.scss
   - container.scss
   - header.scss
   - main.scss
   - photo-gallery.scss
   - photo-art.scss
   - art.scss
   - gallery-content.scss
   - artist-bio.scss
   - footer.scss

2. **Images** - All images copied to `public/`
   - `/photo/art/` - All artwork images
   - `/photo/artist/` - Artist bio image
   - `/photo/pic_s_/` - Freedom collection images
   - `/icons/` - All SVG icons

3. **HTML Content** - Fully adapted to Astro format in `src/pages/index.astro`
   - Header with navigation
   - Gallery sections
   - Artist bio
   - Contact form
   - Footer

## ⚠️ Important: Node.js Version Requirement

**Current Node.js version: v16.20.2**
**Required: Node.js >= 18.20.8**

### To Run This Project:

1. **Upgrade Node.js** to version 18 or higher:
   - Download from: https://nodejs.org/
   - Or use a version manager like [nvm](https://github.com/nvm-sh/nvm):
     ```bash
     # Install nvm if you don't have it
     curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
     
     # Install Node.js 18+
     nvm install 18
     nvm use 18
     ```

2. **Install dependencies** (if not already done):
   ```bash
   cd astro-gallery
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Build for production**:
   ```bash
   npm run build
   ```

## 🎨 Features

- Fully responsive design
- Gallery sections with hover effects
- Artist bio section
- Contact form
- Mobile-friendly navigation menu
- Beautiful SCSS styling with BEM methodology
- Modern gallery layout with grid system

## 📝 Next Steps

After upgrading Node.js, you can:
- Run `npm run dev` to start the development server
- View the site at `http://localhost:4321`
- Make further customizations as needed
- Deploy to your hosting platform of choice

## 🚀 Deployment

Once built, the `dist/` folder will contain your static site ready for deployment to:
- Netlify
- Vercel
- GitHub Pages
- Any static hosting service

Enjoy your new Astro gallery! 🎉

