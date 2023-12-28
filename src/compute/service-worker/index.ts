import type { QRL } from "@builder.io/qwik";
import {
  _deserializeData,
  _getContextElement,
  _getContextEvent,
  _serializeData,
  implicit$FirstArg,
  $,
} from "@builder.io/qwik";
import type { RequestEventBase } from "@builder.io/qwik-city";
import { isServer } from "@builder.io/qwik/build";

declare interface ServerConstructorQRL {
  getCaptured(): unknown;
  <T extends ServerFunction>(fnQrl: QRL<T>): QRL<T>;
}

declare interface ServerFunction {
  (this: RequestEventBase, ...args: any[]): any;
}

const deserializeStream = async function* (
  stream: ReadableStream<Uint8Array> | null,
  ctxElm: unknown,
  signal: { aborted: any }
) {
  const reader = stream?.getReader();
  try {
    let buffer = "";
    const decoder = new TextDecoder();
    while (!signal.aborted) {
      const result = await reader?.read();
      if (result?.done) break;
      buffer += decoder.decode(result?.value, {
        stream: true,
      });
      const lines = buffer.split(/\n/);
      // @ts-ignore
      buffer = lines.pop();
      for (const line of lines) yield await _deserializeData(line, ctxElm);
    }
  } finally {
    reader?.releaseLock();
  }
};

// @ts-ignore
export const serviceWorkerQrl: ServerConstructorQRL = (
  qrl: QRL<(...args: any[]) => any>
) => {
  if (isServer) {
    const captured = qrl.getCaptured();
    if (captured && captured.length > 0 && !_getContextElement()) {
      throw new Error(
        "For security reasons, we cannot serialize QRLs that capture lexical scope."
      );
    }
  }

  function rpc() {
    return $(async function (this: any, ...args: any[]) {
      const signal =
        args.length > 0 && args[0] instanceof AbortSignal
          ? (args.shift() as AbortSignal)
          : undefined;
      if (isServer) {
        const requestEvent = [this, _getContextEvent()].find(
          (v) =>
            v &&
            Object.prototype.hasOwnProperty.call(v, "sharedMap") &&
            Object.prototype.hasOwnProperty.call(v, "cookie")
        );
        return qrl.apply(requestEvent, args);
      } else {
        const ctxElm = _getContextElement();
        const filtered = args.map((arg) => {
          if (
            arg instanceof SubmitEvent &&
            arg.target instanceof HTMLFormElement
          ) {
            return new FormData(arg.target);
          } else if (arg instanceof Event) {
            return null;
          } else if (arg instanceof Node) {
            return null;
          }
          return arg;
        });
        const hash = qrl.getHash();
        const origin = "";
        // change url or change origin to resolve to edge first
        const res = await fetch(`${origin}/?qfunc=${hash}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/qwik-json",
            "X-QRL": hash,
          },
          signal,
          body: await _serializeData([qrl, ...filtered], false),
        });

        const contentType = res.headers.get("Content-Type");
        if (res.ok && contentType === "text/qwik-json-stream" && res.body) {
          return (async function* () {
            try {
              for await (const result of deserializeStream(
                res.body!,
                ctxElm ?? document.documentElement,
                signal as AbortSignal
              )) {
                yield result;
              }
            } finally {
              if (!signal?.aborted) {
                await res.body!.cancel();
              }
            }
          })();
        } else if (contentType === "application/qwik-json") {
          const str = await res.text();
          const obj = await _deserializeData(
            str,
            ctxElm ?? document.documentElement
          );
          if (res.status === 500) {
            throw obj;
          }
          return obj;
        }
      }
    }) as any;
  }
  return rpc();
};

/** @public */
export const serviceWorker$ = /*#__PURE__*/ implicit$FirstArg(serviceWorkerQrl);
