# PainelFácil

Aplicação estática para dividir uma arte em partes, agrupar partes menores na área livre das folhas e gerar PDF A4 ou A3.

## Arquivos
- `index.html` — interface
- `styles.css` — estilos
- `app.js` — divisão, prévia e PDF

## Hospedagem
Envie os três arquivos para Firebase Hosting, GitHub Pages, Netlify ou outro serviço estático. A biblioteca jsPDF é carregada por CDNJS e a fonte Inter pelo Google Fonts. Para uso offline, hospede jsPDF localmente e substitua a URL no HTML.

O tamanho inicial é 100 × 100 cm. A prévia alterna entre a grade do painel e as folhas montadas. A impressão deve ser feita em tamanho real / 100%.
