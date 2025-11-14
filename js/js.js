window.addEventListener('scroll', function () {
    const header = this.document.querySelector('header');
    if (this.window.scrollY > 0) {
        header.classList.add('scroll');
    } else {
        header.classList.remove('scroll');
    }
});

document.addEventListener("DOMContentLoaded", () => {
    const titles = document.querySelectorAll(".animate__title");

    const onScroll = () => {
        titles.forEach((title) => {
            const rect = title.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

            if (isVisible && !title.classList.contains("animate")) {
                title.classList.add("animate");
            }
        });
    };

    window.addEventListener("scroll", onScroll);

    onScroll();
});

let popupBack = document.querySelector('.popup__back');
let popupComplaintWindow = document.querySelector('.popup__complaint');
let closeBtn = document.querySelector('.popup__close');

function popupComplaint() {
    popupBack.style.display = 'flex';
    popupBack.style.opacity = '0';
    popupComplaintWindow.style.transform = 'scale(0.8)';
    requestAnimationFrame(() => {
        popupBack.style.transition = 'opacity 0.3s ease';
        popupComplaintWindow.style.transition = 'transform 0.3s ease';
        popupBack.style.opacity = '1';
        popupComplaintWindow.style.transform = 'scale(1)';
    });
}

closeBtn.addEventListener('click', () => {
    popupBack.style.opacity = '0';
    popupComplaintWindow.style.transform = 'scale(0.8)';
    setTimeout(() => {
        popupBack.style.display = 'none';
    }, 300);
});

document.addEventListener("DOMContentLoaded", function () {
    const acceptButton = document.getElementById("accept-cookie");
    const cancelButton = document.getElementById("cancel-cookie");
    const cookieBlock = document.querySelector(".cookie__container");

    const isLocalStorageSupported = () => {
        try {
            const testKey = "__test__";
            localStorage.setItem(testKey, testKey);
            localStorage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    };

    const fadeOut = (element) => {
        if (element && element.style.opacity !== "0") {
            element.style.transition = "opacity 0.5s ease";
            element.style.opacity = "0";
            setTimeout(() => {
                element.style.display = "none";
            }, 500);
        }
    };

    const fadeIn = (element) => {
        if (element && element.style.opacity !== "1") {
            element.style.transition = "opacity 0.5s ease";
            element.style.opacity = "1";
            element.style.display = "flex";
        }
    };

    const showConsentMessage = () => {
        if (cookieBlock) {
            fadeIn(cookieBlock);
        }
    };

    const setConsent = () => {
        if (isLocalStorageSupported()) {
            localStorage.setItem("cookie-consent", "accepted");
        }
    };

    const setCancel = () => {
        if (isLocalStorageSupported()) {
            localStorage.setItem("cookie-consent", "cancelled");
        }
    };

    if (acceptButton) {
        acceptButton.addEventListener("click", () => {
            setConsent();
            fadeOut(cookieBlock);
        });

        acceptButton.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                setConsent();
                fadeOut(cookieBlock);
            }
        });
    }

    if (cancelButton) {
        cancelButton.addEventListener("click", () => {
            setCancel();
            fadeOut(cookieBlock);
        });

        cancelButton.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                setCancel();
                fadeOut(cookieBlock);
            }
        });
    }

    if (isLocalStorageSupported()) {
        const consent = localStorage.getItem("cookie-consent");
        if (consent !== "accepted" && consent !== "cancelled") {
            showConsentMessage();
        }
    }
});

const serverId = "35984443";
const apiUrl = `https://api.battlemetrics.com/servers/${serverId}`;

function fetchServerStatus() {
    fetch(apiUrl)
        .then(res => res.json())
        .then(data => {
            const players = data.data.attributes.players;
            const online = data.data.attributes.status === "online";

            document.getElementById('playerCount').textContent = players;

            const statusIndicator = document.querySelector('.status-indicator');
            const statusText = document.getElementById('span__status');

            statusIndicator.classList.remove('status-indicator-online', 'status-indicator-offline');
            if (online) {
                statusIndicator.classList.add('status-indicator-online');
                statusText.textContent = 'Онлайн';
            } else {
                statusIndicator.classList.add('status-indicator-offline');
                statusText.textContent = 'Офлайн';
            }
        })
        .catch(err => {
            console.error(err);
            document.getElementById('playerCount').textContent = '...';
            const statusIndicator = document.querySelector('.status-indicator');
            const statusText = document.getElementById('span__status');

            statusIndicator.classList.remove('status-indicator-online', 'status-indicator-offline');
            statusIndicator.style.background = 'gray';
            statusText.textContent = '...';
        });
}

fetchServerStatus();
setInterval(fetchServerStatus, 300000);
