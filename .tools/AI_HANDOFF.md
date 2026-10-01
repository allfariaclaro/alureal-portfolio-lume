# LUME — correção do catálogo (2026-10-01)

ESCOPO: corrigir filtros e ordenação existentes; base auditada 555db212cad30ebc54d540a1e3b33a0a7de48e23. Branch fix/catalog-filters, checkout isolado. Dados/preços e temas preservados.

FEITO: seleção única sobre os 12 produtos; busca com acentos normalizados, categoria, cinco filtros em interseção e ordenação; home preserva seções editoriais sem critérios e mostra catálogo completo ao filtrar. Contador, vazio, limpar critérios e estado em URL. Ações reatadas após render. Mais pedidos usa exclusivamente badge existente, sem inventar volume. Sem álcool usa badge explícita.

TESTADO: node --check delivery.js/delivery-data.js; 13 assertions Node sem dependências; ChromeOS Chrome via Chromebook Control em localhost. Home Bebidas=2, Entradas=croquete; Até R$40=6; Menor preço=soda 13,90; composição e vazio; três repetições; favorito/adicionar soda; abrir produto; voltar/avançar com query/categoria/filtro/sort preservados. Menu em 390x844 e desktop 1440x900 sem overflow horizontal; claro/escuro; capturas inspecionadas. Console monitorado na recarga final e cenários menu: zero entradas. Dados delivery-data.js intactos. Workflow mantém trigger de deploy exclusivamente main/manual; acrescenta teste Node ao gate existente.

EVIDÊNCIAS: ../lume-evidence/baseline.tar e baseline.sha256 (backup anterior às edições); browser-results.json; menu-mobile.png; menu-desktop.png. QA local, não produção. Testes podem ser repetidos com `node tests/catalog.test.cjs`. Algumas ações de alto nível do conector não dispararam apesar de retorno clicked; cenários foram executados por DOM clicks/events no Chrome real via CDP. Voltar/avançar validados com History API no navegador.

PENDENTE: revisão do pai; somente depois decidir merge/publicação e QA na URL real. Sem merge, push em main, DNS, pagamentos ou backend. Nenhuma feature adicional.

PRÓXIMO PASSO: revisar diff e evidências do PR draft. MODELO PARA PRÓXIMA ETAPA: manter configuração solicitada GPT-6.1 Sol Medium; configuração efetiva/Fast não verificada por metadados nesta sessão.

## Complemento da revisão do pai — retorno explícito e CI de PR

FEITO: ambos os links de card e quick-add com opções obrigatórias transportam retorno relativo do catálogo atual. Produto usa data-catalog-return e allowlist exata index.html/menu.html, mantendo apenas q/category/filters/sort; rejeita protocolo, URL absoluta, caminhos, fragmento, barra invertida e quebras de linha. Fallback menu.html. Workflow validate-pr.yml separado, evento pull_request, contents:read, somente checkout/sintaxe/testes; sem ambiente Pages, publish ou permissão de deploy.

TESTADO: 13 assertions anteriores +22 novas de allowlist/links; sintaxe; estrutura YAML; Chrome real: menu filtrado → produto → link explícito, quatro critérios/resultados/favorito/carrinho preservados; retorno externo malicioso vira menu.html; home filtrada → produto → link explícito restaura estado. Console monitorado: zero entradas. delivery-data.js mantém blob daf713d9ec797fe6c4f8dc270663d9a9e916cbec, idêntico à base. Evidências adicionais em ../lume-evidence/return-ci-browser.json e final-head-tests.txt.

PENDENTE: concluir checks CI no HEAD enviado e revisão do pai. Sem merge/publicação nesta chamada.
