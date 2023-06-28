import express from "express";
import { initialData } from "./initialData";

const v1router = express.Router();

v1router.get("/initial", initialData);

export { v1router };