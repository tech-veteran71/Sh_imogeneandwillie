(
  function() {
    function updSwiperNumericPagination() {
      this.el.querySelector(".swiper-counter").innerHTML = '<span class="count">' + (this.realIndex + 1) + '</span>/<span class="total">' + this.el.slidesQuantity + "</span>";
    }
    const slider = document.querySelectorAll('.product-slider-section .product-slider');
    slider.forEach( el => {
      // Getting slides quantity before slider clones them
      el.slidesQuantity = el.querySelectorAll(".swiper-slide").length;

      // Swiper initialization
      new Swiper(el, {
        loop: true,
        slidesPerView: 1,
        spaceBetween: 20,
        navigation: {
          nextEl: el.querySelector(".swiper-button-next"),
          prevEl: el.querySelector(".swiper-button-prev")
        },
        on: {
          init: updSwiperNumericPagination,
          slideChange: updSwiperNumericPagination
        }
      });
    })
  }
)()
