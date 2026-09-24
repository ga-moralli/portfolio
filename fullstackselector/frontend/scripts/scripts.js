let currentSlide = 0;

    const track = document.querySelector(".carousel-track");
    const dots = document.querySelectorAll(".dot");

    function moveSlide(direction) {
        currentSlide += direction;

        if (currentSlide < 0) {
            currentSlide = 2;
        }

        if (currentSlide > 2) {
            currentSlide = 0;
        }

        updateCarousel();
    }

    function goToSlide(index) {
        currentSlide = index;
        updateCarousel();
    }

    function updateCarousel() {
        track.style.transform =
            `translateX(-${currentSlide * 100}%)`;

        dots.forEach(dot => dot.classList.remove("active"));

        dots[currentSlide].classList.add("active");
    }