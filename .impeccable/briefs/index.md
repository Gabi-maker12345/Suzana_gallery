# Superfície — primeira tela Suzana Galery

Modo: Experiência. Alvo: `index.html`. Seed: none (referência fixada pelo cliente).

## Escopo

Hero carrossel com as três artes de Hu Tao, marca, nav, ações de conta,
barras de paginação e setas; abaixo, prateleiras "Cenas de Hu Tao",
"Buscas recentes" e lista de obras. PT-BR. Sem backend.

Extensão: modal "Seu acervo local" para montar categorias com as fotos de
`assets/Suzana` e salvar apenas a seleção e a ordem em `localStorage`. Herda
o mundo; não é uma nova identidade. O layout da galeria de categorias fica
para a próxima etapa.

## Contrato de direção

THESIS — Uma vitrine de papel cor-de-rosa onde a ilustração atravessa a
moldura. A composição da referência é mantida, mas o hero se comporta como
uma janela viva: a arte respira, o cursor move a profundidade e cada obra
troca com uma revelação, em vez do carrossel estático de categoria.

OWN-WORLD — Papel creme morno em degradê (#FDF5F3 → #F7F1EC), hero
rosa-pêssego (#F391A5) com tinta vinho (#4A1420), pétalas claras, círculo
pálido e grão fino. Uma só família tipográfica, Gabarito (400–900), do
título ao rodapé. Raios generosos, sombras quentes e difusas. Componentes
desenhados na mesma linguagem: botões-pílula, cartões de obra sem borda
rígida, selos circulares.

STORY — O visitante entende em um relance que esta é uma coleção pequena e
obsessiva sobre uma personagem; folheia as três artes, reconhece a mesma
autoria nas prateleiras e abre uma obra para vê-la inteira.

FIRST VIEWPORT — Cabeçalho de 98px; hero rosa de 474px dentro de 1164px,
marca no canto superior esquerdo, título vinho à esquerda sobre um círculo
pálido, arte emoldurada sangrando 12px acima do cartão à direita, barras de
paginação no rodapé do cartão, setas fora dele. Sob o hero, três colunas
desiguais (cenas 1.06fr, buscas .9fr, obras 1.02fr) com respiro de 26px.
A moldura é provisória: quando a cliente entregar os PNGs recortados, remove-se
`.is-framed` e a personagem passa a sangrar sem moldura.

FORM — Comp fixada, executada com fidelidade medida; a ambição vive em uma
interação assinatura: o hero é um palco em camadas (pétalas em canvas,
paralaxe com mola, halo que respira, troca de obra por revelação em máscara)
e cada prateleira responde ao mesmo vocabulário de movimento.

MOTION — Entrada orquestrada uma vez: cartão sobe desfocado, letras do título
sobem, arte entra em escala; depois, deriva contínua lenta. Troca de slide:
cruzamento com máscara circular e leve rotação da arte, texto por linhas.
Pétalas sempre presentes em baixa opacidade. Tudo desligado em
`prefers-reduced-motion`.

## Decisões em aberto

Nenhuma bloqueante. Conta/favoritos são estados locais e declarados como
prévia. Recortes transparentes das três artes ficam pendentes com a cliente;
o hero já aceita essa troca.
