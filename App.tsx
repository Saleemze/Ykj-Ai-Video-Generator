
import React, { useState, useCallback } from 'react';
import { Tab } from './types';
import { generateVideo, generateImage } from './services/geminiService';
import Header from './components/Header';
import TabSelector from './components/TabSelector';
import PromptInput from './components/PromptInput';
import LoadingIndicator from './components/LoadingIndicator';
import VideoResult from './components/VideoResult';
import ImageResult from './components/ImageResult';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>(Tab.Video);
    const [prompt, setPrompt] = useState<string>('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const handleTabChange = (tab: Tab) => {
        setActiveTab(tab);
        setError(null);
        setVideoUrl(null);
        setImageUrl(null);
        // Don't clear prompt, but clear image if switching away from video
        if (tab !== Tab.Video) {
            clearImage();
        }
    };
    
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            clearImage();
        }
    };
    
    const clearImage = () => {
        setImageFile(null);
        setImagePreview(null);
        const fileInput = document.getElementById('image-upload') as HTMLInputElement;
        if(fileInput) fileInput.value = '';
    }

    const handleGenerate = useCallback(async () => {
        if (!prompt.trim() || loading) return;
        
        setLoading(true);
        setError(null);
        setVideoUrl(null);
        setImageUrl(null);

        try {
            if (activeTab === Tab.Video) {
                const url = await generateVideo(prompt, imageFile || undefined);
                setVideoUrl(url);
            } else {
                const url = await generateImage(prompt);
                setImageUrl(url);
            }
        } catch (e: any) {
            console.error(e);
            setError(`An error occurred: ${e.message}`);
        } finally {
            setLoading(false);
        }
    }, [prompt, loading, activeTab, imageFile]);

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
            <div className="w-full max-w-4xl mx-auto">
                <Header />
                <TabSelector activeTab={activeTab} onTabChange={handleTabChange} />
                <main className="mt-6 bg-slate-800/50 rounded-2xl p-6 shadow-2xl border border-slate-700 backdrop-blur-sm">
                    <PromptInput
                        prompt={prompt}
                        onPromptChange={setPrompt}
                        onFileChange={handleFileChange}
                        onClearImage={clearImage}
                        onSubmit={handleGenerate}
                        isLoading={loading}
                        showImageUpload={activeTab === Tab.Video}
                        imagePreview={imagePreview}
                    />

                    <div className="mt-6 min-h-[400px] flex items-center justify-center bg-slate-900/50 rounded-xl border border-slate-700 overflow-hidden">
                        {loading ? (
                            <LoadingIndicator activeTab={activeTab} />
                        ) : error ? (
                            <div className="text-center text-red-400 p-4">
                                <p className="font-semibold">Generation Failed</p>
                                <p className="text-sm mt-1">{error}</p>
                            </div>
                        ) : videoUrl ? (
                            <VideoResult src={videoUrl} />
                        ) : imageUrl ? (
                            <ImageResult src={imageUrl} />
                        ) : (
                            <div className="text-center text-slate-500 p-4">
                                <p className="text-lg font-medium">Your creation will appear here</p>
                                <p className="mt-1">Describe what you want to generate above.</p>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default App;
