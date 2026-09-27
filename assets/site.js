/* Portfolio page behaviour for index.html. */
(function () {
    "use strict";

    var root = document.documentElement;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function store(key, value) {
        try {
            if (value === undefined) return localStorage.getItem(key);
            localStorage.setItem(key, value);
        } catch (e) {
            return null;
        }
    }

    /* ---------- Theme toggle ---------- */
    function currentTheme() {
        if (root.dataset.theme) return root.dataset.theme;
        if (root.dataset.defaultTheme) return root.dataset.defaultTheme;
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }

    function syncToggleLabels() {
        var next = currentTheme() === "dark" ? "light" : "dark";
        document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
            btn.setAttribute("aria-label", "Switch to " + next + " mode");
            btn.setAttribute("title", "Switch to " + next + " mode");
        });
    }

    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
        btn.addEventListener("click", function () {
            var next = currentTheme() === "dark" ? "light" : "dark";
            root.dataset.theme = next;
            store("theme", next);
            syncToggleLabels();
        });
    });
    syncToggleLabels();

    /* ---------- Header: shrink on scroll + mobile menu ---------- */
    var header = document.querySelector("[data-header]");
    if (header) {
        var onScroll = function () {
            header.classList.toggle("is-scrolled", window.scrollY > 24);
        };
        onScroll();
        window.addEventListener("scroll", onScroll, {passive: true});
    }

    var menuBtn = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-menu]");
    if (menuBtn && menu) {
        var setMenu = function (open) {
            menuBtn.setAttribute("aria-expanded", String(open));
            menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
            menu.classList.toggle("is-open", open);
            document.body.classList.toggle("menu-open", open);
        };
        menuBtn.addEventListener("click", function () {
            setMenu(menuBtn.getAttribute("aria-expanded") !== "true");
        });
        menu.querySelectorAll("a").forEach(function (a) {
            a.addEventListener("click", function () {
                setMenu(false);
            });
        });
        document.addEventListener("keydown", function (e) {
            if (e.key === "Escape") setMenu(false);
        });
    }

    /* ---------- Scrollspy ---------- */
    var navLinks = Array.prototype.slice.call(document.querySelectorAll("[data-menu] a[href^='#']"));
    if ("IntersectionObserver" in window && navLinks.length) {
        var byId = {};
        navLinks.forEach(function (a) {
            byId[a.getAttribute("href").slice(1)] = a;
        });
        var spy = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                navLinks.forEach(function (a) {
                    a.removeAttribute("aria-current");
                });
                var link = byId[entry.target.id];
                if (link) link.setAttribute("aria-current", "true");
            });
        }, {rootMargin: "-45% 0px -50% 0px"});
        Object.keys(byId).forEach(function (id) {
            var section = document.getElementById(id);
            if (section) spy.observe(section);
        });
    }

    /* ---------- Reveal on scroll ---------- */
    var reveals = document.querySelectorAll(".reveal");
    if (reduceMotion || !("IntersectionObserver" in window)) {
        reveals.forEach(function (el) {
            el.classList.add("is-visible");
        });
    } else {
        var revealer = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add("is-visible");
                obs.unobserve(entry.target);
            });
        }, {rootMargin: "0px 0px -8% 0px", threshold: 0.08});
        reveals.forEach(function (el) {
            revealer.observe(el);
        });
    }

    /* ---------- Count-up stats ---------- */
    function runCounter(el) {
        var target = parseFloat(el.dataset.count);
        var suffix = el.dataset.suffix || "";
        if (reduceMotion) {
            el.textContent = target + suffix;
            return;
        }
        var duration = 1400;
        var start = null;
        function frame(ts) {
            if (start === null) start = ts;
            var p = Math.min((ts - start) / duration, 1);
            var eased = 1 - Math.pow(1 - p, 3);
            el.textContent = Math.round(target * eased) + suffix;
            if (p < 1) requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
    }

    var counters = document.querySelectorAll("[data-count]");
    if ("IntersectionObserver" in window) {
        var counterObs = new IntersectionObserver(function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                runCounter(entry.target);
                obs.unobserve(entry.target);
            });
        }, {threshold: 0.6});
        counters.forEach(function (el) {
            el.textContent = "0" + (el.dataset.suffix || "");
            counterObs.observe(el);
        });
    }

    /* ---------- Typed roles ---------- */
    var typed = document.querySelector("[data-typed]");
    if (typed) {
        var words = typed.dataset.typed.split("|");
        if (!reduceMotion && words.length > 1) {
            var w = 0, i = words[0].length, deleting = true;
            var tick = function () {
                var delay;
                if (deleting) {
                    i--;
                    delay = 40;
                    if (i === 0) {
                        deleting = false;
                        w = (w + 1) % words.length;
                        delay = 350;
                    }
                } else {
                    i++;
                    delay = 80;
                    if (i === words[w].length) {
                        deleting = true;
                        delay = 2200;
                    }
                }
                typed.textContent = words[w].slice(0, i) || "​";
                setTimeout(tick, delay);
            };
            setTimeout(tick, 2400);
        }
    }

    /* ---------- Project filter ---------- */
    var filterBar = document.querySelector("[data-filter-bar]");
    if (filterBar) {
        var cards = document.querySelectorAll("[data-tags]");
        filterBar.addEventListener("click", function (e) {
            var btn = e.target.closest("button[data-filter]");
            if (!btn) return;
            var tag = btn.dataset.filter;
            filterBar.querySelectorAll("button").forEach(function (b) {
                b.setAttribute("aria-pressed", String(b === btn));
            });
            cards.forEach(function (card) {
                var show = tag === "all" || card.dataset.tags.split(" ").indexOf(tag) !== -1;
                card.hidden = !show;
                if (show) card.classList.add("is-visible");
            });
        });
    }

    /* ---------- Expandable highlights ---------- */
    document.querySelectorAll("[data-expand]").forEach(function (btn) {
        var target = document.getElementById(btn.getAttribute("aria-controls"));
        if (!target) return;
        var label = btn.querySelector("[data-expand-label]") || btn;
        var moreLabel = label.textContent.trim();
        btn.addEventListener("click", function () {
            var open = btn.getAttribute("aria-expanded") !== "true";
            btn.setAttribute("aria-expanded", String(open));
            target.hidden = !open;
            label.textContent = open ? "Show fewer" : moreLabel;
            if (open) target.querySelectorAll(".reveal").forEach(function (el) {
                el.classList.add("is-visible");
            });
        });
    });

    /* ---------- Cursor spotlight on cards (fine pointers only) ---------- */
    if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
        document.addEventListener("pointermove", function (e) {
            var card = e.target.closest && e.target.closest(".spot");
            if (!card) return;
            var r = card.getBoundingClientRect();
            card.style.setProperty("--mx", (e.clientX - r.left) + "px");
            card.style.setProperty("--my", (e.clientY - r.top) + "px");
        }, {passive: true});
    }

    /* ---------- Footer year ---------- */
    document.querySelectorAll("[data-year]").forEach(function (el) {
        el.textContent = new Date().getFullYear();
    });
})();
