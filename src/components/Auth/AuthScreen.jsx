import React, { useEffect, useState } from "react";
import LoginForm from "./Login";
import { checkIpAccess } from "../../utils/ipService";
import { useNavigate } from "react-router-dom";
import ApiLoader from "../UtilComponents/ApiLoader";

const LoginScreen = ({ screenImg, isLogin }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const validateIp = async () => {
      try {
        console.log('Starting IP validation...'); // Debug log
        const ipStatus = await checkIpAccess();
        console.log('IP Status received:', ipStatus); // Debug log
        
        // Only redirect if explicitly not allowed
        if (ipStatus.data && ipStatus.data.isAllowed === false) {
          console.log('Access explicitly denied. Reason:', ipStatus.reason); // Debug log
          navigate('/404');
          return;
        }
        
        // If we got here, either explicitly allowed or default to allowed
        console.log('Access granted. Reason:', ipStatus?.reason); // Debug log
      } catch (error) {
        console.error('IP validation error details:', {
          message: error.message,
          stack: error.stack
        });
        navigate('/404');
        return;
      } finally {
        setIsLoading(false);
      }
    };

    validateIp();
  }, [navigate]);

  if (isLoading) {
    return <ApiLoader />;
  }

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