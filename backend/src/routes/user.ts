import express, { Router, Request, Response } from "express";

const router: Router = express.Router();

// Get User Info
router.get("/", (req: Request, res: Response) => {
    res.send("Get User");
});

// Signup User
router.post("/", (req: Request, res: Response) => {
    const data = { user_id: 1234, name: "Kim Seungy Yong" };

    res.json(data);
});

// Update User Info
router.put("/", (req: Request, res: Response) => {
    res.send("Update!");
});

// Delete User Info
router.delete("/", (req: Request, res: Response) => {
    res.send("Delete!");
});

export default router;
