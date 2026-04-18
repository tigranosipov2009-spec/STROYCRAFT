const formatCurrency = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(Math.round(value));

const formatFromCurrency = (value) => `от ${formatCurrency(value)}`;

const getQueryParams = () => new URLSearchParams(window.location.search);

const initHeader = () => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("site-header--scrolled", window.scrollY > 18);
  };

  const syncMenuState = (isOpen) => {
    header.classList.toggle("site-header--menu-open", isOpen);
    document.body.classList.toggle("is-menu-open", isOpen);
  };

  const closeMenu = () => {
    if (!toggle || !nav) return;
    nav.classList.remove("is-open");
    toggle.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    syncMenuState(false);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
    syncMenuState(isOpen);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("click", (event) => {
    if (!nav.classList.contains("is-open")) return;
    if (header.contains(event.target)) return;
    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeMenu();
    }
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 900) {
      closeMenu();
    }
  });

  window.addEventListener("orientationchange", closeMenu);
};

const initReveal = () => {
  const nodes = [...document.querySelectorAll("[data-reveal]")];

  if (!nodes.length) return;

  const revealNode = (node) => node.classList.add("is-visible");

  nodes
    .filter((node) => node.closest(".hero, .page-hero"))
    .forEach(revealNode);

  const deferredNodes = nodes.filter((node) => !node.classList.contains("is-visible"));

  if (!deferredNodes.length) return;

  if (!("IntersectionObserver" in window)) {
    deferredNodes.forEach(revealNode);
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          revealNode(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
  );

  deferredNodes.forEach((node) => observer.observe(node));
};

const initCounters = () => {
  const counters = document.querySelectorAll("[data-count]");

  if (!counters.length) return;

  const animate = (element) => {
    const target = Number(element.dataset.count);
    const duration = 1400;
    const start = performance.now();

    const frame = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased);

      if (progress < 1) {
        requestAnimationFrame(frame);
      }
    };

    requestAnimationFrame(frame);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      animate(entry.target);
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.6 });

  counters.forEach((counter) => observer.observe(counter));
};

