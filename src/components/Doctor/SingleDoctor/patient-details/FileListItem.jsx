import React from "react";
import { Trash2, File } from "lucide-react";

const FileListItem = ({ file, onRemove }) => {
  // Check if file is an image
  // const isImage = file.type && file.type.startsWith("image/");

  console.log("FileListItem file:", file);
  // Format file size
  return (
    <div className="flex items-center p-3 border rounded-lg mb-2 bg-white shadow-sm">
      <div className="flex-shrink-0 mr-3">
        {file.url ? (
          <div className="w-12 h-12 rounded overflow-hidden bg-gray-100">
            <img
              src={file.url}
              alt={file.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-12 h-12 rounded bg-gray-100 flex items-center justify-center text-gray-500">
            <File size={24} />
          </div>
        )}
      </div>

      {/* <div className="flex-grow min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {file.name}
        </p>
        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
      </div> */}

      {file.progress !== undefined && (
        <div className="w-24 mr-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-blue-500 rounded-full"
              style={{ width: `${file.progress}%` }}
            ></div>
          </div>
          <p className="text-xs text-gray-500 text-right mt-1">
            {file.progress}%
          </p>
        </div>
      )}

      <button
        onClick={() => onRemove(file)}
        className="ml-2 p-1 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-100"
      >
        <Trash2 size={18} />
      </button>
    </div>
  );
};

export default FileListItem;
