class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<footer class="grid-row bleed" id="footer-element">
<div class="c_025">
<div class="grid-row">
<div class="col-12">
<ul class="footer-options">
<li>
<a href="/about-us.html" title="">About Us</a>
</li>
<li><a href="/contact-us.html" title="">Contact-us</a></li>
<li>
<a href="request-a-callback.html" title="">request-a-callback</a>
</li>
</ul>

<div class="footer-legal">
<ul>
<li><a href="/privacy.html" title="">Privacy Policy</a></li>
<li>
<a href="/copyright.html" title="">Copyright &amp; Disclaimer</a>
</li>
</ul>
<p class="footer-copyright">© Reliable-Nissan 2026</p>
</div>
</div>
</div>
</div>
</footer>`;
  }
}
customElements.define('app-footer', AppFooter);
