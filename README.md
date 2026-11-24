# art-gallery-project-2
A web-based art gallery to showcase and browse artwork" helps people (and future you) understand the project at a glance.
# Artisan Gallery

A multi-page art gallery website built with HTML, CSS, and vanilla JavaScript. No build step or backend needed.

## Features
- Artworks stored in one data file (`data.js`) and rendered with JavaScript
- Search, artist filter, and sorting on the Artists page
- Lightbox viewer with previous/next buttons, arrow-key navigation, and Esc to close
- Exhibition schedule table
- Visit booking form with validation (blocks past dates)
- Mobile-friendly menu and responsive layout
- About page with opening hours and links

## Pages
- `index.html`: Home and featured artworks
- `exhibitions.html`: Exhibition schedule
- `artists.html`: Browse, search, filter, and sort artworks
- `booking.html`: Booking form
- `about.html`: About the gallery

## Adding an artwork
Open `data.js` and add an object to `ARTWORKS`. If the artist is new, add them to `ARTISTS` first. Every page updates automatically.

## Run locally
Open `index.html` in your browser.