
export interface ISuspenseJsonRootEncoderOptions  {
   state: SuspenseJsonStreamState
}
export interface ISuspenseJsonEncoderOptions extends ISuspenseJsonRootEncoderOptions {
   start?: (controller: ReadableStreamDefaultController) => void | Promise<void> | undefined,
}

export interface ISuspenseJsonStreamStateOptions {
   idIterator?: Generator<string | number, void, unknown> | undefined,
   resolved?: Map<string, unknown> | undefined,
   toSend?: { placeholder: string, data: string }[] | undefined,
   notResolved?: Set<string> | undefined,
   initiated?: boolean | undefined,
}

export declare class SuspenseJsonStreamState {
    constructor(options?: ISuspenseJsonStreamStateOptions);
    getPlaceholder(): string
    resolve(placeholder: string, data: unknown): void;
}

export declare class SuspenseJsonEncoder extends ReadableStream<Uint8Array> {
    constructor(options?: ISuspenseJsonEncoderOptions);
    getPlaceholder(): string;
    resolve(placeholder:string, data:unknown): void;
}

export declare class SuspenseJsonRootEncoder extends SuspenseJsonEncoder {
    constructor(rootBuilder: (state: SuspenseJsonStreamState) => Promise<unknown> | unknown, options?: ISuspenseJsonRootEncoderOptions);
}
