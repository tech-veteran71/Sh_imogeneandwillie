class ProductDetail extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    if (this.dataset.hasOwnProperty("sticky")) {
      this.initSticky();
    }
  }

  initSticky() {
    this.initialY = this.parentElement.offsetTop;
    this.currentY = this.initialY;
    this.currentHeight = this.offsetHeight
    window.addEventListener("scroll", throttle(this.updateStickyOffset));
  }

  updateStickyOffset = () => {
    const elHeight = this.offsetHeight;
    // console.log(`offsetHeight: ${this.offsetHeight}`)
    // console.log(`screen.height: ${screen.height}`)
    if (elHeight < screen.height && this.isInViewport()) return;

    if (elHeight !== this.currentHeight) {
      this.currentY = this.offsetTop;
      this.currentHeight = elHeight;
    }

    const elTop = this.offsetTop
    const elBottom = elHeight + this.offsetTop
    const screenTop = document.documentElement.scrollTop || document.body.scrollTop;
    const screenBottom = window.scrollY + window.innerHeight;
    const offset = parseInt(this.currentY - screenTop, 10);
    const reachedEnd = screenBottom > elBottom;

    // console.log(`elTop: ${elTop}`)
    // console.log(`elBottom: ${elBottom}`)
    // console.log(`screenTop: ${screenTop}`)
    // console.log(`screenBottom: ${screenBottom}`)
    // console.log(`offset: ${offset}`)
    // console.log(`reachedEnd: ${reachedEnd}`)
    // console.log(`currentY: ${this.currentY}`)
    // console.log(`initialY: ${this.initialY}`)
    // console.log("==============================================")
    // console.log("==============================================")
    // console.log("")

    if (!reachedEnd) {
      this.style.top = `${offset}px`
    } else {
      this.currentY = this.initialY;
    }
    

  };

  isInViewport () {
    var rect = this.getBoundingClientRect();

    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && 
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
}

customElements.define("product-detail", ProductDetail)
