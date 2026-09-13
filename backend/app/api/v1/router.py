from fastapi import APIRouter
from app.api.v1.auth import router as auth_router
from app.api.v1.members import router as members_router
from app.api.v1.plans import router as plans_router
from app.api.v1.attendance import router as attendance_router
from app.api.v1.measurements import router as measurements_router
from app.api.v1.trainers import router as trainers_router
from app.api.v1.reports import router as reports_router
from app.api.v1.payments import router as payments_router
from app.api.v1.user_module import router as user_module_router
from app.api.v1.reception import router as reception_router
from app.api.v1.dashboard import router as dashboard_router
from app.api.v1.admin_module import router as admin_module_router

api_router = APIRouter()

api_router.include_router(auth_router)
api_router.include_router(members_router)
api_router.include_router(plans_router)
api_router.include_router(attendance_router)
api_router.include_router(measurements_router)
api_router.include_router(trainers_router)
api_router.include_router(payments_router)
api_router.include_router(reports_router, prefix="/admin")
api_router.include_router(dashboard_router, prefix="/admin")
api_router.include_router(admin_module_router, prefix="/admin")
api_router.include_router(user_module_router, prefix="/user")
api_router.include_router(reception_router)
