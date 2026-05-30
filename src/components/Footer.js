class AppFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `<footer class="grid-row bleed" id="footer-element">
<div class="c_025">
<div class="grid-row">
<div class="col-12">
<ul class="footer-options">
<li>
<a href="http://www.nissan-global.com/" title="">Global Site</a>
</li>
<li><a href="/sitemap.html" title="">Site Map</a></li>
<li>
<a href="https://ami.nissanmotornews.com/en/channels/channel-2b2d556d1494376ccef2a24479041486" title="">Newsroom</a>
</li>
</ul>

<div class="footer-legal">
<ul>
<li><a href="/privacy.html" title="">Privacy Policy</a></li>
<li>
<a href="/copyright.html" title="">Copyright &amp; Disclaimer</a>
</li>
</ul>
<p class="footer-copyright">© Nissan 2026</p>
</div>
</div>
</div>
</div>
</footer>`;
  }
}
customElements.define('app-footer', AppFooter);
