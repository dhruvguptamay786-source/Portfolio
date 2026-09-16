/**
 * ==========================================================================
 * MAIN PORTFOLIO JAVASCRIPT
 * --------------------------------------------------------------------------
 * VIVA DEFENSE GUIDE & ARCHITECTURE OVERVIEW:
 * 1. DOM Traversal: Using `document.getElementById` and `document.querySelector`
 * 2. Asynchronous Timing: `setTimeout` and recursion for the Typing Effect
 * 3. Event Handling: Click events, form submit prevention with `e.preventDefault()`
 * 4. Regular Expressions (RegEx): Pattern matching for strict email format validation
 * 5. ScrollSpy & UI Polish: Dynamic navbar states and Back-to-Top button
 * ==========================================================================
 */

// Global Toast helper accessible everywhere
window.showToast = function(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  
  container.appendChild(toast);

  // Automatically remove toast after 4 seconds with fade out
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

document.addEventListener('DOMContentLoaded', () => {
  initTypingEffect();
  initContactFormValidation();
  initNavbarScroll();
  initMobileNav();
  initBackToTop();
  initVivaNotesModal();
});

/**
 * ==========================================================================
 * VIVA DEFENSE NOTE #15: Hero Section Dynamic Typing Animation
 * WHY WE USE THIS:
 * - We cycle through an array of professional engineering titles.
 * - By manipulating `substring(0, charIndex)` at timed intervals using `setTimeout`,
 *   we simulate a real terminal typing and backspacing effect without heavy libraries!
 * ==========================================================================
 */
function initTypingEffect() {
  const typingElement = document.getElementById('typing-text');
  if (!typingElement) return;

  const words = [
    '1st Year B.Tech CSE Student',
    'C / C++ & DSA Enthusiast',
    'Vanilla Web Developer',
    'Aspiring Software Engineer'
  ];

  let wordIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  const typeSpeed = 90;
  const deleteSpeed = 45;
  const pauseEnd = 1600;

  function type() {
    const currentWord = words[wordIndex];

    if (isDeleting) {
      typingElement.textContent = currentWord.substring(0, charIndex - 1);
      charIndex--;
    } else {
      typingElement.textContent = currentWord.substring(0, charIndex + 1);
      charIndex++;
    }

    let delay = isDeleting ? deleteSpeed : typeSpeed;

    // Word finished typing
    if (!isDeleting && charIndex === currentWord.length) {
      delay = pauseEnd;
      isDeleting = true;
    } 
    // Word finished deleting
    else if (isDeleting && charIndex === 0) {
      isDeleting = false;
      wordIndex = (wordIndex + 1) % words.length; // Loop back to start
      delay = 400;
    }

    setTimeout(type, delay);
  }

  // Start the typing loop
  setTimeout(type, 800);
}

/**
 * ==========================================================================
 * VIVA DEFENSE NOTE #16: Contact Form Validation & Regex
 * WHY WE USE THIS:
 * - Prevents blank submissions and malformed data from reaching any backend.
 * - Regular Expression (Regex) ensures the email string follows standard format:
 *   [username] @ [domain] . [tld]
 * - Inline feedback improves accessibility and user experience (UX).
 * ==========================================================================
 */
function initContactFormValidation() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  const nameInput = document.getElementById('contact-name');
  const emailInput = document.getElementById('contact-email');
  const subjectInput = document.getElementById('contact-subject');
  const messageInput = document.getElementById('contact-message');

  const nameError = document.getElementById('name-error');
  const emailError = document.getElementById('email-error');
  const subjectError = document.getElementById('subject-error');
  const messageError = document.getElementById('message-error');

  // Standard RFC 5322 compatible simplified email regex pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Real-time input clearing of errors when user starts typing
  [nameInput, emailInput, subjectInput, messageInput].forEach(input => {
    if (!input) return;
    input.addEventListener('input', () => {
      input.classList.remove('input-error');
      const errSpan = document.getElementById(`${input.id.replace('contact-', '')}-error`);
      if (errSpan) errSpan.textContent = '';
    });
  });

  form.addEventListener('submit', (e) => {
    // 1. Prevent default form submission (browser page reload)
    e.preventDefault();

    let isValid = true;

    // Validate Name (Required, minimum 2 characters)
    const nameVal = nameInput.value.trim();
    if (!nameVal) {
      showFieldError(nameInput, nameError, 'Full name is required.');
      isValid = false;
    } else if (nameVal.length < 2) {
      showFieldError(nameInput, nameError, 'Name must be at least 2 characters.');
      isValid = false;
    }

    // Validate Email (Required, must match Regex)
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      showFieldError(emailInput, emailError, 'Email address is required.');
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      showFieldError(emailInput, emailError, 'Please enter a valid email (e.g. name@domain.com).');
      isValid = false;
    }

    // Validate Subject (Required, minimum 3 characters)
    const subjectVal = subjectInput.value.trim();
    if (!subjectVal) {
      showFieldError(subjectInput, subjectError, 'Please provide a subject line.');
      isValid = false;
    } else if (subjectVal.length < 3) {
      showFieldError(subjectInput, subjectError, 'Subject must be at least 3 characters.');
      isValid = false;
    }

    // Validate Message (Required, minimum 10 characters)
    const messageVal = messageInput.value.trim();
    if (!messageVal) {
      showFieldError(messageInput, messageError, 'Message body cannot be empty.');
      isValid = false;
    } else if (messageVal.length < 10) {
      showFieldError(messageInput, messageError, 'Message must be at least 10 characters long.');
      isValid = false;
    }

    // If any validation failed, abort submission
    if (!isValid) {
      showToast('Please fix the highlighted errors in the form.', 'error');
      return;
    }

    // Successful Form Submission Simulation
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending... ⏳';
    submitBtn.disabled = true;

    setTimeout(() => {
      // Show success toast
      showToast(`Thank you, ${nameVal}! Your message has been sent successfully.`, 'success');

      // Clear input fields
      form.reset();

      // Reset submit button
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
    }, 1000);
  });

  function showFieldError(inputEl, errorEl, message) {
    if (inputEl) inputEl.classList.add('input-error');
    if (errorEl) errorEl.textContent = message;
  }
}

