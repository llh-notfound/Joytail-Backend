const express = require('express');
const { protect } = require('../middleware/auth');
const upload = require('../utils/fileUpload');

const router = express.Router();

// Upload image
router.post('/upload-image', protect, upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '未上传文件',
        data: null
      });
    }
    
    const type = req.body.type || 'common';
    const fileUrl = `/uploads/${type}/${req.file.filename}`;
    
    return res.status(200).json({
      code: 200,
      message: '上传成功',
      data: {
        url: fileUrl
      }
    });
  } catch (error) {
    console.error('Upload image error:', error);
    return res.status(500).json({
      code: 500,
      message: '服务器错误',
      data: null
    });
  }
});

// Get user policy
router.get('/user-policy', (req, res) => {
  return res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      content: `
        # 用户协议
        
        ## 1. 服务条款
        欢迎使用PetPal平台提供的服务。本协议是您与PetPal平台之间关于您使用PetPal平台服务所订立的协议。
        
        ## 2. 账号注册与安全
        2.1 用户在使用本服务前需要注册一个"PetPal"账号。
        2.2 用户应当保证账号安全，对账号下的所有活动负责。
        
        ## 3. 隐私保护
        我们重视您的隐私。您在使用我们的服务时，我们可能会收集和使用您的相关信息。
        
        ## 4. 内容规范
        用户不得利用"PetPal"账号制作、上传、发布、传播违反国家法律法规的内容。
        
        ## 5. 知识产权
        PetPal平台提供的服务中包含的任何文本、图片、图形、音频和/或视频资料均受版权、商标和/或其他财产所有权法律的保护。
        
        ## 6. 服务变更、中断或终止
        PetPal平台可能会对服务内容进行变更，也可能会中断、中止或终止服务。
        
        ## 7. 免责声明
        用户明确了解并同意，PetPal平台不对因下述任一情况而导致的任何损害赔偿承担责任。
        
        ## 8. 协议修改
        PetPal平台有权在必要时修改本协议条款，协议条款一旦发生变动，将会在相关页面上公布修改后的协议条款。
        `
    }
  });
});

// Get privacy policy
router.get('/privacy-policy', (req, res) => {
  return res.status(200).json({
    code: 200,
    message: 'success',
    data: {
      content: `
        # 隐私政策
        
        ## 1. 信息收集
        我们可能收集您的个人信息，包括但不限于姓名、电话号码、电子邮件地址、位置信息等。
        
        ## 2. 信息使用
        我们使用收集的信息为您提供、维护、保护和改进我们的服务，开发新的服务，并保护PetPal平台和用户。
        
        ## 3. 信息共享
        除非获得您的同意，或者法律要求，或者以下情形，否则我们不会与任何第三方分享您的个人信息。
        
        ## 4. 信息安全
        我们致力于保护PetPal平台用户的信息安全。我们使用各种安全技术和程序来保护您的个人信息不被未经授权的访问、使用或泄露。
        
        ## 5. Cookie的使用
        为了确保网站正常运转，我们有时会在您的设备上存储名为Cookie的小数据文件。
        
        ## 6. 政策更新
        我们可能会不时更新本隐私政策。我们会在本页面上发布任何隐私政策变更，如果变更很重大，我们会提供更显著的通知。
        
        ## 7. 联系我们
        如果您对本隐私政策有任何疑问，请联系我们的客服团队。
        `
    }
  });
});

module.exports = router; 