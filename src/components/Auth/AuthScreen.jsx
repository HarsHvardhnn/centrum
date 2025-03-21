import React from "react";
import LoginForm from "./Login";

const LoginScreen = ({screenImg , isLogin}) => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden max-w-6xl w-[90%] h-auto max-h-[90vh]">
        {/* Left Section - Login Form */}
        <div className="w-full md:w-1/2 overflow-y-auto">
          <LoginForm isLogin={isLogin}/>
        </div>
        <div className="hidden sm:block md:w-1/2 bg-[#80C5C5]">
          <img
            src={screenImg}
            alt=""
            className="object-cover h-full w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
