/* ============================================================
   RAVAGED ROSE PMU — ONLINE CLIENT FORMS
   One definition used by both the website (form.html) and the
   email function (api/submit-form.js). Wording matches the
   client's PDF forms in /assets/forms.
   ============================================================ */
(function (root) {
  const HONEST = 'Please answer honestly. A “Yes” answer does not automatically mean you cannot receive the service.';
  const CONFIRM = "I confirm these answers are accurate and will tell my artist if anything changes before my appointment.";

  const HEALTH = [
    { id: "pregnant", label: "Are you pregnant or breastfeeding?" },
    { id: "healing", label: "Do you have diabetes, an immune condition, or a condition that affects healing?" },
    { id: "bleeding", label: "Do you have a bleeding disorder or take blood thinners?" },
    { id: "allergies", label: "Do you have allergies to pigments/inks, latex, adhesives, or topical anesthetics?" },
    { id: "infection", label: "Do you have an active infection, rash, irritation, or broken skin in the treatment area?" },
    { id: "keloid", label: "Do you have a history of keloid or raised-scar formation?" },
    { id: "meds", label: "Are you taking medications or receiving treatments that may affect skin healing (including isotretinoin, steroids, or cancer treatment)?" },
  ].map((q) => ({ ...q, type: "yesno" }));

  const yn = (id, label) => ({ id, label, type: "yesno" });

  const intake = (id, title, sub, extra) => ({
    id, title, stage: "before", pdf: `/assets/forms/${id}.pdf`,
    subtitle: sub,
    intro: HONEST,
    sections: [{ title: "Health questions", fields: [...HEALTH, ...extra] }],
    confirm: CONFIRM,
  });

  const FORMS = {
    "brow-intake": intake("brow-intake", "Brow Intake", "Pre-appointment questionnaire", [
      yn("prev_brow", "Have you had previous brow tattooing/PMU or removal?"),
      yn("recent_brow", "Have you had recent brow-area peels, laser treatments, or injections?"),
    ]),
    "lip-intake": intake("lip-intake", "Lip Intake", "Pre-appointment questionnaire", [
      yn("cold_sores", "Have you ever had cold sores/oral herpes?"),
      yn("lip_filler", "Have you had lip filler or other lip procedures? If yes, when?"),
      yn("prev_lip", "Have you had previous lip tattooing/PMU or removal?"),
    ]),
    "tiny-tattoo-intake": intake("tiny-tattoo-intake", "Tiny Tattoo Intake", "Pre-appointment questionnaire", [
      yn("tattoo_reaction", "Have you had a reaction to a previous tattoo?"),
      yn("recent_site", "Have you had recent skin treatments or sunburn at the tattoo site?"),
    ]),

    "photo-video-release": {
      id: "photo-video-release", title: "Photo + Video Release", stage: "visit", pdf: "/assets/forms/photo-video-release.pdf",
      subtitle: "Choose your privacy preference",
      intro: "Treatment photos may be taken for confidential client records. Public use is optional and your choice does not affect eligibility for services.",
      sections: [{
        title: "Choose ONE option for public sharing",
        fields: [
          { id: "preference", type: "radio", required: true, label: "Public sharing preference", options: [
            { v: "full", t: "Full images/video permitted: I authorize use of identifiable treatment images/video, including my face, on the studio website, portfolio, and social media." },
            { v: "cropped", t: "Cropped treatment area only: I authorize use of cropped brow/lip/tattoo images/video that do not intentionally show my full face or other identifying features." },
            { v: "none", t: "No public use: I do not authorize my images/video to be posted or used for marketing." },
          ] },
          { type: "note", text: "If I authorize public use, I understand images may be shared or saved by others once published. I may withdraw permission for future studio use by contacting the studio, but copies already shared by third parties may not be removable." },
          { id: "records_ack", type: "ack", required: true, label: "I understand that confidential treatment documentation may still be maintained as part of my client record, subject to applicable privacy and recordkeeping requirements." },
        ],
      }],
    },

    "results-acknowledgment": {
      id: "results-acknowledgment", title: "Results Acknowledgment", stage: "visit", pdf: "/assets/forms/results-acknowledgment.pdf",
      subtitle: "Individual healing and expectations",
      intro: "I understand that permanent makeup and tattoos involve implanting pigment into the skin. Results depend on individual factors, including skin type, undertone, skin condition, healing response, lifestyle, aftercare, and sun exposure.",
      sections: [{
        title: "Please read and check each statement",
        fields: [
          { id: "service", type: "checks", required: true, label: "Service", options: [{ v: "brows", t: "Brows" }, { v: "lips", t: "Lips" }, { v: "tiny_tattoo", t: "Tiny tattoo" }] },
          { id: "ack_guarantee", type: "ack", required: true, label: "I understand that specific color, symmetry, pigment retention, and healed appearance cannot be guaranteed." },
          { id: "ack_heal", type: "ack", required: true, label: "I understand that pigment may heal lighter, unevenly, or change in appearance and that a touch-up or additional session may be recommended, with applicable fees disclosed separately." },
          { id: "ack_photos", type: "ack", required: true, label: "I understand that photos and examples of other clients are illustrative and do not promise that my result will be identical." },
          { id: "ack_questions", type: "ack", required: true, label: "I have had an opportunity to ask questions and understand that my individual results may vary." },
        ],
      }],
    },

    "brow-lip-aftercare": {
      id: "brow-lip-aftercare", title: "Brow + Lip Aftercare", stage: "after", pdf: "/assets/forms/brow-lip-aftercare.pdf",
      subtitle: "Instructions and acknowledgment",
      intro: "These instructions apply to brow PMU and lip blush. Your artist will confirm any product-specific directions at your appointment.",
      sections: [{
        title: "Aftercare instructions",
        fields: [
          { type: "note", head: "For both services", text: "Keep the area clean. Wash hands before touching it. Follow the cleansing and ointment instructions provided by your artist. Do not pick, peel, scratch, or exfoliate healing skin. Avoid swimming, hot tubs, saunas, heavy sweating, and makeup directly on the healing area until healed. Avoid direct sun exposure and tanning during healing." },
          { type: "note", head: "Brows", text: "Avoid brow makeup, exfoliants, retinoids, acids, and facial treatments over the area while healing. Do not rub or remove flaking skin." },
          { type: "note", head: "Lips", text: "Keep lips moisturized with the recommended product. Avoid irritating, spicy, acidic, or very hot foods if they cause discomfort. Do not pick flakes. If you have a history of cold sores, follow the plan discussed with your healthcare professional." },
          { type: "note", head: "After healing", text: "Protect the treated area from sun exposure. Once fully healed, apply broad-spectrum SPF 30 or higher to brows and use SPF lip balm on lips, reapplying as directed. UV exposure can accelerate pigment fading." },
          { type: "note", head: "When to get help", alert: true, text: "Seek medical advice promptly for spreading redness, worsening pain or swelling, pus, fever, or other signs of infection. Seek emergency care for severe allergic symptoms." },
          { id: "aftercare_ack", type: "ack", required: true, label: "I confirm I received and understand these aftercare instructions and know I may contact the studio with questions." },
        ],
      }],
    },
  };

  if (typeof module !== "undefined" && module.exports) module.exports = FORMS;
  else root.RR_FORMS = FORMS;
})(typeof window !== "undefined" ? window : globalThis);
