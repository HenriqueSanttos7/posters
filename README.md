# PainelFácil

Aplicação estática para dividir uma arte em partes, agrupar partes menores nas folhas e gerar PDF A4 ou A3.

## Arquivos
- `index.html` — interface
- `styles.css` — estilos
- `app.js` — divisão, prévia e PDF

## Hospedagem
Envie os três arquivos para Firebase Hosting, GitHub Pages, Netlify ou outro serviço estático. A biblioteca jsPDF é carregada por CDNJS e a fonte Inter pelo Google Fonts. Para uso offline, hospede jsPDF localmente e substitua a URL no HTML.

O tamanho inicial é 100 × 100 cm. A prévia abre na grade do painel e também pode mostrar as folhas. As partes ficam espaçadas para as marcas de corte. Imprima em tamanho real / 100%.
