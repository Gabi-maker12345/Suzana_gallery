# Suzana Galery

Galeria de fan art de Hu Tao. A primeira tela é um hero em carrossel com três
ilustrações, setas, paginação, pausa do autoplay e três prateleiras
(Cenas, Buscas recentes, Obras). O restante da galeria será construído em cima
do acervo de fotos de `assets/Suzana`.

## Rodar localmente

```bash
python3 -m http.server 8123 --bind 127.0.0.1
```

Abra <http://127.0.0.1:8123/>. É estático: não há build nem backend.

## Branches

- **`main`** — versão de trabalho, com o botão **+** no cabeçalho e o modal
  **Seu acervo local**. Use esta branch para montar categorias e a ordem das
  fotos.
- **`deploy`** — versão pública sem o botão, sem o modal e sem o código do
  acervo local. Os assets e o manifesto permanecem para a futura galeria.

O repositório é local; nenhum remoto foi configurado. Escolha a visibilidade
antes de publicar (as fotos de `assets/Suzana` são pessoais).

## Acervo local (`main`)

- O modal lê as fotos reais de `assets/Suzana` e salva **somente** o nome e a
  ordem em `localStorage`, chave `suzana-galeria-categorias-v1`.
- Nenhuma foto é enviada ou copiada. Excluir uma categoria não apaga arquivos.
- **Exportar** gera `suzana-categorias.json`, útil para versionar ou levar a
  mock para outro lugar.
- O armazenamento é por navegador e por endereço. Use sempre o mesmo host/porta.
- Consumo na próxima etapa: `window.SuzanaArchiveData.list()` (categorias e
  ordem) e `window.SUZANA_ASSETS` (`name`, `src`, `thumb`, `w`, `h`).

## Fotos

`assets/Suzana` contém as imagens originais. `_thumbs` traz miniaturas de
400 px e `_web` traz os HEIC/HEIF convertidos para JPG, para abrir no Chrome.
`js/suzana-assets.js` e `assets/Suzana/manifest.json` são gerados por:

```bash
python3 -m pip install pillow pillow-heif
python3 scripts/build-suzana-assets.py
```

Rode novamente depois de adicionar fotos à pasta.
