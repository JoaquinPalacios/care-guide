declare module "pg" {
  export class Client {
    constructor(config: { connectionString: string });
    connect(): Promise<void>;
    query(
      text: string,
      values?: unknown[]
    ): Promise<{ rowCount: number | null }>;
    end(): Promise<void>;
  }
}
