// js/pages.js — Shared JS for all pages (navbar, contact form)

// ---- Mobile hamburger menu ----
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

if (hamburger && mobileMenu) {
  hamburger.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
}

// ---- Contact form validation & submit ----
function submitForm() {
  const name    = document.getElementById("contactName");
  const email   = document.getElementById("contactEmail");
  const subject = document.getElementById("contactSubject");
  const message = document.getElementById("contactMessage");

  if (!name) return; // not on contact page

  let valid = true;

  // Clear previous errors
  ["nameError","emailError","subjectError","messageError"].forEach(id => {
    document.getElementById(id).textContent = "";
  });

  // Validate name
  if (!name.value.trim()) {
    document.getElementById("nameError").textContent = "Name is required.";
    valid = false;
  }

  // Validate email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email.value.trim()) {
    document.getElementById("emailError").textContent = "Email is required.";
    valid = false;
  } else if (!emailRegex.test(email.value)) {
    document.getElementById("emailError").textContent = "Enter a valid email address.";
    valid = false;
  }

  // Validate subject
  if (!subject.value) {
    document.getElementById("subjectError").textContent = "Please select a topic.";
    valid = false;
  }

  // Validate message
  if (!message.value.trim() || message.value.trim().length < 10) {
    document.getElementById("messageError").textContent = "Message must be at least 10 characters.";
    valid = false;
  }

  if (!valid) return;

  // Simulate form submission (no backend endpoint needed)
  const btn = document.getElementById("submitBtn");
  btn.textContent = "Sending...";
  btn.disabled = true;

  setTimeout(() => {
    document.getElementById("formWrap").style.display = "none";
    document.getElementById("formSuccess").style.display = "block";
  }, 1200);
}

// Make submitForm globally accessible
window.submitForm = submitForm;