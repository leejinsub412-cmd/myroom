
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from '../firebase.ts';
import { Post } from '../types.ts';
import { User } from 'firebase/auth';

interface BoardProps {
  user: User;
}

const Board: React.FC<BoardProps> = ({ user }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postsData);
      setIsInitialLoading(false);
    }, (error) => {
      console.error("Firestore subscription error:", error);
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const execCommand = (command: string, value: string | undefined = undefined) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB Limit
        alert("Image is too large. Please select a file under 5MB.");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = editorRef.current?.innerHTML || '';
    
    if (!title.trim() || (!content.trim() && !imageFile) || content === '<br>') {
      alert("Please provide a title and either a message or a photo.");
      return;
    }

    setIsSubmitting(true);
    let uploadedImageUrl = '';

    try {
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const imageRef = ref(storage, `posts/${user.uid}/${fileName}`);
        const uploadResult = await uploadBytes(imageRef, imageFile);
        uploadedImageUrl = await getDownloadURL(uploadResult.ref);
      }

      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        content: content,
        imageUrl: uploadedImageUrl,
        authorId: user.uid,
        authorName: user.displayName || user.email?.split('@')[0] || 'Anonymous',
        createdAt: serverTimestamp(),
      });

      setTitle('');
      if (editorRef.current) editorRef.current.innerHTML = '';
      removeImage();
    } catch (error) {
      console.error("Post creation error:", error);
      alert("Failed to save post. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (window.confirm("Confirm deletion of this post?")) {
      try {
        await deleteDoc(doc(db, 'posts', postId));
      } catch (error) {
        console.error("Deletion error:", error);
      }
    }
  };

  if (isInitialLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
        <p className="text-slate-500 text-sm font-medium">Loading conversation...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="bg-slate-900/50 backdrop-blur-2xl border border-slate-800 p-6 md:p-8 rounded-[2rem] shadow-2xl">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
            <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3m0 18a10.003 10.003 0 01-8.128-4.15m16.257 0A10.003 10.003 0 0012 3m0 18v-4m0-10V7" />
            </svg>
          </div>
          <h3 className="text-2xl font-black text-white">Create New Update</h3>
        </div>
        
        <form onSubmit={handlePostSubmit} className="space-y-6">
          <input
            type="text"
            placeholder="Headline"
            className="w-full bg-slate-950 border border-slate-800 text-white px-6 py-4 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none transition-all placeholder:text-slate-600 font-bold text-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <div className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950">
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-900/50 border-b border-slate-800">
              <button type="button" onClick={() => execCommand('bold')} className="w-10 h-10 hover:bg-slate-800 rounded-xl text-slate-300 font-black transition-colors">B</button>
              <button type="button" onClick={() => execCommand('italic')} className="w-10 h-10 hover:bg-slate-800 rounded-xl text-slate-300 italic transition-colors font-serif">I</button>
              <div className="w-px h-6 bg-slate-800 mx-1"></div>
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className={`flex items-center gap-2 px-4 py-2 hover:bg-slate-800 rounded-xl text-sm font-bold transition-all ${imageFile ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400'}`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                {imageFile ? 'Image Ready' : 'Add Photo'}
              </button>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div 
              ref={editorRef}
              contentEditable
              className="w-full min-h-[180px] text-white px-6 py-5 focus:outline-none prose prose-invert max-w-none overflow-y-auto"
              style={{ whiteSpace: 'pre-wrap' }}
              placeholder="Start typing your story..."
            ></div>
          </div>

          {imagePreview && (
            <div className="relative inline-block">
              <img src={imagePreview} alt="Preview" className="max-h-60 rounded-2xl border border-slate-800 shadow-2xl object-cover" />
              <button type="button" onClick={removeImage} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white w-8 h-8 rounded-full shadow-xl flex items-center justify-center transition-transform active:scale-90">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-10 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-black rounded-2xl shadow-xl shadow-indigo-500/20 transition-all disabled:opacity-50 active:scale-[0.98] flex items-center gap-3"
            >
              {isSubmitting ? 'Syncing...' : 'Publish Update'}
              {!isSubmitting && <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>}
            </button>
          </div>
        </form>
      </div>

      <div className="space-y-8">
        <div className="flex items-center justify-between px-4">
          <h3 className="text-2xl font-black text-white">Community Feed</h3>
          <div className="h-px flex-1 bg-slate-800 mx-6 hidden md:block"></div>
          <span className="text-slate-500 font-bold text-sm tracking-widest">{posts.length} RECORDS</span>
        </div>

        {posts.length === 0 ? (
          <div className="text-center py-24 bg-slate-900/10 border border-dashed border-slate-800 rounded-[2rem]">
            <p className="text-slate-600 font-bold text-lg">The feed is empty. Be the voice of the community.</p>
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <article key={post.id} className="bg-slate-900/30 border border-slate-800/60 p-8 rounded-[2rem] group transition-all hover:bg-slate-900/50 hover:border-slate-700/50 relative">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors">{post.title}</h4>
                  {post.authorId === user.uid && (
                    <button onClick={() => post.id && handleDeletePost(post.id)} className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  )}
                </div>
                
                {post.imageUrl && (
                  <div className="mb-8 rounded-3xl overflow-hidden border border-slate-800 group-hover:border-slate-700 transition-colors">
                    <img src={post.imageUrl} alt="" className="w-full max-h-[600px] object-cover" loading="lazy" />
                  </div>
                )}

                <div className="text-slate-300 mb-8 prose prose-invert prose-lg max-w-none break-words" dangerouslySetInnerHTML={{ __html: post.content }} />

                <div className="flex items-center justify-between pt-6 border-t border-slate-800/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-sm text-indigo-400 font-black">
                      {post.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-200">{post.authorName}</span>
                      <span className="block text-[10px] text-slate-600 font-black uppercase tracking-widest">Verified Member</span>
                    </div>
                  </div>
                  <div className="text-[11px] text-slate-600 font-bold uppercase tracking-wider bg-slate-950 px-3 py-1 rounded-lg">
                    {post.createdAt?.toDate ? post.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Processing'}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Board;