const initParallax = () => {
  const medias = [...document.querySelectorAll("[data-parallax]")];
  if (!medias.length || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  let ticking = false;

  const update = () => {
    const scrollY = window.scrollY;

    medias.forEach((media) => {
      const rect = media.parentElement.getBoundingClientRect();
      const offset = Math.max(Math.min((window.innerHeight - rect.top) * 0.06, 30), -24);
      media.style.transform = `translate3d(0, ${offset - scrollY * 0.015}px, 0) scale(1.08)`;
    });

    ticking = false;
  };

  const requestTick = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  update();
  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
};

const initBeforeAfter = () => {
  const comparisons = document.querySelectorAll("[data-compare]");

  comparisons.forEach((comparison) => {
    const range = comparison.querySelector(".case-compare__range");
    const before = comparison.querySelector("[data-compare-before]");
    const handle = comparison.querySelector("[data-compare-handle]");

    if (!range || !before || !handle) return;

    const update = () => {
      const value = `${range.value}%`;
      before.style.width = value;
      handle.style.left = value;
    };

    range.addEventListener("input", update);
    update();
  });
};

const initPhoneInputs = () => {
  document.querySelectorAll("[data-phone-input]").forEach((input) => {
    input.addEventListener("input", () => {
      const digits = input.value.replace(/\D/g, "").slice(0, 11);
      const normalized = digits.startsWith("8") ? `7${digits.slice(1)}` : digits;
      const value = normalized.startsWith("7") ? normalized : `7${normalized}`;

      let formatted = "+7";
      if (value.length > 1) formatted += ` (${value.slice(1, 4)}`;
      if (value.length >= 4) formatted += ")";
      if (value.length >= 5) formatted += ` ${value.slice(4, 7)}`;
      if (value.length >= 8) formatted += `-${value.slice(7, 9)}`;
      if (value.length >= 10) formatted += `-${value.slice(9, 11)}`;

      input.value = formatted;
    });
  });
};

const showToast = (message) => {
  let toast = document.querySelector(".success-toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "success-toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("is-visible");

  window.clearTimeout(showToast.timeoutId);
  showToast.timeoutId = window.setTimeout(() => {
    toast.classList.remove("is-visible");
  }, 3200);
};

const getSelectedRadio = (name) => document.querySelector(`input[name="${name}"]:checked`);

const saveEstimate = (payload) => {
  localStorage.setItem("skcraft-estimate", JSON.stringify(payload));
};

const readEstimate = () => {
  try {
    return JSON.parse(localStorage.getItem("skcraft-estimate") || "null");
  } catch {
    return null;
  }
};

const initQuickEstimate = () => {
  const areaInput = document.querySelector("[data-quick-area]");
  const areaValue = document.querySelector("[data-quick-area-value]");
  const totalOutput = document.querySelector("[data-quick-total]");
  const summaryOutput = document.querySelector("[data-quick-summary]");
  const quickForm = document.getElementById("quickLeadForm");

  if (!areaInput || !areaValue || !totalOutput || !summaryOutput) return;

  const collectQuickState = () => {
    const area = Number(areaInput.value);
    const type = document.querySelector('input[name="quickType"]:checked');
    const projectFloor = 1800000;
    const total = Math.max(area * Number(type?.dataset.price || 0), projectFloor);

    return {
      area,
      renovation: type?.value || "",
      total,
      projectFloor
    };
  };

  const renderQuickState = (persist = false) => {
    const state = collectQuickState();
    areaValue.textContent = String(state.area);
    totalOutput.textContent = formatFromCurrency(state.total);
    summaryOutput.textContent = `${state.area} м² · ${state.renovation}`;

    if (persist) {
      saveEstimate(state);
    }
  };

  areaInput.addEventListener("input", () => renderQuickState(true));
  document.querySelectorAll('input[name="quickType"]').forEach((input) => {
    input.addEventListener("change", () => renderQuickState(true));
  });

  if (quickForm) {
    quickForm.addEventListener("submit", () => {
      saveEstimate(collectQuickState());
    });
  }

  renderQuickState(false);
};

const initCalculator = () => {
  const wizard = document.getElementById("calculatorWizard");
  if (!wizard) return;

  const steps = [...wizard.querySelectorAll(".wizard-step")];
  const areaInput = wizard.querySelector("[data-area-range]");
  const areaValue = wizard.querySelector("[data-area-value]");
  const progressLabel = wizard.querySelector("[data-progress-label]");
  const progressBar = wizard.querySelector("[data-progress-bar]");
  const nextButton = wizard.querySelector("[data-next-step]");
  const prevButton = wizard.querySelector("[data-prev-step]");
  const submitButton = wizard.querySelector("[data-submit-step]");
  const totalShort = document.querySelector("[data-total-short]");
  const totalRange = wizard.querySelector("[data-total-range]");
  const summaryShort = document.querySelector("[data-summary-short]");
  const summaryList = wizard.querySelector("[data-summary-list]");
  const leadTitle = wizard.querySelector("[data-lead-title]");
  const leadCopy = wizard.querySelector("[data-lead-copy]");
  const leadKicker = wizard.querySelector("[data-lead-kicker]");
  let currentStep = 1;
  const totalActionSteps = 6;

  const bindOptionCards = () => {
    const cards = wizard.querySelectorAll(".option-card--selectable");

    cards.forEach((card) => {
      const input = card.querySelector("input");
      if (!input) return;

      input.tabIndex = -1;

      const activateCard = () => {
        const currentScroll = window.scrollY;

        if (input.type === "radio") {
          if (!input.checked) {
            input.checked = true;
          }
        } else if (input.type === "checkbox") {
          input.checked = !input.checked;
        }

        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));

        window.requestAnimationFrame(() => {
          window.scrollTo({ top: currentScroll, behavior: "auto" });
        });
      };

      card.addEventListener("click", (event) => {
        event.preventDefault();
        activateCard();
      });

      card.addEventListener("keydown", (event) => {
        if (event.key !== "Enter" && event.key !== " ") return;
        event.preventDefault();
        activateCard();
      });

      card.tabIndex = 0;
      card.setAttribute("role", input.type === "checkbox" ? "checkbox" : "radio");
    });
  };

  const applyLeadContext = () => {
    const lead = getQueryParams().get("lead");

    if (lead !== "review") return;

    leadKicker.textContent = "Бесплатный разбор проекта";
    leadTitle.textContent = "Оставьте контакт и получите бесплатный разбор проекта";
    leadCopy.textContent = "Используем выбранные параметры как отправную точку, а затем подскажем слабые места объекта, приоритеты по бюджету и правильный следующий шаг.";
    submitButton.textContent = "Получить бесплатный разбор";
  };

  const collectState = () => {
    const area = Number(areaInput.value);
    const renovation = getSelectedRadio("renovationType");
    const electricity = getSelectedRadio("electricity");
    const water = getSelectedRadio("water");
    const materials = getSelectedRadio("materials");
    const extras = [...wizard.querySelectorAll('input[name="extras"]:checked')];

    const extrasTotal = extras.reduce((sum, extra) => sum + Number(extra.dataset.price), 0);
    const pricePerSquare =
      Number(renovation?.dataset.price || 0) +
      Number(electricity?.dataset.price || 0) +
      Number(water?.dataset.price || 0) +
      Number(materials?.dataset.price || 0) +
      extrasTotal;

    const projectFloor = 1800000;
    const total = Math.max(area * pricePerSquare, projectFloor);
    const min = Math.max(total * 0.94, projectFloor);
    const max = total * 1.08;

    return {
      area,
      renovation: renovation?.value || "",
      electricity: electricity?.value || "",
      water: water?.value || "",
      materials: materials?.value || "",
      extras: extras.map((extra) => extra.value),
      total,
      min,
      max,
      projectFloor
    };
  };

  const renderSummary = (persist = false) => {
    const state = collectState();

    areaValue.textContent = String(state.area);
    totalShort.textContent = formatFromCurrency(state.total);
    totalRange.textContent = `${formatCurrency(state.min)} - ${formatCurrency(state.max)}`;
    summaryShort.textContent = `${state.area} м² · ${state.renovation} · ${state.electricity}`;

    const chips = [
      ["Площадь", `${state.area} м²`],
      ["Тип ремонта", state.renovation],
      ["Электрика", state.electricity],
      ["Вода", state.water],
      ["Материалы", state.materials],
      ["Дополнительно", state.extras.length ? state.extras.join(", ") : "Без доп. опций"]
    ];

    summaryList.innerHTML = chips
      .map(
        ([label, value]) =>
          `<div class="summary-chip"><span>${label}</span>${value}</div>`
      )
      .join("");

    if (persist) {
      saveEstimate(state);
    }
  };

  const setStep = (step, options = {}) => {
    const { shouldScroll = true } = options;
    currentStep = Math.min(Math.max(step, 1), steps.length);

    steps.forEach((item) => {
      item.classList.toggle("is-active", Number(item.dataset.step) === currentStep);
    });

    const capped = Math.min(currentStep, totalActionSteps);
    progressLabel.textContent = currentStep <= totalActionSteps
      ? `Шаг ${currentStep} из ${totalActionSteps}`
      : "Финальный шаг";
    progressBar.style.width = `${(capped / totalActionSteps) * 100}%`;

    prevButton.disabled = currentStep === 1;
    nextButton.toggleAttribute("hidden", currentStep >= steps.length);
    submitButton.toggleAttribute("hidden", currentStep !== steps.length);

    if (shouldScroll) {
      window.scrollTo({ top: wizard.offsetTop - 120, behavior: "smooth" });
    }
  };

  const isStepValid = () => {
    if (currentStep !== steps.length) return true;

    const name = wizard.querySelector('input[name="clientName"]');
    const phone = wizard.querySelector('input[name="clientPhone"]');
    return name.reportValidity() && phone.reportValidity();
  };

  applyLeadContext();
  bindOptionCards();
  renderSummary(false);
  setStep(1, { shouldScroll: false });

  wizard.addEventListener("input", () => renderSummary(true));
  wizard.addEventListener("change", () => renderSummary(true));

  nextButton.addEventListener("click", () => setStep(currentStep + 1));
  prevButton.addEventListener("click", () => setStep(currentStep - 1));

  wizard.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!isStepValid()) return;

    const name = wizard.querySelector('input[name="clientName"]').value.trim();
    const state = collectState();
    saveEstimate({ ...state, name });
    showToast(`${name || "Заявка"} сохранена. Мы свяжемся с вами для уточнения проекта.`);
    wizard.reset();
    wizard.querySelector('input[name="renovationType"]').checked = true;
    wizard.querySelector('input[name="electricity"]').checked = true;
    wizard.querySelector('input[name="water"]').checked = true;
    wizard.querySelector('input[name="materials"]').checked = true;
    areaInput.value = "65";
    renderSummary(false);
    setStep(1);
  });
};

