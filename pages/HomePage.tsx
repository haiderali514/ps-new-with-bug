
import React, { useState, useRef, useCallback, cloneElement } from 'react';
import { useStore } from '../store';
import { NewProjectModal } from '../components/NewProjectModal';
import { PsIcon, HomeIcon, FilesIcon, UploadIcon, SparklesIcon, CropIcon, DropletIcon, ImagePlusIcon, WandIcon } from '../components/Icons';

const HomePage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const goToEditor = useStore((state) => state.goToEditor);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const openFile = useCallback((file: File) => {
    const img = new Image();
    img.onload = () => {
      goToEditor({ width: img.width, height: img.height, backgroundColor: 'transparent' }, file);
    };
    img.src = URL.createObjectURL(file);
  }, [goToEditor]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      openFile(file);
    }
  };
  
  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
       openFile(file);
    }
  }, [openFile]);

  return (
    <div className="flex h-screen bg-[#2f2f2f]">
      <aside className="w-16 bg-[#1E1E1E] p-2 flex flex-col items-center gap-4">
        <div className="p-1.5 bg-blue-600 rounded-lg"><PsIcon className="w-7 h-7" /></div>
        <button className="p-2 bg-blue-500 rounded-full text-white" onClick={() => setIsModalOpen(true)}>+</button>
        <nav className="flex flex-col gap-4 mt-4">
          <a href="#" className="p-2 rounded-lg bg-gray-700"><HomeIcon className="w-6 h-6" /></a>
          <a href="#" className="p-2 rounded-lg text-gray-400 hover:bg-gray-700"><FilesIcon className="w-6 h-6" /></a>
        </nav>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-2xl">Welcome to Photoshop, <span className="font-bold text-blue-400">User</span></h1>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-[#3a3a3a] rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer border-2 border-dashed border-gray-500 hover:border-blue-500 transition-colors"
            onClick={handleUploadClick}
            onDragOver={onDragOver}
            onDrop={onDrop}>
            <UploadIcon className="w-12 h-12 text-gray-400 mb-4" />
            <button className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm mb-2">Upload file</button>
            <p className="text-xs text-gray-400">Drag and drop or select one to import</p>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept="image/*" />
          </div>
          <Card imgSrc="https://picsum.photos/400/300?random=1" title="Add depth, style, and drama quickly and easily with effects (Beta)" />
          <Card imgSrc="https://picsum.photos/400/300?random=2" title="Live co-editing (Beta)" />
          <Card imgSrc="https://picsum.photos/400/300?random=3" title="Blend objects into a scene with Harmonize" />
        </section>

        <section>
          <h2 className="text-xl mb-4">Make a quick edit</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <QuickEditButton icon={<WandIcon />} text="Remove background" />
            <QuickEditButton icon={<CropIcon />} text="Crop an image" />
            <QuickEditButton icon={<DropletIcon />} text="Color pop" />
            <QuickEditButton icon={<SparklesIcon />} text="Generate an image" />
            <QuickEditButton icon={<ImagePlusIcon />} text="Add from Adobe Stock" />
          </div>
        </section>
      </main>

      {isModalOpen && <NewProjectModal onClose={() => setIsModalOpen(false)} onCreate={goToEditor} />}
    </div>
  );
};


const Card: React.FC<{ imgSrc: string, title: string }> = ({ imgSrc, title }) => (
  <div className="bg-[#3a3a3a] rounded-lg overflow-hidden group">
    <img src={imgSrc} alt={title} className="w-full h-3/4 object-cover" />
    <div className="p-4">
      <h3 className="font-semibold text-sm group-hover:text-blue-400 transition-colors">{title}</h3>
    </div>
  </div>
);

// Fix: Changed icon prop type to allow className to be passed via React.cloneElement.
const QuickEditButton: React.FC<{ icon: React.ReactElement<{ className?: string }>; text: string }> = ({ icon, text }) => (
  <button className="bg-[#3a3a3a] p-4 rounded-lg flex items-center gap-3 hover:bg-gray-600 transition-colors">
    {cloneElement(icon, { className: "w-5 h-5" })}
    <span className="text-sm">{text}</span>
  </button>
);


export default HomePage;
