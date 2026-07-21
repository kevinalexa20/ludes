import { Hono } from "hono";

const aiRouter = new Hono();

aiRouter.post("/generate-listing", (c) => {
  return c.json({ error: "Not implemented" }, 501);
});

export default aiRouter;
