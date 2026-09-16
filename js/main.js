/* ==========================================================================
   PORTFOLIO MAIN JAVASCRIPT LOGIC
   Student: Dhruv Gupta (1st Year B.Tech CSE)
   Viva Explanation:
   This file implements core client-side interactivity using Vanilla JavaScript:
   1. Dynamic Typing Effect: Custom typewriter animation cycling through career titles.
   2. IntersectionObserver API: Automatically highlights active navbar links on scroll.
   3. Strict Form Validation: Validates all contact inputs, prevents empty submissions,
      and gives instant visual feedback.
   4. Global Toast System: Clean terminal-styled feedback toasts for UI events.
   5. Mobile Navigation: Responsive drawer menu toggle.
   ========================================================================== */

/* --------------------------------------------------------------------------
   1. GLOBAL TOAST NOTIFICATION SYSTEM
   Viva Note: Attached to 'window' so both main.js and tracker.js can call it.
   Creates or reuses a floating terminal toast element at the bottom-right.
   -------------------------------------------------------------------------- */
window.showToast = function (message, type = "info") {
  let toast = document.getElementById("terminal-toast");

  // Create toast element if it doesn't already exist in the DOM
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "terminal-toast";
    toast.className = "terminal-toast";
    document.body.appendChild(toast);
  }

  // Set message text and styling based on notification type
  const prefix = type === "error" ? "[ERROR]" : type === "success" ? "[SUCCESS]" : "[INFO]";
  toast.innerHTML = `<span style="font-weight:bold; color: ${type === 'error' ? 'var(--accent-red)' : type === 'success' ? 'var(--accent-green)' : 'var(--accent-cyan)'};">${prefix}</span> <span>${message}</span>`;

  // Toggle modifier classes
  toast.classList.remove("error-toast", "show");
  if (type === "error") {
    toast.classList.add("error-toast");
  }

  // Force DOM reflow to retrigger animation
  void toast.offsetWidth;
  toast.classList.add("show");

  // Automatically dismiss toast after 3.5 seconds
  if (window.toastTimeout) {
    clearTimeout(window.toastTimeout);
  }
  window.toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3500);
};

