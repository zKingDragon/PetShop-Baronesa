// Função para inicializar o menu mobile
function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle")
  const mobileMenu = document.getElementById("mobileMenu")

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      mobileMenu.classList.toggle("active")

      // Alternar ícone do botão
      const icon = menuToggle.querySelector("i")
      if (icon.classList.contains("fa-bars")) {
        icon.classList.remove("fa-bars")
        icon.classList.add("fa-times")
      } else {
        icon.classList.remove("fa-times")
        icon.classList.add("fa-bars")
      }
    })
  }
}

// Função para atualizar o ano atual no rodapé
function updateCurrentYear() {
  const yearElements = document.querySelectorAll("#currentYear")
  const currentYear = new Date().getFullYear()

  yearElements.forEach((element) => {
    element.textContent = currentYear
  })
}

// Inicializar quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu()
  updateCurrentYear()
})

// Carrega o header.html e insere no elemento com id="header"
document.addEventListener("DOMContentLoaded", () => {
  fetch("../html/header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header").innerHTML = data;
    });
});

// Carrega o header.html e insere no elemento com id="header"
document.addEventListener("DOMContentLoaded", () => {
  fetch("../html/footer.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("footer").innerHTML = data;
    });
});

document.addEventListener("DOMContentLoaded", () => {
  initMobileMenu()
  updateCurrentYear()
})
document.addEventListener("DOMContentLoaded", () => {
  fetch("../html/header.html")
    .then(res => res.text())
    .then(data => {
      document.getElementById("header").innerHTML = data;
    });
});

// Carrega o header.html e insere no elemento com id="header"


// Carrega o footer normalmente
document.addEventListener("DOMContentLoaded", function () {
  const includes = document.querySelectorAll("include[src]");
  includes.forEach(async function (el) {
    const src = el.getAttribute("src");
    try {
      const response = await fetch(src);
      if (!response.ok) throw new Error("Erro ao carregar " + src);
      const content = await response.text();
      el.outerHTML = content;
    } catch (error) {
      console.error("Erro ao incluir:", error);
    }
  });
});


// Atualiza o ano após o DOM estar pronto
document.addEventListener("DOMContentLoaded", () => {
  updateCurrentYear();
});
