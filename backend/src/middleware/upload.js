// Importações de módulos necessários para lidar com upload de arquivos e manipulação do sistema de arquivos.
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Define a pasta onde os uploads enviados pelo usuário serão salvos (uploads/ no diretório raiz do projeto).
const uploadDir = path.join(process.cwd(), 'uploads')

// Garante que a pasta uploads existe fisicamente. Se não existir, cria de forma recursiva.
fs.mkdirSync(uploadDir, { recursive: true })

/**
 * Configuração e inicialização do middleware Multer para gerenciar o upload de imagens/anexos.
 */
const upload = multer({
  storage: multer.diskStorage({
    // Define a pasta de destino do arquivo.
    destination: (_req, _file, cb) => cb(null, uploadDir),
    // Define o nome que o arquivo receberá no servidor para evitar conflito de nomes repetidos.
    filename: (_req, file, cb) => {
      // Gera um sufixo composto pelo timestamp atual concatenado com um número randômico.
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
      // Obtém a extensão original do arquivo enviado pelo usuário (ex: .png, .jpg).
      const extension = path.extname(file.originalname || '')
      // Retorna o nome único concatenado com a extensão (ex: 17182938192-384910283.png).
      cb(null, `${uniqueSuffix}${extension}`)
    },
  }),
})

module.exports = { upload, uploadDir }
