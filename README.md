# cron-help

Uma ferramenta de linha de comando para traduzir expressões cron para português e calcular as próximas execuções.

## O que é

`cron-help` lê uma expressão cron de 5 campos e mostra uma descrição legível em português, além das próximas N execuções a partir de agora.

## Por que existe

Eu sempre esqueço como funcionam os campos do cron, principalmente quando envolve listas e intervalos. Em vez de abrir uma documentação, posso rodar este comando e ver a tradução e os próximos horários.

## Como rodar

```bash
node src/index.js "*/15 9-18 * * 1-5"
```

Saída:

```
A cada 15 minutos, entre 9 e 18 horas, de segunda a sexta-feira
Próximas execuções:
  2025-04-07 09:00
  2025-04-07 09:15
  ...
```

Sem argumentos, mostra a ajuda.

## Como funciona

A expressão é dividida em cinco partes: minuto, hora, dia do mês, mês e dia da semana. Cada parte é interpretada por um parser simples que expande listas (`1,2`), intervalos (`1-5`) e passos (`*/10`). A descrição é montada com base nos valores expandidos. O cálculo das próximas execuções percorre os minutos a partir do horário atual e verifica se cada campo corresponde ao valor corrente.
