import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Lock, Coffee } from "lucide-react";
import { toast } from "react-toastify";
import { resetPassword } from "../api/authApi";

const NewPasswordPage = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  if (!state?.email) {
    navigate("/login");
    return null;
  }

  const [form, setForm] = useState({
    code: "",
    newPassword: "",
    confirmPassword: ""
  });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await resetPassword({
        email: state.email,
        ...form
      });
      toast.success("Password reset successful");
      navigate("/login");
    } catch (err) {
      toast.error("Invalid or expired code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100 to-orange-50 flex items-center justify-center">
      <div className="bg-white/90 rounded-2xl shadow-xl w-full max-w-md p-8 border border-amber-200">
        
        <div className="text-center mb-6">
          <Coffee className="mx-auto h-12 w-12 text-brown-900" />
          <h2 className="text-2xl font-bold text-brown-900 mt-3">
            Reset Password
          </h2>
          <p className="text-brown-700 text-sm">
            Enter the code sent to your email
          </p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <input
            placeholder="Reset Code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-amber-50"
            required
          />

          <input
            type="password"
            placeholder="New Password"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-amber-50"
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            className="w-full px-4 py-3 rounded-lg border bg-amber-50"
            required
          />

          <button
            type="submit"
            className="w-full bg-brown-900 text-white py-3 rounded-lg font-semibold hover:bg-brown-800 flex justify-center items-center"
          >
            <Lock className="h-4 w-4 mr-2" />
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewPasswordPage;
