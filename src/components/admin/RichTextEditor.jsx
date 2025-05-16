import React, { useRef, useEffect, useState } from 'react';
import DOMPurify from "dompurify";
import { apiCaller } from "../../utils/axiosInstance";

const RichTextEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || '';
    }
  }, [value]);

  const handleChange = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const sanitizedHtml = DOMPurify.sanitize(html);
      onChange(sanitizedHtml);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    handleChange();
    editorRef.current?.focus();
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiCaller('POST', '/admin/upload-file', formData, true);
      
      if (response.data?.success && response.data?.file?.path) {
        const imgHtml = `<img src="${response.data.file.path}" alt="${response.data.file.originalName || ''}" style="max-width: 100%; height: auto;" />`;
        execCommand('insertHTML', imgHtml);
      } else {
        throw new Error('Invalid upload response');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => execCommand('bold')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Pogrubienie"
        >
          <strong>B</strong>
        </button>
        <button
          onClick={() => execCommand('italic')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Kursywa"
        >
          <em>I</em>
        </button>
        <button
          onClick={() => execCommand('underline')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Podkreślenie"
        >
          <u>U</u>
        </button>
        <select
          onChange={(e) => execCommand('formatBlock', e.target.value)}
          className="p-2 border border-gray-300 rounded bg-white"
        >
          <option value="p">Normalny</option>
          <option value="h2">Nagłówek 2</option>
          <option value="h3">Nagłówek 3</option>
          <option value="h4">Nagłówek 4</option>
        </select>
        <button
          onClick={() => execCommand('insertUnorderedList')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Lista punktowana"
        >
          • Lista
        </button>
        <button
          onClick={() => execCommand('insertOrderedList')}
          className="p-2 hover:bg-gray-200 rounded"
          title="Lista numerowana"
        >
          1. Lista
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 hover:bg-gray-200 rounded ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={isUploading}
          title="Dodaj obraz"
        >
          🖼 {isUploading ? 'Uploading...' : 'Obraz'}
        </button>
      </div>
      
      <div
        ref={editorRef}
        contentEditable
        className="px-4 py-2 min-h-[200px] focus:outline-none prose max-w-none"
        onInput={handleChange}
        onBlur={handleChange}
        placeholder="Wpisz treść artykułu..."
      />
      
      <div className="px-4 py-2 text-sm text-gray-500 border-t border-gray-300 bg-gray-50">
        {editorRef.current?.textContent.length || 0} znaków
      </div>

      <style jsx>{`
        [contenteditable]:empty:before {
          content: attr(placeholder);
          color: #9ca3af;
          cursor: text;
        }
        .prose img {
          max-width: 100%;
          height: auto;
          margin: 1em 0;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor; 