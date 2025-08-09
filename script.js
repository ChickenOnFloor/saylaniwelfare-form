document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);
    gsap.from(".max-w-4xl", {
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: "power3.out"
    });
    gsap.utils.toArray("section").forEach((section, i) => {
      gsap.from(section, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 85%",
          toggleActions: "play none none reverse"
        },
        delay: i * 0.1
      });
    });
    const button = document.querySelector("button[type='submit']");
    button.addEventListener("mouseenter", () => {
      gsap.to(button, { scale: 1.05, duration: 0.2, ease: "power1.out" });
    });
    button.addEventListener("mouseleave", () => {
      gsap.to(button, { scale: 1, duration: 0.2, ease: "power1.out" });
    });
    gsap.from("img[alt='SMIT Logo']", {
      opacity: 0,
      scale: 0.6,
      duration: 1,
      ease: "back.out(1.7)"
    });
    const SUPABASE_URL = 'https://olglrgpbomzladcdbgjf.supabase.co'
    const SUPABASE_KEY = 'YOUR_SUPABASE_ANON_KEY'
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
    button.addEventListener("click", async function(event) {
      event.preventDefault();
      button.disabled = true;
      const oldText = button.innerHTML;
      button.innerHTML = "Submitting... ⏳";
      const data = {
        country: document.getElementById("country").value.trim(),
        city: document.getElementById("city").value.trim(),
        course: document.getElementById("course").value,
        computer_proficiency: document.getElementById("computer_proficiency").value,
        full_name: document.getElementById("full_name").value.trim(),
        father_name: document.getElementById("father_name").value.trim(),
        email: document.getElementById("email").value.trim(),
        whatsapp_number: document.getElementById("whatsapp_number").value.trim(),
        cnic: document.getElementById("cnic").value.trim(),
        father_cnic: document.getElementById("father_cnic").value.trim(),
        date_of_birth: document.getElementById("date_of_birth").value.trim(),
        gender: document.getElementById("gender").value,
        address: document.getElementById("address").value.trim(),
        education_level: document.getElementById("education_level").value,
        has_laptop: document.getElementById("laptop").value === "yes" ? true : false
      };
  
      for (const key in data) {
        if (key !== "father_cnic" && (!data[key] || data[key] === "")) {
          alert(`Please fill in: ${key.replace(/_/g, " ")}`);
          button.disabled = false;
          button.innerHTML = oldText;
          return;
        }
      }
      if (!data.email.includes("@") || !data.email.includes(".")) {
        alert("Please enter a valid email address");
        button.disabled = false;
        button.innerHTML = oldText;
        return;
      }
  
      data.cnic = data.cnic.replace(/-/g, "");
      if (data.cnic.length !== 13 || isNaN(data.cnic)) {
        alert("Please enter a valid 13-digit CNIC number");
        button.disabled = false;
        button.innerHTML = oldText;
        return;
      }
  
      if (data.father_cnic) {
        data.father_cnic = data.father_cnic.replace(/-/g, "");
        if (data.father_cnic.length !== 13 || isNaN(data.father_cnic)) {
          alert("Please enter a valid 13-digit Father CNIC number");
          button.disabled = false;
          button.innerHTML = oldText;
          return;
        }
      }
      try {
        const fileInput = document.getElementById("file-upload");
        if (fileInput && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          if (file.size > 1024 * 1024) {
            alert("Picture must be less than 1MB.");
            button.disabled = false;
            button.innerHTML = oldText;
            return;
          }
          if (!file.type.startsWith("image/")) {
            alert("Please upload an image file.");
            button.disabled = false;
            button.innerHTML = oldText;
            return;
          }
          const ext = file.name.split(".").pop();
          const name = Date.now() + "_" + Math.random().toString(36).substring(2) + "." + ext;
          const { data: uploadData, error: uploadError } = await supabase.storage.from("student-profiles").upload(name, file);
          if (uploadError) {
            alert("Failed to upload picture: " + uploadError.message);
            button.disabled = false;
            button.innerHTML = oldText;
            return;
          }
          const { data: urlData } = supabase.storage.from("student-profiles").getPublicUrl(name);
          data.profile_picture_url = urlData.publicUrl;
        } else {
          data.profile_picture_url = null;
        }
  
        const { data: result, error } = await supabase.from("students").insert([data]).select();
        if (error) {
          alert("Error: " + error.message);
        } else {
          alert("🎉 Registration successful! We will contact you soon.");
          document.querySelector("form").reset();
        }
      } catch (err) {
        alert("Error: " + err.message);
      }
      button.disabled = false;
      button.innerHTML = oldText;
    });
  });

  

