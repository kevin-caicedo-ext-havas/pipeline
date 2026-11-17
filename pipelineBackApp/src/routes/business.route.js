import {Router} from 'express'
import { getBusiness, getOneBusiness, createBusiness, putBusiness, deleteBusiness } from '../controllers/business.controllers.js'

const router = Router()

router.get("/business", getBusiness)

router.get("/business/:id", getOneBusiness)

router.post("/business", createBusiness)

router.put("/business/:id", putBusiness)

router.delete("/business/:id", deleteBusiness)

export default router