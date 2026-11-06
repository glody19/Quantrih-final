(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Year */
  $('#year').textContent = new Date().getFullYear();

  /* Sticky nav state */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 8);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const burger = $('.burger');
  const menu = $('#mobile-menu');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    menu.hidden = !open;
  };
  burger.addEventListener('click', () => setMenu(menu.hidden));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* Active nav link on scroll */
  const links = $$('.nav__links a');
  const sections = links.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        links.forEach(l => l.classList.toggle('is-active', l.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spy.observe(s));

  /* Reveal on scroll */
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
  $$('.reveal, .tile, .phone').forEach((el, i) => {
    if (el.classList.contains('reveal')) el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  /* Count-up KPIs */
  const fmt = new Intl.NumberFormat('fr-BE');
  $$('[data-count]').forEach(el => {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = fmt.format(target); return; }
    const t0 = performance.now(), dur = 1800;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt.format(Math.round(target * e));
      if (p < 1) requestAnimationFrame(tick);
    };
    setTimeout(() => requestAnimationFrame(tick), 400);
  });

  /* Tabs */
  const tabs = $$('[role="tab"]');
  const ink = $('.tabs__ink');
  const moveInk = (tab) => {
    ink.style.width = tab.offsetWidth + 'px';
    ink.style.transform = `translateX(${tab.offsetLeft}px)`;
  };
  const selectTab = (tab, focus = false) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
    moveInk(tab);
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      const dir = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (dir) { e.preventDefault(); selectTab(tabs[(i + dir + tabs.length) % tabs.length], true); }
    });
  });
  const initInk = () => moveInk(tabs.find(t => t.getAttribute('aria-selected') === 'true'));
  window.addEventListener('resize', initInk);
  document.fonts?.ready.then(initInk);
  initInk();
  $$('[data-tab]').forEach(a => a.addEventListener('click', () => selectTab($('#' + a.dataset.tab))));

  /* Profiles */
  const PROFILES = {
    independant: {
      k: 'Indépendant', t: 'Concentrez-vous sur votre métier, on gère le reste.',
      p: "Comptabilité, TVA, impôt des personnes physiques et cotisations sociales : nous prenons tout en charge et vous aidons à anticiper vos versements.",
      l: ['Tenue de comptabilité & TVA', 'Déclaration IPP', 'Anticipation des cotisations sociales', 'Analyse du passage en société']
    },
    societe: {
      k: 'Société / PME', t: 'Un pilotage financier digne des grandes entreprises.',
      p: "Des chiffres fiables et à jour, des tableaux de bord clairs et une fiscalité optimisée pour accompagner votre croissance.",
      l: ['Comptes annuels & ISOC', 'Tableaux de bord & analytique', 'Rémunération du dirigeant', "Droit des sociétés & AG"]
    },
    liberal: {
      k: 'Profession libérale', t: 'Votre cabinet, structuré et serein.',
      p: "Médecins, avocats, architectes, consultants… Nous connaissons vos spécificités et optimisons votre statut et votre rémunération.",
      l: ['Choix indépendant ou société', 'Optimisation de la rémunération', 'TVA et régimes spécifiques', 'Planification fiscale']
    },
    asbl: {
      k: 'ASBL', t: 'Une gestion transparente au service de votre mission.',
      p: "Comptabilité adaptée aux ASBL, comptes annuels, impôt des personnes morales et obligations légales, pour que vous restiez concentré sur votre projet associatif.",
      l: ['Comptabilité simplifiée ou complète', 'Comptes annuels & dépôt', 'Impôt des personnes morales', 'Publications légales']
    },
    starter: {
      k: 'Starter', t: 'Lancez-vous sur des bases solides.',
      p: "De l'idée au premier client : nous choisissons avec vous la bonne structure, construisons le plan financier et réalisons toutes les démarches.",
      l: ['Choix de la forme juridique', 'Business plan & plan financier', 'Immatriculations BCE, TVA, ONSS', 'Recherche de financement & subsides']
    },
    immo: {
      k: 'Investisseur immobilier', t: 'Investissez avec une vision fiscale claire.',
      p: "Détention en nom propre ou en société, revenus locatifs, TVA immobilière, transmission : nous éclairons chaque décision patrimoniale.",
      l: ['Structuration de la détention', 'Fiscalité des revenus immobiliers', 'TVA & conseil fiscal', 'Donations & successions']
    },
    expat: {
      k: 'Étranger en Belgique', t: 'La fiscalité belge, expliquée simplement.',
      p: "Arrivée, départ, revenus à l'étranger, statut de non-résident : nous vous guidons dans un système souvent complexe.",
      l: ['Fiscalité des étrangers en Belgique', 'Impôt des non-résidents', 'Conventions préventives de double imposition', 'Démarches de démarrage d’activité']
    }
  };
  const body = $('.profiles__body');
  const render = (key, animate = true) => {
    const d = PROFILES[key];
    const apply = () => {
      $('#pf-kicker').textContent = d.k;
      $('#pf-title').textContent = d.t;
      $('#pf-text').textContent = d.p;
      $('#pf-list').innerHTML = d.l.map(x => `<li>${x}</li>`).join('');
      body.classList.remove('is-swap');
    };
    if (!animate || reduce) return apply();
    body.classList.add('is-swap');
    setTimeout(apply, 200);
  };
  const chips = $$('.pchip');
  chips.forEach(c => c.addEventListener('click', () => {
    chips.forEach(x => { x.classList.toggle('is-active', x === c); x.setAttribute('aria-checked', String(x === c)); });
    render(c.dataset.p);
    const sel = $('#contact-form select[name="profil"]');
    const match = [...sel.options].find(o => o.text.startsWith(PROFILES[c.dataset.p].k.split(' /')[0]));
    if (match) sel.value = match.text;
  }));
  render('independant', false);

  /* FAQ: one open at a time */
  const faqs = $$('.faq__list details');
  faqs.forEach(d => d.addEventListener('toggle', () => { if (d.open) faqs.forEach(o => o !== d && (o.open = false)); }));

  /* Contact form -> mailto */
  const form = $('#contact-form');
  const note = $('#form-note');
  form.addEventListener('submit', e => {
    e.preventDefault();
    let ok = true;
    ['nom', 'email', 'message'].forEach(n => {
      const f = form.elements[n];
      const valid = f.value.trim() && (n !== 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value));
      f.classList.toggle('is-invalid', !valid);
      if (!valid && ok) { f.focus(); ok = false; }
    });
    if (!ok) { note.textContent = 'Merci de compléter les champs requis.'; note.classList.add('is-error'); return; }
    const fd = new FormData(form);
    const besoins = fd.getAll('besoin').join(', ') || '—';
    const subject = `Demande de contact — ${fd.get('nom')} (${fd.get('profil')})`;
    const bodyTxt = `Nom : ${fd.get('nom')}\nE-mail : ${fd.get('email')}\nTéléphone : ${fd.get('tel') || '—'}\nProfil : ${fd.get('profil')}\nBesoin : ${besoins}\n\n${fd.get('message')}`;
    window.location.href = `mailto:info@egataxconsulting.be?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyTxt)}`;
    note.classList.remove('is-error');
    note.textContent = 'Merci ! Votre messagerie s’ouvre avec votre demande pré-remplie.';
  });
  form.addEventListener('input', e => e.target.classList.remove('is-invalid'));
})();
