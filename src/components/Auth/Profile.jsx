import React, { useState, useEffect } from "react";
import userService from "../../helpers/profileHelper";
import { toast } from "sonner";
import { useUser } from "../../context/userContext";
import ImageCropModal from "./ImageCropModal";

const ProfilePage = () => {
  const [profile, setProfile] = useState({
    name: { first: "", last: "" },
    email: "",
    phone: "",
    sex: "",
    profilePicture: "",
    role: "",
    signupMethod: "",
    createdAt: "",
  });

  const { refreshUserProfile } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    first: "",
    last: "",
    email: "",
    phone: "",
    sex: "",
  });
  const [initialFormData, setInitialFormData] = useState({});
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Add new state for image cropping
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState("");

  // Fetch user profile data
  useEffect(() => {
    fetchProfile();
  }, []);

  // Check for changes in form data
  useEffect(() => {
    if (isEditing) {
      const changed =
        profileImage !== null ||
        Object.keys(formData).some(
          (key) => formData[key] !== initialFormData[key]
        );
      setHasChanges(changed);
    }
  }, [formData, profileImage, initialFormData, isEditing]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await userService.getUserProfile();

      if (response.success) {
        setProfile(response.data);
        const newFormData = {
          first: response.data.name?.first || "",
          last: response.data.name?.last || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          sex: response.data.sex || "",
        };
        setFormData(newFormData);
        setInitialFormData(newFormData);
      } else {
        toast.error(response.message || "Failed to load profile");
      }
    } catch (error) {
      toast.error("Failed to load profile information");
      console.error("Error loading profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Update handleImageChange to show crop modal
  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      // Check file type
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/gif"];
      if (!validTypes.includes(file.type)) {
        toast.error("Please select a valid image file (JPEG, PNG, GIF)");
        return;
      }

      // Create temporary URL for the crop modal
      const tempUrl = URL.createObjectURL(file);
      setTempImageUrl(tempUrl);
      setShowCropModal(true);
    }
  };

  const translateRoleToPolish = (role) => {
    console.log("role is", role)
    switch (role) {
      case "patient":
        return "Pacjent";
      case "doctor":
        return "Lekarz";
      case "receptionist":
        return "Recepcjonista";
      case "admin":
        return "Administrator";
      default:
        return "Nieznana rola";
    }
  };

  // Handle cropped image
  const handleCroppedImage = (blob) => {
    // Create a File from the blob
    const croppedFile = new File([blob], 'cropped-profile-picture.jpg', {
      type: 'image/jpeg',
    });

    setProfileImage(croppedFile);
    setImagePreview(URL.createObjectURL(blob));
    setShowCropModal(false);
    
    // Clean up the temporary URL
    if (tempImageUrl) {
      URL.revokeObjectURL(tempImageUrl);
      setTempImageUrl("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!formData.sex) {
        toast.error("Please select your sex");
        return;
      }
      setIsSaving(true);

      // Add image file to form data if it exists
      const updateData = { ...formData };
      if (profileImage) {
        updateData.profilePicture = profileImage;
      }

      const response = await userService.updateUserProfile(updateData);

      if (response.success) {
        setProfile(response.data);
        toast.success("Profile updated successfully");
        setIsEditing(false);
        refreshUserProfile();
        // Reset image file state
        setProfileImage(null);
        // Update initial form data to match current data
        setInitialFormData({ ...formData });
        setHasChanges(false);
      } else {
        toast.error(response.message || "Failed to update profile");
      }
    } catch (error) {
      const errorMsg =
        error.response?.data?.message || "Failed to update profile";
      toast.error(errorMsg);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleEdit = () => {
    if (isEditing) {
      // Discard changes and revert to original data
      setFormData({ ...initialFormData });
      setImagePreview("");
      setProfileImage(null);
      setHasChanges(false);
    }
    setIsEditing(!isEditing);
  };

  if (isLoading && !profile.email) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white rounded-xl shadow-lg p-8 mx-auto mt-8 border border-gray-100">
      <div className="flex justify-between items-center mb-8 border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-800">Mój Profil</h1>
        <button
          onClick={toggleEdit}
          className="flex items-center gap-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg transition-all shadow-md hover:shadow-lg"
        >
          {isEditing ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Anuluj
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edytuj Profil
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Profile Picture Section */}
        <div className="md:col-span-1 flex flex-col items-center">
          <div className="relative group">
            <div
              className={`w-48 h-48 rounded-full overflow-hidden border-4 ${
                isEditing ? "border-teal-400" : "border-gray-200"
              } shadow-lg transition-all duration-300`}
            >
              <img
                src={
                  imagePreview ||
                  profile.profilePicture ||
                  "/assets/images/default-avatar.png"
                }
                alt="Profile"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>

            {isEditing && (
              <div className="absolute inset-0 flex items-center justify-center">
                <label
                  htmlFor="profile-upload"
                  className="w-full h-full flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-90 bg-black bg-opacity-50 rounded-full transition-opacity duration-300"
                >
                  <div className="text-white text-center p-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-10 w-10 mx-auto mb-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
                      <path d="M9 13h2v5a1 1 0 11-2 0v-5z" />
                    </svg>
                    <span className="text-sm font-medium">Zmień Zdjęcie</span>
                  </div>
                  <input
                    id="profile-upload"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            )}
          </div>

          <div className="mt-6 text-center">
            <h2 className="text-2xl font-bold text-gray-800">
              {profile.name?.first} {profile.name?.last}
            </h2>
            <div className="flex items-center justify-center mt-2">
              <span className="bg-teal-100 text-teal-800 text-sm font-medium px-3 py-1 rounded-full capitalize">
                {translateRoleToPolish(profile.role )|| "User"}
              </span>
            </div>
            <p className="text-gray-500 mt-2 text-sm">
              Członek od{" "}
              {profile.createdAt
                ? new Date(profile.createdAt).toLocaleDateString("pl-PL", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "-"}
            </p>
          </div>
        </div>

        {/* Profile Details Section */}
        <div className="md:col-span-2">
          {isEditing ? (
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Edytuj Swoje Informacje
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="first"
                  >
                    Imię
                  </label>
                  <input
                    type="text"
                    id="first"
                    name="first"
                    value={formData.first}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="last"
                  >
                    Nazwisko
                  </label>
                  <input
                    type="text"
                    id="last"
                    name="last"
                    value={formData.last}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="email"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-500 bg-gray-50 cursor-not-allowed"
                    disabled
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Email nie może zostać zmieniony
                  </p>
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="phone"
                  >
                    Telefon
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    placeholder="Wprowadź numer telefonu"
                  />
                </div>
                <div>
                  <label
                    className="block text-gray-700 text-sm font-medium mb-2"
                    htmlFor="sex"
                  >
                    Płeć
                  </label>
                  <select
                    id="sex"
                    name="sex"
                    value={formData.sex}
                    onChange={handleInputChange}
                    className="shadow-sm border border-gray-300 rounded-lg w-full py-2.5 px-4 text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  >
                    <option value="">Wybierz</option>
                    <option value="Male">Mężczyzna</option>
                    <option value="Female">Kobieta</option>
                    <option value="Others">Inne</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end mt-8 gap-3">
                <button
                  type="button"
                  onClick={toggleEdit}
                  className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-5 rounded-lg transition-all"
                >
                  Anuluj
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !hasChanges}
                  className={`text-white font-medium py-2.5 px-5 rounded-lg flex items-center transition-all ${
                    hasChanges
                      ? "bg-teal-500 hover:bg-teal-600"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {isSaving && (
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                  )}
                  {isSaving ? "Zapisywanie..." : "Zapisz Zmiany"}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b border-gray-100">
                Informacje Osobiste
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Imię
                  </h4>
                  <p className="mt-1 text-gray-900 font-medium">
                    {profile.name?.first || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Nazwisko
                  </h4>
                  <p className="mt-1 text-gray-900 font-medium">
                    {profile.name?.last || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Email</h4>
                  <p className="mt-1 text-gray-900 font-medium break-words">
                    {profile.email || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Numer Telefonu
                  </h4>
                  <p className="mt-1 text-gray-900 font-medium">
                    {profile.phone || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Płeć</h4>
                  <p className="mt-1 text-gray-900 font-medium">
                    {profile.sex || "-"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Rola</h4>
                  <p className="mt-1 text-gray-900 font-medium capitalize">
                    {/* {transferRole(profile.role) || "-"} */}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">
                    Metoda Rejestracji
                  </h4>
                  <p className="mt-1 text-gray-900 font-medium capitalize">
                    {profile.signupMethod || "-"}
                  </p>
                </div>
              </div>

              {/* Security section */}
              <div className="mt-8 pt-6 border-t border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Bezpieczeństwo Konta
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all">
                    <div className="flex items-center">
                      <div className="bg-teal-100 p-2 rounded-full mr-3">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-teal-600"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 8a6 6 0 01-7.743 5.743L10 14l-1 1-1 1H6v2H2v-4l4.257-4.257A6 6 0 1118 8zm-6-4a1 1 0 100 2 2 2 0 012 2 1 1 0 102 0 4 4 0 00-4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-800">Hasło</h4>
                        <button
                            onClick={() =>
                            {
                              localStorage.clear();
                            (window.location.href = "/forgot-password")}
                          }
                          className="text-teal-500 hover:text-teal-700 text-sm font-medium focus:outline-none mt-1"
                        >
                          Zmień Hasło
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add the ImageCropModal */}
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          if (tempImageUrl) {
            URL.revokeObjectURL(tempImageUrl);
            setTempImageUrl("");
          }
        }}
        imageUrl={tempImageUrl}
        onCropComplete={handleCroppedImage}
      />
    </div>
  );
};

export default ProfilePage;
