import './Navbar.js';
import './Footer.js';

// Global styles to prevent FOUC (Flash of Unstyled Content)
const style = document.createElement('style');
style.innerHTML = `
  app-navbar:not(:defined), app-footer:not(:defined) {
    display: block;
    visibility: hidden;
  }
`;
document.head.appendChild(style);
