import { Router } from "express";
import { createCrud } from "../controllers/crudController.js";
import SchoolClass from "../models/Class.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = Router();

router.use(protect);

const classCrud = createCrud(SchoolClass, {
  textFields: ["name", "section"],
  populate: [
    {
      path: "homeroomTeacher",
      populate: { path: "user", select: "name email" },
    },
    { path: "subjects", select: "name code" },
  ],
  sortBy: "gradeLevel",
});

router
  .route("/")
  .get(classCrud.list)
  .post(authorize("admin"), classCrud.create);
router
  .route("/:id")
  .get(classCrud.getOne)
  .put(authorize("admin"), classCrud.update)
  .delete(authorize("admin"), classCrud.remove);

export default router;
