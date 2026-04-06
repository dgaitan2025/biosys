import http from '../api/nodohttp'

export function useApi() {
  const get = async (url, params = {}) => {
    const response = await http.get(url, { params })
    return response.data
  }

  const post = async (url, data = {}) => {
    const response = await http.post(url, data)
    return response.data
  }

  const put = async (url, data = {}) => {
    const response = await http.put(url, data)
    return response.data
  }

  const remove = async (url) => {
    const response = await http.delete(url)
    return response.data
  }

  return {
    get,
    post,
    put,
    remove
  }
}