const initLeadContext = () => {
  const params = getQueryParams();
  const lead = params.get("lead");
  const title = document.querySelector(".page-contact [data-lead-title]");
  const copy = document.querySelector(".page-contact [data-lead-copy]");
  const kicker = document.querySelector(".page-contact [data-lead-kicker]");
  const goalSelect = document.querySelector("[data-goal-select]");
  const estimateBanner = document.querySelector("[data-estimate-banner]");
  const estimate = readEstimate();

  if (lead === "review") {
    if (title) title.textContent = "Получите бесплатный разбор проекта перед стартом ремонта";
    if (copy) copy.textContent = "Разберём ваш запрос, подскажем приоритеты по бюджету, объясним слабые места объекта и поможем определить правильный уровень ремонта.";
    if (kicker) kicker.textContent = "Бесплатный разбор проекта";
    if (goalSelect) goalSelect.value = "Бесплатный разбор проекта";
  }

  if (estimate && estimateBanner) {
    estimateBanner.hidden = false;
    estimateBanner.innerHTML = `
      <p class="kicker">Ваш последний расчёт</p>
      <strong class="contact-card__link">${formatFromCurrency(estimate.total)}</strong>
      <p>${estimate.area} м² · ${estimate.renovation}</p>
      <p>Используем этот ориентир как отправную точку для дальнейшего обсуждения.</p>
    `;
  }

  document.querySelectorAll(".lead-form").forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const nameField = form.querySelector('input[name="name"]');
      const phoneField = form.querySelector('input[name="phone"]');
      if (!nameField.reportValidity() || !phoneField.reportValidity()) return;

      const name = nameField.value.trim() || "Заявка";
      showToast(`${name}, спасибо. Мы скоро свяжемся с вами.`);
      form.reset();
      if (goalSelect && lead === "review") {
        goalSelect.value = "Бесплатный разбор проекта";
      }
    });
  });
};

