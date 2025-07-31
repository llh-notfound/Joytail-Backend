const express = require('express');
const { body } = require('express-validator');
const { protect } = require('../middleware/auth');
const petController = require('../controllers/petController');
const upload = require('../utils/fileUpload');

const router = express.Router();

// Pet validation
const petValidation = [
  body('name').notEmpty().withMessage('宠物名称不能为空'),
  body('type').notEmpty().withMessage('宠物类型不能为空'),
  body('breed').notEmpty().withMessage('宠物品种不能为空'),
  body('age').isNumeric().withMessage('宠物年龄必须是数字'),
  body('gender').notEmpty().withMessage('宠物性别不能为空'),
  body('weight').isNumeric().withMessage('宠物体重必须是数字')
];

// Get pet list
router.get('/list', protect, petController.getPetList);

// Get pet detail
router.get('/detail/:petId', protect, petController.getPetDetail);

// Add pet
router.post('/add', protect, petValidation, petController.addPet);

// Update pet
router.put('/update/:petId', protect, petController.updatePet);

// Delete pet
router.delete('/delete/:petId', protect, petController.deletePet);

// Upload pet avatar
router.post('/upload-avatar', protect, upload.single('file'), petController.uploadAvatar);

// Get pet health records
router.get('/:petId/health-records', protect, petController.getPetHealthRecords);

// Add health record
router.post('/:petId/health-records/add', protect, petController.addHealthRecord);

// Get pet vaccination records
router.get('/:petId/vaccinations', protect, petController.getPetVaccinations);

// Add vaccination record
router.post('/:petId/vaccinations/add', protect, petController.addVaccinationRecord);

module.exports = router; 