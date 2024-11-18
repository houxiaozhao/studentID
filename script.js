document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('studentForm');
    const canvas = document.getElementById('previewCanvas');
    const ctx = canvas.getContext('2d');
    const downloadBtn = document.getElementById('downloadBtn');

    // 设置画布大小
    canvas.width = 1000;
    canvas.height = 750;

    // 背景图片对象
    const backgrounds = {
        desk1: './backgrounds/desk1.jpg',
        desk2: './backgrounds/desk2.jpg',
        desk3: './backgrounds/desk3.jpg',
        desk4: './backgrounds/desk4.jpg'
    };

    let logoImage = null;

    // 监听所有输入变化
    const inputs = document.querySelectorAll('input, select');
    inputs.forEach(input => {
        input.addEventListener('input', generateStudentCard);
    });


    form.addEventListener('submit', async function (e) {
        e.preventDefault();



        // 生成学生证照片
        await generateStudentCard();
    });

    document.getElementById('logoUpload').addEventListener('change', function (event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function (e) {
                loadImage(e.target.result).then(img => {
                    logoImage = img;
                    generateStudentCard(); // 重新生成学生证以显示校徽
                });
            };
            reader.readAsDataURL(file);
        }
    });

    async function generateStudentCard() {
        try {
            // 获取表单数据
            const data = {
                name: document.getElementById('name').value,
                studentId: document.getElementById('studentId').value,
                school: document.getElementById('school').value,
                department: document.getElementById('department').value,
                major: document.getElementById('major').value,
                validDate: document.getElementById('validDate').value,
                photo: document.getElementById('photo').files[0],
                background: document.getElementById('background').value
            };
            // 清空画布
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // 加载并绘制桌面背景
            const bgImg = await loadImage(backgrounds[data.background]);
            ctx.drawImage(bgImg, 0, 0, canvas.width, canvas.height);

            // 添加阴影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;

            // 绘制学生证（白色背景）
            const cardWidth = 400;
            const cardHeight = 250;
            const cardX = (canvas.width - cardWidth) / 2;
            const cardY = (canvas.height - cardHeight) / 2;

            // 绘制学生证背景（白色卡片）
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

            // 重置阴影效果
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;

            // 添加学生证边框
            ctx.strokeStyle = '#1B4B8A';
            ctx.lineWidth = 2;
            ctx.strokeRect(cardX, cardY, cardWidth, cardHeight);

            // 添加顶部蓝色条纹
            ctx.fillStyle = '#1B4B8A';
            ctx.fillRect(cardX, cardY, cardWidth, 40);

            // 绘制学校名称（在蓝色条纹上）
            ctx.fillStyle = '#FFFFFF';
            ctx.font = 'bold 24px Microsoft YaHei';
            ctx.textAlign = 'center';
            ctx.fillText(data.school, cardX + cardWidth / 2, cardY + 28);

            // 重置文本对齐
            ctx.textAlign = 'left';


            // 绘制照片区域
            ctx.strokeStyle = '#1B4B8A';
            ctx.lineWidth = 1;
            ctx.strokeRect(cardX + 20, cardY + 50, 100, 140);

            // 绘制学生照片
            if (data.photo) {
                const photo = await loadImage(URL.createObjectURL(data.photo));
                ctx.drawImage(photo, cardX + 20, cardY + 50, 100, 140);
            }

            // 绘制信息文字
            ctx.fillStyle = '#333333';
            ctx.font = '16px Microsoft YaHei';

            // 绘制表格线
            const startX = cardX + 130;
            const startY = cardY + 60;
            const lineHeight = 30;

            // 绘制横线
            for (let i = 0; i <= 6; i++) {
                ctx.beginPath();
                ctx.moveTo(startX, startY + i * lineHeight);
                ctx.lineTo(cardX + cardWidth - 20, startY + i * lineHeight);
                ctx.strokeStyle = '#1B4B8A';
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            // 绘制竖线
            ctx.beginPath();
            ctx.moveTo(startX + 60, startY);
            ctx.lineTo(startX + 60, startY + 5 * lineHeight);
            ctx.stroke();

            // 绘制文字信息
            const textStartX = startX + 10;
            ctx.fillStyle = '#333333';
            ctx.font = '14px Microsoft YaHei';

            ctx.fillText('姓名', textStartX, startY + lineHeight - 8);
            ctx.fillText('学号', textStartX, startY + lineHeight * 2 - 8);
            ctx.fillText('院系', textStartX, startY + lineHeight * 3 - 8);
            ctx.fillText('专业', textStartX, startY + lineHeight * 4 - 8);
            ctx.fillText('有效期', textStartX, startY + lineHeight * 5 - 8);

            ctx.font = 'bold 14px Microsoft YaHei';
            ctx.fillText(data.name, startX + 70, startY + lineHeight - 8);
            ctx.fillText(data.studentId, startX + 70, startY + lineHeight * 2 - 8);
            ctx.fillText(data.department, startX + 70, startY + lineHeight * 3 - 8);
            ctx.fillText(data.major, startX + 70, startY + lineHeight * 4 - 8);
            ctx.fillText(data.validDate, startX + 70, startY + lineHeight * 5 - 8);


            // 绘制校徽（半透明）
            if (logoImage) {
                const logoSize = 50; // 校徽大小
                ctx.globalAlpha = 0.5; // 设置校徽半透明
                ctx.drawImage(logoImage, cardX + cardWidth - logoSize - 10, cardY + 10, logoSize, logoSize);
                ctx.globalAlpha = 1.0; // 恢复不透明
            }

            // 显示下载按钮
            downloadBtn.style.display = 'inline-block';
        } catch (error) {
            console.error('生成学生证失败:', error);
            alert('背景图片加载失败，请确保图片路径正确');
        }
    }
    generateStudentCard()
    // 图片加载函数
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (e) => {
                console.error('图片加载失败:', src, e);
                reject(new Error(`Failed to load image: ${src}`));
            };
            img.src = src;
        });
    }

    // 下载功能
    downloadBtn.addEventListener('click', function () {
        const link = document.createElement('a');
        link.download = '学生证照片.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });

}); 