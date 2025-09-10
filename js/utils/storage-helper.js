/**
 * Helper para construir URLs do Firebase Storage.
 */
function buildStorageUrl(imageName) {
  const storageBucket = window.firebaseConfig?.storageBucket;
  if (!storageBucket) {
    console.error("Firebase storage bucket não encontrado na configuração.");
    return `assets/images/placeholder.png`;
  }
  
  // Verifica se o imageName já é uma URL completa
  if (imageName.startsWith('http')) {
    return imageName;
  }

  // Remove caminhos locais se existirem (ex: ../assets/images/)
  const fileName = imageName.split('/').pop();
  const encodedImageName = encodeURIComponent(fileName);
  
  // Monta a URL completa
  return `https://firebasestorage.googleapis.com/v0/b/${storageBucket}/o/slides%2F${encodedImageName}?alt=media`;
}

if (typeof window !== 'undefined') {
  window.buildStorageUrl = buildStorageUrl;
}
