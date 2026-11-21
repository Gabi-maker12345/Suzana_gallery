# Suzana Galery

Galeria online de fan art, com curadoria autoral de ilustrações de Hu Tao.
A primeira tela é uma vitrine-manifesto: o visitante deve sentir o cuidado da
coleção antes de clicar em qualquer coisa, e conseguir folhear as obras,
filtrar buscas e abrir uma arte sem sair da página.

## Público e uso

Fãs de anime e de arte digital, navegando à noite, no celular ou no desktop,
vindos de redes sociais. Não há cadastro obrigatório para olhar. A tela é
Experiência: a arte lidera, a interface se retira.

## Verdade do produto

- Acervo real disponível: 3 ilustrações de Hu Tao (`suzana1.jpg`,
  `suzana2.jpg`, `suzana3.jpg`), todas de fundo colorido.
- Marca: Suzana Galery. Conteúdo em português do Brasil.
- Escopo desta entrega: a primeira tela — hero carrossel e as três
  prateleiras abaixo (cenas, buscas recentes, obras) — e a ferramenta local de
  categorias. O layout da galeria de categorias virá na próxima etapa.
- Acervo real de fotos em `assets/Suzana` (106 arquivos; 14 HEIC convertidos
  para JPG web). O manifesto `js/suzana-assets.js` é gerado por
  `scripts/build-suzana-assets.py` e expõe nome, src, miniatura e dimensões.
- Sem backend e sem upload. O acervo local (categorias + descrição + ordem dos
  arquivos) fica em `localStorage`, chave `suzana-galeria-categorias-v1`;
  as fotos continuam sendo os arquivos reais da pasta. Consumível em
  `window.SuzanaArchiveData` e `window.SUZANA_ASSETS`.
- Favoritos e preferências ficam no navegador. Entrar/criar conta não estão
  conectados nesta prévia.

## Restrições

- A composição da referência fornecida é contrato: fundo creme, hero rosa com
  personagem sangrando para fora do cartão, marca no canto, nav central,
  ações à direita, barras de paginação, setas laterais, três prateleiras.
- Não inventar obras, nomes de personagens ou números de acervo além das
  três artes fornecidas.
- Movimento generoso é requisito explícito ("animações e efeitos bonitos e
  chamativos"), com alternativa para `prefers-reduced-motion`.