/**
 * ==========================================================================
 * VIVA DEFENSE NOTE #17: ScrollSpy & Active Link Highlighting
 * WHY WE USE THIS:
 * - As the user scrolls down through different sections, we calculate the
 *   current vertical scroll position and update the active navbar link!
 * ==========================================================================
 */
function initNavbarScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      const sectionId = section.getAttribute('id');

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        current = sectionId;
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });
}

/**
 * Mobile Navigation Menu Toggle
 */
function initMobileNav() {
  const toggleBtn = document.getElementById('mobile-toggle');
  const navLinks = document.getElementById('nav-links');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('open');
  });

  // Close menu when link clicked on mobile
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
    });
  });
}

/**
 * Back-to-Top Button Behavior
 */
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.pageYOffset > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Viva Defense Modal / Quick Explainers
 */
function initVivaNotesModal() {
  const modal = document.getElementById('viva-modal');
  const closeBtn = document.getElementById('close-viva-modal');
  const triggerBtns = document.querySelectorAll('.viva-tip-btn');
  const modalTitle = document.getElementById('viva-modal-title');
  const modalBody = document.getElementById('viva-modal-body');

  if (!modal || !closeBtn) return;

  // Viva cheat sheet data map
  const vivaKnowledge = {
    'c': {
      title: 'C Language Viva Defense Points',
      body: '<strong>Key Concepts:</strong> Pointers, Dynamic Memory Allocation (<code>malloc</code>, <code>free</code>), Stack vs Heap, Structures (<code>struct</code>).<br><br><strong>Why C for 1st Year:</strong> Teaches foundational memory management and how hardware communicates with code before moving to higher-level web abstractions.'
    },
    'cpp': {
      title: 'C++ & OOP Viva Defense Points',
      body: '<strong>Key Concepts:</strong> 4 Pillars of OOP (Encapsulation, Inheritance, Polymorphism, Abstraction), Classes & Objects, Constructors/Destructors, Standard Template Library (<code>vector</code>, <code>map</code>).<br><br><strong>Application:</strong> Fast algorithmic problem solving and low-latency system development.'
    },
    'js': {
      title: 'JavaScript (ES6+) Viva Defense Points',
      body: '<strong>Key Concepts:</strong> Event-driven architecture, Asynchronous execution (Event Loop, Callbacks, Promises), DOM API manipulation, LocalStorage API, and closures.<br><br><strong>Defense Answer:</strong> JavaScript runs in the browser engine (e.g. V8 in Chrome) and dynamically updates HTML without full-page refreshes.'
    },
    'html': {
      title: 'Semantic HTML5 Viva Defense Points',
      body: '<strong>Key Concepts:</strong> Semantic tags (<code>&lt;header&gt;</code>, <code>&lt;nav&gt;</code>, <code>&lt;section&gt;</code>, <code>&lt;footer&gt;</code>) vs generic <code>&lt;div&gt;</code>.<br><br><strong>Importance:</strong> Enhances SEO, screen-reader accessibility, and clean code maintainability.'
    },
    'css': {
      title: 'CSS3 Architecture & Layout Viva Points',
      body: '<strong>Key Concepts:</strong> Flexbox (1-dimensional layout), CSS Grid (2-dimensional grid layout), Box-sizing: border-box, CSS Variables (<code>:root</code>), and Media Queries.<br><br><strong>Defense Answer:</strong> Vanilla CSS was chosen to master raw layout mechanics before relying on abstraction frameworks like Tailwind or Bootstrap.'
    },
    'git': {
      title: 'Git & Version Control Viva Points',
      body: '<strong>Key Concepts:</strong> Repositories, Working Directory vs Staging Area vs Local/Remote Commit Tree, Branching (<code>git checkout -b</code>), and merge conflict resolution.<br><br><strong>Defense Answer:</strong> Git tracks code revisions iteratively, allowing collaboration and rollbacks.'
    }
  };

  triggerBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const topicKey = btn.getAttribute('data-viva-topic');
      const data = vivaKnowledge[topicKey];

      if (data && modalTitle && modalBody) {
        modalTitle.textContent = data.title;
        modalBody.innerHTML = data.body;
        modal.style.display = 'flex';
      }
    });
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
    }
  });
}
