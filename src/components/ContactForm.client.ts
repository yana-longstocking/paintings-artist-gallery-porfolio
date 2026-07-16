function initContactForm(): void {
  const form = document.getElementById("form");
  const successMessage = document.getElementById("form-success");

  if (!form || !successMessage) return;

  const sendingText = form.dataset.sendingText;
  const errorMessage = form.dataset.errorMessage;
  const errorGeneric = form.dataset.errorGeneric;

  if (!sendingText || !errorMessage || !errorGeneric) return;

  const submitBtn = form.querySelector('button[type="submit"]');
  if (!(submitBtn instanceof HTMLButtonElement)) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form as HTMLFormElement);
    formData.append("access_key", "c37ecac4-9d49-4890-ae08-b2a7ed2da3a6");

    const originalText = submitBtn.textContent;
    submitBtn.textContent = sendingText;
    submitBtn.disabled = true;

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        form.classList.add("footer__form--hidden");
        successMessage.classList.add("footer__success--visible");
      } else {
        alert(`${errorMessage}: ${data.message}`);
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }
    } catch {
      alert(errorGeneric);
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initContactForm);
} else {
  initContactForm();
}
