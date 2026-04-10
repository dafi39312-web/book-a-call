const EMAILJS_SERVICE_ID = "service_3a3s9ce";
const EMAILJS_TEMPLATE_ID = "template_rhv6eg4";
const EMAILJS_PUBLIC_KEY = "_2ivuPWj1qbZERsZ_";

let emailjsLoaded = false;

const loadEmailJS = () => {
  if (emailjsLoaded) return Promise.resolve();
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    script.onload = () => {
      window.emailjs.init(EMAILJS_PUBLIC_KEY);
      emailjsLoaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });
};

export const sendNotificationEmail = async (booking, serviceLabel) => {
  try {
    await loadEmailJS();
    await window.emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
      client_name: booking.name,
      client_email: booking.email,
      client_company: booking.company,
      service_type: serviceLabel,
      description: booking.description,
      date: booking.date,
      time: `${booking.slot.start} - ${booking.slot.end}`,
    });
    return true;
  } catch (err) {
    console.error("EmailJS error:", err);
    return false;
  }
};
