(() => {
  const root = document.documentElement;

  function trigger(type) {
    if (typeof window.triggerHaptic === "function") {
      window.triggerHaptic(type);
    } else if (navigator.vibrate) {
      navigator.vibrate(type === "success" ? [40, 50, 40] : 20);
    }
  }

  function updateThemeIcons() {
    const moon = document.getElementById("fab-moon");
    const sun = document.getElementById("fab-sun");
    if (!moon || !sun) return;
    const isDark = root.classList.contains("dark-mode");
    moon.style.display = isDark ? "none" : "block";
    sun.style.display = isDark ? "block" : "none";
  }

  function setupThemeToggle() {
    const toggle = document.getElementById("global-theme-toggle");
    updateThemeIcons();
    if (!toggle) return;
    toggle.addEventListener("click", () => {
      const isDark = root.classList.toggle("dark-mode");
      localStorage.setItem("theme", isDark ? "dark" : "light");
      updateThemeIcons();
      trigger("light");
    });
  }

  function setupNavbar() {
    const topbar = document.getElementById("topbar");
    const menuBtn = document.getElementById("mobile-menu-btn");
    const menu = document.getElementById("mobile-menu");
    const links = document.querySelectorAll("[data-mobile-link]");

    const syncBar = () => {
      if (topbar) {
        topbar.classList.toggle("scrolled", window.scrollY > 10);
      }
    };

    syncBar();
    window.addEventListener("scroll", syncBar, { passive: true });

    if (!menuBtn || !menu) return;
    menuBtn.addEventListener("click", () => {
      const active = menu.classList.toggle("active");
      menuBtn.setAttribute("aria-expanded", String(active));
      document.body.style.overflow = active ? "hidden" : "";
      trigger("light");
    });

    links.forEach((link) => {
      link.addEventListener("click", () => {
        menu.classList.remove("active");
        menuBtn.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  function setupReveal() {
    const nodes = document.querySelectorAll(".reveal");
    if (!nodes.length) return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.14 });

    nodes.forEach((node) => observer.observe(node));
  }

  function setupDisclaimer() {
    const overlay = document.getElementById("bci-disclaimer-overlay");
    const checkbox = document.getElementById("bci-accept-checkbox");
    const button = document.getElementById("bci-proceed-btn");

    if (!overlay || !checkbox || !button) return;

    const accepted = localStorage.getItem("bciDisclaimerAccepted") === "true";
    if (!accepted) {
      overlay.classList.add("active");
      document.body.style.overflow = "hidden";
    }

    checkbox.addEventListener("change", () => {
      button.classList.toggle("active", checkbox.checked);
      trigger("light");
    });

    button.addEventListener("click", () => {
      if (!checkbox.checked) return;
      localStorage.setItem("bciDisclaimerAccepted", "true");
      overlay.classList.remove("active");
      document.body.style.overflow = "";
      trigger("success");
    });
  }

  function setYear() {
    document.querySelectorAll("[data-year]").forEach((node) => {
      node.textContent = String(new Date().getFullYear());
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");
  }

  function normalizeArea(area) {
    const raw = area || "General";
    if (["Banking Law", "Banking & Finance Law"].includes(raw)) {
      return "Banking & Finance";
    }
    return raw;
  }

  function createArticleCard(article) {
    return `
      <a class="article-card reveal" href="article.html?id=${encodeURIComponent(article.id)}">
        <div class="tag-row">
          <span class="tag">${escapeHtml(article.category || "Insights")}</span>
        </div>
        <h3 class="card-title">${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.excerpt || "Legal analysis and practical guidance.")}</p>
        <div class="article-footer">
          <span>${escapeHtml(article.date || "")}</span>
          <span class="arrow-link">Read article</span>
        </div>
      </a>
    `;
  }

  async function fetchArticles() {
    const res = await fetch("articles.json");
    if (!res.ok) throw new Error("Could not load articles");
    const data = await res.json();
    return Array.isArray(data.items) ? [...data.items].reverse() : [];
  }

  async function initHome() {
    const grid = document.getElementById("latest-articles");
    const highlight = document.getElementById("hero-highlight");
    if (!grid || !highlight) return;

    try {
      const articles = await fetchArticles();
      if (!articles.length) {
        grid.innerHTML = '<div class="empty-state">Articles will appear here soon.</div>';
        return;
      }

      const [featured, ...rest] = articles;
      highlight.innerHTML = `
        <span class="tag">${escapeHtml(featured.category || "Featured")}</span>
        <h3>${escapeHtml(featured.title)}</h3>
        <p>${escapeHtml(featured.excerpt || "")}</p>
        <a class="arrow-link" href="article.html?id=${encodeURIComponent(featured.id)}">Open featured insight</a>
      `;

      grid.innerHTML = rest.slice(0, 3).map(createArticleCard).join("");
      setupReveal();
    } catch (error) {
      grid.innerHTML = '<div class="empty-state">Could not load insights right now.</div>';
    }
  }

  async function initInsights() {
    const featured = document.getElementById("featured-article");
    const chipRow = document.getElementById("law-areas-pills");
    const grid = document.getElementById("article-grid");
    const searchInput = document.getElementById("search-input");
    const results = document.getElementById("results-count");
    if (!featured || !chipRow || !grid || !searchInput || !results) return;

    try {
      const articles = await fetchArticles();
      if (!articles.length) {
        grid.innerHTML = '<div class="empty-state">No insights published yet.</div>';
        return;
      }

      const [lead, ...allItems] = articles;
      featured.href = `article.html?id=${encodeURIComponent(lead.id)}`;
      featured.innerHTML = `
        <div>
          <div class="tag-row">
            <span class="tag">Featured insight</span>
            <span class="tag">${escapeHtml(lead.category || "Insights")}</span>
          </div>
          <h2 class="feature-title">${escapeHtml(lead.title)}</h2>
          <p>${escapeHtml(lead.excerpt || "")}</p>
          <div class="article-footer">
            <span>${escapeHtml(lead.date || "")}</span>
            <span class="arrow-link">Read featured analysis</span>
          </div>
        </div>
        <div class="metrics-card">
          <div class="metrics-title">Why readers start here</div>
          <div class="metrics-grid">
            <div class="metric">
              <strong>Practical</strong>
              <span>Explains what a notice, filing, or order means in plain language.</span>
            </div>
            <div class="metric">
              <strong>Focused</strong>
              <span>Built around recurring disputes in courts, tribunals, and recovery matters.</span>
            </div>
          </div>
        </div>
      `;

      const filterItems = [lead, ...allItems];
      const areaValues = ["All", ...new Set(filterItems.map((item) => normalizeArea(item.lawArea)))];
      let selectedArea = "All";
      let searchTerm = "";

      chipRow.innerHTML = areaValues.map((area, index) => `
        <button class="chip${index === 0 ? " active" : ""}" type="button" data-area="${escapeHtml(area)}">
          ${escapeHtml(area)}
        </button>
      `).join("");

      function render() {
        const filtered = filterItems.filter((article) => {
          const matchesArea = selectedArea === "All" || normalizeArea(article.lawArea) === selectedArea;
          const haystack = `${article.title || ""} ${article.excerpt || ""} ${article.category || ""}`.toLowerCase();
          const matchesSearch = !searchTerm || haystack.includes(searchTerm);
          return matchesArea && matchesSearch;
        });

        results.textContent = `${filtered.length} article${filtered.length === 1 ? "" : "s"} shown`;
        grid.innerHTML = filtered.length
          ? filtered.map(createArticleCard).join("")
          : '<div class="empty-state">No insights match that search right now.</div>';
        setupReveal();
      }

      chipRow.addEventListener("click", (event) => {
        const button = event.target.closest("[data-area]");
        if (!button) return;
        selectedArea = button.dataset.area;
        chipRow.querySelectorAll(".chip").forEach((chip) => chip.classList.remove("active"));
        button.classList.add("active");
        trigger("light");
        render();
      });

      searchInput.addEventListener("input", (event) => {
        searchTerm = event.target.value.trim().toLowerCase();
        render();
      });

      render();
    } catch (error) {
      grid.innerHTML = '<div class="empty-state">Could not load insights right now.</div>';
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupThemeToggle();
    setupNavbar();
    setupReveal();
    setupDisclaimer();
    setYear();

    const page = document.body.dataset.page;
    if (page === "home") {
      initHome();
    } else if (page === "insights") {
      initInsights();
    }
  });
})();
