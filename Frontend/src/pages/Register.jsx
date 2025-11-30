// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";
// import { Country, State, City } from "country-state-city";
// import Select from "react-select";
// import { motion } from "framer-motion";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";

// const Register = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     phone: "",
//     password: "",
//     address: "",
//     country: null,
//     state: null,
//     city: null,
//     pincode: "",
//   });

//   const [profileImage, setProfileImage] = useState(null);
//   const [preview, setPreview] = useState(null);
//   const [countries, setCountries] = useState([]);
//   const [states, setStates] = useState([]);
//   const [cities, setCities] = useState([]);

//   useEffect(() => {
//     AOS.init({ duration: 1000 });
//     const allCountries = Country.getAllCountries().map((c) => ({
//       value: c.isoCode,
//       label: c.name,
//     }));
//     setCountries(allCountries);
//   }, []);

//   useEffect(() => {
//     if (formData.country) {
//       const allStates = State.getStatesOfCountry(formData.country.value).map(
//         (s) => ({ value: s.isoCode, label: s.name })
//       );
//       setStates(allStates);
//       setFormData({ ...formData, state: null, city: null });
//       setCities([]);
//     }
//   }, [formData.country]);

//   useEffect(() => {
//     if (formData.state && formData.country) {
//       const allCities = City.getCitiesOfState(
//         formData.country.value,
//         formData.state.value
//       ).map((c) => ({ value: c.name, label: c.name }));
//       setCities(allCities);
//       setFormData({ ...formData, city: null });
//     }
//   }, [formData.state]);

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!["image/jpeg", "image/png"].includes(file.type)) {
//       toast.error("❌ Only JPG or PNG images are allowed");
//       return;
//     }
//     if (file.size > 2 * 1024 * 1024) {
//       toast.error("❌ Image must be under 2MB");
//       return;
//     }
//     setProfileImage(file);
//     setPreview(URL.createObjectURL(file));
//   };

//   const validateForm = () => {
//     const nameRegex = /^[A-Za-z ]{3,}$/;
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     const phoneRegex = /^\d{10,15}$/;
//     const passwordRegex = /^(?=.*[0-9]).{6,}$/;
//     const pincodeRegex = /^\d{4,10}$/;

//     if (!nameRegex.test(formData.name)) {
//       toast.error("❌ Name must be at least 3 letters and alphabets only");
//       return false;
//     }
//     if (!emailRegex.test(formData.email)) {
//       toast.error("❌ Invalid email format");
//       return false;
//     }
//     if (!phoneRegex.test(formData.phone)) {
//       toast.error("❌ Phone must be 10–15 digits");
//       return false;
//     }
//     if (formData.address && formData.address.length > 150) {
//       toast.error("❌ Address must be max 150 characters");
//       return false;
//     }
//     if (!formData.country) {
//       toast.error("❌ Country is required");
//       return false;
//     }
//     if (!formData.state) {
//       toast.error("❌ State is required");
//       return false;
//     }
//     if (!formData.city) {
//       toast.error("❌ City is required");
//       return false;
//     }
//     if (!pincodeRegex.test(formData.pincode)) {
//       toast.error("❌ Pincode must be 4–10 digits");
//       return false;
//     }
//     if (!passwordRegex.test(formData.password)) {
//       toast.error("❌ Password must be at least 6 chars with a number");
//       return false;
//     }
//     if (!profileImage) {
//       toast.error("❌ Profile image is required");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     try {
//       const data = new FormData();
//       data.append("name", formData.name);
//       data.append("email", formData.email);
//       data.append("phone", formData.phone);
//       data.append("password", formData.password);
//       data.append("address", formData.address || "");
//       data.append("country", formData.country?.value);
//       data.append("state", formData.state?.value);
//       data.append("city", formData.city?.value);
//       data.append("pincode", formData.pincode);
//       data.append("profile_image", profileImage); // match backend field
//       data.append("role", "user");

//       const response = await axios.post(
//         "http://localhost:5000/api/auth/register",
//         data,
//         { headers: { "Content-Type": "multipart/form-data" } }
//       );

//       if (response.data.success) {
//         toast.success("✅ Account created successfully!", {
//           onClose: () => navigate("/"),
//         });
//       } else {
//         toast.error(response.data.message || "❌ Registration failed");
//       }
//     } catch (err) {
//       console.error("Registration error:", err.response?.data || err.message);
//       toast.error(err.response?.data?.message || "❌ Error while registering!");
//     }
//   };

//   const inputVariant = {
//     hidden: { opacity: 0, y: 20 },
//     visible: (i) => ({
//       opacity: 1,
//       y: 0,
//       transition: { delay: i * 0.1 },
//     }),
//   };

//   return (
//     <div
//       className="min-h-screen flex items-center justify-center px-4"
//       style={{
//         background: "linear-gradient(135deg, #4ade80, #60a5fa, #a78bfa)",
//         backgroundSize: "400% 400%",
//         animation: "gradientBG 15s ease infinite",
//       }}
//     >
//       <ToastContainer position="top-right" autoClose={3000} />

//       <motion.div
//         initial={{ opacity: 0, scale: 0.95 }}
//         animate={{ opacity: 1, scale: 1 }}
//         transition={{ duration: 0.8 }}
//         className="w-full max-w-5xl backdrop-blur-md bg-white/30 rounded-3xl shadow-xl p-8 md:p-12"
//       >
//         <motion.h2
//           initial={{ opacity: 0, y: -20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.8 }}
//           className="text-3xl font-bold text-gray-800 mb-8 text-center"
//         >
//           User Registration
//         </motion.h2>

//         <form
//           onSubmit={handleSubmit}
//           className="flex flex-col md:flex-row gap-6 md:gap-10"
//         >
//           <div className="flex-1 flex flex-col gap-4">
//             {[
//               { type: "text", name: "name", placeholder: "Full Name" },
//               { type: "email", name: "email", placeholder: "Email" },
//               { type: "tel", name: "phone", placeholder: "Phone" },
//               { type: "password", name: "password", placeholder: "Password" },
//               { type: "text", name: "address", placeholder: "Address (optional)" },
//             ].map((field, index) => (
//               <motion.input
//                 key={field.name}
//                 type={field.type}
//                 name={field.name}
//                 placeholder={field.placeholder}
//                 value={formData[field.name]}
//                 onChange={handleChange}
//                 className="w-full px-4 py-3 border border-white/50 rounded-xl backdrop-blur-sm bg-white/20 text-gray-800 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//                 custom={index}
//                 variants={inputVariant}
//                 initial="hidden"
//                 animate="visible"
//               />
//             ))}
//           </div>

//           <div className="flex-1 flex flex-col gap-4">
//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
//               <Select
//                 options={countries}
//                 placeholder="Select Country"
//                 value={formData.country}
//                 onChange={(value) => setFormData({ ...formData, country: value })}
//                 isSearchable
//               />
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
//               <Select
//                 options={states}
//                 placeholder="Select State"
//                 value={formData.state}
//                 onChange={(value) => setFormData({ ...formData, state: value })}
//                 isDisabled={!states.length}
//                 isSearchable
//               />
//             </motion.div>

//             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
//               <Select
//                 options={cities}
//                 placeholder="Select City"
//                 value={formData.city}
//                 onChange={(value) => setFormData({ ...formData, city: value })}
//                 isDisabled={!cities.length}
//                 isSearchable
//               />
//             </motion.div>

//             <motion.input
//               type="text"
//               name="pincode"
//               placeholder="Pincode"
//               value={formData.pincode}
//               onChange={handleChange}
//               className="w-full px-4 py-3 border border-white/50 rounded-xl backdrop-blur-sm bg-white/20 text-gray-800 placeholder-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400 transition"
//             />

//             <motion.div>
//               <label className="text-gray-700 font-medium">Profile Image (jpg/png, max 2MB)</label>
//               <input
//                 type="file"
//                 accept="image/png, image/jpeg"
//                 onChange={handleImageChange}
//                 className="w-full mt-1 p-2 border border-white/50 rounded-xl backdrop-blur-sm bg-white/20 text-gray-800"
//               />
//             </motion.div>

//             {preview && (
//               <motion.img
//                 src={preview}
//                 alt="Preview"
//                 initial={{ scale: 0 }}
//                 animate={{ scale: 1 }}
//                 transition={{ duration: 0.5 }}
//                 className="w-24 h-24 rounded-full mx-auto mt-3 border border-white/40 shadow-lg"
//               />
//             )}
//           </div>
//         </form>

//         <div className="mt-6 flex justify-center">
//           <motion.button
//             whileHover={{ scale: 1.05 }}
//             whileTap={{ scale: 0.95 }}
//             type="submit"
//             onClick={handleSubmit}
//             className="w-1/2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
//           >
//             Register
//           </motion.button>
//         </div>

//         <motion.p
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           transition={{ delay: 1 }}
//           className="text-center mt-4 text-gray-800"
//         >
//           Already have an account?{" "}
//           <span
//             onClick={() => navigate("/")}
//             className="text-green-600 font-medium cursor-pointer"
//           >
//             Login
//           </span>
//         </motion.p>
//       </motion.div>

//       <style>{`
//         @keyframes gradientBG {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Register;



import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import Select from "react-select";
import { motion } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    address: "",
    country: null,
    state: null,
    city: null,
    pincode: "",
  });

  const [profileImage, setProfileImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [countries, setCountries] = useState([]);
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  useEffect(() => {
    AOS.init({ duration: 1000 });

    const allCountries = Country.getAllCountries().map((c) => ({
      value: c.isoCode,
      label: c.name,
    }));
    setCountries(allCountries);
  }, []);

  useEffect(() => {
    if (formData.country) {
      const allStates = State.getStatesOfCountry(formData.country.value).map(
        (s) => ({ value: s.isoCode, label: s.name })
      );
      setStates(allStates);
      setCities([]);
      setFormData((prev) => ({ ...prev, state: null, city: null }));
    }
  }, [formData.country]);

  useEffect(() => {
    if (formData.state && formData.country) {
      const allCities = City.getCitiesOfState(
        formData.country.value,
        formData.state.value
      ).map((c) => ({ value: c.name, label: c.name }));
      setCities(allCities);
      setFormData((prev) => ({ ...prev, city: null }));
    }
  }, [formData.state]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Image validation
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type))
      return toast.error("Only JPG or PNG allowed");

    if (file.size > 2 * 1024 * 1024)
      return toast.error("Image must be under 2MB");

    setProfileImage(file);
    setPreview(URL.createObjectURL(file));
  };

  // Validation
  const validateForm = () => {
    const nameRegex = /^[A-Za-z ]{3,}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10,15}$/;
    const passwordRegex = /^(?=.*[0-9]).{6,}$/;
    const pincodeRegex = /^\d{4,10}$/;

    if (!nameRegex.test(formData.name))
      return toast.error("Name must be at least 3 letters (alphabets only)");

    if (!emailRegex.test(formData.email))
      return toast.error("Enter valid email");

    if (!phoneRegex.test(formData.phone))
      return toast.error("Phone must be 10–15 digits");

    if (formData.address.length > 150)
      return toast.error("Address max 150 characters");

    if (!passwordRegex.test(formData.password))
      return toast.error("Password must be 6+ characters & contain at least one number");

    if (!formData.country)
      return toast.error("Select country");

    if (!formData.state)
      return toast.error("Select state");

    if (!formData.city)
      return toast.error("Select city");

    if (!pincodeRegex.test(formData.pincode))
      return toast.error("Pincode must be 4–10 digits");

    if (!profileImage)
      return toast.error("Upload profile image");

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("phone", formData.phone);
      data.append("password", formData.password);
      data.append("address", formData.address || "");
      data.append("country", formData.country?.value);
      data.append("state", formData.state?.value);
      data.append("city", formData.city?.value);
      data.append("pincode", formData.pincode);
      data.append("profileImage", profileImage);

      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        data,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (res.data.success) {
        toast.success("Registration Successful!", {
          onClose: () => navigate("/"),
        });
      } else {
        toast.error(res.data.message || "Registration failed");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
        "Something went wrong. Email or phone might already exist."
      );
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, #4ade80, #60a5fa, #a78bfa)",
        backgroundSize: "400% 400%",
        animation: "gradientBG 15s ease infinite",
      }}
    >
      <ToastContainer position="top-center" autoClose={2000} theme="light" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="w-full max-w-5xl backdrop-blur-md bg-white/30 rounded-3xl shadow-xl p-8 md:p-12"
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
          User Registration
        </h2>

        <form onSubmit={handleSubmit} className="flex gap-10 flex-col md:flex-row">
          <div className="flex-1 flex flex-col gap-4">
            <input type="text" name="name" placeholder="Full Name"
              value={formData.name} onChange={handleChange} className="input" />

            <input type="email" name="email" placeholder="Email"
              value={formData.email} onChange={handleChange} className="input" />

            <input
  type="text"
  name="phone"
  placeholder="Phone Number"
  value={formData.phone}
  maxLength={10}
  onChange={(e) => {
    const value = e.target.value;

    // Allow only digits and limit to 10
    if (/^\d{0,10}$/.test(value)) {
      setFormData({ ...formData, phone: value });
    }
  }}
  className="input"
