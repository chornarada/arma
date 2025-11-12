document.addEventListener('DOMContentLoaded', function () {
    const form = document.querySelector('.form__popup');
    const webhookURL = "https://discord.com/api/webhooks/1438235109936595026/5SBmon6nFDLqjLB8r0vAdWESMfIR_OEcJw3U-8_CoixcwHkHavB3hhUi77R_PT2MtlWz";
    let isSubmitting = false;

    const imageInput = document.createElement('input');
    imageInput.type = 'file';
    imageInput.accept = 'image/*';
    imageInput.multiple = true;
    imageInput.style.display = 'none';
    document.body.appendChild(imageInput);

    const containerImg = document.createElement('div');
    containerImg.classList.add('container__img');
    form.insertBefore(containerImg, form.querySelector('#addImageBtn'));

    let selectedImages = [];

    form.querySelectorAll('input, textarea').forEach(input => {
        input.addEventListener('input', () => validateField(input));
    });

    document.getElementById('addImageBtn').addEventListener('click', () => {
        imageInput.click();
    });

    imageInput.addEventListener('change', () => {
        const files = Array.from(imageInput.files);
        files.forEach(file => {
            if (selectedImages.length >= 3) {
                showPopup("Можна додати тільки 3 картинки");
                return;
            }
            selectedImages.push(file);
            const reader = new FileReader();
            reader.onload = (e) => {
                const wrapper = document.createElement('div');
                wrapper.classList.add('image-wrapper');
                const img = document.createElement('img');
                img.src = e.target.result;
                img.style.objectFit = 'cover';
                const deleteBtn = document.createElement('div');
                deleteBtn.classList.add('btn__delete-img');
                deleteBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11.1152 3.91503C11.3868 3.73594 11.756 3.7658 11.9951 4.00488C12.2341 4.24395 12.264 4.61309 12.0849 4.88476L11.9951 4.99511L8.99018 7.99999L11.9951 11.0049L12.0849 11.1152C12.264 11.3869 12.2341 11.756 11.9951 11.9951C11.756 12.2342 11.3868 12.2641 11.1152 12.085L11.0048 11.9951L7.99995 8.99023L4.99506 11.9951C4.7217 12.2685 4.2782 12.2685 4.00483 11.9951C3.73146 11.7217 3.73146 11.2782 4.00483 11.0049L7.00971 7.99999L4.00483 4.99511L3.91499 4.88476C3.73589 4.61309 3.76575 4.24395 4.00483 4.00488C4.24391 3.7658 4.61305 3.73594 4.88471 3.91503L4.99506 4.00488L7.99995 7.00976L11.0048 4.00488L11.1152 3.91503Z"></path></svg>`;
                deleteBtn.addEventListener('click', () => {
                    selectedImages = selectedImages.filter(f => f !== file);
                    wrapper.remove();
                });
                wrapper.appendChild(img);
                wrapper.appendChild(deleteBtn);
                containerImg.appendChild(wrapper);
            };
            reader.readAsDataURL(file);
        });
        imageInput.value = '';
    });

    form.addEventListener('submit', async function (e) {
        e.preventDefault();
        if (isSubmitting) return;
        isSubmitting = true;

        let isValid = true;
        form.querySelectorAll('.error-message').forEach(el => el.remove());
        form.querySelectorAll('input, textarea').forEach(input => input.classList.remove('input-error'));
        form.querySelectorAll('input, textarea').forEach(input => {
            if (!validateField(input)) isValid = false;
        });

        const captchaResponse = hcaptcha.getResponse();
        const captchaContainer = document.getElementById('hcaptcha-container');
        captchaContainer?.querySelector('.error-message')?.remove();
        if (!captchaResponse) {
            isValid = false;
            if (captchaContainer) {
                const error = document.createElement('div');
                error.className = 'error-message';
                error.textContent = 'Підтвердіть, що ви не робот';
                captchaContainer.appendChild(error);
                requestAnimationFrame(() => error.classList.add('visible'));
            }
        }

        if (!isValid) {
            isSubmitting = false;
            return;
        }

        const email = document.getElementById('email').value.trim();
        const nickname = document.getElementById('nickname').value.trim();
        const discord = document.getElementById('usernameDiscord').value.trim();
        const complaint = document.getElementById('complaint').value.trim();
        const date = new Date().toLocaleString('uk-UA');

        const message = {
            title: "⚠️ Нова скарга від користувача",
            color: 0xE74C3C,
            fields: [
                { name: "📧 Email", value: email || "—", inline: true },
                { name: "🎮 Нікнейм в Arma 3", value: nickname || "—", inline: true },
                { name: "💬 Discord", value: discord || "—", inline: false },
                { name: "📄 Опис скарги", value: complaint || "—", inline: false },
                { name: "🕒 Дата", value: date, inline: false }
            ],
            footer: { text: "Скарги | Чорна Рада" },
            timestamp: new Date(),
        };

        const formData = new FormData();
        formData.append('payload_json', JSON.stringify({ username: "Чорна Рада — Скарги користувачів", embeds: [message] }));
        selectedImages.forEach((file, index) => formData.append(`file${index}`, file));

        await fetch(webhookURL, { method: "POST", body: formData });
        form.reset();
        hcaptcha.reset();
        selectedImages = [];
        containerImg.innerHTML = '';
        showPopup("Вашу заявку успішно надіслано!");
        isSubmitting = false;
    });

    function validateField(input) {
        const value = input.value.trim();
        const id = input.id;
        let message = '';
        if (id === 'email') {
            const emailPattern = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;
            if (!emailPattern.test(value)) message = 'Введіть коректну електронну адресу';
        } else if (['nickname', 'usernameDiscord', 'complaint'].includes(id)) {
            const minLen = id === 'complaint' ? 10 : 3;
            if (value.length < minLen) message = id === 'complaint' ? "Опис скарги має бути детальнішим (мін. 10 символів)" : "Поле має містити щонайменше 3 символи";
            else if (!/[a-zA-Zа-яА-ЯЁёЇїІіЄєҐґ]/.test(value)) message = "Поле повинно містити хоча б одну літеру";
        }
        input.classList.remove('input-error');
        input.parentNode.querySelector('.error-message')?.remove();
        if (message) { showError(input, message); return false; }
        return true;
    }

    function showError(input, message) {
        input.classList.add('input-error');
        const error = document.createElement('div');
        error.className = 'error-message';
        error.textContent = message;
        input.parentNode.appendChild(error);
        requestAnimationFrame(() => error.classList.add('visible'));
    }

    const popupBack = document.querySelector('.popup__recruitment').parentElement;
    const popupWindow = document.getElementById('popupComplaint');
    const closeBtn = popupWindow.querySelector('.popup__close');

    function showPopup(message) {
        popupWindow.querySelector('span:last-child').textContent = message;
        popupBack.style.display = 'flex';
        requestAnimationFrame(() => {
            popupBack.style.opacity = '1';
            popupWindow.style.transform = 'scale(1)';
        });
    }

    closeBtn.addEventListener('click', () => {
        popupBack.style.opacity = '0';
        popupWindow.style.transform = 'scale(0.8)';
        setTimeout(() => popupBack.style.display = 'none', 300);
    });
});
