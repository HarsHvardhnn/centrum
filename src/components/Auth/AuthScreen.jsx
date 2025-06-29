import React from "react";
import LoginForm from "./Login";

const LoginScreen = ({ screenImg, isLogin }) => {
  return (
    <div className="h-screen w-screen flex items-center justify-center overflow-hidden">
      <div className="flex flex-col md:flex-row bg-white rounded-lg overflow-hidden w-[98%] max-w-full h-[97vh] md:h-[95vh]">
        {/* Left Section - Login Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center h-full">
          <div className="w-full  px-6 py-8 md:py-0 flex-1 flex items-center">
            <div className="w-full">
              <LoginForm isLogin={isLogin} />
            </div>
          </div>
        </div>
        {/* Right Section - Image */}
        <div className="hidden md:block md:w-1/2 h-full bg-primary rounded-2xl">
          <img
            src={screenImg}
            alt="Login illustration"
            className="object-cover h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;