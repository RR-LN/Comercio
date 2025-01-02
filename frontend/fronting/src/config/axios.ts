import axios from 'axios'

const axiosConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
}

export default axiosConfig