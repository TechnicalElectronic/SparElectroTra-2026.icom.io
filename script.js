const menu = document.getElementById("menu");
const navLinks = document.getElementById("navLinks");


// Mobile menu
menu.addEventListener("click", function () {
    navLinks.classList.toggle("show");
});


// Close mobile menu after selecting a link
document.querySelectorAll(".nav-links a").forEach(function (link) {

    link.addEventListener("click", function () {
        navLinks.classList.remove("show");
    });

});


// Automatic copyright year
document.getElementById("year").textContent =
    new Date().getFullYear();


// Active navigation link while scrolling
const sections = document.querySelectorAll("section[id]");
const links = document.querySelectorAll(".nav-links a");

window.addEventListener("scroll", function () {

    let current = "";

    sections.forEach(function (section) {

        const top = section.offsetTop - 150;
        const bottom = top + section.offsetHeight;

        if (
            window.scrollY >= top &&
            window.scrollY < bottom
        ) {
            current = section.id;
        }

    });


    links.forEach(function (link) {

        link.classList.remove("active");

        if (
            link.getAttribute("href") === "#" + current
        ) {
            link.classList.add("active");
        }

    });

});