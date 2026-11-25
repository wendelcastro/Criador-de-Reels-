# Catálogo de esquemas

Cada cena do `cenas.plan.json` pode ter um `grafico`. Todos são animados, entram na âncora e respeitam as
zonas seguras. Escolha pelo que a fala está fazendo naquele momento.

| A fala está... | Use |
|---|---|
| Apresentando o tema ou um achado | `titulo` |
| Dizendo um número | `numero` |
| Contrastando duas coisas | `comparativo` |
| Dando uma proporção (%) | `donut` |
| Enumerando 2 a 4 itens | `lista` |
| Citando alguém | `citacao` |
| Falando de "X vezes mais" | `multiplicador` |
| Mostrando variedade (setores, perfis) | `chips` |
| Fechando com uma frase-assinatura | `lema` |
| Pedindo uma ação | `cta` |

## Exemplos

```json
{"tipo": "titulo", "selo": "Achado 2", "titulo": "Quem não programa já cria software", "destaque": "cria software", "subtitulo": "com agentes de código"}
```
`destaque` precisa ser um trecho exato do `titulo`; ele sai em serifa itálica dourada.

```json
{"tipo": "numero", "valor": 66, "rotulo": "entrevistas", "detalhe": "em 58 empresas nos EUA", "prefixo": "", "sufixo": "", "casas": 0}
```

```json
{"tipo": "comparativo", "titulo": "De onde vem o valor da IA", "itens": [
  {"valor": "Custo", "rotulo": "o que a maioria espera", "ancora": "não vem de cortar"},
  {"valor": "Produção", "rotulo": "onde está a maior parte do valor", "ancora": "vem de produzir"}]}
```
O último item fica destacado em dourado. Valores curtos (até 4 caracteres) saem maiores.

```json
{"tipo": "donut", "percentual": 80, "titulo": "100 programas analisados", "rotulo": "automatizaram trabalho manual", "resto": "os outros 20% substituíram softwares"}
```

```json
{"tipo": "lista", "titulo": "Os gargalos estão dentro de casa", "icone": "alerta", "itens": [
  {"texto": "Resistência de especialistas", "ancora": "resistência de especialistas"},
  {"texto": "Adoção desigual entre equipes", "ancora": "adoção desigual"}]}
```
`icone`: `check`, `alerta` ou `numero`. Máximo de 4 itens.

```json
{"tipo": "citacao", "texto": "Podemos não estar demitindo, mas também não estamos contratando.", "autor": "Entrevistado do estudo (tradução livre)"}
```

```json
{"tipo": "multiplicador", "de": 1, "para": 4, "rotulo": "mais gente seria necessária sem IA", "detalhe": "média estimada por 6 startups"}
```
Funciona melhor no layout `grafico`.

```json
{"tipo": "chips", "titulo": "Quem participou", "itens": ["Startups", "Indústrias", "Advocacia", "Contabilidade"]}
```

```json
{"tipo": "lema", "linhas": ["IA é o copiloto.", "Cultura, decisão e", "responsabilidade", "continuam humanas."], "destaques": ["copiloto", "humanas"]}
```

```json
{"tipo": "cta", "acao": "Quer o estudo completo?", "palavra": "ESTUDO", "detalhe": "Comenta aqui que eu te mando o link"}
```

## Criando um tipo novo

1. Acrescente o tipo em `video/src/types.ts` (união `Grafico`).
2. Escreva o componente em `video/src/graficos/Graficos.tsx` usando `entrada(t, atraso)` e `sobe(p)`.
   Desenhe para um palco de 1080 x 700; o motor escala para caber em cada layout.
3. Registre no `switch` de `RenderGrafico` e documente aqui.
