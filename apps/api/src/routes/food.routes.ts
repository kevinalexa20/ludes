import { Hono } from "hono";

const foodRouter = new Hono();

foodRouter.get("/", (c) => {
  return c.json({ error: "Not implemented" }, 501);
});

foodRouter.get("/:id", (c) => {
  return c.json({ error: "Not implemented" }, 501);
});

foodRouter.post("/", (c) => {
  return c.json({ error: "Not implemented" }, 501);
});

foodRouter.put("/:id", (c) => {
  return c.json({ error: "Not implemented" }, 501);
});

foodRouter.delete("/:id", (c) => {
  return c.json({ error: "Not implemented" }, 501);
});

export default foodRouter;
