import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";

const app = new Hono();
// Use the cors middleware
app.use(
  "*",
  cors({
    origin: "*", // Allows all origins, adjust as needed
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allowed methods
    allowHeaders: ["*"], // Allowed headers
  })
);
app.get("/", (c) => c.text("Hello Node.js from Edge!"));
app.post("/", async (c) => {
  const body = await c.req.parseBody();
  console.log("POST", body, c.req.query());
  return c.json({
    _entry: "0",
    _objs: ["Hello Node.js from Edge!"],
    // data: "Hello Node.js from Edge!",
  });
});

const port = Number(process.env.PORT) || 8082;
serve({
  fetch: app.fetch.bind(app),
  port,
});

console.log(`

Edge Server running at http://localhost:${port}/

`);
