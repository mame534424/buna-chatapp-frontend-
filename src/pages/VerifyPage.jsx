import { useForm } from "react-hook-form";
import { verifyCode, resendCode } from "../api/authApi";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { Coffee, Shield, RefreshCw } from "lucide-react";

const VerifyPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      const res = await verifyCode({ email: state?.email, verificationCode: data.code });
      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
      }
      toast.success("Account verified!");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data || "Verification failed");
    }
  };

  const handleResend = async () => {
    try {
      await resendCode({ email: state?.email });
      toast.success("Verification code resent!");
    } catch (err) {
      toast.error(err.response?.data || "Resend failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center p-4">
      <div className="flex items-center mb-8">
        <Coffee className="h-12 w-12 text-brown-900 mr-3" />
        <div>
          <h1 className="text-4xl font-bold text-brown-900 font-serif">BUNNA TALK</h1>
          <p className="text-brown-700 text-sm italic">Verification in progress</p>
        </div>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-amber-200">
        <div className="bg-gradient-to-r from-brown-900 to-brown-800 p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-100 rounded-full mb-4">
            <Shield className="h-8 w-8 text-brown-900" />
          </div>
          <h2 className="text-2xl font-bold text-white">Verify Your Account</h2>
          <p className="text-amber-200 text-sm mt-2">Check your email for the 6-digit code</p>
        </div>

        <div className="p-8">
          <div className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-sm text-brown-700 mb-1">Verification sent to:</p>
            <p className="font-semibold text-brown-900">{state?.email || "your email"}</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-brown-900 mb-2">
                Enter Verification Code
              </label>
              <input
                {...register("code", { 
                  required: "Verification code is required",
                  pattern: {
                    value: /^[0-9]{6}$/,
                    message: "Code must be 6 digits"
                  }
                })}
                placeholder="123456"
                className={`w-full px-4 py-3 text-center text-2xl font-bold tracking-widest rounded-lg border ${errors.code ? 'border-red-500' : 'border-amber-200'} focus:outline-none focus:ring-2 focus:ring-brown-900 focus:border-transparent bg-amber-50`}
                maxLength={6}
                autoComplete="off"
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-2 text-center">{errors.code.message}</p>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
              >
                Verify & Continue
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-amber-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-brown-700">Didn't receive the code?</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResend}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 flex items-center justify-center"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Resend Verification Code
              </button>

              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="w-full border-2 border-brown-900 text-brown-900 hover:bg-brown-50 font-semibold py-3 px-4 rounded-lg transition-all duration-300"
              >
                Back to Signup
              </button>
            </div>
          </form>

          <div className="mt-8 p-4 bg-amber-50/50 rounded-lg">
            <h4 className="font-semibold text-brown-900 mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Security Tips
            </h4>
            <ul className="text-sm text-brown-700 space-y-1">
              <li>• Code expires in 10 minutes</li>
              <li>• Never share your verification code</li>
              <li>• Check your spam folder if you don't see the email</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="absolute top-10 right-10 opacity-10">
        <Shield className="h-32 w-32 text-brown-900" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-10">
        <Coffee className="h-24 w-24 text-brown-900" />
      </div>
    </div>
  );
};

export default VerifyPage;