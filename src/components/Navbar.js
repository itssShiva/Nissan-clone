class AppNavbar extends HTMLElement {
  connectedCallback() {
    const shadow = this.attachShadow({ mode: 'open' });
    this.style.cssText = 'display:block;position:sticky;top:0;z-index:10000;width:100%;';

    shadow.innerHTML = `
<style>
  *, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  :host {
    display: block;
    width: 100%;
  }

  /* ===== MAIN NAVBAR ROW ===== */
  .rn-bar {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    height: 64px;
    background: #111111;
    box-shadow: 0 2px 14px rgba(0,0,0,0.55);
    padding: 0 28px;
  }

  /* ===== LOGO ===== */
  .rn-logo {
    display: flex;
    align-items: center;
    align-self: center;
    flex: 0 0 auto;
    text-decoration: none;
    line-height: 0;
  }

  .rn-logo img {
    display: block;
    height: 400px;
    width: 450px;
    max-width: 400px;
    object-fit: contain;
    vertical-align: middle;
  }

  /* ===== NAV LINKS ===== */
  .rn-nav {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    align-self: center;
    list-style: none;
    flex: 1 1 auto;
    justify-content: flex-end;
    gap: 0;
    height: 64px;
  }

  .rn-nav > li {
    display: flex;
    align-items: center;
    align-self: center;
    position: relative;
    height: 64px;
  }

  .rn-nav > li > a {
    display: flex;
    align-items: center;
    align-self: center;
    height: 64px;
    padding: 0 11px;
    color: #e8e8e8;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
    border-bottom: 3px solid transparent;
    line-height: 1;
    transition: color 0.2s, border-color 0.2s;
    cursor: pointer;
  }

  .rn-nav > li > a:hover,
  .rn-nav > li:hover > a {
    color: #c3002f;
    border-bottom-color: #c3002f;
  }

  /* Dropdown arrow */
  .rn-nav > li.drop > a::after {
    content: '';
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 3.5px solid transparent;
    border-right: 3.5px solid transparent;
    border-top: 4px solid currentColor;
    margin-left: 5px;
    transition: transform 0.2s;
    vertical-align: middle;
  }
  .rn-nav > li.drop:hover > a::after {
    transform: rotate(180deg);
  }

  /* ===== DROPDOWN ===== */
  .rn-drop {
    display: none;
    position: absolute;
    top: 64px;
    left: 0;
    min-width: 225px;
    background: #1c1c1c;
    border-top: 3px solid #c3002f;
    box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    list-style: none;
    padding: 4px 0;
    z-index: 9999;
  }
  .rn-nav > li.drop:hover .rn-drop { display: block; }

  .rn-drop li a {
    display: block;
    padding: 10px 18px;
    color: #cccccc;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10.5px;
    font-weight: 600;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    text-decoration: none;
    white-space: nowrap;
    border-left: 3px solid transparent;
    transition: background 0.15s, color 0.15s, border-color 0.15s;
  }
  .rn-drop li a:hover {
    background: #c3002f;
    color: #fff;
    border-left-color: #ff1a47;
  }

  /* ===== BURGER ===== */
  .rn-burger {
    display: none;
    flex: 0 0 auto;
    align-self: center;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 5px;
    width: 40px;
    height: 40px;
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px;
  }
  .rn-burger span {
    display: block;
    width: 22px;
    height: 2px;
    background: #fff;
    border-radius: 2px;
    transition: background 0.2s;
  }
  .rn-burger:hover span { background: #c3002f; }

  /* ===== MOBILE PANEL ===== */
  .rn-mobile {
    display: none;
    flex-direction: column;
    background: #1a1a1a;
    border-top: 2px solid #c3002f;
  }
  .rn-mobile.open { display: flex; }
  .rn-mobile a {
    display: block;
    padding: 13px 24px;
    color: #eee;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    text-decoration: none;
    border-bottom: 1px solid #2a2a2a;
    transition: background 0.15s;
  }
  .rn-mobile a:hover { background: #c3002f; color: #fff; }
  .rn-mobile a.sub {
    padding-left: 38px;
    font-size: 10px;
    color: #999;
    font-weight: 600;
  }
  .rn-mobile a.sub:hover { background: rgba(195,0,47,0.1); color: #c3002f; }

  /* ===== RESPONSIVE BREAKPOINTS ===== */
  @media (max-width: 1100px) {
    .rn-nav > li > a { padding: 0 8px; font-size: 10px; }
    .rn-bar { padding: 0 20px; }
  }
  @media (max-width: 860px) {
    .rn-nav { display: none; }
    .rn-burger { display: flex; }
    .rn-bar { height: 60px; padding: 0 16px; }
    .rn-logo img { height: 40px; }
  }
</style>

<!-- NAVBAR ROW -->
<div class="rn-bar">

  <!-- Logo -->
  <a class="rn-logo" href="/index.html" aria-label="Reliable Nissan Homepage">
    <img src="/assets/img/reliable-nissan-logo.png" alt="Reliable Nissan" />
  </a>

  <!-- Nav Links -->
  <ul class="rn-nav">
    <li><a href="/vehicles.html">Vehicles</a></li>
    <li><a href="/prices-list.html">Prices</a></li>
    <li><a href="/vehicles/new/nissan-magnite/offer.html">Monthly Offer</a></li>

    <li class="drop">
      <a href="javascript:void(0)">Shop@Home</a>
      <ul class="rn-drop">
        <li><a href="/request-a-callback.html" target="_blank">Request A Call Back</a></li>
        <li><a href="/vehicles/brochures.html">Download Brochure</a></li>
        <li><a href="/booktestdrive.html" target="_blank">Book A Test Drive</a></li>
        <li><a href="/configurator-gravite-configurator.html" target="_blank">Configure Gravite</a></li>
        <li><a href="/configure-magnite.html" target="_blank">Configure Magnite</a></li>
        <li><a href="/exchange-car.html" target="_blank">Exchange Your Car</a></li>
        <li><a href="/book-a-car.html" target="_blank">Check Your EMI</a></li>
        <li><a href="/book-a-car.html" target="_blank">Book A Car</a></li>
      </ul>
    </li>

    <li><a href="/request-a-callback.html">Contact Us</a></li>
    <li><a href="/about-us.html">About Us</a></li>
  </ul>

  <!-- Burger (mobile) -->
  <button class="rn-burger" aria-label="Toggle Menu"
    onclick="this.getRootNode().querySelector('.rn-mobile').classList.toggle('open')">
    <span></span><span></span><span></span>
  </button>

</div>

<!-- Mobile Panel -->
<div class="rn-mobile">
  <a href="/vehicles.html">Vehicles</a>
  <a href="/prices-list.html">Prices</a>
  <a href="/vehicles/new/nissan-magnite/offer.html">Monthly Offer</a>
  <a href="javascript:void(0)" style="color:#c3002f">Shop@Home</a>
  <a class="sub" href="/request-a-callback.html" target="_blank">↳ Request A Call Back</a>
  <a class="sub" href="/vehicles/brochures.html">↳ Download Brochure</a>
  <a class="sub" href="/booktestdrive.html" target="_blank">↳ Book A Test Drive</a>
  <a class="sub" href="/configurator-gravite-configurator.html" target="_blank">↳ Configure Gravite</a>
  <a class="sub" href="/configure-magnite.html" target="_blank">↳ Configure Magnite</a>
  <a class="sub" href="/exchange-car.html" target="_blank">↳ Exchange Your Car</a>
  <a class="sub" href="/book-a-car.html" target="_blank">↳ Book A Car</a>
  <a href="/request-a-callback.html">Contact Us</a>
  <a href="/about-us.html">About Us</a>
</div>
`;
  }
}
customElements.define('app-navbar', AppNavbar);
