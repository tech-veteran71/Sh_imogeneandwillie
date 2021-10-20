/**
 * file: global.js
 * ------------------------------------------------- 
 * in order:
 * - DAWN STUFF
 * - FOCUSABLE WIDGET
 * - DRAWERS
 * - MODALS
 * - CART API
 * - AJAXCART
 */

function getFocusableElements(container) {
  return Array.from(
    container.querySelectorAll(
      "summary, a[href], button:enabled, [tabindex]:not([tabindex^='-']), [draggable], area, input:not([type=hidden]):enabled, select:enabled, textarea:enabled, object, iframe"
    )
  );
}

const trapFocusHandlers = {};

function trapFocus(container, elementToFocus = container) {
  var elements = getFocusableElements(container);
  var first = elements[0];
  var last = elements[elements.length - 1];

  removeTrapFocus();

  trapFocusHandlers.focusin = (event) => {
    if (
      event.target !== container &&
      event.target !== last &&
      event.target !== first
    )
      return;

    document.addEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.focusout = function() {
    document.removeEventListener('keydown', trapFocusHandlers.keydown);
  };

  trapFocusHandlers.keydown = function(event) {
    if (event.code.toUpperCase() !== 'TAB') return; // If not TAB key
    // On the last focusable element and tab forward, focus the first element.
    if (event.target === last && !event.shiftKey) {
      event.preventDefault();
      first.focus();
    }

    //  On the first focusable element and tab backward, focus the last element.
    if (
      (event.target === container || event.target === first) &&
      event.shiftKey
    ) {
      event.preventDefault();
      last.focus();
    }
  };

  document.addEventListener('focusout', trapFocusHandlers.focusout);
  document.addEventListener('focusin', trapFocusHandlers.focusin);

  elementToFocus.focus();
}

// Here run the querySelector to figure out if the browser supports :focus-visible or not and run code based on it.
try {
  document.querySelector(":focus-visible");
} catch {
  focusVisiblePolyfill();
}

function focusVisiblePolyfill() {
  const navKeys = ['ARROWUP', 'ARROWDOWN', 'ARROWLEFT', 'ARROWRIGHT', 'TAB', 'ENTER', 'SPACE', 'ESCAPE', 'HOME', 'END', 'PAGEUP', 'PAGEDOWN']
  let currentFocusedElement = null;
  let mouseClick = null;

  window.addEventListener('keydown', (event) => {
    if(navKeys.includes(event.code.toUpperCase())) {
      mouseClick = false;
    }
  });

  window.addEventListener('mousedown', (event) => {
    mouseClick = true;
  });

  window.addEventListener('focus', () => {
    if (currentFocusedElement) currentFocusedElement.classList.remove('focused');

    if (mouseClick) return;

    currentFocusedElement = document.activeElement;
    currentFocusedElement.classList.add('focused');

  }, true);
}

/**
 * Prepares transition to animate between display: none and display: block
 * @param {HTMLElement} element 
 */
const prepareTransition = (element) => {
  element.addEventListener('transitionend', () => element.classList.remove('is-transitioning'))

  // check the various CSS properties to see if a duration has been set
  var cl = ["transition-duration", "-moz-transition-duration", "-webkit-transition-duration", "-o-transition-duration"];
  let duration = 0;
  const computedStyles = getComputedStyle(element)
  cl.forEach((prop) => duration || (duration = parseFloat(computedStyles.getPropertyValue(prop))));

  // if I have a duration then add the class
  if (duration != 0) {
    element.classList.add('is-transitioning');
    element.offsetWidth; // check offsetWidth to force the style rendering
  }
}


/**
 * _.defaultTo from lodash
 * Checks `value` to determine whether a default value should be returned in
 * its place. The `defaultValue` is returned if `value` is `NaN`, `null`,
 * or `undefined`.
 * Source: https://github.com/lodash/lodash/blob/master/defaultTo.js
 *
 * @param {*} value - Value to check
 * @param {*} defaultValue - Default value
 * @returns {*} - Returns the resolved value
 */
const defaultTo = (value, defaultValue) => {
  return (value == null || value !== value) ? defaultValue : value
}
 
/**
 * Format money values based on your shop currency settings
 * @param  {Number|string} cents - value in cents or dollar amount e.g. 300 cents
 * or 3.00 dollars
 * @param  {String} format - shop money_format setting
 * @return {String} value - formatted value
 */
const formatMoney = (cents, format) => {
  if (typeof cents === 'string') {
    cents = cents.replace('.', '');
  }
  var value = '';
  var placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
  var formatString = (format || '${{amount}}');

  function formatWithDelimiters(number, precision, thousands, decimal) {
    precision = defaultTo(precision, 2);
    thousands = defaultTo(thousands, ',');
    decimal = defaultTo(decimal, '.');

    if (isNaN(number) || number == null) {
      return 0;
    }

    number = (number / 100.0).toFixed(precision);

    var parts = number.split('.');
    var dollarsAmount = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
    var centsAmount = parts[1] ? (decimal + parts[1]) : '';

    return dollarsAmount + centsAmount;
  }

  switch (formatString.match(placeholderRegex)[1]) {
    case 'amount':
      value = formatWithDelimiters(cents, 2);
      break;
    case 'amount_no_decimals':
      value = formatWithDelimiters(cents, 0);
      break;
    case 'amount_with_space_separator':
      value = formatWithDelimiters(cents, 2, ' ', '.');
      break;
    case 'amount_no_decimals_with_comma_separator':
      value = formatWithDelimiters(cents, 0, ',', '.');
      break;
    case 'amount_no_decimals_with_space_separator':
      value = formatWithDelimiters(cents, 0, ' ');
      break;
  }

  return formatString.replace(placeholderRegex, value);
}

function pauseAllMedia() {
  document.querySelectorAll('.js-youtube').forEach((video) => {
    video.contentWindow.postMessage('{"event":"command","func":"' + 'pauseVideo' + '","args":""}', '*');
  });
  document.querySelectorAll('.js-vimeo').forEach((video) => {
    video.contentWindow.postMessage('{"method":"pause"}', '*');
  });
  document.querySelectorAll('video').forEach((video) => video.pause());
  document.querySelectorAll('product-model').forEach((model) => {
    if (model.modelViewerUI) model.modelViewerUI.pause();
  });
}

function removeTrapFocus(elementToFocus = null) {
  document.removeEventListener('focusin', trapFocusHandlers.focusin);
  document.removeEventListener('focusout', trapFocusHandlers.focusout);
  document.removeEventListener('keydown', trapFocusHandlers.keydown);

  if (elementToFocus) elementToFocus.focus();
}

function onKeyUpEscape(event) {
  if (event.code.toUpperCase() !== 'ESCAPE') return;

  const openDetailsElement = event.target.closest('details[open]');
  if (!openDetailsElement) return;

  const summaryElement = openDetailsElement.querySelector('summary');
  openDetailsElement.removeAttribute('open');
  summaryElement.focus();
}

class QuantityInput extends HTMLElement {
  constructor() {
    super();
    this.input = this.querySelector('input');
    this.changeEvent = new Event('change', { bubbles: true })

    this.querySelectorAll('button').forEach(
      (button) => button.addEventListener('click', this.onButtonClick.bind(this))
    );
  }

  onButtonClick(event) {
    event.preventDefault();
    const previousValue = this.input.value;

    event.target.name === 'plus' ? this.input.stepUp() : this.input.stepDown();
    if (previousValue !== this.input.value) this.input.dispatchEvent(this.changeEvent);
  }
}

customElements.define('quantity-input', QuantityInput);

function debounce(fn, wait) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), wait);
  };
}

const serializeForm = form => {
  const obj = {};
  const formData = new FormData(form);

  for (const key of formData.keys()) {
    const regex = /(?:^(properties\[))(.*?)(?:\]$)/;

    if (regex.test(key)) {
      obj.properties = obj.properties || {};
      obj.properties[regex.exec(key)[2]] = formData.get(key);
    } else {
      obj[key] = formData.get(key);
    }
  }

  return JSON.stringify(obj);
};

function fetchConfig(type = 'json') {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': `application/${type}` }
  };
}

/*
 * Shopify Common JS
 *
 */
if ((typeof window.Shopify) == 'undefined') {
  window.Shopify = {};
}

Shopify.bind = function(fn, scope) {
  return function() {
    return fn.apply(scope, arguments);
  }
};

Shopify.setSelectorByValue = function(selector, value) {
  for (var i = 0, count = selector.options.length; i < count; i++) {
    var option = selector.options[i];
    if (value == option.value || value == option.innerHTML) {
      selector.selectedIndex = i;
      return i;
    }
  }
};

Shopify.addListener = function(target, eventName, callback) {
  target.addEventListener ? target.addEventListener(eventName, callback, false) : target.attachEvent('on'+eventName, callback);
};

