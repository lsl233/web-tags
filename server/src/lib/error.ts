class ServerError extends Error {
  constructor(
    message: string,
    public code: number = 500,
  ) {
    super(message);
  }

  static Unauthorized(message: string) {
    return new ServerError(message, 401);
  }

  static Forbidden(message: string) {
    return new ServerError(message, 403);
  }

  static NotFound(message: string) {
    return new ServerError(message, 404);
  }

  static BadRequest(message: string) {
    return new ServerError(message, 400);
  }
}

export default ServerError;
