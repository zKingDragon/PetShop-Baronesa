
// ...existing code...
// Carrega o header.html e inse
// re no elemento com id="header"
document.addEventListener("DOMContentLoaded", () => {
  fetch("../html/header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header").innerHTML = data;
      initMobileMenu(); // <-- Chame aqui, após inserir o header!
    });
});

// Carrega o footer normalmente
document.addEventListener("DOMContentLoaded", () => {
  fetch("../html/footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer").innerHTML = data;
    });
});

// Atualiza o ano após o DOM estar prontoAdd commentMore actions
document.addEventListener("DOMContentLoaded", () => {

  // Atualiza o ano atual no rodapé
  updateCurrentYear();

  // Ajusta visibilidade do texto da logo
  ensureLogoTextVisible();
});

function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const mobileMenu = document.getElementById("mobileMenu");

  if (!menuToggle) {
    console.error("Elemento menuToggle não encontrado.");
    return;
  }

  if (!mobileMenu) {
    console.error("Elemento mobileMenu não encontrado.");
    return;
  }

  menuToggle.addEventListener("click", () => {
    // Alterna a classe 'active' no menu mobile
    mobileMenu.classList.toggle("active");

    // Alterna o ícone entre 'fa-bars' e 'fa-times'
    const icon = menuToggle.querySelector("i");
    if (icon) {
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    }
  });
}

function updateCurrentYear() {
  const yearElements = document.querySelectorAll("#currentYear");
  const currentYear = new Date().getFullYear();

  yearElements.forEach(element => {
    element.textContent = currentYear;
  });
}

function ensureLogoTextVisible() {
  const logoText = document.querySelector(".logo-text");
  if (logoText) {
    logoText.style.display = "inline"; // Garante que o texto da logo esteja visível
  }
}