Shopify.postLink = function(path, options) {
  options = options || {};
  var method = options['method'] || 'post';
  var params = options['parameters'] || {};

  var form = document.createElement("form");
  form.setAttribute("method", method);
  form.setAttribute("action", path);

  for(var key in params) {
    var hiddenField = document.createElement("input");
    hiddenField.setAttribute("type", "hidden");
    hiddenField.setAttribute("name", key);
    hiddenField.setAttribute("value", params[key]);
    form.appendChild(hiddenField);
  }
  document.body.appendChild(form);
  form.submit();
  document.body.removeChild(form);
};

Shopify.CountryProvinceSelector = function(country_domid, province_domid, options) {
  this.countryEl         = document.getElementById(country_domid);
  this.provinceEl        = document.getElementById(province_domid);
  this.provinceContainer = document.getElementById(options['hideElement'] || province_domid);

  Shopify.addListener(this.countryEl, 'change', Shopify.bind(this.countryHandler,this));

  this.initCountry();
  this.initProvince();
};

Shopify.CountryProvinceSelector.prototype = {
  initCountry: function() {
    var value = this.countryEl.getAttribute('data-default');
    Shopify.setSelectorByValue(this.countryEl, value);
    this.countryHandler();
  },

  initProvince: function() {
    var value = this.provinceEl.getAttribute('data-default');
    if (value && this.provinceEl.options.length > 0) {
      Shopify.setSelectorByValue(this.provinceEl, value);
    }
  },

  countryHandler: function(e) {
    var opt       = this.countryEl.options[this.countryEl.selectedIndex];
    var raw       = opt.getAttribute('data-provinces');
    var provinces = JSON.parse(raw);

    this.clearOptions(this.provinceEl);
    if (provinces && provinces.length == 0) {
      this.provinceContainer.style.display = 'none';
    } else {
      for (var i = 0; i < provinces.length; i++) {
        var opt = document.createElement('option');
        opt.value = provinces[i][0];
        opt.innerHTML = provinces[i][1];
        this.provinceEl.appendChild(opt);
      }

      this.provinceContainer.style.display = "";
    }
  },

  clearOptions: function(selector) {
    while (selector.firstChild) {
      selector.removeChild(selector.firstChild);
    }
  },

  setOptions: function(selector, values) {
    for (var i = 0, count = values.length; i < values.length; i++) {
      var opt = document.createElement('option');
      opt.value = values[i];
      opt.innerHTML = values[i];
      selector.appendChild(opt);
    }
  }
};

class MenuDrawer extends HTMLElement {
  constructor() {
    super();

    this.mainDetailsToggle = this.querySelector('details');
    const summaryElements = this.querySelectorAll('summary');
    this.addAccessibilityAttributes(summaryElements);

    if (navigator.platform === 'iPhone') document.documentElement.style.setProperty('--viewport-height', `${window.innerHeight}px`);

    this.addEventListener('keyup', this.onKeyUp.bind(this));
    this.addEventListener('focusout', this.onFocusOut.bind(this));
    this.bindEvents();
  }

  bindEvents() {
    this.querySelectorAll('summary').forEach(summary => summary.addEventListener('click', this.onSummaryClick.bind(this)));
    this.querySelectorAll('button').forEach(button => button.addEventListener('click', this.onCloseButtonClick.bind(this)));
  }

  addAccessibilityAttributes(summaryElements) {
    summaryElements.forEach(element => {
      element.setAttribute('role', 'button');
      element.setAttribute('aria-expanded', false);
      element.setAttribute('aria-controls', element.nextElementSibling.id);
    });
  }

  onKeyUp(event) {
    if(event.code.toUpperCase() !== 'ESCAPE') return;

    const openDetailsElement = event.target.closest('details[open]');
    if(!openDetailsElement) return;

    openDetailsElement === this.mainDetailsToggle ? this.closeMenuDrawer(this.mainDetailsToggle.querySelector('summary')) : this.closeSubmenu(openDetailsElement);
  }

  onSummaryClick(event) {
    const summaryElement = event.currentTarget;
    const detailsElement = summaryElement.parentNode;
    const isOpen = detailsElement.hasAttribute('open');

    if (detailsElement === this.mainDetailsToggle) {
      if(isOpen) event.preventDefault();
      isOpen ? this.closeMenuDrawer(summaryElement) : this.openMenuDrawer(summaryElement);
    } else {
      trapFocus(summaryElement.nextElementSibling, detailsElement.querySelector('button'));

      setTimeout(() => {
        detailsElement.classList.add('menu-opening');
      });
    }
  }

  openMenuDrawer(summaryElement) {
    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });
    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }

  closeMenuDrawer(event, elementToFocus = false) {
    if (event !== undefined) {
      this.mainDetailsToggle.classList.remove('menu-opening');
      this.mainDetailsToggle.querySelectorAll('details').forEach(details =>  {
        details.removeAttribute('open');
        details.classList.remove('menu-opening');
      });
      this.mainDetailsToggle.querySelector('summary').setAttribute('aria-expanded', false);
      document.body.classList.remove(`overflow-hidden-${this.dataset.breakpoint}`);
      removeTrapFocus(elementToFocus);
      this.closeAnimation(this.mainDetailsToggle);
    }
  }

  onFocusOut(event) {
    setTimeout(() => {
      if (this.mainDetailsToggle.hasAttribute('open') && !this.mainDetailsToggle.contains(document.activeElement)) this.closeMenuDrawer();
    });
  }

  onCloseButtonClick(event) {
    const detailsElement = event.currentTarget.closest('details');
    this.closeSubmenu(detailsElement);
  }

  closeSubmenu(detailsElement) {
    detailsElement.classList.remove('menu-opening');
    removeTrapFocus();
    this.closeAnimation(detailsElement);
  }

  closeAnimation(detailsElement) {
    let animationStart;

    const handleAnimation = (time) => {
      if (animationStart === undefined) {
        animationStart = time;
      }

      const elapsedTime = time - animationStart;

      if (elapsedTime < 400) {
        window.requestAnimationFrame(handleAnimation);
      } else {
        detailsElement.removeAttribute('open');
        if (detailsElement.closest('details[open]')) {
          trapFocus(detailsElement.closest('details[open]'), detailsElement.querySelector('summary'));
        }
      }
    }

    window.requestAnimationFrame(handleAnimation);
  }
}

customElements.define('menu-drawer', MenuDrawer);

class HeaderDrawer extends MenuDrawer {
  constructor() {
    super();
  }

  openMenuDrawer(summaryElement) {
    this.header = this.header || document.getElementById('shopify-section-header');
    this.borderOffset = this.borderOffset || this.closest('.header-wrapper').classList.contains('header-wrapper--border-bottom') ? 1 : 0;
    document.documentElement.style.setProperty('--header-bottom-position', `${parseInt(this.header.getBoundingClientRect().bottom - this.borderOffset)}px`);

    setTimeout(() => {
      this.mainDetailsToggle.classList.add('menu-opening');
    });

    summaryElement.setAttribute('aria-expanded', true);
    trapFocus(this.mainDetailsToggle, summaryElement);
    document.body.classList.add(`overflow-hidden-${this.dataset.breakpoint}`);
  }
}

customElements.define('header-drawer', HeaderDrawer);

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.querySelector('[id^="ModalClose-"]').addEventListener(
      'click',
      this.hide.bind(this)
    );
    this.addEventListener('keyup', (event) => {
      if (event.code.toUpperCase() === 'ESCAPE') this.hide();
    });
    if (this.classList.contains('media-modal')) {
      this.addEventListener('pointerup', (event) => {
        if (event.pointerType === 'mouse' && !event.target.closest('deferred-media, product-model')) this.hide();
      });
    } else {
      this.addEventListener('click', (event) => {
        if (event.target.nodeName === 'MODAL-DIALOG') this.hide();
      });
    }
  }

  show(opener) {
    this.openedBy = opener;
    const popup = this.querySelector('.template-popup');
    document.body.classList.add('overflow-hidden');
    this.setAttribute('open', '');
    if (popup) popup.loadContent();
    trapFocus(this, this.querySelector('[role="dialog"]'));
    window.pauseAllMedia();
  }

  hide() {
    document.body.classList.remove('overflow-hidden');
    this.removeAttribute('open');
    removeTrapFocus(this.openedBy);
    window.pauseAllMedia();
  }
}
customElements.define('modal-dialog', ModalDialog);

class ModalOpener extends HTMLElement {
  constructor() {
    super();

    const button = this.querySelector('button');

    if (!button) return;
    button.addEventListener('click', () => {
      const modal = document.querySelector(this.getAttribute('data-modal'));
      if (modal) modal.show(button);
    });
  }
}
customElements.define('modal-opener', ModalOpener);

class DeferredMedia extends HTMLElement {
  constructor() {
    super();
    const poster = this.querySelector('[id^="Deferred-Poster-"]');
    if (!poster) return;
    poster.addEventListener('click', this.loadContent.bind(this));
  }

