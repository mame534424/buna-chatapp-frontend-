import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Coffee, Mail } from "lucide-react";
import { toast } from "react-toastify";
import { forgotPassword } from "../api/authApi";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await forgotPassword({ email });
      toast.success("Reset code sent to your email");
      navigate("/new-password", { state: { email } });
    } catch (err) {
      toast.error("Failed to send reset code");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-amber-100 to-orange-50 flex items-center justify-center">
      <div className="bg-white/90 rounded-2xl shadow-xl w-full max-w-md p-8 border border-amber-200">
        
        <div className="text-center mb-6">
          <Coffee className="mx-auto h-12 w-12 text-brown-900" />
          <h2 className="text-2xl font-bold text-brown-900 mt-3">
            Forgot Password
          </h2>
          <p className="text-brown-700 text-sm">
            Enter your email to receive a reset code
          </p>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="text-sm font-semibold text-brown-900 flex items-center mb-2">
              <Mail className="h-4 w-4 mr-2" />
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full px-4 py-3 rounded-lg border border-amber-200 bg-amber-50 focus:ring-2 focus:ring-brown-900"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brown-900 text-white py-3 rounded-lg font-semibold hover:bg-brown-800"
          >
            Send Reset Code
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
