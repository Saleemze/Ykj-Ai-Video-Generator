
import React from 'react';

interface PromptInputProps {
  prompt: string;
  onPromptChange: (prompt: string) => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onClearImage: () => void;
  onSubmit: () => void;
  isLoading: boolean;
  showImageUpload: boolean;
  imagePreview: string | null;
}

const PromptInput: React.FC<PromptInputProps> = ({
  prompt,
  onPromptChange,
  onFileChange,
  onClearImage,
  onSubmit,
  isLoading,
  showImageUpload,
  imagePreview,
}) => {
  return (
    <div>
      <div className="relative">
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          placeholder={showImageUpload ? "e.g., A cat wearing a spacesuit, floating in space" : "e.g., An epic fantasy landscape with a dragon"}
          rows={3}
          className="w-full bg-slate-700 border-2 border-slate-600 rounded-xl p-4 pr-12 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors duration-200 resize-none"
          disabled={isLoading}
        />
      </div>
      
      <div className="mt-4 flex flex-col sm:flex-row items-center gap-4">
        {showImageUpload && (
          <div className="flex-shrink-0 relative">
            <label htmlFor="image-upload" className="cursor-pointer group flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-slate-400 group-hover:text-slate-200" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span className="text-sm font-medium text-slate-300 group-hover:text-white">
                {imagePreview ? 'Change Image' : 'Add Image (Optional)'}
              </span>
            </label>
            <input id="image-upload" type="file" accept="image/*" className="hidden" onChange={onFileChange} disabled={isLoading} />
            
            {imagePreview && (
              <div className="absolute -top-2 -right-2">
                <button onClick={onClearImage} className="h-6 w-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        )}

        {imagePreview && showImageUpload && (
          <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden border-2 border-slate-600">
            <img src={imagePreview} alt="Image preview" className="w-full h-full object-cover" />
          </div>
        )}

        <button
          onClick={onSubmit}
          disabled={isLoading || !prompt.trim()}
          className="w-full sm:w-auto sm:ml-auto px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
        >
          {isLoading ? 'Generating...' : 'Generate'}
        </button>
      </div>
    </div>
  );
};

export default PromptInput;
