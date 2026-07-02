import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ArrowLeft, Plus, Trash2, Upload, ArrowUp, ArrowDown, Video, Image as ImageIcon } from 'lucide-react';
import type { Project } from '../constants';
import { translations, type Language } from '../i18n';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
  lang: Language;
  onUpdateProject: (updatedProject: Project) => void;
}

const createMediaUrl = (file: File) => {
  const url = URL.createObjectURL(file);
  const suffix = file.type.startsWith('video/') ? '#video' : '#image';
  return url + suffix;
};

const getMediaType = (url: string): 'video' | 'image' => {
  if (url.endsWith('#video')) return 'video';
  if (url.endsWith('#image')) return 'image';
  if (url.includes('.mp4') || url.includes('mixkit.co/videos') || url.startsWith('data:video/')) return 'video';
  return 'image';
};

const cleanUrl = (url: string) => {
  if (url.endsWith('#video')) return url.slice(0, -6);
  if (url.endsWith('#image')) return url.slice(0, -6);
  return url;
};

export default function ProjectModal({ project, onClose, lang, onUpdateProject }: ProjectModalProps) {
  const t = translations[lang].project;
  
  useEffect(() => {
    if (project) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [project]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, target: number | 'add' | 'video') => {
    const file = e.target.files?.[0];
    if (!file || !project) return;
    
    const newUrl = createMediaUrl(file);
    
    if (target === 'video') {
      onUpdateProject({
        ...project,
        video: newUrl
      });
    } else if (target === 'add') {
      onUpdateProject({
        ...project,
        detailImages: [...project.detailImages, newUrl]
      });
    } else {
      const updatedImages = [...project.detailImages];
      updatedImages[target] = newUrl;
      onUpdateProject({
        ...project,
        detailImages: updatedImages
      });
    }
  };

  const handleDelete = (index: number) => {
    if (!project) return;
    const updatedImages = project.detailImages.filter((_, i) => i !== index);
    onUpdateProject({
      ...project,
      detailImages: updatedImages
    });
  };

  const handleDeleteVideo = () => {
    if (!project) return;
    onUpdateProject({
      ...project,
      video: undefined
    });
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (!project) return;
    const updatedImages = [...project.detailImages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= updatedImages.length) return;
    
    // Swap
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[targetIndex];
    updatedImages[targetIndex] = temp;
    
    onUpdateProject({
      ...project,
      detailImages: updatedImages
    });
  };

  const triggerFileInput = (id: number | 'add' | 'video') => {
    const input = document.getElementById(`file-input-${id}`);
    if (input) {
      (input as HTMLInputElement).click();
    }
  };

  return (
    <AnimatePresence>
      {project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col overflow-y-auto scrollbar-hide pt-20"
        >
          {/* Floating Back Button */}
          <div className="fixed top-24 left-4 md:left-8 z-[120] pointer-events-none">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={onClose}
              className="pointer-events-auto flex items-center space-x-4 text-white/40 hover:text-white transition-all group bg-black/50 backdrop-blur-md p-2 pr-6 rounded-full border border-white/10 hover:border-white/40"
            >
              <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
                <ArrowLeft size={18} />
              </div>
              <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{t.back}</span>
            </motion.button>
          </div>

          {/* Content */}
          <div className="max-w-[1600px] mx-auto px-4 py-20 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-20 mb-32">
              <div className="lg:col-span-2">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl md:text-8xl font-black tracking-tighter uppercase mb-8"
                >
                  {lang === 'en' ? project.titleEn : project.titleZh}
                </motion.h1>
                <p className="text-xl text-white/60 leading-relaxed max-w-2xl">
                  {lang === 'en' ? project.descEn : project.descZh}
                </p>
              </div>
              <div className="space-y-8">
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white/40 mb-2">{t.category}</h4>
                  <p className="text-sm font-bold uppercase tracking-wider">{project.category}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white/40 mb-2">{t.year}</h4>
                  <p className="text-sm font-bold uppercase tracking-wider">{project.year}</p>
                </div>
                <div>
                  <h4 className="text-xs uppercase tracking-widest text-white/40 mb-2">{t.role}</h4>
                  <p className="text-sm font-bold uppercase tracking-wider">{t.roleValue}</p>
                </div>
              </div>
            </div>

            {/* Media Gallery Grid */}
            <div className="flex flex-col space-y-12 md:space-y-24">
              {/* Highlight/Featured Video */}
              {project.video && (
                <motion.div
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="relative group w-full bg-brand-gray/20 overflow-hidden rounded-2xl"
                >
                  <video 
                    src={cleanUrl(project.video)} 
                    controls 
                    autoPlay 
                    muted 
                    loop 
                    className="w-full h-auto block"
                  />
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between p-6 z-10">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                        <Video size={12} className="text-purple-400" />
                        Featured Video
                      </span>
                      <button
                        onClick={handleDeleteVideo}
                        className="w-8 h-8 rounded-full bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center border border-red-500/30 transition-all"
                        title="Remove Video"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="flex flex-col items-center justify-center my-auto cursor-pointer" onClick={() => triggerFileInput('video')}>
                      <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-3 hover:scale-110 transition-transform">
                        <Upload size={20} />
                      </div>
                      <p className="text-xs uppercase tracking-widest font-bold text-white/80">
                        {lang === 'en' ? 'Replace Featured Video' : '替换置顶视频'}
                      </p>
                      <p className="text-[10px] text-white/40 mt-1">
                        {lang === 'en' ? 'Click to select local video' : '点击选择本地视频文件'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-white/30">FEATURED VIDEO</span>
                    </div>
                  </div>
                  <input 
                    type="file" 
                    id="file-input-video"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'video')}
                  />
                </motion.div>
              )}

              {/* Add Top Video slot if missing */}
              {!project.video && (
                <motion.div
                  whileHover={{ scale: 0.99, borderColor: 'rgba(168, 85, 247, 0.4)' }}
                  onClick={() => triggerFileInput('video')}
                  className="w-full py-8 border border-dashed border-purple-500/20 hover:border-purple-500/40 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-purple-500/[0.01] hover:bg-purple-500/[0.03] transition-all"
                >
                  <Video size={18} className="text-purple-400/60 mb-2" />
                  <p className="text-xs uppercase tracking-widest font-bold text-purple-300/80">
                    {lang === 'en' ? '+ Add Featured Pinned Video' : '+ 添加置顶宣传视频'}
                  </p>
                  <input 
                    type="file" 
                    id="file-input-video"
                    accept="video/*"
                    className="hidden"
                    onChange={(e) => handleFileChange(e, 'video')}
                  />
                </motion.div>
              )}

              {/* Gallery Items */}
              {project.detailImages.map((img, idx) => {
                const isVideo = getMediaType(img) === 'video';
                const displayUrl = cleanUrl(img);
                
                return (
                  <motion.div
                    key={idx}
                    layout
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative group w-full bg-brand-gray/10 border border-white/5 overflow-hidden rounded-2xl flex items-center justify-center min-h-[300px]"
                  >
                    {isVideo ? (
                      <video 
                        src={displayUrl} 
                        controls 
                        autoPlay 
                        muted 
                        loop 
                        className="w-full h-auto max-h-[85vh] object-contain block"
                      />
                    ) : (
                      <img 
                        src={displayUrl} 
                        alt={`${lang === 'en' ? project.titleEn : project.titleZh} detail ${idx + 1}`}
                        referrerPolicy="no-referrer"
                        className="w-full h-auto max-h-[85vh] object-contain block"
                      />
                    )}
                    
                    {/* Hover Overlay Actions */}
                    <div className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 backdrop-blur-sm transition-all duration-300 flex flex-col justify-between p-6 z-10">
                      <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] uppercase tracking-widest font-mono text-white/40 bg-white/5 px-3 py-1.5 rounded-full border border-white/10 flex items-center gap-2">
                          {isVideo ? <Video size={12} className="text-purple-400" /> : <ImageIcon size={12} className="text-emerald-400" />}
                          {isVideo ? 'Video' : 'Image'}
                        </span>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            disabled={idx === 0}
                            onClick={(e) => { e.stopPropagation(); handleMove(idx, 'up'); }}
                            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black flex items-center justify-center text-white transition-all disabled:opacity-20 disabled:pointer-events-none"
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            disabled={idx === project.detailImages.length - 1}
                            onClick={(e) => { e.stopPropagation(); handleMove(idx, 'down'); }}
                            className="w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:bg-white hover:text-black flex items-center justify-center text-white transition-all disabled:opacity-20 disabled:pointer-events-none"
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(idx); }}
                            className="w-8 h-8 rounded-full bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white flex items-center justify-center border border-red-500/20 transition-all ml-2"
                            title="Delete Item"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center justify-center my-auto cursor-pointer" onClick={() => triggerFileInput(idx)}>
                        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-3 hover:scale-110 transition-transform">
                          <Upload size={20} />
                        </div>
                        <p className="text-xs uppercase tracking-widest font-bold text-white/80">
                          {lang === 'en' ? 'Replace Media Item' : '上传并替换此项'}
                        </p>
                        <p className="text-[10px] text-white/40 mt-1">
                          {lang === 'en' ? 'Click to select local image or video' : '支持本地图片与视频文件'}
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span className="text-xs font-mono text-white/30">SLOT {idx + 1}</span>
                      </div>
                    </div>
                    
                    <input 
                      type="file" 
                      id={`file-input-${idx}`}
                      accept="image/*,video/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, idx)}
                    />
                  </motion.div>
                );
              })}

              {/* Add New Slot Box */}
              <motion.div
                layout
                whileHover={{ scale: 0.99, borderColor: 'rgba(255, 255, 255, 0.4)' }}
                onClick={() => triggerFileInput('add')}
                className="w-full py-16 md:py-24 border-2 border-dashed border-white/10 hover:border-white/30 rounded-2xl flex flex-col items-center justify-center cursor-pointer bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white mb-4">
                  <Plus size={20} />
                </div>
                <p className="text-sm uppercase tracking-widest font-bold text-white/80">
                  {lang === 'en' ? 'Add Custom Image or Video' : '添加本地展示图片/视频'}
                </p>
                <p className="text-xs text-white/40 mt-1.5">
                  {lang === 'en' ? 'Enhance your portfolio with local media files' : '自由丰富作品集展示，支持多种音视频及图片格式'}
                </p>
                
                <input 
                  type="file" 
                  id="file-input-add"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, 'add')}
                />
              </motion.div>
            </div>

            {/* Footer Contact */}
            <div className="mt-40 py-40 border-t border-white/10 text-center">
              <h3 className="text-xs uppercase tracking-[0.4em] text-white/40 font-medium mb-12">{t.next}</h3>
              <button 
                onClick={onClose}
                className="text-4xl md:text-7xl font-black tracking-tighter uppercase hover:text-white/60 transition-colors"
              >
                {t.explore}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

