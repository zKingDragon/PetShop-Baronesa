document.addEventListener("DOMContentLoaded", () => {
  // Carrega o header
  fetch("header.html")
    .then(res => res.text())
    .then(data => {
      const header = document.getElementById("header");
      if (header) {
        header.innerHTML = data;
        initMobileMenu(); // Inicializa o menu mobile após carregar o header
      }
    });

  // Carrega o footer
  fetch("footer.html")
    .then(res => res.text())
    .then(data => {
      const footer = document.getElementById("footer");
      if (footer) footer.innerHTML = data;
    });

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
