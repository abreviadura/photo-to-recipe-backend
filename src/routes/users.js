import { Router } from "express";
import { authenticate } from "../middlewares/authenticate.js";

const router = Router();

router.get("/me", authenticate, async (req, res) => {
  res.json({
    status: 200,
    data: req.user,
  });
});

export default router;
