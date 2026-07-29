class ApiResponse<T = unknown> {
  status: number;
  message: string;
  data: T | undefined;
  sucess: boolean;

  constructor(status: number, message = "Success", data?: T) {
    this.status = status;
    this.message = message;
    this.data = data;
    this.sucess = status < 400;
  }
}

export { ApiResponse };
