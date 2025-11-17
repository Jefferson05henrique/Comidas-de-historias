const carrossel = document.querySelector('.carrossel-inner'); 
const slides = document.querySelectorAll('.slide');          
let indiceAtual = 0;                                       

const tempoDeTroca = 5000;                                 

function moverCarrossel() {
  indiceAtual++;
  
  if (indiceAtual >= slides.length) {
    indiceAtual = 0;
  }
  
  const percentualSlide = 100 / slides.length; 
  const deslocamentoCorreto = -indiceAtual * percentualSlide;
  
  carrossel.style.transform = `translateX(${deslocamentoCorreto}%)`;
}

setInterval(moverCarrossel, tempoDeTroca);