// Execute interactive logic once the DOM is fully loaded
document.addEventListener("DOMContentLoaded", function () {

  /* ------------------------------------------------------------------------
     2. DYNAMIC TYPING EFFECT (HERO SECTION)
     Viva Note:
     - Simulates human typing in a terminal using recursive setTimeout calls.
     - Words array contains student roles.
     - Handles state machine: TYPING -> PAUSING -> DELETING -> NEXT WORD.
     ------------------------------------------------------------------------ */
  const typedTextElement = document.getElementById("typed-text");
  
  if (typedTextElement) {
    const roles = [
      "1st-Year B.Tech CSE Student",
      "C & C++ Programming Explorer",
      "Vanilla Web Developer",
      "Algorithmic Problem Solver"
    ];

    let roleIndex = 0;       // Current phrase in the roles array
    let charIndex = 0;       // Current character position within the phrase
    let isDeleting = false;  // Whether currently deleting characters
    let typingSpeed = 90;    // Milliseconds between character insertions

    function typeEffect() {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        // Deleting characters: slice string up to charIndex
        typedTextElement.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 45; // Deleting is faster than typing
      } else {
        // Typing characters: slice string up to charIndex
        typedTextElement.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 85;
      }

      // If word is completely typed
      if (!isDeleting && charIndex === currentRole.length) {
        // Pause at full text before starting deletion
        typingSpeed = 1600;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        // Word is completely deleted: move to the next phrase
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length; // Modulo wraps around cleanly
        typingSpeed = 400; // Short pause before typing next word
      }

      // Schedule next character update
      setTimeout(typeEffect, typingSpeed);
    }

    // Start typing loop
    setTimeout(typeEffect, 500);
  }

  /* ------------------------------------------------------------------------
     3. MOBILE NAVIGATION DRAWER
     Viva Note: Toggles '.open' class on the navigation links container when
     the mobile hamburger button is clicked.
     ------------------------------------------------------------------------ */
  const navToggle = document.getElementById("nav-toggle");
  const navLinks = document.getElementById("nav-links");
  const allNavLinks = document.querySelectorAll(".nav-link");

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
      const isOpen = navLinks.classList.contains("open");
      navToggle.textContent = isOpen ? "[X] Close" : "[=] Menu";
    });

    // Auto-close menu when a link is clicked on mobile
    allNavLinks.forEach(link => {
      link.addEventListener("click", () => {
        if (navLinks.classList.contains("open")) {
          navLinks.classList.remove("open");
          navToggle.textContent = "[=] Menu";
        }
      });
    });
  }

  /* ------------------------------------------------------------------------
     4. ACTIVE NAVIGATION LINK ON SCROLL (INTERSECTION OBSERVER)
     Viva Note:
     - IntersectionObserver is modern browser API that detects when an element
       is visible inside the viewport without expensive 'window.onscroll' handlers.
     - Improves rendering performance by eliminating scroll event throttling.
     ------------------------------------------------------------------------ */
  const sections = document.querySelectorAll("section[id]");

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px", // Trigger when section is in upper-mid viewport
    threshold: 0
  };

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const activeId = entry.target.getAttribute("id");
        allNavLinks.forEach(link => {
          link.classList.remove("active");
          if (link.getAttribute("href") === `#${activeId}`) {
            link.classList.add("active");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(section => sectionObserver.observe(section));

  /* ------------------------------------------------------------------------
     5. CONTACT FORM STRICT CLIENT-SIDE VALIDATION
     Viva Note:
     - Form submission is intercepted via 'e.preventDefault()' to stop page reload.
     - Validates:
       1. Name: Must not be empty and must have at least 2 characters.
       2. Email: Validated against standard Regular Expression (regex).
       3. Subject: Must not be empty and must have at least 3 characters.
       4. Message: Must not be empty and must have at least 10 characters.
     - Prevents empty or malformed submissions with clear feedback banner and
       inline field warnings.
     ------------------------------------------------------------------------ */
  const contactForm = document.getElementById("contact-form");
  const bannerAlert = document.getElementById("contact-banner");

  if (contactForm) {
    const nameInput = document.getElementById("contact-name");
    const emailInput = document.getElementById("contact-email");
    const subjectInput = document.getElementById("contact-subject");
    const messageInput = document.getElementById("contact-message");

    // Regular Expression for standard email format
    // Checks for characters before '@', domain characters, and valid TLD extension (.com, .in, etc.)
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Helper to display error state on an individual input element
    function setFieldError(inputElement, errorMessage) {
      inputElement.classList.add("is-invalid");
      const errorMsgElement = document.getElementById(`${inputElement.id}-error`);
      if (errorMsgElement) {
        errorMsgElement.textContent = `> ${errorMessage}`;
        errorMsgElement.classList.add("visible");
      }
    }

    // Helper to clear error state on an individual input element
    function clearFieldError(inputElement) {
      inputElement.classList.remove("is-invalid");
      const errorMsgElement = document.getElementById(`${inputElement.id}-error`);
      if (errorMsgElement) {
        errorMsgElement.textContent = "";
        errorMsgElement.classList.remove("visible");
      }
    }

    // Clear individual errors dynamically as user types
    [nameInput, emailInput, subjectInput, messageInput].forEach(field => {
      if (field) {
        field.addEventListener("input", function () {
          if (field.classList.contains("is-invalid")) {
            clearFieldError(field);
          }
        });
      }
    });

    // Form Submit Event Handler
    contactForm.addEventListener("submit", function (e) {
      // 1. CRITICAL: Stop standard HTML browser form submission
      e.preventDefault();

      // Reset previous error messages
      [nameInput, emailInput, subjectInput, messageInput].forEach(clearFieldError);
      bannerAlert.className = "validation-banner";
      bannerAlert.innerHTML = "";

      let isValid = true;
      const errorList = [];

      // Extract and trim user input values
      const nameVal = nameInput.value.trim();
      const emailVal = emailInput.value.trim();
      const subjectVal = subjectInput.value.trim();
      const messageVal = messageInput.value.trim();

      // 2. Validate Name
      if (nameVal === "") {
        setFieldError(nameInput, "Name field cannot be left blank.");
        errorList.push("Name is required");
        isValid = false;
      } else if (nameVal.length < 2) {
        setFieldError(nameInput, "Name must contain at least 2 characters.");
        errorList.push("Name is too short");
        isValid = false;
      }

      // 3. Validate Email
      if (emailVal === "") {
        setFieldError(emailInput, "Email address cannot be empty.");
        errorList.push("Email is required");
        isValid = false;
      } else if (!emailRegex.test(emailVal)) {
        setFieldError(emailInput, "Please enter a valid email address (e.g. name@domain.com).");
        errorList.push("Invalid email format");
        isValid = false;
      }

      // 4. Validate Subject
      if (subjectVal === "") {
        setFieldError(subjectInput, "Subject field cannot be empty.");
        errorList.push("Subject is required");
        isValid = false;
      } else if (subjectVal.length < 3) {
        setFieldError(subjectInput, "Subject must contain at least 3 characters.");
        errorList.push("Subject is too short");
        isValid = false;
      }

      // 5. Validate Message Body
      if (messageVal === "") {
        setFieldError(messageInput, "Message body cannot be empty.");
        errorList.push("Message cannot be empty");
        isValid = false;
      } else if (messageVal.length < 10) {
        setFieldError(messageInput, "Please provide a message with at least 10 characters.");
        errorList.push("Message too brief (<10 chars)");
        isValid = false;
      }

      // 6. Handle Form State based on validation result
      if (!isValid) {
        // Show validation error banner
        bannerAlert.className = "validation-banner error";
        bannerAlert.innerHTML = `
          <strong>[SUBMISSION REJECTED]:</strong> Please correct the ${errorList.length} highlighted error(s) before sending.
        `;

        // Focus first field with error
        const firstErrorField = contactForm.querySelector(".is-invalid");
        if (firstErrorField) {
          firstErrorField.focus();
        }

        // Show floating error toast
        window.showToast("Form validation failed. Please check required fields.", "error");
        return;
      }

      // 7. Success State: Simulated dispatch
      bannerAlert.className = "validation-banner success";
      bannerAlert.innerHTML = `
        <strong>[EXIT CODE 0]:</strong> Message dispatched successfully! Thank you, Dhruv will get back to you shortly.
      `;

      // Clear input fields
      contactForm.reset();

      // Show floating confirmation toast
      window.showToast("Message sent successfully! (Exit Code: 0)", "success");
    });
  }

  /* ------------------------------------------------------------------------
     6. CONSOLE WELCOME GREETING
     Viva Note: Demonstrates attention to detail for examiners opening
     the browser developer tools console (F12).
     ------------------------------------------------------------------------ */
  console.log(
    "%c[SYSTEM INITIALIZED]%c Dhruv Gupta's 1st-Year B.Tech CSE Portfolio is online.",
    "color: #00ff66; font-weight: bold; background: #0a0e14; padding: 4px 8px; border-radius: 4px;",
    "color: #00f0ff;"
  );
});
