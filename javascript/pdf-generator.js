// Gerador de PDF do Cardápio - Hapuque's Doces

// Dados do cardápio completo
const cardapioCompleto = {
  docinhos: [
    { nome: 'Brigadeiro Tradicional', preco: 'R$ 1,50', imagem: '../assets/img/galeria/brigadeiro_cardapio.png' },
    { nome: 'Beijinho Tradicional', preco: 'R$ 1,50', imagem: '../assets/img/galeria/beijinho_cardapio.png' },
    { nome: 'Brigadeiro de Churros', preco: 'R$ 1,80', imagem: '../assets/img/galeria/brigadeiro_churros_cardapio.png' },
    { nome: 'Ninho com Nutella', preco: 'R$ 2,00', imagem: '../assets/img/galeria/brigadeiro_ninho_nutella_cardapio.png' },
    { nome: 'Casadinho', preco: 'R$ 2,00', imagem: '../assets/img/galeria/casadinho_cardapio.png' },
  ],
 
  outros: [
    { nome: 'Copinho de Chocolate', preco: 'R$ 2,50', imagem: '../assets/img/galeria/copinho_chocolate_cardapio.png' },
    { nome: 'Cupcake', preco: 'R$ 6,00', imagem: '../assets/img/galeria/cupcake_sonic_cardapio.png' },
    { nome: 'Pão de Mel Decorado', preco: 'R$ 15,00', imagem: '../assets/img/galeria/pao_de_mel_abelha_cardapio.png' },
    { nome: 'Pirulito de Chocolate', preco: 'R$ 6,50', imagem: '../assets/img/galeria/pirulito_chocolate_5_cardapio.png' },
    { nome: 'Mini Brownie', preco: 'R$ 2,80', imagem: '../assets/img/galeria/mini_brownie_cardapio.png' },
    { nome: 'Trufa Personalizada', preco: 'R$ 4,50', imagem: '../assets/img/galeria/trufa_personalizada_cardapio.png' },
    { nome: 'Morango do Amor', preco: 'R$ 10,00', imagem: '../assets/img/galeria/morango_do_amor_cardapio.png' },
  ],
};

