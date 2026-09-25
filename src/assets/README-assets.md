# Assets dos temas — Jovens Sta. Terezinha
Para uso junto com `handoff-agenda-jovem.md` e `handoff-temas-novenas-festas.md`.

## O que tem aqui

14 arquivos SVG, dois por tema:

| Arquivo | O que é | Cor |
|---|---|---|
| `motif-[tema].svg` | Detalhe decorativo do topo (atrás do título) | Branco (`#FFFFFF`) |
| `tile-[tema].svg` | Textura de fundo, feita para repetir em mosaico | Cor de destaque do tema |

Temas: `teresinha`, `jose`, `carlo`, `frassati`, `joana`, `maria`, `inacio` — mesmos nomes (slugs) da tabela `themes` do documento principal.

## Como usar o motif-[tema].svg

- **ViewBox:** 400 x 160. Pensado para o canto direito do topo (`.hero`), atrás do texto, nunca por cima.
- **Cor:** já vem em branco, porque o topo (`hero`) é sempre uma cor escura. Não precisa recolorir.
- **Opacidade recomendada:** aplicar entre 20% e 30% por fora do arquivo (`opacity` no CSS ou no elemento `<img>`/`<object>`), não editar o SVG. Isso deixa fácil ajustar tema por tema sem regerar o arquivo.
- **Posicionamento sugerido:**
  ```css
  .hero .motif {
    position: absolute;
    right: 0;
    top: 0;
    width: 260px;
    height: 100%;
    opacity: .3;
    pointer-events: none;
  }
  ```
- Em `carlo` e `inacio` o próprio arquivo já tem partes com opacidade menor internamente (os raios), porque são elementos de segundo plano dentro do próprio motivo — o restante do desenho continua em branco sólido.

## Como usar o tile-[tema].svg

- **ViewBox:** entre 32 e 64px, dependendo do tema (cada arquivo já vem com o valor certo, não precisa forçar tamanho).
- **Uso como padrão repetido**, não como imagem única:
  ```css
  .hero {
    background-color: var(--hero);
    background-image: url(tile-jose.svg);
    background-size: 56px; /* ajustar conforme o arquivo, ver tabela abaixo */
    background-repeat: repeat;
  }
  ```
- **Tamanho de repetição por tema** (usar como `background-size`):

  | Tema | Tamanho do tile |
  |---|---|
  | teresinha | 64px |
  | jose | 40px |
  | carlo | 32px |
  | frassati | 60px |
  | joana | 48px |
  | maria | 40px |
  | inacio | 44px |

- A textura já vem com opacidade baixa embutida (entre 14% e 50%, variando por tema), pensada para ficar sutil sobre a cor `hero`. Não precisa reduzir mais a opacidade por fora, só ajustar se ficar forte demais em algum tema.
- Pode ser usada também atrás da faixa de aniversariantes (`--soft`), trocando a cor de fundo mas mantendo o mesmo tile.

## Observação técnica

Os arquivos foram exportados com metadados de origem (C2PA) embutidos automaticamente — não atrapalham a exibição, mas deixam o arquivo um pouco mais pesado do que o SVG puro. Se for otimizar para produção, rodar por um otimizador de SVG (SVGO, por exemplo) remove isso com segurança e reduz o tamanho.

## Ainda falta

- Ícone de "novena" para a etiqueta "Dia X de 9" (contador). Posso desenhar em seguida se quiser.
- Brasões de Nossa Senhora e Santo Inácio (os motivos `stars` e `flame` já seguem a cara que esses brasões deveriam ter, então servem de referência).
- Conferir contraste de cada motivo e tile sobre a cor `hero` real do tema, já em tela, antes de aprovar para produção.
