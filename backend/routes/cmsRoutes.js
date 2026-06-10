import { Router } from "express";
import * as cms from "../controller/cmsController.js";

const router = Router();

router.get("/api/cms/content", cms.getCmsContent);
router.post("/api/cms/content", cms.upsertCmsContent);

router.get("/api/cms/styles", cms.getCmsStyles);
router.post("/api/cms/styles", cms.upsertCmsStyles);

router.post("/api/cms/reset", cms.factoryReset);

// categories
router.get("/api/categories", cms.getCategories);
router.post("/api/categories", cms.addCategory);
router.put("/api/categories/:id", cms.updateCategory);
router.delete("/api/categories/:id", cms.deleteCategory);

// banners
router.get("/api/banners", cms.getBanners);
router.post("/api/banners", cms.addBanner);
router.put("/api/banners/:id", cms.updateBanner);
router.delete("/api/banners/:id", cms.deleteBanner);

// media
router.get("/api/media", cms.getMedia);
router.post("/api/media", cms.addMedia);
router.delete("/api/media/:id", cms.deleteMedia);

// testimonials
router.get("/api/testimonials", cms.getTestimonials);
router.post("/api/testimonials", cms.addTestimonial);
router.put("/api/testimonials/:id", cms.updateTestimonial);
router.delete("/api/testimonials/:id", cms.deleteTestimonial);

// blog
router.get("/api/blog", cms.getBlog);
router.post("/api/blog", cms.addBlog);
router.put("/api/blog/:id", cms.updateBlog);
router.delete("/api/blog/:id", cms.deleteBlog);

// faqs
router.get("/api/faqs", cms.getFaqs);
router.post("/api/faqs", cms.addFaq);
router.put("/api/faqs/:id", cms.updateFaq);
router.delete("/api/faqs/:id", cms.deleteFaq);

// enquiries
router.get("/api/enquiries", cms.getEnquiries);
router.post("/api/enquiries", cms.addEnquiry);
router.put("/api/enquiries/:id/status", cms.updateEnquiryStatus);
router.delete("/api/enquiries/:id", cms.deleteEnquiry);

// newsletter
router.get("/api/newsletter", cms.getNewsletter);
router.post("/api/newsletter", cms.addNewsletter);
router.delete("/api/newsletter/:id", cms.deleteNewsletter);

export default router;
