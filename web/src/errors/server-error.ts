export class ServerError extends Error {
  constructor(msg?: string) {
    super(msg ?? 'Erro inesperado no servidor. Tente novamente em alguns instantes.')
  }
}