/>


            <input type="password" name="password" placeholder="Password"
              value={formData.password} onChange={handleChange} className="input" />

            <input type="text" name="address" placeholder="Address (optional)"
              value={formData.address} onChange={handleChange} className="input" />
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <Select
              options={countries}
              placeholder="Select Country"
              value={formData.country}
              onChange={(v) => setFormData({ ...formData, country: v })}
            />

            <Select
              options={states}
              placeholder="Select State"
              value={formData.state}
              onChange={(v) => setFormData({ ...formData, state: v })}
              isDisabled={!states.length}
            />

            <Select
              options={cities}
              placeholder="Select City"
              value={formData.city}
              onChange={(v) => setFormData({ ...formData, city: v })}
              isDisabled={!cities.length}
            />

            <input type="text" name="pincode" placeholder="Pincode"
              value={formData.pincode} onChange={handleChange} className="input" />

            <div>
              <label className="font-medium">Profile Image</label>
              <input type="file"
                accept="image/png, image/jpeg"
                onChange={handleImageChange}
                className="input mt-1" />
            </div>

            {preview && (
              <img src={preview} alt="Preview"
                className="w-24 h-24 rounded-full mx-auto mt-3 shadow-md border" />
            )}
          </div>
        </form>

        <div className="mt-6 flex justify-center">
          <button
            type="submit"
            onClick={handleSubmit}
            className="w-1/2 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700"
          >
            Register
          </button>
        </div>

        <p className="text-center mt-4">
          Already have an account?{" "}
          <span className="text-green-700 cursor-pointer font-semibold"
            onClick={() => navigate("/")}>
            Login
          </span>
        </p>
      </motion.div>

      <style>{`
        .input {
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.4);
          outline: none;
        }
        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default Register;
