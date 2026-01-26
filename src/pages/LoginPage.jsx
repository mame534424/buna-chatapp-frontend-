import { login as loginApi } from "../api/authApi";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Coffee, LogIn } from "lucide-react";
import { toast } from "react-toastify";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ userName: "", password: "" });

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginApi(form);
      login(res.data.token);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      const errorMessage = err.response.data.errors[0]; 
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100 to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="flex items-center mb-8">
        <Coffee className="h-14 w-14 text-brown-900 mr-3" />
        <div>
          <h1 className="text-4xl font-bold text-brown-900 font-serif">BUNNA TALK</h1>
          <p className="text-brown-700 text-sm italic">Welcome back to your coffee chat</p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-amber-200">
        <div className="bg-gradient-to-r from-brown-900 to-brown-800 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <LogIn className="h-8 w-8 text-brown-900" />
          </div>
          <h2 className="text-2xl font-bold text-white">Welcome Back</h2>
          <p className="text-amber-200 text-sm mt-2">Sip, chat, and connect</p>
        </div>

        <form onSubmit={submit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-brown-900 mb-2 flex items-center">
              <span className="bg-amber-100 p-1 rounded mr-2">☕</span>
              Username
            </label>
            <input
              placeholder="Enter your username"
              value={form.username}
              onChange={(e) => setForm({ ...form, userName: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-brown-900 focus:border-transparent bg-amber-50 transition-all duration-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-brown-900 mb-2 flex items-center">
              <span className="bg-amber-100 p-1 rounded mr-2">🔐</span>
              Password
            </label>
            <input
              placeholder="Enter your password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 rounded-lg border border-amber-200 focus:outline-none focus:ring-2 focus:ring-brown-900 focus:border-transparent bg-amber-50 transition-all duration-200"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input type="checkbox" className="rounded text-brown-900 focus:ring-brown-900" />
              <span className="ml-2 text-sm text-brown-700">Remember me</span>
            </label>
            <button
              type="button"
              className="text-sm text-brown-900 font-semibold hover:text-brown-700 hover:underline"
            >
              Forgot password?
            </button>
          </div>

          <button
  type="submit"
  className="w-full bg-brown-900 hover:bg-brown-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center"
>
  <LogIn className="mr-2 h-5 w-5" />
  Sign In
</button>

          <div className="text-center">
            <p className="text-brown-700 text-sm">
              New to BUNNA TALK?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="text-brown-900 font-semibold hover:text-brown-700 underline"
              >
                Create account
              </button>
            </p>
          </div>

          

          
        </form>
      </div>

      <div className="absolute top-10 right-10 opacity-10">
        <Coffee className="h-32 w-32 text-brown-900 transform rotate-12" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10">
        <Coffee className="h-24 w-24 text-brown-900 transform -rotate-12" />
      </div>
    </div>
  );
}