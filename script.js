// Basic Portfolio Interactive Scripts
const projects = [
  { id: 1, title: "Task Tracker", category: "tool", desc: "Simple productivity tool to manage daily tasks.", tag: "JavaScript" },
  { id: 2, title: "Weather App", category: "tool", desc: "Fetches live weather details using public APIs.", tag: "REST API" },
  { id: 3, title: "Landing Page", category: "web", desc: "Responsive landing layout with modern styling.", tag: "HTML/CSS" },
  { id: 4, title: "Recipe Finder", category: "web", desc: "Browse recipes with fast search and category filter.", tag: "JavaScript" },
  { id: 5, title: "Tip Calculator", category: "tool", desc: "Clean bill splitting tool with custom tip inputs.", tag: "DOM Events" },
  { id: 6, title: "Book Blog", category: "web", desc: "Minimalist reading journal with responsive cards.", tag: "Responsive" }
];
const themeBtn = document.getElementById("theme-btn");
const menuBtn = document.getElementById("menu-btn");
const navMenu = document.getElementById("nav-menu");
const navLinks = document.querySelectorAll(".nav-link");
const projectsGrid = document.getElementById("projects-grid");
const filterBtns = document.querySelectorAll(".filter-btn");
const contactForm = document.getElementById("contact-form");
const formMsg = document.getElementById("form-msg");
// Theme Switcher
function initTheme() {
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme === "dark") {
    document.body.classList.add("dark-mode");
    themeBtn.textContent = "☀️";
  }
}
themeBtn.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const isDark = document.body.classList.contains("dark-mode");
  themeBtn.textContent = isDark ? "☀️" : "🌙";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});
// Mobile Navigation Toggle
menuBtn.addEventListener("click", () => navMenu.classList.toggle("open"));
navLinks.forEach((link) => {
  link.addEventListener("click", () => navMenu.classList.remove("open"));
});
// Render Projects List
function renderProjects(filter = "all") {
  projectsGrid.innerHTML = "";
  const filtered = filter === "all" ? projects : projects.filter(p => p.category === filter);
  filtered.forEach(project => {
    const card = document.createElement("div");
    card.className = "project-card fade-in";
    card.innerHTML = `
      <div class="project-info">
        <span class="project-tag">${project.tag}</span>
        <h3 class="project-title">${project.title}</h3>
        <p class="project-desc">${project.desc}</p>
        <button class="btn btn-outline" style="padding: 0.4rem 0.9rem; font-size: 0.85rem;" onclick="alert('Viewing: ${project.title}')">View Demo</button>
      </div>
    `;
    projectsGrid.appendChild(card);
  });
}
// Category Filter Handlers
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderProjects(btn.dataset.category);
  });
});
// Contact Form Submission Handler
contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  if (!name || !email || !message) {
    formMsg.textContent = "Please fill in all fields.";
    formMsg.className = "form-msg error";
    return;
  }
  formMsg.textContent = "Sending your message...";
  formMsg.className = "form-msg";
  setTimeout(() => {
    formMsg.textContent = "Thank you! Your message has been sent successfully.";
    formMsg.className = "form-msg success";
    contactForm.reset();
    setTimeout(() => { formMsg.textContent = ""; }, 4000);
  }, 1000);
});
// Highlight Active Nav Link on Scroll
window.addEventListener("scroll", () => {
  const sections = document.querySelectorAll("section");
  const scrollPos = window.scrollY + 100;
  sections.forEach(sec => {
    if (scrollPos >= sec.offsetTop && scrollPos < sec.offsetTop + sec.offsetHeight) {
      navLinks.forEach(link => {
        link.classList.remove("active");
        if (link.getAttribute("href") === `#${sec.id}`) {
          link.classList.add("active");
        }
      });
    }
  });
});
// Initialize Project on Load
initTheme(); renderProjects();
console.log("Portfolio project initialized successfully!");
