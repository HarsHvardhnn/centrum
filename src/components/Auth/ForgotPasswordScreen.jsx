import React from "react";
import forgotPasswordImage from "../../assets/ForgotPassword.png"

import ForgotPassword from "./Forgotpassword";

const ForgotPasswordScreen = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50 overflow-hidden">
      <div className="flex bg-white shadow-lg rounded-lg overflow-hidden max-w-6xl w-[90%] h-auto max-h-[90vh]">
        <div className="hidden sm:block md:w-1/2 bg-[#80C5C5]">
          <img src={forgotPasswordImage} alt="" className="object-cover h-full w-full" />
        </div>
        <div className="w-full md:w-1/2 overflow-y-auto">
          <ForgotPassword />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
