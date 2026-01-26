import { useForm } from "react-hook-form";
import { signup } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Coffee } from "lucide-react";

const SignupPage = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    try {
      await signup(data);
      toast.success("Signup successful! Check email for verification code.");
      navigate("/verify", { state: { email: data.email } });
    } catch (err) {
      const errorMessage = err.response.data.errors[0]; 
      toast.error(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col items-center justify-center p-4">
      {/* Brand Header */}
      <div className="flex items-center mb-8">
        <Coffee className="h-12 w-12 text-brown-900 mr-3" />
        <div>
          <h1 className="text-4xl font-bold text-brown-900 font-serif">BUNNA TALK</h1>
          <p className="text-brown-700 text-sm italic">Where conversations brew</p>
        </div>
      </div>

      {/* Signup Card */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl w-full max-w-md overflow-hidden border border-amber-200">
        {/* Card Header */}
        <div className="bg-gradient-to-r from-brown-900 to-brown-800 p-6">
          <h2 className="text-2xl font-bold text-white text-center">Create Account</h2>
          <p className="text-amber-200 text-sm text-center mt-1">Join our coffee chat community</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-brown-900 mb-1">First Name</label>
              <input
                {...register("firstName", { required: "First name is required" })}
                placeholder="John"
                className={`w-full px-4 py-3 rounded-lg border ${errors.firstName ? 'border-red-500' : 'border-amber-200'} focus:outline-none focus:ring-2 focus:ring-brown-900 focus:border-transparent bg-amber-50`}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brown-900 mb-1">Last Name</label>
              <input
                {...register("lastName", { required: "Last name is required" })}
                placeholder="Doe"
                className={`w-full px-4 py-3 rounded-lg border ${errors.lastName ? 'border-red-500' : 'border-amber-200'} focus:outline-none focus:ring-2 focus:ring-brown-900 focus:border-transparent bg-amber-50`}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-900 mb-1">Username</label>
            <input
              {...register("userName", { required: "Username is required" })}
              placeholder="coffeelover123"
              className={`w-full px-4 py-3 rounded-lg border ${errors.userName ? 'border-red-500' : 'border-amber-200'} focus:outline-none focus:ring-2 focus:ring-brown-900 focus:border-transparent bg-amber-50`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-900 mb-1">Email</label>
            <input
              {...register("email", { 
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,// checked
                  message: "Invalid email address"
                }
              })}
              placeholder="john@example.com"
              type="email"
              className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-amber-200'} focus:outline-none focus:ring-2 focus:ring-brown-900 focus:border-transparent bg-amber-50`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-900 mb-1">Date of Birth</label>
            <input
              {...register("dateOfBirth", { required: "Date of birth is required" })}
              type="date"
              className={`w-full px-4 py-3 rounded-lg border ${errors.dateOfBirth ? 'border-red-500' : 'border-amber-200'} focus:outline-none focus:ring-2 focus:ring-brown-900 focus:border-transparent bg-amber-50`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-brown-900 mb-1">Password</label>
            <input
              {...register("password", { 
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
              placeholder="••••••••"
              type="password"
              className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-amber-200'} focus:outline-none focus:ring-2 focus:ring-brown-900 focus:border-transparent bg-amber-50`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
            )}
          </div>

          <button
  type="submit"
  className="w-full hover:from-brown-800 hover:to-brown-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl"
  style={{
    background: 'linear-gradient(to right, #43302b, #846358)'
  }}
>
  Brew Your Account
</button>

          <p className="text-center text-brown-700 text-sm mt-4">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-brown-900 font-semibold hover:text-brown-700 underline"
            >
              Login here
            </button>
          </p>
        </form>
      </div>

      <div className="absolute top-10 left-10 opacity-10">
        <Coffee className="h-32 w-32 text-brown-900" />
      </div>
      <div className="absolute bottom-10 right-10 opacity-10">
        <Coffee className="h-32 w-32 text-brown-900" />
      </div>
    </div>
  );
};

export default SignupPage;