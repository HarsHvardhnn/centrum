import { X } from "lucide-react"; // Import the X icon from lucide-react
import { useFormContext } from "../../context/SubStepFormContext";

const PhotoUpload = () => {
  const { formData, updateFormData } = useFormContext();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      updateFormData("photo", file);
      // Create a preview URL for the image
      updateFormData("photoPreview", URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      updateFormData("photo", file);
      // Create a preview URL for the image
      updateFormData("photoPreview", URL.createObjectURL(file));
    }
  };

  const removeImage = () => {
    // Clear the photo and its preview
    updateFormData("photo", null);
    updateFormData("photoPreview", null);
    // Reset the file input
    document.getElementById("photo-upload").value = "";
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-gray-800">Photo Upload</h2>
      <p className="text-gray-600">Upload photo for your profile</p>

      {formData.photoPreview ? (
        <div className="relative w-full max-w-md mx-auto">
          <div className="w-full max-w-md mx-auto aspect-[4/3] overflow-hidden flex items-center justify-center">
            <img
              src={formData.photoPreview}
              alt="Preview"
              className="max-w-full max-h-full object-contain rounded-lg border border-gray-300"
            />
          </div>

          <button
            onClick={removeImage}
            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            aria-label="Remove image"
          >
            <X size={20} className="text-gray-700" />
          </button>
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center flex flex-col items-center justify-center cursor-pointer"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => document.getElementById("photo-upload").click()}
        >
          <div className="bg-gray-100 rounded-full p-4 mb-4">
            <svg
              className="w-6 h-6 text-gray-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>
          </div>

          <p className="mb-1">
            <span className="text-purple-600 font-medium">Click to upload</span>{" "}
            or drag and drop
          </p>
          <p className="text-gray-500 text-sm">
            SVG, PNG, JPG or GIF (max. 800×400px)
          </p>
        </div>
      )}

      <input
        type="file"
        className="hidden"
        id="photo-upload"
        accept="image/*"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default PhotoUpload;
