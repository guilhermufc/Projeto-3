/**
 * Serviço centralizado de comunicação com a API usando Fetch API nativa.
 * Substitui completamente todas as chamadas do axios no frontend do projeto.
 */

// Define a URL base padrão do servidor backend
const BASE_URL = 'http://localhost:3000'

/**
 * Obtém o cabeçalho "Authorization" contendo o token JWT se o usuário estiver autenticado.
 * @returns {Object} Um objeto contendo os headers de autenticação
 */
function getAuthHeaders() {
  const storedUser = localStorage.getItem('user')
  const headers = {}

  if (storedUser) {
    try {
      const user = JSON.parse(storedUser)
      if (user?.id) {
        headers['x-user-id'] = user.id // Envia o ID do usuário direto no cabeçalho
      }
      if (user?.username) {
        headers['x-user-username'] = user.username // Envia o nome do usuário direto
      }
    } catch (_e) {
      // Ignora falhas de parseamento do JSON
    }
  }

  return headers
}

/**
 * Trata as respostas das requisições Fetch, decodificando o JSON do corpo.
 * Lança um erro customizado caso a resposta não seja 2xx.
 * @param {Response} response Objeto da resposta nativa do Fetch
 * @returns {Promise<any>} Dados decodificados da resposta
 */
async function handleResponse(response) {
  // Tenta ler e converter a resposta como JSON, retornando null caso falhe
  const data = await response.json().catch(() => null)

  // Se o código de status HTTP não for de sucesso (200 a 299)
  if (!response.ok) {
    const error = new Error(data?.message || `Erro ${response.status}`)
    // Insere o formato de resposta similar ao que o Axios expõe para facilitar o catch
    error.response = { status: response.status, data }
    throw error
  }

  return data
}

/**
 * Utilitário para converter um objeto de chaves e valores em uma query string URL válida.
 * @param {Object} params Objeto com os parâmetros de consulta (ex: { q: 'joao', limit: 10 })
 * @returns {string} String formatada de query (ex: "?q=joao&limit=10")
 */
function buildQueryString(params) {
  if (!params) return ''

  const searchParams = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value)
    }
  })

  const qs = searchParams.toString()
  return qs ? `?${qs}` : ''
}

/**
 * Executa uma requisição HTTP GET usando fetch nativo.
 * @param {string} path Caminho/rota da requisição (ex: '/api/posts')
 * @param {Object} [options] Opções adicionais como parâmetros e cabeçalhos extras
 */
export async function get(path, options = {}) {
  const { params, headers: extraHeaders } = options
  const queryString = buildQueryString(params)

  const response = await fetch(`${BASE_URL}${path}${queryString}`, {
    method: 'GET',
    headers: {
      ...getAuthHeaders(), // Inclui o token Authorization automaticamente
      ...extraHeaders,
    },
  })

  return handleResponse(response)
}

/**
 * Executa uma requisição HTTP POST. Suporta JSON comum ou FormData (upload de imagens).
 * @param {string} path Caminho da rota
 * @param {Object|FormData} body Corpo do envio
 * @param {Object} [options] Cabeçalhos extras
 */
export async function post(path, body = {}, options = {}) {
  const { headers: extraHeaders } = options
  const isFormData = body instanceof FormData

  const fetchOptions = {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      ...extraHeaders,
    },
    // Se for FormData, passa o objeto diretamente. Se for objeto comum, envia como string JSON.
    body: isFormData ? body : JSON.stringify(body),
  }

  // Importante: Não definir Content-Type ao enviar FormData.
  // O navegador configura automaticamente com a demarcação correta (boundary).
  if (!isFormData) {
    fetchOptions.headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${BASE_URL}${path}`, fetchOptions)
  return handleResponse(response)
}

/**
 * Executa uma requisição HTTP PUT. Usada para edição/atualização completa.
 * @param {string} path Caminho da rota
 * @param {Object|FormData} body Dados de atualização
 * @param {Object} [options] Cabeçalhos extras
 */
export async function put(path, body = {}, options = {}) {
  const { headers: extraHeaders } = options
  const isFormData = body instanceof FormData

  const fetchOptions = {
    method: 'PUT',
    headers: {
      ...getAuthHeaders(),
      ...extraHeaders,
    },
    body: isFormData ? body : JSON.stringify(body),
  }

  if (!isFormData) {
    fetchOptions.headers['Content-Type'] = 'application/json'
  }

  const response = await fetch(`${BASE_URL}${path}`, fetchOptions)
  return handleResponse(response)
}

/**
 * Executa uma requisição HTTP DELETE.
 * @param {string} path Caminho da rota a ser removida
 * @param {Object} [options] Cabeçalhos extras
 */
export async function del(path, options = {}) {
  const { headers: extraHeaders } = options

  const response = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      ...extraHeaders,
    },
  })

  return handleResponse(response)
}

/**
 * Executa uma requisição HTTP GET para uma URL externa independente do servidor da API (ex: BrasilAPI).
 * @param {string} url Rota externa completa
 */
export async function fetchExternal(url) {
  const response = await fetch(url)
  return handleResponse(response)
}
