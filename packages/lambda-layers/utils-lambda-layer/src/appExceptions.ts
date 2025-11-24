export class MissingEnvVarError extends Error {
  constructor(variableName: string) {
    super("Env vars not passed: " + variableName);
    this.name = "MissingEnvVarError";
  }
}

export class MissingBodyData extends Error {
  constructor() {
    super("Body data is empty");
  }
}

export class MissingParameters extends Error {
  constructor(paramName: string) {
    super("Parameter is empty: " + paramName);
  }
}
