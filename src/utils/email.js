import emailjs from "emailjs-com";

export const sendChitJoinEmail = (user, scheme) => {
  const templateParams = {
    name: user?.name,
    chit_name: scheme?.name,
    member_id: user?._id,
    chit_value: scheme?.amount,
    monthly_amount: scheme?.amount / scheme?.totalMembers,
    start_date: new Date().toLocaleDateString(),
    year: new Date().getFullYear(),
    to_email: user?.email,
  };

  return emailjs
    .send(
      "service_s0gpm63",   // Service ID
      "template_g5kpqwl",  // Template ID
      templateParams,
      "OmB8iKBfM70HAZbc7"  // Public Key
    )
    .then((response) => {
      console.log("✅ EmailJS success:", response);
    })
    .catch((error) => {
      console.error("❌ EmailJS failed:", error);
    });
};
