import type { Manual } from "./tipos";

/** Manual do usuário — Português. */
export const manual: Manual = {
  titulo: "Manual do usuário",
  bajada:
    "Tudo o que você precisa para registrar um lote, acompanhar sua cadeia de custódia e verificar sua integridade pelo celular ou pelo computador.",
  secciones: [
    {
      id: "que-es",
      titulo: "O que é o AgroTrace e como funciona",
      parrafos: [
        "O AgroTrace Rural abre um canal direto entre a fazenda e o comprador. Cada colheita registrada recebe um código único (por exemplo HUE-2026-008), sua própria página pública e uma etiqueta QR para colar na bandeja. Quem compra escaneia o código e vê a origem, a data, as fotos e a linha do tempo do lote.",
        "O princípio é simples: arquivos pesados nunca vão para a blockchain. As fotos ficam em armazenamento externo e para o Stellar vai apenas a impressão digital SHA-256 de 32 bytes, dentro do memo de um pagamento de 1 XLM.",
      ],
      tabla: {
        columnas: ["Dado que entra na impressão", "Exemplo"],
        filas: [
          ["Código do lote", "HUE-2026-008"],
          ["Data da colheita", "2026-10-25"],
          ["Linha produtiva", "Ovos Guarumo"],
          ["Quantidade e unidade", "35 bandejas"],
          ["Fazenda e município", "Finca Guarumo · Cáceres, Antioquia"],
          ["Evidências (nome e tamanho)", "ATR-1.jpg · 74776 bytes"],
        ],
      },
      aviso: {
        tono: "nota",
        titulo: "Se alguém alterar uma foto ou um dado",
        texto:
          "A impressão recalculada deixa de coincidir com a ancorada e a página avisa. O registro original continua intacto na rede.",
      },
    },
    {
      id: "consultar",
      titulo: "Consultar um lote (para o comprador)",
      pasos: [
        {
          titulo: "Escaneie o QR",
          texto:
            "Use a câmera do celular na etiqueta da bandeja. A página pública do lote se abre.",
        },
        {
          titulo: "Leia a ficha",
          texto:
            "Você verá o selo de verificação, o código do lote, a linha produtiva, as fotos em carrossel e os dados: produtor, localização, data, quantidade e situação.",
        },
        {
          titulo: "Verifique a integridade",
          texto:
            "Toque no ícone de informação ao lado de “Situação” para ver o hash registrado, o hash recalculado e a transação no Stellar.",
        },
      ],
      aviso: {
        tono: "info",
        titulo: "Se o código não existir",
        texto:
          "A página informa “Lote não encontrado” e não mostra dados guardados no seu navegador: um QR falso não passa por autêntico.",
      },
    },
    {
      id: "registrar",
      titulo: "Registrar um lote (para o produtor)",
      parrafos: [
        "Você precisa entrar com sua conta do Google e, na primeira vez, completar seu perfil (documento, telefone, fazenda e município). Depois disso, o registro acontece em três etapas.",
      ],
      pasos: [
        {
          titulo: "Dados do lote",
          texto:
            "Produto, data de produção, quantidade com sua unidade e, se quiser, a data de postura.",
        },
        {
          titulo: "Evidências",
          texto:
            "Anexe pelo menos uma foto: é obrigatório. Dá para subir até seis, e elas são comprimidas para 800 px para o registro continuar leve.",
        },
        {
          titulo: "Resumo",
          texto:
            "Revise tudo e salve. O código HUE-YYYY-NNN é gerado, a impressão é calculada e ancorada no Stellar.",
        },
      ],
      aviso: {
        tono: "nota",
        titulo: "Se a rede falhar ao ancorar",
        texto:
          "O lote fica salvo e a ancoragem pode ser refeita mais tarde. Nunca se cria um lote fantasma nem se perdem fotos.",
      },
    },
    {
      id: "custodia",
      titulo: "Cadeia de custódia",
      parrafos: [
        "Com o lote registrado você pode anotar as etapas da mercadoria: classificação, embalagem e expedição, cada uma com data, hora e descrição. O comprador vê isso na linha do tempo da página pública.",
      ],
      aviso: {
        tono: "nota",
        titulo: "Os eventos não fazem parte da impressão",
        texto:
          "São registrados depois de ancorar o lote e descrevem o que aconteceu com a mercadoria, não os dados que foram selados.",
      },
    },
    {
      id: "verificar",
      titulo: "Verificar a integridade",
      lista: [
        "Lote verificado: a impressão recalculada coincide com a ancorada no Stellar Testnet.",
        "Lote não verificado: a impressão não coincide com a âncora.",
        "Verificação indisponível: não foi possível consultar o backend ou a rede Stellar.",
      ],
      parrafos: [
        "No detalhe você pode abrir a transação no explorador Horizon e ler o memo, onde está a impressão em hexadecimal. A rede em uso é a Stellar Testnet, a de testes.",
      ],
    },
    {
      id: "etiqueta",
      titulo: "Etiquetas QR",
      pasos: [
        {
          titulo: "Abra a etiqueta",
          texto: "Na ficha do lote, pelo botão “Ver etiqueta QR”.",
        },
        {
          titulo: "Imprima",
          texto: "Pelo navegador ou salvando a imagem.",
        },
        {
          titulo: "Cole uma por bandeja",
          texto:
            "Cada etiqueta leva seu código, a fazenda, a quantidade e a data de embalagem.",
        },
      ],
      parrafos: [
        "O código é dimensionado entre 150 e 300 px conforme o espaço disponível, sempre centralizado e com uma zona de silêncio que facilita a leitura. A etiqueta é impressa sempre no tema claro, mesmo com o aplicativo no modo escuro.",
      ],
    },
    {
      id: "ayuda",
      titulo: "Ajuda e limites",
      lista: [
        "O AgroTrace prova que o registro não foi alterado; não certifica a qualidade do produto nem substitui o registro sanitário oficial.",
        "A ancoragem acontece na Stellar Testnet, a rede de testes.",
        "As fotos ficam em armazenamento externo, não na blockchain.",
      ],
      parrafos: [
        "Se o backend não responde, o aplicativo continua funcionando com os dados guardados no seu navegador e avisa na tela. Esse é o modo demo: serve para explorar, não para registrar informação real.",
        "Para relatar um problema ou pedir ajuda, use a página “Relatar um problema”.",
      ],
    },
  ],
};
