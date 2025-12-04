export interface ErrorSources {
  path: string;
  message: string;
}
export interface HandlerResponse {
  statuscode: number;
  message: string;
  errorSources?: ErrorSources[];
}
