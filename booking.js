// ============================================================
// BOOKING FORM
// Needs script.js loaded first (for escapeHtml and todayString).
// ============================================================

// EDIT: opening hours as [open hour, close hour] in 24h time. null = closed.
// Keys are days of the week: 0 = Sunday ... 6 = Saturday.
const VISIT_HOURS = {
  0: [11, 17],
  1: null,
  2: [10, 18],
  3: [10, 18],
  4: [10, 18],
  5: [10, 18],
  6: [11, 17]
};

const BOOKINGS_KEY = 'artisanBookings';
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ---------- storage (wrapped so the page still works if storage is blocked) ----------
function loadBookings() {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveBookings(list) {
  try {
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  } catch (e) { /* storage unavailable: the booking is still confirmed on screen */ }
}

// ---------- date and time helpers ----------
function dayOfWeek(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).getDay(); // local date, no time zone shift
}

function formatDate(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });
}

function slotsFor(dateStr) {
  const hours = VISIT_HOURS[dayOfWeek(dateStr)];
  if (!hours) return [];

  const slots = [];
  const now = new Date();
  const isToday = dateStr === todayString();

  for (let h = hours[0]; h < hours[1]; h++) {
    if (isToday && h <= now.getHours()) continue; // skip times already passed today
    slots.push(String(h).padStart(2, '0') + ':00');
  }
  return slots;
}

function buildTimeOptions() {
  const dateStr = document.getElementById('bDate').value;
  const select = document.getElementById('bTime');
  select.innerHTML = '';

  if (!dateStr) {
    select.innerHTML = '<option value="">Choose a date first</option>';
    return;
  }

  const slots = slotsFor(dateStr);
  if (slots.length === 0) {
    select.innerHTML = '<option value="">No times available</option>';
    return;
  }

  select.innerHTML = '<option value="">Choose a time</option>' +
    slots.map(s => `<option value="${s}">${s}</option>`).join('');
}

// ---------- validation ----------
function validateBooking(data) {
  const errors = {};

  if (data.name.length < 2) errors.bName = 'Please enter your full name.';

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.bEmail = 'Enter an email like name@example.com.';
  }

  if (data.phone && !/^\+?[\d\s-]{7,16}$/.test(data.phone)) {
    errors.bPhone = 'Use digits only, for example +254 700 000 000.';
  }

  if (!data.date) {
    errors.bDate = 'Please choose a date.';
  } else if (data.date < todayString()) {
    errors.bDate = 'Please choose today or a later date.';
  } else if (!VISIT_HOURS[dayOfWeek(data.date)]) {
    errors.bDate = `We are closed on ${DAY_NAMES[dayOfWeek(data.date)]}s. Please pick another day.`;
  }

  if (!errors.bDate && !data.time) errors.bTime = 'Please choose a time.';

  if (!Number.isInteger(data.visitors) || data.visitors < 1 || data.visitors > 10) {
    errors.bVisitors = 'You can book for 1 to 10 visitors.';
  }

  return errors;
}

function showErrors(errors) {
  ['bName', 'bEmail', 'bPhone', 'bDate', 'bTime', 'bVisitors'].forEach(id => {
    const group = document.getElementById('g-' + id);
    const msg = document.getElementById(id + '-error');
    group.classList.toggle('invalid', Boolean(errors[id]));
    msg.textContent = errors[id] || '';
  });

  const first = Object.keys(errors)[0];
  if (first) document.getElementById(first).focus();
}

// ---------- confirmation and saved bookings ----------
function makeReference() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = 'ART-';
  for (let i = 0; i < 5; i++) ref += chars[Math.floor(Math.random() * chars.length)];
  return ref;
}

function showConfirmation(b) {
  const box = document.getElementById('confirmation');
  box.innerHTML = `
    <h2>You are booked, ${escapeHtml(b.name.split(' ')[0])}.</h2>
    <p>Your reference is <strong>${escapeHtml(b.ref)}</strong>. Show it at the front desk.</p>
    <dl class="summary">
      <dt>Date</dt><dd>${escapeHtml(formatDate(b.date))}</dd>
      <dt>Time</dt><dd>${escapeHtml(b.time)}</dd>
      <dt>Visitors</dt><dd>${b.visitors}</dd>
      <dt>Visit</dt><dd>${escapeHtml(b.type)}</dd>
      <dt>Email</dt><dd>${escapeHtml(b.email)}</dd>
      ${b.notes ? `<dt>Notes</dt><dd>${escapeHtml(b.notes)}</dd>` : ''}
    </dl>
    <button type="button" class="btn" id="newBooking">Make another booking</button>`;
  box.hidden = false;
  document.getElementById('bookingForm').hidden = true;
  box.scrollIntoView({ behavior: 'smooth', block: 'start' });

  document.getElementById('newBooking').addEventListener('click', () => {
    box.hidden = true;
    document.getElementById('bookingForm').hidden = false;
    buildTimeOptions();
    document.getElementById('bName').focus();
  });
}

function renderBookings() {
  const section = document.getElementById('myBookingsSection');
  const list = document.getElementById('bookingList');
  const bookings = loadBookings()
    .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));

  section.hidden = bookings.length === 0;
  list.innerHTML = bookings.map(b => `
    <li class="booking-item">
      <div>
        <strong>${escapeHtml(formatDate(b.date))} at ${escapeHtml(b.time)}</strong>
        <span>${b.visitors} visitor${b.visitors === 1 ? '' : 's'}, ${escapeHtml(b.type)}. Ref ${escapeHtml(b.ref)}</span>
      </div>
      <button type="button" class="link-btn" data-ref="${escapeHtml(b.ref)}">Cancel</button>
    </li>`).join('');
}

// ---------- setup ----------
function setupBooking() {
  const form = document.getElementById('bookingForm');
  if (!form) return;

  const dateInput = document.getElementById('bDate');
  const visitorsInput = document.getElementById('bVisitors');
  dateInput.min = todayString();

  dateInput.addEventListener('change', buildTimeOptions);

  document.getElementById('visitorsMinus').addEventListener('click', () => {
    visitorsInput.value = Math.max(1, (parseInt(visitorsInput.value, 10) || 1) - 1);
  });
  document.getElementById('visitorsPlus').addEventListener('click', () => {
    visitorsInput.value = Math.min(10, (parseInt(visitorsInput.value, 10) || 0) + 1);
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const data = {
      name: document.getElementById('bName').value.trim(),
      email: document.getElementById('bEmail').value.trim(),
      phone: document.getElementById('bPhone').value.trim(),
      date: dateInput.value,
      time: document.getElementById('bTime').value,
      visitors: parseInt(visitorsInput.value, 10),
      type: document.getElementById('bType').value,
      notes: document.getElementById('bNotes').value.trim()
    };

    const errors = validateBooking(data);
    showErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const booking = Object.assign({ ref: makeReference() }, data);
    const all = loadBookings();
    all.push(booking);
    saveBookings(all);

    form.reset();
    visitorsInput.value = 1;
    showConfirmation(booking);
    renderBookings();
  });

  document.getElementById('bookingList').addEventListener('click', e => {
    const btn = e.target.closest('button[data-ref]');
    if (!btn) return;
    saveBookings(loadBookings().filter(b => b.ref !== btn.dataset.ref));
    renderBookings();
  });

  renderBookings();
}

document.addEventListener('DOMContentLoaded', setupBooking);