// Função para gerar o PDF (agora suporta carregar logo assíncrono)
async function gerarCardapioPDF(logoSrc = '../assets/img/logo.png') {
  const { jsPDF } = window.jspdf;
  // Carrega a imagem do logo e retorna data quando pronta
  function loadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Não foi possível carregar a imagem do logo: ' + src));
      img.src = src;
    });
  }

    const imageCache = new Map();

  async function preloadImagesFromMenu(menuData) {
    const paths = new Set();

    Object.values(menuData).forEach(arr => {
      arr.forEach(item => {
        if (item.imagem) paths.add(item.imagem);
      });
    });

    const promises = Array.from(paths).map(async (p) => {
      try {
        const imgEl = await loadImage(p);
        imageCache.set(p, imgEl);
      } catch (err) {
        // falha ao carregar imagem do item: registra e continua (fallback)
        console.warn('Imagem do item não carregada:', p, err);
      }
    });

    await Promise.all(promises);
  }

  // Cores do tema
  const corPrincipal = [65, 45, 36]; // Marrom escuro
  const corSecundaria = [245, 224, 229]; // Rosa claro
  const corTexto = [51, 51, 51]; // Cinza escuro

  let yPosition = 20;

  const doc = new jsPDF();

  // CABEÇALHO
  doc.setFillColor(...corPrincipal);
  doc.rect(0, 0, 210, 40, 'F');

  // Tentar carregar e desenhar o logo no canto superior esquerdo
  try {
    const img = await loadImage(logoSrc);
    // Desenha o logo dentro do header (ajuste de tamanho se necessário)
    // x:15, y:6 (dentro dos 40px do header), largura 28, altura 28
    doc.addImage(img, 'PNG', 15, 6, 28, 28);
  } catch (err) {
    // Se falhar, continua sem logo (não interrompe geração)
    // console.warn(err);
  }

  // Título
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text("HAPUQUE'S DOCES", 105, 15, { align: 'center' });

  // Subtítulo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  doc.text('Feito à Mão, para tocar o coração.', 105, 24, { align: 'center' });

  // Informações de contato
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Rua Vinte e Dois de Agosto, 201 - Vila Bela Vista, SP', 105, 31, { align: 'center' });
  doc.text('Tel: (11) 2227-8700  |  Instagram: @hapuques_doces', 105, 35, { align: 'center' });

  yPosition = 50;

  
  // Precarrega imagens dos itens antes de desenhar categorias
  await preloadImagesFromMenu(cardapioCompleto);

  // Função auxiliar para adicionar categoria
  function adicionarCategoria(titulo, itens) {
    // Verificar se precisa de nova página
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    // Título da categoria
    doc.setFillColor(...corSecundaria);
    doc.rect(15, yPosition - 5, 180, 10, 'F');
    
    doc.setTextColor(...corPrincipal);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(titulo.toUpperCase(), 20, yPosition + 2);

    // Reduz espaço entre o cabeçalho e o primeiro item para ficar igual aos demais
    yPosition += 6;

    // Itens da categoria
    doc.setTextColor(...corTexto);
    doc.setFontSize(10);

    itens.forEach((item, index) => {
      // Tamanho da thumbnail (se houver)
      const thumbW = 18;
      const thumbH = 18;
      const gapAfterThumb = 6;

      // Define altura da linha do item (imagem + folga total)
      const rowHeight = thumbH + 0; // imagem + 6mm de folga total (3mm em cima/baixo)

      // Antes de desenhar, checar quebra de página considerando a altura da linha inteira
      if (yPosition + rowHeight > 270) {
        doc.addPage();
        yPosition = 20;
      }

      // Topo e centro da linha
      const rowTopY = yPosition;
      const centerY = rowTopY + rowHeight / 2;

      // Posições: imagem alinhada ao centro da linha, texto também centralizado verticalmente
      let textX = 20;
      if (item.imagem && imageCache.has(item.imagem)) {
        const imgEl = imageCache.get(item.imagem);
        const imgY = centerY - (thumbH / 2);
        try {
          doc.addImage(imgEl, 'PNG', 20, imgY, thumbW, thumbH);
          textX = 20 + thumbW + gapAfterThumb;
        } catch (err) {
          console.warn('Falha ao inserir imagem no PDF para', item.nome, err);
        }
      }

      // Nome do item (negrito) e preço, ambos centralizados verticalmente na linha
      const textY = centerY + 2; // pequeno ajuste para alinhar melhor visualmente
      doc.setFont('helvetica', 'bold');
      doc.text(item.nome, textX, textY);
      const precoWidth = doc.getTextWidth(item.preco);
      doc.text(item.preco, 190 - precoWidth, textY);

      // Linha divisória no final da linha (exceto último item)
      yPosition = rowTopY + rowHeight;
      if (index < itens.length - 1) {
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 3; // pequeno espaço após a linha
      }
    });

    // Após a categoria, deixar o mesmo espaçamento usado entre itens (3mm)
    yPosition += 6;
  }

  // Adicionar todas as categorias
  adicionarCategoria('DOCINHOS', cardapioCompleto.docinhos);
  adicionarCategoria('OUTROS', cardapioCompleto.outros);

  // RODAPÉ em todas as páginas
  const totalPages = doc.internal.getNumberOfPages();
  
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    
    // Linha decorativa
    doc.setDrawColor(...corPrincipal);
    doc.setLineWidth(0.5);
    doc.line(15, 285, 195, 285);
    
    // Texto do rodapé
    doc.setFontSize(8);
    doc.setTextColor(...corTexto);
    doc.setFont('helvetica', 'italic');
    doc.text('Todos os doces são feitos artesanalmente com ingredientes selecionados.', 105, 290, { align: 'center' });
    doc.text('Encomendas: mínimo 48h de antecedência | Retirada no local ou delivery', 105, 294, { align: 'center' });
    
    // Número da página
    doc.setFont('helvetica', 'normal');
    doc.text(`Página ${i} de ${totalPages}`, 195, 294, { align: 'right' });
  }

  // Salvar o PDF
  const dataAtual = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  doc.save(`Cardapio_Hapuques_Doces_${dataAtual}.pdf`);
  return Promise.resolve();
}

// Event listener para o botão
document.addEventListener('DOMContentLoaded', function() {
  const btnGerarPDF = document.getElementById('btnGerarPDF');
  
  if (btnGerarPDF) {
    btnGerarPDF.addEventListener('click', async function(e) {
      e.preventDefault();
      
      // Feedback visual
      const textoOriginal = this.innerHTML;
      this.innerHTML = '⏳ Gerando PDF...';
      this.disabled = true;

      // Pequeno delay para dar feedback visual
      setTimeout(async () => {
        try {
          // Chama a função assíncrona que carrega o logo internamente
          await gerarCardapioPDF();

          // Feedback de sucesso
          this.innerHTML = '✅ PDF Gerado!';
          setTimeout(() => {
            this.innerHTML = textoOriginal;
            this.disabled = false;
          }, 2000);
        } catch (error) {
          console.error('Erro ao gerar PDF:', error);
          this.innerHTML = '❌ Erro ao gerar PDF';
          setTimeout(() => {
            this.innerHTML = textoOriginal;
            this.disabled = false;
          }, 2000);
        }
      }, 300);
    });
  }
});
