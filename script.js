// 1. LIGHTBOX IMAGE VIEWER
function openLightbox(imageSrc) {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  
  if (lightbox && lightboxImg) {
    lightboxImg.src = imageSrc;
    lightbox.style.display = 'flex'; // Show the modal
  }
}

function closeLightbox() {
  const lightbox = document.getElementById('lightbox');
  if (lightbox) {
    lightbox.style.display = 'none'; // Hide the modal
  }
}

// 2. FILTER ARTWORKS BY ARTIST
function filterArtworks() {
  const filterValue = document.getElementById('artistFilter').value;
  const artworks = document.querySelectorAll('#artworkContainer .art-card');

  artworks.forEach(card => {
    // Get the data-artist attribute from the HTML
    const artistName = card.getAttribute('data-artist');
    
    if (filterValue === 'all' || artistName === filterValue) {
      card.style.display = 'block'; // Show it
    } else {
      card.style.display = 'none'; // Hide it
    }
  });
}

// 3. FORM VALIDATION (On Submit)
function validateForm(event) {
  event.preventDefault(); // Stop the page from refreshing
  
  // Get values from the form
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  const date = document.getElementById('date').value;
  const visitors = document.getElementById('visitors').value;
  const errorMsg = document.getElementById('errorMsg');
  const successMsg = document.getElementById('successMsg');

  // Reset messages
  errorMsg.style.display = 'none';
  errorMsg.textContent = '';
  successMsg.style.display = 'none';
  successMsg.textContent = '';

  // Check for empty fields
  if (!name || !email || !date || !visitors) {
    errorMsg.textContent = "Please fill in all fields.";
    errorMsg.style.display = 'block';
    return;
  }

  // Validate Email Format using Regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    errorMsg.textContent = "Please enter a valid email address.";
    errorMsg.style.display = 'block';
    return;
  }

  // Validate Visitor count (Between 1 and 10)
  if (visitors < 1 || visitors > 10) {
    errorMsg.textContent = "You can only book between 1 and 10 visitors.";
    errorMsg.style.display = 'block';
    return;
  }

  // If everything is valid:
  successMsg.textContent = `Thank you ${name}! Your booking for ${visitors} person(s) on ${date} is confirmed.`;
  successMsg.style.display = 'block';
  
  // Clear the form
  document.getElementById('bookingForm').reset(); 
}