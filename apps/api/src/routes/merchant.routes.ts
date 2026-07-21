import { Hono } from "hono";

const merchantRouter = new Hono();

merchantRouter.get("/me", (c) => {
  return c.json({ error: "Not implemented" }, 501);
});

merchantRouter.post("/", (c) => {
  return c.json({ error: "Not implemented" }, 501);
});

merchantRouter.put("/me", (c) => {
  return c.json({ error: "Not implemented" }, 501);
});

export default merchantRouter;
