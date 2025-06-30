// Aguarda o carregamento do DOM e dos serviços necessários
document.addEventListener("DOMContentLoaded", async () => {
  // Aguarda o Firebase e ProductsService estarem prontos
  async function waitForProductsService() {
    return new Promise((resolve) => {
      function check() {
        if (window.ProductsService && typeof window.ProductsService.getAllProducts === "function") {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      }
      check();
    });
  }

  await waitForProductsService();

  let products = [];
  try {
    products = await window.ProductsService.getAllProducts();
  } catch (e) {
    // Se não conseguir carregar, mostra mensagem de erro
    document.getElementById("promotionsGrid").innerHTML = `
      <div class="no-products">
        <i class="fas fa-exclamation-triangle"></i>
        <h3>Erro ao carregar promoções</h3>
        <p>Tente novamente mais tarde.</p>
      </div>
    `;
    return;
  }

  // Filtra produtos em promoção válidos
  const promoProducts = products.filter(
    (p) => !!p.onSale && p.salePrice && p.salePrice < p.price
  );

  const grid = document.getElementById("promotionsGrid");
  if (!promoProducts.length) {
    grid.innerHTML = `
      <div class="no-products">
        <i class="fas fa-box-open"></i>
        <h3>Nenhuma promoção ativa</h3>
        <p>Ative a opção de promoção em algum produto para exibi-lo aqui.</p>
      </div>
    `;
    return;
  }

  // Renderiza os cards de promoção
  grid.innerHTML = promoProducts
    .map((product) => {
      const imageUrl = product.image || "../assets/images/placeholder.png";
      const price = Number(product.price).toFixed(2);
      const salePrice = Number(product.salePrice).toFixed(2);
      const name = product.name || "";
      const description = product.description || "";
      // WhatsApp link
      const waText = encodeURIComponent(`Olá! Gostaria de comprar o produto "${name}" que está em promoção.`);
      return `
        <div class="product-card">
          <div class="product-image">
            <img src="${imageUrl}" alt="${name}">
            <div class="product-tag">Oferta</div>
          </div>
          <div class="product-info">
            <h3>${name}</h3>
            <p>${description}</p>
            <div class="product-price">
              <span class="current-price">R$ ${salePrice}</span>
              <span class="old-price">R$ ${price}</span>
            </div>
            <a href="https://wa.me/5513996825624?text=${waText}" class="btn-primary btn-block" target="_blank">
              Comprar pelo WhatsApp
            </a>
          </div>
        </div>
      `;
    })
    .join("");
});
