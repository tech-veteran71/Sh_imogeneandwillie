class FacetsDesktop extends HTMLElement {
  constructor() {
    super();

    this._selectors = {
      form: 'form',
      accordionOpen: '[js-accordion-open]',
      accordionContent: '[js-accordion-content]',
      accordionClose: '[js-accordion-close]'
    }
  }

  connectedCallback() {
    this._initAccordion();
    this._initForm();
  }

  _initAccordion() { 
    this.querySelectorAll(this._selectors.accordionOpen).forEach(button => {
      button.addEventListener('click', toggleContent.bind(this))
    })

    function toggleContent(e)  {
      e.stopImmediatePropagation();
      const trigger = e.currentTarget;
      const content = this.querySelector(`#${trigger.getAttribute('aria-controls')}`);
      let isExpanded = trigger.getAttribute('aria-expanded');
      if (isExpanded == 'false') {
        trigger.setAttribute('aria-expanded', true);
        content.setAttribute('aria-hidden', true);
      }else{
        trigger.setAttribute('aria-expanded', false);
        content.setAttribute('aria-hidden', false);
  
      }
    }
  }

  _initForm() {
    const masterForm = document.getElementById("FacetFiltersFormMobile");
    const form = this.querySelector(this._selectors.form);

    form.addEventListener('input', (e) => {
      const input = e.target;
      if (input.name === 'sort_by') {
        const msInput = masterForm.querySelector(`[name="sort_by"]`);
        if (msInput) {
          msInput.value = input.value;
        }
      } else {
        const msInput = masterForm.querySelector(`[name="${input.name}"][value="${input.value}"]`);
        if (msInput) {          
          msInput.checked = input.checked;
        }
      }

      masterForm.dispatchEvent(new Event('input'))


    })
  }

}

customElements.define('facets-desktop', FacetsDesktop);