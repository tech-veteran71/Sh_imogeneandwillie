class FacetsDesktop extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      form: "form",
      accordionOpen: "[js-accordion-open]",
      accordionContent: "[js-accordion-content]",
      accordionClose: "[js-accordion-close]",
    };
  }

  connectedCallback() {
    this._initAccordion();
    this._initForm();
  }

  _initAccordion() {
    this.querySelectorAll(this._selectors.accordionOpen).forEach((button) => {
      button.addEventListener("click", toggleContent.bind(this));
    });

    document.addEventListener("facets:rendered", () => {
      this.querySelector(this._selectors.accordionOpen).click();
    })
    
    function toggleContent(e) {
      e.stopImmediatePropagation();
      const trigger = e.currentTarget;
      const content = this.querySelector(
        `#${trigger.getAttribute("aria-controls")}`
      );
      let isExpanded = trigger.getAttribute("aria-expanded");
      if (isExpanded == "false") {
        trigger.setAttribute("aria-expanded", true);
        content.setAttribute("aria-hidden", false);
      } else {
        trigger.setAttribute("aria-expanded", false);
        content.setAttribute("aria-hidden", true);
      }
    }
  }

  _initForm() {
    const masterForm = document.getElementById("FacetFiltersFormMobile");
    const form = this.querySelector(this._selectors.form);

    form.addEventListener("input", (e) => {
      const input = e.target;
      const msInput = masterForm.querySelector(
        `[name="${input.name}"][value="${input.value}"]`
      );
      if (!msInput) return;

      /** Mechanism to avoid toggling facets on desktop */
      FacetFiltersForm.toggleFacets = false;

      msInput.checked = input.checked;
      masterForm.dispatchEvent(new Event("input"));
    });
  }
}

customElements.define("facets-desktop", FacetsDesktop);