const initYear = () => {
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
};

const initFloatingContacts = () => {
  if (document.querySelector(".floating-contact-widget")) return;

  const widget = document.createElement("div");
  widget.className = "floating-contact-widget";
  widget.innerHTML = `
    <a class="floating-contact-widget__link floating-contact-widget__link--telegram" href="https://t.me/stroykraft_sev" target="_blank" rel="noopener" aria-label="Написать в Telegram">
      <span class="floating-contact-widget__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" focusable="false">
          <path d="M20.6 4.2 3.7 10.8c-1.2.5-1.2 1.2-.2 1.5l4.3 1.3 1.7 5.3c.2.6.1.8.8.8.5 0 .7-.2 1-.5l2.1-2 4.4 3.2c.8.4 1.4.2 1.6-.8L22 5.7c.3-1.2-.5-1.8-1.4-1.5Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>
          <path d="m9.2 13.3 8.9-5.7" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/>
        </svg>
      </span>
      <span>Telegram</span>
    </a>
    <a class="floating-contact-widget__link floating-contact-widget__link--phone" href="tel:+79781234567" aria-label="Позвонить +7 (978) 123-45-67">
      <span class="floating-contact-widget__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" focusable="false">
          <path d="M6.5 4.8c.5-.5 1.3-.6 1.9-.2l2 1.2c.7.4 1 1.3.7 2l-.7 1.8a1 1 0 0 0 .2 1.1l2.4 2.4a1 1 0 0 0 1.1.2l1.8-.7c.7-.3 1.6 0 2 .7l1.2 2c.4.6.3 1.4-.2 1.9l-1.1 1.1c-.8.8-2 1.1-3.1.7-2.3-.7-4.6-2.4-6.8-4.6-2.2-2.2-3.9-4.5-4.6-6.8-.4-1.1-.1-2.3.7-3.1L6.5 4.8Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/>
        </svg>
      </span>
      <span>+7 (978) 123-45-67</span>
    </a>
  `;

  document.body.appendChild(widget);
};

document.addEventListener("DOMContentLoaded", () => {
  initHeader();
  initReveal();
  initCounters();
  initParallax();
  initBeforeAfter();
  initPhoneInputs();
  initQuickEstimate();
  initCalculator();
  initLeadContext();
  initFloatingContacts();
  initYear();
});
