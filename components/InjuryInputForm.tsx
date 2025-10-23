import React, { useState, useRef } from 'react';

interface InjuryInputFormProps {
    onSubmit: (description: string, images: { data: string; mimeType: string }[] | null) => void;
    isLoading: boolean;
    initialDescription?: string;
}

const MAX_DIMENSION = 1024; // Max width or height for the image
const JPEG_QUALITY = 0.8; // 80% quality

const resizeAndEncodeImage = (file: File): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onerror = reject;
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("FileReader did not return a result."));
            }
            const img = new Image();
            img.onerror = reject;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > height) {
                    if (width > MAX_DIMENSION) {
                        height = Math.round(height * (MAX_DIMENSION / width));
                        width = MAX_DIMENSION;
                    }
                } else {
                    if (height > MAX_DIMENSION) {
                        width = Math.round(width * (MAX_DIMENSION / height));
                        height = MAX_DIMENSION;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);

                const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);
                const base64Data = dataUrl.split(',')[1];
                resolve({ data: base64Data, mimeType: 'image/jpeg' });
            };
            img.src = event.target.result as string;
        };
    });
};


const InjuryInputForm: React.FC<InjuryInputFormProps> = ({ onSubmit, isLoading, initialDescription }) => {
    const [description, setDescription] = useState<string>(initialDescription || '');
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const fileInputRef = useRef<HTMLInputElement>(null);


    const handleFileChange = (files: FileList | null) => {
        if (files) {
            const validImageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
            
            if (validImageFiles.length !== files.length) {
                alert("Some selected files were not valid images and were ignored.");
            }

            const newImages = validImageFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file)
            }));

            setImages(prevImages => {
                const allImages = [...prevImages, ...newImages];
                // Deduplicate based on name and size to prevent adding the same file twice
                const uniqueImages = allImages.filter((v, i, a) => a.findIndex(t => (t.file.name === v.file.name && t.file.size === v.file.size)) === i);
                return uniqueImages;
            });
        }
    }

    const handleRemoveImage = (indexToRemove: number) => {
        setImages(prevImages => {
            const imageToRemove = prevImages[indexToRemove];
            if (imageToRemove) {
                URL.revokeObjectURL(imageToRemove.preview);
            }
            const newImages = prevImages.filter((_, index) => index !== indexToRemove);
            if (newImages.length === 0 && fileInputRef.current) {
                // Clear the input value only if all images are removed.
                fileInputRef.current.value = "";
            }
            return newImages;
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (description.trim()) {
            if (images.length > 0) {
                const imageDataPromises = images.map(image => resizeAndEncodeImage(image.file));
                const imagesData = await Promise.all(imageDataPromises);
                onSubmit(description, imagesData);
            } else {
                onSubmit(description, null);
            }
        }
    };

    const dragEvents = {
        onDragEnter: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(true);
        },
        onDragLeave: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
        },
        onDragOver: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
        },
        onDrop: (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setIsDragging(false);
            handleFileChange(e.dataTransfer.files);
        },
    };

    const isButtonDisabled = isLoading || !description.trim();

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl space-y-6">
            <div>
                <label htmlFor="injury-description" className="block text-lg font-medium text-gray-300 text-center mb-4">
                    Describe your injury to get started
                </label>
                <textarea
                    id="injury-description"
                    rows={5}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-gray-200 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent transition duration-200 resize-none placeholder-gray-500 shadow-lg"
                    placeholder="e.g., 'I twisted my right ankle playing basketball. It's swollen and hurts on the outside edge.'"
                    disabled={isLoading}
                    aria-label="Injury Description Input"
                />
            </div>

            <div>
                 <input
                    type="file"
                    id="image-upload"
                    ref={fileInputRef}
                    className="sr-only"
                    accept="image/*"
                    multiple
                    onChange={(e) => handleFileChange(e.target.files)}
                    disabled={isLoading}
                />
                <label
                    htmlFor="image-upload"
                    {...dragEvents}
                    className={`mt-1 flex justify-center items-center w-full h-32 px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${isDragging ? 'border-brand-accent bg-brand-accent/10' : 'border-white/20 hover:border-brand-accent/50'}`}
                >
                    <div className="space-y-1 text-center">
                         <svg className="mx-auto h-10 w-10 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-400">
                            <p className="pl-1">Upload photos (optional) or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                </label>
            </div>
            
             {images.length > 0 && (
                <div className="flex flex-wrap gap-4">
                    {images.map((image, index) => (
                         <div key={`${image.file.name}-${image.file.lastModified}`} className="relative w-32 h-32 rounded-lg overflow-hidden border-2 border-white/20 shadow-lg">
                            <img src={image.preview} alt={`Injury preview ${index + 1}`} className="w-full h-full object-cover" />
                            <button
                                type="button"
                                onClick={() => handleRemoveImage(index)}
                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-black/80 transition-colors"
                                aria-label={`Remove image ${index + 1}`}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <button
                type="submit"
                disabled={isButtonDisabled}
                className={`group relative w-full flex justify-center items-center py-3 px-6 border border-transparent rounded-lg shadow-lg text-lg font-medium text-white bg-gradient-to-r from-brand-accent to-purple-500 hover:from-brand-accent-dark hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-dark focus:ring-brand-accent-dark disabled:bg-gray-600 disabled:bg-none disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:transform-none`}
            >
                {isLoading ? 'Analyzing...' : 'Analyze Injury'}
            </button>
        </form>
    );
};

export default InjuryInputForm;