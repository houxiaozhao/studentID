export const templates = {
    classic: {
        id: 'classic',
        name: '经典模板',
        width: 400,
        height: 250,
        render: (ctx, cardData, t, { cardX, cardY, cardWidth, cardHeight }) => {
            // 绘制白色背景
            ctx.fillStyle = "#FFFFFF";
            ctx.beginPath();
            ctx.moveTo(cardX + 10, cardY);
            ctx.lineTo(cardX + cardWidth - 10, cardY);
            ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 10);
            ctx.lineTo(cardX + cardWidth, cardY + cardHeight - 10);
            ctx.quadraticCurveTo(cardX + cardWidth, cardY + cardHeight, cardX + cardWidth - 10, cardY + cardHeight);
            ctx.lineTo(cardX + 10, cardY + cardHeight);
            ctx.quadraticCurveTo(cardX, cardY + cardHeight, cardX, cardY + cardHeight - 10);
            ctx.lineTo(cardX, cardY + 10);
            ctx.quadraticCurveTo(cardX, cardY, cardX + 10, cardY);
            ctx.closePath();
            ctx.fill();

            // 绘制蓝色标题栏
            ctx.fillStyle = "#1B4B8A";
            ctx.beginPath();
            ctx.moveTo(cardX + 10, cardY);
            ctx.lineTo(cardX + cardWidth - 10, cardY);
            ctx.quadraticCurveTo(cardX + cardWidth, cardY, cardX + cardWidth, cardY + 10);
            ctx.lineTo(cardX + cardWidth, cardY + 40);
            ctx.lineTo(cardX, cardY + 40);
            ctx.lineTo(cardX, cardY + 10);
            ctx.quadraticCurveTo(cardX, cardY, cardX + 10, cardY);
            ctx.closePath();
            ctx.fill();

            // 绘制学校名称
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 24px Microsoft YaHei";
            ctx.textAlign = "center";
            ctx.fillText(cardData.school || "", cardX + cardWidth / 2, cardY + 28);

            // 绘制照片框和照片
            ctx.strokeStyle = "#1B4B8A";
            ctx.lineWidth = 1;
            ctx.strokeRect(cardX + 20, cardY + 60, 100, 140);

            if (cardData.photo) {
                ctx.drawImage(cardData.photo, cardX + 20, cardY + 60, 100, 140);
            }

            // 绘制文本信息
            const startX = cardX + 130;
            const startY = cardY + 60;
            const lineHeight = 30;
            const labelWidth = 90;

            // 绘制表格线
            for (let i = 0; i <= 5; i++) {
                ctx.beginPath();
                ctx.moveTo(startX, startY + i * lineHeight);
                ctx.lineTo(cardX + cardWidth - 20, startY + i * lineHeight);
                ctx.strokeStyle = "#1B4B8A";
                ctx.lineWidth = 0.5;
                ctx.stroke();
            }

            ctx.beginPath();
            ctx.moveTo(startX + labelWidth, startY);
            ctx.lineTo(startX + labelWidth, startY + lineHeight * 5);
            ctx.stroke();

            // 绘制标签和值
            const fields = [
                { key: 'name', y: 0 },
                { key: 'studentId', y: 1 },
                { key: 'department', y: 2 },
                { key: 'major', y: 3 },
                { key: 'validDate', y: 4 }
            ];

            ctx.fillStyle = "#333333";
            ctx.font = "14px Microsoft YaHei";
            ctx.textAlign = "left";

            fields.forEach(({ key, y }) => {
                ctx.fillText(t(`form.${key}`), startX + 10, startY + lineHeight * y + lineHeight - 8);
                ctx.fillText(cardData[key] || "", startX + labelWidth + 15, startY + lineHeight * y + lineHeight - 8);
            });
        }
    },
    modern: {
        id: 'modern',
        name: '科技感',
        width: 400,
        height: 250,
        render: (ctx, cardData, t, { cardX, cardY, cardWidth, cardHeight }) => {
            // 绘制渐变背景
            const gradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
            gradient.addColorStop(0, '#1a237e');
            gradient.addColorStop(1, '#0d47a1');
            ctx.fillStyle = gradient;
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

            // 绘制装饰性线条
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 2;
            for (let i = 0; i < 5; i++) {
                const y = cardY + (i * 50);
                ctx.beginPath();
                ctx.moveTo(cardX, y);
                ctx.lineTo(cardX + cardWidth, y + 30);
                ctx.stroke();
            }

            // 绘制学校名称
            ctx.fillStyle = "#FFFFFF";
            ctx.font = "bold 24px Microsoft YaHei";
            ctx.textAlign = "left";
            ctx.fillText(cardData.school || "", cardX + 20, cardY + 40);

            // 绘制照片（带边框效果）
            const photoX = cardX + cardWidth - 120;
            const photoY = cardY + 60;
            const photoSize = 100;

            // 绘制照片边框
            ctx.strokeStyle = '#4fc3f7';
            ctx.lineWidth = 2;
            ctx.strokeRect(photoX - 2, photoY - 2, photoSize + 4, photoSize + 4);

            if (cardData.photo) {
                ctx.drawImage(cardData.photo, photoX, photoY, photoSize, photoSize);
            }

            // 绘制信息
            const startX = cardX + 20;
            const startY = cardY + 80;
            const lineHeight = 30;

            const fields = [
                { key: 'name', label: t('form.name') },
                { key: 'studentId', label: t('form.studentId') },
                { key: 'department', label: t('form.department') },
                { key: 'major', label: t('form.major') },
                { key: 'validDate', label: t('form.validDate') }
            ];

            fields.forEach(({ key, label }, index) => {
                const y = startY + (index * lineHeight);

                // 标签
                ctx.font = "12px Microsoft YaHei";
                ctx.fillStyle = "#90caf9";
                ctx.fillText(label, startX, y);

                // 值
                ctx.font = "bold 14px Microsoft YaHei";
                ctx.fillStyle = "#ffffff";
                ctx.fillText(cardData[key] || "", startX + 80, y);
            });
        }
    },
    minimal: {
        id: 'minimal',
        name: '简约风格',
        width: 400,
        height: 250,
        render: (ctx, cardData, t, { cardX, cardY, cardWidth, cardHeight }) => {
            // 绘制背景
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(cardX, cardY, cardWidth, cardHeight);

            // 绘制侧边装饰条
            ctx.fillStyle = "#2c3e50";
            ctx.fillRect(cardX, cardY, 8, cardHeight);

            // 绘制学校名称
            ctx.fillStyle = "#2c3e50";
            ctx.font = "bold 20px Microsoft YaHei";
            ctx.textAlign = "left";
            ctx.fillText(cardData.school || "", cardX + 30, cardY + 40);

            // 绘制圆形照片
            const photoX = cardX + cardWidth - 140;
            const photoY = cardY + 50;
            const photoRadius = 60;

            ctx.save();
            ctx.beginPath();
            ctx.arc(photoX + photoRadius, photoY + photoRadius, photoRadius, 0, Math.PI * 2);
            ctx.clip();

            if (cardData.photo) {
                ctx.drawImage(cardData.photo, photoX, photoY, photoRadius * 2, photoRadius * 2);
            }
            ctx.restore();

            // 绘制照片边框
            ctx.beginPath();
            ctx.arc(photoX + photoRadius, photoY + photoRadius, photoRadius, 0, Math.PI * 2);
            ctx.strokeStyle = "#2c3e50";
            ctx.lineWidth = 2;
            ctx.stroke();

            // 绘制信息
            const startX = cardX + 30;
            const startY = cardY + 80;
            const lineHeight = 30;

            const fields = [
                { key: 'name', label: t('form.name') },
                { key: 'studentId', label: t('form.studentId') },
                { key: 'department', label: t('form.department') },
                { key: 'major', label: t('form.major') },
                { key: 'validDate', label: t('form.validDate') }
            ];

            fields.forEach(({ key, label }, index) => {
                const y = startY + (index * lineHeight);

                // 标签
                ctx.font = "12px Microsoft YaHei";
                ctx.fillStyle = "#95a5a6";
                ctx.textAlign = "left";
                ctx.fillText(label, startX, y);

                // 值
                ctx.font = "14px Microsoft YaHei";
                ctx.fillStyle = "#2c3e50";
                ctx.fillText(cardData[key] || "", startX + 80, y);
            });
        }
    }
};