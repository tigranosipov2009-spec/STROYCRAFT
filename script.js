const formatCurrency = (value) =>
  new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    maximumFractionDigits: 0
  }).format(Math.round(value));

const getQueryParams = () => new URLSearchParams(window.location.search);

const initHeader = () => {
  const header = document.querySelector("[data-header]");
  const toggle = document.querySelector("[data-menu-toggle]");
  const nav = document.querySelector("[data-nav]");

  if (!header) return;

  const updateHeader = () => {
    header.classList.toggle("site-header--scrolled", window.scrollY > 18);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", isOpen);
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    });
  });
};

const initReveal = () => {
  const nodes = document.querySelectorAll("[data-reveal]");

  if (!nodes.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.16, rootMargin: "0px 0px -40px 0px" }
  );

  nodes.forEach((node) => observer.observe(node));
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
    const total = area * Number(type?.dataset.price || 0);

    return {
      area,
      renovation: type?.value || "",
      total,
      min: total * 0.92,
      max: total * 1.08
    };
  };

  const renderQuickState = (persist = false) => {
    const state = collectQuickState();
    areaValue.textContent = String(state.area);
    totalOutput.textContent = `${formatCurrency(state.min)} - ${formatCurrency(state.max)}`;
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

  const applyLeadContext = () => {
    const lead = getQueryParams().get("lead");

    if (lead !== "review") return;

    leadKicker.textContent = "Детальный разбор проекта";
    leadTitle.textContent = "Оставьте контакт и получите экспертный разбор проекта";
    leadCopy.textContent = "Мы используем выбранные параметры как основу, а затем подскажем слабые места квартиры, приоритеты по бюджету и следующий правильный шаг.";
    submitButton.textContent = "Получить детальный разбор";
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

    const total = area * pricePerSquare;
    const min = total * 0.92;
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
      max
    };
  };

  const renderSummary = (persist = false) => {
    const state = collectState();

    areaValue.textContent = String(state.area);
    totalShort.textContent = formatCurrency(state.total);
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
    nextButton.hidden = currentStep >= steps.length;
    submitButton.hidden = currentStep !== steps.length;

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
    if (title) title.textContent = "Получите детальный разбор проекта перед стартом ремонта";
    if (copy) copy.textContent = "Разберём ваш запрос, подскажем приоритеты по бюджету, объясним слабые места объекта и поможем определить правильный уровень ремонта.";
    if (kicker) kicker.textContent = "Детальный разбор проекта";
    if (goalSelect) goalSelect.value = "Детальный разбор проекта";
  }

  if (estimate && estimateBanner) {
    estimateBanner.hidden = false;
    estimateBanner.innerHTML = `
      <p class="kicker">Ваш последний расчёт</p>
      <strong class="contact-card__link">${formatCurrency(estimate.total)}</strong>
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
        goalSelect.value = "Детальный разбор проекта";
      }
    });
  });
};

const initYear = () => {
  document.querySelectorAll("[data-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
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
  initYear();
});
