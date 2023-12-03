import { component$ } from "@builder.io/qwik";
import type { DocumentHead } from "@builder.io/qwik-city";
import { worker$ } from "~/compute/worker";
import { aot$ } from "~/compute/aot";
import { server$ } from "~/compute/server";
import { edge$ } from "~/compute/edge";
import { origin$ } from "~/compute/origin";

export default component$(() => {
  return (
    <>
      <div>Hello world</div>

      <button
        onClick$={async () => {
          const workerMsg = await worker$(async (arg) => {
            return "Hello World" + arg;
          });

          const aotMsg = await aot$(async (arg) => {
            return "Hello World aot" + arg;
          });

          const serverMsg = await server$(async (arg) => {
            return "Hello World server" + arg;
          });

          const edgeMsg = await edge$(async (arg) => {
            return "Hello World edge" + arg;
          });
          const originMsg = await origin$(async (arg) => {
            return "Hello World origin" + arg;
          });
          const msg = [
            "worker: ",
            await workerMsg("foo"),
            "aot: ",
            await aotMsg("bar"),
            "server: ",
            await serverMsg("bar2"),
            "edge: ",
            await edgeMsg("baz"),
            "origin: ",
            await originMsg("qux"),
          ];
          console.log(...msg);
        }}
      >
        Hello everything
      </button>
      <button
        onClick$={async () => {
          const edgeMsg = await edge$(async (arg) => {
            return "Hello World edge " + arg;
          });
          const msg = ["edge: ", await edgeMsg("baz")];
          console.log(...msg);
        }}
      >
        Edge
      </button>
      <button
        onClick$={async () => {
          const workerMsg = await worker$(async (arg) => {
            return "Hello World worker " + arg;
          });
          const msg = ["worker: ", await workerMsg("baz")];
          console.log(...msg);
        }}
      >
        Worker
      </button>
      <button
        onClick$={async () => {
          const serverMsg = await server$(async (arg) => {
            return "Hello World server " + arg;
          });
          const msg = ["server: ", await serverMsg("baz")];
          console.log(...msg);
        }}
      >
        Server
      </button>
      <button
        onClick$={async () => {
          const originMsg = await origin$(async (arg) => {
            return "Hello World origin " + arg;
          });
          const msg = ["origin: ", await originMsg("qux")];
          console.log(...msg);
        }}
      >
        Origin
      </button>
    </>
  );
});

export const head: DocumentHead = {
  title: "Welcome to Qwik",
  meta: [
    {
      name: "description",
      content: "Qwik site description",
    },
  ],
};