  loadContent() {
    window.pauseAllMedia();
    if (!this.getAttribute('loaded')) {
      const content = document.createElement('div');
      content.appendChild(this.querySelector('template').content.firstElementChild.cloneNode(true));

      this.setAttribute('loaded', true);
      this.appendChild(content.querySelector('video, model-viewer, iframe')).focus();
    }
  }
}

customElements.define('deferred-media', DeferredMedia);

class SliderComponent extends HTMLElement {
  constructor() {
    super();
    this.slider = this.querySelector('ul');
    this.sliderItems = this.querySelectorAll('li');
    this.pageCount = this.querySelector('.slider-counter--current');
    this.pageTotal = this.querySelector('.slider-counter--total');
    this.prevButton = this.querySelector('button[name="previous"]');
    this.nextButton = this.querySelector('button[name="next"]');

    if (!this.slider || !this.nextButton) return;

    const resizeObserver = new ResizeObserver(entries => this.initPages());
    resizeObserver.observe(this.slider);

    this.slider.addEventListener('scroll', this.update.bind(this));
    this.prevButton.addEventListener('click', this.onButtonClick.bind(this));
    this.nextButton.addEventListener('click', this.onButtonClick.bind(this));
  }

  initPages() {
    const sliderItemsToShow = Array.from(this.sliderItems).filter(element => element.clientWidth > 0);
    this.sliderLastItem = sliderItemsToShow[sliderItemsToShow.length - 1];
    if (sliderItemsToShow.length === 0) return;
    this.slidesPerPage = Math.floor(this.slider.clientWidth / sliderItemsToShow[0].clientWidth);
    this.totalPages = sliderItemsToShow.length - this.slidesPerPage + 1;
    this.update();
  }

  update() {
    if (!this.pageCount || !this.pageTotal) return;
    this.currentPage = Math.round(this.slider.scrollLeft / this.sliderLastItem.clientWidth) + 1;

    if (this.currentPage === 1) {
      this.prevButton.setAttribute('disabled', true);
    } else {
      this.prevButton.removeAttribute('disabled');
    }

    if (this.currentPage === this.totalPages) {
      this.nextButton.setAttribute('disabled', true);
    } else {
      this.nextButton.removeAttribute('disabled');
    }

    this.pageCount.textContent = this.currentPage;
    this.pageTotal.textContent = this.totalPages;
  }

  onButtonClick(event) {
    event.preventDefault();
    const slideScrollPosition = event.currentTarget.name === 'next' ? this.slider.scrollLeft + this.sliderLastItem.clientWidth : this.slider.scrollLeft - this.sliderLastItem.clientWidth;
    this.slider.scrollTo({
      left: slideScrollPosition
    });
  }
}

customElements.define('slider-component', SliderComponent);

class VariantSelects extends HTMLElement {
  constructor() {
    super();
    this.addEventListener('change', this.onVariantChange);
  }

  onVariantChange() {
    this.updateOptions();
    this.updateMasterId();
    this.toggleAddButton(true, '', false);
    this.updatePickupAvailability();
    this.removeErrorMessage();

    if (!this.currentVariant) {
      this.toggleAddButton(true, '', true);
      this.setUnavailable();
    } else {
      this.updateMedia();
      this.updateURL();
      this.updateVariantInput();
      this.renderProductInfo();
    }
  }

  updateOptions() {
    this.options = Array.from(this.querySelectorAll('select'), (select) => select.value);
  }

  updateMasterId() {
    this.currentVariant = this.getVariantData().find((variant) => {
      return !variant.options.map((option, index) => {
        return this.options[index] === option;
      }).includes(false);
    });
  }

  updateMedia() {
    if (!this.currentVariant) return;
    if (!this.currentVariant.featured_media) return;
    const newMedia = document.querySelector(
      `[data-media-id="${this.dataset.section}-${this.currentVariant.featured_media.id}"]`
    );

    if (!newMedia) return;
    const modalContent = document.querySelector(`#ProductModal-${this.dataset.section} .product-media-modal__content`);
    const newMediaModal = modalContent.querySelector( `[data-media-id="${this.currentVariant.featured_media.id}"]`);
    const parent = newMedia.parentElement;
    if (parent.firstChild == newMedia) return;
    modalContent.prepend(newMediaModal);
    parent.prepend(newMedia);
    this.stickyHeader = this.stickyHeader || document.querySelector('sticky-header');
    if(this.stickyHeader) {
      this.stickyHeader.dispatchEvent(new Event('preventHeaderReveal'));
    }
    window.setTimeout(() => { parent.querySelector('li.product__media-item').scrollIntoView({behavior: "smooth"}); });
  }

  updateURL() {
    if (!this.currentVariant || this.dataset.updateUrl === 'false') return;
    window.history.replaceState({ }, '', `${this.dataset.url}?variant=${this.currentVariant.id}`);
  }

