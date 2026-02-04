import React, { useState } from "react";
import { auth, googleProvider, db } from "../config/firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useNavigate, Link } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { doc, getDoc, setDoc } from "firebase/firestore";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSuccess = async (user) => {
    const token = await user.getIdToken();
    Cookies.set("token", token, { expires: 1 / 12 }); // 2 hours

    // Fetch role from Firestore
    const userDoc = await getDoc(doc(db, "contacts", user.uid));
    const role = userDoc.exists() ? userDoc.data().role : "user";
    Cookies.set("role", role, { expires: 1 / 12 });

    toast.success(`Welcome back, ${user.displayName || user.email} !`);
    navigate("/");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await handleSuccess(userCredential.user);
    } catch (error) {
      console.error(error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === "auth/invalid-credential") {
        toast.error("Invalid email or password. Please try again or Register.");
      } else {
        toast.error(error.message);
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      // Ensure user exists with role
      const userDoc = await getDoc(doc(db, "contacts", user.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, "contacts", user.uid), {
          uid: user.uid,
          name: user.displayName,
          email: user.email,
          role: "user",
          createdAt: new Date()
        }, { merge: true });
      }

      await handleSuccess(user);
    } catch (error) {
      console.error(error);
      toast.error("Google Sign-In failed.");
    }
  };
  //https://github.com/IblameNavin/MovieBooking.git

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
          >
            Login
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-gray-600">or</p>
          <button
            onClick={handleGoogleLogin}
            className="w-full mt-2 border border-gray-300 py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-100 transition"
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg"
              alt="Google"
              className="w-5 h-5"
            />
            Sign in with Google
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Don't have an account? <Link to="/register" className="text-blue-600 hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
};
