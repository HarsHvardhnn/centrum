import React from "react";
import forgotPasswordImage from "../../assets/Forgetpassword.jpg";
import ForgotPassword from "./Forgotpassword";

const ForgotPasswordScreen = () => {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
      <div className="flex md:flex-row  rounded-lg overflow-hidden w-[98%] max-w-full h-[97vh] md:h-[95vh]">
        <div className="hidden lg:block md:w-1/2">
          <img
            src={forgotPasswordImage}
            alt=""
            className="object-cover h-full w-full rounded-lg"
          />
        </div>
        <div className="w-full md:w-1/2 py-8 px-4">
          <ForgotPassword />
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;