  updateVariantInput() {
    const productForms = document.querySelectorAll(`#product-form-${this.dataset.section}, #product-form-installment`);
    productForms.forEach((productForm) => {
      const input = productForm.querySelector('input[name="id"]');
      input.value = this.currentVariant.id;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  updatePickupAvailability() {
    const pickUpAvailability = document.querySelector('pickup-availability');
    if (!pickUpAvailability) return;

    if (this.currentVariant && this.currentVariant.available) {
      pickUpAvailability.fetchAvailability(this.currentVariant.id);
    } else {
      pickUpAvailability.removeAttribute('available');
      pickUpAvailability.innerHTML = '';
    }
  }

  removeErrorMessage() {
    const section = this.closest('section');
    if (!section) return;

    const productForm = section.querySelector('product-form');
    if (productForm) productForm.handleErrorMessage();
  }

  renderProductInfo() {
    fetch(`${this.dataset.url}?variant=${this.currentVariant.id}&section_id=${this.dataset.section}`)
      .then((response) => response.text())
      .then((responseText) => {
        const id = `price-${this.dataset.section}`;
        const html = new DOMParser().parseFromString(responseText, 'text/html')
        const destination = document.getElementById(id);
        const source = html.getElementById(id);

        if (source && destination) destination.innerHTML = source.innerHTML;

        const price = document.getElementById(`price-${this.dataset.section}`);

        if (price) price.classList.remove('visibility-hidden');
        this.toggleAddButton(!this.currentVariant.available, window.variantStrings.soldOut);
      });
  }

  toggleAddButton(disable = true, text, modifyClass = true) {
    const productForm = document.getElementById(`product-form-${this.dataset.section}`);
    if (!productForm) return;
    const addButton = productForm.querySelector('[name="add"]');
    const addButtonText = productForm.querySelector('[name="add"] > span');

    if (!addButton) return;

    if (disable) {
      addButton.setAttribute('disabled', true);
      if (text) addButtonText.textContent = text;
    } else {
      addButton.removeAttribute('disabled');
      addButtonText.textContent = window.variantStrings.addToCart;
    }

    if (!modifyClass) return;
  }

  setUnavailable() {
    const button = document.getElementById(`product-form-${this.dataset.section}`);
    const addButton = button.querySelector('[name="add"]');
    const addButtonText = button.querySelector('[name="add"] > span');
    const price = document.getElementById(`price-${this.dataset.section}`);
    if (!addButton) return;
    addButtonText.textContent = window.variantStrings.unavailable;
    if (price) price.classList.add('visibility-hidden');
  }

  getVariantData() {
    this.variantData = this.variantData || JSON.parse(this.querySelector('[type="application/json"]').textContent);
    return this.variantData;
  }
}

customElements.define('variant-selects', VariantSelects);

class VariantRadios extends VariantSelects {
  constructor() {
    super();
  }

  updateOptions() {
    const fieldsets = Array.from(this.querySelectorAll('fieldset'));
    this.options = fieldsets.map((fieldset) => {
      return Array.from(fieldset.querySelectorAll('input')).find((radio) => radio.checked).value;
    });
  }
}

customElements.define('variant-radios', VariantRadios);


// =====================================================================================
// FOCUSABLE WIDGET
// =====================================================================================
/**
 * Focusable Widget Class
 * --------------------------------------------------------------
 * @summary High-level general Class for creating focusable widgets
 * (drawers, modals, etc). Provides css-based open/close/toggle
 * functionality, as well as programatically manipulation of the widget,
 * and handles a11y.
 *
 * @usage class widget extends FocusableWidget {...}
 *
 * @emits focusable-widget:open on document
 * @emits focusable-widget:close on document
 * @emits <config.name>:open on document
 * @emits <config.name>:close on document
 * @emits <#id>:open on document
 * @emits <#id>:close on document
 * @emits open on element
 * @emits close on element
 *
 * The following parameters are attributes that any children of FocusableWidget
 * element accepts
 * @param id - required
 * @param open - Query Selector to all the widget's open triggers
 * @param close - Query Selector to all the widget's close triggers
 * @param [open-class] - Optional class to add to widget when opened
 * @param [body-class] - Optional class to add to body when opened
 * @class
 */
 class FocusableWidget extends HTMLElement {
  /**
   * Creates Focusable Widget
   * @param {Object} config - Configuration object
   * @param {String} config.name - widget name, used for classnames and for providing useful error messages
   * @param {String} config.background - query selector to widget background
   * @param {Array} [config.widgetOpenClasses] - optional classes to add to widget when opened
   * @param {Array} [config.bodyOpenClasses] - optional classes to add to body when widget is opened
   * @param {Object} [config.attributes] - optional attributes to add to element upon initialization.
   *                                       example: {'data-custom-attr': true }
   */
  constructor(config = {}) {
    super();

    if (!config.name)
      throw new Error(`Focusable Widget(${config.name}) must have a name`);
    if (!this.id) throw new Error(`${config.name} must have an id`);
    if (!config.background)
      throw new Error(
        `Focusable Widget(${config.name}) must have a background`
      );

    /**
     * Save client config for reinit method
     * @private
     */
    this._clientConfig = config;

    this._init(config);
  }

  /**
   * Opens widget. If already opened, does nothing.
   * @usage document.querySelector('[js-my-widget]').open()
   * @returns {HTMLElement} widget
   * @public
   */
  open() {
    if (this._isOpen) return;
    this._closeFocusableWidgets();
    return this.toggle();
  }

  /**
   * Closes widget. If already closed, does nothing.
   * @usage document.querySelector('[js-my-widget]').close()
   * @returns {HTMLElement} widget
   * @public
   */
  close() {
    if (!this._isOpen) return;
    return this.toggle();
  }

  /**
   * Toggles widget.
   * @usage document.querySelector('[js-my-widget]').toggle()
   * @returns {HTMLElement} widget
   * @public
   */
  toggle() {
    prepareTransition(this);
    this._toggleClasses();
    this._toggleAccessibilityAttributes();

    if (!this._isOpen) {
      trapFocus(
        this,
        this.querySelector(this.getAttribute("close"))
      );
      this._bindEvents();
      this._dispatchEvents(this._events.open, ['open']);
    } else {
      removeTrapFocus(this);
      this._unbindEvents();
      this._dispatchEvents(this._events.close, ['close']);
    }

    this._isOpen = !this._isOpen;
    return this;
  }

  /**
   * Reinitializes the widget
   * @usage document.querySelector('[js-my-widget]').reinitWidget()
   * @public
   */
  reinitWidget() {
    this._init(this._clientConfig);
  }

  /**
   * @usage const open = document.querySelector('[js-my-widget]').isOpen;
   * @type {Boolean}
   * @public
   */
  get isOpen() {
    return this._isOpen;
  }

  // ======================================================== PRIVATE METHODS

  /**
   * Initializes entire logic and state
   * @param {Object} config - constructor config param
   * @private
   */
  _init({
    name,
    background,
    widgetOpenClasses = [],
    bodyOpenClasses = [],
    attributes = {},
  }) {
    /**
     * Widget name
     * @type {Boolean} @private
     * */
    this._name = name;

    /** @type {Boolean} @private */
    this._isOpen = false;

    /**
     * @property {String} background - widget background selector
     * @property {String} open - selector to all open triggers
     * @property {String} close - selector to all close triggers
     * @private
     */
    this._selectors = {
      background,
      open: this.getAttribute("open"),
      close: this.getAttribute("close"),
    };

    /**
     * Nodes the widget depends on
     * @property {HTMLElement} background - widget background
     * @private
     */
    this._nodes = {
      background: document.querySelector(this._selectors.background),
    };

    /**
     * Widget events fired on actions to document
     * @private
     */
    this._events = {
      open: ["focusable-widget:open", `${name}:open`, `${this.id}:open`],
      close: ["focusable-widget:close", `${name}:close`, `${this.id}:close`],
    };

    /**
     * Private Widget configuration
     * @property {HTMLAllCollection} open - open triggers
     * @property {HTMLAllCollection} close - close triggers
     * @property {Array} attributes - attributes added to widget upon initialization
     * @property {Array} widgetOpenClasses - classes added to widget when opened
     * @property {String} bodyOpenClasses - classes added to body when widget opened
     * @private
     */
    this._config = {
      open: document.querySelectorAll(this._selectors.open),
      close: document.querySelectorAll(this._selectors.close),
      attributes: {
        "data-focusable-widget": "true",
        "aria-hidden": "true",
        tabindex: 0,
        ...attributes,
      },
      widgetOpenClasses: ["open", this.getAttribute("open-class")].concat(
        widgetOpenClasses
      ),
      bodyOpenClasses: [
        "js-focusable-widget-open",
        `js-${name}-open`,
        this.getAttribute("body-open-class"),
      ].concat(bodyOpenClasses),
    };

    this._validateConfig();
    this._addAccessibilityAttributes();
    this._setupListeners();
  }

  /**
   * Validates widget config, throwing useful errors if invalid
   * @private
   */
  _validateConfig() {
    if (!this._config.open || !this._config.open.length)
      console.warn(`WARN: ${this._name}: no open triggers found. Check your ${this._name} 'open' attribute, or add a trigger (if needed)`)

    if (!this._config.close || !this._config.close.length)
      throw new Error(
        `${this._name}: invalid close trigger selector, no elements found. Check your ${this._name} 'close' attribute`
      );
  }

  /**
   * Setups initialization event listeners
   * @private
   */
  _setupListeners() {
    this._config.open.forEach((open) =>
      open.addEventListener("click", this._open.bind(this))
    );
    this._config.close.forEach((close) =>
      close.addEventListener("click", this._close.bind(this))
    );
    this.addEventListener("click", (e) => e.stopPropagation());
  }

  /**
   * Internal open wrapper, to keep our public methods clean, internally deals with event object
   * @param {object} event
   * @private
   */
  _open(event) {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.open();
  }

  /**
   * Internal close wrapper, to keep our public methods clean, internally deals with event object
   * @param {object} event
   * @private
   */
  _close = (event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    this.close();
  }

  /**
   * Closes any open focusable widgets
   * @private
   */
  _closeFocusableWidgets() {
    const openWidgets = document.querySelectorAll(
      "[data-focusable-widget].open"
    );
    openWidgets.forEach((widget) => widget.close());
  }

  /**
   * Dispatches an array of custom events on document
   * @param {Array} events - this._events.<event>
   */
  _dispatchEvents(globalEvents, elementEvents) {
    globalEvents.forEach(e => document.dispatchEvent(new CustomEvent(e)))
    if (elementEvents && elementEvents.length) 
    elementEvents.forEach(e => this.dispatchEvent(new CustomEvent(e)))
  }

  /**
   * Binds events needed for opened widget
   * @private
   */
  _bindEvents() {
    document.addEventListener("keyup", this._onKeyUp);
    this._nodes.background.addEventListener("click", this._close);
    this._nodes.background.addEventListener("touchmove", this._onTouchMove);
  }

  /**
   * Unbinds events added when widget was opened
   * @private
   */
  _unbindEvents() {
    document.removeEventListener("keyup", this._onKeyUp);
    this._nodes.background.removeEventListener("click", this._close);
    this._nodes.background.removeEventListener(
      "touchmove",
      this._onTouchMove
    );
  }

  /**
   * Toggles classes based on current widget state
   * @private
   */
  _toggleClasses() {
    if (this._isOpen) {
      // Body classes
      this._config.bodyOpenClasses.forEach((className) => {
        if (!className) return;
        document.body.classList.remove(className);
      });

      // Widget Classes
      this._config.widgetOpenClasses.forEach((className) => {
        if (!className) return;
        this.classList.remove(className);
      });
    } else {
      // Body classes
      this._config.bodyOpenClasses.forEach((className) => {
        if (!className) return;
        document.body.classList.add(className);
      });

      // Widget Classes
      this._config.widgetOpenClasses.forEach((className) => {
        if (!className) return;
        this.classList.add(className);
      });
    }
  }

  /**
   * Toggles a11y attributes based on current widget state
   * @private
   */
  _toggleAccessibilityAttributes() {
    if (this._isOpen) {
      this.setAttribute("aria-hidden", "true");
      this.setAttribute("tabindex", "-1");
      this._config.open.forEach((open) =>
        open.setAttribute("aria-expanded", "false")
      );
      this._config.close.forEach((close) =>
        close.setAttribute("aria-expanded", "false")
      );
    } else {
      this.setAttribute("aria-hidden", "false");
      this.setAttribute("tabindex", "0");
      this._config.open.forEach((open) =>
        open.setAttribute("aria-expanded", "true")
      );
      this._config.close.forEach((close) =>
        close.setAttribute("aria-expanded", "true")
      );
    }
  }

  /**
   * Adds a11y attributes to widget and triggers
   * @private
   */
  _addAccessibilityAttributes() {
    const addA11yAttributes = (el) => {
      el.setAttribute("tabindex", "0");
      el.setAttribute("aria-expanded", "false");
      el.setAttribute("aria-controls", this.id);
    };

    for (const attr in this._config.attributes) {
      this.setAttribute(attr, this._config.attributes[attr]);
    }
    this._config.open.forEach(addA11yAttributes);
    this._config.close.forEach(addA11yAttributes);
  }

  /**
   * Closes widget on esc key press
   * @param {object} event
   * @private
   */
  _onKeyUp = (event) => {
    if (event.code.toUpperCase() !== "ESCAPE") return;
    this.close();
  }

  /**
   * Lock scrolling on mobile
   * @returns {Boolean}
   * @private
   */
  _onTouchMove = () => {
    return false;
  }
}

// =====================================================================================
// DRAWERS
// =====================================================================================
/**
 * Drawer Component
 * --------------------------------------------------------------------
 * @summary drawer custom element component, must have an id, position and
 * specified open/close triggers. There must be a close trigger inside
 * the drawer container.
 *
 * See parent focusable-widget.js events and public methods for complete documentation.
 *
 * @usage <component-drawer id="MyDrawer" position="left" open="[open-my-drawer]" close="[close-my-drawer]">CONTENT</component-drawer>
 * @usage to manipulate programatically: document.querySelector('#MyDrawer').open();
 *
 * @emits drawer:open on document
 * @emits drawer:close on document
 * @emits <#id>:open on document
 * @emits <#id>:close on document
 * @emits open on element
 * @emits close on element
 * 
 * The following parameters are attributes that the <component-drawer> element takes
 * @param id - required
 * @param position - 'left', 'right', 'top', 'bottom'
 * @param open - Query Selector to all the drawer's open triggers
 * @param close - Query Selector to all the drawer's close triggers
 * @param [open-class] - Optional class to add to drawer when opened
 * @param [body-class] - Optional class to add to body when opened
 * @module
 *
 * If you must extend the drawer's functionality, use inheritance:
 * class Ajaxcart extends Drawer {...}
 */
 class Drawer extends FocusableWidget {
  constructor() {
    super({
      name: "drawer",
      background: ".drawer-background"
    });

    const position = this.getAttribute("position");
    if (!position) throw new Error("drawer must have position attribute");

    /** @type {string} @private */
    this._position = position;

    // Add position class to body when drawer opens
    this._config.bodyOpenClasses.push(`js-drawer-${position}-open`);
  }

  /**
   * Drawer position: 'top', 'right', 'bottom', 'left'
   * @usage const position = document.querySelector('[js-my-drawer]').position;
   * @type {string}
   * @public
   */
  get position() {
    return this._position;
  }
}

customElements.define("component-drawer", Drawer);


// =====================================================================================
// MODALS
// =====================================================================================
/**
 * Modal Component
 * --------------------------------------------------------------------
 * @summary modal custom element component, must have an id and
 * specified open/close triggers. There must be a close trigger inside
 * the modal container.
 *
 * See parent focusable-widget.js events and public methods for complete documentation.
 *
 * @usage
 * <component-modal id="MyModal" class="{{styling classes}}" open="[open-my-modal]" close="[close-my-modal]">
 *   CONTENTS, make sure to include a close button in here.
 * </component-modal>
 * @usage to manipulate programatically: document.querySelector('#MyModal').open();
 *
 * @emits modal:open on document
 * @emits modal:close on document
 * @emits <#id>:open on document
 * @emits <#id>:close on document
 * @emits open on element
 * @emits close on element
 * 
 * The following parameters are attributes that the <modal> element takes
 * @param id - required
 * @param open - Query Selector to all the drawer's open triggers
 * @param close - Query Selector to all the drawer's close triggers
 * @param [open-class] - Optional class to add to drawer when opened
 * @param [body-class] - Optional class to add to body when opened
 */
 class Modal extends FocusableWidget {
  constructor() {
    super({
      name: "modal",
      background: ".modal-background",
    });

    // Add position class to body when drawer opens
    this._config.bodyOpenClasses.push(`js-modal-open`);
  }
}

customElements.define("component-modal", Modal);


// =====================================================================================
// CART API
// =====================================================================================
/**
 * CartAPI
 * ----------------------------------------------------
 * @sumary API to communicate with Shopify Ajax Cart.
 *
 * UPSELL: Depending on how the upsell is being handled on the project, when
 * adding a product to cart you may need to pass in the product tags and/or
 * the handle of the upsell product related to the product your adding to cart
 * using line item properties.
 * If the project is using product related upsell, pass the related upsell 
 * handle as a line item property -> properties: { upsell: { handle: 'upsell-related-handle' } }
 * If the project is using tagged upsell, pass the product tags as a line
 * item property -> properties: { upsell:  tag: 'upsell-tag'  }
 *
 * https://shopify.dev/api/ajax/reference/cart
 *
 * @namespace CartApi
 * 
 * @emits cart:add:before
 * @emits cart:add:complete @type {Object} @property {Object} item - line-item added
 * @emits cart:add:error @type {Object} @property {Object} error
 *
 * @emits cart:update:before
 * @emits cart:update:complete @type {Object} @property {Object} cart - updated cart
 * @emits cart:update:error @type {Object} @property {Object} error
 */
 class CartAPI {
  constructor() {
    /**
     * All event names emited by CartAPI
     * @property {Object} update - events emited when cart gets updated
     * @private
     */
    this._events = {
      update: {
        before: "cart:update:before",
        complete: "cart:update:complete",
        error: "cart:update:error",
      },
      fetch: {
        before: "cart:fetch:before",
        complete: "cart:fetch:complete",
        error: "cart:fetch:error",
      },
      add: {
        before: "cart:add:before",
        complete: "cart:add:complete",
        error: "cart:add:error",
      },
    };
  }

  /**
   * @usage const cart = await CartApi.get()
   * @fires cart:fetch:before
   * @fires cart:fetch:complete
   * @fires cart:fetch:error
   * @returns {Object} cart
   * @async @public
   */
  async get() {
    this._trigger(this._events.fetch.before);
    try {
      let response = await fetch("/cart.js");
      const cart = await response.json();
      this._trigger(this._events.fetch.complete, { cart });
      return cart;
    } catch (error) {
      this._trigger(this._events.fetch.error, { error });
      this._onError(error);
    }
  }

  /**
   * See file header for upsell integration using line item properties
   * @usage const res = await CartApi.add(data)
   * @fires cart:add:before
   * @fires cart:add:complete
   * @fires cart:add:error
   * @param {Object} data - ajax API data https://shopify.dev/api/ajax/reference/cart#post-cart-add-js
   * @returns {Object} API response
   * @async @public
   */
  async add(data) {
    this._trigger(this._events.add.before);
    try {
      let response = await fetch("/cart/add.js", {
        method: "POST",
        body: JSON.stringify(data),
        ...this._fetchConfig,
      });
      response = await response.json();
      if (response.status) throw response;
      this._trigger(this._events.add.complete, { item: response });
      return response;
    } catch (error) {
      this._trigger(this._events.add.error, { error });
      this._onError(error);
    }
  }

  /**
   * See file header for upsell integration using line item properties
   * @usage const res = await CartApi.addFromForm(form)
   * @fires cart:add:before
   * @fires cart:add:complete
   * @fires cart:add:error
   * @param {HTMLElement} form
   * @returns {Object} API response
   * @async @public
   */
  async addFromForm(form) {
    if (!form || !(form instanceof HTMLElement)) {
      console.error("Invalid form in CartAPI call");
      return;
    }

    this._trigger(this._events.add.before);
    try {
      let response = await fetch("/cart/add.js", {
        method: "POST",
        body: serializeForm(form),
        ...this._fetchConfig,
      });
      response = await response.json();
      if (response.status) throw response;
      this._trigger(this._events.add.complete, { item: response });
      return response;
    } catch (error) {
      this._trigger(this._events.add.error, { error });
      this._onError(error);
    }
  }

  /**
   * @usage const res = await CartApi.change(data)
   * @fires cart:update:before
   * @fires cart:update:complete
   * @fires cart:update:error
   * @param {Object} data - ajax api data https://shopify.dev/api/ajax/reference/cart#post-cart-change-js
   * @returns {Object} API response
   * @async @public
   */
  async change(data) {
    this._trigger(this._events.update.before);
    try {
      let response = await fetch("/cart/change.js", {
        method: "POST",
        body: JSON.stringify(data),
        ...this._fetchConfig,
      });
      response = await response.json();
      if (response.status) throw response;
      this._trigger(this._events.update.complete, { cart: response });
      return response;
    } catch (error) {
      this._trigger(this._events.update.error, { error });
      this._onError(error);
    }
  }

  /**
   * @usage const res = await CartApi.update(data)
   * @fires cart:update:before
   * @fires cart:update:complete
   * @fires cart:update:error
   * @param {String} data - ajax api data https://shopify.dev/api/ajax/reference/cart#post-cart-update-js
   * @returns {Object} - API response
   * @async @public
   */
  async update(data) {
    this._trigger(this._events.update.before);
    try {
      let response = await fetch("/cart/update.js", {
        method: "POST",
        body: JSON.stringify(data),
        ...this._fetchConfig,
      });
      response = await response.json();
      if (response.status) throw response;
      this._trigger(this._events.update.complete, { cart: response });
      return response;
    } catch (error) {
      this._trigger(this._events.update.error, { error });
      this._onError(error);
    }
  }

  /**
   * @usage const res = await CartApi.clear()
   * @fires cart:update:before
   * @fires cart:update:complete
   * @fires cart:update:error
   * @param {String} data - ajax api data
   * @returns {Object} - cart
   * @async @public
   */
  async clear() {
    this._trigger(this._events.update.before);
    try {
      let response = await fetch("/cart/clear.js", {
        method: "POST",
        ...this._fetchConfig,
      });
      response = await response.json();
      if (response.status) throw data;
      this._trigger(this._events.update.complete, { cart: response });
      return response;
    } catch (error) {
      this._trigger(this._events.update.error, { error });
      this._onError(error);
    }
  }

  // ========================================================== PRIVATE METHODS
  /** @private */
  _fetchConfig = {
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/javascript",
    },
  };

  /**
   * Handles API errors
   * @param {Object} error
   * @private
   */
  _onError(error) {
    console.error(
      `CartApi Error: 
        status: ${error.status}
        message: ${error.message}
        description ${error.description}`
    );
  }

  /**
   * Triggers event on document
   * @param {String} event - event type
   * @param {Object} data
   * @private
   */
  _trigger(event, data = {}) {
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
}

window.CartAPI = new CartAPI();



// =====================================================================================
// AJAXCART
// =====================================================================================
/**
 * Ajax Cart
 * ------------------------------------------------
 * @summary AjaxCart is a public class that holds an internal
 * vue instance. This vue instace holds all the logic of the cart.
 * The public class provides a way of interfacing with the ajaxcart.
 *
 * this._Ajaxcart is the vue app instance, and all its components can
 * be found in this._Components.
 * All the components markups can be found at cart-drawer.liquid. Once js kicks in,
 * all the components markup gets removed from the DOM, we only use them to get
 * the vue template. The only markup that stays on the DOM at all times is the
 * main ajaxcart vue instace <ajax-cart>
 */
 class AjaxCart extends HTMLElement {
  constructor() {
    super();

    /** @private Vue instance */
    this._Ajaxcart;

    this._selectors = {
      drawer: "[js-cart-drawer]",
      upsellData: "#AjaxCartUpsellData[js-upsell-data]",
      counter: "[js-cart-counter]",
    };

    /**
     * This internal events is how our public API communicates
     * with the internal vue instance
     * @private
     * */
    this._internalEvents = {
      fetch: "ajaxcart:fetch",
      open: "ajaxcart:open",
      close: "ajaxcart:close",
      refreshUpsell: "ajaxcart:upsell:refresh",
    };

    this._config = {
      shippingThreshold: this.dataset.shippingThreshold === "true",
      gift: this.dataset.gift === "true",
    };

    this._drawer = document.querySelector(this._selectors.drawer);
    this._initAjaxCart();
  }

  /**
   * Fetches the ajax cart
   * @usage document.querySelector('ajax-cart').fetch(false)
   * @param {Boolean} [openDrawer = true] wheter to open the drawer or not after fetching
   * @public
   */
  fetch(openDrawer = true) {
    this.dispatchEvent(
      new CustomEvent(this._internalEvents.fetch, {
        detail: { openDrawer },
      })
    );
  }

  /**
   * Opens the ajaxcart drawer
   * @usage document.querySelector('ajax-cart').open()
   * @param {Boolean} [fetch = true] by default fetches after opening
   * @public
   */
  open(fetch = true) {
    this.dispatchEvent(
      new CustomEvent(this._internalEvents.open, {
        detail: { fetch },
      })
    );
  }

  /**
   * Closes the ajaxcart drawer
   * @usage document.querySelector('ajax-cart').close()
   * @public
   */
  close() {
    this.dispatchEvent(new CustomEvent(this._internalEvents.close));
  }

  /**
   * Forces the upsell to refresh. Only works if vue instance has already
   * been mounted
   * @usage document.querySelector('ajax-cart').refreshUpsell()
   * @public
   */
  refreshUpsell() {
    this.dispatchEvent(new CustomEvent(this._internalEvents.refreshUpsell));
  }

  // =============================================================================
  //  Private
  // =============================================================================

  // ==========================================================
  //  Core Cart Logic
  // ==========================================================

  _initAjaxCart() {
    this._Ajaxcart = Vue.createApp(this._ajaxCartApp());
    this._registerComponents();
    this._Ajaxcart.mount("#AjaxCartTemplate");
    this.classList.remove("hidden");
    this._drawer.reinitWidget(); // Reinit widget because vue destroys nodes on mount
  }

  /**
   * Vue App instance, holds core logic
   * @private
   */
  _ajaxCartApp() {
    const AjaxCartClass = this;
    return {
      delimiters: ["${", "}"],

      data() {
        return {
          drawer: AjaxCartClass._drawer,
          shippingThreshold: AjaxCartClass._config.shippingThreshold,
          gift: AjaxCartClass._config.gift,
          cart: null,
          error: false,
          counter: document.querySelector(AjaxCartClass._selectors.counter),
          cartHeight: 0,
          loading: {
            cart: false,
            item: false,
          },
        };
      },

      computed: {
        /**
         * Creates an object where the keys are the handles of the items
         * in cart. This allows upsell to quickly tell which products
         * are already in cart before trying to fetch it
         * @returns {Object}
         */
        handlesInCart() {
          return this.cart.items.reduce(
            (handles, item) => ({ ...handles, [item.handle]: true }),
            {} // initial value
          );
        },
      },

      watch: {
        cart(newValue, oldValue) {
          if (newValue && !oldValue) this.$nextTick(this.updateCartHeight);
        },
      },

      updated() {
        // update cart counter
        if (!this.counter) return;
        if (!this.cart) this.counter.innerHTML = 0;
        this.counter.innerHTML = this.cart.item_count;
      },

      mounted() {
        const ajaxcart = document.querySelector("ajax-cart");

        /**
         * Class internal events.
         * Through this events, our public class methods interfaces with vue
         * internal instance
         */
        ajaxcart.addEventListener("ajaxcart:fetch", this.onFetch);

        ajaxcart.addEventListener("ajaxcart:open", this.onOpen);

        ajaxcart.addEventListener("ajaxcart:close", this.onClose);

        /**
         * Ajax Cart Drawer events.
         * Through this events, ajaxcart communicates with it's drawer.
         */
        document.addEventListener("CartDrawer:open", async () => {
          if (!this.cart) this.cart = await this.fetchCart();
        });

        document.addEventListener("CartDrawer:close", () => {
          if (this.error) this.error = false;
        });

        /**
         * Cart API events.
         * Through this events, ajaxcart knows when the cart has been updated
         * through the cart api and take actions accordingly.
         */
        document.addEventListener("cart:add:complete", this.onCartAddComplete);

        document.addEventListener(
          "cart:update:complete",
          this.onCartUpdateComplete
        );

        document.addEventListener("cart:update:error", this.onCartError);

        document.addEventListener("cart:add:error", this.onCartError);
      },

      methods: {
        async fetchCart() {
          this.loading.cart = true;
          const cart = await window.CartAPI.get();
          this.loading.cart = false;
          return cart;
        },

        async updateItemQuantity({ line, quantity }) {
          if (quantity < 0) return;
          this.loading.item = line - 1;
          const cart = await window.CartAPI.change({ line, quantity });
          if (cart) this.cart = cart;
          else this.cart = await this.fetchCart();
          this.loading.item = false;
        },

        async removeItem(line) {
          this.loading.item = line - 1;
          await this.updateItemQuantity({ line, quantity: 0 });
          this.loading.item = false;
        },

        async addToCart({ variantId, quantity }) {
          this.loading.cart = true;
          const item = await window.CartAPI.add({ id: variantId, quantity });
          this.loading.cart = false;
          return item;
        },

        /**
         * Open drawer if closed and updates state
         * @param {Object} param - event
         */
        async onCartUpdateComplete({ detail }) {
          const { cart } = detail;
          if (cart) this.cart = cart;
          else this.cart = await this.fetchCart();
          if (!this.drawer.isOpen) this.drawer.open();
        },

        /**
         * Open drawer if closed and refetches cart
         * @param {Object} param - event
         */
        async onCartAddComplete() {
          this.cart = await this.fetchCart();
          if (!this.drawer.isOpen) this.drawer.open();
        },

        /**
         * Handles ajaxcart:fetch event
         */
        async onFetch({ detail }) {
          const { openDrawer = false } = detail;
          this.cart = await this.fetchCart();
          if (openDrawer) this.drawer.open();
        },

        /**
         * Handles ajaxcart:open event
         * @param {Object} event
         */
        async onOpen({ detail }) {
          const { fetch = true } = detail;
          if (fetch) this.cart = await this.fetchCart();
          this.drawer.open();
        },

        /**
         * Handles ajaxcart:close event
         */
        onClose() {
          this.drawer.close();
        },

        /**
         * If a cart api error occured while ajax cart is opened, display error message
         * @param {Object} param - event
         */
        onCartError({ detail }) {
          const { error } = detail;
          if (!error) return;
          switch (error.status) {
            case "unprocessable_entity":
              this.error = error.message;
              return;
            default:
              this.error =
                "We apologize, an error occured when updating your cart.";
              return;
          }
        },

        /**
         * @param {Integer} money - money in cents
         * @returns {String} $99,99
         */
        formatMoney(money) {
          return formatMoney(money);
        },

        /**
         * Updates cart height based on cart header and footer
         */
        updateCartHeight() {
          const headerHeight = this.$refs.cartHeader.clientHeight;
          const footerHeight = this.$refs.cartFooter.clientHeight;
          this.cartHeight = `calc(100vh - ${
            (headerHeight + footerHeight)
          }px)`;
        },
      },
    };
  }

  /**
   * Registers all components that the AjaxCart depends on
   * @private
   */
  _registerComponents() {
    const upsell = document.querySelector(this._selectors.upsellData);
    const gift = document.querySelector(this._selectors.giftData);
    const shippingThreshold = document.querySelector(
      "#AjaxCartShippingThreshold"
    ).dataset.threshold;

    this._registerComponent(
      "line-item",
      "#AjaxCartLineItem",
      this._Components.LineItem()
    );

    this._registerComponent(
      "shipping-threshold",
      "#AjaxCartShippingThreshold",
      this._Components.ShippingThreshold(shippingThreshold)
    );

    this._registerComponent(
      "upsell-products",
      "#AjaxCartUpsell",
      this._Components.UpsellProducts(
        upsell ? JSON.parse(upsell.innerHTML) : []
      )
    );

    this._registerComponent(
      "upsell-product",
      "#AjaxCartUpsellProduct",
      this._Components.UpsellProduct()
    );

    this._registerComponent(
      "skeleton-item",
      "#AjaxCartSkeletonItem",
      this._Components.SkeletonItem()
    );
  }

  /**
   * Registers a component on the internal AjaxCart Vue instance
   * @param {String} name - component name
   * @param {String} templateID - element id to grab the component template from
   * @param {Object} component - Vue component logic
   */
  _registerComponent(name, templateID, component) {
    const template = document.querySelector(templateID);
    this._Ajaxcart.component(name, {
      template: template.innerHTML,
      ...component,
    });
    template.remove(); // Clean up template markup
  }

  // ==========================================================
  //  Components Logic
  // ==========================================================

  /**
   * All Components that internal AjaxCart Vue instance uses
   * @private
   */
  _Components = {
    /** @method mixins - shared logic across all components */
    mixins() {
      return {
        methods: {
          formatMoney(money) {
            return formatMoney(money);
          },

          /**
           * ['foo', 'bar'] => {'foo': true, 'bar': true }
           * @param {Array}
           * @param {String} [key] - if it's an array of objects, provide the object key
           *                         from which the value will become the key in the boolean object.
           *                         Example: key = 'foo'
           *                         [{foo:'foo-0'}, {foo: 'foo-1'}] => {'foo-0': true, 'foo-1': true}
           * @returns {Object}
           */
          arrayIntoBooleanObject(array, key) {
            return array.reduce(
              (elements, e) => ({ ...elements, [key ? e[key] : e]: true }),
              {} // initial value
            );
          },
        },
      };
    },

    /**
     * LINE ITEM
     * ===================================================
     * @summary single line item component
     * @component
     */
    LineItem() {
      const components = this;
      return {
        delimiters: ["${", "}"],
        mixins: [components.mixins()],
        props: ["item", "line", "loading"],
        emits: ["removeItem", "updateItemQuantity"],
      };
    },

    /**
     * SHIPPING THRESHOLD
     * ===================================================
     * @summary shipping progress bar motivator
     * @component
     */
    ShippingThreshold(threshold) {
      const components = this;

      return {
        delimiters: ["${", "}"],
        mixins: [components.mixins()],
        props: ["cart"],

        data() {
          return {
            threshold,
          };
        },

        computed: {
          amountForFreeShipping() {
            if (!this.cart) return;
            return this.threshold - this.cart.total_price;
          },

          progress() {
            if (!this.cart) return;
            return (this.cart.total_price / this.threshold) * 100;
          },

          unlocked() {
            return this.amountForFreeShipping <= 0;
          },
        },
      };
    },

    /**
     * UPSELL
     * ===================================================
     * @info limit: 6 upsell products at most (can be adapted)
     * @summary upsell products are divided in 3 categories:
     *  1. product-specific upsell products:
     *      - Only displays when a certain product is in cart
     *  2. tag related upsell products:
     *      - Only displays when a targeted tag is present in cart (if there's room)
     *  3. default upsell products
     *      - Displays at all times (if there's room for more upsell products)
     *
     * Functionality:
     *  1. Upsell checks line items for product-specific upsell products, if it
     * finds any, it fetches them and adds to upsell
     *  2. If there's still room for more upsell products, upsell looks
     * for tag-specific upsell products. If it finds any, it just adds it
     * to upsell without any need to fetch
     * 3. If there's still more room for products, upsell adds default
     * upsell products (if any) to try to fill it up (also no need to fetch).
     *
     * See Theme settings > Cart for upsell products and bottom of
     * cart-drawer.liquid for array theme.upsellTags
     *
     * - Product-specific upsell products must be fetched
     * - Tag related and default upsell don't need to be fetched,
     * they are parsed in from markup, located at:
     * cart-drawer.liquid -> [js-upsell-products]
     *
     * @param {Array} parsedProducts - this param can be found in ajaxcart.liquid [js-upsell-data]
     */
    UpsellProducts(parsedProducts = []) {
      const components = this;

      return {
        delimiters: ["${", "}"],
        mixins: [components.mixins()],
        props: ["cart", "handlesInCart"],
        emits: ["addToCart"],
        data() {
          return {
            /**
             * Upsell Products that get rendered on UI
             * @type {Object[]}
             */
            products: [],

            /**
             * Theme settings upsell products without any tag attached to it
             * @type {Object[]}
             */
            defaultProducts: [],

            /**
             * Object where the key is a tag and the value is an array
             * of product objects that belong to that upsell tag
             * @type {Object}
             */
            taggedProducts: {},

            /**
             * Limit of upsell products in cart
             * @type {Integer}
             */
            limit: 6,

            /**
             * Array of upsell tags ordered by priority, theme.upsellTags can
             * be found in theme.liquid head
             * @type {Array}
             */
            upsellTags: theme.upsellTags || [],

            /** loading indictor */
            fetching: false,

            /** Flickity current slide */
            currentSlide: 0
          };
        },

        computed: {
          /**
           * Gets the upsell tags (line_item property) of all items in
           * cart and returns it as one object where the key is the tag
           * and the value is the boolean true
           * @returns {Object}
           */
          tagsInCart() {
            if (!this.cart || !this.cart.items) return;
            let tags = [];

            this.cart.items.forEach((item) => {
              if (item?.properties?.upsell?.tag) 
                tags.push(item.properties.upsell.tag)
            });

            return this.arrayIntoBooleanObject(tags);
          },

          /**
           * Object with the handles of all products that are currently in upsell.
           * This provides us with a fast way of checking if a product currently
           * is on upsell or not
           * @type {Object}
           */
          handlesInUpsell() {
            return this.getHandles(this.products);
          },
        },

        created() {
          this.processParsedProducts(parsedProducts);
        },

        mounted() {
          const ajaxcart = document.querySelector("ajax-cart");

          // Event to interface with public ajax cart class method
          ajaxcart.addEventListener(
            "ajaxcart:upsell:refresh",
            this.refreshUpsell
          );

          this.refreshUpsell();
        },

        watch: {
          /** Refresh Upsell everytime cart items are added/removed */
          cart(oldCart, newCart) {
            if (!oldCart || !newCart) return this.refreshUpsell();
            if (!oldCart?.items || !newCart?.items) return this.refreshUpsell();

            const differentItems = oldCart.items.some(
              (item, idx) => newCart?.items[idx]?.handle !== item?.handle
            );

            if (differentItems) this.refreshUpsell();
          },
        },

        beforeUpdate() {
          // prevent flickity/vue bugs
          if (this.slider) this.slider.destroy();
        },

        updated() {
          setTimeout(() => this.initSlider(), 1)
        },

        methods: {
          /**
           * Initializes upsell products slider
           */
          initSlider() {
            const slider = document.querySelector("[js-upsell-slider]");
            if (this.slider) this.slider.destroy();
            if (!slider) return;

            this.slider = new Flickity(slider, {
              contain: true,
              adaptiveHeight: true,
              imagesLoaded: true,
              pageDots: false,
            });

            this.slider.on('change', index => {
              (this.currentSlide = index)
            });
  
            if (this.products.length)
              this.slider.select(this.currentSlide);
            
          },

          /**
           * Refreshes upsell products based on cart items
           */
          async refreshUpsell() {
            if (!this.cart || !this.cart.items) return;
            try {
              this.removeUpsellProductsInCart();
              await this.fetchUpsell();
              if (this.products.length < this.limit) {
                this.fillUpsellWithTaggedProducts();
                this.fillUpsellWithDefaults();
              }
            } catch (e) {
              console.log(e);
            }
          },

          /**
           * Fetches upsell products based on upsell related line_item properties
           * of cart items
           */
          async fetchUpsell() {
            this.products = (
              await this.fetchUpsellHandles(this.getUpsellHandles())
            ).filter((product) => product && product.available);
          },

          /**
           * Process the parsed json object defined in the markup, formating
           * to fit upsell's logic needs. Unavailable products are filtered out
           * @param {Object} parsedProducts
           */
          processParsedProducts(parsedProducts) {
            if (!parsedProducts) return;
            parsedProducts.forEach((data) => {
              if (!data.product || !data.tag) return;
              if (!data.product.available) return;
              data.product.options = data.product_options
              if (data.tag === "__DEFAULT__")
                this.defaultProducts.push(data.product);
              else this.taggedProducts[data.tag] = data.product;
            });
          },

          /**
           * If upsell products aren't full, it tries to fill it up
           * with tagged upsell products
           */
          fillUpsellWithTaggedProducts() {
            for (let i = 0; i < this.upsellTags.length; i++) {
              if (this.products.length >= this.limit) break;
              let tag = this.upsellTags[i];
              if (this.tagsInCart[tag] && this.taggedProducts[tag]) {
                this.addToUpsellIfNotRedundant(this.taggedProducts[tag]);
              }
            }
          },

          /**
           * If upsell products aren't full, it tries to fill it up
           * with default upsell products
           */
          fillUpsellWithDefaults() {
            for (let i = 0; i < this.defaultProducts.length; i++) {
              if (this.products.length >= this.limit) break;
              let defaultProduct = this.defaultProducts[i];
              if (!this.handlesInUpsell[defaultProduct.handle]) {
                this.addToUpsellIfNotRedundant(defaultProduct);
              }
            }
          },

          /**
           * Given an array of product handles, it concurrently fetches them
           * and returns them in an array of promises
           * @param {Array} handles
           * @returns {Promise}
           */
          async fetchUpsellHandles(handles) {
            if (!handles && !handles.length) return Promise.resolve([]);
            let products = [];
            this.fetching = true;
            try {
              products = await Promise.all(
                handles.map((handle) => fetch(`/products/${handle}.js`))
              ).then((responses) =>
                Promise.all(responses.map((r) => r.json()))
              );
            } catch (e) {
              console.error(e);
            } finally {
              this.fetching = false;
              return products;
            }
          },

          /**
           * Goes through each item in cart checking for __upsell line_item property,
           * which indicates the handle of the upsell product. It ignores handles
           * of products that are already in cart.
           * @returns {Array} - upsell product handles to fetch
           */
          getUpsellHandles() {
            if (!this.cart || !this.cart.items) return;
            let item,
              handle,
              qty = 0;
            const handles = [];

            for (let i = 0; i < this.cart.items.length; i++) {
              if (qty > this.limit) break;
              item = this.cart.items[i];
              handle = item?.properties?.upsell?.handle;

              if (handle && !this.handlesInCart[handle]) {
                handles.push(handle);
                qty++;
              }
            }

            // remove duplicates
            return [...new Set(handles)];
          },

          /**
           * Removes upsell products that are already in cart
           */
          removeUpsellProductsInCart() {
            let i = this.products.length;
            let handle;
            while (i--) {
              handle = this.products[i].handle;
              if (this.handlesInCart[handle]) this.products.splice(i, 1);
            }
          },

          /**
           * Adds to upsell if and only if it isn't in cart or already in upsell
           * @param {Object} product
           */
          addToUpsellIfNotRedundant(product) {
            if (!product || !product.handle) return;
            if (
              !this.handlesInUpsell[product.handle] &&
              !this.handlesInCart[product.handle]
            ) {
              this.products.push(product);
              this.handlesInUpsell[product.handle] = true;
            }
          },

          /**
           * Given an array of products, it returns an object where the keys
           * are the products handles, and the values are 'true'
           * @param {Array} products
           * @returns {Object}
           */
          getHandles(products) {
            if (!Array.isArray(products)) return {};
            return this.arrayIntoBooleanObject(products, "handle");
          },

          /**
           * Updates Flickity Slide
           * @param {Number} idx 
           */
          changeSlide(idx) {
            this.currentSlide = idx
          }
        },
      }
    },

    /**
     * UPSELL-PRODUCT
     * ===================================================
     * @summary similiar to line-item, this is a single upsell
     * product component.
     *
     * This may not seem necessary, however the upsell component
     * is already very logic heavy and it doesn't need to be aware
     * of this logic
     */
    UpsellProduct() {
      const components = this;
      return {
        delimiters: ["${", "}"],
        mixins: [components.mixins()],
        props: ["product"],
        data() {
          return {
            selectedVariant: this.getFirstAvailableVariant(),
            options: {
              1: null,
              2: null,
              3: null,
            }
          };
        },
        mounted() {
          this.options['1'] = this.selectedVariant.option1;
          this.options['2'] = this.selectedVariant.option2;
          this.options['3'] = this.selectedVariant.option3;
        },
        methods: {
          addToCart() {
            if (!this.selectedVariant) return;
            window.CartAPI.add(
              {
                id: this.selectedVariant.id,
                quantity: 1,
              },
              {
                tags: this.product.tags,
                handle: null, // Add upsell metafield specific handle here
              }
            );
          },

          getFirstAvailableVariant() {
            if (!this.product) return null;
            let selectedVariant;

            for (let i = 0; i < this.product.variants.length; i++) {
              const variant = this.product.variants[i];
              if (variant.available) {
                selectedVariant = variant;
                break;
              }
            }
            return selectedVariant;
          },

          onOptionChange() {
            this.selectedVariant = this.getVariantFromOptions(this.options)
          },

          getVariantFromOptions(options) {
            let found = false;

            this.product.variants.forEach(variant => {
              let satisfied = true;

              for (const position in options) {
                let optionKey = `option${position}`
                if (satisfied)
                  satisfied = options[position] === variant[optionKey]
              }

              if (satisfied) 
                found = variant;
            })

            return found;
          }
        },
      };
    },

    /**
     * SKELETON ITEM
     * ===================================================
     * @summary skeleton item for loading
     * @component
     */
    SkeletonItem() {
      return {};
    },
  };
}

customElements.define("ajax-cart", AjaxCart);

// custom script

(function(){
  // header mega menu script
  const menuItems = document.querySelectorAll('.header__inline-menu .header__menu-item');
  const menProductItems = document.querySelectorAll('.mega_menu .men-product-item');
  const womenProductItems = document.querySelectorAll('.mega_menu .women-product-item');
  const aboutMegaMenu = document.querySelector(".mega_menu .mega_menu-about");
  const megaMenuWrapper = document.querySelector(".mega_menu .mega_menu-row");
  menuItems.forEach( item => {
    item.addEventListener('mouseover', function(e){
      if(e.target.innerText === 'women') {
        menProductItems.forEach(el => {
          el.style.display = 'none';
          aboutMegaMenu.style.display = 'none';
          megaMenuWrapper.style.display = 'flex';
        })
        womenProductItems.forEach(el => {
          el.style.display = 'block';
        })
        
      }else if(e.target.innerText === 'men') {
        womenProductItems.forEach(el => {
          el.style.display = 'none';
          aboutMegaMenu.style.display = 'none';
          megaMenuWrapper.style.display = 'flex';
        })
        menProductItems.forEach(el => {
          el.style.display = 'block'
        })
      }else if(e.target.innerText === 'about') {
        aboutMegaMenu.style.display = 'block';
        megaMenuWrapper.style.display = 'none';
      }
    })
  })

  // custom menu drawer script
  const menuDrawerItem = document.querySelectorAll('#menu-drawer .child-menu-item');
  menuDrawerItem.forEach( item => {
    item.addEventListener('click', function(){
      this.classList.toggle('active');
      this.nextElementSibling.classList.toggle('active');
    })
  })
  const firstLevelMenuItem = document.querySelectorAll('#menu-drawer .first-level-menu-item');
  const menuDrawerFooter = document.querySelector('#menu-drawer .menu-drawer-footer');
  const menuDrawerCloseButton = document.querySelectorAll('#menu-drawer .menu-drawer__close-button');
  firstLevelMenuItem.forEach( item => {
    item.addEventListener('click', function(e){
      menuDrawerFooter.style.display = 'none'
    })
  })
  menuDrawerCloseButton.forEach( item => {
    item.addEventListener('click', function(e){
      menuDrawerFooter.style.display = 'block'
    })
  })
})()